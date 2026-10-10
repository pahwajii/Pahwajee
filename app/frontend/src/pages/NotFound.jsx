import { Link } from 'react-router-dom';
import { ArrowLeft, Home, ShoppingBag } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div className="noise-bg min-h-[70vh] flex items-center justify-center py-20">
      <SEO
        noindex
        title="Page Not Found | PAHWA JEE Meerut"
        description="The page you requested could not be found. Explore our sweets, Rewri, Gajak, and Desi Ghee Nankhatai catalogue."
      />
      <div className="container-x text-center max-w-lg mx-auto">
        <span className="font-serif text-8xl font-bold text-primary/20 block mb-2">404</span>
        <h1 className="text-3xl md:text-4xl font-serif mb-4">Page Not Found</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          The page you are looking for might have been moved, renamed, or is temporarily unavailable. Let's get you back to our delicious specialties.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/" className="btn-primary flex items-center gap-2">
            <Home size={16} /> Return Home
          </Link>
          <Link to="/products" className="btn-outline flex items-center gap-2">
            <ShoppingBag size={16} /> Explore Catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}
