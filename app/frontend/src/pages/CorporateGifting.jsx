import { useState } from 'react';
import SEO from '../components/SEO';
import api, { waLink, telLink } from '../lib/api';
import { Send, CheckCircle2, AlertCircle, MessageCircle, Phone, Award, Truck, Palette } from 'lucide-react';

export default function CorporateGifting() {
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

  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "PAHWAJEE Corporate Gifting",
    "description": "Request custom bulk quotes for corporate gift hampers and festive sweets in Meerut.",
    "url": "https://pahwajee.com/gifting"
  };

  return (
    <div className="noise-bg min-h-screen pb-16 pt-8">
      <SEO 
        title="Corporate & Bulk Gifting Hampers in Meerut | PAHWAJEE"
        description="Premium corporate gifts, customized client hampers, employee boxes, and bulk sweets in Meerut by PAHWAJEE. Custom branding, logo tags, and local delivery."
        schema={schema}
      />

      <div className="container-x">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto py-12">
          <p className="eyebrow">B2B & Bulk Gifting Solutions</p>
          <h1 className="mt-4 text-5xl font-serif leading-tight">
            Elevate Your Corporate Gifting <span className="italic text-primary">with PAHWAJEE</span>
          </h1>
          <p className="mt-5 text-base text-muted-foreground leading-relaxed">
            Strengthen your business relations with premium sweets boxes, customizable hampers, and gourmet bakery platters. Handcrafted in Meerut with custom branding options.
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

        {/* Pillars / Value Prop */}
        <section className="grid gap-8 md:grid-cols-3 my-12">
          <div className="card-warm p-6 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">Custom Branding</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We add customized logo tags, printed sleeves, corporate gift cards, and custom packaging themes to align with your brand identity.
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
            <h3 className="font-serif text-xl font-bold mb-2">On-Time Local Delivery</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              With dedicated delivery logistics, we ensure all bulk packages arrive at your office or clients' premises across Meerut on time.
            </p>
          </div>
        </section>

        {/* Lead Intake Form */}
        <section className="max-w-2xl mx-auto my-12 bg-white/60 dark:bg-card/40 p-8 rounded-3xl border border-border/50 backdrop-blur-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-foreground">Request a Bulk Gifting Quote</h2>
            <p className="text-sm text-muted-foreground mt-2">Submit your requirements and our coordinator will get back to you within 2 hours.</p>
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
