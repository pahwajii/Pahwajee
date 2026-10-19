import { collectionFor, productDescription, productSpecs, availabilityNote } from '../lib/catalogueContent';
import { productPackSizes, packLabel } from '../lib/cart';
import FavouriteButton from '../components/FavouriteButton';
import CustomMithaiBox from '../components/CustomMithaiBox';
import { isMithaiBox, hasAssortmentPhoto } from '../lib/mithaiBox';
import FssaiNotice from '../components/FssaiNotice';
import { displayPrice } from '../lib/cart';
import OptimizedImage from '../components/OptimizedImage';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { productSchema } from '../lib/seo';
import { usePageData } from '../context/PageData';
import api, { waLink, telLink } from '../lib/api';
import ProductCard from '../components/ProductCard';
import AddToCart from '../components/AddToCart';
import { ChevronRight, ChevronLeft, Phone, MessageCircle, ShieldAlert, Calendar, Box } from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams();
  const initialProducts = usePageData().products || [];
  const initialProduct = initialProducts.find(item => item.slug === slug);
  const [product, setProduct] = useState(initialProduct || null);
  const [relatedProducts, setRelatedProducts] = useState(() => initialProducts.filter(item => item.slug !== slug && item.category === initialProduct?.category).slice(0, 4));
  const [loading, setLoading] = useState(!initialProduct);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    const cached = initialProducts.find(item => item.slug === slug);
    setProduct(cached || null);
    setLoading(!cached);
    setActiveImgIndex(0);
    setRelatedProducts(initialProducts.filter(item => item.slug !== slug && item.category === cached?.category).slice(0, 4));

    api.get(`/products/${slug}`)
      .then((data) => {
        if (!active) return;
        setProduct(data);
        setActiveImgIndex(0);
        // Fetch related products of the same category
        api.get(`/products?category=${data.category}`)
          .then((items) => {
            // Filter out current product
            if (active) setRelatedProducts(items.filter(item => item.slug !== data.slug).slice(0, 4));
          })
          .catch(() => { if (active) setRelatedProducts([]); });
      })
      // Keep the public snapshot during temporary API failures. A confirmed 404
      // still removes deleted products and switches their metadata to noindex.
      .catch((error) => { if (active && error.status === 404) setProduct(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return <div className="section-y container-x noise-bg text-center font-serif text-2xl"><SEO title="Product Details | PAHWA JEE Meerut" />Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="section-y container-x noise-bg text-center">
        <SEO title="Product Not Found | PAHWA JEE" noindex />
        <h1 className="text-4xl font-serif mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product you are looking for might have been moved or is currently unavailable.</p>
        <Link to="/products" className="btn-primary">View Full Menu</Link>
      </div>
    );
  }

  const specs = productSpecs(product);
  const collection = collectionFor(product);
  const description = productDescription(product);
  const unavailable = /unavailable|sold out|out of stock/i.test(product.availability || "");
  const images = product && product.images && product.images.length > 0
    ? product.images
    : (product && product.image ? [product.image] : []);
  const currentImage = images[activeImgIndex] || '/placeholder.jpg';

  const schema = productSchema(product);

  return (
    <div className="noise-bg min-h-screen pb-16 pt-8">
      <SEO
        title={`${product.name} in Meerut | PAHWAJEE`}
        description={`${product.name} at Pahwajee, Meerut. ${displayPrice(product)}. ${product.availability || 'Confirm availability'}. See pack details and enquire about your order.`}
        schema={schema}
        image={product.image}
      />

      <div className="container-x">
        {/* Breadcrumb Navigation */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mb-8 uppercase tracking-wider" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          <ChevronRight size={12} />
          <Link to={collection.to} className="hover:text-primary">{collection.label}</Link>
          <ChevronRight size={12} />
          <span className="text-foreground font-semibold max-w-[200px] truncate">{product.name}</span>
        </nav>

        {/* Product Details Grid */}
        <section className="grid gap-12 md:grid-cols-2 items-start bg-white/40 dark:bg-card/30 p-6 md:p-10 rounded-3xl border border-border/50 backdrop-blur-md">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4 w-full">
            {/* Main Image Container */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border border-white/60 shadow-lg group">
              <OptimizedImage square
                loading="eager"
                fetchPriority="high"
                src={currentImage}
                alt={product.name}
                className="block h-full w-full object-cover"
              />

              {/* Navigation Arrows (only if multiple images exist) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setActiveImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                  {/* Indicator overlay */}
                  <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-xs">
                    {activeImgIndex + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {images.map((img, idx) => {
                  const isActive = idx === activeImgIndex;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImgIndex(idx)}
                      className={`relative aspect-square w-16 shrink-0 rounded-lg overflow-hidden border-2 bg-muted transition-all duration-200 ${
                        isActive
                          ? 'border-primary scale-[1.03] shadow'
                          : 'border-transparent hover:border-primary/40'
                      }`}
                    >
                      <OptimizedImage square sizes="80px" src={img} alt={`${product.name} variant ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex flex-wrap gap-2.5 items-center mb-4">
              <span className="eyebrow">{product.category.replace('-', ' ')}</span>
              {product.availability === 'Available' ? (
                <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400">
                  Available
                </span>
              ) : (
                <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/20 dark:text-amber-400">
                  {product.availability || 'Currently unavailable'}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">{product.name}</h1>
            <p className="text-secondary text-2xl md:text-3xl font-serif font-bold mb-6">{displayPrice(product)}</p>
            {['mawa-barfi', 'mawa-til-laddoo', 'gond-laddoo', 'strawberry-bite', 'kachha-aam-bite', 'khajoor-barfi'].includes(product.slug) && <p className="mb-4 text-xs text-muted-foreground">Product photo is illustrative.</p>}

            <p className="text-muted-foreground leading-relaxed text-base mb-8 border-b border-border/30 pb-6">
              {description}
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
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Storage &amp; best-before</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">{specs.storage}</p>
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

            <p className="mb-4 rounded-xl border border-border p-3 text-sm leading-relaxed text-muted-foreground">{availabilityNote(product)}</p>
            <p className="mb-4 text-sm text-muted-foreground">{product.sale_unit === "kg" && product.cart_eligible ? "Listed pack sizes: " + productPackSizes(product).map(packLabel).join(" / ") + "." : "Confirm your preferred quantity with the store."}</p>
            <FavouriteButton item={product} label className="mb-4" />
            <FssaiNotice className="mb-4" />

            {isMithaiBox(product.slug) && <p className="text-sm font-medium mb-4">Available as a 1 kg box only. Customise your selection below.</p>}
            {hasAssortmentPhoto(product.slug) && <p className="text-xs text-muted-foreground mb-4">Photo shows this sweet as part of an assorted box.</p>}
            {/* CTAs */}
            <div className="mb-6"><AddToCart product={product} /></div>
            <div className="flex flex-wrap gap-4 pt-2">
              <a
                href={waLink(`${product.name} (${displayPrice(product)}). ${unavailable ? "Please let me know when it is available again" : "Please confirm my preferred quantity and date"}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold !bg-emerald-600 !text-white flex items-center justify-center gap-2 hover:!bg-emerald-700"
              >
                <MessageCircle size={18} /> {unavailable ? "Ask about availability" : "Enquire on WhatsApp"}
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

        <section className="my-8 rounded-2xl border border-border bg-card p-4 sm:p-6" aria-labelledby="product-ordering-help">
          <h2 id="product-ordering-help" className="text-2xl font-serif">Choosing &amp; ordering {product.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Choose a listed pack and quantity for cart orders. For a gift, special order or unavailable item, send an enquiry with your required date. Confirm the collection outlet or delivery arrangements with the team before making a trip.</p>
          <div className="mt-3 flex flex-wrap gap-x-5 text-sm font-semibold text-primary dark:text-secondary">
            {[{to:collection.to,label:collection.label},{to:collection.guide,label:collection.guideLabel},{to:"/gallery",label:"Real shop & product photos"},{to:"/faqs",label:"Ordering FAQs"},{to:"/contact",label:"Visit our Meerut outlets"}].map(link => <Link key={link.to} to={link.to} className="inline-flex min-h-11 items-center underline underline-offset-4">{link.label}</Link>)}
          </div>
        </section>
        {isMithaiBox(product.slug) && <CustomMithaiBox />}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="my-16">
            <h3 className="font-serif text-3xl mb-8">You May Also Like</h3>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
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
