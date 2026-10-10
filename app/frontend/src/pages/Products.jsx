import { usePageData } from '../context/PageData';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import SEO from '../components/SEO';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';

const fallbackProducts = [
  { id: 'khasta-rewri', name: 'Khasta Rewri', slug: 'khasta-rewri', category: 'signature', season: 'winter', image: '/products/Khasta-rewri.png', price: 'Rs 480/kg', availability: 'Available', bestseller: true, bestSeller: true },
  { id: 'chips-rewri', name: 'Chips Rewri', slug: 'chips-rewri', category: 'signature', season: 'winter', image: '/products/chips-rewri.png', price: 'Rs 520/kg', availability: 'Available', bestseller: true },
  { id: 'dilkhush-gazak', name: 'Dilkhush Gazak', slug: 'dilkhush-gazzak', category: 'signature', season: 'winter', image: '/products/dilkhush-gazzak.png', price: 'Rs 640/kg', availability: 'Available', bestseller: true, bestSeller: true },
  { id: 'chocolate-gazak', name: 'Chocolate Gazak', slug: 'chocolate-gazak', category: 'signature', season: 'winter', image: '/products/choclate-gazzak.png', price: 'Rs 580/kg', availability: 'Available' },
  { id: 'gol-gazak', name: 'Gol Gazak', slug: 'gol-gazak', category: 'signature', season: 'winter', image: '/products/golgazzak.png', price: 'Rs 560/kg', availability: 'Available' },
  { id: 'kaju-gazak-roll', name: 'Kaju Gazak Roll', slug: 'kaju-gazak-roll', category: 'signature', season: 'winter', image: '/products/kajugazzak-roll.png', price: 'Rs 750/kg', availability: 'Available', featured: true },
  { id: 'mawa-roll-gazak', name: 'Mawa Roll Gazak', slug: 'mawa-roll-gazak', category: 'signature', season: 'winter', image: '/products/mawaroll-gazzak.png', price: 'Rs 680/kg', availability: 'Available' },
  { id: 'sugar-gazak', name: 'Sugar Gazak', slug: 'sugar-gazak', category: 'signature', season: 'winter', image: '/products/sugar gazzak.png', price: 'Rs 460/kg', availability: 'Available' },
  { id: 'til-patti-gazak', name: 'Til Patti Gazak', slug: 'til-patti-gazak', category: 'signature', season: 'winter', image: '/products/tilpattigazzak.png', price: 'Rs 520/kg', availability: 'Available' },
  { id: 'til-peanut-khasta', name: 'Til Peanut Khasta', slug: 'til-peanut-khasta', category: 'signature', season: 'winter', image: '/products/til-peanut-khasta.png', price: 'Rs 490/kg', availability: 'Available' },
  { id: 'pure-desi-ghee-nankhatai', name: 'Pure Desi Ghee Nankhatai', slug: 'pure-desi-ghee-nankhatai', category: 'signature', season: 'all', image: '/products/nankhatayi.png', price: 'Rs 600/kg', availability: 'Available', bestseller: true, bestSeller: true },
  { id: 'vanaspati-ghee-nankhatai', name: 'Vanaspati Ghee Nankhatai', slug: 'vanaspati-ghee-nankhatai', description: 'Traditional Nankhatai prepared with Vanaspati Ghee.', category: 'signature', season: 'all', image: '/products/nankhatayi.png', price: 'Rs 380/kg', availability: 'Available' },
  { id: 'besan-laddoo', name: 'Besan Laddoo', slug: 'besan-laddoo', category: 'signature', season: 'all', image: '/products/besan-laddo.png', price: 'Rs 400/kg', availability: 'Available' },
  { id: 'mango-bite', name: 'Mango Bite', slug: 'mango-bite', category: 'signature', season: 'all', image: '/products/mangobit.png', price: 'Rs 600/kg', availability: 'Available' },
  { id: 'peanut-chikki', name: 'Peanut Chikki', slug: 'peanut-chikki', category: 'winter-specials', season: 'winter', image: '/products/peanut-chikki.png', price: 'Rs 320/kg', availability: 'Available' },
  { id: 'roasted-peanut-chikki', name: 'Roasted Peanut Chikki', slug: 'roasted-peanut-chikki', category: 'winter-specials', season: 'winter', image: '/products/roastedpeanut-chikki.png', price: 'Rs 350/kg', availability: 'Available' },
  { id: 'murmura-patti', name: 'Murmura Patti', slug: 'murmura-patti', category: 'winter-specials', season: 'winter', image: '/products/murmura-patti.png', price: 'Rs 280/kg', availability: 'Available' },
  { id: 'gur-ke-sev', name: 'Gur Ke Sev', slug: 'gur-ke-sev', category: 'winter-specials', season: 'winter', image: '/products/gur-ke-sev.png', price: 'Rs 380/kg', availability: 'Available' },
  { id: 'til-bugga', name: 'Til Bugga', slug: 'til-bugga', category: 'winter-specials', season: 'winter', image: '/products/til-bugga.png', price: 'Rs 600/kg', availability: 'Available' },
  { id: 'alsi-ke-laddoo', name: 'Alsi Ke Laddoo', slug: 'alsi-ke-laddoo', category: 'winter-specials', season: 'winter', image: '/products/alsi-ke-laddoo.png', price: 'Rs 700/kg', availability: 'Available' },
  { id: 'dry-fruit-laddoo', name: 'Dry Fruit Laddoo', slug: 'dry-fruit-laddoo', category: 'winter-specials', season: 'winter', image: '/products/dryfruitladdoo.png', price: 'Rs 850/kg', availability: 'Available', bestseller: true },
  { id: 'khajoor-laddoo', name: 'Khajoor Laddoo', slug: 'khajoor-laddoo', category: 'winter-specials', season: 'winter', image: '/products/khajoor-laddo.png', price: 'Rs 800/kg', availability: 'Available' },
  { id: 'special-pishori-pinni', name: 'Special Pishori Pinni', slug: 'special-pishori-pinni', category: 'winter-specials', season: 'winter', image: '/products/pishori-pinni.png', price: 'Rs 700/kg', availability: 'Available' },
  { id: 'desi-ghee-gajar-ka-halwa', name: 'Desi Ghee Gajar Ka Halwa', slug: 'desi-ghee-gajar-ka-halwa', category: 'winter-specials', season: 'winter', image: '/products/gajar-halwa.png', price: 'Rs 480/kg', availability: 'Available' },
  { id: 'special-kheer', name: 'Special Kheer', slug: 'special-kheer', category: 'winter-specials', season: 'winter', image: '/products/kheer.png', price: 'Rs 250/kg', availability: 'Available' },
  { id: 'healthy-sprouts', name: 'Healthy Sprouts', slug: 'healthy-sprouts', category: 'summer-specials', season: 'summer', image: '/products/sprouts.png', price: 'Rs 100/plate', availability: 'Available' },
  { id: 'dry-fruit-gift-tray-1', name: 'Dry Fruit Gift Tray 1', slug: 'dry-fruit-gift-tray-1', category: 'festival-collection', season: 'all', image: '/products/Dryfruit-tray1.png', price: 'Rs 1100', availability: 'Available', bestseller: true },
  { id: 'dry-fruit-gift-tray-2', name: 'Dry Fruit Gift Tray 2', slug: 'dry-fruit-gift-tray-2', category: 'festival-collection', season: 'all', image: '/products/Dryfruit-tray2.png', price: 'Rs 1350', availability: 'Available' },
  { id: 'dry-fruit-gift-tray-3', name: 'Dry Fruit Gift Tray 3', slug: 'dry-fruit-gift-tray-3', category: 'festival-collection', season: 'all', image: '/products/Dryfruit-tray3.png', price: 'Rs 1500', availability: 'Available' },
  { id: 'dry-fruit-gift-tray-4', name: 'Dry Fruit Gift Tray 4', slug: 'dry-fruit-gift-tray-4', category: 'festival-collection', season: 'all', image: '/products/Dryfruit-tray4.png', price: 'Rs 1750', availability: 'Available' },
  { id: 'dry-fruit-gift-tray-5', name: 'Dry Fruit Gift Tray 5', slug: 'dry-fruit-gift-tray-5', category: 'festival-collection', season: 'all', image: '/products/Dryfruit-tray5.png', price: 'Rs 2000', availability: 'Available' },
  { id: 'dry-fruit-gift-tray-6', name: 'Dry Fruit Gift Tray 6', slug: 'dry-fruit-gift-tray-6', category: 'festival-collection', season: 'all', image: '/products/Dryfruit-tray6.png', price: 'Rs 2250', availability: 'Available' },
  { id: 'dry-fruit-gift-tray-7', name: 'Dry Fruit Gift Tray 7', slug: 'dry-fruit-gift-tray-7', category: 'festival-collection', season: 'all', image: '/products/Dryfruit-tray7.png', price: 'Rs 2500', availability: 'Available' }
];

