import test from 'node:test';
import assert from 'node:assert/strict';
import products from '../generated/catalog.json' with { type: 'json' };
import { quoteCustomBox, customBoxEnquiry, customSweetSlugs } from './mithaiBox.js';
const catalog = Object.fromEntries(products.map(product => [product.slug, product]));

test('four portions use individual rates, not the ready-made box price', () => {
  const quote = quoteCustomBox(['mango-bite', 'khajoor-laddoo', 'mawa-til-laddoo', 'gond-laddoo'], catalog);
  assert.equal(quote.complete, true);
  assert.equal(quote.grams, 1000);
  assert.deepEqual(quote.lines.map(line => line.pricePaise), [17500, 22500, 15000, 17500]);
  assert.equal(quote.totalPaise, 72500);
  const text = customBoxEnquiry(quote);
  assert.match(text, /725/);
  for (const line of quote.lines) assert.ok(text.includes(line.name));
  assert.match(text, /No extra packaging charge/);
});

test('repeats occupy separate 250 g sections and retain the correct total', () => {
  const selected = ['mango-bite', 'mango-bite', 'mango-bite', 'mango-bite'];
  assert.equal(quoteCustomBox(selected, catalog).totalPaise, 70000);
  assert.equal(quoteCustomBox(selected, catalog).lines.length, 4);
  const partial = quoteCustomBox(selected.slice(1), catalog);
  assert.equal(partial.grams, 750);
  assert.equal(partial.totalPaise, 52500);
  assert.throws(() => customBoxEnquiry(partial));
  assert.throws(() => quoteCustomBox([...selected, 'gond-laddoo'], catalog));
});

test('unavailable, unpriced or unlisted choices cannot produce an enquiry', () => {
  const slugs = ['mango-bite', 'mango-bite', 'mango-bite', 'mango-bite'];
  for (const change of [{availability: 'Unavailable'}, {unit_price_paise: null}, {sale_unit: 'piece'}, {cart_eligible: false}]) {
    const quote = quoteCustomBox(slugs, {...catalog, 'mango-bite': {...catalog['mango-bite'], ...change}});
    assert.equal(quote.complete, false);
    assert.equal(quote.totalPaise, null);
    assert.throws(() => customBoxEnquiry(quote));
  }
  assert.equal(quoteCustomBox(['pahwa-signature-mithai-box'], catalog).valid, false);
  assert.equal(quoteCustomBox(['does-not-exist'], catalog).valid, false);
  assert.equal(quoteCustomBox([], catalog).complete, false);
});

test('new rates recalculate all portions and fractional rupees remain accurate', () => {
  const slugs = Array(4).fill('mango-bite');
  const changed = {...catalog, 'mango-bite': {...catalog['mango-bite'], unit_price_paise: 70100}};
  assert.equal(quoteCustomBox(slugs, changed).totalPaise, 70100);
  assert.equal(quoteCustomBox(slugs, changed).lines[0].pricePaise, 17525);
});

test('all listed laddoos and confirmed fruit/barfi choices have individual product pages', () => {
  for (const product of products.filter(product => product.slug.includes('laddoo'))) assert.ok(customSweetSlugs.includes(product.slug));
  for (const slug of ['strawberry-bite', 'kachha-aam-bite', 'khajoor-barfi']) {
    assert.ok(customSweetSlugs.includes(slug));
    assert.equal(catalog[slug].unit_price_paise, slug === 'khajoor-barfi' ? 90000 : 70000);
  }
});

test('khajoor laddoo and barfi use the same rate in a custom box', () => {
  const quote = quoteCustomBox(['khajoor-laddoo', 'khajoor-barfi', 'khajoor-laddoo', 'khajoor-barfi'], catalog);
  assert.equal(quote.totalPaise, 90000);
  assert.deepEqual(quote.lines.map(line => line.pricePaise), [22500, 22500, 22500, 22500]);
});
