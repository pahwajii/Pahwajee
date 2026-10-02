import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(r"d:\Pahwajee\app\backend")
load_dotenv(ROOT_DIR / '.env')

from server import SEED_PRODUCTS, Product

async def main():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]

    print("Clearing existing products...")
    await db.products.delete_many({})

    docs = [Product(**p).model_dump() for p in SEED_PRODUCTS]
    await db.products.insert_many(docs)
    print(f"Successfully seeded {len(docs)} products into MongoDB Atlas database!")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
