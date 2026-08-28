import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';

export default function ProductCard({ product }) {
  const { name, slug, image, price, availability, bestseller, bestSeller, featured } = product;
  const isBestSeller = bestseller || bestSeller;

  return (
    <article className="card-warm group" data-testid={`product-card-${slug}`}>
      <Link to={`/products/${slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={image || '/placeholder.jpg'}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {(isBestSeller || featured) && (
            <span className="absolute left-3 top-3 rounded-full bg-secondary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-secondary-foreground shadow">
              {isBestSeller ? 'Best Seller' : 'Featured'}
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/products/${slug}`} className="font-serif text-xl font-semibold hover:text-primary transition-colors">
          {name}
        </Link>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-secondary">{price || 'Price on request'}</p>
            <p className={`mt-1 text-xs ${availability === 'Available' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
              {availability}
            </p>
          </div>
          <a
            href={`tel:+916396339806`}
            className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:scale-110"
            aria-label={`Call to order ${name}`}
            data-testid={`call-order-${slug}`}
          >
            <Phone size={16} />
          </a>
        </div>
      </div>
    </article>
  );
}
