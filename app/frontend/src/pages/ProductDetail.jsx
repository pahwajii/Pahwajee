import { useCart } from '../context/CartContext';
import fallbackProducts from '../generated/catalog.json';
import { relatedProductsFor } from '../lib/relatedProducts';
import { collectionFor, productDescription, productSpecs, availabilityNote } from '../lib/catalogueContent';
import { productPackSizes, packLabel } from '../lib/cart';
import FavouriteButton from '../components/FavouriteButton';
import CustomMithaiBox from '../components/CustomMithaiBox';
import { isMithaiBox, hasAssortmentPhoto } from '../lib/mithaiBox';
import FssaiNotice from '../components/FssaiNotice';
import { displayPrice } from '../lib/cart';
import OptimizedImage from '../components/OptimizedImage';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { productSchema } from '../lib/seo';
import { usePageData } from '../context/PageData';
import { currentCatalogue } from '../lib/catalogueState';
import { HAMPER_COLLECTION_SLUG, hamperEnquiry, productGallery, selectedGalleryIndex } from '../lib/giftHampers';
import { waLink, telLink } from '../lib/api';
import ProductCard from '../components/ProductCard';
import AddToCart from '../components/AddToCart';
import { ChevronRight, ChevronLeft, Phone, MessageCircle, ShieldAlert, Calendar, Box } from 'lucide-react';

