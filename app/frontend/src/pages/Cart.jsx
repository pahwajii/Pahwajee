import FssaiNotice from '../components/FssaiNotice';
import OptimizedImage from '../components/OptimizedImage';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Copy, LoaderCircle, MapPin, MessageCircle, Minus, Plus, ShoppingBag, Trash2, Truck } from 'lucide-react';
import SEO from '../components/SEO';
import BrandLogo from '../components/BrandLogo';
import { useCart } from '../context/CartContext';
import { productPackSizes, validCartPack, canPurchase, formatMoney, lineKey, packLabel, packPrice } from '../lib/cart';
import api from '../lib/api';

const ATTEMPT_KEY = 'pahwa-order-attempt-v1';
const emptyForm = { name: '', phone: '', email: '', method: 'pickup', address: '', city: '', pincode: '', notes: '' };

function DeliveryInfo() {
  return <div className="mt-5 rounded-xl border border-secondary/30 bg-secondary/10 p-4 text-sm leading-relaxed">
    <p className="font-medium">FREE delivery within Meerut on orders over ₹1,000.</p>
    <p className="mt-1 text-muted-foreground">Additional delivery charges apply to the rest of India. Charges will be shared when your order is confirmed.</p>
  </div>;
}

async function submissionKey(payload) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(payload)));
  const fingerprint = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  let saved;
  try { saved = JSON.parse(sessionStorage.getItem(ATTEMPT_KEY)); } catch { /* Storage may be blocked. */ }
  const key = saved?.fingerprint === fingerprint ? saved.key : crypto.randomUUID();
  try { sessionStorage.setItem(ATTEMPT_KEY, JSON.stringify({ fingerprint, key })); } catch { /* Still usable in memory. */ }
  return key;
}

function QuantityControl({ item, disabled, onChange }) {
  const [draft, setDraft] = useState(String(item.quantity));
  useEffect(() => setDraft(String(item.quantity)), [item.quantity]);
  return <div className="inline-flex h-11 overflow-hidden rounded-xl border border-border bg-background">
    <button type="button" aria-label={`Decrease quantity of ${item.name} ${packLabel(item.pack_grams, item.sale_unit)}`} disabled={disabled || item.quantity <= 1} onClick={() => onChange(item.quantity - 1)} className="grid w-11 place-items-center hover:bg-muted disabled:opacity-40"><Minus size={16} /></button>
    <input aria-label={`Cart quantity for ${item.name} ${packLabel(item.pack_grams, item.sale_unit)}`} type="number" inputMode="numeric" min="1" max="99" required disabled={disabled} value={draft} onChange={(event) => {
      setDraft(event.target.value);
      const value = Number(event.target.value);
      if (Number.isInteger(value) && value >= 1 && value <= 99) onChange(value);
    }} onBlur={() => setDraft(String(item.quantity))} className="w-12 border-x border-border bg-transparent text-center text-sm outline-none focus:ring-2 focus:ring-inset focus:ring-primary" />
    <button type="button" aria-label={`Increase quantity of ${item.name} ${packLabel(item.pack_grams, item.sale_unit)}`} disabled={disabled || item.quantity >= 99} onClick={() => onChange(item.quantity + 1)} className="grid w-11 place-items-center hover:bg-muted disabled:opacity-40"><Plus size={16} /></button>
  </div>;
}

