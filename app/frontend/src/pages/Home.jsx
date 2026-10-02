import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, MessageCircle, Phone, Sparkles, Star, Award, ShieldCheck, Clock, Gift, Heart } from 'lucide-react';
import SEO from '../components/SEO';
import api, { BUSINESS, waLink, telLink } from '../lib/api';

const realHeroImage = '/our_shop_main.jpeg';

const signatureRewri = {
  name: "Khasta Rewri",
  desc: "Crispy sesame and organic jaggery drops, hand-rolled in authentic Punjabi tradition. Made fresh for winter in Meerut.",
  price: "Rs 480/kg",
  image: "/products/Khasta-rewri.png",
  link: "/rewri-gajak-meerut"
};

const signatureGajak = {
  name: "Dilkhush Gazak",
  desc: "Light, flaky, melt-in-mouth sesame gazak prepared with organic jaggery, cardamom, and premium nuts.",
  price: "Rs 640/kg",
  image: "/products/dilkhush-gazzak.png",
  link: "/rewri-gajak-meerut"
};

const signatureNankhatai = {
  name: "Pure Desi Ghee Nankhatai",
  desc: "Meerut's legendary traditional cookie baked with 100% pure desi ghee. Crumbly, rich, and unforgettable.",
  price: "Rs 500/kg",
  image: "/products/nankhatayi.png",
  link: "/nankhatai-meerut"
};

const winterFavourites = [
  { name: "Til Bugga", desc: "Traditional winter delicacy made of roasted sesame, khoya & cardamom.", price: "Rs 600/kg", image: "/products/til-bugga.png" },
  { name: "Peanut Chikki", desc: "Snap-crisp roasted peanut & jaggery chikki.", price: "Rs 320/kg", image: "/products/peanut-chikki.png" },
  { name: "Dry Fruit Laddoo", desc: "Sugar-free laddoos packed with dates, figs & nuts.", price: "Rs 850/kg", image: "/products/dryfruitladdoo.png" }
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
  { name: "Healthy Specials", image: "/products/sprouts.png", link: "/products?filter=healthy" }
];

