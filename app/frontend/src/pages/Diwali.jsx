import SEO from '../components/SEO';
import { waLink, telLink } from '../lib/api';
import { MessageCircle, Phone, Sparkles, Gift, ShieldCheck, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const packages = [
  {
    name: "Dry Fruit Trays",
    desc: "Premium wooden trays filled with handpicked cashew, almond, pistachio, and raisin assortments.",
    price: "Rs 1200+",
    image: "https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=1200&auto=format&fit=crop"
  },
  {
    name: "Diwali Gift Hampers",
    desc: "Exquisite celebratory boxes curated with premium dry fruits, authentic laddoos, candles, and decorative diyas.",
    price: "Rs 1500+",
    image: "https://images.unsplash.com/photo-1573648952759-a4e0e01e9e6b?w=1200&auto=format&fit=crop"
  },
  {
    name: "Dry Fruit Sweets",
    desc: "Luxury Indian mithai assortments including Kaju Katli, Badam Barfi, and Anjeer Roll made with pure desi ghee.",
    price: "Rs 950/kg",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1200&auto=format&fit=crop"
  },
  {
    name: "Premium Customized Hampers",
    desc: "Tailored to your needs. Pick your own selection of signature sweets, cookies, bakery products, and packaging boxes.",
    price: "On Request",
    image: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=1200&auto=format&fit=crop"
  }
];

const diwaliFAQs = [
  {
    question: "Do you offer personalized corporate branding on Diwali hampers?",
    answer: "Yes, for bulk orders we can customize box printing, insert personalized cards, and print company logos. Please order at least 7-10 days in advance."
  },
  {
    question: "Can I customize the items in my gift box?",
    answer: "Absolutely! You can choose your combinations of pure desi ghee nankhatai, dry fruits, traditional sweets, namkeen, or premium cookies."
  },
  {
    question: "Do you deliver bulk orders across Meerut?",
    answer: "Yes, we handle bulk deliveries to offices and residential addresses across Meerut. Delivery scheduling details can be aligned during order confirmation."
  }
];

export default function Diwali() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": diwaliFAQs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  };

  return (
    <div className="noise-bg min-h-screen pb-16 pt-8">
      <SEO 
        title="Diwali Sweets & Gift Hampers in Meerut | PAHWAJEE"
        description="Celebrate Diwali with PAHWAJEE Meerut. Browse premium Diwali gift boxes, customized corporate hampers, dry fruit trays, and pure desi ghee sweets. Order on WhatsApp."
        schema={schema}
      />

      {/* Hero Banner */}
      <section className="container-x py-12">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-950 via-primary to-amber-950 text-white p-8 md:p-16 shadow-2xl flex flex-col items-center text-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-300 via-transparent to-transparent"></div>
          
          <div className="h-14 w-14 rounded-full bg-secondary/20 flex items-center justify-center text-secondary mb-6 border border-secondary/30">
            <Sparkles className="w-7 h-7" />
          </div>

          <p className="eyebrow text-secondary tracking-[0.3em] font-semibold">Festive Gifting 2026</p>
          <h1 className="mt-4 text-4xl md:text-6xl font-serif leading-tight max-w-3xl">
            Bring Home the Sparkle with <span className="text-secondary font-bold">PAHWAJEE's Diwali Collection</span>
          </h1>
          <p className="mt-6 text-base md:text-lg text-primary-foreground/90 max-w-2xl leading-relaxed">
            Delight your family, friends, and corporate associates in Meerut with our handpicked dry fruit trays, premium sweet boxes, and custom-made festival hampers.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a 
              href={waLink("Hi PAHWAJEE, I am interested in your Diwali gift hampers. Please share catalog & price details.")}
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-gold !bg-emerald-600 !text-white hover:!bg-emerald-700 flex items-center gap-2"
            >
              <MessageCircle size={18} /> Order on WhatsApp
            </a>
            <Link to="/gifting" className="btn-primary flex items-center gap-2">
              Corporate Bulk Quote <ArrowRight size={16} />
            </Link>
            <a href={telLink()} className="btn-outline !border-white !text-white hover:!bg-white hover:!text-primary flex items-center gap-2">
              <Phone size={16} /> Call Store
            </a>
          </div>
        </div>
      </section>

      {/* Collection Grid */}
      <section className="container-x my-12">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="eyebrow">A Taste of Festivity</p>
          <h2 className="text-4xl font-serif mt-2">Premium Diwali Hampers & Sweets</h2>
          <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
            Handcrafted treats packed in elegant celebratory boxes. Designed to express appreciation and share joy.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {packages.map((pkg, idx) => (
            <article key={idx} className="card-warm group hover:shadow-xl transition-all duration-300">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img 
                  src={pkg.image} 
                  alt={pkg.name} 
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <h3 className="font-serif text-2xl mb-2 text-foreground font-semibold">{pkg.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 min-h-[48px]">{pkg.desc}</p>
                <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-2">
                  <span className="text-sm font-bold text-secondary">{pkg.price}</span>
                  <a 
                    href={waLink(`Hi PAHWAJEE, I'd like to order: ${pkg.name}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
                  >
                    Order Now &rarr;
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Gifting Quality Pillars */}
      <section className="container-x my-16 bg-white/40 dark:bg-card/30 border border-border/50 rounded-3xl p-8 md:p-12 grid gap-8 md:grid-cols-3">
        <div className="flex gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-xl font-bold mb-1.5">Custom Combinations</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Mix and match premium sweets, traditional nankhatai, gourmet cookies, and savories in custom packaging.</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-xl font-bold mb-1.5">Assured Quality</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">All products are baked fresh and sweets are made using 100% pure desi ghee and hand-selected nuts.</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-xl font-bold mb-1.5">Seamless Delivery</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Dedicated local delivery across Meerut ensures your hampers reach clients and loved ones fresh and intact.</p>
          </div>
        </div>
      </section>

      {/* Diwali FAQs */}
      <section className="container-x max-w-3xl my-16">
        <h3 className="font-serif text-3xl text-center mb-8">Diwali Order Information</h3>
        <div className="space-y-4">
          {diwaliFAQs.map((faq, idx) => (
            <div key={idx} className="card-warm p-6 bg-white/60 dark:bg-card/40">
              <h4 className="font-serif text-lg font-bold flex gap-2 items-center text-foreground mb-2">
                <HelpCircle className="w-5 h-5 text-primary shrink-0" /> {faq.question}
              </h4>
              <p className="text-sm text-muted-foreground pl-7 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
