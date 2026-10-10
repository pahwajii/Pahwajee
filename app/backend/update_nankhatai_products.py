"""Apply the two Nankhatai varieties without replacing other catalogue data."""
import asyncio

from server import Product, SEED_PRODUCTS, client, db


async def main():
    try:
        # Keep the existing product ID when correcting the variety's name.
        await db.products.update_one(
            {"slug": "dalda-nankhatai"},
            {"$set": {
                "slug": "vanaspati-ghee-nankhatai",
                "name": "Vanaspati Ghee Nankhatai",
                "description": "Traditional Nankhatai prepared with Vanaspati Ghee.",
            }},
        )
        for slug in ("pure-desi-ghee-nankhatai", "vanaspati-ghee-nankhatai"):
            seed = next(item for item in SEED_PRODUCTS if item["slug"] == slug)
            product = Product(**seed).model_dump()
            price = product.pop("price")
            await db.products.update_one(
                {"slug": slug},
                {"$set": {"price": price}, "$setOnInsert": product},
                upsert=True,
            )
            print(f"Updated {seed['name']}: {price}")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
