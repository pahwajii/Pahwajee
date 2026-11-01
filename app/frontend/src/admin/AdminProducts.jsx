import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, ExternalLink, Image, LoaderCircle, Pencil, Plus, RefreshCw, Save, Upload } from 'lucide-react';
import api from '../lib/api';
import { productDescription } from '../lib/catalogueContent';
import { ErrorMessage, PageHeading, Pagination, ResourceState, SearchBox, useResource } from './shared';

const newProduct = { name: '', slug: '', description: '', category: '', image: '', images: [], price: '', availability: 'Available', tags: [], season: 'all', featured: false, bestseller: false, bestSeller: false, festivalSpecial: false, newArrival: false, order: 0 };
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const productFields = Object.keys(newProduct);
const availabilityOptions = ['Available', 'Sold out', 'Unavailable', 'Special order only'];
const photoTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxPhotoBytes = 3 * 1024 * 1024;

function ProductEditor({ product, categories, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({ ...newProduct, ...product, description: product?.id ? productDescription(product) : '', category: product?.category || categories[0]?.slug || '', bestseller: !!(product?.bestseller || product?.bestSeller) }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoNotice, setPhotoNotice] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const uploadLock = useRef(false);
  const locked = busy || uploading;
  useEffect(() => () => { if (photoPreview) URL.revokeObjectURL(photoPreview); }, [photoPreview]);
  useEffect(() => {
    if (!dirty && !uploading) return;
    const warnBeforeLeaving = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [dirty, uploading]);
  function update(key, value) { setForm((current) => ({ ...current, [key]: value })); setDirty(true); }
  function updatePhoto(value) {
    setForm((current) => ({ ...current, image: value, images: value ? [value, ...(current.images || []).slice(1).filter((image) => image !== value)] : [] }));
    setDirty(true);
  }
  async function uploadPhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || uploadLock.current) return;
    setPhotoError(''); setPhotoNotice('');
    if (!photoTypes.includes(file.type)) { setPhotoError('Choose a JPG, PNG, or WebP photo.'); return; }
    if (file.size > maxPhotoBytes) { setPhotoError('This photo is too large. Choose one under 3 MB.'); return; }
    uploadLock.current = true;
    setUploading(true); setPhotoPreview(URL.createObjectURL(file));
    try {
      const uploaded = await api.upload('/admin/product-images', file);
      updatePhoto(uploaded.url);
      setPhotoNotice('Photo uploaded. Save the product to apply it.');
    } catch (err) { setPhotoError(err.message || 'Photo could not be uploaded. Please try again.'); }
    finally { uploadLock.current = false; setUploading(false); setPhotoPreview(''); }
  }
  async function save(event) {
    event.preventDefault();
    if (locked || uploadLock.current) return;
    setBusy(true); setError('');
    const payload = Object.fromEntries(productFields.map((key) => [key, form[key]]));
    payload.slug = form.slug || slugify(form.name);
    payload.bestSeller = form.bestseller;
    try {
      const saved = product?.id ? await api.put(`/admin/products/${encodeURIComponent(product.id)}`, payload) : await api.post('/admin/products', payload);
      onSaved(saved);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <>
    <button className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground" disabled={locked} onClick={() => dirty ? setConfirmClose(true) : onClose()}><ArrowLeft size={17} />Back to products</button>
    <PageHeading title={product?.id ? 'Edit product' : 'Add a product'}>Changes appear in the storefront after you save.</PageHeading>
    {confirmClose && <div className="admin-panel mb-5 flex flex-wrap items-center gap-3 p-4" role="alert"><p className="mr-auto text-sm">Discard your unsaved changes?</p><button className="admin-button" onClick={() => setConfirmClose(false)}>Keep editing</button><button className="admin-primary" disabled={locked} onClick={onClose}>Discard changes</button></div>}
    <form onSubmit={save} className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="admin-panel space-y-5 p-5 sm:p-7">
        <ErrorMessage>{error}</ErrorMessage>
        <fieldset disabled={locked} className="space-y-5">
          <div><label className="admin-label" htmlFor="product-name">Product name</label><input id="product-name" required maxLength={160} value={form.name} onChange={(e) => update('name', e.target.value)} className="admin-input" /></div>
          <div className="grid gap-5 sm:grid-cols-2"><div><label className="admin-label" htmlFor="product-category">Category</label><select id="product-category" required value={form.category} onChange={(e) => update('category', e.target.value)} className="admin-input"><option value="" disabled>Choose category</option>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></div><div><label className="admin-label" htmlFor="product-availability">Availability</label><select id="product-availability" value={form.availability} onChange={(e) => update('availability', e.target.value)} className="admin-input">{[...new Set([...availabilityOptions, form.availability])].map((value) => <option key={value}>{value}</option>)}</select></div></div>
          <div><label className="admin-label" htmlFor="product-price">Price</label><input id="product-price" maxLength={100} value={form.price || ''} onChange={(e) => update('price', e.target.value)} placeholder="Rs 600/kg" aria-describedby="product-price-help" className="admin-input" /><p id="product-price-help" className="mt-2 text-xs leading-relaxed text-muted-foreground">Use Rs 600/kg, Rs 120/plate, or Rs 100/piece. Weight-based orders offer 500g and 1kg packs. Leave blank for price enquiries.</p></div>
          <div><label className="admin-label" htmlFor="product-description">Description</label><textarea id="product-description" rows={4} maxLength={5000} value={form.description} onChange={(e) => update('description', e.target.value)} className="admin-input resize-y" /></div>
          <div><label className="admin-label" htmlFor="product-slug">Product URL</label><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">/products/</span><input id="product-slug" maxLength={160} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug || ''} onChange={(e) => update('slug', e.target.value)} placeholder={slugify(form.name) || 'product-name'} className="admin-input" /></div><p className="mt-2 text-xs text-muted-foreground">Changing an existing URL will break links to the old address.</p></div>
          <div className="grid gap-5 sm:grid-cols-2"><div><label className="admin-label" htmlFor="product-season">Season</label><select id="product-season" value={form.season} onChange={(e) => update('season', e.target.value)} className="admin-input">{[...new Set(['all', 'summer', 'winter', 'festival', form.season])].map((season) => <option key={season} value={season}>{season === 'all' ? 'All year' : season.charAt(0).toUpperCase() + season.slice(1)}</option>)}</select></div><div><label className="admin-label" htmlFor="product-order">Display order</label><input id="product-order" type="number" step="1" required value={form.order} onChange={(e) => update('order', e.target.value === '' ? '' : Number(e.target.value))} className="admin-input" /><p className="mt-1 text-xs text-muted-foreground">Lower numbers appear first.</p></div></div>
          <div><label className="admin-label" htmlFor="product-tags">Search tags</label><input id="product-tags" value={form.tags.join(', ')} onChange={(e) => update('tags', e.target.value.split(',').map((tag) => tag.trimStart()))} placeholder="sweet, nankhatai" className="admin-input" /></div>
        </fieldset>
      </div>
      <div className="space-y-5">
        <section className="admin-panel space-y-4 p-5" aria-labelledby="photo-heading" aria-busy={uploading}>
          <h2 id="photo-heading" className="font-semibold">Product photo</h2>
          <div className="relative grid aspect-square place-items-center overflow-hidden rounded-xl bg-muted">
            {photoPreview || form.image ? <img key={photoPreview || form.image} src={photoPreview || form.image} alt="Product preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : <Image size={42} className="text-muted-foreground" aria-hidden="true" />}
            {uploading && <div className="absolute inset-0 grid place-items-center bg-card/80"><p role="status" className="flex items-center gap-2 text-sm font-medium"><LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" />Uploading photo...</p></div>}
          </div>
          <label htmlFor="product-photo-file" className="admin-label flex items-center gap-2"><Upload size={17} aria-hidden="true" />Upload a photo</label>
          <input id="product-photo-file" type="file" accept="image/jpeg,image/png,image/webp" disabled={locked} onChange={uploadPhoto} aria-describedby="photo-help" className="block min-h-11 w-full min-w-0 text-sm file:mr-2 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-3 file:text-sm file:font-medium file:text-primary" />
          <p id="photo-help" className="text-xs text-muted-foreground">JPG, PNG, or WebP. Up to 3 MB.</p>
          <ErrorMessage>{photoError}</ErrorMessage>
          {photoNotice && <p role="status" className="text-sm text-emerald-700 dark:text-emerald-300">{photoNotice}</p>}
          <details className="text-sm"><summary className="min-h-11 cursor-pointer py-3 text-muted-foreground">Use an image link instead</summary><label className="mt-2 block"><span className="admin-label">Image path or HTTPS URL</span><input disabled={locked} maxLength={2000} value={form.image} onChange={(e) => { updatePhoto(e.target.value); setPhotoNotice(''); setPhotoError(''); }} placeholder="https://..." className="admin-input" /></label></details>
        </section>
        <fieldset disabled={locked} className="admin-panel space-y-3 p-5"><legend className="sr-only">Product highlights</legend><h2 className="font-semibold">Highlights</h2>{[['bestseller', 'Bestseller'], ['featured', 'Featured'], ['festivalSpecial', 'Festival special'], ['newArrival', 'New arrival']].map(([key, label]) => <label key={key} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={form[key]} onChange={(e) => update(key, e.target.checked)} className="h-5 w-5 accent-[hsl(var(--primary))]" />{label}</label>)}</fieldset>
        <button className="admin-primary w-full" disabled={locked}><Save size={17} />{busy ? 'Saving…' : 'Save product'}</button>
      </div>
    </form>
  </>;
}

function AvailabilityControl({ product, disabled, onSaving, onSaved, onConflict }) {
  const [value, setValue] = useState(product.availability);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const saveLock = useRef(false);
  useEffect(() => { setValue(product.availability); setError(''); }, [product.availability]);
  async function save(event) {
    event.preventDefault();
    if (saveLock.current || disabled || value === product.availability) return;
    saveLock.current = true; setBusy(true); setError(''); onSaving(product.id);
    try {
      const saved = await api.patch(`/admin/products/${encodeURIComponent(product.id)}/availability`, { availability: value, expected_availability: product.availability });
      onSaved(saved);
    } catch (err) {
      setError(err.message);
      if (err.status === 409) onConflict(`${product.name} changed in another session. The catalogue has been refreshed; review its availability before trying again.`);
    } finally { saveLock.current = false; setBusy(false); onSaving(null); }
  }
  return <form onSubmit={save} className="min-w-56 max-w-72">
    <div className="flex items-center gap-2">
      <select aria-label={`Availability for ${product.name}`} value={value} disabled={disabled || busy} onChange={(event) => { setValue(event.target.value); setError(''); }} className="admin-input">
        {[...new Set([...availabilityOptions, product.availability])].map((option) => <option key={option}>{option}</option>)}
      </select>
      <button type="submit" disabled={disabled || busy || value === product.availability} className="admin-button" aria-label={`Save availability for ${product.name}`}>{busy ? <LoaderCircle size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}<span>{busy ? 'Saving' : 'Save'}</span></button>
    </div>
    {error && <p role="alert" className="mt-2 text-xs leading-relaxed text-destructive">{error}</p>}
  </form>;
}

export default function AdminProducts() {
  const products = useResource('/products?limit=500');
  const categories = useResource('/categories');
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [availability, setAvailability] = useState(params.get('availability') || '');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const [listError, setListError] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [updatedProducts, setUpdatedProducts] = useState({});
  useEffect(() => { setUpdatedProducts({}); }, [products.data]);
  const rows = (products.data || []).map((product) => updatedProducts[product.id] || product).filter((product) => (!category || product.category === category) && (!availability || (availability === 'available' ? product.availability === 'Available' : product.availability !== 'Available')) && `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase()));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(rows.length / 20)));
  function availabilitySaved(product) {
    setUpdatedProducts((current) => ({ ...current, [product.id]: product }));
    setListError(''); setNotice(`${product.name}: ${product.availability}.`);
  }
  const categoryNames = Object.fromEntries((categories.data || []).map((item) => [item.slug, item.name]));
  if (editing) return <ProductEditor product={editing} categories={categories.data || []} onClose={() => setEditing(null)} onSaved={(product) => { setEditing(null); setNotice(`${product.name} saved.`); products.reload(); }} />;
  return <><PageHeading title="Products" action={<button className="admin-primary" disabled={!!savingId || !categories.data?.length} onClick={() => { setNotice(''); setEditing({}); }}><Plus size={18} />Add product</button>}>Manage your catalogue, pricing, and availability.</PageHeading>
    {notice && <p role="status" className="mb-5 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300"><Check size={17} />{notice}</p>}
    {listError && <div className="mb-5"><ErrorMessage>{listError}</ErrorMessage></div>}
    {categories.error && <div className="mb-5"><ErrorMessage>{categories.error}</ErrorMessage><button className="admin-button mt-2" onClick={categories.reload}>Reload categories</button></div>}
    <div className="mb-5 flex flex-wrap gap-3"><button className="admin-icon-button" aria-label="Refresh products" title="Refresh products" disabled={!!savingId || products.loading} onClick={() => { setNotice(''); setListError(''); products.reload(); }}><RefreshCw size={17} /></button><SearchBox value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Search products…" label="Search products" /><select aria-label="Filter by category" className="admin-input sm:!w-48" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}><option value="">All categories</option>{(categories.data || []).map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select><select aria-label="Filter by availability" className="admin-input sm:!w-44" value={availability} onChange={(e) => { setAvailability(e.target.value); setPage(1); }}><option value="">All availability</option><option value="available">Available</option><option value="unavailable">Unavailable</option></select></div>
    <ResourceState resource={products} empty={rows.length === 0}>No products match these filters.</ResourceState>
    {!products.loading && !products.error && rows.length > 0 && <><div className="admin-panel overflow-x-auto"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Availability</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{rows.slice((currentPage - 1) * 20, currentPage * 20).map((product) => <tr key={product.id}><td><div className="flex min-w-52 items-center gap-3"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-muted">{product.image && <img src={product.image} alt="" className="h-full w-full object-cover" />}</div><div><p className="font-medium">{product.name}</p>{(product.bestseller || product.bestSeller) && <p className="mt-1 text-xs text-muted-foreground">Bestseller</p>}</div></div></td><td className="text-muted-foreground">{categoryNames[product.category] || product.category}</td><td className="whitespace-nowrap">{product.price || 'On enquiry'}</td><td><AvailabilityControl product={product} disabled={!!savingId} onSaving={setSavingId} onSaved={availabilitySaved} onConflict={(message) => { setNotice(''); setListError(message); products.reload(); }} /></td><td><div className="flex gap-2"><button className="admin-icon-button" aria-label={`Edit ${product.name}`} disabled={!!savingId} onClick={() => { setNotice(''); setEditing(product); }}><Pencil size={16} /></button><a href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer" className="admin-icon-button" aria-label={`View ${product.name} in storefront`}><ExternalLink size={16} /></a></div></td></tr>)}</tbody></table></div><Pagination page={currentPage} total={rows.length} setPage={setPage} /></>}
  </>;
}
