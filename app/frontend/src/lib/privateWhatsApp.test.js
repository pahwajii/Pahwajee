import test from 'node:test';
import assert from 'node:assert/strict';
import { openPrivateWhatsAppDraft } from './privateWhatsApp.js';

test('explicit draft opening sends the draft only to WhatsApp and sanitizes analytics', () => {
  const previous = globalThis.window;
  const opened = [];
  const tracked = [];
  const href = 'https://wa.me/916396339806?text=Private%20Name%209876543210%20address';
  try {
    globalThis.window = { location: { pathname: '/cart?email=private@example.com' }, open: (...args) => opened.push(args), gtag: (...args) => tracked.push(args) };
    assert.deepEqual(opened, []);
    assert.equal(openPrivateWhatsAppDraft(href), true);
    assert.deepEqual(opened, [[href, '_blank', 'noopener,noreferrer']]);
    assert.deepEqual(tracked, [['event', 'whatsapp_click', { page_path: '/cart', contact_placement: 'content' }]]);
    for (const unsafe of ['javascript:alert(1)', 'http://wa.me/916396339806', 'https://wa.me.evil.example/?text=private', 'tel:+916396339806']) {
      assert.equal(openPrivateWhatsAppDraft(unsafe), false);
    }
    assert.equal(opened.length, 1);
    assert.equal(tracked.length, 1);
    window.gtag = () => { throw new Error('Analytics blocked'); };
    assert.equal(openPrivateWhatsAppDraft(href), true, 'Blocked analytics must not prevent the user action');
    assert.equal(opened.length, 2);
  } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
});
