import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {SITE_URL, metadata, productSchema, renderHead, serializeJson} from './seo.js';

test('canonical URLs consolidate filters, aliases and trailing slashes', () => {
  assert.equal(metadata({path: '/products/?filter=nankhatai'}).url, `${SITE_URL}/products`);
  assert.equal(metadata({path: '/reviews'}).url, `${SITE_URL}/testimonials`);
  assert.equal(metadata({path: '/'}).url, `${SITE_URL}/`);
});

test('private/error pages are noindex and public navigation resets robots', () => {
  for (const path of ['/cart', '/admin', '/admin/orders']) {
    assert.match(metadata({path}).robots, /noindex/);
    assert.equal(metadata({path}).schema, null);
  }
  assert.match(metadata({path: '/missing', noindex: true}).robots, /noindex/);
  assert.match(metadata({path: '/products'}).robots, /^index,/);
});

test('offers preserve decimal prices and selling units without inventing gift prices', () => {
  const product = {slug: 'nankhatai', name: 'Nankhatai', image: '/products/nankhatayi.png', cart_eligible: true, unit_price_paise: 60000, sale_unit: 'kg', availability: 'Available'};
  const schema = productSchema(product);
  assert.equal(schema.offers.price, '600.00');
  assert.equal(schema.offers.priceSpecification.referenceQuantity.unitCode, 'KGM');
  assert.equal(productSchema({...product, unit_price_paise: 38000}).offers.price, '380.00');
  assert.equal(productSchema({...product, unit_price_paise: 12550, sale_unit: 'plate'}).offers.price, '125.50');
  for (const replacement of [{cart_eligible: false, price: 'Rs 1100 - Rs 2500'}, {unit_price_paise: null}, {unit_price_paise: 0}]) assert.equal(productSchema({...product, ...replacement}).offers, undefined);
  assert.equal(productSchema({...product, availability: 'Unavailable'}).offers.availability, 'https://schema.org/OutOfStock');
  assert.ok(schema.image.every(url => url.startsWith(SITE_URL)));
});

test('metadata and public data cannot break out of HTML or JSON scripts', () => {
  const text = '</script><script>alert("test")</script>';
  const html = renderHead(metadata({title: text, description: text}));
  assert.ok(!html.includes('<script>alert'));
  assert.equal(JSON.parse(serializeJson({text})).text, text);
  assert.ok(!serializeJson({text}).includes('</script>'));
});

test('built sitemap pages contain one canonical, page-specific HTML and valid schema', async () => {
  const xml = await readFile('dist/sitemap.xml', 'utf8');
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname);
  assert.ok(paths.includes('/gallery') && paths.includes('/our-specialities'));
  assert.ok(paths.includes('/products/pure-desi-ghee-nankhatai'));
  assert.ok(paths.includes('/products/vanaspati-ghee-nankhatai'));
  assert.ok(!paths.some(path => ['/cart', '/admin', '/reviews'].includes(path)));
  const titles = new Set();
  for (const path of paths) {
    const html = await readFile(`dist/${path === '/' ? 'index' : path.slice(1)}.html`, 'utf8');
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1, path);
    assert.ok(html.includes(`href="${SITE_URL}${path}"`), path);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, path);
    assert.ok(!html.includes('<div id="root"></div>'), path);
    assert.ok(!html.includes('pahwajee.com'), path);
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    assert.ok(!titles.has(title), `Duplicate title: ${title}`);
    titles.add(title);
    const graph = JSON.parse(html.match(/<script id="jsonld-schema" type="application\/ld\+json">(.*?)<\/script>/s)[1]);
    assert.equal(graph['@graph'].filter(item => item['@type'] === 'Bakery').length, 1);
    assert.ok(!graph['@graph'].some(item => item['@type'] === 'AggregateRating'));
  }
  assert.match(await readFile('dist/404.html', 'utf8'), /name="robots" content="noindex/);
  for (const path of ['cart', 'admin']) assert.match(await readFile(`dist/${path}.html`, 'utf8'), /name="robots" content="noindex/);
});
