import test from 'node:test';
import assert from 'node:assert/strict';
import { isPromoActive, isProductEligible, calculatePromoDiscount } from './promo.js';

test('isPromoActive validates active flag and date schedules', () => {
  assert.equal(isPromoActive(null), false);
  assert.equal(isPromoActive({ active: false }), false);
  assert.equal(isPromoActive({ active: true }), true);

  // Future start date
  const tomorrow = new Date(Date.now() + 86400000).toISOString();
  assert.equal(isPromoActive({ active: true, start_date: tomorrow }), false);

  // Past start date
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  assert.equal(isPromoActive({ active: true, start_date: yesterday }), true);

  // Past end date
  assert.equal(isPromoActive({ active: true, end_date: yesterday }), false);

  // Future end date
  assert.equal(isPromoActive({ active: true, end_date: tomorrow }), true);

  // Active interval
  assert.equal(isPromoActive({ active: true, start_date: yesterday, end_date: tomorrow }), true);
});

test('isProductEligible correctly identifies rewri, gajak, sweets, nankhatai, all', () => {
  const rewri = { slug: 'khasta-rewri', name: 'Khasta Rewri', unit_price_paise: 54000 };
  const gajak = { slug: 'dilkhush-gazak', name: 'Dilkhush Gazak', unit_price_paise: 70000 };
  const nankhatai = { slug: 'pure-desi-ghee-nankhatai', name: 'Pure Desi Ghee Nankhatai', unit_price_paise: 60000 };
  const laddoo = { slug: 'dry-fruit-laddoo', name: 'Dry Fruit Laddoo', unit_price_paise: 90000 };

  const rewriPromo = { active: true, discount_percent: 10, category: 'rewri-gajak' };
  assert.equal(isProductEligible(rewri, rewriPromo), true);
  assert.equal(isProductEligible(gajak, rewriPromo), true);
  assert.equal(isProductEligible(nankhatai, rewriPromo), false);
  assert.equal(isProductEligible(laddoo, rewriPromo), false);

  const allPromo = { active: true, discount_percent: 10, category: 'all' };
  assert.equal(isProductEligible(rewri, allPromo), true);
  assert.equal(isProductEligible(nankhatai, allPromo), true);
  assert.equal(isProductEligible(laddoo, allPromo), true);

  const nankhataiPromo = { active: true, discount_percent: 15, category: 'nankhatai' };
  assert.equal(isProductEligible(rewri, nankhataiPromo), false);
  assert.equal(isProductEligible(nankhatai, nankhataiPromo), true);
});

test('calculatePromoDiscount computes 10% on rewri and gajak items only', () => {
  const promo = { active: true, discount_percent: 10, category: 'rewri-gajak' };
  const items = [
    { slug: 'khasta-rewri', unit_price_paise: 54000, pack_grams: 500, quantity: 2 }, // 27000 * 2 = 54000 paise -> 10% = 5400 paise
    { slug: 'pure-desi-ghee-nankhatai', unit_price_paise: 60000, pack_grams: 500, quantity: 1 }, // 30000 paise -> not eligible -> 0
  ];

  const discount = calculatePromoDiscount(items, promo);
  assert.equal(discount, 5400);
});
