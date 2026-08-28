import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import api, { waLink, telLink } from '../lib/api';
import ProductCard from '../components/ProductCard';
import { ChevronRight, Phone, MessageCircle, ShieldAlert, Calendar, Box } from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    
    // Fetch product details
    api.get(`/products/${slug}`)
      .then((data) => {
        setProduct(data);
        // Fetch related products of the same category
        api.get(`/products?category=${data.category}`)
          .then((items) => {
            // Filter out current product
            setRelatedProducts(items.filter(item => item.slug !== data.slug).slice(0, 4));
          })
          .catch(() => setRelatedProducts([]));
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="section-y container-x noise-bg text-center font-serif text-2xl">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="section-y container-x noise-bg text-center">
        <h1 className="text-4xl font-serif mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product you are looking for might have been moved or is currently unavailable.</p>
        <Link to="/products" className="btn-primary">View Full Menu</Link>
      </div>
    );
  }

  // Get specific local parameters based on name (to avoid inventing random facts)
  const getProductSpecs = (name) => {
    const text = name.toLowerCase();
    if (text.includes('nankhatai')) {
      return {
        ingredients: "Pure Desi Ghee, Wheat Flour (Maida/Atta), Sugar, Cardamom.",
        storage: "Store in a cool, dry place inside an airtight container. Protect from moisture.",
        shelfLife: "30 Days",
        suitability: "Perfect for tea-time snacking, corporate gifts, and festive occasions."
      };
    }
    if (text.includes('rewri') || text.includes('gajak') || text.includes('chikki') || text.includes('til')) {
      return {
        ingredients: "Roasted Sesame Seeds (Til), Organic Jaggery (Gur), Pure Ghee, Cardamom.",
        storage: "Keep in a dry, airtight jar. Do not expose to moisture to retain crispness.",
        shelfLife: "60-90 Days",
        suitability: "Traditional winter delight, highly popular for Lohri, Makar Sankranti, and Diwali gifting."
      };
    }
    if (text.includes('cake')) {
      return {
        ingredients: "Wheat Flour, Fresh Cream, Sugar, Premium Fruit/Chocolate Concentrates (100% Eggless).",
        storage: "Keep refrigerated between 2°C and 5°C. Consume within 48 hours of purchase.",
        shelfLife: "24-48 Hours",
        suitability: "Birthdays, anniversaries, office parties, and milestone celebrations in Meerut."
      };
    }
    // Generic fallback based on database defaults
    return {
      ingredients: "Handpicked premium ingredients (Pure Desi Ghee / Fresh dairy where applicable).",
      storage: "Store in a cool, dry place. Keep airtight.",
      shelfLife: "Refer to package label",
      suitability: "Delightful local treat for daily consumption and family gifting."
    };
  };

  const specs = getProductSpecs(product.name);

  // Generate dynamic product schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image || "https://pahwajee.com/gallery/2.jpeg",
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "price": product.price ? product.price.replace(/[^0-9]/g, '') : "0",
      "priceCurrency": "INR",
      "availability": product.availability === "Available" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <div className="noise-bg min-h-screen pb-16 pt-8">
      <SEO 
        title={`${product.name} in Meerut | PAHWAJEE`}
        description={`${product.description || `Buy fresh ${product.name} at PAHWAJEE Abu Lane, Meerut.`} Order on WhatsApp or call us directly.`}
        schema={schema}
      />

      <div className="container-x">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8 uppercase tracking-wider" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          <ChevronRight size={12} />
          <span className="text-foreground font-semibold max-w-[200px] truncate">{product.name}</span>
        </nav>

        {/* Product Details Grid */}
        <section className="grid gap-12 md:grid-cols-2 items-start bg-white/40 p-6 md:p-10 rounded-3xl border border-border/50 backdrop-blur-md">
          {/* Image */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted border border-white/60 shadow-lg">
            <img 
              src={product.image || '/placeholder.jpg'} 
              alt={product.name} 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Details */}
          <div>
            <div className="flex flex-wrap gap-2.5 items-center mb-4">
              <span className="eyebrow">{product.category.replace('-', ' ')}</span>
              {product.availability === 'Available' ? (
                <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
                  Available Today
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
                  Pre-order Only
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">{product.name}</h1>
            <p className="text-secondary text-2xl md:text-3xl font-serif font-bold mb-6">{product.price || 'Price on request'}</p>
            
            <p className="text-muted-foreground leading-relaxed text-base mb-8 border-b border-border/30 pb-6">
              {product.description || "Freshly prepared daily with the finest ingredients at our store in Meerut. Crafted with generational recipes for authentic taste."}
            </p>

            {/* Product Specifications Cards */}
            <div className="grid gap-4 sm:grid-cols-2 mb-8">
              <div className="flex gap-3">
                <Box className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Ingredients</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{specs.ingredients}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Shelf Life</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{specs.shelfLife} (Storage: {specs.storage})</p>
                </div>
              </div>
            </div>

            {/* Eggless Banner for Bakery */}
            {product.category === 'bakery' && (
              <div className="mb-8 flex gap-2.5 items-center bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
                <ShieldAlert className="w-5 h-5 shrink-0 text-emerald-600" />
                <p className="text-xs font-semibold uppercase tracking-wider">100% Eggless Pure Vegetarian Bakery</p>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <a 
                href={waLink(`Hi PAHWAJEE, I am interested in ordering: ${product.name} (${product.price || 'Price on Request'}). Please share availability.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold !bg-emerald-600 !text-white flex items-center justify-center gap-2 hover:!bg-emerald-700"
              >
                <MessageCircle size={18} /> Order on WhatsApp
              </a>
              <a 
                href={telLink()} 
                className="btn-primary flex items-center justify-center gap-2"
              >
                <Phone size={18} /> Call PAHWAJEE
              </a>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="my-16">
            <h3 className="font-serif text-3xl mb-8">You May Also Like</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}