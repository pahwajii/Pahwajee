import { useFavourites } from '../context/FavouritesContext';
import FssaiNotice from './FssaiNotice';
import { Link, NavLink, useLocation, Outlet } from "react-router-dom";
import { Suspense, useEffect, useState } from "react";
import { Menu, X, Phone, MessageCircle, Sun, Moon, Clock, Instagram, Facebook, ShoppingBag, Heart } from "lucide-react";
import { BUSINESS, waLink, telLink } from "@/lib/api";
import { useCart } from "../context/CartContext";
import BrandLogo from './BrandLogo';
import ShoppingNav from './ShoppingNav';

const NAV = [
  { to: "/diwali", label: "Diwali" },
  { to: "/products", label: "Shop" },
  { to: "/in-store-menu", label: "In-store Menu" },
  { to: "/our-specialities", label: "Our Specialities" },
  { to: "/gifting", label: "Gift Hampers" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/testimonials", label: "Reviews" },
  { to: "/contact", label: "Contact" },
];

function useDarkMode() {
  // Match prerendered markup; restore the visitor's preference after hydration.
  const [dark, setDark] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  useEffect(() => {
    let preference;
    try { preference = localStorage.getItem("pahwa-theme"); } catch { /* Storage can be disabled. */ }
    setDark(preference ? preference === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
    setThemeReady(true);
  }, []);
  useEffect(() => {
    if (!themeReady) return;
    document.documentElement.classList.toggle("dark", dark);
    try { localStorage.setItem("pahwa-theme", dark ? "dark" : "light"); } catch { /* Theme still works in memory. */ }
  }, [dark, themeReady]);
  return [dark, setDark];
}

function Navbar({ dark, onToggleTheme }) {
  const { count } = useCart();
  const { items: favourites } = useFavourites();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header
      data-testid="site-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`}
    >
      <div className="container-x">
        <div className={`glass rounded-2xl px-3 sm:px-6 py-3 flex items-center justify-between gap-2 xl:gap-4 transition-all ${scrolled ? "shadow-xl" : "shadow-md"}`}>
          <Link to="/" data-testid="nav-logo" className="flex shrink-0 items-center gap-2 group">
            <BrandLogo
              className="h-9 sm:h-11 w-auto object-contain transition-transform group-hover:scale-105"
            />
          </Link>

          <nav className="hidden xl:flex flex-1 items-center justify-center gap-2">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`nav-link-${n.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `px-2 py-2.5 rounded-full text-sm whitespace-nowrap font-semibold transition-colors ${isActive ? "text-primary bg-primary/10" : "text-foreground/80 hover:text-primary hover:bg-primary/5"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <NavLink to="/favourites" aria-label={`Favourites, ${favourites.length} saved items`} data-testid="nav-favourites" className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full text-primary hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary"><Heart className="h-5 w-5" aria-hidden="true" />{favourites.length > 0 && <span aria-hidden="true" className="absolute -right-0.5 top-0 min-w-5 rounded-full bg-primary px-1 text-center text-[10px] font-bold leading-5 text-primary-foreground">{favourites.length}</span>}</NavLink>
            <NavLink to="/cart" aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`} data-testid="nav-cart" className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full text-primary hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && <span aria-hidden="true" className="absolute -right-0.5 top-0 min-w-5 rounded-full bg-primary px-1 text-center text-[10px] font-bold leading-5 text-primary-foreground">{count > 99 ? '99+' : count}</span>}
            </NavLink>
            <button
              data-testid="theme-toggle"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className="hidden sm:inline-flex p-2 rounded-full hover:bg-primary/10 transition"
            >
              {dark ? <Sun className="w-5 h-5 text-secondary" /> : <Moon className="w-5 h-5 text-primary" />}
            </button>
            <button
              data-testid="nav-menu-toggle"
              className="xl:hidden grid h-11 w-11 place-items-center rounded-full hover:bg-primary/10"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
              aria-expanded={open}
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

          {open && (
            <div
              className="mobile-menu-enter xl:hidden mt-2 glass rounded-2xl p-3 max-h-[75vh] overflow-y-auto"
              data-testid="mobile-menu"
            >
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-base font-semibold ${isActive ? "text-primary bg-primary/10" : "text-foreground/80 hover:bg-primary/5"}`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              <NavLink to="/favourites" className="block px-4 py-3 rounded-xl text-base font-semibold">Favourites ({favourites.length})</NavLink>
              <button type="button" onClick={onToggleTheme} className="sm:hidden min-h-11 px-4 text-sm font-semibold">Switch to {dark ? 'light' : 'dark'} theme</button>
              <div className="mt-4 flex flex-col gap-2">
                <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn-gold justify-center w-full !bg-emerald-700 !text-white flex items-center gap-2 py-2.5">
                  <MessageCircle className="w-4 h-4" /> WhatsApp Order
                </a>
                <a href={telLink()} className="btn-primary justify-center w-full flex items-center gap-2 py-2.5">
                  <Phone className="w-4 h-4" /> Call Now
                </a>
              </div>
            </div>
          )}
      </div>
    </header>
  );
}

