import { isMithaiBox } from '../lib/mithaiBox';
import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ShoppingBag } from 'lucide-react';
import { waLink } from '../lib/api';
import { useCart } from '../context/CartContext';
import { productPackSizes, canPurchase, formatMoney, packLabel, packPrice } from '../lib/cart';

export default function AddToCart({ product }) {
  const { catalog, catalogStatus, addItem, submitting, refreshCatalog } = useCart();
  const item = catalog[product.slug];
  const [pack, setPack] = useState(500);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [added, setAdded] = useState(false);
  const id = useId();

  if (product.availability === 'Special order only' || item?.availability === 'Special order only') return <a href={waLink(`${product.name} - special order enquiry`)} className="btn-outline justify-center !px-3 !py-2.5 text-sm">Enquire for special order</a>;
  if ((product.category === 'festival-collection' && !isMithaiBox(product.slug)) || (item && !item.cart_eligible)) {
    return <a href={waLink(product.name)} className="btn-outline justify-center !px-4 !py-2.5 text-sm">Enquire about this item</a>;
  }
  if (catalogStatus === 'error') return <button type="button" onClick={() => refreshCatalog().catch(() => {})} className="text-sm underline min-h-11">Reload catalogue to order</button>;
  if (catalogStatus === 'ready' && !canPurchase(item)) return <p className="text-sm text-muted-foreground py-2">Currently unavailable to order.</p>;
  const packs = productPackSizes(item || product);
  const selectedPack = packs.includes(pack) ? pack : packs[0];
  const weight = item?.sale_unit === 'kg' ? selectedPack : null;
  const amount = item ? packPrice(item.unit_price_paise, weight) * quantity : null;

  function add() {
    try {
      addItem(item, weight, quantity);
      setAdded(true);
      setFeedback(`${quantity} ${weight ? `${weight}g pack${quantity > 1 ? 's' : ''}` : item.sale_unit + (quantity > 1 ? 's' : '')} added.`);
    } catch (error) { setAdded(false); setFeedback(error.message); }
  }

  return <div className="add-to-cart w-full max-w-sm space-y-3">
    <div className="cart-options flex flex-wrap items-end gap-3">
      {isMithaiBox(product.slug) ? <div className="cart-pack flex-1 min-w-24"><p className="mb-1 text-xs font-medium text-muted-foreground">Box size</p><p className="commerce-input flex items-center">1 kg only</p></div> : item?.sale_unit === 'kg' && <div className="cart-pack flex-1 min-w-24">
        <label htmlFor={`${id}-pack`} className="mb-1 block text-xs font-medium text-muted-foreground">Pack size</label>
        <select id={`${id}-pack`} aria-label={`Pack size for ${product.name}`} disabled={submitting} value={selectedPack} onChange={(e) => { setPack(Number(e.target.value)); setFeedback(''); setAdded(false); }} className="commerce-input">
          {packs.map((grams) => <option key={grams} value={grams}>{packLabel(grams)}</option>)}
        </select>
      </div>}
      <div className="cart-quantity w-20">
        <label htmlFor={`${id}-qty`} className="mb-1 block text-xs font-medium text-muted-foreground">{isMithaiBox(product.slug) ? 'Boxes' : item?.sale_unit === 'plate' ? 'Plates' : 'Quantity'}</label>
        <input id={`${id}-qty`} type="number" min="1" max="99" inputMode="numeric" aria-label={`Quantity for ${product.name}`} disabled={submitting} value={quantity} onChange={(e) => { setQuantity(e.target.value === '' ? '' : Number(e.target.value)); setFeedback(''); setAdded(false); }} onBlur={() => { if (!Number.isInteger(quantity) || quantity < 1) setQuantity(1); }} className="commerce-input" />
      </div>
    </div>
    <button type="button" onClick={add} disabled={!canPurchase(item) || submitting || !Number.isInteger(quantity) || quantity < 1 || quantity > 99} className="cart-add-button btn-primary w-full justify-center !px-3 text-sm disabled:opacity-50 disabled:transform-none">
      {added ? <Check size={17} /> : <ShoppingBag size={17} />}
      {catalogStatus === 'loading' ? 'Loading…' : 'Add to Cart'}{amount !== null && quantity > 0 && <span className="cart-button-total"><span className="cart-button-separator">· </span>{formatMoney(amount)}</span>}
    </button>
    <div aria-live="polite" className="text-xs leading-relaxed">
      {feedback && <p className={added ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'}>{feedback} {added && <Link className="underline font-semibold" to="/cart">View cart</Link>}</p>}
    </div>
  </div>;
}
