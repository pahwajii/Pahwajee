import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import OptimizedImage from '../components/OptimizedImage';
import HamperCard from '../components/HamperCard';
import useGiftCollection from '../lib/useGiftCollection';
import { displayPrice } from '../lib/cart';

const faqs = [
  { question: 'How do I order a Diwali hamper?', answer: 'Choose a design from the collection to open it on our gifting page. Use Order now there to confirm the contents, quantity, final price and required date on WhatsApp. Ready-made mithai boxes can be added to your cart.' },
  { question: 'Can I customise a mithai box?', answer: 'Yes. A custom 1 kg box has four 250 g sections. Repeats are allowed and the total uses the individual sweet prices, with no extra packaging charge. Review your selection before sending the enquiry.' },
  { question: 'How do delivery and bulk orders work?', answer: 'Delivery is currently available in Meerut, usually with a distance-based charge of Rs 40-80. Contact us for addresses outside Meerut. For bulk orders, share your quantity, budget and required date so the team can confirm timing and packaging options.' },
];

export default function Diwali() {
  const { collection, hampers, boxes } = useGiftCollection();
  const schema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })) };
  return <div className="noise-bg min-h-screen pb-12 pt-5 sm:pt-8">
    <SEO title="Diwali Sweets & Gift Hampers in Meerut | PAHWAJEE" description="Explore Pahwajee's Diwali dry fruit hamper designs and 1 kg mithai boxes in Meerut. Choose your gift, then review the options and order on our gifting page." schema={schema} />
    <div className="container-x">
      <section className="rounded-2xl bg-gradient-to-r from-amber-950 via-primary to-amber-950 px-5 py-7 sm:p-10 text-white">
        <h1 className="max-w-3xl text-3xl sm:text-5xl font-serif leading-tight">Diwali Gift Hampers &amp; Mithai in Meerut</h1>
        <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-white/90">Find a dry fruit hamper or a 1 kg mithai box for family, friends or your team. Choose a design here, then order from the gifting page.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/gifting#dry-fruit-hampers" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-secondary px-5 py-2 text-sm font-bold text-amber-950">Explore gift hampers <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link to="/gifting#mithai-gift-boxes" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/70 px-5 py-2 text-sm font-semibold">Browse mithai boxes</Link>
        </div>
      </section>
      <section className="my-8 sm:my-10" aria-labelledby="diwali-hampers">
        <h2 id="diwali-hampers" className="text-2xl sm:text-3xl font-serif">Choose your Diwali hamper</h2>
        <p className="mt-2 mb-5 text-sm text-muted-foreground">{collection ? `${displayPrice(collection)}. ` : ''}Compare the designs; the store confirms the contents and final price for your selection.</p>
        {hampers.length ? <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">{hampers.map(hamper => <HamperCard key={hamper.id} hamper={hamper} collection={collection} browse />)}</div> : <p className="text-sm">Please <Link to="/gifting#bulk-gifting" className="underline">ask about the current gifting selection</Link>.</p>}
      </section>
      {boxes.length > 0 && <section className="my-8 sm:my-10" aria-labelledby="diwali-mithai">
        <h2 id="diwali-mithai" className="text-2xl sm:text-3xl font-serif">1 kg mithai gift boxes</h2>
        <p className="mt-2 mb-5 text-sm text-muted-foreground">See the assortment and choose your box quantity on the gifting page.</p>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">{boxes.map(product => <article key={product.slug} className="card-warm overflow-hidden">
          <Link to={`/gifting#gift-${product.slug}`} className="flex h-full flex-col" aria-label={`Choose ${product.name} on the gifting page`}>
            <OptimizedImage square src={product.image} alt={product.name} sizes="(min-width: 1024px) 33vw, 50vw" className="block aspect-square w-full object-cover" />
            <div className="flex flex-1 flex-col p-3 sm:p-4"><h3 className="text-base sm:text-xl font-serif leading-snug">{product.name}</h3><p className="mt-2 text-sm font-semibold text-primary dark:text-secondary">{displayPrice(product)}</p><p className="mt-2 text-xs text-muted-foreground">{product.availability || 'Confirm availability'}</p><span className="mt-auto inline-flex min-h-11 items-center gap-2 text-sm font-semibold">Choose this box <ArrowRight size={16} aria-hidden="true" /></span></div>
          </Link>
        </article>)}</div>
      </section>}
      <section className="my-8 grid gap-4 sm:grid-cols-2" aria-label="More gifting options">
        <div className="card-warm p-4 sm:p-6"><h2 className="text-xl sm:text-2xl font-serif">Make your own mithai box</h2><p className="mt-2 text-sm text-muted-foreground">Pick four 250 g sections and see the total for your 1 kg box.</p><Link to="/gifting#custom-box" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary dark:text-secondary">Customise your box <ArrowRight size={16} aria-hidden="true" /></Link></div>
        <div className="card-warm p-4 sm:p-6"><h2 className="text-xl sm:text-2xl font-serif">Gifts for your team or event</h2><p className="mt-2 text-sm text-muted-foreground">Share your quantity, budget and date for a bulk gifting quote.</p><Link to="/gifting#bulk-gifting" className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary dark:text-secondary">Plan a bulk order <ArrowRight size={16} aria-hidden="true" /></Link></div>
      </section>
      <section className="my-8 max-w-3xl" aria-labelledby="diwali-ordering"><h2 id="diwali-ordering" className="text-2xl font-serif mb-4">Before you order</h2><div className="space-y-3">{faqs.map(faq => <details key={faq.question} className="rounded-xl border border-border bg-card px-4"><summary className="cursor-pointer py-3 text-sm font-semibold">{faq.question}</summary><p className="pb-4 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p></details>)}</div><Link to="/blog/diwali-gift-hampers-meerut-guide" className="mt-3 inline-flex min-h-11 items-center text-sm underline underline-offset-4">Read the Meerut gift hamper buying guide</Link></section>
    </div>
  </div>;
}
