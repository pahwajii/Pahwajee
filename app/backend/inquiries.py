"""Validated enquiry intake and durable shop email notifications."""
import hashlib
import hmac
import json
import os
import re
import uuid
from datetime import date, datetime, timedelta, timezone
from email.message import EmailMessage
from typing import Literal

from fastapi import HTTPException
from pydantic import EmailStr, Field, field_validator, model_validator
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError
from orders import InputModel, NotificationOutbox, send_email_message, smtp_settings


class InquiryIn(InputModel):
    idempotency_key: str = Field(default_factory=lambda: str(uuid.uuid4()), min_length=16, max_length=80, pattern=r"^[a-zA-Z0-9-]+$")
    kind: Literal["general", "bulk_gifting"] = "general"
    name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=10, max_length=24)
    email: EmailStr | None = None
    product: str = Field(default="", max_length=160)
    company: str = Field(default="", max_length=120)
    quantity: int | None = Field(default=None, ge=1, le=100000)
    budget: str = Field(default="", max_length=120)
    required_date: date | None = None
    message: str = Field(min_length=5, max_length=3000)

    @field_validator("phone")
    @classmethod
    def normalize_phone(cls, value):
        digits = re.sub(r"[\s()+-]", "", value)
        if len(digits) == 12 and digits.startswith("91"):
            digits = digits[2:]
        elif len(digits) == 11 and digits.startswith("0"):
            digits = digits[1:]
        if not re.fullmatch(r"[6-9]\d{9}", digits):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return "+91" + digits

    @field_validator("email", "required_date", mode="before")
    @classmethod
    def empty_optional(cls, value):
        return value or None

    @model_validator(mode="after")
    def bulk_quantity(self):
        if self.kind == "bulk_gifting" and self.quantity is None:
            raise ValueError("Enter the number of hampers")
        return self


def inquiry_summary(doc):
    lines = ["PAHWAJEE - Bulk gifting quote request" if doc["kind"] == "bulk_gifting" else "PAHWAJEE - Customer enquiry",
             f"Reference: {doc['reference']}", f"Name: {doc['name']}", f"Phone: {doc['phone']}"]
    for key, label in (("email", "Email"), ("company", "Company / organisation"), ("product", "Product"), ("quantity", "Number of hampers"), ("budget", "Budget per hamper (INR)"), ("required_date", "Required date")):
        if doc.get(key):
            lines.append(f"{label}: {doc[key]}")
    return "\n".join(lines + ["", "Requirements:", doc["message"], "", "This is an enquiry; confirm availability, delivery and the final quote with the customer."])


def send_inquiry_email(doc):
    settings = smtp_settings()
    message = EmailMessage()
    topic = "Bulk gifting quote" if doc["kind"] == "bulk_gifting" else "Customer enquiry"
    message["Subject"] = f"New PAHWAJEE {topic} - {doc['reference']}"
    message["From"] = settings["from_email"]
    message["To"] = settings["to_email"]
    message["Message-ID"] = f"<{doc['id']}@pahwajee.inquiries>"
    if doc.get("email"):
        message["Reply-To"] = doc["email"]
    message.set_content(doc["summary"])
    send_email_message(message)


class InquiryService(NotificationOutbox):
    email_state_field = "notification"

    def __init__(self, db):
        self.db = db

    @property
    def email_collection(self):
        return self.db.inquiries

    def send_notification(self, document):
        send_inquiry_email(document)

    async def initialize(self):
        # Historical enquiries have neither field; do not email old submissions.
        await self.db.inquiries.create_index("idempotency_key", unique=True, sparse=True)
        await self.db.inquiries.create_index("reference", unique=True, sparse=True)
        await self.db.inquiries.create_index([("notification.status", 1), ("notification.next_attempt_at", 1)])
        await self.db.inquiry_rate_limits.create_index("expires_at", expireAfterSeconds=0)

    async def rate_limit(self, client_ip):
        now = datetime.now(timezone.utc)
        identity = hmac.new(os.environ["JWT_SECRET"].encode(), client_ip.encode(), hashlib.sha256).hexdigest()
        key = f"{identity}:{int(now.timestamp()) // 600}"
        try:
            result = await self.db.inquiry_rate_limits.find_one_and_update(
                {"_id": key}, {"$inc": {"count": 1}, "$setOnInsert": {"expires_at": now + timedelta(minutes=20)}},
                upsert=True, return_document=ReturnDocument.AFTER)
        except DuplicateKeyError:
            result = await self.db.inquiry_rate_limits.find_one_and_update({"_id": key}, {"$inc": {"count": 1}}, return_document=ReturnDocument.AFTER)
        if result["count"] > 10:
            raise HTTPException(429, "Too many enquiries. Please try again in a few minutes.", headers={"Retry-After": "600"})

    @staticmethod
    def receipt(document):
        return {"ok": True, "id": document["id"], "reference": document["reference"], "email_status": document["notification"]["status"]}

    def replay(self, document, fingerprint):
        if document["fingerprint"] != fingerprint:
            raise HTTPException(409, "This enquiry was already submitted with different details. Please start a new request.")
        return self.receipt(document)

    async def submit(self, body, client_ip):
        payload = body.model_dump(mode="json")
        key = payload.pop("idempotency_key")
        fingerprint = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
        existing = await self.db.inquiries.find_one({"idempotency_key": key})
        if existing:
            return self.replay(existing, fingerprint)
        await self.rate_limit(client_ip)
        now = datetime.now(timezone.utc)
        identity = uuid.uuid4().hex
        doc = {**payload, "id": identity, "reference": f"PJQ-{now.astimezone(timezone(timedelta(hours=5, minutes=30))):%Y%m%d}-{identity[:10].upper()}",
               "idempotency_key": key, "fingerprint": fingerprint, "status": "new", "created_at": now.isoformat(),
               "notification": {"status": "pending", "attempts": 0, "next_attempt_at": now}}
        doc["summary"] = inquiry_summary(doc)
        try:
            await self.db.inquiries.insert_one(doc)
        except DuplicateKeyError:
            existing = await self.db.inquiries.find_one({"idempotency_key": key})
            if existing:
                return self.replay(existing, fingerprint)
            raise HTTPException(503, "Please retry your enquiry.")
        return self.receipt(doc)
