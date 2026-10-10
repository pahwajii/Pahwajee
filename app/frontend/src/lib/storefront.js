import galleryOnlySlugs from '../../../gallery-only-products.json';

export const isStoreProduct = (product) => !galleryOnlySlugs.includes(product.slug);
export const isGalleryOnlySlug = (slug) => galleryOnlySlugs.includes(slug);
