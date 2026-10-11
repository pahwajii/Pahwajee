import config from '../../../mithai-boxes.json' with { type: 'json' };
import { canPurchase, formatMoney, packPrice } from './cart.js';

export const boxSlugs = config.boxSlugs;
export const isMithaiBox = slug => boxSlugs.includes(slug);
export const hasAssortmentPhoto = slug => config.assortmentPhotos.includes(slug);
export const PORTION_GRAMS = config.portionGrams;
export const PORTION_COUNT = config.portionCount;
export const customSweetSlugs = config.customSweetSlugs;
export const canChooseSweet = product => customSweetSlugs.includes(product?.slug) && product.sale_unit === 'kg' && canPurchase(product);

// A custom box is an enquiry, not a client-priced cart/order line.
export function quoteCustomBox(selectedSlugs, catalog) {
  if (!Array.isArray(selectedSlugs) || selectedSlugs.length > PORTION_COUNT) throw new Error('Choose up to four 250 g sections.');
  const lines = selectedSlugs.map(slug => {
    const product = catalog[slug];
    const available = canChooseSweet(product);
    return { slug, name: product?.name || slug, available, grams: PORTION_GRAMS,
      unitPricePaise: available ? product.unit_price_paise : null,
      pricePaise: available ? packPrice(product.unit_price_paise, PORTION_GRAMS) : null };
  });
  const valid = lines.every(line => line.available);
  return { lines, valid, complete: valid && lines.length === PORTION_COUNT,
    grams: lines.length * PORTION_GRAMS,
    totalPaise: valid ? lines.reduce((total, line) => total + line.pricePaise, 0) : null };
}

export function customBoxEnquiry(quote) {
  if (!quote.complete) throw new Error('Choose four available sweets before enquiring.');
  return [
    'Hi PAHWAJEE, I would like to enquire about this custom 1 kg mithai box:',
    ...quote.lines.map((line, index) => `${index + 1}. ${line.name} - 250 g at ${formatMoney(line.unitPricePaise)}/kg = ${formatMoney(line.pricePaise)}`),
    `Total: ${formatMoney(quote.totalPaise)} for 1 kg. No extra packaging charge.`,
    'Please confirm availability and fulfilment.'
  ].join('\n');
}
