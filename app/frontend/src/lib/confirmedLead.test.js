import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmedLeadEvent, createConfirmedLeadTracker, submitTrackedLead } from './confirmedLead.js';

const receipt = { ok: true, reference: 'PJQ-20261102-ABCDEF1234', name: 'Private Name', phone: '9876543210', email: 'private@example.com', message: 'Private request', value: 9000 };
function browserFixture() {
  const storage = new Map();
  const calls = [];
  const browser = { location: { pathname: '/gifting?phone=9876543210#private' }, gtag: (...args) => calls.push(args), sessionStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) } };
  return { browser, calls, storage };
}

test('confirmed lead payload contains only allowed type and path, without receipt or customer details', () => {
  assert.deepEqual(confirmedLeadEvent('bulk_gifting', receipt, '/gifting?phone=9876543210#private'), { name: 'generate_lead', parameters: { lead_type: 'bulk_gifting', page_path: '/gifting' } });
  assert.equal(confirmedLeadEvent('purchase', receipt, '/cart'), null);
  assert.equal(confirmedLeadEvent('contact', { ok: false, reference: receipt.reference }, '/contact'), null);
  assert.equal(confirmedLeadEvent('contact', { ok: true }, '/contact'), null);
  assert.equal(confirmedLeadEvent('order_request', receipt, '/cart'), null);
  assert.deepEqual(confirmedLeadEvent('order_request', { reference: 'PJ-20261102-ABCDEF1234' }, '/cart'), { name: 'generate_lead', parameters: { lead_type: 'order_request', page_path: '/cart' } });
});

test('successful request tracks once; idempotent retries and remount/reload share local deduplication', async () => {
  const { browser, calls, storage } = browserFixture();
  const tracker = createConfirmedLeadTracker(() => browser);
  assert.equal(await submitTrackedLead('bulk_gifting', async () => receipt, tracker), receipt);
  await submitTrackedLead('bulk_gifting', async () => receipt, tracker);
  await submitTrackedLead('bulk_gifting', async () => receipt, createConfirmedLeadTracker(() => browser));
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], ['event', 'generate_lead', { lead_type: 'bulk_gifting', page_path: '/gifting' }]);
  assert.equal([...storage.values()].some(value => /Private|9876543210|private@example/.test(value)), false);
});

test('failed submission does not track, while analytics failure cannot break a saved request', async () => {
  const { browser, calls } = browserFixture();
  const tracker = createConfirmedLeadTracker(() => browser);
  const failure = new Error('API unavailable');
  await assert.rejects(submitTrackedLead('contact', async () => { throw failure; }, tracker), error => error === failure);
  assert.equal(calls.length, 0);
  browser.gtag = () => { throw new Error('Analytics blocked'); };
  assert.equal(await submitTrackedLead('contact', async () => receipt, tracker), receipt);
  delete browser.gtag;
  assert.equal(await submitTrackedLead('contact', async () => receipt, tracker), receipt);
});

test('blocked or corrupt storage is safe, and remembered references are bounded', () => {
  const { browser, calls, storage } = browserFixture();
  browser.sessionStorage.getItem = () => { throw new Error('Storage blocked'); };
  browser.sessionStorage.setItem = () => { throw new Error('Storage blocked'); };
  const tracker = createConfirmedLeadTracker(() => browser);
  assert.equal(tracker('contact', receipt), true);
  assert.equal(tracker('contact', receipt), false);
  assert.equal(calls.length, 1);
  browser.sessionStorage = { getItem: key => storage.get(key) ?? '{broken', setItem: (key, value) => storage.set(key, value) };
  for (let index = 0; index < 105; index++) tracker('contact', { reference: `PJQ-20261102-${String(index).padStart(10, '0')}` });
  assert.equal(JSON.parse([...storage.values()][0]).length, 100);
});
