"""Index provisioning is repeatable and never silently weakens constraints."""
import copy
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock

from ensure_indexes import INDEX_SPECS, ensure_required_indexes


class IndexTests(unittest.IsolatedAsyncioTestCase):
    def database(self):
        result = {}
        for collection, specs in INDEX_SPECS.items():
            indexes = {
                "_".join(f"{key}_{direction}" for key, direction in keys): {"key": keys, **options}
                for keys, options in specs
            }
            result[collection] = SimpleNamespace(
                create_index=AsyncMock(side_effect=lambda keys, **opts: "_".join(f"{key}_{direction}" for key, direction in keys)),
                index_information=AsyncMock(return_value=copy.deepcopy(indexes)),
            )
        return result

    async def test_all_constraints_are_verified_and_repeated_setup_is_safe(self):
        db = self.database()
        await ensure_required_indexes(db)
        await ensure_required_indexes(db)
        self.assertEqual(sum(c.create_index.await_count for c in db.values()), 22)
        self.assertEqual(sum(c.index_information.await_count for c in db.values()), 14)
        db['order_rate_limits'].create_index.assert_awaited_with([('expires_at', 1)], expireAfterSeconds=0)
        db['inquiries'].create_index.assert_any_await([('reference', 1)], unique=True, sparse=True)

    async def test_missing_unique_sparse_or_ttl_constraint_stops_release(self):
        for collection, index, option in [
            ('products', 'slug_1', 'unique'),
            ('inquiries', 'reference_1', 'sparse'),
            ('order_rate_limits', 'expires_at_1', 'expireAfterSeconds'),
        ]:
            with self.subTest(option=option):
                db = self.database()
                db[collection].index_information.return_value[index].pop(option)
                with self.assertRaises(RuntimeError):
                    await ensure_required_indexes(db)

    async def test_wrong_index_keys_and_database_setup_errors_stop_release(self):
        db = self.database()
        db['products'].index_information.return_value['slug_1']['key'] = [('name', 1)]
        with self.assertRaises(RuntimeError):
            await ensure_required_indexes(db)
        db = self.database()
        db['users'].create_index.side_effect = RuntimeError('index options conflict')
        with self.assertRaisesRegex(RuntimeError, 'index options conflict'):
            await ensure_required_indexes(db)


if __name__ == '__main__':
    unittest.main()
