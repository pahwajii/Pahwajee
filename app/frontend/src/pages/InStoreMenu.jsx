import FavouriteButton from '../components/FavouriteButton';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';
import { BUSINESS, waLink } from '../lib/api';
import { formatMoney } from '../lib/cart';
import items from '../data/in-store-menu.json';

const categories = ['All', 'Cakes', 'Shakes', 'Sandwiches', 'Snacks', 'Drinks', 'Kheer', 'Store Favourites'];
const schema = {'@type': 'Menu', name: 'PAHWA JEE 100% Vegetarian In-store Menu', url: 'https://pahwajee.in/in-store-menu', hasMenuSection: categories.slice(1).map(category => ({'@type': 'MenuSection', name: category, hasMenuItem: items.filter(item => item.category === category).map(item => ({'@type': 'MenuItem', name: item.name, suitableForDiet: 'https://schema.org/VegetarianDiet', ...(item.priceLabel ? {} : {offers: {'@type': 'Offer', price: item.price, priceCurrency: 'INR'}}), ...(item.description ? {description: `${item.availability}. ${item.description}`} : item.iceCream ? {description: 'Add ice cream for Rs 20.'} : {})}))}))};

export default function InStoreMenu() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [withIceCream, setWithIceCream] = useState({});
  const filtered = items.filter(item => (category === 'All' || item.category === category) && item.name.toLowerCase().includes(search.trim().toLowerCase()));
  return <div className="noise-bg pb-16 pt-6 sm:pt-12">
    <SEO title="100% Vegetarian Menu: Cakes, Shakes & Snacks | PAHWA JEE" description="Explore Pahwajee’s 100% vegetarian menu in Meerut. Pineapple, chocolate, butterscotch and custom cakes on order, plus shakes, sandwiches and snacks." image="/menu/pineapple-cake.webp" schema={schema} />
    <div className="container-x">
      <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h1 className="text-3xl sm:text-5xl leading-tight">In-store Menu</h1>
          <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-700/25 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-950 dark:text-emerald-200"><span aria-hidden="true" className="inline-flex h-5 w-5 items-center justify-center border-2 border-current"><span className="h-2.5 w-2.5 rounded-full bg-current" /></span>100% vegetarian menu</p>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">Cakes in any flavour or design, available on order. Explore shakes, quick bites and store favourites at 19 Abu Lane, Meerut.</p>
          <a href={BUSINESS.mapLink} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 mt-2 text-sm font-semibold text-foreground underline underline-offset-4"><MapPin size={17} /> Get directions</a>
        </div>
        <Link to="/products" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-foreground">Shop sweets online <ArrowRight size={17} /></Link>
      </div>
      <div className="mb-5 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <label htmlFor="menu-search" className="block text-sm font-semibold mb-2">Find your favourite</label>
        <div className="relative max-w-lg"><Search aria-hidden="true" size={18} className="absolute left-3 top-3.5 text-muted-foreground" /><input id="menu-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search cakes, shakes, snacks..." className="w-full h-12 rounded-xl border border-border bg-background pl-10 pr-3 text-base focus-visible:outline-primary" /></div>
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Menu categories">{categories.map(value => <button key={value} type="button" aria-pressed={category === value} onClick={() => setCategory(value)} className={`min-h-11 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-primary ${category === value ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-primary/10'}`}>{value}</button>)}</div>
      </div>
      <p className="mb-5 text-xs sm:text-sm text-muted-foreground">Please confirm availability when ordering. Photos marked “Illustrative” are representative.</p>
      <p role="status" className="sr-only">{filtered.length} menu items</p>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((item, index) => <article key={item.slug} className="card-warm overflow-hidden flex flex-col min-w-0" data-menu-item={item.slug}>
          <div className="aspect-square relative shrink-0 overflow-hidden bg-muted"><OptimizedImage src={item.image} alt={item.name} width="640" height="640" sizes="(min-width: 1280px) 300px, (min-width: 1024px) 33vw, 50vw" loading={index < 2 ? 'eager' : 'lazy'} className="absolute inset-0 block w-full h-full object-cover" /><FavouriteButton item={item} kind="menu" className="absolute top-2 right-2 z-10" />{item.representative && <span className="absolute bottom-2 right-2 rounded bg-background/90 px-2 py-1 text-[11px] text-foreground">Illustrative</span>}</div>
          <div className="flex flex-1 flex-col p-3 sm:p-4">
            <h2 className="text-base sm:text-xl font-serif leading-snug">{item.name}</h2>
            <p className="mt-2 font-semibold text-foreground text-base" aria-live="polite">{item.priceLabel || formatMoney((item.price + (withIceCream[item.slug] ? 20 : 0)) * 100)}</p>
            {item.availability && <p className="mt-2 text-xs font-semibold text-foreground">{item.availability}</p>}
            {item.description && <p className="mt-1 text-xs sm:text-sm leading-relaxed text-muted-foreground">{item.description}</p>}
            {item.enquiry && <a href={waLink(`${item.name}. I'd like to discuss the flavour, size, design and required date`)} target="_blank" rel="noopener noreferrer" aria-label={`Enquire about ${item.name} on WhatsApp`} className="mt-auto inline-flex min-h-11 items-center gap-1 pt-3 text-sm font-semibold text-primary dark:text-secondary underline underline-offset-4">Enquire on WhatsApp <ArrowRight size={15} className="shrink-0" aria-hidden="true" /></a>}
            {item.category === 'Kheer' && <p className="text-xs text-muted-foreground mt-1">Served in a kulhad</p>}
            {item.slug === 'butter-veggie-maggi' && <p className="text-xs text-muted-foreground mt-1">With vegetables &amp; butter</p>}
            {item.slug === 'dry-fruits' && <p className="text-xs text-muted-foreground mt-1">Ask for the available varieties.</p>}
            {item.iceCream && <label className="mt-3 flex min-h-11 items-center gap-2 rounded-lg border border-border p-2 text-xs sm:text-sm cursor-pointer"><input type="checkbox" aria-label={`Add ice cream to ${item.name}`} checked={Boolean(withIceCream[item.slug])} onChange={event => setWithIceCream(current => ({...current, [item.slug]: event.target.checked}))} className="h-4 w-4 shrink-0 accent-primary" /><span>With ice cream <span className="whitespace-nowrap">+₹20</span></span></label>}
          </div>
        </article>)}
      </div>
      {!filtered.length && <div className="py-12 text-center"><p>No menu items match your search.</p><button type="button" onClick={() => {setSearch(''); setCategory('All');}} className="btn-outline mt-4">Show all items</button></div>}
    </div>
  </div>;
}
