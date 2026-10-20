"""Enquiry validation, notification safety and serverless submission."""
import asyncio
import os
import unittest
import uuid
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch
from fastapi import FastAPI, HTTPException
from httpx import ASGITransport, AsyncClient
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import ValidationError
import server
from inquiries import InquiryIn, InquiryService, inquiry_summary, send_inquiry_email


def payload():
    return {"idempotency_key": str(uuid.uuid4()), "kind": "bulk_gifting", "name": "Test Customer", "phone": "09876543210", "email": "test@example.com", "company": "Test Company", "quantity": 25, "budget": "500 - 1000", "required_date": "2026-11-01", "product": "Corporate Gifting Enquiry", "message": "TEST ONLY - dry fruit hampers; do not fulfil."}


class InquiryValidationTests(unittest.TestCase):
    def test_phone_and_optional_fields(self):
        for phone in ("9876543210", "09876543210", "+91 98765 43210"):
            self.assertEqual(InquiryIn(**{**payload(), "phone": phone}).phone, "+919876543210")
        general = InquiryIn(name="Test Person", phone="9876543210", email="", message="Contact form enquiry")
        self.assertIsNone(general.email)
        self.assertEqual(general.kind, "general")
        for change in ({"quantity": 0}, {"quantity": 1.5}, {"quantity": None}, {"phone": "123"}, {"phone": "abc9876543210"}, {"name": "  "}, {"message": "  "}, {"email": "bad"}, {"required_date": "bad"}):
            with self.assertRaises(ValidationError): InquiryIn(**{**payload(), **change})

    def test_smtp_recipient_reply_to_and_complete_quote(self):
        doc = {**InquiryIn(**payload()).model_dump(mode="json"), "reference": "PJQ-TEST", "id": "test-id"}
        doc["summary"] = inquiry_summary(doc)
        with patch.dict(os.environ, {"SMTP_HOST": "smtp.gmail.com", "SMTP_PORT": "465", "SMTP_USERNAME": "lakshaypahwa47@gmail.com", "SMTP_PASSWORD": "test-only", "ORDER_FROM_EMAIL": "lakshaypahwa47@gmail.com", "ORDER_NOTIFICATION_EMAIL": "pahwajee@gmail.com"}), patch('orders.smtplib.SMTP_SSL') as smtp:
            send_inquiry_email(doc)
            message = smtp.return_value.__enter__.return_value.send_message.call_args.args[0]
            self.assertEqual(message["To"], "pahwajee@gmail.com")
            self.assertEqual(message["From"], "lakshaypahwa47@gmail.com")
            self.assertEqual(message["Reply-To"], "test@example.com")
            for value in ("PJQ-TEST", "Test Company", "25", "500 - 1000", "2026-11-01", doc["message"]): self.assertIn(value, message.get_content())
            self.assertIn("Bulk gifting quote", message["Subject"])


class InquiryRouteTests(unittest.IsolatedAsyncioTestCase):
    async def test_save_precedes_delivery_and_status_is_truthful(self):
        events = []
        async def submit(*args):
            events.append('saved')
            return {"ok": True, "id": "test-id", "reference": "PJQ-TEST", "email_status": "pending"}
        async def deliver(reference): events.append('delivery')
        service = SimpleNamespace(submit=AsyncMock(side_effect=submit), deliver_saved_order=AsyncMock(side_effect=deliver))
        db = SimpleNamespace(inquiries=SimpleNamespace(find_one=AsyncMock(return_value={"notification": {"status": "retry"}})))
        app = FastAPI(); app.include_router(server.api_router)
        with patch.object(server, 'inquiry_service', service), patch.object(server, 'db', db), patch.object(server, 'IS_VERCEL', True):
            async with AsyncClient(transport=ASGITransport(app=app), base_url='https://test') as http:
                response = await http.post('/api/inquiries', json=payload(), headers={'x-vercel-forwarded-for': '203.0.113.9'})
                self.assertEqual(response.status_code, 201)
                self.assertEqual(response.json()['email_status'], 'retry')
                self.assertEqual(response.headers['cache-control'], 'no-store')
                self.assertEqual(events, ['saved', 'delivery'])
                self.assertEqual(service.submit.call_args.args[1], '203.0.113.9')
                response = await http.post('/api/inquiries', json={**payload(), 'quantity': -2})
                self.assertEqual(response.status_code, 422)
                self.assertEqual(len(events), 2)


