import { useState } from 'react';
import SEO from '../components/SEO';
import api, { BUSINESS, waLink, telLink } from '../lib/api';
import { MapPin, Phone, MessageSquare, Clock, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      alert("Please fill in all required fields.");
      return;
    }
    setStatus('sending');
    try {
      await api.post('/inquiries', formData);
      setStatus('success');
      setFormData({ name: '', phone: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    "name": "PAHWAJEE",
    "image": "https://pahwajee.com/gallery/2.jpeg",
    "telephone": "+916396339806",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "19 Abu Lane",
      "addressLocality": "Meerut",
      "addressRegion": "Uttar Pradesh",
      "postalCode": "250001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 29.0060,
      "longitude": 77.7064
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "09:00",
      "closes": "22:30"
    }
  };

  return (
    <div className="noise-bg min-h-screen pb-16 pt-8">
      <SEO 
        title="Contact Us & Store Directions | PAHWAJEE Meerut"
        description="Visit PAHWAJEE sweet & bakery shop at 19 Abu Lane, Meerut. Get directions, contact phone numbers, business hours, and submit product or bulk orders enquiries."
        schema={schema}
      />

      <div className="container-x">
        {/* Header */}
        <section className="text-center max-w-2xl mx-auto py-12">
          <p className="eyebrow">Get in touch</p>
          <h1 className="mt-4 text-5xl font-serif leading-tight">
            We'd Love to Hear From You
          </h1>
          <p className="mt-5 text-base text-muted-foreground leading-relaxed">
            Drop by our Abu Lane store, give us a call, message us on WhatsApp, or fill out the enquiry form below. We're ready to serve you.
          </p>
        </section>

        {/* Contact info grid */}
        <section className="grid gap-8 lg:grid-cols-3 my-8">
          {/* Card 1 */}
          <div className="card-warm p-6 flex gap-4 items-start">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold mb-2">Our Store Address</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {BUSINESS.address}
              </p>
              <a 
                href={BUSINESS.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Get Directions on Google Maps &rarr;
              </a>
            </div>
          </div>

          {/* Card 2 */}
          <div className="card-warm p-6 flex gap-4 items-start">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold mb-2">Call & WhatsApp</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                <strong>Phone:</strong> {BUSINESS.phones.join(', ')}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                <strong>WhatsApp:</strong> {BUSINESS.whatsapp}
              </p>
              <div className="flex gap-3">
                <a href={telLink()} className="text-sm font-semibold text-primary hover:underline">
                  Call Now
                </a>
                <span className="text-muted-foreground/45">|</span>
                <a href={waLink()} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-emerald-600 hover:underline">
                  WhatsApp Chat
                </a>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="card-warm p-6 flex gap-4 items-start">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold mb-2">Business Hours</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {BUSINESS.hours}
              </p>
              <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 text-xs px-3 py-1 font-semibold dark:bg-emerald-900/30 dark:text-emerald-400">
                Open All Days
              </span>
            </div>
          </div>
        </section>

        {/* Map & Form Section */}
        <section className="grid gap-8 lg:grid-cols-2 my-12 items-start">
          {/* Map */}
          <div className="card-warm overflow-hidden h-[450px] border border-border/60">
            <iframe
              src={BUSINESS.mapEmbed}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="PAHWAJEE Store Location Map"
            ></iframe>
          </div>

          {/* Enquiry Form */}
          <div className="card-warm p-8 bg-white/60 backdrop-blur-md">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Send an Inquiry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Your full name"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Phone Number <span className="text-primary">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Your contact number"
                    className="w-full h-11 px-4 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your email address"
                    className="w-full h-11 px-4 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Message / Order Details <span className="text-primary">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Detail your sweets or customized cake order request..."
                  className="w-full p-4 rounded-xl border border-border bg-white outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full btn-primary justify-center flex items-center gap-2 h-12"
              >
                {status === 'sending' ? (
                  <span>Sending Enquiry...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Enquiry
                  </>
                )}
              </button>

              {status === 'success' && (
                <div className="flex gap-2 items-center bg-emerald-50 text-emerald-800 p-4 rounded-xl dark:bg-emerald-950/20 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">Inquiry sent successfully! We will get back to you shortly.</p>
                </div>
              )}

              {status === 'error' && (
                <div className="flex gap-2 items-center bg-red-50 text-red-800 p-4 rounded-xl dark:bg-red-950/20 dark:text-red-400">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">Failed to send inquiry. Please try again or call us directly.</p>
                </div>
              )}
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
