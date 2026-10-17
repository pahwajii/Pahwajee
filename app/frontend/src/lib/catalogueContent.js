// Editorial facts shared by visible pages and structured data. Prices and
// availability always come from the catalogue, never from this copy.
export const isRewriGajak = p => /rewri|gazak|gajak|chikki|til-peanut|til-patti/.test(p.slug || '');
export const isNankhatai = p => /nankhatai/.test(p.slug || '');
export const isGift = p => p.category === 'festival-collection';
export const isSweet = p => !isGift(p) && /laddoo|pinni|bite|barfi|halwa|louch|panjeeri|til-bugga|gur-ke-sev|murmura/.test(p.slug || '');

export const collectionFor = product => isGift(product)
  ? { to: '/gifting', label: 'Gift hampers & mithai boxes', guide: '/blog/diwali-gift-hampers-meerut-guide', guideLabel: 'How to choose a gift hamper' }
  : isNankhatai(product)
    ? { to: '/nankhatai-meerut', label: 'Nankhatai in Meerut', guide: '/blog/how-to-store-nankhatai', guideLabel: 'How to store Nankhatai' }
    : isRewriGajak(product)
      ? { to: '/rewri-gajak-meerut', label: 'Rewri & Gajak in Meerut', guide: '/blog/rewri-gajak-chikki-difference', guideLabel: 'Rewri, Gajak or Chikki: compare the textures' }
      : { to: '/sweets-meerut', label: 'Sweets & laddoos in Meerut', guide: '/blog/diwali-gift-hampers-meerut-guide', guideLabel: 'Choosing sweets for a gift box' };

const descriptions = {
  'khasta-rewri': 'Khasta Rewri is Pahwajee’s sesame-coated, crisp rewri in small individual pieces. Compare it with our thinner Chips Rewri or pair it with a different texture from the Gajak collection.',
  'chips-rewri': 'Chips Rewri is the thin, crisp option in Pahwajee’s rewri selection. Choose it for a different shape and bite from the small pieces of Khasta Rewri.',
  'gol-gazak': 'Gol Gazak is the round-shaped variety in Pahwajee’s Meerut gajak collection. Compare it with flaky Dilkhush Gazak or our roll varieties when choosing a winter sweet to share.',
  'dilkhush-gazak': 'Dilkhush Gazak is the soft, flaky option in Pahwajee’s gajak collection. It offers a different texture from crisp Rewri and firm Peanut Chikki.',
  'pure-desi-ghee-nankhatai': 'Pahwajee’s Pure Desi Ghee Nankhatai is a traditional tea-time biscuit made with pure desi ghee. Choose this variety for its ghee base; our separately listed Vanaspati Ghee Nankhatai uses vanaspati instead.',
  'vanaspati-ghee-nankhatai': 'This Nankhatai is prepared with Vanaspati Ghee. It is a separate variety from Pahwajee’s Pure Desi Ghee Nankhatai, with its own price and pack options shown here.',
  'dry-fruit-gift-trays': 'Choose a dry fruit gift box, tray or platter for a family celebration, wedding or corporate gift. Designs have different contents and prices: send your preferred photo, quantity and required date so the store can confirm the exact assortment and quote.',
  'dry-fruit-laddoo': 'Dry Fruit Laddoo is part of Pahwajee’s nut-and-fruit sweets selection. You can also choose a 250 g section for a custom mithai box. Ask the store about the full ingredients and added sweeteners before ordering for any dietary requirement.',
  'khajoor-laddoo': 'Khajoor Laddoo is the round date-sweet option in our collection. Compare it with Khajoor Barfi, or include a 250 g section in a custom 1 kg mithai box.',
  'khajoor-barfi': 'Khajoor Barfi is our date sweet in barfi form. It is listed separately from Khajoor Laddoo and can be selected as a 250 g section in a custom mithai box.',
  'mango-bite': 'Mango Bite is the mango-flavoured option in our fruit bites collection. Buy the pack shown here, combine it with Kachha Aam and Strawberry in the Mixed Fruit box, or choose it for a custom box.',
  'kachha-aam-bite': 'Kachha Aam Bite is the raw-mango-flavoured option in our fruit bites collection. It is also part of the Mixed Fruit Special Bites Combo with Mango and Strawberry.',
  'strawberry-bite': 'Strawberry Bite is the strawberry-flavoured option in our fruit bites collection. Compare it with Mango and Kachha Aam bites, or choose the Mixed Fruit box to include all three flavours.',
  'gheeye-ki-louch': 'Gheeye Ki Louch is Pahwajee’s bottle-gourd sweet, cut into pieces and shown with a nut garnish. Check the available pack sizes here or select a 250 g section in a custom mithai box.',
  'mawa-malai-gajar-barfi': 'Mawa Malai Gajar Barfi combines a carrot-sweet layer with a pale mawa-malai layer and a nut garnish. Check the availability notice before planning an order; the store can confirm when this seasonal item returns.',
  'desi-ghee-gajar-ka-halwa': 'Pahwajee’s Desi Ghee Gajar Ka Halwa is a seasonal carrot sweet. Check the current availability below before ordering or visiting; contact the store for the next available batch.',
  'jachha-bachha-panjeeri': 'Jachha Bachha Panjeeri is prepared only on special order and is not kept available at all times. Share your required quantity and date with the store to confirm preparation, ingredients and collection arrangements.',
};

export const productDescription = product => descriptions[product.slug] || product.description || `${product.name} from Pahwajee, Meerut. Check the listed pack options and contact the store for ingredients and availability.`;

export function availabilityNote(product) {
  if (product.availability === 'Special order only') return 'Prepared only on special order. Confirm the required quantity and date with the store before planning collection.';
  if (/unavailable|sold out|out of stock/i.test(product.availability || '')) return 'Temporarily unavailable. Ordering is paused; ask the store when it will be available again. No return date is confirmed.';
  return 'Check availability for your required quantity and date when placing your order, especially for winter sweets and gifting.';
}

export function productSpecs(product) {
  const ingredients = product.slug === 'pure-desi-ghee-nankhatai' ? 'Made with pure desi ghee. Ask for the full ingredient and allergen list.'
    : product.slug === 'vanaspati-ghee-nankhatai' ? 'Made with Vanaspati Ghee. Ask for the full ingredient and allergen list.'
      : product.slug === 'roasted-peanut-chikki' ? 'Contains peanuts. Ask for the complete ingredient and allergen list.'
        : 'Ask the store for the full ingredient and allergen list for this variety. Recipes differ between products.';
  return { ingredients, storage: isNankhatai(product) || isRewriGajak(product)
    ? 'Keep in an airtight container away from moisture. Follow the pack’s storage and best-before instructions.'
    : 'Follow the storage and best-before instructions supplied with your order. Confirm refrigeration and travel suitability with the store.' };
}
