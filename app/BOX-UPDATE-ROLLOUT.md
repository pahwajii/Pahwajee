# Prepared locally: 1 kg boxes and custom enquiries

Do not publish until the owner requests the batch release. No production database changes were made during development.

- Priority best sellers: Khasta Rewri, Gol Gazak, Dilkhush Gazak, Pure Desi Ghee Nankhatai (in that order). All best sellers are grouped before regular products.
- Three fixed 1 kg boxes: Signature Rs 750, Winter Rs 750, Mixed Fruit Rs 700.
- Custom boxes: four 250 g sections, repeats allowed; sum each section at its individual kg rate. No packaging charge. Custom boxes are WhatsApp enquiries, not cart lines.
- New individual products: Strawberry Bite Rs 700/kg, Kachha Aam Bite Rs 700/kg, Khajoor Barfi Rs 800/kg. Existing Khajoor Laddoo remains Rs 900/kg.
- Strawberry Bite, Kachha Aam Bite and Khajoor Barfi use separate illustrative product photos matching the Mango Bite style. The original box photos remain in the gallery.
- Gajar Ka Halwa and Mawa Malai Gajar Barfi are currently unavailable; retain their pages and prices, block cart/custom-box ordering, and show OutOfStock in product schema.

## Release when authorized

1. From app/backend, inspect the targeted migration with `python apply_catalogue_review.py --review-file ../box-catalogue-update-2026-10.json` (read-only dry run).
2. Apply it using the same review file plus `--apply --backup <new-outside-repo-backup.json>`. It updates box prices/descriptions/purchase fields, groups Mixed Fruit with gift boxes, applies best-seller flags/order, marks Gajar Ka Halwa and Mawa Malai Gajar Barfi currently unavailable, and inserts missing new sweets, preserving later admin edits to existing new-product records.
3. Push the approved commits and deploy a clean tracked archive. Use `PRERENDER_CATALOG_SNAPSHOT=1` for the first deployment so the three boxes have correct purchase fields in their initial HTML even while the old API is still serving.
4. Verify all three boxes accept only 1 kg in the new API, the 36 product pages load, and the custom enquiry totals agree with the individual prices. Do not send a test order or WhatsApp message.

Local preview can serve products from frontend/src/generated/catalog.json through a read-only fixture on port 5000. Do not run a production-connected backend for preview.
