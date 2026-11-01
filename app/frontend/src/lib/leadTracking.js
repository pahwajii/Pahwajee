// These events record contact-link intent, not completed calls or sales.
// Never send the link URL: WhatsApp drafts can contain customer/order details.
const placements = new Set(['shopping_nav', 'mobile_menu', 'floating', 'footer', 'content']);

export function contactClickEvent(href, pathname, placement = 'content') {
  if (typeof href !== 'string' || !href) return null;
  let name;
  if (/^tel:\+?[\d\s()-]+$/i.test(href)) name = 'call_click';
  else {
    let url;
    try { url = new URL(href); } catch { return null; }
    if (url.protocol !== 'https:') return null;
    if (['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(url.hostname)) name = 'whatsapp_click';
    else if ((url.hostname === 'goo.gl' && url.pathname.startsWith('/maps/'))
      || url.hostname === 'maps.app.goo.gl'
      || (['google.com', 'www.google.com', 'maps.google.com'].includes(url.hostname) && url.pathname.startsWith('/maps'))) name = 'directions_click';
  }
  if (!name) return null;
  // Route only: no query strings, hashes, link text, phone numbers or form data.
  const pagePath = typeof pathname === 'string' ? pathname.split(/[?#]/)[0] : '/';
  return { name, parameters: {
    page_path: /^\/[a-z0-9/-]*$/i.test(pagePath) ? pagePath.slice(0, 200) : '/',
    contact_placement: placements.has(placement) ? placement : 'content',
  } };
}

export function trackContactClick(event) {
  if (event.defaultPrevented || typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  const link = event.target?.closest?.('a[href]');
  if (!link) return;
  const placement = link.closest('[data-contact-placement]')?.dataset.contactPlacement;
  const contact = contactClickEvent(link.getAttribute('href'), window.location.pathname, placement);
  if (!contact) return;
  try { window.gtag('event', contact.name, contact.parameters); }
  catch { /* Analytics must never prevent a call or enquiry from opening. */ }
}
