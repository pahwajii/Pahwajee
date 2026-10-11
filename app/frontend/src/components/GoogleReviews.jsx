import { Star, ExternalLink } from 'lucide-react';
import googleReviews from '../../../google-reviews.json';

export const reviews = googleReviews.reviews;

export function GoogleReviewButton({ className = '' }) {
  return <a href={googleReviews.write_review_url} target="_blank" rel="noopener noreferrer" className={`btn-gold inline-flex items-center justify-center gap-2 ${className}`}>
    Review us on Google <ExternalLink size={16} aria-hidden="true" />
  </a>;
}

export function GoogleReviewsLink() {
  return <a href={googleReviews.reviews_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary dark:text-secondary underline underline-offset-4">
    Read all reviews on Google <ExternalLink size={14} aria-hidden="true" />
  </a>;
}

export function GoogleReviewCard({ review }) {
  const initials = review.name.split(' ').filter(word => /[a-z]/i.test(word)).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  return <figure className="card-warm p-5 sm:p-6 flex flex-col h-full">
    <div className="flex items-center justify-between gap-3 mb-4">
      <span className="flex gap-0.5 text-primary dark:text-secondary" role="img" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: review.rating }, (_, i) => <Star key={i} size={16} className="fill-current" aria-hidden="true" />)}
      </span>
      <span className="text-xs text-muted-foreground">Google review</span>
    </div>
    <blockquote className="text-sm leading-relaxed mb-5 flex-1">&ldquo;{review.review}{review.excerpt ? '\u2026' : ''}&rdquo;</blockquote>
    <figcaption className="flex items-center gap-3 border-t border-border/60 pt-4">
      <span aria-hidden="true" className="h-10 w-10 shrink-0 rounded-full bg-primary/10 text-primary dark:bg-secondary/10 dark:text-secondary flex items-center justify-center text-sm font-semibold">{initials}</span>
      <div><p className="font-semibold text-sm">{review.name}</p><p className="text-xs text-muted-foreground">{review.excerpt ? 'Excerpt from Google' : 'Shared on Google'}</p></div>
    </figcaption>
  </figure>;
}
