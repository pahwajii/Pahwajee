"""Bounded product photos stored durably alongside the catalogue in MongoDB."""
import hashlib
import re
import warnings
from datetime import datetime, timezone
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from PIL import Image, ImageOps, UnidentifiedImageError
from pymongo.errors import DuplicateKeyError
from starlette.concurrency import run_in_threadpool

MAX_UPLOAD_BYTES = 3 * 1024 * 1024
MAX_IMAGE_PIXELS = 24_000_000
MAX_STORED_BYTES = 1024 * 1024
SUPPORTED_TYPES = {"image/jpeg": "JPEG", "image/png": "PNG", "image/webp": "WEBP"}


def prepare_product_image(data: bytes, content_type: str):
    """Decode an allowed format, orient it, and strip metadata before storage."""
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(BytesIO(data), formats=list(SUPPORTED_TYPES.values())) as source:
                if source.format != SUPPORTED_TYPES[content_type]:
                    raise HTTPException(422, "The photo does not match its file type.")
                if source.width * source.height > MAX_IMAGE_PIXELS:
                    raise HTTPException(422, "Choose a photo with no more than 24 megapixels.")
                if getattr(source, "is_animated", False):
                    raise HTTPException(422, "Choose a still photo, not an animation.")
                source.load()
                photo = ImageOps.exif_transpose(source)
                photo.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
                photo = photo.convert("RGBA" if "A" in photo.getbands() or "transparency" in photo.info else "RGB")
                # A fresh image prevents EXIF, GPS, ICC and XMP metadata being copied.
                clean = Image.new(photo.mode, photo.size)
                clean.paste(photo)
                output = BytesIO()
                clean.save(output, format="WEBP", quality=85, method=4)
                encoded = output.getvalue()
                if len(encoded) > MAX_STORED_BYTES:
                    output = BytesIO()
                    clean.save(output, format="WEBP", quality=70, method=4)
                    encoded = output.getvalue()
                if len(encoded) > MAX_STORED_BYTES:
                    raise HTTPException(422, "This photo is too detailed. Choose a smaller image.")
                return encoded, clean.width, clean.height
    except (UnidentifiedImageError, OSError, ValueError, SyntaxError,
            Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise HTTPException(422, "Choose a valid JPEG, PNG, or WebP photo.") from None


def create_product_image_router(db, require_admin):
    router = APIRouter(prefix="/api")

    @router.post("/admin/product-images", status_code=201)
    async def upload_photo(request: Request, user: dict = Depends(require_admin)):
        content_type = request.headers.get("content-type", "").split(";", 1)[0].strip().lower()
        if content_type not in SUPPORTED_TYPES:
            raise HTTPException(415, "Choose a JPEG, PNG, or WebP photo.")
        length = request.headers.get("content-length")
        if length:
            try:
                if int(length) > MAX_UPLOAD_BYTES:
                    raise HTTPException(413, "Choose a photo smaller than 3 MB.")
            except ValueError:
                raise HTTPException(400, "Invalid upload size.") from None
        data = bytearray()
        async for chunk in request.stream():
            if len(data) + len(chunk) > MAX_UPLOAD_BYTES:
                raise HTTPException(413, "Choose a photo smaller than 3 MB.")
            data.extend(chunk)
        if not data:
            raise HTTPException(422, "Choose a photo to upload.")
        encoded, width, height = await run_in_threadpool(prepare_product_image, bytes(data), content_type)
        digest = hashlib.sha256(encoded).hexdigest()
        try:
            await db.product_images.update_one({"_id": digest}, {"$setOnInsert": {
                "data": encoded, "content_type": "image/webp", "width": width, "height": height,
                "created_at": datetime.now(timezone.utc), "uploaded_by": user["id"],
            }}, upsert=True)
        except DuplicateKeyError:
            # Concurrent identical uploads share the same immutable content address.
            pass
        return {"url": f"/api/product-images/{digest}.webp", "width": width, "height": height}

    @router.get("/product-images/{filename}")
    async def product_photo(filename: str, request: Request):
        if not re.fullmatch(r"[a-f0-9]{64}\.webp", filename):
            raise HTTPException(404, "Photo not found.")
        digest = filename[:-5]
        photo = await db.product_images.find_one({"_id": digest}, {"data": 1})
        if not photo:
            raise HTTPException(404, "Photo not found.")
        headers = {"Cache-Control": "public, max-age=31536000, immutable",
                   "ETag": f'"{digest}"', "X-Content-Type-Options": "nosniff"}
        if request.headers.get("if-none-match") == headers["ETag"]:
            return Response(status_code=304, headers=headers)
        return Response(content=bytes(photo["data"]), media_type="image/webp", headers=headers)

    return router
