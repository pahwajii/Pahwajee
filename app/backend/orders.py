"""Cart pricing, durable order requests and the SMTP notification outbox."""
import asyncio
import hashlib
import hmac
import json
import logging
import os
import re
import smtplib
import ssl
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from email.message import EmailMessage
from typing import Literal
from urllib.parse import urlencode

from fastapi import HTTPException
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

logger = logging.getLogger(__name__)
GALLERY_ONLY_SLUGS = frozenset(json.loads((Path(__file__).resolve().parents[1] / "gallery-only-products.json").read_text(encoding="utf-8")))
BOX_SLUGS = frozenset(json.loads((Path(__file__).resolve().parents[1] / "mithai-boxes.json").read_text(encoding="utf-8"))["boxSlugs"])
PACKS = (500, 1000)
PRODUCT_PACKS = json.loads((Path(__file__).resolve().parents[1] / "product-packs.json").read_text(encoding="utf-8"))
DELIVERY_INFO = json.loads((Path(__file__).resolve().parents[1] / "store-policy.json").read_text(encoding="utf-8"))["deliverySummary"]


def purchase_fields(product):
    """Strictly derive numeric pricing from the existing editable price field."""
    price = (product.get("price") or "").strip()
    match = re.fullmatch(r"(?:Rs\.?|INR|₹)\s*(\d+(?:\.\d{1,2})?)\s*(?:/\s*(kg|plate|piece))?", price, re.I)
    excluded = product.get("availability") == "Special order only" or product.get("slug") in GALLERY_ONLY_SLUGS or (product.get("category") == "festival-collection" and product.get("slug") not in BOX_SLUGS) or bool(
        re.search(r"\b(?:trays?|hampers?|gifting)\b", f"{product.get('name', '')} {product.get('slug', '').replace('-', ' ')}", re.I)
    )
    amount = int(Decimal(match[1]) * 100) if match else None
    unit = (match[2] or "piece").lower() if match else None
    eligible = bool(not excluded and amount and 0 < amount <= 100_000_000)
    return {
        "unit_price_paise": amount if eligible else None,
        "sale_unit": unit if eligible else None,
        "cart_eligible": eligible,
        "pack_sizes_grams": PRODUCT_PACKS.get(product.get("slug"), list(PACKS)) if eligible and unit == "kg" else [],
    }


def purchasable_product(product):
    return {**product, **purchase_fields(product)}


async def migrate_purchase_fields(db):
    updated = 0
    async for product in db.products.find({}):
        fields = purchase_fields(product)
        if any(product.get(key) != value for key, value in fields.items()):
            await db.products.update_one({"_id": product["_id"]}, {"$set": fields})
            updated += 1
    return updated


class InputModel(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class Customer(InputModel):
    name: str = Field(min_length=2, max_length=100)
    phone: str
    email: EmailStr | None = None

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, value):
        if not re.fullmatch(r"[+\d\s()-]{10,25}", value):
            raise ValueError("Enter a valid Indian mobile number")
        digits = re.sub(r"\D", "", value)
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        if not re.fullmatch(r"[6-9]\d{9}", digits):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return "+91" + digits

    @field_validator("email", mode="before")
    @classmethod
    def empty_email(cls, value):
        return value or None


class Fulfilment(InputModel):
    method: Literal["pickup", "delivery"]
    address: str = Field(default="", max_length=300)
    city: str = Field(default="", max_length=80)
    pincode: str = Field(default="", max_length=6)

    @model_validator(mode="after")
    def delivery_address(self):
        if self.method == "delivery":
            if len(self.address) < 5 or len(self.city) < 2 or not re.fullmatch(r"[1-9]\d{5}", self.pincode):
                raise ValueError("Delivery needs an address, city and valid 6-digit pincode")
        else:
            self.address = self.city = self.pincode = ""
        return self


class OrderItem(InputModel):
    slug: str = Field(min_length=1, max_length=160, pattern=r"^[a-z0-9-]+$")
    pack_grams: Literal[200, 400, 500, 1000] | None = None
    quantity: int = Field(ge=1, le=99, strict=True)
    expected_unit_price_paise: int = Field(gt=0, le=100_000_000, strict=True)


