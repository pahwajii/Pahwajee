import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import './App.css';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Reviews from './pages/Reviews';
import FAQs from './pages/FAQs';
import Contact from './pages/Contact';
import Diwali from './pages/Diwali';
import CorporateGifting from './pages/CorporateGifting';
import CategoryLanding from './pages/CategoryLanding';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/testimonials" element={<Reviews />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/diwali" element={<Diwali />} />
          <Route path="/gifting" element={<CorporateGifting />} />
          
          {/* Category Landing Pages */}
          <Route path="/nankhatai-meerut" element={<CategoryLanding type="nankhatai" />} />
          <Route path="/rewri-gajak-meerut" element={<CategoryLanding type="rewri-gajak" />} />
          <Route path="/sweets-meerut" element={<CategoryLanding type="sweets" />} />
          <Route path="/bakery-meerut" element={<CategoryLanding type="bakery" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
