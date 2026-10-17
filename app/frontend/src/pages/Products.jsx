import OrderHelp from '../components/OrderHelp';
import { compareProducts } from '../lib/productOrder';
import { isMithaiBox } from '../lib/mithaiBox';
import fallbackProducts from '../generated/catalog.json';
import { usePageData } from '../context/PageData';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';
import SEO from '../components/SEO';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';



const filters = [
  { label: 'All Products', value: 'all', match: () => true },
  { label: 'Rewri & Gajak', value: 'rewri-gajak', match: (product) => includesAny(product.name, ['rewri', 'gazak', 'gajak', 'chikki', 'til', 'patti']) },
  { label: 'Nankhatai', value: 'nankhatai', match: (product) => includesAny(product.name, ['nankhatai', 'nankhatayi']) },
  { label: 'Gift Hampers & Trays', value: 'hampers', match: (product) => includesAny(product.name, ['tray', 'hamper', 'gifting']) || product.category === 'festival-collection' || isMithaiBox(product.slug) },
  { label: 'Laddoo & Sweets', value: 'sweets', match: (product) => includesAny(product.name, ['laddoo', 'laddo', 'pinni', 'bite', 'halwa', 'kheer', 'sev', 'sweet', 'mithai', 'barfi', 'louch', 'panjeeri']) }
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
  const [products, setProducts] = useState(usePageData().products || fallbackProducts);
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
    }).sort(compareProducts);
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
        title="Shop Rewri, Gajak, Nankhatai & Sweets | PAHWAJEE Meerut"
        description="Compare Rewri, Gajak, Nankhatai, laddoos and 1 kg mithai boxes at Pahwajee, Meerut. View prices, pack sizes and availability before ordering."
      />
      <div className="container-x">
        <div className="mb-5 sm:mb-8 flex flex-col gap-3 sm:gap-8 md:flex-row md:items-end md:justify-between">
          <div>

            <h1 className="sm:mt-4 text-3xl sm:text-5xl lg:text-6xl leading-tight sm:leading-none">Shop Pahwajee Sweets</h1>
            <p className="mt-3 sm:mt-5 max-w-2xl text-sm sm:text-base leading-6 sm:leading-7 text-muted-foreground">
              Browse <Link to="/rewri-gajak-meerut" className="underline">Meerut Rewri &amp; Gajak</Link>, <Link to="/nankhatai-meerut" className="underline">Nankhatai</Link>, <Link to="/sweets-meerut" className="underline">laddoos &amp; barfi</Link> and <Link to="/gifting" className="underline">1 kg mithai gift boxes</Link>. Compare the listed prices and pack sizes; unavailable and special-order items are marked.
            </p>
          </div>
          <div><Link to="/in-store-menu" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline">Shakes & snacks: view in-store menu</Link><p className="text-sm text-muted-foreground">{countLabel}</p></div>
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
            aria-label="Search products"
            placeholder="Search products, e.g. nankhatai, laddoo..."
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
        <OrderHelp />
      </div>
    </div>
  );
}
