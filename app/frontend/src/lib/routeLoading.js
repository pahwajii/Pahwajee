const routes = {
  '/': 'Home',
  '/in-store-menu': 'InStoreMenu',
  '/products': 'Products',
  '/shop': 'Products',
  '/favourites': 'Favourites',
  '/cart': 'Cart',
  '/about': 'About',
  '/testimonials': 'Reviews',
  '/reviews': 'Reviews',
  '/faqs': 'FAQs',
  '/contact': 'Contact',
  '/diwali': 'Diwali',
  '/gifting': 'CorporateGifting',
  '/gallery': 'Gallery',
  '/blog': 'Blog',
  ...Object.fromEntries(['terms-and-conditions', 'privacy-policy', 'shipping-policy', 'returns-and-cancellations'].map(path => ['/' + path, 'PolicyPage'])),
  ...Object.fromEntries(['our-specialities', 'nankhatai-meerut', 'rewri-gajak-meerut', 'sweets-meerut', 'bakery-meerut'].map(path => ['/' + path, 'CategoryLanding'])),
};

export function initialPageName(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (routes[path]) return routes[path];
  if (path === '/admin' || path.startsWith('/admin/')) return 'AdminApp';
  if (/^\/products\/[^/]+$/.test(path)) return 'ProductDetail';
  if (/^\/blog\/[^/]+$/.test(path)) return 'BlogArticle';
  return null;
}