const filters = [
  { label: 'All Products', value: 'all', match: () => true },
  { label: 'Rewri & Gajak', value: 'rewri-gajak', match: (product) => includesAny(product.name, ['rewri', 'gazak', 'gajak', 'chikki', 'til', 'patti']) },
  { label: 'Nankhatai', value: 'nankhatai', match: (product) => includesAny(product.name, ['nankhatai', 'nankhatayi']) },
  { label: 'Gift Hampers & Trays', value: 'hampers', match: (product) => includesAny(product.name, ['tray', 'hamper', 'gifting']) || product.category === 'festival-collection' },
  { label: 'Laddoo & Sweets', value: 'sweets', match: (product) => includesAny(product.name, ['laddoo', 'laddo', 'pinni', 'bite', 'halwa', 'kheer', 'sev', 'sweet', 'mithai']) },
  { label: 'Fresh Healthy Specials', value: 'healthy', match: (product) => includesAny(product.name, ['sprouts']) || product.category === 'summer-specials' }
];

function normalize(value = '') {
  return value.toString().trim().toLowerCase();
}

function matchesCategory(product, values) {
  const category = normalize(product.category);
  return values.some((value) => category === value);
}

function includesAny(value = '', terms) {
  const text = normalize(value);
  return terms.some((term) => text.includes(term));
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState(usePageData().products || []);
  const [query, setQuery] = useState('');
  const activeFilter = searchParams.get('filter') || 'all';

  useEffect(() => {
    api.get('/products')
      .then((items) => setProducts(items.length ? items : fallbackProducts))
      .catch(() => setProducts(fallbackProducts));
  }, []);

  const activeFilterConfig = filters.find((filter) => filter.value === activeFilter) || filters[0];

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase();

    return products.filter((product) => {
      const filterMatch = activeFilterConfig.match(product);
      const searchMatch = !term || [product.name, product.description, product.category, ...(product.tags || [])]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(term));

      return filterMatch && searchMatch;
    });
  }, [activeFilterConfig, products, query]);

  function selectFilter(value) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (value === 'all') {
        next.delete('filter');
      } else {
        next.set('filter', value);
      }
      return next;
    });
  }

  const countLabel = useMemo(() => `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'}`, [filteredProducts.length]);

  return (
    <div className="noise-bg section-y pt-6 sm:pt-16 lg:pt-28">
      <SEO 
        title="Fresh Sweets, Bakery & Cakes Menu | PAHWAJEE Meerut"
        description="Browse our complete catalog of freshly baked Desi Ghee Nankhatai, traditional Punjabi Rewri & Gajak, customized birthday cakes, namkeens, and thick shakes in Meerut."
      />
      <div className="container-x">
        <div className="mb-5 sm:mb-8 flex flex-col gap-3 sm:gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow hidden sm:block">Our Complete Catalogue</p>
            <h1 className="sm:mt-4 text-3xl sm:text-5xl lg:text-6xl leading-tight sm:leading-none">The Full Menu</h1>
            <p className="mt-3 sm:mt-5 max-w-2xl text-sm sm:text-base leading-6 sm:leading-7 text-muted-foreground">
              Explore every product we make, from signature sweets to seasonal shakes, fresh bakery to festival hampers.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{countLabel}</p>
        </div>

        <div className="sticky top-24 z-40 mb-6 -mx-4 border-y border-border/60 bg-background/90 px-4 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => {
              const isActive = activeFilterConfig.value === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => selectFilter(filter.value)}
                  className={`shrink-0 rounded-full min-h-11 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold shadow-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-primary/20'
                      : 'border border-border bg-white/80 dark:bg-card/70 text-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative mb-5 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-12 w-full rounded-full border border-border bg-white/80 dark:bg-card/70 pl-12 pr-4 text-base sm:text-sm outline-none ring-primary/20 placeholder:text-muted-foreground focus:ring-4"
            placeholder="Search products, e.g. nankhatai, mango shake..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((p) => (
              <motion.div
                key={p.id}
                className="min-w-0 h-full"
                layout
                initial={false}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
