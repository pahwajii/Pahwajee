import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Phone, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';
import ProductCard from '../components/ProductCard';
import OptimizedImage from '../components/OptimizedImage';
import OrderHelp from '../components/OrderHelp';
import api, { waLink, telLink } from '../lib/api';
import { compareProducts } from '../lib/productOrder';
import { collections } from '../lib/collections';
import { usePageData } from '../context/PageData';
import fallbackProducts from '../generated/catalog.json';
import menu from '../data/in-store-menu.json';

export default function CategoryLanding({ type }) {
  const [products, setProducts] = useState(usePageData().products || fallbackProducts);
  const config = collections[type] || collections.nankhatai;
  useEffect(() => {
    let active = true;
    api.get('/products').then(items => { if (active) setProducts(items.length ? items : fallbackProducts); }).catch(() => {});
    return () => { active = false; };
  }, [type]);
  const filtered = products.filter(config.filterMatch).sort(compareProducts);
  const bakeryItems = menu.filter(item => item.category === 'Cakes' || item.slug === 'bakery-biscuits');
  return <div className="noise-bg min-h-screen pb-12 pt-6 sm:pt-8">
    <SEO title={config.title} description={config.description} />
    <div className="container-x">
      <Link to="/products" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft size={16} /> All sweets & packs</Link>
      <section className="max-w-3xl mt-4 mb-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif leading-tight mb-4">{config.h1}</h1>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">{config.intro}</p>
        <div className="mt-3 flex flex-wrap gap-x-5 text-sm font-semibold text-primary dark:text-secondary">{config.links.map(link => <Link key={link.to} to={link.to} className="inline-flex min-h-11 items-center underline underline-offset-4">{link.label}</Link>)}</div>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={waLink(config.h1)} target="_blank" rel="noopener noreferrer" className="btn-gold !bg-emerald-700 !text-white flex items-center gap-2"><MessageCircle size={17} /> Enquire on WhatsApp</a>
          <a href={telLink()} className="btn-primary flex items-center gap-2"><Phone size={17} /> Call the store</a>
        </div>
      </section>

      <section className="my-8" aria-labelledby="collection-products">
        <h2 id="collection-products" className="text-2xl sm:text-3xl font-serif mb-2">{type === 'bakery' ? 'Nankhatai packs' : 'Compare products & pack sizes'}</h2>
        <p className="mb-5 text-sm text-muted-foreground">Prices and availability are shown per product. Open the details for ordering and ingredient guidance.</p>
        {filtered.length ? <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">{filtered.map(product => <ProductCard key={product.id || product.slug} product={product} />)}</div>
          : <p className="rounded-xl border border-border p-5 text-sm">Please contact the store for the current selection.</p>}
      </section>

      {type === 'bakery' && <section className="my-10" aria-labelledby="cakes-and-biscuits">
        <h2 id="cakes-and-biscuits" className="font-serif text-2xl sm:text-3xl mb-2">Cakes on order & bakery biscuits</h2>
        <p className="text-sm text-muted-foreground mb-5">Cake prices depend on size and design. Confirm your flavour, date and collection arrangements with the store. Photos marked illustrative are representative.</p>
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">{bakeryItems.map(item => <article key={item.slug} className="card-warm overflow-hidden">
          <div className="relative"><OptimizedImage square src={item.image} alt={item.name} sizes="(min-width: 1024px) 33vw, 50vw" className="aspect-square w-full object-cover" />{item.representative && <span className="absolute bottom-2 right-2 rounded bg-background/90 px-2 py-1 text-xs">Illustrative</span>}</div>
          <div className="p-3 sm:p-4"><h3 className="font-serif text-lg">{item.name}</h3><p className="mt-2 text-sm font-semibold">{item.priceLabel}</p><p className="mt-1 text-xs text-muted-foreground">{item.availability || 'Confirm selection in store'}</p><a href={waLink(item.name + ' — please confirm size, price and collection date')} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary dark:text-secondary underline">Enquire about {item.name}</a></div>
        </article>)}</div>
      </section>}

      <section className="my-10 max-w-3xl" aria-labelledby="collection-faqs">
        <h2 id="collection-faqs" className="font-serif text-2xl sm:text-3xl mb-4">Before you choose</h2>
        <div className="space-y-3">{config.faqs.map(faq => <details key={faq.question} className="rounded-xl border border-border bg-card px-4 py-3">
          <summary className="cursor-pointer min-h-11 flex items-center font-semibold text-sm sm:text-base">{faq.question}</summary>
          <p className="pb-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
        </details>)}</div>
        <Link to={config.guide.to} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary dark:text-secondary underline underline-offset-4">{config.guide.label}</Link>
      </section>
      <OrderHelp photo={config.photo} caption={config.caption} />
    </div>
  </div>;
}
