import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, Eye, Percent, RefreshCw, Sparkles, Tag } from 'lucide-react';
import api from '../lib/api';
import { DEFAULT_PROMO, isPromoActive } from '../lib/promo';
import { ErrorMessage, PageHeading, ResourceState, useResource } from './shared';

const CATEGORIES = [
  { value: 'rewri-gajak', label: 'Rewri & Gajak', defaultLink: '/rewri-gajak-meerut' },
  { value: 'all', label: 'All Website Orders', defaultLink: '/products' },
  { value: 'nankhatai', label: 'Nankhatai Specialities', defaultLink: '/nankhatai-meerut' },
  { value: 'sweets', label: 'Traditional Sweets & Laddoos', defaultLink: '/sweets-meerut' },
  { value: 'bakery', label: 'Bakery & Cakes', defaultLink: '/bakery-meerut' },
  { value: 'gifting', label: 'Gift Hampers', defaultLink: '/gifting' },
];

function toLocalInput(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    // Format YYYY-MM-DDTHH:mm for datetime-local
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

function fromLocalInput(localString) {
  if (!localString) return '';
  try {
    const d = new Date(localString);
    return isNaN(d.getTime()) ? '' : d.toISOString();
  } catch {
    return '';
  }
}

export default function AdminBanner() {
  const resource = useResource('/admin/promo-banner');
  const [form, setForm] = useState(DEFAULT_PROMO);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (resource.data) {
      setForm({
        ...DEFAULT_PROMO,
        ...resource.data,
      });
    }
  }, [resource.data]);

  function handleChange(field, value) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // If category changed and cta_link matches previous category's default, update link automatically
      if (field === 'category') {
        const catObj = CATEGORIES.find((c) => c.value === value);
        if (catObj) {
          next.cta_link = catObj.defaultLink;
        }
      }
      return next;
    });
    setSavedSuccess(false);
  }

  function applyPreset(type) {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const todayStart = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T00:00`;
    const todayEnd = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T23:59`;

    if (type === 'rewri_today') {
      setForm({
        active: true,
        text: 'Shop today and get 10% off on all website orders! 10% off on Rewri & Gajak',
        discount_percent: 10,
        category: 'rewri-gajak',
        cta_text: 'Shop Rewri & Gajak',
        cta_link: '/rewri-gajak-meerut',
        start_date: new Date(todayStart).toISOString(),
        end_date: new Date(todayEnd).toISOString(),
      });
    } else if (type === 'all_weekend') {
      setForm({
        active: true,
        text: 'Weekend Special: Get 10% off on all website orders today!',
        discount_percent: 10,
        category: 'all',
        cta_text: 'Shop All Products',
        cta_link: '/products',
        start_date: '',
        end_date: '',
      });
    } else if (type === 'turn_off') {
      setForm((prev) => ({ ...prev, active: false }));
    }
    setSavedSuccess(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSavedSuccess(false);

    try {
      const payload = {
        active: Boolean(form.active),
        text: form.text.trim(),
        discount_percent: Math.min(100, Math.max(0, Number(form.discount_percent) || 0)),
        category: form.category || 'rewri-gajak',
        cta_text: (form.cta_text || '').trim(),
        cta_link: (form.cta_link || '/rewri-gajak-meerut').trim(),
        start_date: form.start_date || '',
        end_date: form.end_date || '',
      };

      const updated = await api.put('/admin/promo-banner', payload);
      setForm(updated);
      setSavedSuccess(true);
      resource.reload();
    } catch (err) {
      setError(err.message || 'Failed to save banner settings.');
    } finally {
      setSaving(false);
    }
  }

  const currentlyActive = isPromoActive(form);

  return (
    <>
      <PageHeading
        title="Promotional Banner & Offers"
        action={
          <button className="admin-button" onClick={() => resource.reload()}>
            <RefreshCw size={16} /> Refresh
          </button>
        }
      >
        Configure the top announcement banner, discount percentage, category targeting, and automatic start/end schedule.
      </PageHeading>

      <ResourceState resource={resource} />

      <form onSubmit={handleSubmit} className="space-y-6">
        <ErrorMessage>{error}</ErrorMessage>

        {savedSuccess && (
          <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>Banner settings saved successfully! Changes are live on the website.</span>
          </div>
        )}

        {/* Status & Live Preview Card */}
        <section className="admin-panel p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Banner Status</h2>
                <span className={`admin-badge ${currentlyActive ? 'admin-badge-success' : 'admin-badge-muted'}`}>
                  {currentlyActive ? 'Live on Store' : 'Inactive / Expired'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {form.active
                  ? form.end_date
                    ? `Scheduled: Automatically turns off after ${new Date(form.end_date).toLocaleString('en-IN')}`
                    : 'Active: Running continuously'
                  : 'Turned off. Check the box below to activate.'}
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => handleChange('active', e.target.checked)}
                className="h-5 w-5 rounded border-border text-primary accent-primary cursor-pointer"
              />
              <span className="text-sm font-semibold">Enable Banner</span>
            </label>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Quick Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('rewri_today')}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted font-medium transition"
            >
              🎉 Today's Rewri &amp; Gajak 10% Off
            </button>
            <button
              type="button"
              onClick={() => applyPreset('all_weekend')}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted font-medium transition"
            >
              🛍️ 10% Off All Orders
            </button>
            <button
              type="button"
              onClick={() => applyPreset('turn_off')}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted font-medium transition text-destructive"
            >
              Disable
            </button>
          </div>

          {/* Live Preview Preview */}
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
              <Eye size={14} /> Visitor View Preview:
            </p>
            <div className="rounded-xl overflow-hidden border border-border shadow-sm">
              <div className="bg-gradient-to-r from-amber-800 via-primary to-amber-800 text-white px-3 py-2 text-xs sm:text-sm font-medium flex items-center justify-between">
                <div className="hidden sm:block w-6" />
                <div className="flex items-center justify-center gap-2 text-center flex-1">
                  <Sparkles size={14} className="text-secondary shrink-0" />
                  <span className="truncate">{form.text || 'Enter announcement banner text...'}</span>
                  <ArrowRight size={14} className="shrink-0 hidden sm:inline" />
                </div>
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">✕</div>
              </div>
            </div>
          </div>
        </section>

        {/* Configuration Details Card */}
        <section className="admin-panel p-6 space-y-6">
          <h2 className="text-xl font-semibold border-b border-border pb-3">Offer &amp; Discount Configuration</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="banner-text" className="admin-label">
                Announcement Banner Text
              </label>
              <input
                id="banner-text"
                type="text"
                required
                value={form.text}
                onChange={(e) => handleChange('text', e.target.value)}
                placeholder="Shop today and get 10% off on all website orders! 10% off on Rewri & Gajak"
                className="admin-input"
              />
              <p className="text-xs text-muted-foreground mt-1">This text appears in the top announcement bar on every page.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="discount-percent" className="admin-label flex items-center gap-1.5">
                  <Percent size={15} /> Discount Percentage (%)
                </label>
                <input
                  id="discount-percent"
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={form.discount_percent}
                  onChange={(e) => handleChange('discount_percent', Number(e.target.value))}
                  className="admin-input"
                />
                <p className="text-xs text-muted-foreground mt-1">Automatically deducted from eligible items in the cart.</p>
              </div>

              <div>
                <label htmlFor="promo-category" className="admin-label flex items-center gap-1.5">
                  <Tag size={15} /> Applicable Category
                </label>
                <select
                  id="promo-category"
                  value={form.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="admin-input"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Which products receive the discount in the cart.</p>
              </div>
            </div>

            <div>
              <label htmlFor="banner-link" className="admin-label">
                Banner Click Destination (URL path)
              </label>
              <input
                id="banner-link"
                type="text"
                required
                value={form.cta_link}
                onChange={(e) => handleChange('cta_link', e.target.value)}
                placeholder="/rewri-gajak-meerut"
                className="admin-input font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">Where visitors are taken when clicking the top banner.</p>
            </div>
          </div>
        </section>

        {/* Automatic Timing & Schedule Card */}
        <section className="admin-panel p-6 space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock size={19} className="text-primary" /> Automatic Schedule (When to When)
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Set start and end times to automatically show and remove the banner without manual intervention. Leave blank to run continuously.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="schedule-start" className="admin-label">
                Start Date &amp; Time
              </label>
              <input
                id="schedule-start"
                type="datetime-local"
                value={toLocalInput(form.start_date)}
                onChange={(e) => handleChange('start_date', fromLocalInput(e.target.value))}
                className="admin-input"
              />
              <p className="text-xs text-muted-foreground mt-1">Banner starts displaying from this time (leave blank for immediate).</p>
            </div>

            <div>
              <label htmlFor="schedule-end" className="admin-label">
                End Date &amp; Time (Auto-Remove)
              </label>
              <input
                id="schedule-end"
                type="datetime-local"
                value={toLocalInput(form.end_date)}
                onChange={(e) => handleChange('end_date', fromLocalInput(e.target.value))}
                className="admin-input"
              />
              <p className="text-xs text-muted-foreground mt-1">Banner is automatically removed after this time.</p>
            </div>
          </div>

          {(form.start_date || form.end_date) && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>Schedule configured. The website checks this in real-time.</span>
              <button
                type="button"
                onClick={() => {
                  handleChange('start_date', '');
                  handleChange('end_date', '');
                }}
                className="underline hover:text-foreground"
              >
                Clear Schedule
              </button>
            </div>
          )}
        </section>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="submit" disabled={saving} className="admin-primary min-w-36">
            {saving ? 'Saving changes…' : 'Save Banner Settings'}
          </button>
        </div>
      </form>
    </>
  );
}

