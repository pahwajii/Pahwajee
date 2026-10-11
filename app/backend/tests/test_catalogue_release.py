import json
import os
from pathlib import Path
import sys
import tempfile
import unittest

# Import models without production credentials; these tests never connect to MongoDB.
os.environ['MONGO_URL'] = 'mongodb://127.0.0.1:27017'
os.environ['DB_NAME'] = 'release_unit_tests'
os.environ['JWT_SECRET'] = 'release-unit-test-only'
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from release_catalogue import load_migrations, pending_migrations, project_catalogue, catalogue_fingerprint

PRODUCT = {'id': 'existing-id', 'slug': 'khasta-rewri', 'name': 'Khasta Rewri', 'category': 'signature', 'price': 'Rs 540/kg', 'availability': 'Available', 'description': 'Admin-edited description'}

def migration(updates=None, new=None):
    return {'id': '0002', 'checksum': 'abc', 'updates': updates or [], 'new_products': new or []}

class CatalogueReleaseTests(unittest.TestCase):
    def test_applied_migration_is_not_replayed(self):
        self.assertEqual(pending_migrations([migration()], [{'_id': '0002', 'checksum': 'abc'}]), [])

    def test_changed_or_removed_applied_migration_fails(self):
        with self.assertRaises(ValueError):
            pending_migrations([migration()], [{'_id': '0002', 'checksum': 'changed'}])
        with self.assertRaises(ValueError):
            pending_migrations([], [{'_id': '0002', 'checksum': 'abc'}])

    def test_price_update_preserves_admin_fields_and_id(self):
        result = project_catalogue([PRODUCT], [migration([{'slug': 'khasta-rewri', 'fields': {'price': 'Rs 600/kg'}}])])[0]
        self.assertEqual(result['price'], 'Rs 600/kg')
        self.assertEqual(result['unit_price_paise'], 60000)
        self.assertEqual(result['description'], PRODUCT['description'])
        self.assertEqual(result['id'], 'existing-id')
        self.assertEqual(PRODUCT['price'], 'Rs 540/kg')

    def test_new_products_have_stable_ids_and_1kg_box_rules(self):
        item = {'slug': 'pahwa-signature-mithai-box', 'name': 'Signature Mithai Box', 'category': 'festival-collection', 'price': 'Rs 750/kg'}
        a = project_catalogue([], [migration(new=[item])])[0]
        b = project_catalogue([], [migration(new=[item])])[0]
        self.assertEqual(a['id'], b['id'])
        self.assertEqual(a['pack_sizes_grams'], [1000])
        self.assertEqual(a['unit_price_paise'], 75000)
        self.assertTrue(a['cart_eligible'])

    def test_missing_duplicate_and_unsafe_changes_fail(self):
        with self.assertRaises(ValueError):
            project_catalogue([], [migration([{'slug': 'missing', 'fields': {'price': 'Rs 700/kg'}}])])
        with self.assertRaises(ValueError):
            project_catalogue([PRODUCT], [migration(new=[PRODUCT])])
        for field in ('slug', 'id', '$set', 'cart_eligible'):
            with self.assertRaises(ValueError):
                project_catalogue([PRODUCT], [migration([{'slug': 'khasta-rewri', 'fields': {field: 'bad'}}])])

    def test_private_fields_never_enter_prerender(self):
        result = project_catalogue([{**PRODUCT, 'internal_note': 'private', '_id': 'database-id'}], [])[0]
        self.assertNotIn('internal_note', result)
        self.assertNotIn('_id', result)

    def test_admin_edit_changes_build_fingerprint(self):
        self.assertNotEqual(catalogue_fingerprint([PRODUCT]), catalogue_fingerprint([{**PRODUCT, 'availability': 'Currently unavailable'}]))

    def test_manifest_rejects_duplicate_slugs(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / '0001.json'
            path.write_text(json.dumps({'updates': [{'slug': 'khasta-rewri', 'fields': {'price': 'Rs 600/kg'}}], 'new_products': [PRODUCT]}))
            with self.assertRaises(ValueError):
                load_migrations(Path(folder))

    def test_ordered_migrations_compose(self):
        result = project_catalogue([PRODUCT], [migration([{'slug': 'khasta-rewri', 'fields': {'price': 'Rs 600/kg'}}]), migration([{'slug': 'khasta-rewri', 'fields': {'price': 'Rs 620/kg', 'availability': 'Currently unavailable'}}])])[0]
        self.assertEqual(result['unit_price_paise'], 62000)
        self.assertEqual(result['availability'], 'Currently unavailable')

if __name__ == '__main__':
    unittest.main()
