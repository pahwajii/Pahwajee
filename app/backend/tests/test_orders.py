import asyncio
import copy
import os
import unittest
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from unittest.mock import AsyncMock, patch

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from httpx import ASGITransport, AsyncClient
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from pydantic import ValidationError
from pymongo.errors import AutoReconnect

from orders import OrderBodyLimitMiddleware, OrderRequest, OrderService, migrate_purchase_fields, order_summary, price_order, purchase_fields, send_order_email

PRODUCTS = [
    {"id": "ghee", "slug": "pure-desi-ghee-nankhatai", "name": "Pure Desi Ghee Nankhatai", "price": "Rs 600/kg", "category": "signature", "availability": "Available"},
    {"id": "vanaspati", "slug": "vanaspati-ghee-nankhatai", "name": "Vanaspati Ghee Nankhatai", "price": "Rs 380/kg", "category": "signature", "availability": "Available"},
    {"id": "plate", "slug": "test-plate", "name": "Test Plate", "price": "Rs 120/plate", "category": "summer-specials", "availability": "Available"},
    {"id": "tray", "slug": "dry-fruit-gift-trays", "name": "Dry Fruit Gift Trays", "price": "Rs 1100", "category": "festival-collection", "availability": "Available"},
]


def payload():
    return {
        "idempotency_key": str(uuid.uuid4()),
        "customer": {"name": "Cart Test", "phone": "9876543210", "email": None},
        "fulfilment": {"method": "pickup"},
        "items": [
            {"slug": PRODUCTS[0]["slug"], "pack_grams": 500, "quantity": 1, "expected_unit_price_paise": 60000},
            {"slug": PRODUCTS[1]["slug"], "pack_grams": 500, "quantity": 1, "expected_unit_price_paise": 38000},
            {"slug": PRODUCTS[2]["slug"], "pack_grams": None, "quantity": 2, "expected_unit_price_paise": 12000},
        ],
        "notes": "AUTOMATED TEST - not a customer order",
    }


class PricingTests(unittest.TestCase):
    def test_gallery_only_salad_cannot_be_ordered_from_a_saved_cart(self):
        product = {**PRODUCTS[2], "slug": "fresh-special-salad", "name": "Fresh Special Salad"}
        self.assertFalse(purchase_fields(product)["cart_eligible"])
        body = payload()
        body["items"] = [{**body["items"][2], "slug": product["slug"]}]
        with self.assertRaises(HTTPException) as caught:
            price_order(OrderRequest(**body).items, [product])
        self.assertEqual(caught.exception.detail["code"], "unavailable_items")

    def test_pack_prices_and_distinct_nankhatai(self):
        items, subtotal = price_order(OrderRequest(**payload()).items, PRODUCTS)
        self.assertEqual([p["line_total_paise"] for p in items], [30000, 19000, 24000])
        self.assertEqual(subtotal, 73000)

    def test_fractional_rupees_are_preserved(self):
        product = {**PRODUCTS[0], "price": "Rs 251/kg"}
        body = payload()
        body["items"] = [{**body["items"][0], "quantity": 1, "expected_unit_price_paise": 25100}]
        self.assertEqual(price_order(OrderRequest(**body).items, [product])[1], 12550)

    def test_online_packs(self):
        self.assertEqual(purchase_fields(PRODUCTS[0])["pack_sizes_grams"], [500, 1000])
        for grams, total in [(500, 30000), (1000, 60000)]:
            body = payload()
            body["items"] = [{**body["items"][0], "pack_grams": grams}]
            self.assertEqual(price_order(OrderRequest(**body).items, PRODUCTS)[1], total)
        body = payload()
        body["items"][0]["pack_grams"] = 250
        with self.assertRaises(ValidationError):
            OrderRequest(**body)

    def test_excluded_unknown_and_unavailable_items(self):
        self.assertFalse(purchase_fields(PRODUCTS[3])["cart_eligible"])
        for price in ["Price on request", "Rs 1100 - Rs 2500", "Rs 0/kg", None]:
            self.assertFalse(purchase_fields({**PRODUCTS[0], "price": price})["cart_eligible"])
        for products in [[], [{**p, "availability": "Unavailable"} for p in PRODUCTS]]:
            with self.assertRaises(HTTPException) as caught:
                price_order(OrderRequest(**payload()).items, products)
            self.assertEqual(caught.exception.detail["code"], "unavailable_items")

    def test_stale_or_tampered_price_needs_review(self):
        body = payload()
        body["items"][0]["expected_unit_price_paise"] = 100
        with self.assertRaises(HTTPException) as caught:
            price_order(OrderRequest(**body).items, PRODUCTS)
        self.assertEqual(caught.exception.status_code, 409)
        self.assertEqual(caught.exception.detail["products"][0]["unit_price_paise"], 60000)

    def test_pack_validation(self):
        body = payload()
        body["items"][2]["pack_grams"] = 500
        with self.assertRaises(HTTPException):
            price_order(OrderRequest(**body).items, PRODUCTS)
        for quantity in [0, -1, 100, 1.5, True]:
            body = payload()
            body["items"][0]["quantity"] = quantity
            with self.assertRaises(ValidationError):
                OrderRequest(**body)

    def test_customer_delivery_and_duplicate_validation(self):
        body = payload()
        body["customer"]["phone"] = "+91 9876543210"
        self.assertEqual(OrderRequest(**body).customer.phone, "+919876543210")
        body["fulfilment"] = {"method": "delivery"}
        with self.assertRaises(ValidationError):
            OrderRequest(**body)
        body["fulfilment"].update(address="Test street 19", city="Meerut", pincode="250001")
        self.assertEqual(OrderRequest(**body).fulfilment.method, "delivery")
        body["items"].append(body["items"][0])
        with self.assertRaises(ValidationError):
            OrderRequest(**body)

    def test_smtp_uses_saved_summary_and_correct_recipient(self):
        order = {"id": "test-id", "reference": "PJ-TEST", "customer": {"email": None}, "summary": "Saved exact order summary"}
        with patch.dict(os.environ, {"SMTP_HOST": "smtp.gmail.com", "SMTP_PORT": "465", "SMTP_USERNAME": "sender@example.com", "SMTP_PASSWORD": "test-only", "ORDER_FROM_EMAIL": "sender@example.com", "ORDER_NOTIFICATION_EMAIL": "lakshaypahwa47@gmail.com"}), patch('orders.smtplib.SMTP_SSL') as smtp:
            send_order_email(order)
            connection = smtp.return_value.__enter__.return_value
            message = connection.send_message.call_args.args[0]
            self.assertEqual(str(message["To"]), "lakshaypahwa47@gmail.com")
            self.assertEqual(message.get_content().strip(), order["summary"])
            connection.login.assert_called_once_with("sender@example.com", "test-only")


