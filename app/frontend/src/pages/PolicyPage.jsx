import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { BUSINESS, telLink } from '../lib/api';
import { policy, policyPages } from '../lib/policies';

export default function PolicyPage({ page }) {
  const content = policyPages[page];
  return <div className="noise-bg pb-12 pt-8">
    <SEO title={content.title + ' | PAHWAJEE Meerut'} description={content.description} />
    <article className="container-x max-w-4xl">
      <h1 className="text-3xl sm:text-5xl font-serif leading-tight">{content.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{policy.businessName} · Updated {policy.updated}</p>
      <nav aria-label="Store policies" className="my-5 flex flex-wrap gap-x-5 text-sm font-semibold text-primary dark:text-secondary">
        {Object.entries(policyPages).filter(([slug]) => slug !== page).map(([slug,item]) => <Link key={slug} to={'/' + slug} className="inline-flex min-h-11 items-center underline underline-offset-4">{item.title}</Link>)}
      </nav>
      <div className="space-y-7">{content.sections.map(section => <section key={section.heading}>
        <h2 className="text-xl sm:text-2xl font-serif mb-3">{section.heading}</h2>
        {section.paragraphs.map(text => <p key={text} className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">{text}</p>)}
        {section.links && <div className="mt-2 flex flex-wrap gap-x-5">{section.links.map(link => <Link key={link.to} to={link.to} className="inline-flex min-h-11 items-center text-sm font-semibold text-primary dark:text-secondary underline underline-offset-4">{link.label}</Link>)}</div>}
      </section>)}</div>
      <section className="mt-8 rounded-2xl border border-border bg-card p-4 sm:p-6" aria-labelledby="policy-contact">
        <h2 id="policy-contact" className="text-2xl font-serif">Customer support</h2>
        <p className="mt-2 text-sm">{policy.businessName} · {BUSINESS.outlets[0].address}</p>
        <div className="mt-2 flex flex-wrap gap-x-5 text-sm font-semibold text-primary dark:text-secondary">
          <a href={'mailto:' + policy.email} className="inline-flex min-h-11 items-center break-all underline">{policy.email}</a>
          {BUSINESS.outlets[0].phones.map(phone => <a key={phone} href={telLink(phone)} className="inline-flex min-h-11 items-center underline">{phone}</a>)}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{BUSINESS.hours}</p>
      </section>
    </article>
  </div>;
}