function OrderReceipt({ order, onContinue }) {
  const [copied, setCopied] = useState(false);
  const [copyFallback, setCopyFallback] = useState(false);
  const title = useRef(null);
  useEffect(() => { title.current?.focus(); }, []);
  async function copy() {
    try { await navigator.clipboard.writeText(order.summary); setCopied(true); }
    catch { setCopyFallback(true); }
  }
  return <div className="container-x max-w-4xl py-12">
    <CheckCircle2 className="mb-5 h-12 w-12 text-emerald-600" aria-hidden="true" />
    <h1 ref={title} tabIndex={-1} className="font-serif text-4xl outline-none sm:text-5xl">Order request received</h1>
    <p className="mt-3 text-muted-foreground">We’ll contact you to confirm availability and fulfilment.</p>
    <p className="mt-5 text-sm">Reference <strong className="font-mono">{order.reference}</strong></p>
    <div className="card-warm mt-6 p-5 sm:p-8">
      <h2 className="mb-4 text-2xl">Your request</h2>
      <FssaiNotice className="mb-4" />
      <ul className="divide-y divide-border">
        {order.items.map((item) => <li key={lineKey(item)} className="flex justify-between gap-4 py-3 text-sm">
          <span>{item.name}<span className="mt-1 block text-muted-foreground">{packLabel(item.pack_grams, item.sale_unit)} × {item.quantity}</span></span>
          <strong className="whitespace-nowrap">{formatMoney(item.line_total_paise)}</strong>
        </li>)}
      </ul>
      <div className="mt-4 flex justify-between gap-4 border-t border-border pt-4 font-semibold"><span>Items subtotal</span><span>{formatMoney(order.subtotal_paise)}</span></div>
      <p className="mt-4 text-sm text-muted-foreground">{order.fulfilment.method === 'pickup' ? 'Store pickup · 19 Abu Lane, Meerut' : `Delivery requested · ${order.fulfilment.address}, ${order.fulfilment.city} ${order.fulfilment.pincode}`}</p>
      <DeliveryInfo />
    </div>
    <div className="mt-6 flex flex-wrap gap-3">
      <a href={order.whatsapp_url} target="_blank" rel="noopener noreferrer" className="btn-primary !bg-emerald-700 !text-white"><MessageCircle size={18} /> Send on WhatsApp</a>
      <button type="button" onClick={copy} className="btn-outline"><Copy size={17} /> {copied ? 'Copied' : 'Copy Order Details'}</button>
    </div>
    <p className="mt-3 text-sm text-muted-foreground">WhatsApp will open with your order details. Tap Send there to share them with the shop.</p>
    <p aria-live="polite" className="mt-2 text-sm">{copied && 'Order details copied.'}</p>
    {copyFallback && <label className="mt-4 block text-sm">Select and copy your order details<textarea readOnly value={order.summary} rows={10} className="commerce-input mt-2" onFocus={(e) => e.target.select()} /></label>}
    <Link to="/products" onClick={onContinue} className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary"><ArrowLeft size={16} /> Continue Shopping</Link>
  </div>;
}

