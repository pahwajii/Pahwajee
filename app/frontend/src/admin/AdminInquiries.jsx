import { useState } from 'react';
import { ArrowLeft, Check, MessageSquare, RefreshCw, Save } from 'lucide-react';
import api from '../lib/api';
import { ErrorMessage, INQUIRY_LABELS, PageHeading, Pagination, ResourceState, SearchBox, StatusBadge, dateLabel, useInbox } from './shared';

function InquiryDetail({ inquiry, onClose, onSaved }) {
  const [status, setStatus] = useState(inquiry.status);
  const [notes, setNotes] = useState(inquiry.internal_notes || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [discard, setDiscard] = useState(false);
  const dirty = status !== inquiry.status || notes !== (inquiry.internal_notes || '');
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setSaved(false);
    try { onSaved(await api.patch(`/admin/inquiries/${encodeURIComponent(inquiry.id)}`, { status, expected_status: inquiry.status, internal_notes: notes })); setSaved(true); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <><button className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground" disabled={busy} onClick={() => dirty ? setDiscard(true) : onClose()}><ArrowLeft size={17} />Back to enquiries</button>
    {discard && <div className="admin-panel mb-5 flex flex-wrap items-center gap-3 p-4" role="alert"><span className="mr-auto text-sm">Discard unsaved changes?</span><button className="admin-button" onClick={() => setDiscard(false)}>Keep editing</button><button className="admin-primary" onClick={onClose}>Discard changes</button></div>}
    <PageHeading title={inquiry.name} action={<StatusBadge value={inquiry.status} labels={INQUIRY_LABELS} />}>Received {dateLabel(inquiry.created_at)} IST</PageHeading>
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"><section className="admin-panel p-6"><h2 className="text-lg font-semibold">{inquiry.product || 'General enquiry'}</h2><p className="mt-5 whitespace-pre-wrap break-words text-sm leading-7">{inquiry.message}</p><div className="mt-7 space-y-3 border-t border-border pt-5"><p className="text-xs text-muted-foreground">Contact details</p><a className="block break-all text-sm text-primary underline" href={`tel:${inquiry.phone.replace(/[^+\d]/g, '')}`}>{inquiry.phone}</a>{inquiry.email && <p className="break-all text-sm">{inquiry.email}</p>}</div></section>
      <form className="admin-panel space-y-5 p-5" onSubmit={submit}><h2 className="text-lg font-semibold">Follow-up</h2><ErrorMessage>{error}</ErrorMessage>{saved && <p role="status" className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300"><Check size={17} />Enquiry updated.</p>}<div><label className="admin-label" htmlFor="inquiry-status">Enquiry status</label><select id="inquiry-status" disabled={busy} className="admin-input" value={status} onChange={(e) => { setStatus(e.target.value); setSaved(false); }}>{Object.entries(INQUIRY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div><div><label className="admin-label" htmlFor="inquiry-notes">Internal notes</label><textarea id="inquiry-notes" disabled={busy} rows={6} maxLength={2000} value={notes} onChange={(e) => { setNotes(e.target.value); setSaved(false); }} className="admin-input resize-y" placeholder="Quote discussed, callback time, or next steps…" /><p className="mt-2 text-xs text-muted-foreground">Visible only to admins. Saving does not contact the customer.</p></div><button className="admin-primary w-full" disabled={busy || !dirty}><Save size={17} />{busy ? 'Saving…' : 'Save changes'}</button></form>
    </div>
  </>;
}

export default function AdminInquiries() {
  const { resource, query, setQuery, status, setStatus, page, setPage } = useInbox('/admin/inquiry-inbox');
  const [selected, setSelected] = useState(null);
  if (selected) return <InquiryDetail key={selected.id} inquiry={selected} onClose={() => { setSelected(null); resource.reload(); }} onSaved={(inquiry) => { setSelected(inquiry); resource.reload(); }} />;
  return <><PageHeading title="Enquiries" action={<button className="admin-button" onClick={resource.reload}><RefreshCw size={16} />Refresh</button>}>Customer questions and corporate gifting requests, in one inbox.</PageHeading>
    <div className="mb-5 flex flex-wrap gap-3"><SearchBox value={query} onChange={setQuery} label="Search enquiries" placeholder="Search name, phone, or message…" /><select aria-label="Filter enquiry status" value={status} onChange={(e) => setStatus(e.target.value)} className="admin-input sm:!w-48"><option value="">All statuses</option>{Object.entries(INQUIRY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
    <ResourceState resource={resource} empty={resource.data?.items.length === 0}>No enquiries match this view.</ResourceState>
    {!!resource.data?.items.length && <><div className="admin-panel overflow-x-auto"><table className="admin-table"><thead><tr><th>Customer</th><th>Enquiry</th><th>Status</th><th>Received (IST)</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{resource.data.items.map((inquiry) => <tr key={inquiry.id}><td><button onClick={() => setSelected(inquiry)} className="min-h-11 text-left font-medium text-primary hover:underline">{inquiry.name}</button><p className="text-xs text-muted-foreground">{inquiry.phone}</p></td><td className="max-w-xs"><p className="font-medium">{inquiry.product || 'General enquiry'}</p><p className="mt-1 truncate text-xs text-muted-foreground">{inquiry.message}</p></td><td><StatusBadge value={inquiry.status} labels={INQUIRY_LABELS} /></td><td className="whitespace-nowrap text-xs text-muted-foreground">{dateLabel(inquiry.created_at)}</td><td><button className="admin-icon-button" aria-label={`Open enquiry from ${inquiry.name}`} onClick={() => setSelected(inquiry)}><MessageSquare size={17} /></button></td></tr>)}</tbody></table></div><Pagination page={page} total={resource.data.total} setPage={setPage} /></>}
  </>;
}
