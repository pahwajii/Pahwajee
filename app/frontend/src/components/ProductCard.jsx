import { Link } from 'react-router-dom';
import { MessageCircle, Phone } from 'lucide-react';
import { waLink } from '../lib/api';

export default function ProductCard({ product }) {
  const { name, slug, image, price, availability, bestseller, bestSeller, featured, category } = product;
  const isBestSeller = bestseller || bestSeller;

  return (
    <article className="card-warm group flex flex-col justify-between" data-testid={`product-card-${slug}`}>
      <div>
        <Link to={`/products/${slug}`} className="block">
          <div className="relative aspect-[4/5] overflow-hidden bg-muted">
            <img
              src={image || '/placeholder.jpg'}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {(isBestSeller || featured) && (
              <span className="absolute left-3 top-3 rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-secondary-foreground shadow">
                {isBestSeller ? 'Best Seller' : 'Featured'}
              </span>
            )}
          </div>
        </Link>
        <div className="p-4">
          <Link to={`/products/${slug}`} className="font-serif text-lg font-semibold hover:text-primary transition-colors block leading-tight mb-1">
            {name}
          </Link>
          <p className="text-xs font-semibold text-secondary mb-3">{price || 'Price on request'}</p>
        </div>
      </div>

      <div className="p-4 pt-0 border-t border-border/20 flex items-center justify-between gap-2">
        <span className={`text-[11px] font-medium ${availability === 'Available' ? 'text-emerald-700' : 'text-amber-700'}`}>
          {availability || 'Fresh Daily'}
        </span>
        <div className="flex items-center gap-1.5">
          <a
            href={waLink(`Hi PAHWAJEE, I want to order: ${name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-9 w-9 place-items-center rounded-full bg-emerald-600 text-white shadow-sm transition hover:scale-105"
            aria-label={`WhatsApp order ${name}`}
          >
            <MessageCircle size={15} />
          </a>
          <a
            href={`tel:+916396339806`}
            className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:scale-105"
            aria-label={`Call store for ${name}`}
          >
            <Phone size={15} />
          </a>
        </div>
      </div>
    </article>
  );
}
