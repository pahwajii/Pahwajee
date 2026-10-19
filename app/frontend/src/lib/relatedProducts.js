import { collectionFor } from './catalogueContent.js';
import { compareProducts } from './productOrder.js';

const pairs = [
  ['mango-bite', 'kachha-aam-bite', 'strawberry-bite', 'mixed-fruit-special-bites-combo'],
  ['khajoor-laddoo', 'khajoor-barfi', 'dry-fruit-laddoo'],
];

export function relatedProductsFor(product, products, limit = 4) {
  if (!product || limit < 1) return [];
  const collection = collectionFor(product).to;
  const pair = pairs.find(group => group.includes(product.slug)) || [];
  const available = item => !/unavailable|sold out|out of stock/i.test(item.availability || '');
  const relevance = item => pair.includes(item.slug) ? 2 : collectionFor(item).to === collection ? 1 : 0;
  return [...new Map(products.filter(item => item?.slug && item.slug !== product.slug).map(item => [item.slug, item])).values()]
    .sort((a, b) => Number(available(b)) - Number(available(a)) || relevance(b) - relevance(a) || compareProducts(a, b))
    .slice(0, limit);
}