export default function ProductDetail() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProducts = usePageData().products || fallbackProducts;
  const { catalog, catalogLoaded, catalogStatus, catalogValidatedAt, loadProduct } = useCart();
  const catalogProduct = catalog[slug];
  const initialProduct = initialProducts.find(item => item.slug === slug);
  const [detail, setDetail] = useState({ slug, product: initialProduct || null, error: '', notFound: false });
  const [retry, setRetry] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState({ slug, id: '' });
  const currentDetail = detail.slug === slug ? detail : null;
  const product = catalogProduct || (currentDetail?.notFound ? null : currentDetail?.product || initialProduct);
  const loading = !product && !currentDetail?.notFound && !currentDetail?.error;

  useEffect(() => {
    // Most detail pages already arrived in the shared catalogue request. Only
    // fetch a missing slug (including products beyond the list's 500-row cap).
    if (!slug || catalogProduct || (!catalogLoaded && catalogStatus === 'loading')) return;
    let active = true;
    setDetail((previous) => previous.slug === slug ? { ...previous, error: '' } : { slug, product: initialProduct || null, error: '', notFound: false });
    loadProduct(slug)
      .then((data) => {
        if (!active) return;
        setDetail({ slug, product: data, error: '', notFound: false });
      })
      .catch((error) => {
        if (!active) return;
        setDetail((previous) => error.status === 404
          ? { slug, product: null, error: '', notFound: true }
          : { slug, product: previous.slug === slug ? previous.product : initialProduct || null, error: error.message, notFound: false });
      });
    return () => { active = false; };
  }, [slug, catalogProduct, catalogLoaded, catalogStatus, catalogValidatedAt, loadProduct, retry]);

  if (loading) {
    return <div className="section-y container-x noise-bg text-center font-serif text-2xl"><SEO title="Product Details | PAHWA JEE Meerut" />Loading product details...</div>;
  }

  if (!product) {
    if (currentDetail?.error) return <div className="section-y container-x noise-bg text-center"><SEO title="Product Details | PAHWA JEE" noindex /><h1 className="text-3xl font-serif mb-4">Unable to load this product</h1><p role="alert" className="mb-4 text-muted-foreground">{currentDetail.error}</p><button className="btn-primary" onClick={() => setRetry((value) => value + 1)}>Try again</button></div>;
    return (
      <div className="section-y container-x noise-bg text-center">
        <SEO title="Product Not Found | PAHWA JEE" noindex />
        <h1 className="text-4xl font-serif mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product you are looking for might have been moved or is currently unavailable.</p>
        <Link to="/products" className="btn-primary">View Full Menu</Link>
      </div>
    );
  }

  const relatedProducts = relatedProductsFor(product, Object.values(currentCatalogue(catalog, catalogLoaded, initialProducts)));
  const specs = productSpecs(product);
  const collection = collectionFor(product);
  const description = productDescription(product);
  const isHamper = product.slug === HAMPER_COLLECTION_SLUG;
  const unavailable = /unavailable|sold out|out of stock/i.test(product.availability || "");
  const gallery = productGallery(product);
  const activeImgIndex = selectedGalleryIndex(gallery, isHamper ? searchParams.get('design') : selectedPhoto.slug === slug ? selectedPhoto.id : '');
  const activePhoto = gallery[activeImgIndex];
  const currentImage = activePhoto?.image || '/placeholder.jpg';
  function selectPhoto(index) {
    const photo = gallery[index];
    if (!photo) return;
    if (isHamper) {
      const next = new URLSearchParams(searchParams);
      next.set('design', photo.id);
      setSearchParams(next, { replace: true, preventScrollReset: true });
    } else setSelectedPhoto({ slug, id: photo.id });
  }
  const enquiry = isHamper && activePhoto
    ? hamperEnquiry(activePhoto)
    : `${product.name} (${displayPrice(product)}). ${unavailable ? 'Please let me know when it is available again' : 'Please confirm my preferred quantity and date'}`;

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
        <section className="grid min-w-0 gap-6 md:gap-12 md:grid-cols-2 items-start bg-white/40 dark:bg-card/30 p-4 md:p-10 rounded-3xl border border-border/50">
          {/* Image Gallery */}
          <div className="flex min-w-0 max-w-full flex-col gap-4 w-full">
            {/* Main Image Container */}
            <div className="relative aspect-square w-full min-w-0 rounded-2xl overflow-hidden bg-muted border border-white/60 shadow-lg">
              <OptimizedImage square={!isHamper}
                loading="eager"
                fetchPriority="high"
                src={currentImage}
                alt={activePhoto?.name || product.name}
                sizes="(min-width: 1280px) 527px, (min-width: 1024px) calc((100vw - 226px) / 2), (min-width: 768px) calc((100vw - 194px) / 2), (min-width: 640px) calc(100vw - 98px), calc(100vw - 66px)"
                className={`block h-full w-full ${isHamper ? 'object-contain' : 'object-cover'}`}
              />

              {/* Navigation Arrows (only if multiple images exist) */}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => selectPhoto((activeImgIndex + gallery.length - 1) % gallery.length)}
                    className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => selectPhoto((activeImgIndex + 1) % gallery.length)}
                    className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/65 text-white hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                  {/* Indicator overlay */}
                  <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-xs">
                    {activeImgIndex + 1} / {gallery.length}
                  </span>
                </>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {gallery.length > 1 && (
              <div className="flex min-w-0 w-full max-w-full gap-2 overflow-x-auto p-1 scrollbar-thin" role="group" aria-label="Product photos">
                {gallery.map((photo, idx) => {
                  const isActive = idx === activeImgIndex;
                  return (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => selectPhoto(idx)}
                      aria-label={`Show ${photo.name}`}
                      aria-pressed={isActive}
                      className={`relative aspect-square w-16 shrink-0 rounded-lg overflow-hidden border-2 bg-muted transition-all duration-200 ${
                        isActive
                          ? 'border-primary shadow'
                          : 'border-transparent hover:border-primary/40'
                      }`}
                    >
                      <OptimizedImage square={!isHamper} sizes="64px" src={photo.image} alt="" className={`h-full w-full ${isHamper ? 'object-contain' : 'object-cover'}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0">
            {currentDetail?.error && !catalog[slug] && <div role="alert" className="mb-4 rounded-xl border border-border p-3 text-sm"><p>{currentDetail.error}</p><button className="mt-1 min-h-11 underline" onClick={() => setRetry((value) => value + 1)}>Retry product details</button></div>}
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

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 break-words">{product.name}</h1>
            {isHamper && activePhoto && <p className="mb-3 text-lg font-semibold" aria-live="polite">{activePhoto.name}</p>}
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
            {!isHamper && <div className="mb-6"><AddToCart key={product.slug} product={product} /></div>}
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-2">
              <a
                href={waLink(enquiry)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold min-h-11 !bg-emerald-600 !text-white flex items-center justify-center gap-2 text-center hover:!bg-emerald-700"
              >
                <MessageCircle size={18} /> {unavailable ? "Ask about availability" : "Enquire on WhatsApp"}
              </a>
              <a
                href={telLink()}
                className="btn-primary min-h-11 flex items-center justify-center gap-2"
              >
                <Phone size={18} /> Call PAHWAJEE
              </a>
            </div>
          </div>
        </section>

        <section className="my-8 sm:my-12" aria-labelledby="related-products">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h2 id="related-products" className="font-serif text-2xl sm:text-3xl">More to explore</h2>
            <Link to={collection.to} className="inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">Explore {collection.label}</Link>
          </div>
          {relatedProducts.length > 0 && <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">{relatedProducts.map(item => <ProductCard key={item.slug} product={item} />)}</div>}
          <nav aria-label="Continue shopping" className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-primary dark:text-secondary">
            <Link to="/diwali" className="inline-flex min-h-11 items-center underline underline-offset-4">Explore Diwali gifts</Link>
            <Link to="/gifting" className="inline-flex min-h-11 items-center underline underline-offset-4">Gift hampers &amp; mithai boxes</Link>
            <Link to="/products" className="inline-flex min-h-11 items-center underline underline-offset-4">Browse all products</Link>
          </nav>
        </section>

        <section className="my-8 rounded-2xl border border-border bg-card p-4 sm:p-6" aria-labelledby="product-ordering-help">
          <h2 id="product-ordering-help" className="text-2xl font-serif">Choosing &amp; ordering {product.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Choose a listed pack and quantity for cart orders. For a gift, special order or unavailable item, send an enquiry with your required date. Confirm the collection outlet or delivery arrangements with the team before making a trip.</p>
          <div className="mt-3 flex flex-wrap gap-x-5 text-sm font-semibold text-primary dark:text-secondary">
            {[{to:collection.to,label:collection.label},{to:collection.guide,label:collection.guideLabel},{to:"/gallery",label:"Real shop & product photos"},{to:"/faqs",label:"Ordering FAQs"},{to:"/contact",label:"Visit our Meerut outlets"}].map(link => <Link key={link.to} to={link.to} className="inline-flex min-h-11 items-center underline underline-offset-4">{link.label}</Link>)}
          </div>
        </section>
        {isMithaiBox(product.slug) && <CustomMithaiBox />}


      </div>
    </div>
  );
}
