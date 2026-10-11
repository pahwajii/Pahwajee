import { createContext, useContext, useEffect, useRef, useState } from 'react';
import api from '../lib/api';
import { CART_STORAGE_KEY, PACK_SIZES, validCartPack, addCartItem, canPurchase, lineKey, packPrice, reconcileCart, restoreCart } from '../lib/cart';

const CartContext = createContext(null);

function readCart() {
  try { return restoreCart(localStorage.getItem(CART_STORAGE_KEY)); } catch { return []; }
}

export function CartProvider({ children, initialProducts }) {
  const [items, setItems] = useState([]);
  const itemsRef = useRef(items);
  const [catalog, setCatalog] = useState(() => Object.fromEntries((initialProducts || []).map(product => [product.slug, product])));
  // Purchases stay disabled until current server availability and prices arrive.
  const [catalogStatus, setCatalogStatus] = useState('loading');
  const [notice, setNotice] = useState('');
  const [lastOrder, setLastOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function updateItems(next) {
    itemsRef.current = next;
    setItems(next);
    try { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next)); } catch { /* In-memory cart still works. */ }
  }

  async function refreshCatalog() {
    try {
      const products = await api.get('/products?limit=500');
      if (!Array.isArray(products)) throw new Error('Invalid catalogue');
      const current = Object.fromEntries(products.map((product) => [product.slug, product]));
      const result = reconcileCart(itemsRef.current, current);
      setCatalog(current);
      setCatalogStatus('ready');
      updateItems(result.items);
      if (result.priceChanged) setNotice('Prices have been updated. Please review your cart total before submitting.');
      return current;
    } catch (error) {
      setCatalogStatus('error');
      throw error;
    }
  }

  useEffect(() => {
    const saved = readCart();
    itemsRef.current = saved;
    setItems(saved);
    refreshCatalog().catch(() => {});
  }, []);

  function addItem(product, pack, quantity) {
    if (submitting) throw new Error('Please wait for your order request to finish.');
    if (catalogStatus !== 'ready') throw new Error('Please wait for the catalogue to load.');
    updateItems(addCartItem(itemsRef.current, catalog[product.slug], pack, quantity));
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
    items, catalog, catalogStatus, refreshCatalog, notice, setNotice, addItem,
    changeQuantity, changePack, submitting, setSubmitting, invalidItems, subtotal,
    count: items.reduce((total, item) => total + item.quantity, 0),
    removeItem: (key) => { if (!submitting) updateItems(itemsRef.current.filter((item) => lineKey(item) !== key)); },
    completeOrder: (order) => { setLastOrder(order); updateItems([]); setNotice(''); },
    lastOrder, clearReceipt: () => setLastOrder(null),
  }}>{children}</CartContext.Provider>;
}

export function useCart() { return useContext(CartContext); }
