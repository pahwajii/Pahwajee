import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { createServer, loadEnv } from 'vite';

const root = process.cwd();
const env = {...loadEnv('production', root, ''), ...process.env};
const api = (env.PRERENDER_API_URL || 'https://pahwajee.in/api').replace(/\/$/, '');
async function readPublic(path) {
  const response = await fetch(`${api}/${path}`, {signal: AbortSignal.timeout(30000)});
  if (!response.ok) throw new Error(`Prerender ${path} failed: HTTP ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error(`Invalid public ${path} data`);
  return data;
}

const [allProducts, faqs, testimonials, gallery] = await Promise.all([
  env.PRERENDER_CATALOG_SNAPSHOT === '1' ? readFile(resolve(root, 'src/generated/catalog.json'), 'utf8').then(JSON.parse) : readPublic('products?limit=500'), readPublic('faqs'), readFile(resolve(root, '../google-reviews.json'), 'utf8').then(JSON.parse).then(data => data.reviews),
  readFile(resolve(root, 'public/gallery.json'), 'utf8').then(JSON.parse),
]);
const galleryOnlySlugs = JSON.parse(await readFile(resolve(root, '../gallery-only-products.json'), 'utf8'));
const products = allProducts.filter(product => !galleryOnlySlugs.includes(product.slug));
if (!products.length || products.some(product => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug))) throw new Error('The catalogue is empty or has invalid product URLs; refusing an incomplete SEO build.');
// Only public API responses are embedded. Never read auth, cart, orders or enquiries.
const data = {products, faqs, testimonials, gallery};
const server = await createServer({mode: 'production', server: {middlewareMode: true}, appType: 'custom'});
try {
  const {render} = await server.ssrLoadModule('/src/entry-server.jsx');
  const {PUBLIC_PATHS, SITE_URL, renderHead, metadata, serializeJson, escapeHtml} = await server.ssrLoadModule('/src/lib/seo.js');
  const template = await readFile(resolve(root, 'dist/index.html'), 'utf8');
  if (!template.includes('<!--seo-head-->')) throw new Error('Missing SEO template marker');
  const paths = [...PUBLIC_PATHS, ...products.map(product => `/products/${product.slug}`)];
  async function output(file, html, meta, initialData = {}) {
    const destination = resolve(root, 'dist', file);
    await mkdir(dirname(destination), {recursive: true});
    const page = template.replace('<!--seo-head-->', renderHead(meta)).replace('<div id="root"></div>', `<div id="root">${html}</div>\n<script id="page-data" type="application/json">${serializeJson(initialData)}</script>`);
    await writeFile(destination, page);
  }
  for (const path of paths) {
    const {html, meta} = render(path, data);
    if (!html.includes('<h1')) throw new Error(`Missing rendered heading on ${path}`);
    await output(path === '/' ? 'index.html' : `${path.slice(1)}.html`, html, meta, {products, ...(path === '/gallery' ? {gallery} : {}), ...(path === '/faqs' ? {faqs} : {}), ...(path === '/testimonials' ? {testimonials} : {})});
  }
  const notFound = render('/page-not-found', {});
  await output('404.html', notFound.html, notFound.meta);
  await output('favourites.html', '', metadata({path: '/favourites', title: 'Your Favourites | PAHWA JEE', noindex: true}), {products});
  await output('cart.html', '', metadata({path: '/cart', title: 'Your Cart | PAHWA JEE', noindex: true}));
  await output('admin.html', '', metadata({path: '/admin', title: 'Shop Admin | PAHWA JEE', noindex: true}));
  // Newly added products still load before the next prerender deployment.
  await output('product-shell.html', '', {...metadata({path: '/products', title: 'Product Details | PAHWA JEE Meerut'}), url: null, schema: null});
  const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + paths.map(path => `  <url><loc>${escapeHtml(SITE_URL + path)}</loc></url>`).join('\n') + '\n</urlset>\n';
  await writeFile(resolve(root, 'dist/sitemap.xml'), sitemap);
  // Private routes are crawlable so their noindex headers can be seen by bots.
  await writeFile(resolve(root, 'dist/robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  console.log(`Prerendered ${paths.length} public pages, including ${products.length} products, for ${SITE_URL}.`);
} finally {
  await server.close();
}
