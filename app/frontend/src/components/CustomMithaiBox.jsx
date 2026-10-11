import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, X, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { BUSINESS } from '../lib/api';
import { formatMoney, packPrice } from '../lib/cart';
import { customSweetSlugs, canChooseSweet, quoteCustomBox, customBoxEnquiry, hasAssortmentPhoto, PORTION_COUNT, PORTION_GRAMS } from '../lib/mithaiBox';
import fallbackProducts from '../generated/catalog.json';
import OptimizedImage from './OptimizedImage';

const filters = ['All sweets', 'Laddoos', 'Fruit bites', 'Barfi & more'];
const fallbackCatalog = Object.fromEntries(fallbackProducts.map(product => [product.slug, product]));

export default function CustomMithaiBox() {
  const { catalog, catalogStatus, refreshCatalog } = useCart();
  const [selections, setSelections] = useState([]);
  const [filter, setFilter] = useState('All sweets');
  const id = useId();
  const current = catalogStatus === 'ready' ? catalog : { ...fallbackCatalog, ...catalog };
  const choices = customSweetSlugs.map(slug => current[slug]).filter(Boolean);
  const visibleChoices = choices.filter(product => filter === 'All sweets' ||
    (filter === 'Laddoos' ? product.slug.includes('laddoo') : filter === 'Fruit bites' ? product.slug.endsWith('-bite') : !product.slug.includes('laddoo') && !product.slug.endsWith('-bite')));
  const quote = quoteCustomBox(selections, current);
  const ready = catalogStatus === 'ready';
  const canEnquire = ready && quote.complete;
  const enquiryUrl = canEnquire ? `https://wa.me/91${BUSINESS.whatsapp}?text=${encodeURIComponent(customBoxEnquiry(quote))}` : null;

  function addSweet(product) {
    if (!ready || !canChooseSweet(product)) return;
    setSelections(items => items.length < PORTION_COUNT ? [...items, product.slug] : items);
  }

  return <section id="custom-box" aria-labelledby={`${id}-heading`} className="my-12 scroll-mt-28 border-t border-border pt-10">
    <h2 id={`${id}-heading`} className="text-2xl sm:text-3xl font-serif">Customise your 1 kg box</h2>
    <p className="mt-3 max-w-2xl text-sm text-muted-foreground leading-relaxed">Choose four 250 g sections. You can repeat a sweet. The total uses each sweet's individual rate, with no extra packaging charge.</p>
    <p className="mt-2 text-xs text-muted-foreground">Ready-made box prices apply to their listed assortment.</p>
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] items-start">
      <aside id={`${id}-summary`} className="scroll-mt-28 card-warm p-5 lg:col-start-2 lg:row-start-1 lg:sticky lg:top-28" aria-label="Your custom box">
        <h3 className="text-xl font-serif">Your box</h3>
        <p className="mt-2 text-sm font-medium" role="status" aria-live="polite">{selections.length} of 4 sections selected{selections.length > 0 ? ` \u00b7 ${quote.grams} g` : ''}</p>
        <ol className="mt-4 space-y-2">
          {Array.from({ length: PORTION_COUNT }, (_, index) => {
            const line = quote.lines[index];
            return <li key={index} className="flex min-h-14 items-center gap-2 rounded-lg border border-border p-2.5 text-sm">
              <span className="text-muted-foreground shrink-0">{index + 1}.</span>
              {line ? <>
                <div className="min-w-0 flex-1"><p className="font-medium">{line.name}</p><p className="text-xs text-muted-foreground">250 g{line.available ? ` \u00b7 ${formatMoney(line.pricePaise)}` : ' - unavailable, please replace'}</p></div>
                <button type="button" onClick={() => setSelections(items => items.filter((_, position) => position !== index))} className="grid h-11 w-11 shrink-0 place-items-center rounded hover:bg-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" aria-label={`Remove section ${index + 1}: ${line.name}`}><X size={16} aria-hidden="true" /></button>
              </> : <span className="text-muted-foreground">Choose a sweet &middot; 250 g</span>}
            </li>;
          })}
        </ol>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4 text-sm"><span>{quote.complete ? '1 kg box total' : 'Selected sweets subtotal'}</span><strong className="text-lg">{quote.totalPaise === null ? 'Update selection' : formatMoney(quote.totalPaise)}</strong></div>
        {canEnquire ? <a href={enquiryUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 w-full justify-center !px-3 text-sm"><MessageCircle size={17} aria-hidden="true" /> Enquire on WhatsApp</a> : <button type="button" disabled className="btn-primary mt-4 w-full justify-center !px-3 text-sm opacity-50">{!ready ? catalogStatus === 'error' ? 'Current prices unavailable' : 'Loading current prices' : !quote.valid ? 'Replace unavailable sweets' : `Choose ${PORTION_COUNT - selections.length} more section${selections.length === 3 ? '' : 's'}`}</button>}
        {catalogStatus === 'error' && <button type="button" onClick={() => refreshCatalog().catch(() => {})} className="mt-2 min-h-11 text-sm underline">Reload current prices</button>}
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Opens WhatsApp with all four selections and the total. Send your enquiry there to confirm availability.</p>
      </aside>
      <div className="min-w-0 lg:col-start-1 lg:row-start-1">
        <div className="sticky top-24 z-30 mb-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-background/95 p-3 shadow-sm lg:hidden">
          <p className="text-sm font-medium">{selections.length}/4 selected{quote.totalPaise !== null ? ` \u00b7 ${formatMoney(quote.totalPaise)}` : ''}</p>
          <a href={`#${id}-summary`} className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">Review box</a>
        </div>
        <div className="mb-4 flex flex-wrap gap-2" aria-label="Filter custom box sweets">
          {filters.map(label => <button key={label} type="button" aria-pressed={filter === label} onClick={() => setFilter(label)} className={`min-h-11 rounded-full border px-3 text-xs sm:text-sm ${filter === label ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-primary/5'}`}>{label}</button>)}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
          {visibleChoices.map(product => {
            const available = canChooseSweet(product);
            const count = selections.filter(slug => slug === product.slug).length;
            return <article key={product.slug} className="card-warm flex min-w-0 flex-col overflow-hidden">
              <Link to={`/products/${product.slug}`} aria-label={`View ${product.name}`}><OptimizedImage src={product.image} alt={product.name} width={300} height={240} sizes="(min-width: 1280px) 230px, (min-width: 1024px) 300px, 45vw" className="aspect-[5/4] w-full object-cover" /></Link>
              <div className="flex flex-1 flex-col p-3">
                <Link to={`/products/${product.slug}`} className="font-semibold text-sm leading-snug hover:underline">{product.name}</Link>
                {hasAssortmentPhoto(product.slug) && <p className="mt-1 text-[11px] text-muted-foreground">Shown in an assorted box</p>}
                <p className="mt-2 text-xs text-muted-foreground">{available ? `${formatMoney(product.unit_price_paise)}/kg` : 'Currently unavailable'}</p>
                <p className="mt-1 text-sm font-semibold">{available ? `${formatMoney(packPrice(product.unit_price_paise, PORTION_GRAMS))} / 250 g` : '\u2014'}</p>
                <p className="mt-1 min-h-4 text-xs text-muted-foreground">{count > 0 ? `${count * PORTION_GRAMS} g selected` : ''}</p>
                <button type="button" disabled={!ready || !available || selections.length >= PORTION_COUNT} onClick={() => addSweet(product)} aria-label={`Add 250 g of ${product.name} to custom box`} className="btn-outline mt-3 min-h-11 w-full justify-center !px-2 !py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"><Plus size={14} aria-hidden="true" /> Add 250 g</button>
              </div>
            </article>;
          })}
        </div>
      </div>
    </div>
  </section>;
}
