"""One-time, transactional catalogue migrations for Vercel production builds.

prepare is read-only; apply runs only after pages built successfully. Neither
mode reads customers, orders, authentication records or enquiries.
"""
import asyncio
import hashlib
import json
import os
import re
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DERIVED = {'unit_price_paise', 'sale_unit', 'cart_eligible', 'pack_sizes_grams'}


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':'), default=str).encode()).hexdigest()


def load_migrations(folder=ROOT / 'catalogue-migrations'):
    result = []
    for path in sorted(folder.glob('*.json')):
        data = json.loads(path.read_text(encoding='utf-8'))
        if set(data) != {'updates', 'new_products'}:
            raise ValueError(f'{path.name}: expected updates and new_products only')
        if not isinstance(data['updates'], list) or not isinstance(data['new_products'], list):
            raise ValueError(f'{path.name}: product lists required')
        slugs = []
        for item in data['updates']:
            if set(item) != {'slug', 'fields'} or not isinstance(item['fields'], dict) or not item['fields']:
                raise ValueError(f'{path.name}: invalid update')
            slugs.append(item['slug'])
        slugs.extend(item['slug'] for item in data['new_products'])
        if any(not isinstance(s, str) or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', s) for s in slugs) or len(slugs) != len(set(slugs)):
            raise ValueError(f'{path.name}: invalid or repeated slug')
        result.append({'id': path.stem, 'checksum': digest(data), **data})
    return result


def pending_migrations(migrations, applied):
    known = {m['id']: m for m in migrations}
    for entry in applied:
        if entry['_id'] not in known or known[entry['_id']]['checksum'] != entry['checksum']:
            raise ValueError('An applied migration was changed or removed. Restore it and add a new migration instead.')
    done = {entry['_id'] for entry in applied}
    return [m for m in migrations if m['id'] not in done]


def project_catalogue(products, migrations):
    from server import Product, ProductIn
    from orders import purchasable_product
    by_slug = {p['slug']: dict(p) for p in products}
    if len(by_slug) != len(products):
        raise ValueError('Duplicate product slugs in database')
    for migration in migrations:
        for update in migration['updates']:
            slug, fields = update['slug'], update['fields']
            if slug not in by_slug:
                raise ValueError(f'Migration targets missing product: {slug}')
            if set(fields) - (set(ProductIn.model_fields) - {'slug'}):
                raise ValueError(f'Unsupported update fields: {slug}')
            merged = {**by_slug[slug], **fields}
            ProductIn.model_validate({k: v for k, v in merged.items() if k in ProductIn.model_fields})
            by_slug[slug] = merged
        for item in migration['new_products']:
            slug = item['slug']
            if slug in by_slug:
                raise ValueError(f'New product already exists: {slug}; use an update migration')
            ProductIn.model_validate({k: v for k, v in item.items() if k != 'id'})
            # Stable ID in the prepared HTML and database, including retries.
            by_slug[slug] = Product(**{**item, 'id': str(uuid.uuid5(uuid.NAMESPACE_URL, 'https://pahwajee.in/products/' + slug))}).model_dump()
    # Explicit public field list: do not serialize arbitrary database fields.
    return [purchasable_product({k: v for k, v in p.items() if k in Product.model_fields}) for p in by_slug.values()]


def catalogue_fingerprint(products):
    return digest(sorted(products, key=lambda p: p['slug']))


async def release(mode):
    if not (os.getenv('VERCEL') == '1' and os.getenv('VERCEL_ENV') == 'production' and os.getenv('VERCEL_GIT_COMMIT_REF') == 'main'):
        raise RuntimeError('Catalogue release is restricted to Vercel production main builds')
    from server import client, db
    output = Path(os.environ['RELEASE_DATA_FILE'])
    migrations = load_migrations()
    try:
        if mode == 'prepare':
            products = await db.products.find({}, {'_id': 0}).to_list(length=None)
            applied = await db.catalogue_migrations.find({}, {'_id': 1, 'checksum': 1}).to_list(length=None)
            pending = pending_migrations(migrations, applied)
            public = project_catalogue(products, pending)
            faqs = await db.faqs.find({}, {'_id': 0, 'id': 1, 'question': 1, 'answer': 1, 'order': 1}).sort('order', 1).to_list(length=100)
            output.write_text(json.dumps({'products': public, 'faqs': faqs, 'release': {
                'fingerprint': catalogue_fingerprint(products),
                'migrations': [{'id': m['id'], 'checksum': m['checksum']} for m in pending],
            }}), encoding='utf-8')
            print(f'Release prepared: {len(public)} products, {len(pending)} pending migrations. No database writes.')
            return
        prepared = json.loads(output.read_text(encoding='utf-8'))['release']

        async def apply(session):
            # All builds touch one document so overlapping release transactions conflict/retry.
            await db.catalogue_release_state.update_one({'_id': 'production'}, {'$inc': {'revision': 1}}, upsert=True, session=session)
            applied = await db.catalogue_migrations.find({}, {'_id': 1, 'checksum': 1}, session=session).to_list(length=None)
            pending = pending_migrations(migrations, applied)
            if [{'id': m['id'], 'checksum': m['checksum']} for m in pending] != prepared['migrations']:
                raise RuntimeError('Another release changed the migration state during this build; rebuild required')
            products = await db.products.find({}, session=session).to_list(length=None)
            before = [{k: v for k, v in p.items() if k != '_id'} for p in products]
            if catalogue_fingerprint(before) != prepared['fingerprint']:
                raise RuntimeError('Catalogue changed during this build; rebuild to preserve the latest edits')
            final = {p['slug']: p for p in project_catalogue(before, pending)}
            for migration in pending:
                touched = {p['slug'] for p in migration['updates'] + migration['new_products']}
                # Backup and migration receipt commit atomically with product edits.
                await db.catalogue_migrations.insert_one({
                    '_id': migration['id'], 'checksum': migration['checksum'],
                    'applied_at': datetime.now(timezone.utc), 'commit': os.getenv('VERCEL_GIT_COMMIT_SHA'),
                    'backup': [p for p in products if p['slug'] in touched],
                    'inserted_slugs': [p['slug'] for p in migration['new_products']],
                }, session=session)
                for update in migration['updates']:
                    slug = update['slug']
                    fields = {k: final[slug][k] for k in set(update['fields']) | DERIVED}
                    await db.products.update_one({'slug': slug}, {'$set': fields}, session=session)
                for item in migration['new_products']:
                    await db.products.insert_one(final[item['slug']], session=session)
            return len(pending)

        async with await client.start_session() as session:
            count = await session.with_transaction(apply)
        print(f'Release catalogue ready: {count} migrations committed with backups. Already applied migrations were skipped.')
    finally:
        client.close()


if __name__ == '__main__':
    if len(sys.argv) != 2 or sys.argv[1] not in ('prepare', 'apply'):
        raise SystemExit('Usage: release_catalogue.py prepare|apply')
    try:
        asyncio.run(release(sys.argv[1]))
    except Exception as exc:
        # Database exceptions can contain infrastructure URLs; omit their text.
        print(f'Catalogue release failed ({type(exc).__name__}). No partial transaction was committed.', file=sys.stderr)
        if isinstance(exc, (ValueError, RuntimeError)):
            print(str(exc), file=sys.stderr)
        raise SystemExit(1)
