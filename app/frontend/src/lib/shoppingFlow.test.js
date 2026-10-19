import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { relatedProductsFor } from './relatedProducts.js';
import { designsFor, giftHamperDesigns } from './giftHampers.js';
const catalog = JSON.parse(readFileSync(new URL('../generated/catalog.json', import.meta.url)));

test('every current product has four distinct recommendations without recommending itself', () => {
  for (const product of catalog) {
    const related = relatedProductsFor(product, catalog);
    assert.equal(related.length, 4, product.slug);
    assert.equal(new Set(related.map(item => item.slug)).size, 4);
    assert.ok(related.every(item => item.slug !== product.slug));
    assert.ok(related.every(item => !/unavailable|sold out|out of stock/i.test(item.availability || '')));
  }
});

test('Nankhatai comparison comes first and fruit/date alternatives remain relevant', () => {
  const forSlug = slug => relatedProductsFor(catalog.find(item => item.slug === slug), catalog).map(item => item.slug);
  assert.equal(forSlug('pure-desi-ghee-nankhatai')[0], 'vanaspati-ghee-nankhatai');
  assert.ok(forSlug('mango-bite').includes('strawberry-bite'));
  assert.ok(forSlug('mango-bite').includes('kachha-aam-bite'));
  assert.ok(forSlug('khajoor-laddoo').includes('khajoor-barfi'));
});

test('recommendations respect a reduced live catalogue and prefer available alternatives', () => {
  const current = { slug: 'mango-bite' };
  const unavailable = { slug: 'strawberry-bite', availability: 'Currently unavailable' };
  const alternative = { slug: 'khasta-rewri', availability: 'Available' };
  assert.deepEqual(relatedProductsFor(current, [current, unavailable, alternative, alternative], 1), [alternative]);
  assert.deepEqual(relatedProductsFor(current, [current]), []);
});

test('hamper designs come from the catalogue and have unique stable destinations', () => {
  const collection = catalog.find(item => item.slug === 'dry-fruit-gift-trays');
  assert.equal(designsFor(collection).length, 7);
  assert.equal(new Set(giftHamperDesigns.map(item => item.id)).size, 7);
  assert.deepEqual(designsFor(undefined), []);
  assert.equal(designsFor({ image: giftHamperDesigns[0].image }).length, 1);
  assert.equal(designsFor({ images: [giftHamperDesigns[2].image] })[0].id, 'floral-gift-box');
});
