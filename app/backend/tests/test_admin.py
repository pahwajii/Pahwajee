"""Exercise the real admin routes with isolated database doubles; no email or customer writes."""
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from pymongo.errors import DuplicateKeyError

import server
from admin import create_admin_router


class AdminTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.db = SimpleNamespace(**{name: MagicMock() for name in ('users', 'products', 'categories', 'orders', 'inquiries')})
        for collection in vars(self.db).values():
            for method in ('find_one', 'find_one_and_update', 'count_documents', 'update_one', 'insert_one'):
                setattr(collection, method, AsyncMock())
        self.user = {"id": "admin-test", "email": "admin@example.com", "role": "admin", "name": "Test admin"}
        self.db.users.find_one.return_value = self.user
        self.db.categories.find_one.return_value = {"slug": "signature"}
        self.db.products.find_one.return_value = None
        self.db.products.update_one.return_value = SimpleNamespace(matched_count=1)
        self.patcher = patch.object(server, 'db', self.db)
        self.patcher.start()
        app = FastAPI()
        app.include_router(server.api_router)
        app.include_router(create_admin_router(self.db, server.require_admin))
        self.http = AsyncClient(transport=ASGITransport(app=app), base_url='http://test')
        self.auth = {"Authorization": f"Bearer {server.create_access_token(self.user['id'], self.user['email'])}"}

    async def asyncTearDown(self):
        await self.http.aclose()
        self.patcher.stop()

    def cursor(self, collection, rows):
        cursor = MagicMock()
        cursor.sort.return_value = cursor
        cursor.skip.return_value = cursor
        cursor.to_list = AsyncMock(return_value=rows)
        collection.find.return_value = cursor
        collection.count_documents.return_value = len(rows)
        return cursor

    async def test_admin_endpoints_reject_visitors_and_non_admins(self):
        paths = ['/api/admin/overview', '/api/admin/order-inbox', '/api/admin/inquiry-inbox', '/api/admin/orders', '/api/admin/inquiries']
        for path in paths:
            self.assertEqual((await self.http.get(path)).status_code, 401, path)
        self.db.users.find_one.return_value = {**self.user, "role": "customer"}
        for path in paths:
            self.assertEqual((await self.http.get(path, headers=self.auth)).status_code, 403, path)
        for path, method, body in [
            ('/api/admin/products', 'post', {"name": "Test", "category": "signature"}),
            ('/api/admin/products/id', 'put', {"name": "Test", "category": "signature"}),
            ('/api/admin/orders/PJ-TEST', 'patch', {"status": "confirmed", "expected_status": "requested"}),
            ('/api/admin/inquiries/id', 'patch', {"status": "closed", "expected_status": "new"}),
        ]:
            self.assertEqual((await getattr(self.http, method)(path, json=body)).status_code, 401)
            self.assertEqual((await getattr(self.http, method)(path, json=body, headers=self.auth)).status_code, 403)

    async def test_order_search_is_literal_paginated_and_private(self):
        cursor = self.cursor(self.db.orders, [])
        response = await self.http.get('/api/admin/order-inbox', params={"q": "a.*", "page": 2, "limit": 20, "status": "requested"}, headers=self.auth)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['cache-control'], 'no-store')
        query, projection = self.db.orders.find.call_args.args
        self.assertEqual(query['$or'][0]['reference']['$regex'], r'a\.\*')
        self.assertEqual(query['status'], 'requested')
        self.assertEqual(projection['idempotency_key'], 0)
        cursor.skip.assert_called_once_with(20)
        self.assertEqual((await self.http.get('/api/admin/order-inbox?limit=1000', headers=self.auth)).status_code, 422)

    async def test_order_update_audits_transition_without_repricing(self):
        self.db.orders.find_one_and_update.return_value = {"reference": "PJ-TEST", "status": "confirmed", "subtotal_paise": 30000}
        response = await self.http.patch('/api/admin/orders/PJ-TEST', headers=self.auth, json={"status": "confirmed", "expected_status": "requested", "internal_notes": "Call before pickup"})
        self.assertEqual(response.status_code, 200)
        query, update = self.db.orders.find_one_and_update.call_args.args
        self.assertEqual(query, {"reference": "PJ-TEST", "status": "requested"})
        self.assertEqual(update['$push']['status_history']['by'], self.user['id'])
        self.assertEqual(set(update['$set']), {'status', 'internal_notes', 'updated_at'})

    async def test_invalid_and_stale_status_changes_are_rejected(self):
        for previous, target in [('requested', 'completed'), ('completed', 'confirmed'), ('cancelled', 'requested')]:
            response = await self.http.patch('/api/admin/orders/PJ-TEST', headers=self.auth, json={"status": target, "expected_status": previous})
            self.assertEqual(response.status_code, 422)
        self.db.orders.find_one_and_update.assert_not_awaited()
        self.db.orders.find_one_and_update.return_value = None
        self.db.orders.find_one.return_value = {"status": "preparing"}
        self.assertEqual((await self.http.patch('/api/admin/orders/PJ-TEST', headers=self.auth, json={"status": "confirmed", "expected_status": "requested"})).status_code, 409)
        self.db.orders.find_one.return_value = None
        self.assertEqual((await self.http.patch('/api/admin/orders/PJ-MISSING', headers=self.auth, json={"status": "confirmed", "expected_status": "requested"})).status_code, 404)

    async def test_old_inquiries_default_to_new_and_can_be_updated(self):
        self.cursor(self.db.inquiries, [{"id": "legacy", "name": "Test customer"}])
        response = await self.http.get('/api/admin/inquiry-inbox?status=new', headers=self.auth)
        self.assertEqual(response.json()['items'][0]['status'], 'new')
        self.db.inquiries.find_one_and_update.return_value = {"id": "legacy", "status": "contacted"}
        response = await self.http.patch('/api/admin/inquiries/legacy', headers=self.auth, json={"status": "contacted", "expected_status": "new", "internal_notes": "Quote prepared"})
        self.assertEqual(response.status_code, 200)
        query, update = self.db.inquiries.find_one_and_update.call_args.args
        self.assertIn({"status": {"$exists": False}}, query['$or'])
        self.assertEqual(update['$set']['internal_notes'], 'Quote prepared')

    async def test_product_create_derives_prices_and_packs(self):
        response = await self.http.post('/api/admin/products', headers=self.auth, json={"name": "Test Nankhatai", "category": "signature", "price": "Rs 600/kg", "image": "/products/nankhatayi.png"})
        self.assertEqual(response.status_code, 200)
        product = response.json()
        self.assertEqual(product['slug'], 'test-nankhatai')
        self.assertEqual(product['unit_price_paise'], 60000)
        self.assertEqual(product['pack_sizes_grams'], [500, 1000])
        self.db.products.insert_one.assert_awaited_once()

    async def test_product_edit_persists_availability_and_recalculates_prices(self):
        self.db.products.find_one.side_effect = [None, {"id": "test", "price": "Rs 640/kg", "availability": "Sold out"}]
        response = await self.http.put('/api/admin/products/test', headers=self.auth, json={"name": "Test Nankhatai", "category": "signature", "price": "Rs 640/kg", "availability": "Sold out"})
        self.assertEqual(response.status_code, 200)
        fields = self.db.products.update_one.call_args.args[1]['$set']
        self.assertEqual(fields['unit_price_paise'], 64000)
        self.assertEqual(fields['availability'], 'Sold out')
        self.assertEqual(fields['pack_sizes_grams'], [500, 1000])

    async def test_product_validation_and_duplicate_url(self):
        for body in [{"name": " ", "category": "signature"}, {"name": "Test", "category": "signature", "image": "javascript:alert(1)"}, {"name": "Test", "category": "signature", "slug": "../bad"}]:
            self.assertEqual((await self.http.post('/api/admin/products', headers=self.auth, json=body)).status_code, 422)
        self.db.products.find_one.return_value = {"id": "existing"}
        body = {"name": "Test", "category": "signature", "slug": "existing"}
        self.assertEqual((await self.http.put('/api/admin/products/other', headers=self.auth, json=body)).status_code, 409)
        self.db.products.find_one.return_value = None
        self.db.products.insert_one.side_effect = DuplicateKeyError('test collision')
        self.assertEqual((await self.http.post('/api/admin/products', headers=self.auth, json=body)).status_code, 409)

    async def test_login_cookie_and_refresh_flow(self):
        self.db.users.find_one.return_value = {**self.user, "password_hash": server.hash_password('test-password-only')}
        wrong = await self.http.post('/api/auth/login', json={"email": self.user['email'], "password": "wrong"})
        self.assertEqual(wrong.status_code, 401)
        response = await self.http.post('/api/auth/login', json={"email": self.user['email'], "password": "test-password-only"})
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('password_hash', response.json())
        self.assertTrue(all('HttpOnly' in value and 'SameSite=lax' in value for value in response.headers.get_list('set-cookie')))
        self.assertEqual((await self.http.post('/api/auth/refresh')).status_code, 200)
        self.assertEqual((await self.http.post('/api/auth/logout')).status_code, 200)
        self.assertEqual((await self.http.get('/api/admin/overview')).status_code, 401)


if __name__ == '__main__':
    unittest.main()
