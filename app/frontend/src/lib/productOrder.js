// Best sellers come first; catalogue order controls placement within each group.
export function compareProducts(a, b) {
  const priority = product => Number(Boolean(product.bestseller || product.bestSeller));
  return priority(b) - priority(a) || (a.order || 0) - (b.order || 0);
}
