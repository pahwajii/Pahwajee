import SEO from '../components/SEO';
import { reviews, GoogleReviewCard, GoogleReviewButton, GoogleReviewsLink } from '../components/GoogleReviews';

export default function Reviews() {
  return (
    <div className="noise-bg min-h-screen pb-16 pt-8">
      <SEO title="Google Customer Reviews | PAHWAJEE Meerut" description="Read selected Google customer reviews of PAHWAJEE's rewri, gajak, nankhatai, sweets and sandwiches. Share your own experience on Google." />
      <div className="container-x">
        <header className="text-center max-w-2xl mx-auto py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif leading-tight">What Our Customers Say</h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground">Selected reviews from our Google listing, in our customers' own words.</p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
            <GoogleReviewButton />
            <GoogleReviewsLink />
          </div>
        </header>
        <section aria-label="Selected Google customer reviews" className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 my-4">
          {reviews.map(review => <GoogleReviewCard key={review.id} review={review} />)}
        </section>
        <p className="mt-6 text-center text-xs text-muted-foreground">Selected from Google on 11 October 2026. Visit Google for the latest reviews.</p>
      </div>
    </div>
  );
}