export default function Home() {
  const [bestsellers, setBestsellers] = useState([]);

  useEffect(() => {
    api.get('/products?bestseller=true')
      .then((items) => setBestsellers(items.slice(0, 4)))
      .catch(() => setBestsellers([]));
  }, []);

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
        title="PAHWAJEE Meerut | Rewri, Gajak, Nankhatai & Gift Hampers"
        description="Meerut's trusted brand for authentic Rewri, Gazak, Desi Ghee Nankhatai, Dry Fruit Hampers, and Diwali festive gifting. Order on WhatsApp."
        schema={schema}
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
          <img 
            src={realHeroImage} 
            alt="PAHWAJEE Store Front in Abu Lane Meerut" 
            className="h-[480px] w-full rounded-3xl object-cover shadow-2xl border border-white/60" 
          />
          <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/70 dark:border-white/10 bg-white/90 dark:bg-card/90 p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 text-primary shrink-0" size={20} />
              <div>
                <p className="font-semibold font-serif text-lg text-foreground">Visit our local store</p>
                <p className="text-xs text-muted-foreground mt-0.5">19 Abu Lane, Meerut Cantt. Open daily 9:00 AM to 10:30 PM.</p>
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
              <span className="text-2xl font-serif font-bold text-secondary">{signatureRewri.price}</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold">Fresh Winter Batch</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href={waLink(`Hi PAHWAJEE, I'd like to order: ${signatureRewri.name}.`)} target="_blank" rel="noopener noreferrer" className="btn-gold !bg-emerald-600 !text-white flex items-center gap-2">
                <MessageCircle size={16} /> Order Rewri on WhatsApp
              </a>
              <Link to={signatureRewri.link} className="btn-outline">View Rewri Collection</Link>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <img src={signatureRewri.image} alt={signatureRewri.name} className="rounded-3xl object-cover h-[350px] w-full shadow-lg border border-white/60" />
          </div>
        </div>
      </section>

      {/* 3. Signature Gajak */}
      <section className="py-16">
        <div className="container-x grid md:grid-cols-2 gap-10 items-center">
          <div>
            <img src={signatureGajak.image} alt={signatureGajak.name} className="rounded-3xl object-cover h-[350px] w-full shadow-lg border border-white/60" />
          </div>
          <div>
            <span className="eyebrow">Signature #2</span>
            <h2 className="text-4xl font-serif mt-2 mb-4">{signatureGajak.name}</h2>
            <p className="text-muted-foreground leading-relaxed text-base mb-6">{signatureGajak.desc}</p>
            <div className="flex items-center gap-6 mb-6">
              <span className="text-2xl font-serif font-bold text-secondary">{signatureGajak.price}</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold">Organic Jaggery</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href={waLink(`Hi PAHWAJEE, I'd like to order: ${signatureGajak.name}.`)} target="_blank" rel="noopener noreferrer" className="btn-gold !bg-emerald-600 !text-white flex items-center gap-2">
                <MessageCircle size={16} /> Order Gazak on WhatsApp
              </a>
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
              <span className="text-2xl font-serif font-bold text-secondary">{signatureNankhatai.price}</span>
              <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-semibold">100% Pure Desi Ghee</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href={waLink(`Hi PAHWAJEE, I'd like to order: ${signatureNankhatai.name}.`)} target="_blank" rel="noopener noreferrer" className="btn-gold !bg-emerald-600 !text-white flex items-center gap-2">
                <MessageCircle size={16} /> Order Nankhatai on WhatsApp
              </a>
              <Link to={signatureNankhatai.link} className="btn-outline">View Nankhatai Details</Link>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <img src={signatureNankhatai.image} alt={signatureNankhatai.name} className="rounded-3xl object-cover h-[350px] w-full shadow-lg border border-white/60" />
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
                <img src={item.image} alt={item.name} className="h-44 w-full object-cover rounded-xl mb-4" />
                <h3 className="font-serif text-xl font-bold mb-1">{item.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{item.desc}</p>
              </div>
              <div className="flex items-center justify-between border-t border-border/30 pt-3">
                <span className="text-sm font-bold text-secondary">{item.price}</span>
                <a href={waLink(`Hi PAHWAJEE, I'd like to order: ${item.name}.`)} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary hover:underline">
                  Order &rarr;
                </a>
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
                  <img src={hamper.image} alt={hamper.name} className="h-48 w-full object-cover rounded-xl mb-4" />
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

      {/* 10 & 11. Customer Reviews & Owner Placeholder Preview */}
      <section className="bg-card/45 border-y border-border/50 py-16">
        <div className="container-x space-y-12">
          <div>
            <div className="text-center max-w-xl mx-auto mb-8">
              <p className="eyebrow">Local Love</p>
              <h2 className="text-3xl font-serif mt-2">What Meerut Families Say</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
              <div className="card-warm p-6 bg-white/70 dark:bg-card/50">
                <div className="flex text-secondary gap-1 mb-3"><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/></div>
                <p className="text-xs text-muted-foreground italic mb-4">"PAHWAJEE's nankhatai is a Meerut legend. My family has been buying from here for over 20 years. Nothing else comes close."</p>
                <p className="text-xs font-bold">— Rahul Sharma, Sadar Bazaar Meerut</p>
              </div>
              <div className="card-warm p-6 bg-white/70 dark:bg-card/50">
                <div className="flex text-secondary gap-1 mb-3"><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/><Star size={16} className="fill-current"/></div>
                <p className="text-xs text-muted-foreground italic mb-4">"Rewri and gazak are exactly like my grandmother used to make. Authentic taste, generous quantity, fair prices."</p>
                <p className="text-xs font-bold">— Vikram Malhotra, Modipuram Meerut</p>
              </div>
            </div>
          </div>

          {/* Owner Placeholder Preview */}
          <div className="card-warm p-8 bg-white/60 dark:bg-card/45 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 items-center">
              <div className="aspect-square rounded-xl bg-muted/80 border border-dashed border-primary/40 flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
                <span className="font-semibold text-foreground text-xs">[ OWNER PHOTO ]</span>
                <span className="text-[10px]">Photo to be provided</span>
              </div>
              <div className="md:col-span-2">
                <p className="eyebrow">The People Behind PAHWAJEE</p>
                <h3 className="font-serif text-2xl font-bold mt-1 text-foreground">[ OWNER NAME — TO BE PROVIDED ]</h3>
                <p className="text-xs font-semibold text-secondary mb-3">[ ROLE — TO BE CONFIRMED ]</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  [ SHORT STORY — TO BE PROVIDED BY BUSINESS ]
                </p>
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
