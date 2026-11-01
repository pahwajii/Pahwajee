import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import App, { loadInitialPages } from './App';
import { readPageData } from './context/PageData';
import './index.css';
import './App.css';

// Keep performance measurements attributed to the current client-side route.
function SiteSpeedInsights() {
  const { pathname } = useLocation();
  return <SpeedInsights route={pathname} />;
}

const root = document.getElementById('root');
// Preserve the already-visible HTML instead of removing and repainting it.
// Query-specific content differs from the canonical prerendered page. Render
// those selections directly instead of hydrating a different filter or photo.
const pathname = window.location.pathname.replace(/\/$/, '');
const params = new URLSearchParams(window.location.search);
const filteredShop = pathname === '/products' && params.has('filter');
const selectedDesign = pathname === '/products/dry-fruit-gift-trays' && params.has('design');
async function start() {
  try {
    // Leave prerendered content visible while the matching route downloads.
    const pages = await loadInitialPages(window.location.pathname);
    document.getElementById('page-load-retry')?.remove();
    const app = <React.StrictMode><BrowserRouter><App data={readPageData()} pages={pages} /><Analytics /><SiteSpeedInsights /></BrowserRouter></React.StrictMode>;
    if (root.hasChildNodes() && !filteredShop && !selectedDesign) {
      ReactDOM.hydrateRoot(root, app);
    } else {
      ReactDOM.createRoot(root).render(app);
    }
  } catch (error) {
    console.error('Unable to load this page.', error);
    if (document.getElementById('page-load-retry')) return;
    const retry = document.createElement('button');
    retry.id = 'page-load-retry';
    retry.type = 'button';
    retry.className = 'fixed bottom-4 left-4 right-4 z-50 rounded-xl bg-primary p-4 text-primary-foreground shadow-xl';
    retry.textContent = 'This page could not finish loading. Tap to retry.';
    retry.addEventListener('click', () => { retry.remove(); start(); }, { once: true });
    document.body.append(retry);
  }
}
start();
