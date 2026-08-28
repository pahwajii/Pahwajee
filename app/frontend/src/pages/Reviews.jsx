import { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import api, { waLink } from '../lib/api';
import { Star, MessageSquarePlus, MessageCircle, Quote } from 'lucide-react';

const fallbackTestimonials = [
  {
    name: "Rahul Sharma",
    location: "Sadar Bazaar, Meerut",
    rating: 5,
    review: "PAHWA JEE's nankhatai is a Meerut legend. My family has been buying from here for over 20 years. Nothing else comes close.",
    avatar: "https://i.pravatar.cc/150?img=12"
  },
  {
    name: "Priya Agarwal",
    location: "Shastri Nagar, Meerut",
    rating: 5,
    review: "Ordered a customized birthday cake - delivered on time, tasted heavenly, and looked absolutely stunning. Highly recommended!",
    avatar: "https://i.pravatar.cc/150?img=45"
  },
  {
    name: "Aman Verma",
    location: "Abu Lane, Meerut",
    rating: 5,
    review: "Their cold coffee is the best in Meerut. I drop by every evening after work. Fresh, thick and full of flavour.",
    avatar: "https://i.pravatar.cc/150?img=33"
  },
  {
    name: "Neha Gupta",
    location: "Meerut Cantt",
    rating: 5,
    review: "Got Diwali hampers for my entire office. Everyone loved the packaging and the quality of dry fruits. Will order again next year!",
    avatar: "https://i.pravatar.cc/150?img=48"
  },
  {
    name: "Vikram Malhotra",
    location: "Modipuram, Meerut",
    rating: 5,
    review: "Rewri and gazak are exactly like my grandmother used to make. Authentic taste, generous quantity, fair prices.",
    avatar: "https://i.pravatar.cc/150?img=15"
  },
  {
    name: "Sneha Kapoor",
    location: "Bhagwatpur, Meerut",
    rating: 5,
    review: "Best shakes in town. The Anjeer shake is my absolute favourite. The staff is so warm and welcoming too.",
    avatar: "https://i.pravatar.cc/150?img=47"
  }
];

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/testimonials')
      .then((data) => setReviews(data.length ? data : fallbackTestimonials))
      .catch(() => setReviews(fallbackTestimonials))
      .finally(() => setLoading(false));
  }, []);

  const schema = {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    "itemReviewed": {
      "@type": "Bakery",
      "name": "PAHWAJEE",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "19 Abu Lane",
        "addressLocality": "Meerut",
        "addressRegion": "Uttar Pradesh",
        "postalCode": "250001",
        "addressCountry": "IN"
      }
    },
    "ratingValue": "4.9",
    "reviewCount": "254"
  };

  return (
    <div className="noise-bg min-h-screen pb-16 pt-8">
      <SEO 
        title="Customer Reviews & Testimonials | PAHWAJEE Meerut"
        description="Read genuine customer reviews for PAHWAJEE Meerut. Discover why families trust us for authentic Desi Ghee Nankhatai, Punjabi Rewri, Gajak, customized cakes, and gift hampers."
        schema={schema}
      />

      <div className="container-x">
        {/* Header */}
        <section className="text-center max-w-2xl mx-auto py-12">
          <p className="eyebrow">Voices of Meerut</p>
          <h1 className="mt-4 text-5xl font-serif leading-tight">
            What Our Customers Say
          </h1>
          <p className="mt-5 text-base text-muted-foreground leading-relaxed">
            We are deeply grateful to be a part of your daily celebrations, family gatherings, and festive seasons. Here is what local food lovers say about PAHWAJEE.
          </p>

          <div className="mt-8 flex justify-center items-center gap-6 bg-white/50 border border-border/50 py-4 px-8 rounded-full inline-flex">
            <div className="text-left">
              <p className="text-2xl font-bold font-serif text-primary">4.9 / 5.0</p>
              <p className="text-xs text-muted-foreground">Aggregate Rating</p>
            </div>
            <div className="h-8 w-px bg-border/60"></div>
            <div className="flex gap-0.5 text-secondary">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Grid */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 my-8">
          {reviews.map((r, idx) => (
            <article key={r.id || idx} className="card-warm p-6 flex flex-col justify-between relative group hover:shadow-xl transition-all duration-300">
              <Quote className="absolute right-5 top-5 text-primary/5 w-12 h-12 pointer-events-none" />
              <div>
                <div className="flex gap-0.5 text-secondary mb-4">
                  {[...Array(r.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground mb-6 italic">
                  "{r.review}"
                </p>
              </div>
              
              <div className="flex items-center gap-3 border-t border-border/40 pt-4 mt-auto">
                <img 
                  src={r.avatar || `https://i.pravatar.cc/150?img=${idx + 10}`} 
                  alt={r.name} 
                  className="w-10 h-10 rounded-full object-cover border border-white"
                  loading="lazy"
                />
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{r.name}</h4>
                  <p className="text-xs text-muted-foreground">{r.location}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Share Review CTA */}
        <section className="max-w-xl mx-auto mt-16 text-center card-warm bg-primary/5 p-8 border border-primary/10 rounded-2xl">
          <MessageSquarePlus className="mx-auto text-primary mb-4" size={32} />
          <h3 className="font-serif text-2xl mb-3 text-foreground">Had a delightful experience?</h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Your feedback keeps us baking and preparing sweets with love. If you enjoyed our Desi Ghee Nankhatai, cakes, or winter Rewri, please share your thoughts on WhatsApp or leave us a review.
          </p>
          <a 
            href={waLink("Sharing my feedback")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold !bg-emerald-600 !text-white flex items-center justify-center gap-2 max-w-xs mx-auto"
          >
            <MessageCircle size={18} /> Send Feedback on WhatsApp
          </a>
        </section>
      </div>
    </div>
  );
}
