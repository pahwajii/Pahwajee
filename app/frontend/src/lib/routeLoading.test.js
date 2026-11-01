import assert from 'node:assert/strict';
import test from 'node:test';
import { initialPageName } from './routeLoading.js';

test('loads the exact initial route before hydration, including deep links and aliases', () => {
  for (const [path, expected] of [
    ['/', 'Home'], ['/gifting/', 'CorporateGifting'], ['/products', 'Products'],
    ['/shop', 'Products'], ['/products/dry-fruit-gift-trays', 'ProductDetail'],
    ['/blog', 'Blog'], ['/blog/article-slug/', 'BlogArticle'],
    ['/cart', 'Cart'], ['/favourites', 'Favourites'], ['/reviews', 'Reviews'],
    ['/testimonials', 'Reviews'], ['/sweets-meerut', 'CategoryLanding'],
    ['/shipping-policy', 'PolicyPage'], ['/admin/products', 'AdminApp'],
    ['/missing', null], ['/products/missing/nested', null],
  ]) assert.equal(initialPageName(path), expected, path);
});
