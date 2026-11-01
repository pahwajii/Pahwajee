"""Create and verify required MongoDB indexes before production promotion."""
import asyncio
import os
import sys

# Keep the same key order/options as the original runtime initialization.
INDEX_SPECS = {
    "users": [([("email", 1)], {"unique": True})],
    "products": [([("slug", 1)], {"unique": True})],
    "categories": [([("slug", 1)], {"unique": True})],
    "orders": [
        ([("idempotency_key", 1)], {"unique": True}),
        ([("reference", 1)], {"unique": True}),
        ([("email.status", 1), ("email.next_attempt_at", 1)], {}),
    ],
    "order_rate_limits": [([("expires_at", 1)], {"expireAfterSeconds": 0})],
    "inquiries": [
        ([("idempotency_key", 1)], {"unique": True, "sparse": True}),
        ([("reference", 1)], {"unique": True, "sparse": True}),
        ([("notification.status", 1), ("notification.next_attempt_at", 1)], {}),
    ],
    "inquiry_rate_limits": [([("expires_at", 1)], {"expireAfterSeconds": 0})],
}


async def ensure_collection_indexes(db, name):
    collection = db[name]
    created = []
    for keys, options in INDEX_SPECS[name]:
        index_name = await collection.create_index(keys, **options)
        created.append((index_name, keys, options))
    actual = await collection.index_information()
    for index_name, keys, options in created:
        definition = actual.get(index_name, {})
        if list(definition.get("key", [])) != keys:
            raise RuntimeError(f"Required index missing or incorrect: {name}.{index_name}")
        for option in ("unique", "sparse"):
            if bool(definition.get(option, False)) != bool(options.get(option, False)):
                raise RuntimeError(f"Required {option} option incorrect: {name}.{index_name}")
        if definition.get("expireAfterSeconds") != options.get("expireAfterSeconds"):
            raise RuntimeError(f"Required expiry option incorrect: {name}.{index_name}")


async def ensure_required_indexes(db):
    # Existing indexes are reused. Incompatible indexes fail; never drop or
    # weaken uniqueness/expiry constraints to make a deployment pass.
    await asyncio.gather(*(ensure_collection_indexes(db, name) for name in INDEX_SPECS))


async def main():
    if not (os.getenv("VERCEL") == "1" and os.getenv("VERCEL_ENV") == "production" and os.getenv("VERCEL_GIT_COMMIT_REF") == "main"):
        raise RuntimeError("Index setup is restricted to Vercel production main builds")
    from server import client, db
    try:
        await ensure_required_indexes(db)
        print("Verified 11 required database indexes (including unique and TTL constraints).")
    finally:
        client.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as error:
        # Database errors may include infrastructure URLs; do not expose them.
        print(f"Database index setup failed ({type(error).__name__}). Deployment stopped.", file=sys.stderr)
        if isinstance(error, RuntimeError):
            print(str(error), file=sys.stderr)
        raise SystemExit(1)
