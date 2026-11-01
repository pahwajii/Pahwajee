import { useCart } from '../context/CartContext';
import fallbackProducts from '../generated/catalog.json';
import { boxSlugs } from './mithaiBox';
import { designsFor } from './giftHampers';
import { currentCatalogue } from './catalogueState';

export default function useGiftCollection() {
  const { catalog, catalogLoaded } = useCart();
  // Once loaded, the server is authoritative: never revive a removed product.
  const current = currentCatalogue(catalog, catalogLoaded, fallbackProducts);
  const collection = current['dry-fruit-gift-trays'];
  return {
    collection,
    hampers: designsFor(collection),
    boxes: boxSlugs.map(slug => current[slug]).filter(Boolean),
  };
}
