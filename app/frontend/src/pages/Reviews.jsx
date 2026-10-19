import SEO from '../components/SEO';
import { writtenReviews, ratingOnlyReviews, reviewsCheckedDate, GoogleReviewCard, GoogleReviewButton, GoogleReviewsLink } from '../components/GoogleReviews';

export default function Reviews() {
  return (
    <div className="noise-bg min-h-screen pb-16 pt-8">
      <SEO title="Google Customer Reviews | PAHWAJEE Meerut" description="Read selected Google customer reviews of PAHWAJEE's rewri, gajak, nankhatai, sweets and sandwiches. Share your own experience on Google." />
      <div className="container-x">
        <header className="text-center max-w-2xl mx-auto py-8 sm:py-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif leading-tight">What Our Customers Say</h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground">Our customers' Google reviews, with the latest written reviews first.</p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
            <GoogleReviewButton />
            <GoogleReviewsLink />
          </div>
        </header>
        <section aria-label="Google customer reviews, newest first" className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 my-4">
          {writtenReviews.map(review => <GoogleReviewCard key={review.id} review={review} />)}
        </section>
        {ratingOnlyReviews.length > 0 && <section aria-labelledby="google-ratings-heading" className="mt-10">
          <h2 id="google-ratings-heading" className="font-serif text-xl sm:text-2xl">More ratings from our customers</h2>
          <p className="mt-2 text-sm text-muted-foreground">These customers left a star rating without a written comment.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-5">
            {ratingOnlyReviews.map(review => <GoogleReviewCard key={review.id} review={review} />)}
          </div>
        </section>}
        <p className="mt-6 text-center text-xs text-muted-foreground">Updated from Google on {reviewsCheckedDate}. Visit Google for reviews posted since then.</p>
      </div>
    </div>
  );
}