class OrderRequest(InputModel):
    idempotency_key: uuid.UUID
    customer: Customer
    fulfilment: Fulfilment
    items: list[OrderItem] = Field(min_length=1, max_length=50)
    notes: str = Field(default="", max_length=1000)

    @model_validator(mode="after")
    def unique_lines(self):
        keys = [(item.slug, item.pack_grams) for item in self.items]
        if len(keys) != len(set(keys)):
            raise ValueError("Combine duplicate product packs into one cart line")
        return self


def price_per_pack(unit_price_paise, unit, pack_grams):
    if unit == "kg":
        return int((Decimal(unit_price_paise) * Decimal(pack_grams) / 1000).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
    return unit_price_paise


def price_order(items, products):
    by_slug = {p["slug"]: purchasable_product(p) for p in products}
    unavailable, changed, lines = [], [], []
    for item in items:
        product = by_slug.get(item.slug)
        if not product or not product["cart_eligible"] or product.get("availability") != "Available":
            unavailable.append(item.slug)
            continue
        if (product["sale_unit"] == "kg" and item.pack_grams not in product["pack_sizes_grams"]) or (product["sale_unit"] != "kg" and item.pack_grams is not None):
            raise HTTPException(422, {"code": "invalid_pack", "message": "Choose a valid pack size for each item."})
        if item.expected_unit_price_paise != product["unit_price_paise"]:
            changed.append({k: product[k] for k in ("slug", "name", "unit_price_paise", "sale_unit", "cart_eligible", "pack_sizes_grams", "availability")})
        pack_price = price_per_pack(product["unit_price_paise"], product["sale_unit"], item.pack_grams)
        lines.append({
            "product_id": product["id"], "slug": product["slug"], "name": product["name"],
            "image": product.get("image", ""), "sale_unit": product["sale_unit"],
            "unit_price_paise": product["unit_price_paise"], "pack_grams": item.pack_grams,
            "quantity": item.quantity, "pack_price_paise": pack_price,
            "line_total_paise": pack_price * item.quantity,
        })
    if unavailable:
        raise HTTPException(409, {"code": "unavailable_items", "message": "Some items are no longer available. Please update your cart.", "slugs": unavailable})
    if changed:
        raise HTTPException(409, {"code": "prices_changed", "message": "Prices have changed. Review the updated total, then submit again.", "products": changed})
    return lines, sum(line["line_total_paise"] for line in lines)


def rupees(paise):
    return f"Rs {paise / 100:,.2f}".removesuffix(".00")


def order_summary(order):
    customer, fulfilment = order["customer"], order["fulfilment"]
    lines = [f"PAHWA JEE order request {order['reference']}", ""]
    for item in order["items"]:
        pack = ("1kg" if item["pack_grams"] == 1000 else f"{item['pack_grams']}g") if item["sale_unit"] == "kg" else item["sale_unit"]
        lines.append(f"{item['name']} - {pack} x {item['quantity']}: {rupees(item['line_total_paise'])}")
    lines.extend(["", f"Items subtotal: {rupees(order['subtotal_paise'])}", f"Name: {customer['name']}", f"Mobile: {customer['phone']}"])
    if customer.get("email"):
        lines.append(f"Email: {customer['email']}")
    lines.append("Fulfilment: " + ("Store Pickup" if fulfilment["method"] == "pickup" else "Delivery Request"))
    if fulfilment["method"] == "delivery":
        lines.append(f"Address: {fulfilment['address']}, {fulfilment['city']} - {fulfilment['pincode']}")
    if order.get("notes"):
        lines.append(f"Notes: {order['notes']}")
    lines.extend(["", DELIVERY_INFO, "Request only. Please confirm availability and fulfilment. No online payment collected."])
    return "\n".join(lines)


def receipt(order):
    # No public order lookup: customer details are returned only to the submitter.
    data = {k: order[k] for k in ("reference", "status", "created_at", "items", "customer", "fulfilment", "notes", "subtotal_paise")}
    data["summary"] = order["summary"]
    data["whatsapp_url"] = "https://wa.me/916396339806?" + urlencode({"text": order["summary"]})
    return data


def smtp_settings():
    return {
        "host": os.getenv("SMTP_HOST", ""), "port": int(os.getenv("SMTP_PORT", "465")),
        "username": os.getenv("SMTP_USERNAME", ""), "password": os.getenv("SMTP_PASSWORD", ""),
        "from_email": os.getenv("ORDER_FROM_EMAIL", ""),
        "to_email": os.getenv("ORDER_NOTIFICATION_EMAIL", "lakshaypahwa47@gmail.com"),
    }


def smtp_ready():
    settings = smtp_settings()
    return all(settings[key] for key in ("host", "username", "password", "from_email", "to_email"))


def send_order_email(order):
    settings = smtp_settings()
    message = EmailMessage()
    message["Subject"] = f"New PAHWA JEE order request - {order['reference']}"
    message["From"] = settings["from_email"]
    message["To"] = settings["to_email"]
    message["Message-ID"] = f"<{order['id']}@pahwajee.orders>"
    if order["customer"].get("email"):
        message["Reply-To"] = order["customer"]["email"]
    message.set_content(order["summary"])
    context = ssl.create_default_context()
    if settings["port"] == 465:
        connection = smtplib.SMTP_SSL(settings["host"], settings["port"], timeout=20, context=context)
    else:
        connection = smtplib.SMTP(settings["host"], settings["port"], timeout=20)
    with connection as smtp:
        if settings["port"] != 465:
            smtp.starttls(context=context)
        smtp.login(settings["username"], settings["password"])
        smtp.send_message(message)


class OrderService:
    def __init__(self, db):
        self.db = db

    async def initialize(self):
        await self.db.orders.create_index("idempotency_key", unique=True)
        await self.db.orders.create_index("reference", unique=True)
        await self.db.orders.create_index([("email.status", 1), ("email.next_attempt_at", 1)])
        await self.db.order_rate_limits.create_index("expires_at", expireAfterSeconds=0)

    async def rate_limit(self, client_ip):
        now = datetime.now(timezone.utc)
        bucket = int(now.timestamp()) // 600
        identity = hmac.new(os.environ["JWT_SECRET"].encode(), client_ip.encode(), hashlib.sha256).hexdigest()
        key = f"{identity}:{bucket}"
        try:
            result = await self.db.order_rate_limits.find_one_and_update(
                {"_id": key}, {"$inc": {"count": 1}, "$setOnInsert": {"expires_at": now + timedelta(minutes=20)}},
                upsert=True, return_document=ReturnDocument.AFTER,
            )
        except DuplicateKeyError:
            result = await self.db.order_rate_limits.find_one_and_update({"_id": key}, {"$inc": {"count": 1}}, return_document=ReturnDocument.AFTER)
        if result["count"] > 10:
            raise HTTPException(429, "Too many order attempts. Please try again in a few minutes.", headers={"Retry-After": "600"})

    async def submit(self, body, client_ip):
        payload = body.model_dump(mode="json")
        key = payload.pop("idempotency_key")
        payload["items"].sort(key=lambda item: (item["slug"], item["pack_grams"] or 0))
        fingerprint = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
        existing = await self.db.orders.find_one({"idempotency_key": key})
        if existing:
            return self.replay(existing, fingerprint)
        await self.rate_limit(client_ip)
        products = await self.db.products.find({"slug": {"$in": [item.slug for item in body.items]}}).to_list(50)
        items, subtotal = price_order(body.items, products)
        now = datetime.now(timezone.utc)
        order_id = uuid.uuid4().hex
        order = {
            "id": order_id, "reference": f"PJ-{now.astimezone(timezone(timedelta(hours=5, minutes=30))):%Y%m%d}-{order_id[:10].upper()}",
            "idempotency_key": key, "fingerprint": fingerprint,
            "status": "requested", "created_at": now.isoformat(),
            "customer": payload["customer"], "fulfilment": payload["fulfilment"], "notes": payload["notes"],
            "items": items, "subtotal_paise": subtotal,
            "email": {"status": "pending", "attempts": 0, "next_attempt_at": now},
        }
        order["summary"] = order_summary(order)
        try:
            await self.db.orders.insert_one(order)
        except DuplicateKeyError:
            existing = await self.db.orders.find_one({"idempotency_key": key})
            if existing:
                return self.replay(existing, fingerprint)
            raise HTTPException(503, "Please retry your order request.")
        return receipt(order)

    @staticmethod
    def replay(existing, fingerprint):
        if existing["fingerprint"] != fingerprint:
            raise HTTPException(409, {"code": "idempotency_conflict", "message": "This request was already submitted with different details. Please start a new request."})
        return receipt(existing)

    async def deliver_one(self, reference=None):
        if not smtp_ready():
            return False
        now = datetime.now(timezone.utc)
        eligible = {"$or": [
                {"email.status": {"$in": ["pending", "retry"]}, "email.next_attempt_at": {"$lte": now}},
                {"email.status": "sending", "email.locked_until": {"$lte": now}},
            ]}
        if reference is not None:
            eligible["reference"] = reference
        order = await self.db.orders.find_one_and_update(
            eligible,
            {"$set": {"email.status": "sending", "email.locked_until": now + timedelta(minutes=5)}, "$inc": {"email.attempts": 1}},
            return_document=ReturnDocument.AFTER,
        )
        if not order:
            return False
        try:
            await asyncio.to_thread(send_order_email, order)
        except Exception as error:
            attempts = order["email"]["attempts"]
            await self.db.orders.update_one({"id": order["id"]}, {"$set": {
                "email.status": "failed" if attempts >= 5 else "retry",
                "email.next_attempt_at": now + timedelta(seconds=min(60 * 2 ** min(attempts - 1, 6), 3600)),
                "email.last_error": type(error).__name__,
            }, "$unset": {"email.locked_until": ""}})
            logger.warning("Order email deferred: %s (%s)", order["reference"], type(error).__name__)
        else:
            await self.db.orders.update_one({"id": order["id"]}, {"$set": {
                "email.status": "sent", "email.sent_at": datetime.now(timezone.utc),
            }, "$unset": {"email.locked_until": "", "email.last_error": ""}})
        return True

    async def deliver_saved_order(self, reference):
        """Attempt delivery within a serverless request without undoing a saved order."""
        try:
            return await self.deliver_one(reference)
        except Exception as error:
            logger.error("Order outbox deferred (%s); the saved job will retry", type(error).__name__)
            return False

    async def drain_outbox(self, limit=10):
        processed = 0
        deadline = asyncio.get_running_loop().time() + 120
        while processed < limit and asyncio.get_running_loop().time() < deadline:
            if not await self.deliver_one():
                break
            processed += 1
        return {"processed": processed, "smtp_configured": smtp_ready()}

    async def worker(self):
        if not smtp_ready():
            logger.warning("Order email SMTP is not configured. Orders will stay queued until configuration is added and the API restarted.")
        while True:
            try:
                worked = await self.deliver_one()
            except Exception as error:
                logger.error("Order outbox error (%s); will retry", type(error).__name__)
                worked = False
            await asyncio.sleep(1 if worked else 15)

    async def retry_email(self, reference):
        order = await self.db.orders.find_one_and_update(
            {"reference": reference, "email.status": {"$in": ["failed", "retry", "pending"]}},
            {"$set": {"email.status": "pending", "email.attempts": 0, "email.next_attempt_at": datetime.now(timezone.utc)},
             "$unset": {"email.last_error": "", "email.locked_until": ""}},
            return_document=ReturnDocument.AFTER,
        )
        if not order:
            raise HTTPException(409, "Order not found, or email is already sent/in progress.")
        return {"reference": reference, "email_status": "pending", "smtp_configured": smtp_ready()}


class OrderBodyLimitMiddleware:
    """Bound JSON allocation before request parsing, including chunked requests."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http" or scope["method"] != "POST" or scope["path"] != "/api/orders":
            return await self.app(scope, receive, send)
        chunks, size = [], 0
        while True:
            message = await receive()
            if message["type"] == "http.disconnect":
                return
            size += len(message.get("body", b""))
            if size > 32768:
                await send({"type": "http.response.start", "status": 413, "headers": [(b"content-type", b"application/json")]})
                await send({"type": "http.response.body", "body": b'{"detail":"Order request is too large."}'})
                return
            chunks.append(message)
            if not message.get("more_body", False):
                break
        async def replay():
            return chunks.pop(0) if chunks else await receive()
        await self.app(scope, replay, send)
