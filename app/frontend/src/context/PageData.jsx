import { createContext, useContext } from 'react';

export const PageDataContext = createContext({});
export const SeoCollectorContext = createContext(null);
export const usePageData = () => useContext(PageDataContext);

export function readPageData() {
  if (typeof document === 'undefined') return {};
  try { return JSON.parse(document.getElementById('page-data')?.textContent || '{}'); }
  catch { return {}; }
}
