import FavouriteButton from './FavouriteButton';
import { isMithaiBox, hasAssortmentPhoto } from '../lib/mithaiBox';
import { displayPrice } from '../lib/cart';
import OptimizedImage from './OptimizedImage';
import { Link } from 'react-router-dom';
import { MessageCircle, Phone } from 'lucide-react';
import { waLink } from '../lib/api';
import AddToCart from './AddToCart';

export default function ProductCard({ product }) {
  const { name, slug, image, price, availability, bestseller, bestSeller, featured, category } = product;
  const isBestSeller = bestseller || bestSeller;

  return (
    <article className="product-card card-warm group h-full min-w-0 flex flex-col sm:justify-between" data-testid={`product-card-${slug}`}>
      <div className="relative">
        <FavouriteButton item={product} className="absolute top-2 right-2 z-10" />
        <Link to={`/products/${slug}`} className="block">
          <div className="relative aspect-[6/5] sm:aspect-[4/5] overflow-hidden bg-muted">
            <OptimizedImage
              sizes="(min-width: 1280px) 300px, (min-width: 1024px) 33vw, 50vw"
              src={image || '/placeholder.jpg'}
              alt={name}
              className={`h-full w-full ${category === "festival-collection" ? "object-contain" : "object-cover"} transition-transform duration-500 group-hover:scale-105`}
              loading="lazy"
            />
            {['mawa-barfi', 'mawa-til-laddoo', 'gond-laddoo', 'strawberry-bite', 'kachha-aam-bite', 'khajoor-barfi'].includes(slug) && <span className="absolute bottom-2 right-2 rounded bg-background/90 px-2 py-1 text-[11px]">Illustrative</span>}
            {(isBestSeller || featured) && (
              <span className="absolute left-2 top-2 sm:left-3 sm:top-3 rounded-full bg-secondary px-2 sm:px-3 py-1 text-[10px] font-bold uppercase tracking-wide sm:tracking-[0.18em] text-secondary-foreground shadow">
                {isBestSeller ? 'Best Seller' : 'Featured'}
              </span>
            )}
          </div>
        </Link>
        <div className="p-2 sm:p-4">
          <Link to={`/products/${slug}`} className="font-serif text-base sm:text-lg font-semibold hover:text-primary transition-colors block leading-tight mb-1">
            {name}
          </Link>
          <p className="text-xs font-semibold text-secondary mb-1 sm:mb-3">{displayPrice(product)}</p>
          {isMithaiBox(slug) && <p className="text-xs text-muted-foreground mb-2">{slug === 'pahwa-signature-mithai-box' ? 'Khajoor Laddoo, Mango Bite, Mawa Til Laddoo & Gond Laddoo' : slug === 'pahwa-winter-mithai-box' ? 'Alsi Laddoo, Gond Laddoo, Mawa Barfi & Khajoor Barfi' : 'Mango, Kachha Aam & Strawberry Bites'}</p>}
          {hasAssortmentPhoto(slug) && <p className="text-xs text-muted-foreground">Shown in an assorted box</p>}
        </div>
      </div>

      <div className="product-card-actions p-2 pt-0 sm:p-4 sm:pt-0 space-y-2 sm:space-y-3">
        <AddToCart product={product} />
        <Link to={`/products/${slug}`} className="inline-flex min-h-11 items-center text-xs sm:text-sm font-semibold text-primary dark:text-secondary underline underline-offset-4" aria-label={`View ${name} product details`}><span className="sm:hidden">{isMithaiBox(slug) ? 'Details & customise' : 'Details'}</span><span className="hidden sm:inline">{isMithaiBox(slug) ? 'View box & customise' : 'View product details'}</span></Link>
        <div className="border-t border-border/20 pt-3 hidden sm:flex flex-wrap items-center justify-between gap-2">
        <span className={`w-full sm:w-auto text-xs sm:text-[11px] font-medium ${availability === 'Available' ? 'text-emerald-700' : 'text-amber-700'}`}>
          {availability || 'Fresh Daily'}
        </span>
        <div className="flex items-center gap-2">
          <a
            href={waLink(`Hi PAHWAJEE, I want to order: ${name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-11 w-11 sm:h-9 sm:w-9 place-items-center rounded-full bg-emerald-600 text-white shadow-sm transition hover:scale-105"
            aria-label={`WhatsApp order ${name}`}
          >
            <MessageCircle size={15} />
          </a>
          <a
            href={`tel:+916396339806`}
            className="grid h-11 w-11 sm:h-9 sm:w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:scale-105"
            aria-label={`Call store for ${name}`}
          >
            <Phone size={15} />
          </a>
        </div>
        </div>
      </div>
    </article>
  );
}
