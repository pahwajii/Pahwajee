import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../lib/api';
import { createCatalogueCache, refreshOnReturn } from '../lib/catalogueState';
import { CART_STORAGE_KEY, PACK_SIZES, validCartPack, addCartItem, canPurchase, lineKey, packPrice, reconcileCart, restoreCart } from '../lib/cart';

const CartContext = createContext(null);
const fetchProduct = (slug) => api.get(`/products/${encodeURIComponent(slug)}`);

function readCart() {
  try { return restoreCart(localStorage.getItem(CART_STORAGE_KEY)); } catch { return []; }
}

export function CartProvider({ children, initialProducts }) {
  const { pathname } = useLocation();
  const [items, setItems] = useState([]);
  const itemsRef = useRef(items);
  const [cache] = useState(() => createCatalogueCache(() => api.get('/products?limit=500'), {
    initialCatalog: Object.fromEntries((initialProducts || []).map(product => [product.slug, product])),
  }));
  const [catalogState, setCatalogState] = useState(cache.getState);
  const { catalog, status: catalogStatus, loaded: catalogLoaded, refreshing: catalogRefreshing, validatedAt: catalogValidatedAt } = catalogState;
  const [notice, setNotice] = useState('');
  const [lastOrder, setLastOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function updateItems(next) {
    itemsRef.current = next;
    setItems(next);
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next)); } catch { /* In-memory cart still works. */ }
  }

  const loadProduct = useCallback((slug) => cache.loadProduct(slug, fetchProduct), [cache]);

  const refreshCatalog = useCallback(async (options) => {
    await cache.refresh(options);
    // An admin save may invalidate the read we just awaited. Join its queued
    // replacement before returning; a current result is a free cache hit.
    await cache.refresh();
    // Direct product links may refer to items outside the list endpoint's limit.
    // Validate them on every refresh so ordinary navigation does not leave
    // a legitimate cart item disabled with no path to checkout.
    return cache.validateProducts(itemsRef.current.map(item => item.slug), fetchProduct);
  }, [cache]);

  useEffect(() => {
    let previous = cache.getState().catalog;
    return cache.subscribe(state => {
      setCatalogState(state);
      if (state.loaded && state.catalog !== previous) {
        previous = state.catalog;
        const result = reconcileCart(itemsRef.current, state.catalog);
        updateItems(result.items);
        if (result.priceChanged) setNotice('Prices have been updated. Please review your cart total before submitting.');
      }
    });
  }, [cache]);

  useEffect(() => {
    const saved = readCart();
    itemsRef.current = saved;
    setItems(saved);
    return refreshOnReturn(refreshCatalog, window, document);
  }, []);

  useEffect(() => { refreshCatalog().catch(() => {}); }, [pathname]);

  useEffect(() => {
    const refresh = () => cache.invalidate()
      .then(() => cache.validateProducts(itemsRef.current.map(item => item.slug), fetchProduct))
      .catch(() => {});
    window.addEventListener('pahwa-catalogue-updated', refresh);
    let channel;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('pahwa-catalogue');
        channel.addEventListener('message', refresh);
      }
    } catch { /* Cross-tab invalidation is optional. */ }
    return () => { window.removeEventListener('pahwa-catalogue-updated', refresh); channel?.close(); };
  }, [cache]);

  function addItem(product, pack, quantity) {
    if (submitting) throw new Error('Please wait for your order request to finish.');
    if (cache.getState().status !== 'ready') throw new Error('Please wait for the catalogue to load.');
    updateItems(addCartItem(itemsRef.current, cache.getState().catalog[product.slug], pack, quantity));
    setLastOrder(null);
  }

  function changeQuantity(key, quantity) {
    if (submitting || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return;
    updateItems(itemsRef.current.map((item) => lineKey(item) === key ? { ...item, quantity } : item));
  }

  function changePack(key, pack) {
    if (submitting || !PACK_SIZES.includes(pack)) return;
    const original = itemsRef.current.find((item) => lineKey(item) === key);
    if (!original || original.sale_unit !== 'kg' || original.pack_grams === pack) return;
    try {
      const remaining = itemsRef.current.filter((item) => lineKey(item) !== key);
      updateItems(addCartItem(remaining, catalog[original.slug], pack, original.quantity));
    } catch (error) { setNotice(error.message); }
  }

  const invalidItems = items.filter((item) => !canPurchase(catalog[item.slug]) || catalog[item.slug]?.sale_unit !== item.sale_unit || !validCartPack(item, catalog[item.slug]));
  const subtotal = items.reduce((total, item) => total + packPrice(item.unit_price_paise, item.pack_grams) * item.quantity, 0);

  return <CartContext.Provider value={{
    items, catalog, catalogStatus, catalogLoaded, catalogRefreshing, catalogValidatedAt, refreshCatalog, loadProduct, notice, setNotice, addItem,
    changeQuantity, changePack, submitting, setSubmitting, invalidItems, subtotal,
    count: items.reduce((total, item) => total + item.quantity, 0),
    removeItem: (key) => { if (!submitting) updateItems(itemsRef.current.filter((item) => lineKey(item) !== key)); },
    completeOrder: (order) => { setLastOrder(order); updateItems([]); setNotice(''); },
    lastOrder, clearReceipt: () => setLastOrder(null),
  }}>{children}</CartContext.Provider>;
}

export function useCart() { return useContext(CartContext); }
