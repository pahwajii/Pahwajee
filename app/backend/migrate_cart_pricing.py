"""Backfill numeric purchase fields without replacing products or their IDs."""
import asyncio
from server import client, db
from orders import migrate_purchase_fields


async def main():
    try:
        print(f"Updated {await migrate_purchase_fields(db)} products")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(main())
