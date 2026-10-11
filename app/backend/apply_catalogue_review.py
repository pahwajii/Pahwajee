"""Apply the owner-reviewed catalogue changes without replacing unrelated data.

Dry run: python apply_catalogue_review.py
Apply once: python apply_catalogue_review.py --apply --backup <outside-repo.json>
"""
import argparse
import asyncio
import json
from pathlib import Path
from bson import json_util
from server import Product, client, db
from orders import purchasable_product

DEFAULT_REVIEW = Path(__file__).resolve().parents[1] / 'catalogue-review-2026-10.json'

async def main(args):
    try:
        REVIEW = json.loads(Path(args.review_file).read_text(encoding='utf-8'))
        slugs = [p['slug'] for p in REVIEW['updates'] + REVIEW['new_products']]
        existing = await db.products.find({'slug': {'$in': slugs}}).to_list(length=500)
        by_slug = {p['slug']: p for p in existing}
        missing = [p['slug'] for p in REVIEW['updates'] if p['slug'] not in by_slug]
        if missing: raise RuntimeError(f'Review targets missing: {missing}')
        print(f"Review: {len(REVIEW['updates'])} existing products, {len(REVIEW['new_products'])} additions")
        if not args.apply:
            print('Dry run only. No database writes.'); return
        backup = Path(args.backup)
        with backup.open('x', encoding='utf-8') as f:
            f.write(json_util.dumps(existing, indent=2))
        for item in REVIEW['updates']:
            fields = item['fields']
            merged = purchasable_product({**by_slug[item['slug']], **fields})
            derived = {key: merged[key] for key in ('unit_price_paise','sale_unit','cart_eligible','pack_sizes_grams')}
            await db.products.update_one({'slug':item['slug']}, {'$set':{**fields, **derived}})
        for item in REVIEW['new_products']:
            # Never overwrite later admin edits when re-running this migration.
            data = purchasable_product(Product(**item).model_dump())
            await db.products.update_one({'slug':item['slug']}, {'$setOnInsert':data}, upsert=True)
        print('Owner-reviewed catalogue applied. Product backup saved outside the repository.')
    finally:
        client.close()

if __name__ == '__main__':
    parser=argparse.ArgumentParser(); parser.add_argument('--apply',action='store_true'); parser.add_argument('--backup'); parser.add_argument('--review-file', default=str(DEFAULT_REVIEW))
    args=parser.parse_args()
    if args.apply and not args.backup: parser.error('--apply requires --backup')
    asyncio.run(main(args))
