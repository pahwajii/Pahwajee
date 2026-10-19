import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { waLink } from '../lib/api';

export default function HamperCard({ hamper, collection, browse = false }) {
  const destination = `/gifting#${hamper.id}`;
  const unavailable = /unavailable|sold out|out of stock/i.test(collection?.availability || '');
  return <article id={browse ? undefined : hamper.id} className="card-warm scroll-mt-28 overflow-hidden flex flex-col target:ring-2 target:ring-primary" data-testid="gift-hamper-card">
    {browse ? <Link to={destination} aria-label={`Choose ${hamper.name}`}>
      <OptimizedImage square src={hamper.image} alt={hamper.name} sizes="(min-width: 1280px) 300px, (min-width: 1024px) 33vw, 50vw" className="block aspect-square w-full object-cover" />
    </Link> : <OptimizedImage square src={hamper.image} alt={hamper.name} sizes="(min-width: 1024px) 33vw, 50vw" className="block aspect-square w-full object-cover" />}
    <div className="flex flex-1 flex-col p-3 sm:p-4">
      <h3 className="text-base sm:text-xl leading-snug font-serif">{hamper.name}</h3>
      <p className="my-2 text-xs sm:text-sm text-muted-foreground">{collection?.availability || 'Confirm availability'}</p>
      {browse ? <Link to={destination} className="mt-auto inline-flex min-h-11 items-center justify-between gap-2 text-sm font-semibold text-primary dark:text-secondary" aria-label={`Choose ${hamper.name} on the gifting page`}>Choose hamper <ArrowRight size={16} aria-hidden="true" /></Link>
        : <>
          <a href={waLink(`${hamper.name}. Photo: https://pahwajee.in${hamper.image}. Please confirm contents, final price, quantity and delivery or collection date`)} target="_blank" rel="noopener noreferrer" className="mt-auto min-h-11 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-3 py-2 text-sm font-semibold" aria-label={`${unavailable ? 'Ask about' : 'Order'} ${hamper.name} on WhatsApp`}>{unavailable ? 'Ask about availability' : 'Order now'}</a>
          <Link to="/products/dry-fruit-gift-trays" className="mt-1 inline-flex min-h-11 items-center justify-center text-xs sm:text-sm underline underline-offset-4">View hamper details</Link>
        </>}
    </div>
  </article>;
}
