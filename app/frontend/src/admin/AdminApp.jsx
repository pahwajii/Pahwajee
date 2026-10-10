import { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { ArrowRight, ClipboardList, ExternalLink, LayoutDashboard, LockKeyhole, LogOut, MessageSquare, Package, RefreshCw } from 'lucide-react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { formatMoney } from '../lib/cart';
import { ErrorMessage, PageHeading, ResourceState, StatusBadge, dateLabel, useResource } from './shared';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminInquiries from './AdminInquiries';
import './admin.css';
import BrandLogo from '../components/BrandLogo';

function AdminMetadata() {
  useEffect(() => {
    const title = document.title;
    document.title = 'Shop Admin | PAHWA JEE';
    let robots = document.querySelector('meta[name="robots"]');
    const previous = robots?.content;
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
    robots.content = 'noindex, nofollow';
    return () => { document.title = title; if (previous === undefined) robots.remove(); else robots.content = previous; };
  }, []);
  return null;
}

function Login() {
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (loading) return <ResourceState resource={{ loading: true }} />;
  if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await login(email, password); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <main className="grid min-h-screen place-items-center p-5">
    <div className="w-full max-w-md">
      <Link to="/" className="mb-8 flex justify-center"><BrandLogo alt="PAHWA JEE home" className="h-16 w-auto" /></Link>
      <section className="admin-panel p-7 sm:p-9">
        <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><LockKeyhole size={23} /></div>
        <h1 className="text-3xl font-semibold">Welcome back.</h1><p className="mt-2 text-sm text-muted-foreground">Sign in to manage your shop.</p>
        <form onSubmit={submit} className="mt-7 space-y-5">
          <ErrorMessage>{error}</ErrorMessage>
          <div><label className="admin-label" htmlFor="admin-email">Email address</label><input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="admin-input" disabled={busy} /></div>
          <div><label className="admin-label" htmlFor="admin-password">Password</label><input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="admin-input" disabled={busy} /></div>
          <button disabled={busy} className="admin-primary w-full">{busy ? 'Signing in…' : 'Sign in'}<ArrowRight size={18} /></button>
        </form>
      </section><Link to="/" className="mt-6 block py-2 text-center text-sm text-muted-foreground hover:text-primary">Back to storefront</Link>
    </div>
  </main>;
}

const sections = [
  { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
];

function Shell() {
  const { user, loading, error, checkSession, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  if (loading || error) return <main className="mx-auto max-w-xl p-8"><ResourceState resource={{ loading, error, reload: checkSession }} /></main>;
  if (!user || user.role !== 'admin') return <Navigate to="/admin/login" replace />;
  async function signOut() {
    setSigningOut(true); setLogoutError('');
    try { await logout(); } catch (err) { setLogoutError(err.message); } finally { setSigningOut(false); }
  }
  return <div className="lg:grid lg:min-h-screen lg:grid-cols-[230px_minmax(0,1fr)]">
    <a href="#admin-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-card focus:p-3">Skip to content</a>
    <aside className="border-b border-border bg-card lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between px-5 py-5 lg:block lg:px-7 lg:py-8"><Link to="/admin/dashboard" aria-label="Admin overview"><BrandLogo className="h-12 w-auto" /></Link><span className="text-xs text-muted-foreground lg:mt-3 lg:block">Shop administration</span></div>
      <nav aria-label="Admin navigation" className="grid grid-cols-4 gap-1 px-3 pb-4 lg:block lg:space-y-2 lg:px-4">{sections.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 text-xs font-medium sm:flex-row sm:gap-3 sm:text-sm lg:justify-start lg:px-4 ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon size={19} />{label}</NavLink>)}</nav>
      <div className="hidden lg:mt-auto lg:block lg:p-6"><p className="text-sm font-medium">PAHWA JEE</p><p className="mt-1 text-xs text-muted-foreground">Abu Lane, Meerut</p><Link to="/" className="mt-5 flex min-h-11 items-center gap-2 text-sm text-primary">View storefront<ExternalLink size={15} /></Link></div>
    </aside>
    <div className="min-w-0">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-8"><p className="min-w-0 truncate text-sm text-muted-foreground">{user.name || user.email}</p><div className="flex gap-3"><div className="lg:hidden"><Link to="/" className="admin-button"><ExternalLink size={16} />Store</Link></div><button className="admin-button" disabled={signingOut} onClick={signOut}><LogOut size={16} />{signingOut ? 'Signing out…' : 'Sign out'}</button></div></header>
      <main id="admin-content" className="mx-auto max-w-[1500px] p-5 sm:p-8 xl:p-10"><ErrorMessage>{logoutError}</ErrorMessage><Outlet /></main>
    </div>
  </div>;
}

function Overview() {
  const stats = useResource('/admin/overview');
  const recent = useResource('/admin/order-inbox?limit=5');
  const cards = [
    { label: 'Open orders', value: stats.data?.open_orders, icon: ClipboardList, to: '/admin/orders', hint: 'Requests through ready' },
    { label: 'New enquiries', value: stats.data?.new_inquiries, icon: MessageSquare, to: '/admin/enquiries', hint: 'Waiting for a response' },
    { label: 'Products', value: stats.data?.products, icon: Package, to: '/admin/products', hint: 'In your catalogue' },
    { label: 'Unavailable', value: stats.data?.unavailable_products, icon: Package, to: '/admin/products?availability=unavailable', hint: 'Review availability' },
  ];
  return <><PageHeading title="Your shop, at a glance." action={<button className="admin-button" onClick={() => { stats.reload(); recent.reload(); }}><RefreshCw size={16} />Refresh</button>}>Manage what’s on the shelf and what needs your attention.</PageHeading>
    <ResourceState resource={stats} />
    {stats.data && <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon, to, hint }) => <Link to={to} key={label} className="admin-panel p-5 transition-colors hover:border-primary/40"><div className="flex items-center justify-between text-muted-foreground"><span className="text-sm">{label}</span><Icon size={19} /></div><p className="mt-5 text-4xl font-semibold tabular-nums">{value}</p><p className="mt-2 text-xs text-muted-foreground">{hint}</p></Link>)}</div>}
    <section className="admin-panel overflow-hidden"><div className="flex items-center justify-between gap-3 p-5"><h2 className="text-lg font-semibold">Recent orders</h2><Link to="/admin/orders" className="flex min-h-11 items-center gap-2 text-sm font-medium text-primary">View all<ArrowRight size={16} /></Link></div>
      <ResourceState resource={recent} empty={recent.data?.items.length === 0}>New order requests will appear here.</ResourceState>
      {!!recent.data?.items.length && <div className="overflow-x-auto"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Items total</th><th>Received (IST)</th></tr></thead><tbody>{recent.data.items.map((order) => <tr key={order.reference}><td><Link to={`/admin/orders?order=${encodeURIComponent(order.reference)}`} className="font-medium text-primary underline-offset-4 hover:underline">{order.reference}</Link></td><td>{order.customer.name}</td><td><StatusBadge value={order.status} /></td><td className="whitespace-nowrap">{formatMoney(order.subtotal_paise)}</td><td className="whitespace-nowrap text-muted-foreground">{dateLabel(order.created_at)}</td></tr>)}</tbody></table></div>}
    </section>
    <div className="mt-6 grid gap-4 md:grid-cols-2"><Link to="/admin/products" className="admin-panel flex items-center gap-4 p-5"><Package size={23} className="text-primary" /><div><h2 className="font-semibold">Keep your catalogue fresh</h2><p className="mt-1 text-sm text-muted-foreground">Update prices, photos, and availability.</p></div><ArrowRight size={18} className="ml-auto shrink-0" /></Link><Link to="/admin/enquiries" className="admin-panel flex items-center gap-4 p-5"><MessageSquare size={23} className="text-primary" /><div><h2 className="font-semibold">Follow up with customers</h2><p className="mt-1 text-sm text-muted-foreground">Contact requests and corporate gifting.</p></div><ArrowRight size={18} className="ml-auto shrink-0" /></Link></div>
  </>;
}

export default function AdminApp() {
  return <AuthProvider><div className="admin-app"><AdminMetadata /><Routes><Route path="login" element={<Login />} /><Route element={<Shell />}><Route index element={<Navigate to="dashboard" replace />} /><Route path="dashboard" element={<Overview />} /><Route path="products" element={<AdminProducts />} /><Route path="orders" element={<AdminOrders />} /><Route path="enquiries" element={<AdminInquiries />} /><Route path="*" element={<Navigate to="/admin/dashboard" replace />} /></Route></Routes></div></AuthProvider>;
}