@unittest.skipUnless(os.getenv('RUN_DB_TESTS') == '1', 'Set RUN_DB_TESTS=1 for isolated Mongo integration tests')
class InquiryDatabaseTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.client = AsyncIOMotorClient(os.environ['MONGO_URL'], serverSelectionTimeoutMS=10000)
        self.test_name = 'pahwa_inquiry_test_' + uuid.uuid4().hex[:16]
        self.db = self.client[self.test_name]
        self.service = InquiryService(self.db)
        await self.db.inquiries.insert_many([{'id': 'old-1', 'name': 'Historical enquiry'}, {'id': 'old-2', 'name': 'Historical enquiry'}])
        await self.service.initialize()

    async def asyncTearDown(self):
        assert self.test_name.startswith('pahwa_inquiry_test_') and self.test_name != os.environ['DB_NAME']
        await self.client.drop_database(self.test_name)
        self.client.close()

    async def test_concurrent_retries_create_one_enquiry_and_one_email(self):
        body = InquiryIn(**payload())
        first, second = await asyncio.gather(self.service.submit(body, 'test'), self.service.submit(body, 'test'))
        self.assertEqual(first['reference'], second['reference'])
        self.assertEqual(await self.db.inquiries.count_documents({'reference': first['reference']}), 1)
        with patch('orders.smtp_ready', return_value=True), patch('inquiries.send_inquiry_email') as send:
            await asyncio.gather(self.service.deliver_one(first['reference']), self.service.deliver_one(first['reference']))
            send.assert_called_once()
            self.assertFalse(await self.service.deliver_one()) # historical rows are never sent
        saved = await self.db.inquiries.find_one({'id': first['id']})
        self.assertEqual(saved['notification']['status'], 'sent')
        self.assertEqual(saved['email'], 'test@example.com')
        with self.assertRaises(HTTPException):
            await self.service.submit(InquiryIn(**{**payload(), 'idempotency_key': body.idempotency_key, 'quantity': 26}), 'test')

    async def test_failed_smtp_preserves_request_and_can_retry(self):
        result = await self.service.submit(InquiryIn(**payload()), 'test')
        with patch('orders.smtp_ready', return_value=False):
            self.assertFalse(await self.service.deliver_one(result['reference']))
        with patch('orders.smtp_ready', return_value=True), patch('inquiries.send_inquiry_email', side_effect=OSError('SMTP unavailable')):
            await self.service.deliver_one(result['reference'])
        saved = await self.db.inquiries.find_one({'id': result['id']})
        self.assertEqual(saved['notification']['status'], 'retry')
        self.assertEqual(saved['notification']['attempts'], 1)
        self.assertIn('dry fruit hampers', saved['summary'])
        await self.service.retry_email(result['reference'])
        with patch('orders.smtp_ready', return_value=True), patch('inquiries.send_inquiry_email') as send:
            await self.service.deliver_saved_order(result['reference'])
            send.assert_called_once()
        saved = await self.db.inquiries.find_one({'id': result['id']})
        self.assertEqual(saved['notification']['status'], 'sent')

    async def test_rate_limit_and_body_limit(self):
        for _ in range(10): await self.service.submit(InquiryIn(**payload()), 'limited-test')
        with self.assertRaises(HTTPException) as caught:
            await self.service.submit(InquiryIn(**payload()), 'limited-test')
        self.assertEqual(caught.exception.status_code, 429)
        from orders import OrderBodyLimitMiddleware
        app = FastAPI(); app.add_middleware(OrderBodyLimitMiddleware); app.include_router(server.api_router)
        async with AsyncClient(transport=ASGITransport(app=app), base_url='https://test') as http:
            self.assertEqual((await http.post('/api/inquiries', content=b'x' * 32769)).status_code, 413)
