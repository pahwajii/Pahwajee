import test from 'node:test';
import assert from 'node:assert/strict';
import { currentCatalogue, refreshOnReturn } from './catalogueState.js';
import { productDescription } from './catalogueContent.js';
import { productSchema } from './seo.js';
import { canPurchase } from './cart.js';

const oldProduct = { slug: 'khasta-rewri', name: 'Khasta Rewri', description: 'Old catalogue copy', availability: 'Available', cart_eligible: true, unit_price_paise: 54000, sale_unit: 'kg' };

test('a successful empty catalogue removes the build snapshot and stays authoritative on refresh', () => {
  assert.equal(currentCatalogue({}, false, [oldProduct])['khasta-rewri'], oldProduct);
  assert.deepEqual(currentCatalogue({}, true, [oldProduct]), {});
  assert.equal(canPurchase(currentCatalogue({}, true, [oldProduct])['khasta-rewri']), false);
});

test('server-rendered page data takes precedence over the bundled snapshot while loading', () => {
  const renderedProduct = { ...oldProduct, price: 'Rs 580/kg' };
  assert.equal(currentCatalogue({ [renderedProduct.slug]: renderedProduct }, false, [oldProduct])[oldProduct.slug].price, 'Rs 580/kg');
});

test('new products and availability edits replace the snapshot without a build', () => {
  const unavailable = { ...oldProduct, availability: 'Sold out' };
  const added = { ...oldProduct, slug: 'new-admin-sweet', name: 'New admin sweet' };
  const current = currentCatalogue({ [unavailable.slug]: unavailable, [added.slug]: added }, true, [oldProduct]);
  assert.deepEqual(Object.values(current), [unavailable, added]);
  assert.equal(canPurchase(current['khasta-rewri']), false);
  assert.equal(canPurchase(current['new-admin-sweet']), true);
});

test('admin descriptions override editorial copy in both visible content and structured data', () => {
  const edited = { ...oldProduct, content_managed_by_admin: true, description: 'Freshly updated shop description' };
  assert.equal(productDescription(edited), edited.description);
  assert.equal(productSchema(edited).description, edited.description);
  assert.equal(productDescription({ ...edited, description: '' }), '');
  assert.notEqual(productDescription(oldProduct), oldProduct.description, 'Existing editorial copy remains until an admin saves this product');
  assert.equal(productDescription({ ...edited, slug: 'new-admin-sweet' }), edited.description);
});

test('returning to a visible storefront refreshes live data and cleanup removes listeners', async () => {
  const browserWindow = new EventTarget();
  const browserDocument = new EventTarget();
  browserDocument.visibilityState = 'visible';
  let refreshes = 0;
  const cleanup = refreshOnReturn(async () => { refreshes += 1; }, browserWindow, browserDocument);
  browserWindow.dispatchEvent(new Event('focus'));
  assert.equal(refreshes, 1);
  browserDocument.visibilityState = 'hidden';
  browserDocument.dispatchEvent(new Event('visibilitychange'));
  browserWindow.dispatchEvent(new Event('focus'));
  assert.equal(refreshes, 1);
  browserDocument.visibilityState = 'visible';
  browserDocument.dispatchEvent(new Event('visibilitychange'));
  assert.equal(refreshes, 2);
  cleanup();
  browserWindow.dispatchEvent(new Event('focus'));
  browserDocument.dispatchEvent(new Event('visibilitychange'));
  assert.equal(refreshes, 2);
});

test('a failed background refresh is handled by the catalogue without an unhandled rejection', async () => {
  const browserWindow = new EventTarget();
  const browserDocument = new EventTarget();
  browserDocument.visibilityState = 'visible';
  const cleanup = refreshOnReturn(() => Promise.reject(new Error('Offline')), browserWindow, browserDocument);
  browserWindow.dispatchEvent(new Event('focus'));
  await new Promise(resolve => setImmediate(resolve));
  cleanup();
});
