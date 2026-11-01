// Build-only route inventory. Client SEO does not import article/catalogue lists.
import { policyPages } from './policies.js';
import { blogSummaries, blogPath } from './blogSummaries.js';

export const PUBLIC_PATHS = ['/', '/products', '/in-store-menu', '/our-specialities', '/nankhatai-meerut', '/rewri-gajak-meerut', '/sweets-meerut', '/bakery-meerut', '/gifting', '/diwali', '/about', '/contact', '/gallery', '/testimonials', '/faqs', '/blog', ...Object.keys(policyPages).map(slug => '/' + slug), ...blogSummaries.map(blogPath)];
