# Lead measurement

Implemented on 2 November 2026. Website events use the existing Google Analytics tag. Google account settings were not changed by this implementation. The new events begin measuring after deployment; they do not explain or replace historical counts.

## Events

| Event | Trigger | Meaning |
| --- | --- | --- |
| `call_click` | Visitor activates a telephone link | Intent to call; not a completed call |
| `whatsapp_click` | Visitor activates a WhatsApp link | Intent to enquire; not a sent message |
| `directions_click` | Visitor activates a Google Maps link | Intent to visit; not a store visit |
| `generate_lead` | API confirms a saved contact enquiry, bulk quote or order request | A saved request; not a paid sale |

Click events include only a sanitized page path and a fixed `contact_placement` value. Saved requests include only a sanitized page path and `lead_type`: `contact`, `bulk_gifting` or `order_request`. These custom events do not send names, phone numbers, emails, addresses, message text, WhatsApp drafts, request references or invented monetary values.

The saved order's WhatsApp action is an accessible button. It opens the private draft synchronously only when activated, with opener/referrer protection. The draft is not placed in an anchor URL or data attribute that outbound-link measurement could collect. Its custom `whatsapp_click` contains only the safe event parameters above.

Successful references are remembered locally in session storage, bounded to 100 entries, to avoid repeat `generate_lead` events for the same response. Failed submissions never emit this event. Tracking errors never block calling, navigation or a successful form submission. Ad blockers and unavailable analytics can prevent measurement.

## Production and QA traffic

The Google tag now loads only on `pahwajee.in` and `www.pahwajee.in`, and does not load on a direct `/admin` visit. Localhost, Vercel previews and other hosts do not create the production analytics queue or request the Google script. This is an initial-document guard: a client-side navigation from an already tracked public page into admin is not a comprehensive admin exclusion. The Vercel Analytics and Speed Insights integrations are separate and unchanged.

Staff activity and automated checks on the public production domain can still enter GA4. Review hostname/source dimensions and known internal traffic before treating all sessions as potential customers. Validate any internal-traffic exclusion in Testing before activating it; exclusions permanently discard matching incoming data. No GA4 filter was changed here. The isolated form QA intercepted all APIs and blocked external traffic, so its simulated requests and analytics calls were not sent to production.

The existing public SPA configuration is preserved. Verify one `page_view` per client-side route change and the correct referrer using the GA4 enhanced-measurement settings before adding manual page views; the account settings are not proven by the repository alone.

## Review in Google Analytics

1. Confirm the event names in Realtime after genuine visitor activity. Use a debug/test property for repeated submission testing; do not send fake production enquiries.
2. Review existing key-event rules and any Google Ads use before changing them. Keep cart-page or click-intent events separate from saved-lead reporting. Check whether the new `generate_lead` is configured as a key event; that account change is separate from installing website code, and was not made here.
3. Compare saved leads by landing page and session channel, then by device. Keep click-intent counts separate from saved requests and paid sales.
4. If placement/type breakdowns are needed, register `contact_placement` and `lead_type` as event-scoped custom dimensions. Historical custom-parameter reporting is not implied by this release.
5. Review the actual enquiries in the admin portal for qualification and fulfilment. A higher button-click count alone does not prove more customers.

Use consistent `utm_source`, `utm_medium` and `utm_campaign` values on controlled external promotional links such as social profiles, WhatsApp shares and printed QR codes. Keep internal site links free of campaign tagging. Compare like-for-like reporting periods after deployment, segmented by landing page, channel and device, with saved enquiries as the outcome and contact clicks as supporting intent.

## Search Console review

Use the latest complete 28 days against the previous 28 days, and a 3-month view for context. Record the actual reporting dates and property. Compare queries, pages, devices and countries; distinguish brand searches from product/local searches.

- High impressions with low clicks: check whether the ranking page's title and content answer the observed query before changing copy.
- Relevant queries near page one: strengthen the matching product/category page with useful information and contextual links from related guides.
- Pages receiving visitors but few saved enquiries: check product details, ordering conditions, mobile contact actions and the form journey.
- Keep search clicks, analytics sessions, button clicks and confirmed requests separate; they measure different things.

Current links connect the gift guide to the Peacock, Golden and Floral designs and directly to the bulk quote form. The Nankhatai storage guide connects to both available varieties and the ingredient guide. The homepage links its gifting section to the Diwali buying guide.

Possible next content requires real business information: a hamper comparison with confirmed contents/weights, corporate and wedding order details with confirmed minimum quantities and lead times, original preparation/packing photos, and fuller second-outlet visit information. Prioritize these against observed searches and enquiry questions; avoid duplicate city pages or unsupported product claims.

Sources: [Google internal-link guidance](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), [GA4 recommended events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#generate_lead), [GA4 reporting dimensions](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema), [GA4 session key-event rate](https://support.google.com/analytics/table/13948007), [internal-traffic filters](https://support.google.com/analytics/answer/10104470), [SPA measurement](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications), [campaign URL tagging](https://support.google.com/analytics/answer/10917952).
