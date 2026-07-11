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
import Gallery from './pages/Gallery';

function Placeholder({ title }) {
  return (
    <div className="container-x section-y">
      <p className="eyebrow">PAHWA JEE</p>
      <h1 className="mt-4 text-5xl font-serif">{title}</h1>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/testimonials" element={<Placeholder title="Reviews" />} />
          <Route path="/faqs" element={<Placeholder title="FAQs" />} />
          <Route path="/contact" element={<Placeholder title="Contact" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
