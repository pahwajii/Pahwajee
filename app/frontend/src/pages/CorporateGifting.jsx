import OrderHelp from '../components/OrderHelp';
import { giftHamperDesigns } from '../lib/giftHampers';
import OptimizedImage from '../components/OptimizedImage';
import { Link } from 'react-router-dom';
import { displayPrice } from '../lib/cart';
import CustomMithaiBox from '../components/CustomMithaiBox';
import { boxSlugs } from '../lib/mithaiBox';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import fallbackProducts from '../generated/catalog.json';
import { useState } from 'react';
import SEO from '../components/SEO';
import api, { waLink, telLink } from '../lib/api';
import { Send, CheckCircle2, AlertCircle, MessageCircle, Phone, Award, Truck, Palette } from 'lucide-react';

export default function CorporateGifting() {
  const { catalog, catalogStatus } = useCart();
  const hamperCollection = catalog['dry-fruit-gift-trays'] || (catalogStatus !== 'ready' ? fallbackProducts.find(item => item.slug === 'dry-fruit-gift-trays') : null);
  const hamperImages = new Set(hamperCollection?.images?.length ? hamperCollection.images : [hamperCollection?.image]);
  const hampers = giftHamperDesigns.filter(item => hamperImages.has(item.image));
  const giftBoxes = boxSlugs.map(slug => catalog[slug] || fallbackProducts.find(item => item.slug === slug)).filter(Boolean);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    quantity: '',
    budget: '',
    message: '',
  });
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.quantity || !formData.message) {
      alert("Please fill in all required fields.");
      return;
    }
    setStatus('sending');
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        message: `Corporate Gifting Request from ${formData.company || 'N/A'}. Quantity: ${formData.quantity}, Budget: ${formData.budget || 'N/A'}. Message: ${formData.message}`,
        product: 'Corporate Gifting Enquiry'
      };
      await api.post('/inquiries', payload);
      setStatus('success');
      setFormData({ name: '', company: '', phone: '', quantity: '', budget: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };


  return (
    <div className="noise-bg min-h-screen pb-16 pt-8">
      <SEO 
        title="Gift Hampers & Mithai Gift Boxes in Meerut | PAHWAJEE"
        description="Compare dry fruit hampers and 1 kg mithai boxes at Pahwajee, Meerut. Choose a ready-made assortment or four 250 g sections for a custom box."
      />

      <div className="container-x">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto py-12">
          
          <h1 className="mt-4 text-3xl sm:text-5xl font-serif leading-tight">
            Gift Hampers &amp; Mithai Boxes in Meerut
          </h1>
          <p className="mt-5 text-base text-muted-foreground leading-relaxed">
            Choose a dry fruit hamper or a 1 kg mithai box from Pahwajee, Meerut. Ready-made boxes have their own listed prices; custom boxes contain four 250 g sections, priced at the selected sweets’ individual rates.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a 
              href={waLink("Hi PAHWAJEE, I'd like to get a quote for a bulk corporate order. Please share details.")}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold !bg-emerald-600 !text-white hover:!bg-emerald-700 flex items-center gap-2"
            >
              <MessageCircle size={18} /> Chat with Gifting Expert
            </a>
            <a href={telLink()} className="btn-primary flex items-center gap-2">
              <Phone size={18} /> Call Store Manager
            </a>
          </div>
        </section>

        {hampers.length > 0 && <section className="my-8 sm:my-10" aria-labelledby="dry-fruit-hampers">
          <h2 id="dry-fruit-hampers" className="text-2xl sm:text-3xl mb-2">Dry Fruit Gift Hampers</h2>
          <p className="text-sm text-muted-foreground mb-5">{displayPrice(hamperCollection)}. Enquire for the price and contents of your preferred design.</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {hampers.map(hamper => <article key={hamper.image} className="card-warm overflow-hidden flex flex-col" data-testid="gift-hamper-card">
              <Link to="/products/dry-fruit-gift-trays" aria-label={`View ${hamper.name}`}>
                <OptimizedImage square src={hamper.image} alt={hamper.name} sizes="(min-width: 1024px) 33vw, 50vw" className="aspect-square w-full object-cover bg-muted" loading="lazy" />
              </Link>
              <div className="p-2 sm:p-4 flex flex-col flex-1">
                <h3 className="text-base sm:text-xl leading-tight mb-2">{hamper.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{hamperCollection.availability}</p>
                <a href={waLink(`${hamper.name}. Photo: https://pahwajee.in${hamper.image}`)} target="_blank" rel="noopener noreferrer" className="mt-auto min-h-11 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-3 py-2 text-xs sm:text-sm font-semibold" aria-label={`Enquire about ${hamper.name}`}>Enquire on WhatsApp</a>
              </div>
            </article>)}
          </div>
        </section>}

        <section className="my-10" aria-labelledby="mithai-gift-boxes">
          <h2 id="mithai-gift-boxes" className="text-2xl sm:text-3xl mb-2">Mithai Gift Boxes</h2>
          <p className="text-base text-muted-foreground mb-5">All mithai gift boxes, including Mixed Fruit Special Bites, are available in 1 kg boxes only.</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">{giftBoxes.map(product => <ProductCard key={product.slug} product={product} />)}</div>
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

        {/* Lead Intake Form */}
        <section className="max-w-2xl mx-auto my-12 bg-white/60 dark:bg-card/40 p-8 rounded-3xl border border-border/50 backdrop-blur-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-foreground">Request a Bulk Gifting Quote</h2>
            <p className="text-sm text-muted-foreground mt-2">Share your quantity, budget and required date. The team will confirm the contents, availability and final quote.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Name <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Contact person name"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Company / Organization
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your company name"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Phone Number <span className="text-primary">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Contact phone number"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Approx. Quantity <span className="text-primary">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  required
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g. 50"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Estimated Budget Per Hamper (Optional)
              </label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g. Rs 500 - Rs 1000"
                className="w-full h-11 px-4 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Gifting Message & Requirements <span className="text-primary">*</span>
              </label>
              <textarea
                name="message"
                required
                rows="4"
                value={formData.message}
                onChange={handleChange}
                placeholder="Details of custom boxes, item preferences, preferred delivery date..."
                className="w-full p-4 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full btn-primary justify-center flex items-center gap-2 h-12"
            >
              {status === 'sending' ? (
                <span>Submitting Request...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Request Quote
                </>
              )}
            </button>

            {status === 'success' && (
              <div className="flex gap-2 items-center bg-emerald-50 text-emerald-800 p-4 rounded-xl dark:bg-emerald-950/20 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">Quote request submitted! We will contact you shortly.</p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex gap-2 items-center bg-red-50 text-red-800 p-4 rounded-xl dark:bg-red-950/20 dark:text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">Request submission failed. Please try again or call us directly.</p>
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
