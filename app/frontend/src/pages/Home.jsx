import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, MessageCircle, Phone, Sparkles, Star, Award, ShieldCheck, Clock } from 'lucide-react';
import SEO from '../components/SEO';
import api, { BUSINESS, waLink, telLink } from '../lib/api';

const fallbackHero = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&auto=format&fit=crop';

const signatureItems = [
  {
    name: "Pure Desi Ghee Nankhatai",
    desc: "Meerut's legendary melt-in-mouth traditional cookie, baked fresh daily with 100% pure desi ghee.",
    price: "Rs 450/kg",
    image: "https://images.pexels.com/photos/37219215/pexels-photo-37219215.jpeg",
    link: "/nankhatai-meerut"
  },
  {
    name: "Punjabi Style Rewri",
    desc: "Crispy sesame and organic jaggery drops, hand-rolled in the authentic Punjabi tradition.",
    price: "Rs 380/kg",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1200&auto=format&fit=crop",
    link: "/rewri-gajak-meerut"
  },
  {
    name: "Premium Gazak",
    desc: "Light, flaky, and layered winter sesame gazak - a delicate jaggery specialty.",
    price: "Rs 420/kg",
    image: "https://images.unsplash.com/photo-1606755962773-d324e2a2c8ea?w=1200&auto=format&fit=crop",
    link: "/rewri-gajak-meerut"
  }
];

