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
  { id: 'khasta-rewri', name: 'Khasta Rewri', slug: 'khasta-rewri', category: 'signature', season: 'winter', image: '/products/Khasta-rewri.png', price: 'Rs 480/kg', availability: 'Available', bestseller: true, bestSeller: true },
  { id: 'chips-rewri', name: 'Chips Rewri', slug: 'chips-rewri', category: 'signature', season: 'winter', image: '/products/chips-rewri.png', price: 'Rs 520/kg', availability: 'Available', bestseller: true },
  { id: 'dilkhush-gazak', name: 'Dilkhush Gazak', slug: 'dilkhush-gazzak', category: 'signature', season: 'winter', image: '/products/dilkhush-gazzak.png', price: 'Rs 640/kg', availability: 'Available', bestseller: true, bestSeller: true },
  { id: 'chocolate-gazak', name: 'Chocolate Gazak', slug: 'chocolate-gazak', category: 'signature', season: 'winter', image: '/products/choclate-gazzak.png', price: 'Rs 580/kg', availability: 'Available' },
  { id: 'gol-gazak', name: 'Gol Gazak', slug: 'gol-gazak', category: 'signature', season: 'winter', image: '/products/golgazzak.png', price: 'Rs 560/kg', availability: 'Available' },
  { id: 'kaju-gazak-roll', name: 'Kaju Gazak Roll', slug: 'kaju-gazak-roll', category: 'signature', season: 'winter', image: '/products/kajugazzak-roll.png', price: 'Rs 750/kg', availability: 'Available', featured: true },
  { id: 'mawa-roll-gazak', name: 'Mawa Roll Gazak', slug: 'mawa-roll-gazak', category: 'signature', season: 'winter', image: '/products/mawaroll-gazzak.png', price: 'Rs 680/kg', availability: 'Available' },
  { id: 'sugar-gazak', name: 'Sugar Gazak', slug: 'sugar-gazak', category: 'signature', season: 'winter', image: '/products/sugar gazzak.png', price: 'Rs 460/kg', availability: 'Available' },
  { id: 'til-patti-gazak', name: 'Til Patti Gazak', slug: 'til-patti-gazak', category: 'signature', season: 'winter', image: '/products/tilpattigazzak.png', price: 'Rs 520/kg', availability: 'Available' },
  { id: 'til-peanut-khasta', name: 'Til Peanut Khasta', slug: 'til-peanut-khasta', category: 'signature', season: 'winter', image: '/products/til-peanut-khasta.png', price: 'Rs 490/kg', availability: 'Available' },
  { id: 'pure-desi-ghee-nankhatai', name: 'Pure Desi Ghee Nankhatai', slug: 'pure-desi-ghee-nankhatai', category: 'signature', season: 'all', image: '/products/nankhatayi.png', price: 'Rs 500/kg', availability: 'Available', bestseller: true, bestSeller: true },
  { id: 'besan-laddoo', name: 'Besan Laddoo', slug: 'besan-laddoo', category: 'signature', season: 'all', image: '/products/besan-laddo.png', price: 'Rs 400/kg', availability: 'Available' },
  { id: 'mango-bite', name: 'Mango Bite', slug: 'mango-bite', category: 'signature', season: 'all', image: '/products/mangobit.png', price: 'Rs 600/kg', availability: 'Available' },
  { id: 'peanut-chikki', name: 'Peanut Chikki', slug: 'peanut-chikki', category: 'winter-specials', season: 'winter', image: '/products/peanut-chikki.png', price: 'Rs 320/kg', availability: 'Available' },
  { id: 'roasted-peanut-chikki', name: 'Roasted Peanut Chikki', slug: 'roasted-peanut-chikki', category: 'winter-specials', season: 'winter', image: '/products/roastedpeanut-chikki.png', price: 'Rs 350/kg', availability: 'Available' },
  { id: 'murmura-patti', name: 'Murmura Patti', slug: 'murmura-patti', category: 'winter-specials', season: 'winter', image: '/products/murmura-patti.png', price: 'Rs 280/kg', availability: 'Available' },
  { id: 'gur-ke-sev', name: 'Gur Ke Sev', slug: 'gur-ke-sev', category: 'winter-specials', season: 'winter', image: '/products/gur-ke-sev.png', price: 'Rs 380/kg', availability: 'Available' },
  { id: 'til-bugga', name: 'Til Bugga', slug: 'til-bugga', category: 'winter-specials', season: 'winter', image: '/products/til-bugga.png', price: 'Rs 600/kg', availability: 'Available' },
  { id: 'alsi-ke-laddoo', name: 'Alsi Ke Laddoo', slug: 'alsi-ke-laddoo', category: 'winter-specials', season: 'winter', image: '/products/alsi-ke-laddoo.png', price: 'Rs 700/kg', availability: 'Available' },
  { id: 'dry-fruit-laddoo', name: 'Dry Fruit Laddoo', slug: 'dry-fruit-laddoo', category: 'winter-specials', season: 'winter', image: '/products/dryfruitladdoo.png', price: 'Rs 850/kg', availability: 'Available', bestseller: true },
  { id: 'khajoor-laddoo', name: 'Khajoor Laddoo', slug: 'khajoor-laddoo', category: 'winter-specials', season: 'winter', image: '/products/khajoor-laddo.png', price: 'Rs 800/kg', availability: 'Available' },
  { id: 'special-pishori-pinni', name: 'Special Pishori Pinni', slug: 'special-pishori-pinni', category: 'winter-specials', season: 'winter', image: '/products/pishori-pinni.png', price: 'Rs 700/kg', availability: 'Available' },
  { id: 'desi-ghee-gajar-ka-halwa', name: 'Desi Ghee Gajar Ka Halwa', slug: 'desi-ghee-gajar-ka-halwa', category: 'winter-specials', season: 'winter', image: '/products/gajar-halwa.png', price: 'Rs 480/kg', availability: 'Available' },
  { id: 'special-kheer', name: 'Special Kheer', slug: 'special-kheer', category: 'winter-specials', season: 'winter', image: '/products/kheer.png', price: 'Rs 250/kg', availability: 'Available' },
  { id: 'fresh-special-salad', name: 'Fresh Special Salad', slug: 'fresh-special-salad', category: 'summer-specials', season: 'summer', image: '/products/salad.png', price: 'Rs 120/plate', availability: 'Available' },
  { id: 'healthy-sprouts', name: 'Healthy Sprouts', slug: 'healthy-sprouts', category: 'summer-specials', season: 'summer', image: '/products/sprouts.png', price: 'Rs 100/plate', availability: 'Available' },
  { id: 'dry-fruit-gift-tray-1', name: 'Dry Fruit Gift Tray 1', slug: 'dry-fruit-gift-tray-1', category: 'festival-collection', season: 'all', image: '/products/Dryfruit-tray1.png', price: 'Rs 1100', availability: 'Available', bestseller: true },
  { id: 'dry-fruit-gift-tray-2', name: 'Dry Fruit Gift Tray 2', slug: 'dry-fruit-gift-tray-2', category: 'festival-collection', season: 'all', image: '/products/Dryfruit-tray2.png', price: 'Rs 1350', availability: 'Available' },
  { id: 'dry-fruit-gift-tray-3', name: 'Dry Fruit Gift Tray 3', slug: 'dry-fruit-gift-tray-3', category: 'festival-collection', season: 'all', image: '/products/Dryfruit-tray3.png', price: 'Rs 1500', availability: 'Available' },
  { id: 'dry-fruit-gift-tray-4', name: 'Dry Fruit Gift Tray 4', slug: 'dry-fruit-gift-tray-4', category: 'festival-collection', season: 'all', image: '/products/Dryfruit-tray4.png', price: 'Rs 1750', availability: 'Available' },
  { id: 'dry-fruit-gift-tray-5', name: 'Dry Fruit Gift Tray 5', slug: 'dry-fruit-gift-tray-5', category: 'festival-collection', season: 'all', image: '/products/Dryfruit-tray5.png', price: 'Rs 2000', availability: 'Available' },
  { id: 'dry-fruit-gift-tray-6', name: 'Dry Fruit Gift Tray 6', slug: 'dry-fruit-gift-tray-6', category: 'festival-collection', season: 'all', image: '/products/Dryfruit-tray6.png', price: 'Rs 2250', availability: 'Available' },
  { id: 'dry-fruit-gift-tray-7', name: 'Dry Fruit Gift Tray 7', slug: 'dry-fruit-gift-tray-7', category: 'festival-collection', season: 'all', image: '/products/Dryfruit-tray7.png', price: 'Rs 2500', availability: 'Available' }
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
            <div className="text-center py-12 bg-white/50 dark:bg-card/30 rounded-2xl border border-dashed border-border">
              <p className="text-muted-foreground">No products available in this category at the moment. Please contact us for custom orders.</p>
            </div>
          )}
        </section>

        {/* FAQs */}
        <section className="max-w-3xl my-16">
          <h3 className="font-serif text-3xl mb-8">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {config.faqs.map((faq, idx) => (
              <div key={idx} className="card-warm p-6 bg-white/60 dark:bg-card/40">
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
