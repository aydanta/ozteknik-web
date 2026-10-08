import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import Photo from '@/components/Photo';
import JsonLd from '@/components/JsonLd';
import LeadForm from '@/components/forms/LeadForm';
import { href, type Locale } from '@/lib/i18n';
import { baseMeta, webPageNode, abs } from '@/lib/seo';
import { pageGraph } from '@/lib/graph';
import { contactFields, formText } from '@/lib/forms';
import { BRANDS } from '@/lib/catalog';
import { getDict } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return baseMeta({ lang, title: t.distributors.title, description: t.distributors.lead, path: (l) => href(l, 'distributors') });
}
export default async function DistributorPage({ params }: P) {
  const { lang } = await params;
  const t = getDict(lang);
  const d = t.distributors;
  const base = contactFields(lang, { message: false });
  return (
    <>
      <JsonLd data={pageGraph(lang, [webPageNode({ url: abs(href(lang, 'distributors')), name: d.title, description: d.lead, lang })])} />
      <PageHero photo="logistics" eyebrow={d.eyebrow} title={d.title} lead={d.lead} crumbs={[{ name: t.common.home, href: `/${lang}/` }, { name: d.title }]}>
        <div className="row">
          <a className="btn btn--primary btn--lg" href="#apply">
            {d.submit} →
          </a>
        </div>
      </PageHero>
      <section className="wrap section-sm">
        <h2 className="h1" style={{ marginBottom: 24 }}>
          {d.benefitsTitle}
        </h2>
        <div className="feature-list">
          {d.benefits.map((b) => (
            <div key={b.t}>
              <h3>{b.t}</h3>
              <p>{b.d}</p>
            </div>
          ))}
        </div>
        <div className="photo-strip reveal" style={{ marginTop: 32 }}>
          <Photo k="production" alt={t.photo.production} sizes="(max-width: 900px) 50vw, 25vw" />
          <Photo k="testbench" alt={t.photo.testbench} sizes="(max-width: 900px) 50vw, 25vw" />
          <Photo k="packing" alt={t.photo.packing} sizes="(max-width: 900px) 50vw, 25vw" />
          <Photo k="aerial" alt={t.photo.aerial} sizes="(max-width: 900px) 50vw, 25vw" />
        </div>
      </section>
      <section className="wrap section-sm split">
        <div className="stack">
          <h2 className="h1">{d.termsTitle}</h2>
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {d.terms.map((x) => (
                  <tr key={x.t}>
                    <th scope="row" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 14, color: 'var(--text)' }}>
                      {x.t}
                    </th>
                    <td className="muted">{x.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="stack">
          <h2 className="h1">{d.stepsTitle}</h2>
          <ol className="steps steps--2">
            {d.steps.map((s) => (
              <li key={s.t}>
                <strong>{s.t}</strong>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section id="apply" className="wrap-narrow section-sm">
        <div className="card stack">
          <h2 className="h1">{d.formTitle}</h2>
          <LeadForm
            type="distributor"
            lang={lang}
            event="distributor_apply"
            t={formText(lang, d.submit)}
            fields={[
              ...base,
              { name: 'website', label: t.forms.website, kind: 'url', placeholder: 'https://' },
              {
                name: 'volume',
                label: t.forms.volume,
                kind: 'select',
                options: ['< 50 000', '50 000 – 250 000', '250 000 – 1 000 000', '> 1 000 000'].map((v) => ({ value: v, label: `€ ${v}` })),
              },
              { name: 'lines', label: t.forms.lines, kind: 'chips', required: true, options: (['egerot', 'hydcab', 'revol'] as const).map((b) => ({ value: b, label: `${BRANDS[b].name} — ${BRANDS[b].line[lang]}` })) },
              { name: 'brandsCarried', label: t.forms.brandsCarried, kind: 'text', span: 2, placeholder: 'febi, DT, Sachs, …' },
              { name: 'message', label: t.forms.message, kind: 'textarea' },
            ]}
          />
        </div>
      </section>
    </>
  );
}
