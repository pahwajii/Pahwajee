import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import OptimizedImage from './OptimizedImage';
import { waLink } from '../lib/api';
import { hamperEnquiry, hamperPath } from '../lib/giftHampers';

const photoSizes = '(min-width: 1280px) 377px, (min-width: 1024px) calc((100vw - 144px) / 3), (min-width: 640px) calc((100vw - 88px) / 2), (min-width: 480px) calc((100vw - 44px) / 2), calc(100vw - 32px)';

export default function HamperCard({ hamper, collection, browse = false, priority = false }) {
  const destination = hamperPath(hamper);
  const unavailable = /unavailable|sold out|out of stock/i.test(collection?.availability || '');
  return <article id={browse ? undefined : hamper.id} className="card-warm min-w-0 scroll-mt-28 overflow-hidden flex flex-col target:ring-2 target:ring-primary" data-testid="gift-hamper-card">
    <Link to={destination} aria-label={`View ${hamper.name}`} className="block aspect-square bg-muted/40">
      <OptimizedImage src={hamper.image} alt={hamper.name} sizes={photoSizes} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} className="block h-full w-full object-contain" />
    </Link>
    <div className="flex flex-1 flex-col p-4">
      <h3 className="text-xl leading-snug font-serif break-words">{hamper.name}</h3>
      <p className="my-2 text-sm text-muted-foreground">{collection?.availability || 'Confirm availability'}</p>
      {browse ? <Link to={destination} className="mt-auto inline-flex min-h-11 items-center justify-between gap-2 text-sm font-semibold text-primary dark:text-secondary" aria-label={`Choose hamper: ${hamper.name}`}>Choose hamper <ArrowRight size={16} aria-hidden="true" /></Link>
        : <>
          <a href={waLink(hamperEnquiry(hamper))} target="_blank" rel="noopener noreferrer" className="mt-auto min-h-11 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-3 py-2 text-center text-sm font-semibold" aria-label={`${unavailable ? 'Ask about availability' : 'Enquire on WhatsApp'}: ${hamper.name}`}>{unavailable ? 'Ask about availability' : 'Enquire on WhatsApp'}</a>
          <Link to={destination} className="mt-1 inline-flex min-h-11 items-center justify-center text-sm underline underline-offset-4">View hamper details</Link>
        </>}
    </div>
  </article>;
}
