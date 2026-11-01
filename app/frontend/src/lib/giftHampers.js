export const HAMPER_COLLECTION_SLUG = 'dry-fruit-gift-trays';

// Stable design IDs survive cover and individual photo replacements.
export const giftHamperDesigns = [
  { id: 'peacock-gift-box', name: 'Peacock Dry Fruit Gift Box', image: '/products/Dryfruit-tray1.png' },
  { id: 'golden-platter', name: 'Golden Dry Fruit Platter', image: '/products/Dryfruit-tray2.png' },
  { id: 'floral-gift-box', name: 'Floral Dry Fruit Gift Box', image: '/products/Dryfruit-tray3.png' },
  { id: 'ribbon-hamper', name: 'Ribbon Gift Hamper', image: '/products/Dryfruit-tray4.png' },
  { id: 'festive-trays', name: 'Festive Dry Fruit Trays', image: '/products/Dryfruit-tray5.png' },
  { id: 'celebration-platters', name: 'Celebration Dry Fruit Platters', image: '/products/Dryfruit-tray6.png' },
  { id: 'premium-gift-trays', name: 'Premium Dry Fruit Gift Trays', image: '/products/Dryfruit-tray7.png' },
];

export function designsFor(collection) {
  if (!collection) return [];
  if (Array.isArray(collection.gift_designs)) return collection.gift_designs;
  // Old releases identified this collection by its original photos. Preserve
  // the established designs until the one-time metadata migration is applied.
  if (collection.slug === HAMPER_COLLECTION_SLUG) return giftHamperDesigns;
  const images = new Set(collection.images?.length ? collection.images : [collection.image]);
  return giftHamperDesigns.filter(design => images.has(design.image));
}

export const hamperPath = (design) => `/products/${HAMPER_COLLECTION_SLUG}?design=${encodeURIComponent(design.id)}`;

export function hamperEnquiry(design) {
  let photo = '';
  try {
    const url = new URL(design.image, 'https://pahwajee.in');
    if (url.protocol === 'https:') photo = url.href;
  } catch { /* An invalid older photo must not prevent a shop enquiry. */ }
  return `${design.name}.${photo ? ` Photo: ${photo}.` : ''} Please confirm contents, final price, quantity and delivery or collection date`;
}

export function productGallery(product) {
  const designs = product.slug === HAMPER_COLLECTION_SLUG ? designsFor(product) : [];
  if (designs.length) return designs;
  const photos = product.images?.length ? product.images : product.image ? [product.image] : [];
  return photos.map((image, index) => ({ id: image, name: `${product.name}, photo ${index + 1}`, image }));
}

export function selectedGalleryIndex(gallery, selectedId) {
  return Math.max(0, gallery.findIndex((photo) => photo.id === selectedId));
}
