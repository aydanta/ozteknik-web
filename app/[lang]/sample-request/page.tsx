import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import LeadForm from '@/components/forms/LeadForm';
import { href, type Locale } from '@/lib/i18n';
import { baseMeta } from '@/lib/seo';
import { contactFields, formText } from '@/lib/forms';
import { getDict } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }>; searchParams: Promise<{ code?: string }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return baseMeta({ lang, title: t.sample.title, description: t.sample.lead, path: (l) => href(l, 'sample') });
}
export default async function SamplePage({ params, searchParams }: P) {
  const { lang } = await params;
  const { code } = await searchParams;
  const t = getDict(lang);
  const base = contactFields(lang, { message: false });
  return (
    <>
      <PageHero photo="springs" eyebrow={t.nav.sales} title={t.sample.title} lead={t.sample.lead} crumbs={[{ name: t.common.home, href: `/${lang}/` }, { name: t.sample.title }]} />
      <section className="wrap-narrow section-sm">
        <div className="card">
          <LeadForm
            type="sample"
            lang={lang}
            event="sample_request"
            t={formText(lang, t.sample.submit)}
            fields={[
              { name: 'codes', label: t.forms.sampleCodes, kind: 'text', required: true, defaultValue: code?.slice(0, 60), span: 2, placeholder: 'CK0 122 801, ER0107, KS0004' },
              ...base,
              { name: 'shipping', label: t.forms.shipping, kind: 'textarea' },
              { name: 'message', label: t.forms.message, kind: 'textarea' },
            ]}
          />
        </div>
        <p className="note" style={{ marginTop: 16 }}>
          {t.quote.note}
        </p>
      </section>
    </>
  );
}
