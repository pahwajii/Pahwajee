import { FavouritesProvider } from './context/FavouritesContext';
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import NotFound from './pages/NotFound';
import { CartProvider } from './context/CartContext';
import { PageDataContext } from './context/PageData';
import { initialPageName } from './lib/routeLoading';

const pageLoaders = {
  Home: () => import('./pages/Home'),
  Favourites: () => import('./pages/Favourites'),
  InStoreMenu: () => import('./pages/InStoreMenu'),
  Products: () => import('./pages/Products'),
  ProductDetail: () => import('./pages/ProductDetail'),
  About: () => import('./pages/About'),
  Reviews: () => import('./pages/Reviews'),
  FAQs: () => import('./pages/FAQs'),
  Contact: () => import('./pages/Contact'),
  Diwali: () => import('./pages/Diwali'),
  CorporateGifting: () => import('./pages/CorporateGifting'),
  Gallery: () => import('./pages/Gallery'),
  Blog: () => import('./pages/Blog'),
  PolicyPage: () => import('./pages/PolicyPage'),
  BlogArticle: () => import('./pages/BlogArticle'),
  CategoryLanding: () => import('./pages/CategoryLanding'),
  Cart: () => import('./pages/Cart'),
  AdminApp: () => import('./admin/AdminApp'),
};
const clientPages = Object.fromEntries(Object.entries(pageLoaders).map(([name, load]) => [name, React.lazy(load)]));

// Hydrating a lazy route can replace its already-visible HTML with a short
// fallback when a provider updates. Resolve the first page before hydrating.
// The other routes remain lazy, and SSR supplies synchronous page overrides.
export async function loadInitialPages(pathname) {
  const name = initialPageName(pathname);
  return name ? { [name]: (await pageLoaders[name]()).default } : {};
}

export default function App({ data = {}, pages = {} }) {
  const { Home, Products, ProductDetail, About, Reviews, FAQs, Contact, Diwali, CorporateGifting, Gallery, CategoryLanding, InStoreMenu, Blog, BlogArticle, PolicyPage, Favourites, Cart, AdminApp } = { ...clientPages, ...pages };
  return <PageDataContext.Provider value={data}><CartProvider initialProducts={data.products}><FavouritesProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/*" element={<React.Suspense fallback={<p className="container-x py-12" role="status">Loading admin…</p>}><AdminApp /></React.Suspense>} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/in-store-menu" element={<InStoreMenu />} />
          <Route path="/products" element={<Products />} />
          <Route path="/shop" element={<Navigate to="/products" replace />} />
          {["terms-and-conditions", "privacy-policy", "shipping-policy", "returns-and-cancellations"].map(page => <Route key={page} path={"/" + page} element={<PolicyPage page={page} />} />)}
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/cart" element={<React.Suspense fallback={<p className="container-x py-12" role="status">Loading cart…</p>}><Cart /></React.Suspense>} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/testimonials" element={<Reviews />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/diwali" element={<Diwali />} />
          <Route path="/gifting" element={<CorporateGifting />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogArticle />} />

          {/* Category Landing Pages */}
          <Route path="/our-specialities" element={<CategoryLanding type="specialities" />} />
          <Route path="/nankhatai-meerut" element={<CategoryLanding type="nankhatai" />} />
          <Route path="/rewri-gajak-meerut" element={<CategoryLanding type="rewri-gajak" />} />
          <Route path="/sweets-meerut" element={<CategoryLanding type="sweets" />} />
          <Route path="/bakery-meerut" element={<CategoryLanding type="bakery" />} />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
  </FavouritesProvider></CartProvider></PageDataContext.Provider>;
}
