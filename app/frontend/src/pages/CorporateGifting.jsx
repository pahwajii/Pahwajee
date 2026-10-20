import OrderHelp from '../components/OrderHelp';
import HamperCard from '../components/HamperCard';
import useGiftCollection from '../lib/useGiftCollection';
import { Link } from 'react-router-dom';
import { displayPrice } from '../lib/cart';
import CustomMithaiBox from '../components/CustomMithaiBox';
import ProductCard from '../components/ProductCard';
import BulkInquiryForm from '../components/BulkInquiryForm';
import SEO from '../components/SEO';
import { Award, Truck, Palette } from 'lucide-react';

export default function CorporateGifting() {
  const { collection: hamperCollection, hampers, boxes: giftBoxes } = useGiftCollection();
  return (
    <div className="noise-bg min-h-screen pb-16 pt-8">
      <SEO 
        title="Gift Hampers & Mithai Gift Boxes in Meerut | PAHWAJEE"
        description="Compare dry fruit hampers and 1 kg mithai boxes at Pahwajee, Meerut. Choose a ready-made assortment or four 250 g sections for a custom box."
      />

      <div className="container-x">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="inline-flex min-h-11 items-center hover:underline">Home</Link><span aria-hidden="true">/</span>
          <Link to="/diwali" className="inline-flex min-h-11 items-center hover:underline">Diwali collection</Link><span aria-hidden="true">/</span><span aria-current="page">Gift hampers</span>
        </nav>
        <section className="max-w-3xl pt-4 pb-6 sm:pb-8">
          <h1 className="text-3xl sm:text-5xl font-serif leading-tight">Gift Hampers &amp; Mithai Boxes in Meerut</h1>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed">Choose a dry fruit design and use Order now to confirm it on WhatsApp. For a ready-made 1 kg mithai box, choose your quantity, add it to the cart and review your order.</p>
          <nav aria-label="Gifting sections" className="mt-4 flex flex-wrap gap-2">
            {[['dry-fruit-hampers','Dry fruit hampers'],['mithai-gift-boxes','Mithai boxes'],['custom-box','Customise a box'],['bulk-gifting','Bulk orders']].map(([id,label]) => <Link key={id} to={`/gifting#${id}`} className="inline-flex min-h-11 items-center rounded-full border border-border px-3 text-sm font-semibold hover:bg-primary/10">{label}</Link>)}
          </nav>
        </section>
        {hampers.length > 0 && <section id="dry-fruit-hampers" className="my-6 sm:my-8 scroll-mt-28" aria-labelledby="dry-fruit-hampers-heading">
          <h2 id="dry-fruit-hampers-heading" className="text-2xl sm:text-3xl mb-2">Dry Fruit Gift Hampers</h2>
          <p className="text-sm text-muted-foreground mb-5">{displayPrice(hamperCollection)}. Order now opens WhatsApp with your chosen design. Confirm contents, final price and delivery or collection date there.</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">{hampers.map(hamper => <HamperCard key={hamper.id} hamper={hamper} collection={hamperCollection} />)}</div>
        </section>}
        <section id="mithai-gift-boxes" className="my-10 scroll-mt-28" aria-labelledby="mithai-gift-boxes-heading">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2"><h2 id="mithai-gift-boxes-heading" className="text-2xl sm:text-3xl">Mithai Gift Boxes</h2><Link to="/cart" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary dark:text-secondary underline">Review cart &amp; order</Link></div>
          <p className="text-sm text-muted-foreground mb-5">All mithai gift boxes, including Mixed Fruit Special Bites, are available in 1 kg boxes only.</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">{giftBoxes.map(product => <div key={product.slug} id={`gift-${product.slug}`} className="scroll-mt-28 rounded-2xl target:ring-2 target:ring-primary"><ProductCard product={product} /></div>)}</div>
        </section>

        <CustomMithaiBox />
        <div className="flex flex-wrap gap-x-5 text-sm font-semibold text-primary dark:text-secondary">
          <Link to="/sweets-meerut" className="inline-flex min-h-11 items-center underline">Compare laddoos, barfi &amp; fruit bites</Link>
          <Link to="/blog/diwali-gift-hampers-meerut-guide" className="inline-flex min-h-11 items-center underline">Read the Meerut gift hamper buying guide</Link>
        </div>
        <OrderHelp photo="/gallery/pahwa-signature-mithai-box-real.webp" caption="A real Pahwajee mithai box from our gallery." />

        {/* Pillars / Value Prop */}
        <section className="grid gap-8 md:grid-cols-3 my-12">
          <div className="card-warm p-6 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">Custom Branding</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For a corporate or wedding order, share your packaging idea, message and quantity. Confirm which custom details are available and their cost before ordering.
            </p>
          </div>

          <div className="card-warm p-6 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">Flexible Budgets</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              From premium budget-friendly boxes to luxury dry fruit trays and custom hampers, we design packages tailored to your specific budget targets.
            </p>
          </div>

          <div className="card-warm p-6 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">Collection & Delivery</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Share your Meerut delivery location and required date. The team will confirm whether delivery is available, the charges and timing, or arrange store collection.
            </p>
          </div>
        </section>

        <BulkInquiryForm />
      </div>
    </div>
  );
}
