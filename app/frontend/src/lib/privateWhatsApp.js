import { contactClickEvent, trackContactIntent } from './leadTracking.js';

// Call synchronously from an explicit button click so browsers allow the tab.
// Keep private drafts out of anchor URLs captured by outbound-link analytics.
export function openPrivateWhatsAppDraft(href) {
  if (typeof window === 'undefined' || contactClickEvent(href, '/')?.name !== 'whatsapp_click') return false;
  try { window.open(href, '_blank', 'noopener,noreferrer'); }
  catch { return false; }
  trackContactIntent(href);
  return true;
}
