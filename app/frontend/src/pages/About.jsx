import SEO from '../components/SEO';
import { BUSINESS } from '../lib/api';
import { MapPin, Sparkles, Heart, ShieldCheck } from 'lucide-react';

export default function About() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "name": "PAHWAJEE",
    "image": "https://pahwajee.com/gallery/2.jpeg",
    "url": "https://pahwajee.com/about",
    "telephone": "+916396339806",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "19 Abu Lane",
      "addressLocality": "Meerut",
      "addressRegion": "Uttar Pradesh",
      "postalCode": "250001",
      "addressCountry": "IN"
    }
  };

  return (
    <div className="noise-bg min-h-screen pb-16 pt-8">
      <SEO 
        title="Our Story: Meerut's Favorite Food Brand | PAHWAJEE"
        description="Learn about PAHWAJEE's roots in Meerut, Uttar Pradesh. Discover our heritage of crafting legendary Desi Ghee Nankhatai, traditional Punjabi Rewri, flaky Gajak, and fresh bakery products."
        schema={schema}
      />
      
      <div className="container-x">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto py-12">
          <p className="eyebrow">A Sweet Legacy in Meerut</p>
          <h1 className="mt-4 text-5xl md:text-6xl font-serif leading-tight">
            Crafting Taste & Memories <span className="italic text-primary">Since Generations</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Nestled in the heart of Abu Lane, Meerut, PAHWAJEE has been the local destination for generations of food lovers seeking authentic Indian sweets, pure ghee delicacies, and contemporary bakery treats.
          </p>
        </section>

        {/* Brand Core Pillars */}
        <section className="grid gap-8 md:grid-cols-3 my-12">
          <div className="card-warm p-8 text-center flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-5">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-2xl mb-3">Legendary Taste</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              From our melt-in-mouth Desi Ghee Nankhatai to the snap-crisp Punjabi Rewri and flaky winter Gajak, we preserve traditional recipes passed down through generations.
            </p>
          </div>

          <div className="card-warm p-8 text-center flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-5">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-2xl mb-3">Uncompromising Purity</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We stand firm on using pure desi ghee, fresh milk, and premium quality dry fruits. Every batch is crafted in a hygienic environment with zero compromises.
            </p>
          </div>

          <div className="card-warm p-8 text-center flex flex-col items-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-5">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-2xl mb-3">Meerut's Pride</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We are proudly local. Every sweet, cake, and gift box is prepared to delight the families of Meerut, supporting local celebrations, festivals, and corporate milestones.
            </p>
          </div>
        </section>

        {/* Narrative Section */}
        <section className="grid md:grid-cols-2 gap-12 items-center my-16 bg-white/40 p-8 md:p-12 rounded-3xl border border-border/55 backdrop-blur-md">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif mb-6 leading-tight">
              The Legend of Abu Lane: Sweets, Bakery & Gifting
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              At PAHWAJEE, we believe food is more than sustenance—it is a celebration of life. What started as a humble local endeavor has blossomed into one of Meerut's most loved food brands. 
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              While we are famous for our winter specialties like Gajak and Til Patti, we serve fresh artisan bread, customized birthday cakes, thick milkshakes, and premium namkeen year-round.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every festival, from Diwali to Raksha Bandhan, Meerut families count on PAHWAJEE for beautifully curated gift hampers and traditional sweets boxes that carry the warmth of home.
            </p>
          </div>
          <div className="relative">
            <img 
              src="/gallery/2.jpeg" 
              alt="PAHWAJEE Store Front in Abu Lane Meerut" 
              className="rounded-2xl object-cover w-full h-[400px] shadow-lg border border-white/80" 
            />
            <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground p-5 rounded-2xl shadow-xl flex items-center gap-3">
              <MapPin className="w-6 h-6 shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-widest text-primary-foreground/75 font-semibold">Store Location</p>
                <p className="font-serif font-bold text-lg">19 Abu Lane, Meerut</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}