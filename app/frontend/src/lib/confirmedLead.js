// A saved enquiry/order request is a lead, not a completed call or paid sale.
// References are used only for local deduplication and never sent to Analytics.
const leadTypes = new Set(['contact', 'bulk_gifting', 'order_request']);
const storageKey = 'pahwa-confirmed-leads-v1';
const maxRemembered = 100;

export function confirmedLeadEvent(leadType, receipt, pathname = '/') {
  if (!leadTypes.has(leadType) || receipt?.ok === false || typeof receipt?.reference !== 'string') return null;
  const referencePattern = leadType === 'order_request' ? /^PJ-\d{8}-[A-Z0-9]{10}$/ : /^PJQ-\d{8}-[A-Z0-9]{10}$/;
  if (!referencePattern.test(receipt.reference)) return null;
  const pagePath = typeof pathname === 'string' ? pathname.split(/[?#]/)[0] : '/';
  return { name: 'generate_lead', parameters: {
    lead_type: leadType,
    page_path: /^\/[a-z0-9/-]*$/i.test(pagePath) ? pagePath.slice(0, 200) : '/',
  } };
}

export function createConfirmedLeadTracker(getBrowser = () => typeof window === 'undefined' ? null : window) {
  const remembered = new Set();
  return (leadType, receipt) => {
    try {
      const browser = getBrowser();
      if (typeof browser?.gtag !== 'function') return false;
      const event = confirmedLeadEvent(leadType, receipt, browser.location?.pathname);
      if (!event) return false;
      const identity = `${leadType}:${receipt.reference}`;
      try {
        const stored = JSON.parse(browser.sessionStorage.getItem(storageKey) || '[]');
        if (Array.isArray(stored)) for (const key of stored.slice(-maxRemembered)) {
          if (typeof key === 'string' && /^(?:contact|bulk_gifting|order_request):PJQ?-\d{8}-[A-Z0-9]{10}$/.test(key)) remembered.add(key);
        }
      } catch { /* In-memory deduplication also works when storage is blocked. */ }
      while (remembered.size > maxRemembered) remembered.delete(remembered.values().next().value);
      if (remembered.has(identity)) return false;
      browser.gtag('event', event.name, event.parameters);
      remembered.add(identity);
      while (remembered.size > maxRemembered) remembered.delete(remembered.values().next().value);
      try { browser.sessionStorage.setItem(storageKey, JSON.stringify([...remembered])); }
      catch { /* Do not interrupt a saved enquiry if session storage is blocked. */ }
      return true;
    } catch { return false; /* Analytics must never turn a successful save into an error. */ }
  };
}

export const trackConfirmedLead = createConfirmedLeadTracker();

// Call from the submit handler, never a receipt-render effect. Rejected API
// submissions propagate unchanged and cannot emit a successful lead event.
export async function submitTrackedLead(leadType, submit, track = trackConfirmedLead) {
  const receipt = await submit();
  try { track(leadType, receipt); } catch { /* Saving the request remains authoritative. */ }
  return receipt;
}
