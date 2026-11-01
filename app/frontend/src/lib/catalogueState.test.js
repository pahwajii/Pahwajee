import test from 'node:test';
import assert from 'node:assert/strict';
import { createCatalogueCache, currentCatalogue, refreshOnReturn, withCatalogueTimeout } from './catalogueState.js';
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

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

test('catalogue snapshots cannot enable ordering before initial validation; concurrent requests share the read', async () => {
  const read = deferred();
  let calls = 0;
  const cache = createCatalogueCache(() => { calls += 1; return read.promise; }, { initialCatalog: { [oldProduct.slug]: oldProduct } });
  const first = cache.refresh();
  assert.equal(cache.refresh(), first);
  assert.equal(cache.getState().loaded, false);
  assert.equal(cache.getState().status, 'loading');
  await Promise.resolve();
  assert.equal(calls, 1);
  read.resolve([oldProduct]);
  await first;
  assert.equal(cache.getState().status, 'ready');
});

test('fresh navigation reuses data for 15 seconds, force bypasses it, and background reads keep controls ready', async () => {
  let clock = 100;
  let calls = 0;
  let read;
  const cache = createCatalogueCache(() => { calls += 1; return read ? read.promise : [oldProduct]; }, { now: () => clock });
  await cache.refresh();
  clock += 14_999;
  await cache.refresh();
  assert.equal(calls, 1);
  read = deferred();
  const forced = cache.refresh({ force: true });
  assert.equal(cache.getState().status, 'ready');
  assert.equal(cache.getState().refreshing, true);
  read.resolve([{ ...oldProduct, price: 'Rs 600/kg' }]);
  await forced;
  clock += 15_000;
  read = null;
  await cache.refresh();
  assert.equal(calls, 3);
});

test('a failed refresh keeps visible products but disables ordering until successful retry', async () => {
  let fail = false;
  const cache = createCatalogueCache(() => fail ? Promise.reject(new Error('Offline')) : [oldProduct]);
  await cache.refresh();
  fail = true;
  await assert.rejects(cache.refresh({ force: true }), /Offline/);
  assert.equal(cache.getState().status, 'error');
  assert.equal(cache.getState().loaded, true);
  assert.equal(cache.getState().catalog[oldProduct.slug], oldProduct);
  fail = false;
  await cache.refresh();
  assert.equal(cache.getState().status, 'ready');
});

test('admin invalidation rejects a pre-save response and checkout waits for the replacement read', async () => {
  const reads = [deferred(), deferred()];
  let calls = 0;
  const cache = createCatalogueCache(() => reads[calls++].promise);
  const oldRead = cache.refresh();
  await Promise.resolve();
  const invalidated = cache.invalidate();
  assert.equal(cache.refresh({ force: true }), invalidated);
  reads[0].resolve([oldProduct]);
  await oldRead;
  assert.equal(cache.getState().loaded, false, 'Pre-save data must not be published as validated');
  const soldOut = { ...oldProduct, availability: 'Sold out' };
  reads[1].resolve([soldOut]);
  await invalidated;
  assert.equal(calls, 2);
  assert.equal(cache.getState().catalog[oldProduct.slug].availability, 'Sold out');
});

test('catalogue deadline aborts the read at 8 seconds, settles, and ignores its late response', async () => {
  const read = deferred();
  let alarm, delay, signal, cleared;
  const result = withCatalogueTimeout(activeSignal => { signal = activeSignal; return read.promise; }, {
    setTimer: (callback, milliseconds) => { alarm = callback; delay = milliseconds; return 7; },
    clearTimer: timer => { cleared = timer; },
  });
  assert.equal(delay, 8000);
  const rejected = assert.rejects(result, error => error.code === 'catalogue_timeout');
  alarm();
  await rejected;
  assert.equal(signal.aborted, true);
  assert.equal(cleared, 7);
  read.resolve([oldProduct]);
  await Promise.resolve();
});

test('confirmed detail products can join the shared catalogue and a later 404 removes them', async () => {
  const cache = createCatalogueCache(() => []);
  await cache.refresh();
  cache.mergeProduct(oldProduct);
  assert.equal(cache.getState().catalog[oldProduct.slug], oldProduct);
  cache.removeProduct(oldProduct.slug);
  assert.deepEqual(cache.getState().catalog, {});
});

test('another admin save during a failed invalidation read still validates the latest revision', async () => {
  const reads = [deferred(), deferred()];
  let calls = 0;
  const cache = createCatalogueCache(() => reads[calls++].promise);
  const first = cache.invalidate();
  await Promise.resolve();
  assert.equal(cache.invalidate(), first);
  reads[0].reject(new Error('Old read failed'));
  reads[1].resolve([{ ...oldProduct, availability: 'Sold out' }]);
  await first;
  assert.equal(calls, 2);
  assert.equal(cache.getState().status, 'ready');
  assert.equal(cache.getState().catalog[oldProduct.slug].availability, 'Sold out');
});

test('detail requests deduplicate and cannot publish a pre-save result over the updated catalogue', async () => {
  const soldOut = { ...oldProduct, availability: 'Sold out' };
  const cache = createCatalogueCache(() => [soldOut]);
  const oldRead = deferred();
  let calls = 0;
  const fetchProduct = () => ++calls === 1 ? oldRead.promise : Promise.resolve(soldOut);
  const detail = cache.loadProduct(oldProduct.slug, fetchProduct);
  assert.equal(cache.loadProduct(oldProduct.slug, fetchProduct), detail);
  await cache.invalidate();
  oldRead.resolve(oldProduct);
  assert.equal(await detail, soldOut);
  assert.equal(calls, 1, 'A newer list answer avoids another detail request');
  assert.equal(cache.getState().catalog[oldProduct.slug].availability, 'Sold out');
});

test('a detail read cannot overwrite a more recent ordinary list refresh', async () => {
  const soldOut = { ...oldProduct, availability: 'Sold out' };
  const cache = createCatalogueCache(() => [soldOut]);
  const oldRead = deferred();
  const detail = cache.loadProduct(oldProduct.slug, () => oldRead.promise);
  await cache.refresh();
  oldRead.resolve(oldProduct);
  assert.equal(await detail, soldOut);
  assert.equal(cache.getState().catalog[oldProduct.slug], soldOut);
});

test('saved cart products outside the list limit are revalidated and failures offer catalogue retry', async () => {
  const cache = createCatalogueCache(() => []);
  await cache.refresh();
  await cache.validateProducts([oldProduct.slug], () => Promise.resolve(oldProduct));
  await cache.refresh({ force: true });
  const soldOut = { ...oldProduct, availability: 'Sold out' };
  const current = await cache.validateProducts([oldProduct.slug], () => Promise.resolve(soldOut));
  assert.equal(current[oldProduct.slug], soldOut);
  await cache.refresh({ force: true });
  await assert.rejects(cache.validateProducts([oldProduct.slug], () => Promise.reject(new Error('Offline'))), /Offline/);
  assert.equal(cache.getState().status, 'error');
  await cache.refresh();
  await cache.validateProducts([oldProduct.slug], () => Promise.resolve(oldProduct));
  assert.equal(cache.getState().status, 'ready');
  assert.equal(cache.getState().catalog[oldProduct.slug], oldProduct);
  await cache.refresh({ force: true });
  await cache.validateProducts([oldProduct.slug], () => Promise.reject(Object.assign(new Error('Not found'), { status: 404 })));
  assert.equal(cache.getState().status, 'ready');
  assert.equal(cache.getState().catalog[oldProduct.slug], undefined);
});
