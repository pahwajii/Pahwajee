import { Link, NavLink, useLocation, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Phone, MessageCircle, Sun, Moon, MapPin, Clock, Share2, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BUSINESS, waLink, telLink } from "@/lib/api";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/diwali", label: "Diwali Specials" },
  { to: "/gifting", label: "Corporate Gifting" },
  { to: "/about", label: "About Us" },
  { to: "/testimonials", label: "Reviews" },
  { to: "/contact", label: "Contact Us" },
];

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const s = localStorage.getItem("pahwa-theme");
    if (s) return s === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("pahwa-theme", dark ? "dark" : "light");
  }, [dark]);
  return [dark, setDark];
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useDarkMode();
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
        <div className={`glass rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between transition-all ${scrolled ? "shadow-xl" : "shadow-md"}`}>
          <Link to="/" data-testid="nav-logo" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition">
              <span className="font-serif text-secondary text-xl font-bold">P</span>
            </div>
            <div className="leading-tight">
              <div className="font-serif text-xl sm:text-2xl font-bold tracking-tight">PAHWA JEE</div>
              <div className="text-[10px] tracking-[0.24em] text-secondary uppercase -mt-0.5">Since Generations · Meerut</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`nav-link-${n.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-full text-sm font-medium transition-colors ${isActive ? "text-primary bg-primary/10" : "text-foreground/80 hover:text-primary hover:bg-primary/5"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              data-testid="theme-toggle"
              onClick={() => setDark(!dark)}
              aria-label="Toggle theme"
              className="p-2 rounded-full hover:bg-primary/10 transition"
            >
              {dark ? <Sun className="w-5 h-5 text-secondary" /> : <Moon className="w-5 h-5 text-primary" />}
            </button>
            <a
              data-testid="nav-whatsapp-btn"
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex btn-gold !py-2 !px-4 !text-sm !bg-emerald-600 !text-white hover:!bg-emerald-700 shadow-md shadow-emerald-600/20"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
            <a
              data-testid="nav-call-btn"
              href={telLink(BUSINESS.phones[0])}
              className="hidden md:inline-flex btn-primary !py-2 !px-4 !text-sm"
            >
              <Phone className="w-4 h-4" /> Call
            </a>
            <button
              data-testid="nav-menu-toggle"
              className="lg:hidden p-2 rounded-full hover:bg-primary/10"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden mt-2 glass rounded-2xl p-3"
              data-testid="mobile-menu"
            >
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-sm font-medium ${isActive ? "text-primary bg-primary/10" : "text-foreground/80 hover:bg-primary/5"}`
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn-gold justify-center w-full !bg-emerald-600 !text-white flex items-center gap-2 py-2.5">
                  <MessageCircle className="w-4 h-4" /> WhatsApp Order
                </a>
                <a href={telLink()} className="btn-primary justify-center w-full flex items-center gap-2 py-2.5">
                  <Phone className="w-4 h-4" /> Call Now
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function FloatingButtons() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3" data-testid="floating-buttons">
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
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow pt-24">
        <Outlet />
      </main>
      <FloatingButtons />
      <footer className="bg-card border-t border-border mt-auto py-12">
        <div className="container-x grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="font-serif text-2xl font-bold mb-4 text-primary">PAHWA JEE</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed max-w-sm">{BUSINESS.tagline}</p>
            <div className="flex gap-4">
              <a href={BUSINESS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition p-2 rounded-full hover:bg-primary/5">
                <Share2 className="w-5 h-5" />
              </a>
              <a href={BUSINESS.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition p-2 rounded-full hover:bg-primary/5">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-4 uppercase tracking-wider text-secondary">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">All Products</Link></li>
              <li><Link to="/diwali" className="text-muted-foreground hover:text-primary transition-colors font-medium text-primary">Diwali Specials</Link></li>
              <li><Link to="/gifting" className="text-muted-foreground hover:text-primary transition-colors">Corporate Gifting</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">Our Story</Link></li>
              <li><Link to="/testimonials" className="text-muted-foreground hover:text-primary transition-colors">Reviews</Link></li>
              <li><Link to="/faqs" className="text-muted-foreground hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-4 uppercase tracking-wider text-secondary">Contact Info</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>{BUSINESS.address}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-primary shrink-0" />
                <span>{BUSINESS.hours}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href={telLink()} className="hover:text-primary transition-colors">{BUSINESS.phones.join(', ')}</a>
              </p>
              <p className="flex items-center gap-2.5">
                <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <a href={waLink()} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp Chat</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
