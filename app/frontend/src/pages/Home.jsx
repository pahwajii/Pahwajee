import { reviews, GoogleReviewCard, GoogleReviewButton } from '../components/GoogleReviews';
import { displayPrice } from '../lib/cart';
import OptimizedImage from '../components/OptimizedImage';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, MessageCircle, Phone, Sparkles, Award, ShieldCheck, Clock, Gift, Heart } from 'lucide-react';
import SEO from '../components/SEO';
import AddToCart from '../components/AddToCart';
import { useCart } from '../context/CartContext';
import { BUSINESS, waLink, telLink } from '../lib/api';

const realHeroImage = '/our_shop_main.jpeg';

const signatureRewri = {
  slug: "khasta-rewri",
  name: "Khasta Rewri",
  desc: "Crispy sesame and organic jaggery drops, hand-rolled in authentic Punjabi tradition. Made fresh for winter in Meerut.",
  price: "Rs 540/kg",
  image: "/products/Khasta-rewri.png",
  link: "/rewri-gajak-meerut"
};

const signatureGajak = {
  slug: "dilkhush-gazak",
  name: "Dilkhush Gazak",
  desc: "Light, flaky, melt-in-mouth sesame gazak prepared with organic jaggery, cardamom, and premium nuts.",
  price: "Rs 700/kg",
  image: "/products/dilkhush-gazzak.png",
  link: "/rewri-gajak-meerut"
};

const signatureNankhatai = {
  slug: "pure-desi-ghee-nankhatai",
  name: "Pure Desi Ghee Nankhatai",
  desc: "Meerut's legendary traditional cookie baked with 100% pure desi ghee. Crumbly, rich, and unforgettable.",
  price: "Rs 600/kg",
  image: "/products/nankhatayi.png",
  link: "/nankhatai-meerut"
};

const winterFavourites = [
  { slug: "til-bugga", name: "Til Bugga", desc: "Traditional winter delicacy made of roasted sesame, khoya & cardamom.", price: "Rs 600/kg", image: "/menu/til-bugga.webp" },
  { slug: "roasted-peanut-chikki", name: "Roasted Peanut Chikki", desc: "Snap-crisp roasted peanut & jaggery chikki.", price: "Rs 325/kg", image: "/products/roastedpeanut-chikki.png" },
  { slug: "dry-fruit-laddoo", name: "Dry Fruit Laddoo", desc: "Sugar-free laddoos packed with dates, figs & nuts.", price: "Rs 900/kg", image: "/products/dryfruitladdoo.png" }
];

const giftHampers = [
  { name: "Dry Fruit Gift Tray 1", desc: "Wooden trays with assorted cashew, almond & raisins.", price: "Rs 1100", image: "/products/Dryfruit-tray1.png" },
  { name: "Dry Fruit Gift Tray 3", desc: "Luxury dry fruit box with pistachios, walnuts & cashews.", price: "Rs 1500", image: "/products/Dryfruit-tray3.png" },
  { name: "Dry Fruit Gift Tray 7", desc: "Executive custom branded corporate dry fruit box.", price: "Rs 2500", image: "/products/Dryfruit-tray7.png" }
];

const homeCategories = [
  { name: "Rewri & Gajak", image: "/products/dilkhush-gazzak.png", link: "/rewri-gajak-meerut" },
  { name: "Desi Ghee Nankhatai", image: "/products/nankhatayi.png", link: "/nankhatai-meerut" },
  { name: "Gift Hampers", image: "/products/Dryfruit-tray1.png", link: "/gifting" },
  { name: "Diwali Specials", image: "/products/Dryfruit-tray3.png", link: "/diwali" },
  { name: "Traditional Sweets", image: "/products/dryfruitladdoo.png", link: "/sweets-meerut" },
  { name: "In-store Menu", image: "/menu/mango-shake.webp", link: "/in-store-menu" }
];

