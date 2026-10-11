import test from 'node:test';
import assert from 'node:assert/strict';
import { compareProducts } from './productOrder.js';

test('either best-seller flag takes priority over regular products, then respects catalogue order', () => {
  const regular = { slug: 'regular', order: -100 };
  const first = { slug: 'first', bestseller: true, order: -30 };
  const second = { slug: 'second', bestSeller: true, order: -5 };
  const later = { slug: 'later', bestseller: true, order: 50 };
  assert.deepEqual([regular, later, second, first].sort(compareProducts), [first, second, later, regular]);
  assert.equal(compareProducts({}, { order: 0 }), 0);
  regular.bestSeller = true;
  assert.equal([later, regular, first].sort(compareProducts)[0], regular);
});
