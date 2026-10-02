import { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import api from '../lib/api';
import { Search, HelpCircle, ChevronDown } from 'lucide-react';

const fallbackFAQs = [
  {
    question: "Do you take custom cake orders?",
    answer: "Absolutely! We craft custom birthday, anniversary, wedding & themed cakes. Please place your order at least 24 hours in advance. Call 6396339806 to discuss designs."
  },
  {
    question: "Do you offer bulk / corporate orders?",
    answer: "Yes - we specialize in corporate gifting, weddings & bulk festival hampers with custom packaging & branding options. Contact us for a personalized quote."
  },
  {
    question: "What are your business hours?",
    answer: "We are open every day from 9:00 AM to 10:30 PM, including Sundays and public holidays."
  },
  {
    question: "Do you deliver in Meerut?",
    answer: "Yes, we offer local delivery in Meerut. Delivery charges depend on your location and order value. Please call us to confirm."
  },
  {
    question: "Which payment methods do you accept?",
    answer: "We accept cash, UPI, all major cards, and digital wallets at the store. For online orders, we can share UPI details when confirming."
  },
  {
    question: "Are your products made with pure desi ghee?",
    answer: "Our signature nankhatai and select sweets are made with 100% pure desi ghee. Each product mentions its key ingredients - just ask us anything!"
  },
  {
    question: "Can I schedule a cake for a specific time?",
    answer: "Yes, once your order is confirmed we deliver at your preferred time slot. For same-day delivery, please order before 12 PM."
  }
];

export default function FAQs() {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState("");
  const [openIdx, setOpenIdx] = useState(null);

  useEffect(() => {
    api.get('/faqs')
      .then((data) => setFaqs(data.length ? data : fallbackFAQs))
      .catch(() => setFaqs(fallbackFAQs));
  }, []);

  const filteredFAQs = faqs.filter(f => 
    f.question.toLowerCase().includes(search.toLowerCase()) || 
    f.answer.toLowerCase().includes(search.toLowerCase())
  );

  // Generate JSON-LD FAQ Schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  };

  return (
    <div className="noise-bg min-h-screen pb-16 pt-8">
      <SEO 
        title="FAQs & Ordering Guide | PAHWAJEE Meerut"
        description="Frequently asked questions about ordering sweets, custom cakes, bulk corporate gifting, local home delivery, store timings, and locations in Meerut, UP."
        schema={schema}
      />

      <div className="container-x max-w-4xl">
        {/* Header */}
        <section className="text-center py-12">
          <p className="eyebrow">Ordering & General Help</p>
          <h1 className="mt-4 text-5xl font-serif leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-5 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Got questions about custom cakes, ingredients, bulk gifting or home delivery coverage in Meerut? Find quick answers below.
          </p>

          {/* Search bar */}
          <div className="relative mt-8 max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpenIdx(null);
              }}
              placeholder="Search questions..."
              className="h-12 w-full rounded-full border border-border bg-white/80 dark:bg-card/70 pl-12 pr-4 text-sm outline-none ring-primary/20 focus:ring-4"
            />
          </div>
        </section>

        {/* FAQs Accordion */}
        <section className="my-6 space-y-4">
          {filteredFAQs.length ? (
            filteredFAQs.map((f, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div 
                  key={f.id || idx} 
                  className="card-warm overflow-hidden bg-white/70 dark:bg-card/40 border border-border/50 transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex gap-3 items-center pr-4">
                      <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                      <span className="font-serif text-lg md:text-xl font-semibold text-foreground">
                        {f.question}
                      </span>
                    </div>
                    <ChevronDown 
                      className={`w-5 h-5 text-muted-foreground transition-transform duration-300 shrink-0 ${
                        isOpen ? 'rotate-180 text-primary' : ''
                      }`} 
                    />
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 border-t border-border/20 bg-primary/5 animate-slide-down">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {f.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-white/50 dark:bg-card/30">
              <p className="text-muted-foreground">No FAQs matching your query found. Try searching another keyword.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
