import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { usePromo } from '../context/PromoContext';

export default function AnnouncementBanner() {
  const { promo, bannerVisible, dismissBanner } = usePromo();

  if (!bannerVisible || !promo?.text) return null;

  const targetLink = promo.cta_link || '/rewri-gajak-meerut';

  return (
    <aside
      aria-label="Promotion announcement"
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-800 via-primary to-amber-800 text-white shadow-sm"
    >
      <div className="container-x flex items-center justify-between gap-2 py-2 text-xs sm:text-sm">
        <div className="hidden sm:block w-7 shrink-0" aria-hidden="true" />
        <Link
          to={targetLink}
          className="flex-1 text-center inline-flex items-center justify-center gap-2 hover:underline font-medium min-h-6 leading-tight py-0.5"
        >
          <Sparkles size={14} className="text-secondary shrink-0" aria-hidden="true" />
          <span className="truncate sm:whitespace-normal font-medium">{promo.text}</span>
          <ArrowRight size={14} className="shrink-0 hidden sm:inline" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={dismissBanner}
          aria-label="Dismiss banner"
          className="grid h-7 w-7 place-items-center rounded-full hover:bg-white/20 transition-colors text-white shrink-0"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}

