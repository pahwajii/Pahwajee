export const CART_STORAGE_KEY = 'pahwa-cart-v1';
export const PACK_SIZES = [500, 1000];
export const formatMoney = (paise) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
}).format(paise / 100).replace(/\.00$/, '');

export const lineKey = (item) => `${item.slug}:${item.pack_grams || 'unit'}`;
export const packLabel = (grams, unit = 'piece') => grams ? (grams === 1000 ? '1kg' : `${grams}g`) : (unit === 'plate' ? 'plate' : 'piece');
export const packPrice = (price, grams) => grams ? Math.round(price * grams / 1000) : price;

export function canPurchase(product) {
  return Boolean(product?.cart_eligible && product.availability === 'Available'
    && Number.isSafeInteger(product.unit_price_paise) && product.unit_price_paise > 0);
}

export function restoreCart(raw) {
  try {
    const parsed = JSON.parse(raw || '[]');
    if (!Array.isArray(parsed)) return [];
    const seen = new Set();
    return parsed.filter((item) => {
      if (!item || typeof item.slug !== 'string' || !/^[a-z0-9-]{1,160}$/.test(item.slug)
        || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99
        || !Number.isSafeInteger(item.unit_price_paise) || item.unit_price_paise <= 0
        || (item.pack_grams !== null && !PACK_SIZES.includes(item.pack_grams))
        || !['kg', 'plate', 'piece'].includes(item.sale_unit)
        || (item.sale_unit === 'kg') !== Boolean(item.pack_grams) || seen.has(lineKey(item))) return false;
      seen.add(lineKey(item));
      return true;
    }).slice(0, 50).map((item) => ({
      slug: item.slug, pack_grams: item.pack_grams, quantity: item.quantity,
      unit_price_paise: item.unit_price_paise, sale_unit: item.sale_unit,
      name: typeof item.name === 'string' ? item.name.slice(0, 160) : item.slug,
      image: typeof item.image === 'string' && item.image.startsWith('/') ? item.image : '',
    }));
  } catch {
    return [];
  }
}

export function addCartItem(items, product, pack, quantity) {
  if (!canPurchase(product)) throw new Error('This item is not available to add.');
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error('Choose a quantity from 1 to 99.');
  if ((product.sale_unit === 'kg' && !PACK_SIZES.includes(pack)) || (product.sale_unit !== 'kg' && pack !== null)) throw new Error('Choose a valid pack size.');
  const key = lineKey({ slug: product.slug, pack_grams: pack });
  const existing = items.find((item) => lineKey(item) === key);
  if (existing && existing.quantity + quantity > 99) throw new Error('Maximum 99 packs per cart item.');
  if (!existing && items.length >= 50) throw new Error('Your cart can hold up to 50 different packs.');
  const added = {
    slug: product.slug, name: product.name, image: product.image, sale_unit: product.sale_unit,
    unit_price_paise: product.unit_price_paise, pack_grams: pack,
    quantity: (existing?.quantity || 0) + quantity,
  };
  return existing ? items.map((item) => lineKey(item) === key ? added : item) : [...items, added];
}

export function reconcileCart(items, catalog) {
  let priceChanged = false;
  const updated = items.map((item) => {
    const product = catalog[item.slug];
    if (!canPurchase(product) || product.sale_unit !== item.sale_unit) return item;
    if (item.unit_price_paise !== product.unit_price_paise) priceChanged = true;
    return { ...item, name: product.name, image: product.image, unit_price_paise: product.unit_price_paise };
  });
  return { items: updated, priceChanged };
}
