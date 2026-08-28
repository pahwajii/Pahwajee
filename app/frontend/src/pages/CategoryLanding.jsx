import { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import api, { waLink, telLink } from '../lib/api';
import ProductCard from '../components/ProductCard';
import { MessageCircle, Phone, ArrowLeft, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CONFIGS = {
  nankhatai: {
    title: "Best Desi Ghee Nankhatai in Meerut | PAHWAJEE",
    description: "Taste the legacy of authentic Desi Ghee Nankhatai in Meerut. Crumbly, buttery, and baked daily at Abu Lane. Order on WhatsApp or visit our store.",
    h1: "Authentic Desi Ghee Nankhatai in Meerut",
    intro: "For generations, PAHWAJEE has been synonymous with the finest Desi Ghee Nankhatai in Meerut. Made with pure ghee, premium cardamoms, and traditional recipes, our nankhatais are baked fresh daily, offering a buttery, melt-in-mouth texture that is legendary.",
    filterMatch: (p) => p.slug.includes('nankhatai'),
    faqs: [
      { question: "Is your Nankhatai made with pure ghee?", answer: "Yes, our signature nankhatai is made using 100% pure desi ghee with no hydrogenated vegetable oils or additives." },
      { question: "What is the shelf life of Nankhatai?", answer: "Our nankhatai has a shelf life of up to 30 days when stored in a cool, dry place inside an airtight container." }
    ]
  },
  'rewri-gajak': {
    title: "Traditional Rewri & Gajak in Meerut | PAHWAJEE",
    description: "Crunchy sesame Rewri and flaky winter Gajak made with organic jaggery. Taste the warmth of PAHWAJEE's traditional winter specials in Meerut.",
    h1: "Crunchy Rewri & Flaky Gajak in Meerut",
    intro: "As winter arrives in Meerut, there is nothing like the warmth of traditional Rewri and Gajak. Prepared using organic jaggery and roasted sesame seeds, our winter treats are snap-crisp, light, and delicately sweet, crafted using heritage recipes.",
    filterMatch: (p) => p.slug.includes('rewri') || p.slug.includes('gazak') || p.slug.includes('chikki') || p.slug.includes('til'),
    faqs: [
      { question: "Where does your Rewri recipe come from?", answer: "Our rewri is crafted in the authentic Punjabi style, using hand-rolled sesame and jaggery techniques passed down through generations." },
      { question: "Are Rewri and Gajak available throughout the year?", answer: "No, these are seasonal winter specials crafted fresh from October to February to preserve their crispy, flaky texture." }
    ]
  },
  sweets: {
    title: "Traditional Sweets & Mithai in Meerut | PAHWAJEE",
    description: "Browse traditional Indian sweets and dry fruit mithai at PAHWAJEE Meerut. Pure ingredients, authentic recipes, and elegant gift boxes.",
    h1: "Authentic Sweets & Mithai in Meerut",
    intro: "Celebrate life's sweetest moments with PAHWAJEE's traditional sweets. From pure ghee winter sweets and dry fruit rolls to rich kaju katlis, each piece is prepared with fresh ingredients, premium nuts, and extreme hygienic care.",
    filterMatch: (p) => p.category === 'signature' || p.category === 'winter-specials' || p.slug.includes('sweets') || p.slug.includes('katli') || p.slug.includes('barfi'),
    faqs: [
      { question: "Do you take custom orders for wedding sweet boxes?", answer: "Yes! We specialize in custom wedding return sweets boxes and festival trays with custom packaging." },
      { question: "Do you offer sugar-free sweet options?", answer: "We offer premium dry fruit rolls and trays which have only the natural sweetness of dates and figs, with no added white sugar. Ask us on WhatsApp!" }
    ]
  },
  bakery: {
    title: "Fresh Bakery & Customized Cakes in Meerut | PAHWAJEE",
    description: "Order fresh birthday cakes, customized anniversary cakes, cookies, and tea-time snacks in Meerut. Handcrafted daily at Abu Lane.",
    h1: "Fresh Bakery & Birthday Cakes in Meerut",
    intro: "Delight in fresh baking every day. PAHWAJEE offers customizable birthday and anniversary cakes, rich pastries, butter cookies, crispy rusks, and warm breads. Perfect for tea-time, birthdays, and anniversaries in Meerut.",
    filterMatch: (p) => p.category === 'bakery' || p.slug.includes('cake') || p.slug.includes('pastry') || p.slug.includes('cookie'),
    faqs: [
      { question: "How early should I order a customized cake?", answer: "Please place your orders at least 24 hours in advance for customized designs. Simple fresh cream cakes can be prepared in 2-3 hours." },
      { question: "Are your bakery items eggless?", answer: "Yes, 100% of our bakery products, cakes, and pastries are prepared eggless to suit the vegetarian preferences of Meerut families." }
    ]
  }
};

const fallbackProducts = [
  { id: 'nankhatai', name: 'Pure Desi Ghee Nankhatai', slug: 'pure-desi-ghee-nankhatai', category: 'signature', season: 'all', image: 'https://images.pexels.com/photos/37219215/pexels-photo-37219215.jpeg', price: 'Rs 450/kg', availability: 'Available', bestseller: true, bestSeller: true }
];

export default function CategoryLanding({ type }) {
  const [products, setProducts] = useState([]);
  const config = CONFIGS[type] || CONFIGS.nankhatai;

  useEffect(() => {
    api.get('/products')
      .then((items) => setProducts(items.length ? items : fallbackProducts))
      .catch(() => setProducts(fallbackProducts));
  }, [type]);

  const filtered = products.filter(config.filterMatch);

  return (
    <div className="noise-bg min-h-screen pb-16 pt-8">
      <SEO 
        title={config.title}
        description={config.description}
      />

      <div className="container-x">
        {/* Back Link */}
        <div className="mb-6">
          <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft size={16} /> Back to Full Menu
          </Link>
        </div>

        {/* Hero Area */}
        <section className="max-w-3xl mb-12">
          <p className="eyebrow">Local Speciality</p>
          <h1 className="text-4xl md:text-5xl font-serif leading-tight mt-3 mb-6">
            {config.h1}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            {config.intro}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a 
              href={waLink(`Hi PAHWAJEE, I'd like to place an order from your ${type} collection. Please share details.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold !bg-emerald-600 !text-white flex items-center gap-2"
            >
              <MessageCircle size={18} /> Order on WhatsApp
            </a>
            <a href={telLink()} className="btn-primary flex items-center gap-2">
              <Phone size={18} /> Call to Order
            </a>
          </div>
        </section>

        {/* Product List */}
        <section className="my-12">
          <h2 className="text-3xl font-serif mb-8 border-b border-border/40 pb-4 text-foreground">Available Selection</h2>
          {filtered.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/50 rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground">No products available in this category at the moment. Please contact us for custom orders.</p>
            </div>
          )}
        </section>

        {/* FAQs */}
        <section className="max-w-3xl my-16">
          <h3 className="font-serif text-3xl mb-8">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {config.faqs.map((faq, idx) => (
              <div key={idx} className="card-warm p-6 bg-white/60">
                <h4 className="font-serif text-lg font-bold flex gap-2 items-center text-foreground mb-2">
                  <HelpCircle className="w-5 h-5 text-primary shrink-0" /> {faq.question}
                </h4>
                <p className="text-sm text-muted-foreground pl-7 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
