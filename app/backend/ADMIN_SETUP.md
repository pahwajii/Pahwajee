# Shop administration

Open `/admin/login` on the storefront. The initial admin account uses the existing
`ADMIN_EMAIL` and `ADMIN_PASSWORD` in the backend environment. Credentials stay on
the server. There is no public registration or browser password-reset flow.

Restart the backend after adding these routes. Serve the frontend and API on the
same site, with `/api` proxied to FastAPI. Production requires HTTPS and secure
cookies (`COOKIE_SECURE=true`, or automatically on Vercel). Configure
`CORS_ORIGINS` with the actual storefront origin when needed. Keep `JWT_SECRET`
private and stable across restarts.

## Controls

- Overview: counts of products, unavailable products, open orders, and new
  enquiries; the five latest order requests.
- Products: add/edit names, descriptions, categories, price text, image paths or
  HTTPS image URLs, availability, display order, season, tags, and highlights.
  Search, filters, and pagination use the current catalogue API limit of 500
  products. Photo file uploads are not part of this version. Set `Sold out` or
  `Unavailable` to stop ordering an item without deleting it.
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

Access uses HttpOnly cookies, refreshed while the admin is working. All admin
endpoints check the admin role. Logout clears cookies; expired sessions return
to login. Admin pages request no search indexing.

## Validation

Run `python -m unittest discover -s tests -v` from `app/backend` and `npm run build`
from `app/frontend`. `tests/test_admin.py` exercises real API routes with isolated
database doubles, including unauthorized access, authentication cookies, price
derivation, product validation, status transitions, and stale updates.