export default function Cart() {
  const { items, catalog, catalogStatus, refreshCatalog, notice, setNotice, changeQuantity, changePack, removeItem, invalidItems, subtotal, submitting, setSubmitting, completeOrder, lastOrder, clearReceipt } = useCart();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const busy = useRef(false);
  const attempt = useRef(null);
  const errorRef = useRef(null);
  useEffect(() => { refreshCatalog().catch(() => {}); }, []);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

  function change(event) { setForm((value) => ({ ...value, [event.target.name]: event.target.value })); }

  async function submit(event) {
    event.preventDefault();
    if (busy.current || !items.length || invalidItems.length || catalogStatus !== 'ready') return;
    busy.current = true;
    setSubmitting(true);
    setError('');
    const payload = {
      customer: { name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim() || null },
      fulfilment: { method: form.method, address: form.method === 'delivery' ? form.address.trim() : '', city: form.method === 'delivery' ? form.city.trim() : '', pincode: form.method === 'delivery' ? form.pincode.trim() : '' },
      items: items.map((item) => ({ slug: item.slug, pack_grams: item.pack_grams, quantity: item.quantity, expected_unit_price_paise: item.unit_price_paise })).sort((a, b) => a.slug.localeCompare(b.slug) || (a.pack_grams || 0) - (b.pack_grams || 0)),
      notes: form.notes.trim(),
    };
    try {
      const serialized = JSON.stringify(payload);
      if (attempt.current?.payload !== serialized) attempt.current = { payload: serialized, key: await submissionKey(payload) };
      const order = await api.post('/orders', { ...payload, idempotency_key: attempt.current.key });
      completeOrder(order);
      setForm(emptyForm);
      try { sessionStorage.removeItem(ATTEMPT_KEY); } catch { /* No customer data is persisted. */ }
      attempt.current = null;
    } catch (failure) {
      if (failure.status === 409 && ['prices_changed', 'unavailable_items'].includes(failure.detail?.code)) {
        await refreshCatalog().catch(() => {});
        setNotice(failure.message);
      }
      setError(failure.status ? failure.message : 'We couldn’t confirm your request. Your cart is saved. Please retry; the same request won’t be duplicated.');
    } finally { busy.current = false; setSubmitting(false); }
  }

  const field = (name, label, props = {}) => <div>
    <label htmlFor={`order-${name}`} className="commerce-label">{label}</label>
    <input id={`order-${name}`} name={name} value={form[name]} onChange={change} disabled={submitting} className="commerce-input" {...props} />
  </div>;

  return <div className="noise-bg min-h-[65vh] pb-20 pt-8">
    <SEO noindex title="Your Cart | PAHWA JEE" description="Review your items and send an order request to PAHWA JEE, Meerut." />
    {lastOrder ? <OrderReceipt order={lastOrder} onContinue={clearReceipt} /> : <div className="container-x">
      <Link to="/products" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-primary"><ArrowLeft size={16} /> Continue Shopping</Link>
      <h1 className="mt-3 mb-8 font-serif text-4xl sm:text-5xl">Your Cart</h1>
      {!items.length ? <div className="card-warm max-w-xl mx-auto my-10 p-10 text-center">
        <ShoppingBag className="mx-auto mb-5 h-12 w-12 text-primary" />
        <h2 className="text-3xl">Your cart is empty</h2>
        <p className="mt-3 mb-6 text-muted-foreground">Choose your favourites and a pack size to get started.</p>
        <Link to="/products" className="btn-primary">Explore Products</Link>
      </div> : <form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.85fr)]">
        <div className="min-w-0 space-y-6">
          {(notice || catalogStatus !== 'ready') && <div role="status" className="rounded-xl border border-secondary/40 bg-secondary/10 p-4 text-sm leading-relaxed">
            {catalogStatus === 'loading' ? 'Checking current prices and availability…' : catalogStatus === 'error' ? <>Couldn’t check the catalogue. <button type="button" className="min-h-11 underline font-semibold" onClick={() => refreshCatalog().catch(() => {})}>Retry</button></> : notice}
          </div>}
          <div className="card-warm divide-y divide-border">
            {items.map((item) => {
              const key = lineKey(item);
              const unavailable = catalogStatus === 'ready' && (!canPurchase(catalog[item.slug]) || catalog[item.slug]?.sale_unit !== item.sale_unit || !validCartPack(item, catalog[item.slug]));
              return <div key={key} className="p-4 sm:p-6">
                <div className="flex gap-4">
                  <Link to={`/products/${item.slug}`} className="shrink-0">{item.image ? <OptimizedImage sizes="96px" src={item.image} alt={item.name} className="h-20 w-20 rounded-xl object-cover sm:h-24 sm:w-24" /> : <BrandLogo alt={item.name} className="h-20 w-20 rounded-xl p-2 sm:h-24 sm:w-24" />}</Link>
                  <div className="min-w-0 flex-1">
                    <Link to={`/products/${item.slug}`} className="font-serif text-xl font-semibold hover:text-primary">{item.name}</Link>
                    <p className="mt-1 text-sm text-muted-foreground">{formatMoney(item.unit_price_paise)}/{item.sale_unit}</p>
                    {unavailable && <p className="mt-2 text-sm text-destructive">Unavailable. Remove this item to continue.</p>}
                  </div>
                  <button type="button" onClick={() => removeItem(key)} disabled={submitting} aria-label={`Remove ${item.name} ${packLabel(item.pack_grams, item.sale_unit)}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 size={18} /></button>
                </div>
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  {item.sale_unit === 'kg' && <label className="text-xs text-muted-foreground">Pack size<select value={item.pack_grams} onChange={(e) => changePack(key, Number(e.target.value))} aria-label={`Cart pack size for ${item.name} ${packLabel(item.pack_grams)}`} disabled={submitting || unavailable} className="commerce-input mt-1 !w-24">{productPackSizes(catalog[item.slug]).map((grams) => <option key={grams} value={grams}>{packLabel(grams)}</option>)}</select></label>}
                  <div><p className="mb-1 text-xs text-muted-foreground">{item.sale_unit === 'kg' ? 'Packs' : item.sale_unit === 'plate' ? 'Plates' : 'Quantity'}</p><QuantityControl item={item} disabled={submitting || unavailable} onChange={(value) => changeQuantity(key, value)} /></div>
                  <span className="ml-auto pb-2 text-lg font-semibold whitespace-nowrap">{formatMoney(packPrice(item.unit_price_paise, item.pack_grams) * item.quantity)}</span>
                </div>
              </div>;
            })}
          </div>
          <section className="card-warm p-5 sm:p-7">
            <h2 className="mb-6 text-3xl">Your details</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {field('name', 'Full name', { required: true, minLength: 2, maxLength: 100, autoComplete: 'name' })}
              {field('phone', 'Mobile number', { required: true, type: 'tel', autoComplete: 'tel', inputMode: 'tel', maxLength: 25, pattern: '(?:\\+?91(?: |-)?)?[6-9][0-9]{9}', placeholder: '10-digit mobile number', title: 'Enter a 10-digit Indian mobile number, optionally with +91.' })}
              <div className="sm:col-span-2">{field('email', 'Email (optional)', { type: 'email', maxLength: 254, autoComplete: 'email' })}</div>
            </div>
            <fieldset className="mt-7" disabled={submitting}>
              <legend className="commerce-label">How would you like your order?</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {[['pickup', 'Store Pickup', MapPin], ['delivery', 'Delivery Request', Truck]].map(([value, label, Icon]) => <label key={value} className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm ${form.method === value ? 'border-primary bg-primary/5' : 'border-border'}`}><input type="radio" name="method" value={value} checked={form.method === value} onChange={change} className="accent-primary" /><Icon size={18} aria-hidden="true" />{label}</label>)}
              </div>
            </fieldset>
            {form.method === 'delivery' ? <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">{field('address', 'Delivery address', { required: true, minLength: 5, maxLength: 300, autoComplete: 'street-address' })}</div>
              {field('city', 'City', { required: true, minLength: 2, maxLength: 80, autoComplete: 'address-level2' })}
              {field('pincode', 'Pincode', { required: true, pattern: '[1-9][0-9]{5}', inputMode: 'numeric', maxLength: 6, autoComplete: 'postal-code', title: 'Enter a valid 6-digit pincode.' })}
            </div> : <p className="mt-3 text-sm text-muted-foreground">Pickup from 19 Abu Lane, Meerut. We’ll confirm when your order is ready.</p>}
            <label htmlFor="order-notes" className="commerce-label mt-6">Order notes (optional)</label>
            <textarea id="order-notes" name="notes" value={form.notes} onChange={change} disabled={submitting} maxLength={1000} rows={3} placeholder="Preferred pickup time or any special requests" className="commerce-input resize-y" />
          </section>
        </div>
        <aside className="card-warm p-5 sm:p-7 lg:sticky lg:top-28">
          <h2 className="text-3xl">Order summary</h2>
          <FssaiNotice className="mt-3" />
          <div className="mt-6 flex justify-between gap-4 text-base"><span>Items subtotal</span><strong data-testid="cart-subtotal">{formatMoney(subtotal)}</strong></div>
          <DeliveryInfo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">We’ll confirm availability and fulfilment with you. No online payment is collected.</p>
          {error && <p ref={errorRef} tabIndex={-1} role="alert" className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive outline-none">{error}</p>}
          {catalogStatus === 'ready' && invalidItems.length > 0 && <p role="alert" className="mt-4 text-sm text-destructive">Remove unavailable items before submitting.</p>}
          <button type="submit" disabled={submitting || catalogStatus !== 'ready' || invalidItems.length > 0} className="btn-primary mt-6 w-full justify-center !px-3 disabled:opacity-50 disabled:transform-none">{submitting && <LoaderCircle size={18} className="animate-spin" />}{submitting ? 'Submitting…' : 'Submit Order Request'}</button>
        </aside>
      </form>}
    </div>}
  </div>;
}
