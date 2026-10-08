import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import Photo from '@/components/Photo';
import LeadForm from '@/components/forms/LeadForm';
import { href, type Locale } from '@/lib/i18n';
import { baseMeta } from '@/lib/seo';
import { formText } from '@/lib/forms';
import { getDict } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return baseMeta({ lang, title: t.careers.title, description: t.careers.lead, path: (l) => href(l, 'careers') });
}
export default async function Careers({ params }: P) {
  const { lang } = await params;
  const t = getDict(lang);
  const f = t.forms;
  return (
    <>
      <PageHero photo="operator" eyebrow={t.nav.company} title={t.careers.title} lead={t.careers.lead} crumbs={[{ name: t.common.home, href: `/${lang}/` }, { name: t.careers.title }]} />
      <section className="wrap section-sm split">
        <div className="stack">
          <h2 className="h1">{t.careers.open}</h2>
          <p className="muted">{t.careers.none}</p>
          <h2 className="h2" style={{ marginTop: 24 }}>
            {t.careers.internship}
          </h2>
          <div className="photo-strip photo-strip--2 reveal" style={{ marginTop: 16 }}>
            <Photo k="production" alt={t.photo.production} sizes="(max-width: 900px) 50vw, 25vw" />
            <Photo k="cad" alt={t.photo.cad} sizes="(max-width: 900px) 50vw, 25vw" />
            <Photo k="robot" alt={t.photo.robot} sizes="(max-width: 900px) 50vw, 25vw" />
            <Photo k="cmm" alt={t.photo.cmm} sizes="(max-width: 900px) 50vw, 25vw" />
          </div>
        </div>
        <div className="card stack">
          <h2 className="h2">{t.careers.apply}</h2>
          <LeadForm
            type="career"
            lang={lang}
            event="career_apply"
            t={formText(lang, t.careers.apply)}
            fields={[
              { name: 'name', label: f.name, kind: 'text', required: true, autoComplete: 'name' },
              { name: 'email', label: f.email, kind: 'email', required: true, autoComplete: 'email' },
              { name: 'phone', label: f.phone, kind: 'tel', autoComplete: 'tel' },
              { name: 'department', label: f.department, kind: 'text' },
              { name: 'position', label: f.position, kind: 'text' },
              { name: 'cv', label: f.cv, kind: 'file', accept: '.pdf' },
              { name: 'message', label: f.message, kind: 'textarea' },
            ]}
          />
        </div>
      </section>
    </>
  );
}
