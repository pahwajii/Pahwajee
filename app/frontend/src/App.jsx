import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
const InStoreMenu = React.lazy(() => import('./pages/InStoreMenu'));
const Products = React.lazy(() => import('./pages/Products'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const About = React.lazy(() => import('./pages/About'));
const Reviews = React.lazy(() => import('./pages/Reviews'));
const FAQs = React.lazy(() => import('./pages/FAQs'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Diwali = React.lazy(() => import('./pages/Diwali'));
const CorporateGifting = React.lazy(() => import('./pages/CorporateGifting'));
const Gallery = React.lazy(() => import('./pages/Gallery'));
const CategoryLanding = React.lazy(() => import('./pages/CategoryLanding'));
import NotFound from './pages/NotFound';
import { CartProvider } from './context/CartContext';

const Cart = React.lazy(() => import('./pages/Cart'));
const AdminApp = React.lazy(() => import('./admin/AdminApp'));

import { PageDataContext } from './context/PageData';

const clientPages = { Products, ProductDetail, About, Reviews, FAQs, Contact, Diwali, CorporateGifting, Gallery, CategoryLanding, InStoreMenu };

export default function App({ data = {}, pages = clientPages }) {
  const { Products, ProductDetail, About, Reviews, FAQs, Contact, Diwali, CorporateGifting, Gallery, CategoryLanding, InStoreMenu } = pages;
  return <PageDataContext.Provider value={data}><CartProvider initialProducts={data.products}>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/*" element={<React.Suspense fallback={<p className="container-x py-12" role="status">Loading admin…</p>}><AdminApp /></React.Suspense>} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/in-store-menu" element={<InStoreMenu />} />
          <Route path="/products" element={<Products />} />
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
  </CartProvider></PageDataContext.Provider>;
}
