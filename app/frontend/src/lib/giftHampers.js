// Stable design IDs connect the Diwali previews to the matching order cards.
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
  const images = new Set(collection.images?.length ? collection.images : [collection.image]);
  return giftHamperDesigns.filter(design => images.has(design.image));
}
