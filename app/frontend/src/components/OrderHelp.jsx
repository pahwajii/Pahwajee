import { Link } from 'react-router-dom';
import { BUSINESS } from '../lib/api';
import OptimizedImage from './OptimizedImage';

export default function OrderHelp({ photo, caption }) {
  return <section className="my-10 grid gap-6 rounded-2xl border border-border bg-card p-4 sm:p-6 md:grid-cols-[1fr_240px]" aria-label="Ordering and store information">
    <div>
      <h2 className="font-serif text-2xl">Ordering from Pahwajee, Meerut</h2>
      <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm leading-relaxed text-muted-foreground">
        <li>Choose the variety, pack size and quantity. The catalogue shows the listed price and availability for each item.</li>
        <li>Add eligible items to your cart, or send an enquiry for custom boxes, cakes and special orders.</li>
        <li>Confirm your required date, collection outlet or delivery location with the team. Delivery charges and timing are confirmed for your order.</li>
      </ol>
      <p className="mt-4 text-sm text-muted-foreground">Visit {BUSINESS.outlets[0].address}. {BUSINESS.hours}.</p>
      <div className="mt-2 flex flex-wrap gap-x-5 text-sm font-semibold text-primary dark:text-secondary">
        <Link className="inline-flex min-h-11 items-center underline underline-offset-4" to="/contact">Both outlets & contact numbers</Link>
        <Link className="inline-flex min-h-11 items-center underline underline-offset-4" to="/faqs">Ordering FAQs</Link>
      </div>
    </div>
    <figure className="min-w-0">
      <Link to="/gallery"><OptimizedImage src={photo || '/our_shop_main.jpeg'} alt={caption || 'The Pahwa Jee shop entrance in Meerut'} sizes="(min-width: 768px) 240px, 80vw" className="aspect-square w-full object-cover rounded-xl" /></Link>
      <figcaption className="mt-2 text-xs leading-relaxed text-muted-foreground">{caption || 'Our Meerut storefront.'} <Link className="underline underline-offset-4" to="/gallery">See real shop photos</Link>.</figcaption>
    </figure>
  </section>;
}
