import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, ClipboardList, RefreshCw, Save } from 'lucide-react';
import api from '../lib/api';
import { formatMoney, packLabel } from '../lib/cart';
import { ErrorMessage, NEXT_STATUS, ORDER_LABELS, PageHeading, Pagination, ResourceState, SearchBox, StatusBadge, dateLabel, useInbox } from './shared';

function OrderDetail({ order, onClose, onSaved }) {
  const [status, setStatus] = useState(order.status);
  const [notes, setNotes] = useState(order.internal_notes || '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cancelConfirmed, setCancelConfirmed] = useState(false);
  const [discard, setDiscard] = useState(false);
  const dirty = status !== order.status || notes !== (order.internal_notes || '');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setSaved(false);
    try {
      const updated = await api.patch(`/admin/orders/${encodeURIComponent(order.reference)}`, { status, expected_status: order.status, internal_notes: notes });
      onSaved(updated); setSaved(true);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <>
    <button className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground" disabled={busy} onClick={() => dirty ? setDiscard(true) : onClose()}><ArrowLeft size={17} />Back to orders</button>
    {discard && <div className="admin-panel mb-5 flex flex-wrap items-center gap-3 p-4" role="alert"><span className="mr-auto text-sm">Discard unsaved changes?</span><button className="admin-button" onClick={() => setDiscard(false)}>Keep editing</button><button className="admin-primary" onClick={onClose}>Discard changes</button></div>}
    <PageHeading title={order.reference} action={<StatusBadge value={order.status} />}>Received {dateLabel(order.created_at)} IST</PageHeading>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <section className="admin-panel overflow-hidden"><h2 className="p-5 text-lg font-semibold">Order items</h2><ul className="divide-y divide-border">{order.items.map((item, index) => <li key={`${item.slug}-${item.pack_grams}-${index}`} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="font-medium">{item.name}</p><p className="mt-1 text-sm text-muted-foreground">{packLabel(item.pack_grams, item.sale_unit)} × {item.quantity} · {formatMoney(item.pack_price_paise)} each</p></div><p className="whitespace-nowrap font-medium">{formatMoney(item.line_total_paise)}</p></li>)}</ul><div className="border-t border-border bg-muted/30 p-5"><div className="flex justify-between gap-4 font-semibold"><span>Items subtotal</span><span>{formatMoney(order.subtotal_paise)}</span></div><p className="mt-2 text-xs text-muted-foreground">Delivery charges are confirmed separately. No online payment collected.</p></div></section>
        <div className="grid gap-5 md:grid-cols-2"><section className="admin-panel p-5"><h2 className="font-semibold">Customer</h2><p className="mt-4 text-sm">{order.customer.name}</p><a href={`tel:${order.customer.phone}`} className="mt-2 block break-all text-sm text-primary underline">{order.customer.phone}</a>{order.customer.email && <p className="mt-2 break-all text-sm text-muted-foreground">{order.customer.email}</p>}</section><section className="admin-panel p-5"><h2 className="font-semibold">{order.fulfilment.method === 'delivery' ? 'Delivery requested' : 'Store pickup'}</h2>{order.fulfilment.method === 'delivery' ? <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">{order.fulfilment.address}<br />{order.fulfilment.city} – {order.fulfilment.pincode}</p> : <p className="mt-4 text-sm text-muted-foreground">PAHWA JEE, 19 Abu Lane, Meerut</p>}</section></div>
        {order.notes && <section className="admin-panel p-5"><h2 className="font-semibold">Customer note</h2><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed">{order.notes}</p></section>}
        {!!order.status_history?.length && <section className="admin-panel p-5"><h2 className="mb-4 font-semibold">Status history</h2><ol className="space-y-4">{order.status_history.map((entry, index) => <li key={index} className="border-l-2 border-primary/25 pl-4 text-sm"><p>{ORDER_LABELS[entry.from]} → {ORDER_LABELS[entry.to]}</p><p className="mt-1 text-xs text-muted-foreground">{dateLabel(entry.at)} IST</p></li>)}</ol></section>}
      </div>
      <form onSubmit={submit} className="admin-panel space-y-5 p-5">
        <h2 className="text-lg font-semibold">Manage order</h2><ErrorMessage>{error}</ErrorMessage>{saved && <p role="status" className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300"><Check size={17} />Order updated.</p>}
        <div><label className="admin-label" htmlFor="order-status">Order status</label><select id="order-status" className="admin-input" disabled={busy} value={status} onChange={(e) => { setStatus(e.target.value); setSaved(false); setCancelConfirmed(false); }}>{[order.status, ...(NEXT_STATUS[order.status] || [])].map((value) => <option key={value} value={value}>{ORDER_LABELS[value] || value}</option>)}</select></div>
        {status === 'ready' && <p className="text-xs text-muted-foreground">Ready {order.fulfilment.method === 'delivery' ? 'for dispatch' : 'for customer pickup'}.</p>}
        {status === 'cancelled' && order.status !== 'cancelled' && <label className="flex items-start gap-3 rounded-xl bg-muted p-3 text-sm"><input type="checkbox" required checked={cancelConfirmed} onChange={(e) => setCancelConfirmed(e.target.checked)} className="mt-1 h-4 w-4 shrink-0" />I confirm that this order should be cancelled.</label>}
        <div><label className="admin-label" htmlFor="order-notes">Internal notes</label><textarea id="order-notes" rows={5} maxLength={2000} value={notes} onChange={(e) => { setNotes(e.target.value); setSaved(false); }} disabled={busy} className="admin-input resize-y" placeholder="Pickup time, delivery arrangement, or follow-up…" /><p className="mt-2 text-xs text-muted-foreground">Visible only to admins. Status updates do not send customer messages.</p></div>
        <button className="admin-primary w-full" disabled={busy || !dirty}><Save size={17} />{busy ? 'Saving…' : 'Save changes'}</button>
        <div className="border-t border-border pt-4 text-xs text-muted-foreground">Order notification email: <span className="font-medium">{({ pending: 'Queued', retry: 'Retrying', sending: 'Sending', sent: 'Sent', failed: 'Failed' })[order.email?.status] || 'Not recorded'}</span></div>
      </form>
    </div>
  </>;
}

export default function AdminOrders() {
  const inbox = useInbox('/admin/order-inbox');
  const { resource, query, setQuery, status, setStatus, page, setPage } = inbox;
  const [selected, setSelected] = useState(null);
  const [params] = useSearchParams();
  const reference = params.get('order');
  useEffect(() => { if (reference) setQuery(reference); }, [reference]);
  if (selected) return <OrderDetail key={selected.reference} order={selected} onClose={() => { setSelected(null); resource.reload(); }} onSaved={(order) => { setSelected(order); resource.reload(); }} />;
  return <><PageHeading title="Orders" action={<button className="admin-button" onClick={resource.reload}><RefreshCw size={16} />Refresh</button>}>Track requests from confirmation to pickup or delivery.</PageHeading>
    <div className="mb-5 flex flex-wrap gap-3"><SearchBox value={query} onChange={setQuery} label="Search orders" placeholder="Search reference, customer, or phone…" /><select aria-label="Filter order status" value={status} onChange={(e) => setStatus(e.target.value)} className="admin-input sm:!w-48"><option value="">All statuses</option>{Object.entries(ORDER_LABELS).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div>
    <ResourceState resource={resource} empty={resource.data?.items.length === 0}>No orders match this view.</ResourceState>
    {!!resource.data?.items.length && <><div className="admin-panel overflow-x-auto"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Fulfilment</th><th>Status</th><th>Items total</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{resource.data.items.map((order) => <tr key={order.reference}><td><button onClick={() => setSelected(order)} className="min-h-11 text-left font-medium text-primary hover:underline">{order.reference}</button><p className="whitespace-nowrap text-xs text-muted-foreground">{dateLabel(order.created_at)} IST</p></td><td><p className="font-medium">{order.customer.name}</p><p className="mt-1 text-xs text-muted-foreground">{order.customer.phone}</p></td><td>{order.fulfilment.method === 'delivery' ? 'Delivery' : 'Pickup'}</td><td><StatusBadge value={order.status} /></td><td className="whitespace-nowrap font-medium">{formatMoney(order.subtotal_paise)}</td><td><button className="admin-icon-button" onClick={() => setSelected(order)} aria-label={`Open order ${order.reference}`}><ClipboardList size={17} /></button></td></tr>)}</tbody></table></div><Pagination page={page} total={resource.data.total} setPage={setPage} /></>}
  </>;
}