export default function Home() {
  const { catalog } = useCart();
  const currentPrice = (item) => displayPrice(catalog[item.slug] || item);


  return (
    <div className="noise-bg">
      <SEO
        title="PAHWAJEE Meerut | Rewri, Gajak, Nankhatai & Gift Hampers"
        description="Meerut's trusted brand for authentic Rewri, Gazak, Desi Ghee Nankhatai, Dry Fruit Hampers, and Diwali festive gifting. Order on WhatsApp."
      />

      {/* 1. Hero Section */}
      <section className="container-x grid min-h-[600px] items-center gap-10 pb-16 pt-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center">
          <p className="eyebrow flex items-center gap-1.5"><Sparkles className="w-4.5 h-4.5 text-secondary" /> Trusted For Generations · Abu Lane Meerut</p>
          <h1 className="mt-4 text-5xl leading-tight md:text-6xl font-serif">
            PAHWAJEE
            <span className="block text-2xl md:text-3xl font-sans tracking-wide text-secondary uppercase font-semibold mt-2">
              Rewri • Gajak • Nankhatai • Gift Hampers
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base md:text-lg leading-relaxed text-muted-foreground">
            Meerut's destination for authentic Punjabi Rewri, flaky winter Gazak, Pure Desi Ghee Nankhatai, and luxury dry fruit hampers.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/products" className="btn-primary flex items-center gap-2">
              Explore Our Signatures <ArrowRight size={17} />
            </Link>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn-gold !bg-emerald-600 !text-white hover:!bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-600/20">
              <MessageCircle size={17} /> Order on WhatsApp
            </a>
            <a href={telLink()} className="btn-outline flex items-center gap-2">
              <Phone size={17} /> Call Store
            </a>
          </div>
        </div>

        <div className="relative">
          <OptimizedImage
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw"
            src={realHeroImage}
            alt="PAHWAJEE Store Front in Abu Lane Meerut"
            className="h-[480px] w-full rounded-3xl object-cover shadow-2xl border border-white/60"
          />
          <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/70 dark:border-white/10 bg-white/90 dark:bg-card/90 p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 text-primary shrink-0" size={20} />
              <div>
                <p className="font-semibold font-serif text-lg text-foreground">Visit our local store</p>
                <p className="text-xs text-muted-foreground mt-0.5">19 Abu Lane, Meerut Cantt. Open daily 10:00 AM to 11:00 PM.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Signature Rewri */}
      <section className="bg-card/45 border-y border-border/50 py-16">
        <div className="container-x grid md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1">
            <span className="eyebrow">Signature #1</span>
            <h2 className="text-4xl font-serif mt-2 mb-4">{signatureRewri.name}</h2>
            <p className="text-muted-foreground leading-relaxed text-base mb-6">{signatureRewri.desc}</p>
            <div className="flex items-center gap-6 mb-6">
              <span className="text-2xl font-serif font-bold text-secondary">{currentPrice(signatureRewri)}</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold">Fresh Winter Batch</span>
            </div>
            <div className="space-y-4">
              <AddToCart product={signatureRewri} />
              <Link to={signatureRewri.link} className="btn-outline">View Rewri Collection</Link>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <OptimizedImage src={signatureRewri.image} alt={signatureRewri.name} className="rounded-3xl object-cover h-[350px] w-full shadow-lg border border-white/60" />
          </div>
        </div>
      </section>

      {/* 3. Signature Gajak */}
      <section className="py-16">
        <div className="container-x grid md:grid-cols-2 gap-10 items-center">
          <div>
            <OptimizedImage src={signatureGajak.image} alt={signatureGajak.name} className="rounded-3xl object-cover h-[350px] w-full shadow-lg border border-white/60" />
          </div>
          <div>
            <span className="eyebrow">Signature #2</span>
            <h2 className="text-4xl font-serif mt-2 mb-4">{signatureGajak.name}</h2>
            <p className="text-muted-foreground leading-relaxed text-base mb-6">{signatureGajak.desc}</p>
            <div className="flex items-center gap-6 mb-6">
              <span className="text-2xl font-serif font-bold text-secondary">{currentPrice(signatureGajak)}</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold">Organic Jaggery</span>
            </div>
            <div className="space-y-4">
              <AddToCart product={signatureGajak} />
              <Link to={signatureGajak.link} className="btn-outline">View Gazak Collection</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Signature Nankhatai */}
      <section className="bg-card/45 border-y border-border/50 py-16">
        <div className="container-x grid md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1">
            <span className="eyebrow">Signature #3</span>
            <h2 className="text-4xl font-serif mt-2 mb-4">{signatureNankhatai.name}</h2>
            <p className="text-muted-foreground leading-relaxed text-base mb-6">{signatureNankhatai.desc}</p>
            <div className="flex items-center gap-6 mb-6">
              <span className="text-2xl font-serif font-bold text-secondary">{currentPrice(signatureNankhatai)}</span>
              <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-semibold">100% Pure Desi Ghee</span>
            </div>
            <div className="space-y-4">
              <AddToCart product={signatureNankhatai} />
              <Link to={signatureNankhatai.link} className="btn-outline">View Both Nankhatai Varieties</Link>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <OptimizedImage src={signatureNankhatai.image} alt={signatureNankhatai.name} className="rounded-3xl object-cover h-[350px] w-full shadow-lg border border-white/60" />
          </div>
        </div>
      </section>

      {/* 5. Winter Favourites */}
      <section className="py-16 container-x">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="eyebrow">Winter Delights</p>
          <h2 className="text-4xl font-serif mt-2">More Winter Specialties</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {winterFavourites.map((item, idx) => (
            <div key={idx} className="card-warm p-5 flex flex-col justify-between">
              <div>
                <OptimizedImage sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 100vw" src={item.image} alt={item.name} className="h-44 w-full object-cover rounded-xl mb-4" />
                <h3 className="font-serif text-xl font-bold mb-1">{item.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{item.desc}</p>
              </div>
              <div className="space-y-3 border-t border-border/30 pt-3">
                <span className="text-sm font-bold text-secondary">{currentPrice(item)}</span>
                <AddToCart product={item} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6 & 7. Gift Hampers & Dry Fruit Hampers */}
      <section className="bg-card/45 border-y border-border/50 py-16">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow">Express Appreciation</p>
            <h2 className="text-4xl font-serif mt-2">Dry Fruit & Festive Gift Hampers</h2>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              Curated gift hampers featuring premium dry fruit wooden trays, festive sweet boxes, and corporate custom branding.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {giftHampers.map((hamper, idx) => (
              <div key={idx} className="card-warm p-6 flex flex-col justify-between">
                <div>
                  <OptimizedImage sizes="(min-width: 1280px) 400px, (min-width: 768px) 33vw, 100vw" src={hamper.image} alt={hamper.name} className="h-48 w-full object-cover rounded-xl mb-4" />
                  <h3 className="font-serif text-2xl font-bold mb-2">{hamper.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{hamper.desc}</p>
                </div>
                <div className="flex items-center justify-between border-t border-border/30 pt-4">
                  <span className="text-sm font-bold text-secondary">{hamper.price}</span>
                  <Link to="/gifting" className="text-xs font-semibold text-primary hover:underline">
                    Enquire Hampers &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Diwali Campaign Banner */}
      <section className="container-x py-12">
        <div className="bg-gradient-to-r from-amber-900 via-primary to-amber-900 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl">
            <span className="inline-block rounded-full bg-secondary/20 border border-secondary/30 text-secondary text-[10px] font-bold uppercase tracking-[0.2em] px-3.5 py-1 mb-3">
              Upcoming Festival Season
            </span>
            <h3 className="font-serif text-3xl md:text-4xl font-bold mb-3">Diwali Sweets & Corporate Gifting</h3>
            <p className="text-sm text-primary-foreground/90 leading-relaxed">
              Pre-orders are open for custom logo hampers, dry fruit wooden trays, and pure desi ghee sweets boxes.
            </p>
          </div>
          <Link to="/diwali" className="btn-gold shrink-0 flex items-center gap-2">
            Explore Diwali Collection <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 9. Why PAHWAJEE */}
      <section className="py-16 container-x">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="eyebrow">The PAHWAJEE Standard</p>
          <h2 className="text-4xl font-serif mt-2">Authentic Taste & Quality</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="card-warm p-6 text-center">
            <Award className="w-8 h-8 text-primary mx-auto mb-3" />
            <h4 className="font-serif text-xl font-bold mb-2">Generational Secret Recipes</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Hand-rolled rewri and layered gazak prepared using traditional heritage techniques.</p>
          </div>
          <div className="card-warm p-6 text-center">
            <ShieldCheck className="w-8 h-8 text-primary mx-auto mb-3" />
            <h4 className="font-serif text-xl font-bold mb-2">Pure Desi Ghee & Jaggery</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Made with 100% pure desi ghee and organic jaggery for genuine flavor.</p>
          </div>
          <div className="card-warm p-6 text-center">
            <Gift className="w-8 h-8 text-primary mx-auto mb-3" />
            <h4 className="font-serif text-xl font-bold mb-2">Premium Packaging</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Elegant wooden trays and luxury gift boxes designed for family and corporate gifting.</p>
          </div>
        </div>
      </section>

      {/* 10 & 11. Google Reviews & Pahwa Family */}
      <section className="bg-card/45 border-y border-border/50 py-16">
        <div className="container-x space-y-12">
          <div>
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="text-2xl sm:text-3xl font-serif">Our Customers on Google</h2>
              <p className="mt-3 text-sm text-muted-foreground">Selected reviews from our Google listing.</p>
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
              {reviews.slice(0, 3).map(review => <GoogleReviewCard key={review.id} review={review} />)}
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              <GoogleReviewButton />
              <Link to="/testimonials" className="text-sm font-semibold text-primary dark:text-secondary underline underline-offset-4 py-3">More customer reviews</Link>
            </div>
          </div>

          {/* Pahwa Family Section */}
          <div className="card-warm p-8 bg-white/70 dark:bg-card/50 max-w-4xl mx-auto border border-border/60 shadow-lg">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-5 relative group">
                <OptimizedImage
                  src="/pahwa_family.jpg"
                  alt="The Pahwa Brothers at PAHWA JEE Abu Lane Meerut"
                  className="rounded-2xl object-cover w-full h-[280px] shadow-md border-2 border-white/80 group-hover:scale-[1.02] transition duration-300"
                />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                  Custodians of Abu Lane
                </div>
              </div>
              <div className="md:col-span-7">
                <p className="eyebrow">The Heart of PAHWA JEE</p>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold mt-1.5 mb-1.5 text-foreground">The Pahwa Family</h3>
                <p className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">Three Brothers · Decades of Craftsmanship & Trust</p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  The three Pahwa brothers, sons of <strong>Late Shri Kasturi Lal Pahwa</strong>, carry forward their father's legacy and the traditions of <strong>Ram Chandra Deewan Chandra Rewri Wale</strong>. From overseeing fresh batches to welcoming customers at Abu Lane, they bring personal care to the flavours Meerut families have loved for generations.
                </p>
                <Link to="/about" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                  Read our family story &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12 & 13. Visit Store & Contact / WhatsApp */}
      <section className="py-16 container-x grid gap-10 lg:grid-cols-2 items-center">
        <div className="card-warm overflow-hidden h-[380px] border border-border/50">
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
          <p className="eyebrow">Visit Our Local Store</p>
          <h2 className="text-4xl font-serif mt-2 mb-4">Drop By Our Abu Lane Store</h2>
          <p className="text-muted-foreground leading-relaxed text-sm mb-6">
            Located in the heart of Abu Lane shopping district in Meerut, our store displays a fresh selection of Rewri, Gazak, Nankhatai, and gift hampers daily.
          </p>

          <div className="space-y-3 text-xs text-muted-foreground mb-6">
            <p className="flex items-center gap-2.5"><MapPin className="text-primary w-4 h-4 shrink-0" /> {BUSINESS.address}</p>
            <p className="flex items-center gap-2.5"><Clock className="text-primary w-4 h-4 shrink-0" /> {BUSINESS.hours}</p>
            <p className="flex items-center gap-2.5"><Phone className="text-primary w-4 h-4 shrink-0" /> {BUSINESS.phones.join(', ')}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn-gold !bg-emerald-600 !text-white flex items-center gap-2">
              <MessageCircle size={16} /> WhatsApp Order
            </a>
            <a href={telLink()} className="btn-primary flex items-center gap-2"><Phone size={16} /> Call Store</a>
          </div>
        </div>
      </section>
    </div>
  );
}
