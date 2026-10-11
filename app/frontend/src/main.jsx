import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { readPageData } from './context/PageData';
import './index.css';
import './App.css';

const root = document.getElementById('root');
const app = <React.StrictMode><BrowserRouter><App data={readPageData()} /><Analytics /></BrowserRouter></React.StrictMode>;
// Preserve the already-visible HTML instead of removing and repainting it.
// Query-filtered pages and empty private/fallback shells are client-rendered.
const filteredShop = window.location.pathname.replace(/\/$/, '') === '/products' && new URLSearchParams(window.location.search).has('filter');
if (root.hasChildNodes() && !filteredShop) {
  ReactDOM.hydrateRoot(root, app);
} else {
  ReactDOM.createRoot(root).render(app);
}
