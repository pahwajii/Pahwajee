"""Serverless behavior without real SMTP sends or production database writes."""
import os
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

import server
from orders import OrderService
from test_orders import payload


class VercelTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.service = SimpleNamespace(
            submit=AsyncMock(return_value={"reference": "PJ-SAVED"}),
            deliver_saved_order=AsyncMock(return_value=False),
            drain_outbox=AsyncMock(return_value={"processed": 1}),
        )
        self.patcher = patch.object(server, "order_service", self.service)
        self.patcher.start()
        app = FastAPI()
        app.include_router(server.api_router)
        self.http = AsyncClient(transport=ASGITransport(app=app), base_url="https://test")

    async def asyncTearDown(self):
        await self.http.aclose()
        self.patcher.stop()

    async def test_vercel_delivers_only_after_order_is_saved(self):
        with patch.object(server, "IS_VERCEL", True):
            response = await self.http.post("/api/orders", json=payload(), headers={"x-vercel-forwarded-for": "203.0.113.8"})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["reference"], "PJ-SAVED")
        self.assertEqual(response.headers["cache-control"], "no-store")
        self.service.deliver_saved_order.assert_awaited_once_with("PJ-SAVED")
        self.assertEqual(self.service.submit.call_args.args[1], "203.0.113.8")

    async def test_local_requests_do_not_trust_forwarded_ip_or_deliver_inline(self):
        with patch.object(server, "IS_VERCEL", False):
            response = await self.http.post("/api/orders", json=payload(), headers={"x-vercel-forwarded-for": "203.0.113.8"})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(self.service.submit.call_args.args[1], "127.0.0.1")
        self.service.deliver_saved_order.assert_not_awaited()

    async def test_cron_requires_secret_and_disables_caching(self):
        with patch.dict(os.environ, {"CRON_SECRET": "test-only-secret"}):
            for headers in ({}, {"Authorization": "Bearer wrong"}):
                response = await self.http.get("/api/internal/order-email-retry", headers=headers)
                self.assertEqual(response.status_code, 401)
            self.service.drain_outbox.assert_not_awaited()
            response = await self.http.get("/api/internal/order-email-retry", headers={"Authorization": "Bearer test-only-secret"})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.headers["cache-control"], "no-store")
        with patch.dict(os.environ, {"CRON_SECRET": ""}):
            response = await self.http.get("/api/internal/order-email-retry", headers={"Authorization": "Bearer "})
            self.assertEqual(response.status_code, 401)

    async def test_outbox_failure_does_not_fail_saved_order(self):
        service = OrderService(None)
        with patch.object(service, "deliver_one", new=AsyncMock(side_effect=RuntimeError("simulated database outage"))):
            self.assertFalse(await service.deliver_saved_order("PJ-SAVED"))

    async def test_drain_is_bounded(self):
        service = OrderService(None)
        with patch.object(service, "deliver_one", new=AsyncMock(return_value=True)) as deliver:
            result = await service.drain_outbox(limit=3)
        self.assertEqual(result["processed"], 3)
        self.assertEqual(deliver.await_count, 3)
