import { NavLink } from 'react-router-dom';
import { Gift, Phone } from 'lucide-react';
import { telLink } from '../lib/api';

export default function ShoppingNav() {
  return <nav aria-label="Shop and contact" className="container-x pt-2" data-contact-placement="shopping_nav">
    <div className="grid grid-cols-3 items-center gap-1 rounded-xl border border-border bg-card p-1 sm:flex sm:gap-5 sm:px-4">
      <NavLink to="/diwali" className={({ isActive }) => `inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-1 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:justify-start ${isActive ? 'text-primary dark:text-secondary' : 'text-foreground'}`}><Gift size={16} className="shrink-0" aria-hidden="true" /><span>Diwali<span className="hidden sm:inline"> collection</span></span></NavLink>
      <NavLink to="/gifting" className={({ isActive }) => `inline-flex min-h-11 items-center justify-center rounded-lg px-1 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${isActive ? 'text-primary dark:text-secondary' : 'text-foreground'}`}><span className="sm:hidden">Hampers</span><span className="hidden sm:inline">Gift hampers</span></NavLink>
      <a href={telLink()} aria-label="Call now: PAHWA JEE" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:ml-auto sm:px-4"><Phone size={16} className="shrink-0" aria-hidden="true" /><span className="whitespace-nowrap">Call now</span></a>
    </div>
  </nav>;
}
