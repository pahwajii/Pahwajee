import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, LoaderCircle, Send } from 'lucide-react';
import api, { telLink, waLink } from '../lib/api';
import { bulkInquiryPayload, emptyBulkInquiry, inquirySubmissionKey, validateBulkInquiry } from '../lib/inquiry';

const fields = {
  name: 'Your name', company: 'Company / organisation', phone: 'Mobile number', email: 'Email',
  quantity: 'Number of hampers', budget: 'Budget per hamper (INR)', required_date: 'Required date', message: 'Gifting requirements',
};

export default function BulkInquiryForm() {
  const [form, setForm] = useState({ ...emptyBulkInquiry });
  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);
  const feedback = useRef(null);
  const busy = useRef(false);
  const attempt = useRef(null);
  useEffect(() => { if (status === 'error' || status === 'success') feedback.current?.focus(); }, [status, errors]);

  function change(event) {
    const { name, value } = event.target;
    if (status === 'error') setStatus('idle');
    setForm(current => ({ ...current, [name]: value }));
    setErrors(current => { const next = { ...current }; delete next[name]; return next; });
  }

  async function submit(event) {
    event.preventDefault();
    if (busy.current) return;
    const invalid = validateBulkInquiry(form);
    setErrors(invalid); setError('');
    if (Object.keys(invalid).length) { setStatus('error'); return; }
    busy.current = true; setStatus('sending');
    try {
      const payload = bulkInquiryPayload(form);
      const fingerprint = JSON.stringify(payload);
      if (attempt.current?.fingerprint !== fingerprint) attempt.current = { fingerprint, key: await inquirySubmissionKey(payload) };
      const saved = await api.post('/inquiries', { ...payload, idempotency_key: attempt.current.key });
      setReceipt(saved); setStatus('success');
    } catch (err) {
      if (Array.isArray(err.detail)) {
        const validation = {};
        for (const issue of err.detail) {
          const field = issue.loc?.at(-1);
          if (fields[field]) validation[field] = issue.msg.replace(/^Value error, /, '');
        }
        setErrors(validation);
        setError(Object.keys(validation).length ? '' : 'Please check your details and try again.');
      } else setError(err.status ? err.message : 'We could not confirm submission. Please retry with the same details.');
      setStatus('error');
    } finally { busy.current = false; }
  }

  function field(name, props = {}) {
    const { required = false, multiline = false, ...inputProps } = props;
    const Tag = multiline ? 'textarea' : 'input';
    return <div className="min-w-0">
      <label htmlFor={`bulk-${name}`} className="mb-1.5 block text-sm font-medium text-foreground">{fields[name]}{required ? <span aria-hidden="true"> *</span> : <span className="text-muted-foreground"> (optional)</span>}</label>
      <Tag id={`bulk-${name}`} name={name} value={form[name]} onChange={change} required={required}
        aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `bulk-${name}-error` : undefined}
        className={`quote-input w-full min-w-0 rounded-xl border bg-background text-foreground px-3 py-2.5 text-base leading-6 placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60 ${errors[name] ? 'border-destructive' : 'border-border'} ${multiline ? 'min-h-28 resize-y' : 'min-h-11'}`}
        {...inputProps} />
      {errors[name] && <p id={`bulk-${name}-error`} className="mt-1 text-sm text-red-700 dark:text-red-300">{errors[name]}</p>}
    </div>;
  }

  return <section id="bulk-gifting" aria-labelledby="bulk-gifting-title" className="scroll-mt-28 mx-auto my-10 max-w-2xl rounded-2xl border border-border bg-card p-4 sm:p-6">
    <h2 id="bulk-gifting-title" className="text-2xl sm:text-3xl font-serif text-foreground">Request a Bulk Gifting Quote</h2>
    <p className="mt-2 mb-5 text-sm leading-relaxed text-muted-foreground">Share your quantity, budget and date. Our team will confirm the contents, availability and final quote.</p>
    {status === 'success' ? <div ref={feedback} tabIndex={-1} role="status" className="rounded-xl border border-emerald-600/40 bg-emerald-50 p-4 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200 focus-visible:outline focus-visible:outline-2">
      <div className="flex items-center gap-2 font-semibold"><CheckCircle2 size={20} aria-hidden="true" />Quote request received</div>
      <p className="mt-2 text-sm">Reference: <strong className="break-all">{receipt.reference}</strong></p>
      <p className="mt-2 text-sm">{receipt.email_status === 'sent' ? 'Your request has been emailed to our shop. We will contact you using the details you provided.' : receipt.email_status === 'failed' ? 'Your enquiry is saved, but the email notification could not be delivered. Please call the shop and share your reference.' : 'Your enquiry is saved. The email notification is queued; you do not need to submit it again.'}</p>
      <p className="mt-2 text-sm">For a time-sensitive request, <a href={telLink()} className="underline font-semibold">call the shop</a> and share this reference.</p>
      <button type="button" className="mt-3 min-h-11 text-sm font-semibold underline" onClick={() => { setForm({ ...emptyBulkInquiry }); setReceipt(null); attempt.current = null; try { sessionStorage.removeItem('pahwa-bulk-request'); } catch {} setStatus('idle'); }}>Send another enquiry</button>
    </div> : <form onSubmit={submit} noValidate aria-busy={status === 'sending'}>
      {status === 'error' && <div ref={feedback} tabIndex={-1} role="alert" className="mb-4 rounded-xl border border-red-600/40 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/30 dark:text-red-200 focus-visible:outline focus-visible:outline-2">
        <p className="flex items-center gap-2 font-semibold"><AlertCircle size={18} aria-hidden="true" />{error || 'Please check the highlighted fields.'}</p>
        {Object.keys(errors).length > 0 && <ul className="mt-2 list-disc pl-5">{Object.entries(errors).map(([name, text]) => <li key={name}><a className="underline" href={`#bulk-${name}`}>{text}</a></li>)}</ul>}
        {error && <p className="mt-2">Your details are still here. Retry, <a href={waLink('Bulk gifting quote')} target="_blank" rel="noopener noreferrer" className="underline">contact us on WhatsApp</a> or <a href={telLink()} className="underline">call the shop</a>.</p>}
      </div>}
      <fieldset disabled={status === 'sending'} className="grid min-w-0 gap-4 sm:grid-cols-2">
        {field('name', { required: true, autoComplete: 'name', maxLength: 100, placeholder: 'Contact person' })}
        {field('company', { autoComplete: 'organization', maxLength: 120, placeholder: 'Company or event name' })}
        {field('phone', { required: true, type: 'tel', inputMode: 'tel', autoComplete: 'tel', maxLength: 24, placeholder: '10-digit mobile number' })}
        {field('quantity', { required: true, type: 'number', inputMode: 'numeric', min: 1, max: 100000, step: 1, placeholder: 'e.g. 25' })}
        {field('budget', { maxLength: 120, placeholder: 'e.g. 500 to 1,000' })}
        {field('required_date', { type: 'date' })}
        <div className="sm:col-span-2">{field('email', { type: 'email', autoComplete: 'email', maxLength: 254, placeholder: 'For a reply by email' })}</div>
        <div className="sm:col-span-2">{field('message', { required: true, multiline: true, rows: 3, maxLength: 3000, placeholder: 'Preferred sweets, hamper design, branding and delivery location' })}</div>
      </fieldset>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">* Required. We use your details to respond to this enquiry. <Link to="/privacy-policy" className="underline">Privacy policy</Link></p>
      <button type="submit" disabled={status === 'sending'} className="btn-primary mt-4 w-full justify-center !rounded-xl !px-4 !py-3 text-sm disabled:cursor-wait disabled:opacity-70">
        {status === 'sending' ? <><LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />Sending request...</> : <><Send size={18} aria-hidden="true" />Request quote</>}
      </button>
    </form>}
  </section>;
}
