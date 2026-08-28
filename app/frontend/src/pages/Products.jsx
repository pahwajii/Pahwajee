import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import SEO from '../components/SEO';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';

const fallbackProducts = [
  {
    id: 'nankhatai',
    name: 'Pure Desi Ghee Nankhatai',
    slug: 'pure-desi-ghee-nankhatai',
    category: 'signature',
    season: 'all',
    image: 'https://images.pexels.com/photos/37219215/pexels-photo-37219215.jpeg',
    price: 'Rs 450/kg',
    availability: 'Available',
    bestseller: true,
    bestSeller: true,
  },
  {
    id: 'rewri',
    name: 'Punjabi Style Rewri',
    slug: 'punjabi-style-rewri',
    category: 'signature',
    season: 'winter',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=1200&auto=format&fit=crop',
    price: 'Rs 380/kg',
    availability: 'Available',
    bestseller: true,
    bestSeller: true,
  },
  {
    id: 'milk',
    name: 'Fresh Milk Bottle',
    slug: 'fresh-milk-bottle',
    category: 'summer-specials',
    season: 'summer',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=1200&auto=format&fit=crop',
    price: 'Rs 60/L',
    availability: 'Available',
  },
  {
    id: 'cake',
    name: 'Birthday Cakes',
    slug: 'birthday-cakes',
    category: 'bakery',
    season: 'all',
    image: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=1200&auto=format&fit=crop',
    price: 'Rs 600+',
    availability: 'Available',
    bestseller: true,
    bestSeller: true,
  },
];

const filters = [
  { label: 'All Products', value: 'all', match: () => true },
  { label: 'Summer Specials', value: 'summer-specials', match: (product) => product.season === 'summer' || matchesCategory(product, ['summer-specials', 'summer']) },
  { label: 'Winter Specials', value: 'winter-specials', match: (product) => product.season === 'winter' || matchesCategory(product, ['winter-specials', 'winter']) },
  {
    label: 'All Season Favourites',
    value: 'all-season-favourites',
    match: (product) => product.season === 'all' || (!product.season && !matchesCategory(product, ['summer-specials', 'summer', 'winter-specials', 'winter', 'festival-collection'])),
  },
  { label: 'Cakes', value: 'cakes', match: (product) => matchesCategory(product, ['cakes', 'cake', 'bakery']) || includesAny(product.name, ['cake']) },
  { label: 'Bread', value: 'bread', match: (product) => matchesCategory(product, ['bread', 'bakery']) || includesAny(product.name, ['bread']) },
  { label: 'Cookies', value: 'cookies', match: (product) => matchesCategory(product, ['cookies', 'cookie', 'bakery']) || includesAny(product.name, ['cookie', 'cookies']) },
  { label: 'Rusks', value: 'rusks', match: (product) => matchesCategory(product, ['rusks', 'rusk', 'bakery']) || includesAny(product.name, ['rusk', 'rusks']) },
  { label: 'Namkeen', value: 'namkeen', match: (product) => matchesCategory(product, ['namkeen']) || includesAny(product.name, ['namkeen']) },
  { label: 'Festival Specials', value: 'festival-specials', match: (product) => product.festivalSpecial || matchesCategory(product, ['festival-specials', 'festival-collection']) },
  { label: 'Best Sellers', value: 'best-sellers', match: (product) => product.bestSeller || product.bestseller },
  { label: 'New Arrivals', value: 'new-arrivals', match: (product) => product.newArrival },
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
  const [products, setProducts] = useState([]);
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
    <div className="noise-bg section-y pt-28">
      <SEO 
        title="Fresh Sweets, Bakery & Cakes Menu | PAHWAJEE Meerut"
        description="Browse our complete catalog of freshly baked Desi Ghee Nankhatai, traditional Punjabi Rewri & Gajak, customized birthday cakes, namkeens, and thick shakes in Meerut."
      />
      <div className="container-x">
        <div className="mb-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">Our Complete Catalogue</p>
            <h1 className="mt-4 text-6xl leading-none">The Full Menu</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Explore every product we make, from signature sweets to seasonal shakes, fresh bakery to festival hampers.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{countLabel}</p>
        </div>

        <div className="sticky top-24 z-40 mb-6 -mx-5 border-y border-border/60 bg-background/90 px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => {
              const isActive = activeFilterConfig.value === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => selectFilter(filter.value)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-primary/20'
                      : 'border border-border bg-white/80 text-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary'
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
            className="h-12 w-full rounded-full border border-border bg-white/80 pl-12 pr-4 text-sm outline-none ring-primary/20 placeholder:text-muted-foreground focus:ring-4"
            placeholder="Search products, e.g. nankhatai, mango shake..."
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
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
