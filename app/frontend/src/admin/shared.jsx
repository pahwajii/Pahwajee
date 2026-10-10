import { useEffect, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Inbox, LoaderCircle, Search } from 'lucide-react';
import api from '../lib/api';

export const ORDER_LABELS = { requested: 'New request', confirmed: 'Confirmed', preparing: 'Preparing', ready: 'Ready', completed: 'Completed', cancelled: 'Cancelled' };
export const INQUIRY_LABELS = { new: 'New', contacted: 'Contacted', closed: 'Closed' };
export const NEXT_STATUS = { requested: ['confirmed', 'cancelled'], confirmed: ['preparing', 'cancelled'], preparing: ['ready', 'cancelled'], ready: ['completed', 'cancelled'], completed: [], cancelled: [] };
export const dateLabel = (value) => value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date(value)) : '—';

export function useResource(path) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ data: null, loading: true, error: '' });
    api.get(path).then((data) => { if (active) setState({ data, loading: false, error: '' }); })
      .catch((error) => { if (active) setState({ data: null, loading: false, error: error.message }); });
    return () => { active = false; };
  }, [path, version]);
  return { ...state, reload: () => setVersion((value) => value + 1) };
}

export function StatusBadge({ value, labels = ORDER_LABELS }) {
  const tone = ['completed', 'closed', 'Available'].includes(value) ? 'success' : ['cancelled', 'Sold out', 'Unavailable'].includes(value) ? 'muted' : ['requested', 'new'].includes(value) ? 'attention' : 'neutral';
  return <span className={`admin-badge admin-badge-${tone}`}>{labels[value] || value}</span>;
}

export function PageHeading({ title, children, action }) {
  return <div className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl sm:text-4xl">{title}</h1>{children && <p className="mt-2 text-sm text-muted-foreground">{children}</p>}</div>{action}</div>;
}

export function ErrorMessage({ children }) {
  return children ? <div role="alert" className="admin-error"><AlertCircle size={18} className="shrink-0" /><span>{children}</span></div> : null;
}

export function ResourceState({ resource, empty, children }) {
  if (resource.loading) return <div role="status" className="admin-empty"><LoaderCircle className="animate-spin" size={24} />Loading…</div>;
  if (resource.error) return <div className="admin-panel p-6"><ErrorMessage>{resource.error}</ErrorMessage><button onClick={resource.reload} className="admin-button mt-4">Try again</button></div>;
  if (empty) return <div className="admin-panel admin-empty"><Inbox size={30} /><p>{children || 'Nothing here yet.'}</p></div>;
  return null;
}

export function SearchBox({ value, onChange, placeholder = 'Search', label = 'Search' }) {
  return <label className="relative block min-w-0 flex-1"><span className="sr-only">{label}</span><Search size={18} className="pointer-events-none absolute left-3 top-3.5 text-muted-foreground" /><input type="search" maxLength={100} value={value} onChange={(event) => onChange(event.target.value)} className="admin-input !pl-10" placeholder={placeholder} /></label>;
}

export function Pagination({ page, total, setPage, limit = 20 }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  return <div className="mt-5 flex items-center justify-between gap-3 text-sm text-muted-foreground"><span>{total} result{total === 1 ? '' : 's'} · Page {page} of {pages}</span><div className="flex gap-2"><button className="admin-icon-button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={18} /></button><button className="admin-icon-button" aria-label="Next page" disabled={page >= pages} onClick={() => setPage(page + 1)}><ChevronRight size={18} /></button></div></div>;
}

export function useInbox(path) {
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  useEffect(() => { const timer = setTimeout(() => { setSearch(query); setPage(1); }, 300); return () => clearTimeout(timer); }, [query]);
  const resource = useResource(`${path}?${new URLSearchParams({ q: search, page, ...(status ? { status } : {}) })}`);
  return { resource, query, setQuery, status, setStatus: (value) => { setStatus(value); setPage(1); }, page, setPage };
}
