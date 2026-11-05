import { isRewriGajak, isNankhatai, isSweet, isGift } from './catalogueContent.js';
import { packPrice } from './cart.js';

export const PROMO_STORAGE_DISMISS_KEY = 'pahwa-promo-dismissed';

export const DEFAULT_PROMO = {
  active: true,
  text: 'Shop today and get 10% off on all website orders! 10% off on Rewri & Gajak',
  discount_percent: 10,
  category: 'rewri-gajak',
  cta_text: 'Shop Rewri & Gajak',
  cta_link: '/rewri-gajak-meerut',
  start_date: '',
  end_date: '',
};

export function isPromoActive(promo) {
  if (!promo || !promo.active) return false;
  const now = new Date();
  if (promo.start_date) {
    const start = new Date(promo.start_date);
    if (!isNaN(start.getTime()) && now < start) return false;
  }
  if (promo.end_date) {
    const end = new Date(promo.end_date);
    if (!isNaN(end.getTime()) && now > end) return false;
  }
  return true;
}

export function isProductEligible(product, promo) {
  if (!product || !isPromoActive(promo)) return false;
  const percent = Number(promo.discount_percent);
  if (!Number.isFinite(percent) || percent <= 0) return false;

  const cat = (promo.category || 'rewri-gajak').toLowerCase().trim();
  if (cat === 'all') return true;
  if (['rewri-gajak', 'rewri-gazak', 'gajak', 'rewri'].includes(cat)) {
    return isRewriGajak(product);
  }
  if (cat === 'nankhatai') {
    return isNankhatai(product);
  }
  if (cat === 'sweets') {
    return isSweet(product);
  }
  if (cat === 'gifting') {
    return isGift(product);
  }
  if (cat === 'bakery') {
    return product.category === 'bakery' || /cake|pastry|biscuit/.test(product.slug || '');
  }
  return product.category === cat;
}

export function calculatePromoDiscount(items, promo) {
  if (!isPromoActive(promo) || !items?.length) return 0;
  const rate = Number(promo.discount_percent) / 100;
  if (rate <= 0) return 0;

  return items.reduce((total, item) => {
    if (!isProductEligible(item, promo)) return total;
    const linePaise = packPrice(item.unit_price_paise, item.pack_grams) * item.quantity;
    return total + Math.round(linePaise * rate);
  }, 0);
}

