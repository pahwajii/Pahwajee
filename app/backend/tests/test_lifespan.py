"""Ensure the real FastAPI lifespan owns startup, worker and cleanup."""
import asyncio
import unittest
from contextlib import ExitStack
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import server


class LifespanTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.patches = ExitStack()
        self.client = self.patches.enter_context(patch.object(server, "client", MagicMock()))
        self.db = SimpleNamespace(**{
            name: SimpleNamespace(create_index=AsyncMock())
            for name in ("users", "products", "categories")
        })
        self.patches.enter_context(patch.object(server, "db", self.db))
        self.started = asyncio.Event()
        self.stopped = asyncio.Event()

        async def worker():
            self.started.set()
            try:
                await asyncio.Event().wait()
            finally:
                self.stopped.set()

        self.service = SimpleNamespace(initialize=AsyncMock(), worker=AsyncMock(side_effect=worker))
        self.patches.enter_context(patch.object(server, "order_service", self.service))
        self.seeds = [self.patches.enter_context(patch.object(server, name, AsyncMock()))
                      for name in ("seed_admin", "seed_data", "migrate_purchase_fields")]
        server.app.state.order_email_task = None

    async def asyncTearDown(self):
        self.patches.close()

    async def test_local_lifespan_initializes_and_stops_worker(self):
        with patch.object(server, "IS_VERCEL", False):
            async with server.app.router.lifespan_context(server.app):
                await asyncio.wait_for(self.started.wait(), timeout=1)
                self.service.initialize.assert_awaited_once()
                for seed in self.seeds:
                    seed.assert_awaited_once()
                self.client.close.assert_not_called()
            self.assertTrue(self.stopped.is_set())
            self.assertIsNone(server.app.state.order_email_task)
            self.client.close.assert_called_once()

    async def test_vercel_lifespan_preserves_data_and_skips_infinite_worker(self):
        with patch.object(server, "IS_VERCEL", True):
            async with server.app.router.lifespan_context(server.app):
                self.service.initialize.assert_awaited_once()
                for seed in self.seeds:
                    seed.assert_not_awaited()
                self.service.worker.assert_not_called()
            self.client.close.assert_called_once()

    async def test_startup_failure_still_closes_database(self):
        self.db.users.create_index.side_effect = RuntimeError("simulated startup failure")
        with self.assertRaisesRegex(RuntimeError, "simulated startup failure"):
            async with server.app.router.lifespan_context(server.app):
                self.fail("A failed startup must not serve requests")
        self.client.close.assert_called_once()
        self.service.worker.assert_not_called()
