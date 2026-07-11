import { Link, Outlet } from 'react-router-dom';
import { MessageCircle, Moon, Phone } from 'lucide-react';

export default function Layout() {
  const nav = [
    ['/', 'Home'],
    ['/products', 'Products'],
    ['/gallery', 'Gallery'],
    ['/about', 'About'],
    ['/testimonials', 'Reviews'],
    ['/faqs', 'FAQs'],
    ['/contact', 'Contact'],
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-4 z-50 px-4">
        <nav className="glass mx-auto flex max-w-5xl items-center justify-between rounded-lg px-4 py-3">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary font-serif text-lg font-bold text-primary-foreground shadow-md">P</span>
            <span>
              <span className="block font-serif text-xl font-bold leading-none">PAHWA JEE</span>
              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.24em] text-secondary">Since Generations · Meerut</span>
            </span>
          </Link>
          <div className="hidden items-center gap-1 lg:flex">
            {nav.map(([to, label]) => (
              <Link key={to} to={to} className="rounded-full px-4 py-2 text-sm font-medium hover:bg-primary/10 hover:text-primary">
                {label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button aria-label="Toggle theme" className="grid h-9 w-9 place-items-center rounded-full text-primary hover:bg-primary/10">
              <Moon size={17} />
            </button>
            <a href="tel:+916396339806" className="btn-primary px-4 py-2">
              <Phone size={15} /> Call
            </a>
          </div>
        </nav>
      </header>
      <main className="-mt-16 flex-1 pt-16">
        <Outlet />
      </main>
      <div className="fixed bottom-8 right-6 z-50 flex flex-col gap-3">
        <a aria-label="WhatsApp order" href="https://wa.me/916396339806" className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-white shadow-xl">
          <MessageCircle size={23} />
        </a>
        <a aria-label="Call PAHWA JEE" href="tel:+916396339806" className="grid h-11 w-11 place-items-center rounded-full bg-primary text-white shadow-xl">
          <Phone size={18} />
        </a>
      </div>
      <footer className="border-t border-border/70 py-8">
        <div className="container-x flex flex-col justify-between gap-3 text-sm text-muted-foreground md:flex-row">
          <p>PAHWA JEE · Since generations in Meerut.</p>
          <p>Call +91 6396339806</p>
        </div>
      </footer>
    </div>
  );
}
