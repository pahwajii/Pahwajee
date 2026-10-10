# Cart order requests

The React cart submits guest requests to `POST /api/orders`. MongoDB stores an
immutable item/price snapshot and an email outbox entry in the same document.
There is no online payment or delivery-fee calculation. The delivery policy is
informational. Dry-fruit trays, hampers and unpriced products use enquiries.

## Gmail SMTP

Set these in the backend `.env` (never in the frontend):

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USERNAME=lakshaypahwa47@gmail.com
SMTP_PASSWORD=<Gmail App Password>
ORDER_FROM_EMAIL=lakshaypahwa47@gmail.com
ORDER_NOTIFICATION_EMAIL=lakshaypahwa47@gmail.com
```

Use an App Password for the sender account, not its normal sign-in password.
Restart the API after changing settings. No credentials are logged. The worker
keeps orders queued when SMTP is missing. SMTP success means Gmail accepted the
message; it does not prove placement in the recipient's inbox.

## Running and maintaining

Run `python -m uvicorn server:app --host 0.0.0.0 --port 5000` from this directory.
Startup adds numeric purchase fields to existing products without replacing
their IDs, images or other content. The migration can also run independently:
`python migrate_cart_pricing.py`.

Product `price` remains the existing admin-editable source. Strict values such as
`Rs 600/kg`, `Rs 120/plate`, and `Rs 100` produce `unit_price_paise`, `sale_unit`,
`cart_eligible`, and `pack_sizes_grams`. Ranges/unknown prices cannot enter a cart.
Admin product writes keep these fields synchronized. Reads also derive them to
support existing records. Order submission always reprices on the server.

Authenticated admin endpoints (existing admin session or bearer token):

- `GET /api/admin/orders?limit=50`: recent requests and their email state.
- `POST /api/admin/orders/{reference}/retry-email`: requeue a pending, retrying
  or failed email; sent/in-progress messages are not manually resent.

The outbox polls every 15 seconds and retries failed sends up to five attempts
with exponential backoff. An expired five-minute sending lease is recovered
after restart. SMTP is at-least-once: a crash after send but before marking it
sent can deliver a duplicate. The same order reference and Message-ID are reused.
Submission idempotency prevents duplicate order records. Rate limits allow ten
new submission attempts per client IP per ten-minute window. Configure the
deployment proxy's trusted forwarded-IP handling; never trust arbitrary headers.

## Tests

```powershell
python -m pip install -r requirements-test.txt
python -m unittest discover -s tests -v
$env:RUN_DB_TESTS='1'
python -m unittest discover -s tests -v
```

Database tests create and remove only temporary `pahwa_cart_test_*` databases on
the configured MongoDB connection. SMTP is mocked in these tests; no emails are
sent. Frontend cart tests: `node src/lib/cart.test.js` from `app/frontend`.

For a live smoke test, submit one clearly labelled test request through the cart,
verify the saved summary and `email.status`, and label the record as a test in
MongoDB. Never send test WhatsApp messages to unrelated numbers. Customer details
are kept in React memory for the receipt, not persistent browser storage.

## Vercel

Deploy from `app/` using its `vercel.json`. The frontend and `/api` share an
origin, so session cookies and cart requests work without a separate API domain.
Set runtime secrets in Vercel environment variables, never in uploaded `.env`
files. `MONGO_URL`, `DB_NAME`, `JWT_SECRET` and the SMTP settings above are needed.
Set a random `CRON_SECRET` for the protected outbox retry endpoint. Existing
database content and admin accounts are preserved; Vercel cold starts do not
seed data, reset passwords, or start the local infinite email worker.

On Vercel, the API attempts each order's email before finishing the submission
request. SMTP failures leave the saved request queued and do not discard it.
The protected daily cron retries pending emails (up to ten per invocation), and
admin manual retry also attempts delivery immediately. Hobby only supports daily
cron schedules; on Pro the schedule can be changed to `*/5 * * * *` for retries
every five minutes. The local development server retains its 15-second worker.
Authentication cookies are HTTPS-only on Vercel. Client rate limits use Vercel's
edge-supplied IP header only when the Vercel runtime is detected.

## Public-page SEO builds

`npm run build` in `app/frontend` builds the app and pre-renders public pages,
product details, metadata, JSON-LD, `sitemap.xml`, and `robots.txt`. The canonical
origin currently defaults to `https://pahwajee.vercel.app`; set `VITE_SITE_URL`
at build time only after a replacement custom domain is connected.

The build reads public products, FAQs, and testimonials from the live `/api`.
Use `PRERENDER_API_URL` to build against another public API, such as
`http://127.0.0.1:5000/api` locally. Failed or empty catalogue responses stop
the build rather than publishing incomplete pages. No customer or order data
is embedded. Browsers refresh product data, and the order API always validates
current prices independently.

Redeploy after changing products, FAQs, or testimonials so initial HTML and the
sitemap reflect the latest catalogue. Newly added product links can still load
through the app before the next build. Cart, admin, and missing pages have
noindex metadata; API responses and private routes also have noindex headers.
Verify a successful build with `node src/lib/seo.test.js` and
`node src/lib/cart.test.js` from `app/frontend`.

Google Search Console verification and sitemap submission are separate account
steps. Submit `https://pahwajee.vercel.app/sitemap.xml` for the URL-prefix property
`https://pahwajee.vercel.app/` once ownership is verified.
