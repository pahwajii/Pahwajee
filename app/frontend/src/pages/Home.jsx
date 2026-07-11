import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, MessageCircle, Phone } from 'lucide-react';
import api from '../lib/api';

const fallbackHero = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400&auto=format&fit=crop';
const fallbackFeatured = [
  {
    id: 'nankhatai',
    name: 'Pure Desi Ghee Nankhatai',
    slug: 'pure-desi-ghee-nankhatai',
    image: 'https://images.pexels.com/photos/37219215/pexels-photo-37219215.jpeg',
    price: 'Rs 450/kg',
  },
  {
    id: 'rewri',
    name: 'Punjabi Style Rewri',
    slug: 'punjabi-style-rewri',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1200&auto=format&fit=crop',
    price: 'Rs 380/kg',
  },
  {
    id: 'milk',
    name: 'Fresh Milk Bottle',
    slug: 'fresh-milk-bottle',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=1200&auto=format&fit=crop',
    price: 'Rs 60/L',
  },
  {
    id: 'cakes',
    name: 'Birthday Cakes',
    slug: 'birthday-cakes',
    image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1200&auto=format&fit=crop',
    price: 'Rs 600+',
  },
];

export default function Home() {
  const [banners, setBanners] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    api.get('/banners').then(setBanners).catch(() => setBanners([]));
    api.get('/products?featured=true')
      .then((items) => setFeaturedProducts(items.length ? items : fallbackFeatured))
      .catch(() => setFeaturedProducts(fallbackFeatured));
  }, []);

  const heroImage = banners[0]?.image || fallbackHero;

  return (
    <div className="noise-bg">
      <section className="container-x grid min-h-[720px] items-center gap-14 pb-16 pt-28 lg:grid-cols-[0.92fr_1.08fr]">
        <div>
          <p className="eyebrow">Since Generations · Meerut, UP</p>
          <h1 className="mt-6 max-w-xl text-5xl leading-[0.98] md:text-6xl">
            Fresh Every Day.
            <span className="block italic text-primary">Trusted for Generations.</span>
            Loved Across Meerut.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-muted-foreground">
            Home of Meerut's finest Desi Ghee Nankhatai, Punjabi Rewri, Premium Gazak, thick shakes, artisan bakery and festive gift hampers.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/products" className="btn-primary">
              Explore Products <ArrowRight size={17} />
            </Link>
            <a href="https://wa.me/916396339806" className="btn-gold">
              <MessageCircle size={17} /> WhatsApp Order
            </a>
            <a href="tel:+916396339806" className="btn-outline">
              <Phone size={17} /> Call Now
            </a>
          </div>
        </div>

        <div className="relative">
          <img src={heroImage} alt="Fresh bakery at PAHWA JEE" className="h-[560px] w-full rounded-lg object-cover shadow-[0_24px_60px_rgb(44,30,22,0.12)]" />
          <div className="absolute bottom-6 left-6 right-6 rounded-lg border border-white/70 bg-white/85 p-5 shadow-xl backdrop-blur">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 text-primary" size={20} />
              <div>
                <p className="font-semibold">Visit our store</p>
                <p className="text-sm text-muted-foreground">Meerut's daily stop for sweets, bakery, shakes and hampers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border/60 bg-white/35 py-12">
        <div className="container-x">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Customer Favourites</p>
              <h2 className="mt-3 text-4xl">Fresh from the counter</h2>
            </div>
            <Link to="/products" className="hidden text-sm font-semibold text-primary md:inline">View full menu</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(featuredProducts.length ? featuredProducts : fallbackFeatured).slice(0, 4).map((p) => (
              <Link to={`/products/${p.slug}`} key={p.id} className="card-warm group">
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-xl">{p.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-secondary">{p.price || 'Price on request'}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
