import { FavouritesProvider } from './context/FavouritesContext';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
const Favourites = React.lazy(() => import('./pages/Favourites'));
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
const Blog = React.lazy(() => import('./pages/Blog'));
const BlogArticle = React.lazy(() => import('./pages/BlogArticle'));
const CategoryLanding = React.lazy(() => import('./pages/CategoryLanding'));
import NotFound from './pages/NotFound';
import { CartProvider } from './context/CartContext';

const Cart = React.lazy(() => import('./pages/Cart'));
const AdminApp = React.lazy(() => import('./admin/AdminApp'));

import { PageDataContext } from './context/PageData';

const clientPages = { Products, ProductDetail, About, Reviews, FAQs, Contact, Diwali, CorporateGifting, Gallery, CategoryLanding, InStoreMenu, Blog, BlogArticle };

export default function App({ data = {}, pages = clientPages }) {
  const { Products, ProductDetail, About, Reviews, FAQs, Contact, Diwali, CorporateGifting, Gallery, CategoryLanding, InStoreMenu, Blog, BlogArticle } = pages;
  return <PageDataContext.Provider value={data}><CartProvider initialProducts={data.products}><FavouritesProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/*" element={<React.Suspense fallback={<p className="container-x py-12" role="status">Loading admin…</p>}><AdminApp /></React.Suspense>} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/in-store-menu" element={<InStoreMenu />} />
          <Route path="/products" element={<Products />} />
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
