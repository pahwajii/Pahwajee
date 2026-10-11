import productPacks from '../../../product-packs.json' with { type: 'json' };
// Public canonical origin, shared by metadata, structured data and the sitemap.
export const SITE_URL = 'https://pahwajee.in';
export const PUBLIC_PATHS = ['/', '/products', '/in-store-menu', '/our-specialities', '/nankhatai-meerut', '/rewri-gajak-meerut', '/sweets-meerut', '/bakery-meerut', '/gifting', '/diwali', '/about', '/contact', '/gallery', '/testimonials', '/faqs'];
export const DEFAULT_TITLE = 'PAHWA JEE Meerut | Nankhatai, Rewri, Gajak & Gift Hampers';
export const DEFAULT_DESCRIPTION = 'Visit PAHWA JEE at 19 Abu Lane, Meerut for Desi Ghee and Vanaspati Ghee Nankhatai, Rewri, Gajak, sweets and gift hampers. Browse products and request an order.';
const labels = {'in-store-menu': 'In-store Menu', products: 'Shop', 'our-specialities': 'Our Specialities', 'nankhatai-meerut': 'Nankhatai', 'rewri-gajak-meerut': 'Rewri & Gajak', 'sweets-meerut': 'Sweets', 'bakery-meerut': 'Bakery', gifting: 'Gift Hampers', diwali: 'Diwali Gifts', about: 'Our Story', contact: 'Contact', gallery: 'Gallery', testimonials: 'Customer Reviews', faqs: 'FAQs'};

export function absoluteUrl(value = '/') {
  const url = new URL(value, `${SITE_URL}/`);
  return ['https:', 'http:'].includes(url.protocol) ? url.href : `${SITE_URL}/`;
}

export function canonicalPath(path = '/') {
  const pathname = new URL(path, `${SITE_URL}/`).pathname.replace(/\/+$/, '') || '/';
  return pathname === '/reviews' ? '/testimonials' : pathname;
}

