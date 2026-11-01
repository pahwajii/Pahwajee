"""Product image uploads use isolated collections, never real catalogue data."""
import hashlib
import unittest
from io import BytesIO
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from PIL import Image

import server
from product_images import MAX_UPLOAD_BYTES, create_product_image_router


def photo_bytes(format="PNG", size=(100, 80), metadata=False):
    image = Image.new("RGB", size, "#AD5C31")
    output = BytesIO()
    options = {}
    if metadata:
        exif = image.getexif()
        exif[274] = 6
        exif[270] = "Private camera metadata"
        options["exif"] = exif
    image.save(output, format=format, **options)
    return output.getvalue()


class ProductImageTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.user = {"id": "admin-test", "email": "admin@example.com", "role": "admin"}
        self.db = SimpleNamespace(
            users=SimpleNamespace(find_one=AsyncMock(return_value=self.user)),
            product_images=SimpleNamespace(update_one=AsyncMock(), find_one=AsyncMock(return_value=None)),
        )
        self.patcher = patch.object(server, "db", self.db)
        self.patcher.start()
        app = FastAPI()
        app.include_router(create_product_image_router(self.db, server.require_admin))
        self.http = AsyncClient(transport=ASGITransport(app=app), base_url="http://test")
        self.auth = {"Authorization": f"Bearer {server.create_access_token(self.user['id'], self.user['email'])}"}

    async def asyncTearDown(self):
        await self.http.aclose()
        self.patcher.stop()

    async def upload(self, data, content_type="image/png", auth=True):
        return await self.http.post("/api/admin/product-images", content=data,
                                    headers={**(self.auth if auth else {}), "Content-Type": content_type})

    async def test_upload_requires_admin_and_does_not_store_unauthorized_bytes(self):
        self.assertEqual((await self.upload(photo_bytes(), auth=False)).status_code, 401)
        self.db.users.find_one.return_value = {**self.user, "role": "customer"}
        self.assertEqual((await self.upload(photo_bytes())).status_code, 403)
        self.db.product_images.update_one.assert_not_awaited()

    async def test_photo_is_oriented_resized_metadata_free_and_content_addressed(self):
        response = await self.upload(photo_bytes("JPEG", (2400, 1800), metadata=True), "image/jpeg")
        self.assertEqual(response.status_code, 201, response.text)
        body = response.json()
        self.assertEqual((body['width'], body['height']), (1200, 1600))
        query, update = self.db.product_images.update_one.call_args.args
        record = update['$setOnInsert']
        digest = hashlib.sha256(record['data']).hexdigest()
        self.assertEqual(query, {"_id": digest})
        self.assertEqual(body['url'], f"/api/product-images/{digest}.webp")
        self.assertTrue(self.db.product_images.update_one.call_args.kwargs['upsert'])
        self.assertLessEqual(len(record['data']), 1024 * 1024)
        with Image.open(BytesIO(record['data'])) as image:
            self.assertEqual(image.format, 'WEBP')
            self.assertEqual(image.size, (1200, 1600))
            self.assertEqual(dict(image.getexif()), {})
            self.assertNotIn('icc_profile', image.info)

    async def test_all_allowed_formats_produce_webp_and_keep_transparency(self):
        for format, content_type in [('JPEG', 'image/jpeg'), ('PNG', 'image/png'), ('WEBP', 'image/webp')]:
            self.assertEqual((await self.upload(photo_bytes(format), content_type)).status_code, 201)
        image = Image.new('RGBA', (30, 30), (255, 0, 0, 0))
        output = BytesIO()
        image.save(output, format='PNG')
        self.assertEqual((await self.upload(output.getvalue())).status_code, 201)
        stored = self.db.product_images.update_one.call_args.args[1]['$setOnInsert']['data']
        with Image.open(BytesIO(stored)) as decoded:
            self.assertEqual(decoded.getpixel((0, 0))[3], 0)

    async def test_invalid_or_large_files_are_rejected_before_database_write(self):
        for data, content_type, status in [
            (b'<svg></svg>', 'image/svg+xml', 415),
            (b'<script>alert(1)</script>', 'image/png', 422),
            (b'', 'image/jpeg', 422),
            (photo_bytes(), 'image/jpeg', 422),
            (b'x' * (MAX_UPLOAD_BYTES + 1), 'image/png', 413),
        ]:
            self.assertEqual((await self.upload(data, content_type)).status_code, status)
        with patch('product_images.MAX_IMAGE_PIXELS', 100):
            self.assertEqual((await self.upload(photo_bytes())).status_code, 422)
        self.db.product_images.update_one.assert_not_awaited()

    async def test_streamed_body_without_content_length_is_bounded(self):
        async def oversized_chunks():
            yield b'x' * MAX_UPLOAD_BYTES
            yield b'x'
        response = await self.http.post('/api/admin/product-images', content=oversized_chunks(),
                                        headers={**self.auth, 'Content-Type': 'image/png'})
        self.assertEqual(response.status_code, 413)
        self.db.product_images.update_one.assert_not_awaited()

    async def test_animated_photo_is_rejected(self):
        first = Image.new('RGB', (20, 20), 'red')
        second = Image.new('RGB', (20, 20), 'blue')
        output = BytesIO()
        first.save(output, format='WEBP', save_all=True, append_images=[second], duration=100, loop=0)
        self.assertEqual((await self.upload(output.getvalue(), 'image/webp')).status_code, 422)
        self.db.product_images.update_one.assert_not_awaited()

    async def test_saved_photo_is_public_immutable_and_never_exposes_record_metadata(self):
        await self.upload(photo_bytes())
        query, update = self.db.product_images.update_one.call_args.args
        record = update['$setOnInsert']
        self.db.product_images.find_one.return_value = {"data": record['data']}
        path = f"/api/product-images/{query['_id']}.webp"
        response = await self.http.get(path)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content, record['data'])
        self.assertEqual(response.headers['content-type'], 'image/webp')
        self.assertIn('immutable', response.headers['cache-control'])
        self.assertEqual(response.headers['x-content-type-options'], 'nosniff')
        self.assertEqual((await self.http.get(path, headers={'If-None-Match': response.headers['etag']})).status_code, 304)
        self.db.product_images.find_one.assert_awaited_with(query, {'data': 1})
        self.db.product_images.find_one.return_value = None
        self.assertEqual((await self.http.get(path)).status_code, 404)
        self.assertEqual((await self.http.get('/api/product-images/not-a-photo.webp')).status_code, 404)


if __name__ == '__main__':
    unittest.main()
