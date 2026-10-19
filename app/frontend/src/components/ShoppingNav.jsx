import { NavLink } from 'react-router-dom';
import { Gift, ArrowRight } from 'lucide-react';

export default function ShoppingNav() {
  return <nav aria-label="Diwali shopping" className="container-x pt-2">
    <div className="flex flex-wrap items-center justify-between gap-x-4 rounded-xl border border-border bg-card px-3 sm:px-4">
      <NavLink to="/diwali" className={({ isActive }) => `inline-flex min-h-11 items-center gap-2 text-sm font-semibold ${isActive ? 'text-primary dark:text-secondary' : 'text-foreground'}`}><Gift size={16} aria-hidden="true" /> Diwali collection</NavLink>
      <NavLink to="/gifting" className={({ isActive }) => `inline-flex min-h-11 items-center gap-1 text-sm font-semibold ${isActive ? 'text-primary dark:text-secondary' : 'text-foreground'}`}>Gift hampers <ArrowRight size={15} aria-hidden="true" /></NavLink>
    </div>
  </nav>;
}
