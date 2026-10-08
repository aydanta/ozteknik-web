import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import JsonLd from '@/components/JsonLd';
import Icon from '@/components/Icon';
import LeadForm from '@/components/forms/LeadForm';
import { href, type Locale } from '@/lib/i18n';
import { baseMeta, webPageNode, abs, ORG_ID } from '@/lib/seo';
import { pageGraph } from '@/lib/graph';
import { company, telHref, waHref } from '@/lib/site';
import { regions } from '@/lib/leads';
import { contactFields, formText } from '@/lib/forms';
import { getDict } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }>; searchParams: Promise<{ number?: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return baseMeta({ lang, title: t.contact.title, description: t.contact.lead, path: (l) => href(l, 'contact') });
}
export default async function Contact({ params, searchParams }: P) {
  const { lang } = await params;
  const { number } = await searchParams;
  const t = getDict(lang);
  const c = company();
  const desks = regions().filter((r) => r.email && r.email !== c.email);
  return (
    <>
      <JsonLd data={pageGraph(lang, [webPageNode({ url: abs(href(lang, 'contact')), name: t.contact.title, description: t.contact.lead, lang, type: 'ContactPage', about: ORG_ID })])} />
      <PageHero photo="aerial" title={t.contact.title} lead={t.contact.lead} crumbs={[{ name: t.common.home, href: `/${lang}/` }, { name: t.contact.title }]} />
      <section className="wrap section-sm split">
        <div className="stack" style={{ gap: 28 }}>
          <div className="card stack">
            <h2 className="h3">{t.contact.hq}</h2>
            <address className="footer-nap" style={{ fontSize: 16 }}>
              <strong style={{ color: 'var(--text)' }}>{c.legalName}</strong>
              <span>
                {c.address}
                <br />
                {c.postalCode} {c.city} / {c.region}, Türkiye
              </span>
            </address>
            <ul className="doc-list">
              <li>
                <span>
                  <Icon name="phone" size={16} /> {t.contact.phone}
                </span>
                <a href={telHref(c.phone)}>{c.phone}</a>
              </li>
              {c.fax && (
                <li>
                  <span>{t.contact.fax}</span>
                  <span>{c.fax}</span>
                </li>
              )}
              <li>
                <span>
                  <Icon name="mail" size={16} /> {t.contact.email}
                </span>
                <a href={`mailto:${c.email}`}>{c.email}</a>
              </li>
              {c.whatsapp && (
                <li>
                  <span>
                    <Icon name="whatsapp" size={16} /> {t.contact.whatsapp}
                  </span>
                  <a href={waHref(c.whatsapp, '')}>{c.whatsapp}</a>
                </li>
              )}
            </ul>
            <a className="btn" href={c.mapsUrl} target="_blank" rel="noopener">
              <Icon name="pin" size={16} /> {t.contact.map}
            </a>
          </div>
          {desks.length > 0 && (
            <div className="stack">
              <h2 className="h3">{t.contact.regions}</h2>
              <ul className="doc-list">
                {desks.map((r) => (
                  <li key={r.key}>
                    <span>{r.name}</span>
                    <a href={`mailto:${r.email}`}>{r.email}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="card stack">
          <h2 className="h2">{number ? t.search.sendNumber : t.contact.formTitle}</h2>
          <LeadForm
            type={number ? 'notfound' : 'contact'}
            lang={lang}
            t={formText(lang)}
            hidden={number ? { number: number.slice(0, 60) } : {}}
            fields={[
              ...(number ? [{ name: 'number', label: 'OE / Ref.', kind: 'text' as const, required: true, defaultValue: number.slice(0, 60), span: 2 as const }] : []),
              ...contactFields(lang, { company: true }).map((f) => (f.name === 'company' || f.name === 'country' ? { ...f, required: !!number } : f)),
            ]}
          />
        </div>
      </section>
    </>
  );
}