function FloatingButtons() {
  const { pathname } = useLocation();
  if (pathname === '/diwali') return null;
  const shoppingPage = pathname.startsWith('/products') || ['/gifting', '/favourites', '/in-store-menu', '/our-specialities', '/nankhatai-meerut', '/rewri-gajak-meerut', '/sweets-meerut', '/bakery-meerut'].includes(pathname);
  return (
    <div className={`fixed bottom-6 right-6 z-50 ${shoppingPage ? "hidden sm:flex" : "flex"} flex-col gap-3`} data-testid="floating-buttons">
      <a
        aria-label="WhatsApp order"
        href={waLink()}
        className="group relative grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-110"
      >
        <MessageCircle size={22} />
        <span className="absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-white/90 px-3 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur-sm group-hover:block dark:bg-black/80">
          WhatsApp Order
        </span>
      </a>
      <a
        aria-label="Call PAHWA JEE"
        href={telLink()}
        className="group relative grid h-11 w-11 place-items-center rounded-full bg-primary text-white shadow-xl transition hover:scale-110"
      >
        <Phone size={18} />
        <span className="absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-white/90 px-3 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur-sm group-hover:block dark:bg-black/80">
          Call Now
        </span>
      </a>
    </div>
  );
}

export default function Layout() {
  const [dark, setDark] = useDarkMode();
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar dark={dark} onToggleTheme={() => setDark((value) => !value)} />
      <main className="flex-grow pt-24">
        <ShoppingNav />
        <Suspense fallback={<p className="container-x min-h-64 py-12" role="status">Loading page…</p>}><Outlet /></Suspense>
      </main>
      <FloatingButtons />
      <footer className="bg-card border-t border-border mt-auto py-12">
        <div className="container-x grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <BrandLogo loading="lazy" className="h-auto w-52 sm:w-64 max-w-full mb-4" sizes="(min-width: 640px) 256px, 208px" />
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed max-w-sm">{BUSINESS.tagline}</p>
            <FssaiNotice className="mb-4" />
            <div className="flex flex-wrap gap-4 items-center">
              <a href={BUSINESS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition p-2 rounded-full hover:bg-primary/5 flex items-center gap-1.5" title="Instagram (Abu Lane Branch)">
                <Instagram className="w-5 h-5" />
                <span className="text-xs font-semibold hidden sm:inline">Abu Lane</span>
              </a>
              <a href={BUSINESS.instagramOther} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition p-2 rounded-full hover:bg-primary/5 flex items-center gap-1.5" title="Instagram (Food Adda Branch)">
                <Instagram className="w-5 h-5" />
                <span className="text-xs font-semibold hidden sm:inline">Food Adda</span>
              </a>
              <a href={BUSINESS.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition p-2 rounded-full hover:bg-primary/5" title="Facebook">
                <Facebook className="w-5 h-5" />
              </a>
            </div>

          </div>
          <div>
            <h2 className="font-medium text-sm mb-4 uppercase tracking-wider text-gold-ink">Quick Links</h2>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">Shop Catalogue</Link></li>
              <li><Link to="/favourites" className="text-muted-foreground hover:text-primary transition-colors">Your Favourites</Link></li>
              <li><Link to="/in-store-menu" className="text-muted-foreground hover:text-primary transition-colors">In-store Menu</Link></li>
              <li><Link to="/rewri-gajak-meerut" className="text-muted-foreground hover:text-primary transition-colors">Rewri & Gajak</Link></li>
              <li><Link to="/nankhatai-meerut" className="text-muted-foreground hover:text-primary transition-colors">Nankhatai</Link></li>
              <li><Link to="/gifting" className="text-muted-foreground hover:text-primary transition-colors">Gift Hampers</Link></li>
              <li><Link to="/diwali" className="text-muted-foreground hover:text-primary transition-colors font-medium text-primary">Diwali Specials</Link></li>
              <li><Link to="/sweets-meerut" className="text-muted-foreground hover:text-primary transition-colors">Sweets & Laddoos</Link></li>
              <li><Link to="/bakery-meerut" className="text-muted-foreground hover:text-primary transition-colors">Bakery & Cakes</Link></li>
              <li><Link to="/faqs" className="text-muted-foreground hover:text-primary transition-colors">Ordering FAQs</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About PAHWAJEE</Link></li>
              <li><Link to="/gallery" className="text-muted-foreground hover:text-primary transition-colors">Store Gallery</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link to="/testimonials" className="text-muted-foreground hover:text-primary transition-colors">Customer Reviews</Link></li>
              <li><a href={BUSINESS.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Review us on Google</a></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="font-medium text-sm mb-4 uppercase tracking-wider text-gold-ink">Contact Info</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-primary shrink-0" />
                <span>{BUSINESS.hours}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <a href={waLink()} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp Chat</a>
              </p>
            </div>
            <section aria-labelledby="footer-outlets-heading" className="mt-7 max-w-md border-t border-border pt-6">
              <h3 id="footer-outlets-heading" className="font-serif text-xl text-foreground">Our Outlets</h3>
              <div className="mt-4 space-y-5">
                {BUSINESS.outlets.map(outlet => (
                  <article key={outlet.name}>
                    <h4 className="text-sm font-semibold text-foreground">{outlet.name}</h4>
                    <address className="mt-1.5 text-sm not-italic leading-relaxed text-muted-foreground">{outlet.address}</address>
                    <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
                      {outlet.phones.map(phone => (
                        <a key={phone} href={telLink(phone)} aria-label={`Call ${outlet.name} on ${phone}`} className="inline-flex min-h-11 items-center gap-2 rounded text-sm font-medium text-primary dark:text-secondary underline underline-offset-4 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current">
                          <Phone size={14} aria-hidden="true" />{phone}
                        </a>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
        <div className="container-x mt-8 border-t border-border pt-5">
          <nav aria-label="Store policies" className="flex flex-wrap gap-x-5 gap-y-1 text-xs sm:text-sm text-muted-foreground">
            <Link to="/terms-and-conditions" className="inline-flex min-h-11 items-center underline underline-offset-4">Terms &amp; Conditions</Link>
            <Link to="/privacy-policy" className="inline-flex min-h-11 items-center underline underline-offset-4">Privacy Policy</Link>
            <Link to="/shipping-policy" className="inline-flex min-h-11 items-center underline underline-offset-4">Delivery &amp; Collection</Link>
            <Link to="/returns-and-cancellations" className="inline-flex min-h-11 items-center underline underline-offset-4">Replacements &amp; Cancellations</Link>
            <a href={'mailto:' + BUSINESS.email} className="inline-flex min-h-11 items-center underline underline-offset-4">{BUSINESS.email}</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