const homeCategories = [
  { name: "Nankhatai & Biscuits", image: "https://images.pexels.com/photos/37219215/pexels-photo-37219215.jpeg", link: "/nankhatai-meerut" },
  { name: "Rewri & Gajak", image: "https://images.unsplash.com/photo-1606755962773-d324e2a2c8ea?w=1200&auto=format&fit=crop", link: "/rewri-gajak-meerut" },
  { name: "Sweets & Mithai", image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=1200&auto=format&fit=crop", link: "/sweets-meerut" },
  { name: "Bakery & Cakes", image: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1200&auto=format&fit=crop", link: "/bakery-meerut" },
  { name: "Diwali Specials", image: "https://images.unsplash.com/photo-1573648952759-a4e0e01e9e6b?w=1200&auto=format&fit=crop", link: "/diwali" },
  { name: "Corporate Gifting", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200&auto=format&fit=crop", link: "/gifting" }
];

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);

  useEffect(() => {
    api.get('/banners').then(setBanners).catch(() => setBanners([]));
    api.get('/products?bestseller=true')
      .then((items) => setBestsellers(items.slice(0, 4)))
      .catch(() => setBestsellers([]));
  }, []);

  const heroImage = banners[0]?.image || fallbackHero;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "name": "PAHWAJEE",
    "image": "https://pahwajee.com/gallery/2.jpeg",
    "@id": "https://pahwajee.com/#bakery",
    "url": "https://pahwajee.com",
    "telephone": "+916396339806",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "19 Abu Lane",
      "addressLocality": "Meerut",
      "addressRegion": "Uttar Pradesh",
      "postalCode": "250001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 29.0060,
      "longitude": 77.7064
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "09:00",
      "closes": "22:30"
    }
  };

  return (
    <div className="noise-bg">
      <SEO 
        title="PAHWAJEE Meerut | Sweets, Nankhatai, Rewri, Gajak & Bakery"
        description="Meerut's trusted destination for Desi Ghee Nankhatai, Punjabi Rewri, Premium Gajak, fresh cakes, pastries, custom hampers, and bulk Diwali gifting. Order on WhatsApp."
        schema={schema}
      />

      {/* Hero Section */}
      <section className="container-x grid min-h-[640px] items-center gap-10 pb-16 pt-16 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center">
          <p className="eyebrow flex items-center gap-1.5"><Sparkles className="w-4.5 h-4.5 text-secondary" /> Trusted For Generations · Meerut</p>
          <h1 className="mt-4 text-5xl leading-tight md:text-6xl font-serif">
            Meerut's Favourite Destination for 
            <span className="block italic text-primary font-bold mt-1">Nankhatai, Rewri, Gajak & Bakery</span>
          </h1>
          <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-muted-foreground">
            Savor the legacy of PAHWAJEE in Abu Lane. Handcrafting our legendary Desi Ghee Nankhatai, traditional Punjabi Rewri, layered Gajak, eggless birthday cakes, and festive gift boxes.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/products" className="btn-primary flex items-center gap-2">
              Explore Products <ArrowRight size={17} />
            </Link>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn-gold !bg-emerald-600 !text-white hover:!bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-600/20">
              <MessageCircle size={17} /> WhatsApp Order
            </a>
            <a href={telLink()} className="btn-outline flex items-center gap-2">
              <Phone size={17} /> Call Store
            </a>
          </div>
        </div>

        <div className="relative">
          <img 
            src={heroImage} 
            alt="Delicious bakery and traditional sweets display at PAHWAJEE Meerut" 
            className="h-[500px] w-full rounded-3xl object-cover shadow-2xl border border-white/60" 
          />
          <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/70 bg-white/90 p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 text-primary shrink-0" size={20} />
              <div>
                <p className="font-semibold font-serif text-lg text-foreground">Visit our local counter</p>
                <p className="text-xs text-muted-foreground mt-0.5">19 Abu Lane, Meerut Cantt. Open daily from 9:00 AM to 10:30 PM.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Products Section */}
      <section className="bg-card/45 border-y border-border/50 py-16">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow">The PAHWAJEE Specialties</p>
            <h2 className="text-4xl font-serif mt-2">Our Signature Recipes</h2>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              These are the products we are famous for. Handcrafted with authentic recipes passed down through generations, utilizing pure ghee and premium ingredients.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {signatureItems.map((item, idx) => (
              <div key={idx} className="card-warm group flex flex-col justify-between hover:shadow-xl transition-all duration-300">
                <div>
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img 
                      src={item.image} 
                      alt={`${item.name} in Meerut`} 
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-2xl mb-2 text-foreground font-semibold">{item.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4">{item.desc}</p>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-2 border-t border-border/30 flex items-center justify-between">
                  <span className="text-sm font-bold text-secondary">{item.price}</span>
                  <Link to={item.link} className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                    View Collection &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Navigation Grid */}
      <section className="py-16">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow">Explore Our Menu</p>
            <h2 className="text-4xl font-serif mt-2">Browse by Category</h2>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              Find exactly what you crave, from traditional winter specials to fresh cream customized cakes.
            </p>
          </div>

          <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
            {homeCategories.map((cat, idx) => (
              <Link to={cat.link} key={idx} className="relative rounded-2xl overflow-hidden group h-40 shadow-sm border border-border/50 block">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors z-10"></div>
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover absolute inset-0 transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center z-20 p-4 text-center">
                  <h3 className="text-white font-serif text-xl md:text-2xl font-bold tracking-wide">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Diwali Promo Banner */}
      <section className="container-x py-8">
        <div className="bg-gradient-to-r from-amber-900 to-primary rounded-3xl overflow-hidden p-8 md:p-12 text-white relative shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:max-w-xl">
            <span className="inline-block rounded-full bg-secondary/20 border border-secondary/30 text-secondary text-[10px] font-bold uppercase tracking-[0.2em] px-3.5 py-1 mb-4">
              Upcoming Festive Season
            </span>
            <h3 className="font-serif text-3xl md:text-4xl font-bold mb-4">Premium Diwali Sweets & Corporate Gift Hampers</h3>
            <p className="text-sm text-primary-foreground/90 leading-relaxed">
              Celebrate the festival of lights with customized dry fruit trays, beautiful sweet boxes, and custom-branded corporate hampers. Pre-orders are now open.
            </p>
          </div>
          <Link to="/diwali" className="btn-gold shrink-0 flex items-center gap-2 hover:-translate-y-0.5">
            Explore Diwali Collection <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Best Sellers Section */}
      {bestsellers.length > 0 && (
        <section className="py-16">
          <div className="container-x">
            <div className="flex items-end justify-between gap-4 mb-10">
              <div>
                <p className="eyebrow">Top Rated</p>
                <h2 className="text-4xl font-serif mt-2">Meerut's Daily Favourites</h2>
              </div>
              <Link to="/products" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                View Full Menu <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {bestsellers.map((p) => (
                <article key={p.id} className="card-warm group flex flex-col justify-between">
                  <Link to={`/products/${p.slug}`}>
                    <div className="aspect-[4/5] overflow-hidden bg-muted">
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <h4 className="font-serif text-lg font-semibold hover:text-primary transition-colors">
                      <Link to={`/products/${p.slug}`}>{p.name}</Link>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">{p.description}</p>
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/20 pt-3">
                      <span className="text-xs font-bold text-secondary">{p.price || 'Price on request'}</span>
                      <a 
                        href={waLink(`Hi PAHWAJEE, I'd like to order: ${p.name}.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Order Now &rarr;
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose PAHWAJEE Section */}
      <section className="bg-card/45 border-y border-border/50 py-16">
        <div className="container-x grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <p className="eyebrow">The PAHWAJEE Standard</p>
            <h2 className="text-4xl font-serif mt-2 mb-6">Generations of Quality & Purity</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-foreground">Generational Recipes</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">Our sweets, nankhatai, rewri, and gajak are prepared using heritage secret techniques passed down through generations, ensuring unmatched flavor.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-foreground">Pure & Fresh Ingredients</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">We enforce zero compromise. Prepared daily with 100% pure desi ghee, fresh whole milk, and finest quality almonds, cashews, and pistachios.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif text-xl font-bold text-foreground">100% Eggless Facility</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">All our bakery cakes, cookies, and pastries are prepared in a strictly vegetarian kitchen, making us the perfect choice for family celebrations.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <img 
              src="/gallery/WhatsApp Image 2026-07-05 at 15.42.02.jpeg" 
              alt="Handcrafted sweets preparation at PAHWAJEE" 
              className="rounded-3xl object-cover h-[380px] w-full shadow-lg border border-white/60"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Visit Us Map Widget */}
      <section className="py-16 container-x grid gap-10 lg:grid-cols-2 items-center">
        <div className="card-warm overflow-hidden h-[400px] border border-border/50">
          <iframe
            src={BUSINESS.mapEmbed}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="PAHWAJEE Google Maps Location"
          ></iframe>
        </div>

        <div>
          <p className="eyebrow">Local Store</p>
          <h2 className="text-4xl font-serif mt-2 mb-6">Drop By Our Abu Lane Store</h2>
          <p className="text-muted-foreground leading-relaxed text-sm mb-6">
            Located in the heart of Abu Lane shopping district in Meerut, our store displays a fresh selection of bakery goods, traditional sweets, namkeens, and cold thick milkshakes daily. 
          </p>

          <div className="space-y-4 mb-6">
            <div className="flex gap-3 text-sm text-muted-foreground">
              <MapPin className="text-primary w-5 h-5 shrink-0" />
              <span>{BUSINESS.address}</span>
            </div>
            <div className="flex gap-3 text-sm text-muted-foreground">
              <Clock className="text-primary w-5 h-5 shrink-0" />
              <span>{BUSINESS.hours}</span>
            </div>
            <div className="flex gap-3 text-sm text-muted-foreground">
              <Phone className="text-primary w-5 h-5 shrink-0" />
              <span>{BUSINESS.phones.join(', ')}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <a href={BUSINESS.mapLink} target="_blank" rel="noopener noreferrer" className="btn-primary">Get Directions</a>
            <a href={telLink()} className="btn-outline flex items-center gap-2"><Phone size={16} /> Call Store</a>
          </div>
        </div>
      </section>
    </div>
  );
}
