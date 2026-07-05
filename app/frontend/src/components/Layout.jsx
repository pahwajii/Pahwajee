import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, Phone, MessageCircle, Sun, Moon, MapPin, Clock, Instagram, Facebook } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BUSINESS, waLink, telLink } from "@/lib/api";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/testimonials", label: "Reviews" },
  { to: "/faqs", label: "FAQs" },
  { to: "/contact", label: "Contact" },
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
              <a href={telLink()} className="block mt-2 btn-primary w-full justify-center">
                <Phone className="w-4 h-4" /> Call Now
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow pt-24">
        {children}
      </main>
      <footer className="bg-card border-t border-border mt-auto py-12">
        <div className="container-x grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-serif text-xl font-bold mb-4">PAHWA JEE</h3>
            <p className="text-sm text-muted-foreground">{BUSINESS.tagline}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-4">Contact Info</h4>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4" /> {BUSINESS.address}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> {BUSINESS.hours}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a href={BUSINESS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={BUSINESS.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
