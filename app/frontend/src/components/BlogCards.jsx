import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { blogPath } from '../lib/blog';

export default function BlogCards({ posts, headingLevel = 3 }) {
  const Heading = `h${headingLevel}`;
  return <div className="grid gap-6 md:grid-cols-3">
    {posts.map(post => <article key={post.slug} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <Link to={blogPath(post)} className="group flex h-full flex-col focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-primary">
        <OptimizedImage src={post.image} alt={post.imageAlt} sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, calc(100vw - 32px)" className="aspect-[3/2] w-full object-cover" />
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <Heading className="font-serif text-2xl leading-snug group-hover:underline underline-offset-4">{post.title}</Heading>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
          <span className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-semibold text-primary dark:text-secondary">Read article <ArrowRight size={16} aria-hidden="true" /></span>
        </div>
      </Link>
    </article>)}
  </div>;
}
