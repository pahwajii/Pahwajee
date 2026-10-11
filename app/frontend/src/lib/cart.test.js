import test from 'node:test';
import assert from 'node:assert/strict';
import { addCartItem, restoreCart, lineKey, packPrice, reconcileCart, displayPrice, validCartPack } from './cart.js';

const product = { slug: 'pure-desi-ghee-nankhatai', name: 'Pure Desi Ghee Nankhatai', image: '/products/nankhatayi.png', sale_unit: 'kg', unit_price_paise: 60000, cart_eligible: true, availability: 'Available' };

test('same product/pack merges; variants and pack sizes stay separate', () => {
  let items = addCartItem([], product, 500, 1);
  items = addCartItem(items, product, 500, 2);
  items = addCartItem(items, product, 1000, 1);
  items = addCartItem(items, { ...product, slug: 'vanaspati-ghee-nankhatai', unit_price_paise: 38000 }, 500, 1);
  assert.equal(items.length, 3);
  assert.equal(items[0].quantity, 3);
  assert.notEqual(lineKey(items[0]), lineKey(items[2]));
});

test('cart round-trips storage and rejects corrupted or excessive quantities', () => {
  const items = addCartItem([], product, 500, 2);
  assert.deepEqual(restoreCart(JSON.stringify(items)), items);
  assert.deepEqual(restoreCart('invalid JSON'), []);
  assert.deepEqual(restoreCart(JSON.stringify([{ ...items[0], quantity: -1 }])), []);
  assert.deepEqual(restoreCart(JSON.stringify([{ ...items[0], pack_grams: 250 }, items[0]])), items);
  assert.deepEqual(restoreCart(JSON.stringify({ customer: 'not cart data' })), []);
});

test('pack price preserves decimal rupees', () => {
  assert.equal(packPrice(60000, 500), 30000);
  assert.equal(packPrice(38000, 500), 19000);
  assert.equal(packPrice(25100, 500), 12550);
  assert.equal(packPrice(60000, 1000), 60000);
  assert.equal(packPrice(12000, null), 12000);
});

test('ineligible products, wrong packs and quantity overflow cannot enter cart', () => {
  assert.throws(() => addCartItem([], { ...product, cart_eligible: false }, 500, 1));
  assert.throws(() => addCartItem([], { ...product, availability: 'Sold out' }, 500, 1));
  assert.throws(() => addCartItem([], product, 200, 1));
  assert.throws(() => addCartItem([], product, 250, 1));
  assert.throws(() => addCartItem([], { ...product, sale_unit: 'plate' }, 500, 1));
  assert.throws(() => addCartItem(addCartItem([], product, 500, 99), product, 500, 1));
});

test('current prices replace stale prices with a review notice', () => {
  const items = addCartItem([], product, 500, 1);
  const result = reconcileCart(items, { [product.slug]: { ...product, unit_price_paise: 65000 } });
  assert.equal(result.priceChanged, true);
  assert.equal(result.items[0].unit_price_paise, 65000);
  assert.equal(result.items[0].quantity, 1);
  assert.equal(reconcileCart(items, {}).items.length, 1); // Keep removed items visible for explicit removal.
});


test('reviewed fixed packs retain correct totals and reject old pack sizes', () => {
  for (const [slug, grams, rate, total] of [['roasted-peanut-chikki', 400, 32500, 13000], ['murmura-patti', 200, 35000, 7000], ['gur-ke-sev', 200, 30000, 6000]]) {
    const current = {...product, slug, unit_price_paise: rate};
    const cart = addCartItem([], current, grams, 2);
    assert.equal(packPrice(rate, grams), total);
    assert.deepEqual(restoreCart(JSON.stringify(cart)), cart);
    assert.throws(() => addCartItem([], current, 500, 1));
    assert.equal(validCartPack({...cart[0], pack_grams: 500}, current), false);
    assert.match(displayPrice(current), new RegExp(String(total / 100)));
  }
});

test('special-order panjeeri cannot enter the cart', () => {
  assert.throws(() => addCartItem([], {...product, slug: 'jachha-bachha-panjeeri', availability: 'Special order only'}, 500, 1));
});


test('all three ready-made boxes accept only 1 kg, including after cart restoration', () => {
  for (const [slug, price] of [['pahwa-signature-mithai-box', 75000], ['pahwa-winter-mithai-box', 75000], ['mixed-fruit-special-bites-combo', 70000]]) {
    const box = {...product, slug, unit_price_paise: price};
    const items = addCartItem([], box, 1000, 2);
    assert.equal(packPrice(price, items[0].pack_grams) * items[0].quantity, price * 2);
    assert.equal(validCartPack(restoreCart(JSON.stringify(items))[0], box), true);
    assert.throws(() => addCartItem([], box, 500, 1));
    assert.equal(validCartPack({...items[0], pack_grams: 500}, box), false);
  }
});
