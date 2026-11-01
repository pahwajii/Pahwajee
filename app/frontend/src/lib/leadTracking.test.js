import test from 'node:test';
import assert from 'node:assert/strict';
import { contactClickEvent, trackContactClick } from './leadTracking.js';

test('contact intent distinguishes calls, WhatsApp and directions', () => {
  assert.equal(contactClickEvent('tel:+916396339806', '/products', 'shopping_nav').name, 'call_click');
  assert.equal(contactClickEvent('https://wa.me/916396339806?text=Product%20enquiry', '/gifting').name, 'whatsapp_click');
  for (const href of ['https://goo.gl/maps/LitsbZD5w865XZux5?g_st=aw', 'https://maps.app.goo.gl/abc', 'https://www.google.com/maps?q=Meerut']) {
    assert.equal(contactClickEvent(href, '/contact').name, 'directions_click');
  }
  for (const href of ['/products', 'https://wa.me.evil.example', 'https://example.com/maps', 'mailto:hello@example.com', 'javascript:alert(1)']) {
    assert.equal(contactClickEvent(href, '/'), null);
  }
});

test('contact parameters exclude private drafts, URL queries, phone numbers and arbitrary labels', () => {
  const event = contactClickEvent('https://wa.me/916396339806?text=Customer%20Name%20%2B919876543210%20address', '/cart?email=private@example.com#secret', 'private@example.com');
  assert.deepEqual(event, { name: 'whatsapp_click', parameters: { page_path: '/cart', contact_placement: 'content' } });
  assert.equal(contactClickEvent('tel:+919876543210', '/private@example.com').parameters.page_path, '/');
});

test('tracking emits once from a nested icon without blocking navigation; absent or failing analytics is harmless', () => {
  const calls = [];
  const previous = globalThis.window;
  const link = { getAttribute: () => 'tel:+916396339806', closest: () => ({ dataset: { contactPlacement: 'shopping_nav' } }) };
  const event = { target: { closest: () => link }, defaultPrevented: false };
  try {
    globalThis.window = { location: { pathname: '/gifting' }, gtag: (...args) => calls.push(args) };
    trackContactClick(event);
    assert.deepEqual(calls, [['event', 'call_click', { page_path: '/gifting', contact_placement: 'shopping_nav' }]]);
    trackContactClick({ ...event, defaultPrevented: true });
    assert.equal(calls.length, 1);
    window.gtag = () => { throw new Error('blocked'); };
    assert.doesNotThrow(() => trackContactClick(event));
    delete window.gtag;
    assert.doesNotThrow(() => trackContactClick(event));
  } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
});
