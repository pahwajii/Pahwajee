import { useCart } from '../context/CartContext';
import fallbackProducts from '../generated/catalog.json';
import { boxSlugs } from './mithaiBox';
import { designsFor } from './giftHampers';

const fallbackCatalog = Object.fromEntries(fallbackProducts.map(product => [product.slug, product]));

export default function useGiftCollection() {
  const { catalog, catalogStatus } = useCart();
  // Once loaded, the server is authoritative: never revive a removed product.
  const current = catalogStatus === 'ready' ? catalog : { ...fallbackCatalog, ...catalog };
  const collection = current['dry-fruit-gift-trays'];
  return {
    collection,
    hampers: designsFor(collection),
    boxes: boxSlugs.map(slug => current[slug]).filter(Boolean),
  };
}
