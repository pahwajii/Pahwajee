export const emptyBulkInquiry = { name: '', company: '', phone: '', email: '', quantity: '', budget: '', required_date: '', message: '' };

export function normalizeInquiryPhone(value) {
  let digits = String(value).replace(/[\s()+-]/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

export function validateBulkInquiry(form) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = 'Enter your name (at least 2 characters).';
  if (!normalizeInquiryPhone(form.phone)) errors.phone = 'Enter a valid 10-digit Indian mobile number.';
  if (!/^\d+$/.test(form.quantity) || Number(form.quantity) < 1 || Number(form.quantity) > 100000) errors.quantity = 'Enter a whole number of hampers between 1 and 100,000.';
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address or leave it blank.';
  if (form.message.trim().length < 5) errors.message = 'Tell us what you need (at least 5 characters).';
  return errors;
}

export function bulkInquiryPayload(form) {
  return { ...Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()])),
    kind: 'bulk_gifting', product: 'Corporate Gifting Enquiry', phone: normalizeInquiryPhone(form.phone),
    quantity: Number(form.quantity), email: form.email.trim() || null, required_date: form.required_date || null };
}

// Only a digest and random key are saved, never the customer's contact details.
export async function inquirySubmissionKey(payload) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)));
  const fingerprint = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  try {
    const saved = JSON.parse(sessionStorage.getItem('pahwa-bulk-request') || 'null');
    if (saved?.fingerprint === fingerprint && typeof saved.key === 'string') return saved.key;
  } catch { /* Storage may be unavailable in private browsing. */ }
  const key = crypto.randomUUID();
  try { sessionStorage.setItem('pahwa-bulk-request', JSON.stringify({ fingerprint, key })); } catch { /* Still submit when storage is disabled. */ }
  return key;
}