export function businessSchema() {
  return {
    '@type': 'Bakery', '@id': `${SITE_URL}/#business`, name: 'PAHWA JEE',
    alternateName: 'Ram Chandra Deewan Chandra Rewri Wale', url: `${SITE_URL}/`,
    image: absoluteUrl('/our_shop_main.jpeg'), logo: absoluteUrl('/brand/pahwajee-day.png'), telephone: '+916396339806',
    address: {'@type': 'PostalAddress', streetAddress: '19 Abu Lane', addressLocality: 'Meerut', addressRegion: 'Uttar Pradesh', postalCode: '250001', addressCountry: 'IN'},
    openingHoursSpecification: {'@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '09:00', closes: '22:30'},
    hasMenu: `${SITE_URL}/in-store-menu`,
    hasMap: 'https://www.google.com/maps/search/?api=1&query=PAHWA+JEE+19+Abu+Lane+Meerut',
    sameAs: ['https://www.instagram.com/pahwajee/', 'https://www.facebook.com/p/PAHWA-JEE-REWRI-WALE-61568193482637/'],
  };
}

export function productSchema(product) {
  const url = absoluteUrl(`/products/${product.slug}`);
  const schema = {
    '@type': 'Product', '@id': `${url}#product`, url, name: product.name,
    description: product.description || `${product.name} from PAHWA JEE, 19 Abu Lane, Meerut. Contact the store to confirm availability.`,
    image: [...new Set([product.image, ...(product.images || [])].filter(Boolean))].map(absoluteUrl),
    brand: {'@type': 'Brand', name: 'PAHWA JEE'}, sku: product.slug,
  };
  const amount = product.unit_price_paise;
  // Ranges, unpriced gifts and enquiry-only products must not advertise invented offers.
  if (product.cart_eligible && Number.isSafeInteger(amount) && amount > 0) {
    const fixedPack = product.sale_unit === 'kg' ? productPacks[product.slug]?.[0] : null;
    const offerAmount = fixedPack ? Math.round(amount * fixedPack / 1000) : amount;
    const unit = product.sale_unit === 'kg' ? {unitCode: 'KGM'} : {unitText: product.sale_unit};
    schema.offers = {
      '@type': 'Offer', url, ...(fixedPack ? {name: `${fixedPack} g pack`} : {}), priceCurrency: 'INR', price: (offerAmount / 100).toFixed(2), seller: {'@id': `${SITE_URL}/#business`},
      priceSpecification: {'@type': 'UnitPriceSpecification', priceCurrency: 'INR', price: (amount / 100).toFixed(2), referenceQuantity: {'@type': 'QuantitativeValue', value: 1, ...unit}},
    };
    if (product.availability === 'Available') schema.offers.availability = 'https://schema.org/InStock';
    else if (/unavailable|sold out|out of stock/i.test(product.availability || '')) schema.offers.availability = 'https://schema.org/OutOfStock';
  }
  return schema;
}

export function metadata({path = '/', title = DEFAULT_TITLE, description = DEFAULT_DESCRIPTION, image = '/our_shop_main.jpeg', canonical, schema, noindex = false} = {}) {
  const pathname = canonicalPath(path);
  const url = absoluteUrl(canonical || pathname);
  const privatePage = noindex || pathname === '/cart' || pathname === '/admin' || pathname.startsWith('/admin/');
  const graph = [];
  if (!privatePage) {
    graph.push(businessSchema(), {'@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: 'PAHWA JEE', inLanguage: 'en-IN', publisher: {'@id': `${SITE_URL}/#business`}});
    graph.push({'@type': pathname === '/about' ? 'AboutPage' : pathname === '/contact' ? 'ContactPage' : 'WebPage', '@id': `${url}#webpage`, url, name: title, description, inLanguage: 'en-IN', isPartOf: {'@id': `${SITE_URL}/#website`}, about: {'@id': `${SITE_URL}/#business`}});
    if (pathname !== '/') {
      const crumbs = [{name: 'Home', item: absoluteUrl('/')}];
      if (pathname.startsWith('/products/')) crumbs.push({name: 'Shop', item: absoluteUrl('/products')});
      crumbs.push({name: schema?.name || labels[pathname.slice(1)] || title.split('|')[0].trim(), item: url});
      graph.push({'@type': 'BreadcrumbList', itemListElement: crumbs.map((crumb, i) => ({'@type': 'ListItem', position: i + 1, ...crumb}))});
    }
    if (schema && !['Bakery', 'AggregateRating', 'ContactPage'].includes(schema['@type'])) {
      const {'@context': context, ...entry} = schema;
      graph.push(entry);
    }
  }
  return {title, description, url, image: absoluteUrl(image), robots: privatePage ? 'noindex, follow' : 'index, follow, max-image-preview:large', schema: graph.length ? {'@context': 'https://schema.org', '@graph': graph} : null};
}

export const serializeJson = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[char]));

export function renderHead(meta) {
  const tags = [['name', 'description', meta.description], ['name', 'robots', meta.robots], ['property', 'og:type', 'website'], ['property', 'og:site_name', 'PAHWA JEE'], ['property', 'og:locale', 'en_IN'], ['property', 'og:title', meta.title], ['property', 'og:description', meta.description], ['property', 'og:url', meta.url], ['property', 'og:image', meta.image], ['property', 'og:image:alt', meta.title], ['name', 'twitter:card', 'summary_large_image'], ['name', 'twitter:title', meta.title], ['name', 'twitter:description', meta.description], ['name', 'twitter:image', meta.image]];
  return `<title>${escapeHtml(meta.title)}</title>\n` + (meta.url ? `<link rel="canonical" href="${escapeHtml(meta.url)}">\n` : '') + tags.filter(([, , value]) => value != null).map(([attr, key, value]) => `<meta ${attr}="${key}" content="${escapeHtml(value)}">`).join('\n') + (meta.schema ? `\n<script id="jsonld-schema" type="application/ld+json">${serializeJson(meta.schema)}</script>` : '');
}
