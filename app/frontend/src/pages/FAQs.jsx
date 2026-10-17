import { useState } from 'react';
import { Link } from 'react-router-dom';
import { orderingFAQs } from '../lib/policies';
import SEO from '../components/SEO';
import { Search, HelpCircle, ChevronDown } from 'lucide-react';

export default function FAQs() {
  const faqs = orderingFAQs;
  const [search, setSearch] = useState("");
  const [openIdx, setOpenIdx] = useState(null);


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
          <h1 className="mt-4 text-3xl sm:text-5xl font-serif leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-5 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Got questions about custom cakes, ingredients, bulk gifting or home delivery coverage in Meerut? Find quick answers below.
          </p>

          {/* Search bar */}
          <div className="relative mt-8 max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              aria-label="Search frequently asked questions"
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

        <nav aria-label="Detailed store policies" className="flex flex-wrap gap-x-5 text-sm font-semibold text-primary dark:text-secondary">
          <Link to="/shipping-policy" className="inline-flex min-h-11 items-center underline">Delivery &amp; charges</Link>
          <Link to="/returns-and-cancellations" className="inline-flex min-h-11 items-center underline">Replacements &amp; cancellations</Link>
          <Link to="/gifting" className="inline-flex min-h-11 items-center underline">Custom gift boxes</Link>
          <Link to="/bakery-meerut" className="inline-flex min-h-11 items-center underline">Cakes on order</Link>
        </nav>
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
                    aria-expanded={isOpen}
                    aria-controls={"faq-answer-" + idx}
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
                  
                  <div id={"faq-answer-" + idx} hidden={!isOpen} className="px-6 pb-6 pt-2 border-t border-border/20 bg-primary/5 animate-slide-down">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {f.answer}
                      </p>
                    </div>
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
