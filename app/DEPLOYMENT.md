# Automatic GitHub releases

Pushing `main` in `pahwajii/Pahwajee` starts Vercel production deployment to https://pahwajee.in. Other branches create previews. Project root: `app`. The build command comes from `app/vercel.json`.

The release runs focused cart/catalogue tests, compiles the frontend, reads the public catalogue and applies pending migrations in memory, then prerenders all product pages and the sitemap. Only after these checks pass does it commit the database changes in a MongoDB transaction. Vercel then finishes packaging and promotes the deployment.

## Product/database edits

For every database product change, add a **new**, uniquely ordered JSON file in `app/catalogue-migrations/` in the same commit as the UI/snapshot/assets. Do not edit an already released migration. Example:

```json
{
  "updates": [{"slug": "khasta-rewri", "fields": {"price": "Rs 540/kg"}}],
  "new_products": []
}
```

New products use `ProductIn` fields from `backend/server.py`, including `name`, `slug`, `category`, price, image and availability. The release calculates purchase fields using the same backend code as checkout. Renaming/removing products or other collections needs a separately reviewed migration; this runner intentionally handles catalogue additions and field edits only. Update `frontend/src/generated/catalog.json` too, for local/branch previews. Production prerender reads the database plus pending migrations, so later admin edits survive.

Each migration runs once. The `catalogue_migrations` MongoDB collection records its checksum, commit and affected product backups. Retries skip completed migrations; changing/deleting a released migration stops the build. An admin edit or competing release during the build stops it instead of publishing stale prices. Pending product writes and receipts commit together or roll back together.

The initial empty migration records automation activation; the October catalogue was already released manually. Historical review JSON files are retained for reference and are **not** reapplied automatically.

## Configuration

Vercel production environment needs existing `MONGO_URL`, `DB_NAME` and `JWT_SECRET`. Keep all credentials in Vercel, never Git or `VITE_*`. Production branch must be `main`, with system environment variables enabled. Preview/local builds cannot run database release writes. Tracked images deploy with the code; untracked files do not.

## Verification and recovery

After pushing, check that the Git-triggered deployment reaches Ready. Verify `/api/products`, the changed product page, and `/sitemap.xml` on the real domain. A push is not live until that build succeeds.

Catalogue updates happen at the end of the build, before Vercel promotes it. A later packaging/platform failure can leave the updated catalogue with the preceding frontend. Keep migrations compatible with the preceding release. Retry the deployment; do not roll the database back automatically or erase customer/admin changes. For a price correction, add a new forward migration. Vercel code rollback alone does not roll back database data.
