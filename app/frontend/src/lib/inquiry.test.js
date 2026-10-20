import test from 'node:test';
import assert from 'node:assert/strict';
import { bulkInquiryPayload, emptyBulkInquiry, inquirySubmissionKey, normalizeInquiryPhone, validateBulkInquiry } from './inquiry.js';

const valid = { ...emptyBulkInquiry, name: 'Test Customer', phone: '09876543210', quantity: '25', message: 'Dry fruit hampers for a test event', company: 'Test Company', budget: '500 - 1000', required_date: '2026-11-01' };
test('Indian mobile prefixes normalise consistently and invalid characters are rejected', () => {
  for (const phone of ['9876543210', '09876543210', '+91 98765 43210']) assert.equal(normalizeInquiryPhone(phone), '+919876543210');
  for (const phone of ['123', '1234567890', 'abc9876543210']) assert.equal(normalizeInquiryPhone(phone), null);
});
test('bulk request rejects blank details and non-positive or fractional quantities', () => {
  assert.deepEqual(validateBulkInquiry(valid), {});
  for (const quantity of ['', '0', '-2', '1.5', '100001']) assert.ok(validateBulkInquiry({ ...valid, quantity }).quantity);
  assert.ok(validateBulkInquiry({ ...valid, name: '  ', message: '  ', email: 'bad' }).name);
  assert.ok(validateBulkInquiry({ ...valid, message: '  ' }).message);
  assert.ok(validateBulkInquiry({ ...valid, email: 'bad' }).email);
});
test('payload retains all quote details and uses numeric quantity', () => {
  const payload = bulkInquiryPayload(valid);
  assert.equal(payload.quantity, 25); assert.equal(payload.phone, '+919876543210');
  assert.equal(payload.kind, 'bulk_gifting'); assert.equal(payload.company, valid.company);
  assert.equal(payload.budget, valid.budget); assert.equal(payload.required_date, valid.required_date);
  assert.equal(payload.email, null);
});
test('retry reuses a stored key without retaining contact details; edited request gets a new key', async () => {
  const storage = new Map();
  globalThis.sessionStorage = { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) };
  try {
    const payload = bulkInquiryPayload(valid);
    const first = await inquirySubmissionKey(payload);
    assert.equal(await inquirySubmissionKey(payload), first);
    assert.notEqual(await inquirySubmissionKey({ ...payload, quantity: 26 }), first);
    assert.ok(!JSON.stringify([...storage.values()]).includes(valid.name));
    globalThis.sessionStorage = { getItem() { throw Error('disabled'); }, setItem() { throw Error('disabled'); } };
    assert.ok(await inquirySubmissionKey(payload));
  } finally { delete globalThis.sessionStorage; }
});
