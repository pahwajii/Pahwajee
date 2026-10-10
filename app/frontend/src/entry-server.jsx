import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Reviews from './pages/Reviews';
import FAQs from './pages/FAQs';
import Contact from './pages/Contact';
import Diwali from './pages/Diwali';
import CorporateGifting from './pages/CorporateGifting';
import Gallery from './pages/Gallery';
import CategoryLanding from './pages/CategoryLanding';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { SeoCollectorContext } from './context/PageData';

const pages = { Products, ProductDetail, About, Reviews, FAQs, Contact, Diwali, CorporateGifting, Gallery, CategoryLanding };

export function render(path, data) {
  const collector = {current: null};
  const html = renderToString(<SeoCollectorContext.Provider value={collector}><StaticRouter location={path}><App data={data} pages={pages} /></StaticRouter></SeoCollectorContext.Provider>);
  if (!collector.current) throw new Error(`Missing SEO metadata for ${path}`);
  return {html, meta: collector.current};
}
