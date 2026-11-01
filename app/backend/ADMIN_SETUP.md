# Shop administration

Open `/admin/login` on the storefront, then choose **Products**. Sign in with the
existing shop admin account. Credentials stay on the server. There is no public
registration or browser password-reset flow.

Local startup provisions the account from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
Vercel deliberately skips account and catalogue seeding: the account must already
exist in MongoDB. Setting those variables alone does not create a production user.

Restart the backend after adding these routes. Serve the frontend and API on the
same site, with `/api` proxied to FastAPI. Production requires HTTPS and secure
cookies (`COOKIE_SECURE=true`, or automatically on Vercel). Configure
`CORS_ORIGINS` with the actual storefront origin when needed. Keep `JWT_SECRET`
private and stable across restarts.

## Controls

- Overview: counts of products, unavailable products, open orders, and new
  enquiries; the five latest order requests.
- Products: add/edit names, descriptions, categories, price text, photos,
  availability, display order, season, tags, and highlights.
  Search, filters, and pagination use the current catalogue API limit of 500
  products. Change availability directly in a product row and press **Save**, or
  use the full editor. Set `Sold out`, `Unavailable`, or `Special order only` to
  stop online ordering without deleting the product. A conflicting availability
  change in another session is rejected and the list refreshes.
- Orders: search/filter requests; inspect saved prices, customer details,
  pickup/delivery details, and notification email state. Progress is New request
  → Confirmed → Preparing → Ready → Completed. Any unfinished order can be
  cancelled with confirmation. Final statuses cannot be reopened. Changes record
  the admin ID and time.
- Enquiries: search/filter contact and corporate gifting requests; mark New,
  Contacted, or Closed; save internal notes. Older records count as New.

Order/enquiry edits do not send customer messages or alter saved order prices.
Internal notes are available only through authenticated admin endpoints.
Updates check the previously loaded status and reject stale status changes.
Use `Rs 600/kg`, `Rs 120/plate`, or `Rs 100/piece` for product prices. Weight-based
online orders remain limited to 500g and 1kg. Gift hampers and trays retain their
existing enquiry-only behavior.

## Adding a product or photo

1. Choose **Add product**, then enter its name, existing category, and price.
2. Add a description and choose a JPEG, PNG, or WebP photo up to 3 MB. Images
   larger than 24 megapixels must be resized first. An existing HTTPS image link
   or site image path can also be used.
3. Choose availability and press **Save product**. Use the storefront link to
   check the saved product.

For **Dry Fruit Gift Trays**, use **Hamper designs** to replace a particular
design's photo or name. Design links keep the same stable ID when its photo
changes. The **Collection cover photo** controls the overall product cover and
does not replace or remove an individual design. The existing seven designs are
preserved; the editor does not merge, remove, or reorder them.

Uploads are resized to at most 1600 pixels, converted to WebP, stripped of camera
metadata, and stored in MongoDB's `product_images` collection. They survive
server restarts and deployments; no file bucket credentials are required. Include
this collection in database backups. Identical photos share an immutable URL;
replacing a photo creates a new URL. Unused uploads are retained, so storage usage
should be monitored as the catalogue grows.

Product changes are read from the live API when shoppers open a page, navigate,
or return to the tab. Successful responses are reused for 15 seconds; background
refreshes keep the page visible. Saving in admin also refreshes open storefront
tabs in the same browser. Saving does not require a rebuild. Initial ordering
waits for current availability, and checkout validates it again on the server.
A failed refresh retains the last loaded catalogue but disables ordering until
it recovers; requests time out with a retry action after 8 seconds.

The site's initial HTML, sitemap, curated homepage sections, and custom pack
rules still come from the build. New products have working detail URLs and appear
in the live shop immediately; their sitemap entries appear on the next deployment.
Use the admin for routine product changes. Code migrations are reserved for
deliberate releases, such as new page layouts or pack rules.

Access uses HttpOnly cookies, refreshed while the admin is working. All admin
endpoints check the admin role. Logout clears cookies; expired sessions return
to login. Admin pages request no search indexing.

## Validation

Run `python -m unittest discover -s tests -v` from `app/backend` and `npm run build`
from `app/frontend`, plus `node --test src/lib/*.test.js`. `tests/test_admin.py` exercises real API routes with isolated
database doubles, including unauthorized access, authentication cookies, price
derivation, product validation, status transitions, and stale updates.
`tests/test_product_images.py` checks upload permissions, size/type limits,
orientation, metadata removal, persistence calls, and public image retrieval.