@unittest.skipUnless(os.getenv("RUN_DB_TESTS") == "1", "Set RUN_DB_TESTS=1 for isolated Mongo integration tests")
class DatabaseTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        load_dotenv(Path(__file__).resolve().parents[1] / '.env')
        self.client = AsyncIOMotorClient(os.environ['MONGO_URL'], serverSelectionTimeoutMS=10000)
        self.test_name = 'pahwa_cart_test_' + uuid.uuid4().hex[:16]
        self.db = self.client[self.test_name]
        self.service = OrderService(self.db)
        await self.service.initialize()
        await self.db.products.insert_many(copy.deepcopy(PRODUCTS))

    async def asyncTearDown(self):
        assert self.test_name.startswith('pahwa_cart_test_') and self.test_name != os.environ['DB_NAME']
        await self.client.drop_database(self.test_name)
        self.client.close()

    async def test_migration_preserves_ids_and_is_idempotent(self):
        self.assertEqual(await migrate_purchase_fields(self.db), 4)
        self.assertEqual(await migrate_purchase_fields(self.db), 0)
        product = await self.db.products.find_one({"id": "ghee"})
        self.assertEqual(product["unit_price_paise"], 60000)
        self.assertEqual(product["price"], "Rs 600/kg")

    async def test_concurrent_submit_and_replay(self):
        body = OrderRequest(**payload())
        first, second = await asyncio.gather(self.service.submit(body, 'unit-test'), self.service.submit(body, 'unit-test'))
        self.assertEqual(first["reference"], second["reference"])
        self.assertEqual(await self.db.orders.count_documents({}), 1)
        await self.db.products.update_one({"id": "ghee"}, {"$set": {"price": "Rs 999/kg"}})
        replay = await self.service.submit(body, 'unit-test')
        self.assertEqual(replay["subtotal_paise"], 73000)
        changed = body.model_copy(update={"notes": "Different order"})
        with self.assertRaises(HTTPException):
            await self.service.submit(changed, 'unit-test')

    async def test_saved_request_has_identical_email_whatsapp_summary(self):
        body = payload()
        body['fulfilment'] = {'method': 'delivery', 'address': 'Test street 19', 'city': 'Meerut', 'pincode': '250001'}
        result = await self.service.submit(OrderRequest(**body), 'unit-test')
        order = await self.db.orders.find_one({'reference': result['reference']})
        self.assertEqual(result['summary'], order_summary(order))
        self.assertEqual(order['subtotal_paise'], 73000)  # Delivery copy never changes totals.
        self.assertIn('Test street 19', result['summary'])
        self.assertNotIn('idempotency_key', result)

    async def test_email_retry_survives_worker_restart(self):
        result = await self.service.submit(OrderRequest(**payload()), 'unit-test')
        with patch('orders.smtp_ready', return_value=True), patch('orders.send_order_email', side_effect=OSError('test SMTP outage')):
            self.assertTrue(await self.service.deliver_one())
        order = await self.db.orders.find_one({'reference': result['reference']})
        self.assertEqual(order['email']['status'], 'retry')
        self.assertEqual(order['email']['attempts'], 1)
        await self.db.orders.update_one({'id': order['id']}, {'$set': {'email.next_attempt_at': datetime.now(timezone.utc) - timedelta(seconds=1)}})
        restarted = OrderService(self.db)
        with patch('orders.smtp_ready', return_value=True), patch('orders.send_order_email') as send:
            self.assertTrue(await restarted.deliver_one())
            self.assertEqual(send.call_args.args[0]['summary'], result['summary'])
            self.assertFalse(await restarted.deliver_one())
        order = await self.db.orders.find_one({'id': order['id']})
        self.assertEqual(order['email']['status'], 'sent')
        with self.assertRaises(HTTPException):
            await restarted.retry_email(order['reference'])

    async def test_missing_smtp_preserves_pending_order(self):
        result = await self.service.submit(OrderRequest(**payload()), 'unit-test')
        with patch('orders.smtp_ready', return_value=False):
            self.assertFalse(await self.service.deliver_one())
        order = await self.db.orders.find_one({'reference': result['reference']})
        self.assertEqual(order['email']['status'], 'pending')
        self.assertEqual(order['email']['attempts'], 0)

    async def test_database_write_failure_can_be_retried_safely(self):
        body = OrderRequest(**payload())
        with patch.object(AsyncIOMotorCollection, 'insert_one', new=AsyncMock(side_effect=AutoReconnect('simulated outage'))):
            with self.assertRaises(AutoReconnect):
                await self.service.submit(body, 'database-outage-test')
        self.assertEqual(await self.db.orders.count_documents({}), 0)
        saved = await self.service.submit(body, 'database-outage-test')
        replay = await self.service.submit(body, 'database-outage-test')
        self.assertEqual(saved['reference'], replay['reference'])
        self.assertEqual(await self.db.orders.count_documents({}), 1)

    async def test_failed_email_can_be_manually_requeued(self):
        saved = await self.service.submit(OrderRequest(**payload()), 'email-failure-test')
        with patch('orders.smtp_ready', return_value=True), patch('orders.send_order_email', side_effect=OSError('simulated outage')):
            for _ in range(5):
                await self.db.orders.update_one({'reference': saved['reference']}, {'$set': {'email.next_attempt_at': datetime.now(timezone.utc) - timedelta(seconds=1)}})
                self.assertTrue(await self.service.deliver_one())
            self.assertFalse(await self.service.deliver_one())
        order = await self.db.orders.find_one({'reference': saved['reference']})
        self.assertEqual(order['email']['status'], 'failed')
        self.assertEqual(order['email']['attempts'], 5)
        retried = await self.service.retry_email(saved['reference'])
        self.assertEqual(retried['email_status'], 'pending')
        with patch('orders.smtp_ready', return_value=True), patch('orders.send_order_email'):
            self.assertTrue(await self.service.deliver_one())

    async def test_expired_email_lease_is_recovered(self):
        result = await self.service.submit(OrderRequest(**payload()), 'unit-test')
        await self.db.orders.update_one({'reference': result['reference']}, {'$set': {'email.status': 'sending', 'email.locked_until': datetime.now(timezone.utc) - timedelta(seconds=1)}})
        with patch('orders.smtp_ready', return_value=True), patch('orders.send_order_email'):
            self.assertTrue(await OrderService(self.db).deliver_one())

    async def test_api_validation_rate_limit_and_body_limit(self):
        app = FastAPI()
        app.add_middleware(OrderBodyLimitMiddleware)
        @app.post('/api/orders', status_code=201)
        async def submit(body: OrderRequest, request: Request):
            return await self.service.submit(body, request.client.host)
        async with AsyncClient(transport=ASGITransport(app=app), base_url='http://test') as http:
            invalid = payload()
            invalid['customer']['phone'] = '123'
            self.assertEqual((await http.post('/api/orders', json=invalid)).status_code, 422)
            self.assertEqual((await http.post('/api/orders', content=b'x' * 32769)).status_code, 413)
            first = payload()
            response = await http.post('/api/orders', json=first)
            self.assertEqual(response.status_code, 201)
            for _ in range(9):
                self.assertEqual((await http.post('/api/orders', json=payload())).status_code, 201)
            self.assertEqual((await http.post('/api/orders', json=payload())).status_code, 429)
            self.assertEqual((await http.post('/api/orders', json=first)).status_code, 201)
