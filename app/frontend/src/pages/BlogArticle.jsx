import { Link, useParams } from 'react-router-dom';
import { ArrowRight, MessageCircle } from 'lucide-react';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';
import BlogCards from '../components/BlogCards';
import NotFound from './NotFound';
import { blogPosts, blogPath, blogDate } from '../lib/blog';
import { absoluteUrl, SITE_URL } from '../lib/seo';
import { waLink } from '../lib/api';

const textLink = 'inline-flex min-h-11 items-center gap-2 font-semibold text-primary dark:text-secondary underline underline-offset-4';

export default function BlogArticle() {
  const { slug } = useParams();
  const post = blogPosts.find(item => item.slug === slug);
  if (!post) return <NotFound />;
  const url = absoluteUrl(blogPath(post));
  const schema = {
    '@type': 'BlogPosting', '@id': `${url}#article`, url,
    headline: post.title, description: post.description,
    image: [absoluteUrl(post.image), ...post.sections.filter(section => section.photo).map(section => absoluteUrl(section.photo.src))],
    datePublished: post.datePublished, inLanguage: 'en-IN',
    author: { '@type': 'Organization', name: 'PAHWA JEE', url: absoluteUrl('/about') },
    publisher: { '@id': `${SITE_URL}/#business` },
    mainEntityOfPage: { '@id': `${url}#webpage` },
    isPartOf: { '@id': `${absoluteUrl('/blog')}#blog` },
  };
  return <div className="noise-bg pb-16 pt-8">
    <SEO title={post.seoTitle} description={post.description} image={post.image} type="article" schema={schema} />
    <div className="container-x">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
        <Link to="/" className="inline-flex min-h-11 items-center underline underline-offset-4">Home</Link><span aria-hidden="true">/</span>
        <Link to="/blog" className="inline-flex min-h-11 items-center underline underline-offset-4">Blog</Link><span aria-hidden="true">/</span>
        <span aria-current="page" className="py-2">{post.title}</span>
      </nav>
      <article>
        <header className="grid items-center gap-8 py-8 lg:grid-cols-2 lg:gap-12 lg:py-12">
          <div>
            <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{post.title}</h1>
            <p className="mt-5 text-sm text-muted-foreground">By <Link to="/about" className="underline underline-offset-4">PAHWA JEE</Link><span aria-hidden="true"> · </span><time dateTime={post.datePublished}>{blogDate(post.datePublished)}</time></p>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">{post.introduction}</p>
          </div>
          <div>
            <OptimizedImage src={post.image} alt={post.imageAlt} loading="eager" fetchPriority="high" sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, calc(100vw - 32px)" className="aspect-[4/3] w-full rounded-2xl object-cover border border-border" />
          </div>
        </header>
        <div className="mx-auto max-w-3xl space-y-10 pt-6">
          {post.sections.map((section, index) => <section key={section.heading} aria-labelledby={`article-section-${index}`}>
            <h2 id={`article-section-${index}`} className="font-serif text-2xl leading-snug sm:text-3xl">{section.heading}</h2>
            {section.comparison && <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {section.comparison.map(item => <div key={item.name} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-serif text-2xl">{item.name}</h3>
                <dl className="mt-4 space-y-3 text-sm leading-relaxed">
                  <div><dt className="font-semibold">Shape</dt><dd className="text-muted-foreground">{item.shape}</dd></div>
                  <div><dt className="font-semibold">Texture</dt><dd className="text-muted-foreground">{item.texture}</dd></div>
                  <div><dt className="font-semibold">Choose it for</dt><dd className="text-muted-foreground">{item.choice}</dd></div>
                </dl>
              </div>)}
            </div>}
            {section.paragraphs?.map(paragraph => <p key={paragraph} className="mt-4 text-base leading-7 text-muted-foreground">{paragraph}</p>)}
            {section.list && <ul className="mt-4 list-disc space-y-3 pl-6 text-base leading-7 text-muted-foreground">{section.list.map(item => <li key={item}>{item}</li>)}</ul>}
            {section.links && <div className="mt-4 flex flex-col items-start gap-1">{section.links.map(link => <Link key={link.to} to={link.to} className={textLink}>{link.label}<ArrowRight size={16} className="shrink-0" aria-hidden="true" /></Link>)}</div>}
            {section.photo && <figure className="mt-6">
              <OptimizedImage src={section.photo.src} alt={section.photo.alt} sizes="(min-width: 768px) 500px, calc(100vw - 32px)" className="mx-auto max-h-[520px] w-full rounded-xl object-contain" />
              <figcaption className="mt-3 text-center text-sm leading-relaxed text-muted-foreground">{section.photo.caption}</figcaption>
            </figure>}
          </section>)}
          <aside className="rounded-2xl border border-border bg-card p-6 sm:p-8" aria-label="Shop this guide">
            <h2 className="font-serif text-2xl">{post.cta.heading}</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to={post.cta.to} className="btn-primary inline-flex min-h-11 items-center gap-2">{post.cta.label}<ArrowRight size={16} aria-hidden="true" /></Link>
              <a href={waLink(post.cta.enquiry)} target="_blank" rel="noopener noreferrer" className="btn-outline inline-flex min-h-11 items-center gap-2 dark:text-secondary dark:border-secondary"><MessageCircle size={16} aria-hidden="true" />Ask on WhatsApp</a>
            </div>
          </aside>
        </div>
      </article>
      <section className="mt-16 border-t border-border pt-10" aria-labelledby="related-articles-heading">
        <h2 id="related-articles-heading" className="mb-6 font-serif text-3xl">More from Pahwajee</h2>
        <BlogCards posts={blogPosts.filter(item => item.slug !== post.slug)} />
      </section>
    </div>
  </div>;
}
