import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import BlogCards from '../components/BlogCards';
import { blogPosts, blogPath } from '../lib/blog';
import { absoluteUrl } from '../lib/seo';

export default function Blog() {
  return <div className="noise-bg pb-20 pt-8">
    <SEO title="Pahwajee Blog | Sweet Guides, Gifting & Storage Tips" description="Explore Pahwajee’s guides to Rewri, Gajak, Nankhatai and Diwali gifting, with product and shop photos from Meerut." image={blogPosts[0].image} schema={{ '@type': 'Blog', '@id': `${absoluteUrl('/blog')}#blog`, url: absoluteUrl('/blog'), name: 'From Pahwajee', blogPost: blogPosts.map(post => ({ '@type': 'BlogPosting', '@id': `${absoluteUrl(blogPath(post))}#article`, url: absoluteUrl(blogPath(post)), headline: post.title })) }} />
    <div className="container-x">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link to="/" className="inline-flex min-h-11 items-center underline underline-offset-4">Home</Link><span aria-hidden="true"> / </span><span aria-current="page">Blog</span></nav>
      <header className="max-w-2xl py-8 sm:py-12">
        <h1 className="font-serif text-4xl leading-tight sm:text-5xl">From Pahwajee</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">Guides to choosing your sweets, planning festive gifts and caring for your favourites at home.</p>
      </header>
      <section aria-label="Latest articles"><BlogCards posts={blogPosts} headingLevel={2} /></section>
    </div>
  </div>;
}
