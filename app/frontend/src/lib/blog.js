import { blogSummaries } from './blogSummaries.js';
import { blogContent } from './blogContent.js';

export { blogPath, blogDate } from './blogSummaries.js';
// Publication dates remain editorial dates, not regenerated on each build.
export const blogPosts = blogSummaries.map(post => ({ ...post, ...blogContent[post.slug] }));
