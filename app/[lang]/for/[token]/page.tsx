import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductCard from '@/components/catalog/ProductCard';
import LeadForm from '@/components/forms/LeadForm';
import ModelViewer from '@/components/three/ModelViewer';
import { type Locale } from '@/lib/i18n';
import { allLite, MODELS } from '@/lib/catalog';
import { productHref } from '@/lib/links';
import { contactFields, formText } from '@/lib/forms';
import { db, now } from '@/lib/db';
import { getDict, fmt } from '@/content/i18n';

/**
 * Kişiye özel teklif sayfası (hesap bazlı pazarlama): firma adı, "sizin kodlarınızın karşılığı", 3D, numune.
 * Arama motorlarına kapalı (noindex); ziyaretler panelde "sıcak müşteri" uyarısı üretir.
 */
type P = { params: Promise<{ lang: Locale; token: string }> };
export const dynamicParams = true;
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false }, title: 'Özteknik' };

interface Offer {
  token: string;
  company: string;
  intro: string;
  rows: string;
  expires_on: string | null;
  active: number;
}
export default async function OfferPage({ params }: P) {
  const { lang, token } = await params;
  if (!/^[a-z0-9-]{8,64}$/.test(token)) notFound();
  const o = db().prepare('select * from offers where token = ? and active = 1').get(token) as Offer | undefined;
  if (!o || (o.expires_on && o.expires_on < now().slice(0, 10))) notFound();
  db().prepare('update offers set views = views + 1, last_view_at = ? where token = ?').run(now(), token);
  db().prepare('insert into offer_events(token, at, kind) values(?,?,?)').run(token, now(), 'view');
  const t = getDict(lang);
  const rows = JSON.parse(o.rows || '[]') as { their: string; slug: string }[];
  const lite = new Map(allLite().map((l) => [l.slug, l]));
  const matched = rows.map((r) => ({ ...r, p: lite.get(r.slug) })).filter((r) => r.p);
  const withModel = matched.find((r) => MODELS[r.slug]);
  return (
    <>
      <header className="page-hero">
        <div className="wrap stack">
          <p className="eyebrow">{fmt(t.offer.eyebrow, { company: o.company })}</p>
          <h1 className="d3">{t.offer.title}</h1>
          <p className="lead">{o.intro || t.offer.lead}</p>
          {o.expires_on && <p className="small muted">{fmt(t.offer.expires, { date: o.expires_on })}</p>}
        </div>
      </header>
      <section className="wrap section-sm">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>{t.offer.theirs}</th>
                <th>{t.offer.ours}</th>
              </tr>
            </thead>
            <tbody>
              {matched.map((r) => (
                <tr key={r.their + r.slug}>
                  <td className="mono">{r.their}</td>
                  <td>
                    <a className="mono" href={productHref(lang, r.slug)}>
                      {r.p!.code}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {withModel && (
          <div style={{ marginTop: 32, maxWidth: 720 }}>
            <ModelViewer src={MODELS[withModel.slug].src} poster={MODELS[withModel.slug].poster} label={t.product.view3d} explodeLabel={t.home.layers} />
          </div>
        )}
        <ul className="products-grid" style={{ marginTop: 32 }}>
          {matched.slice(0, 12).map((r) => (
            <ProductCard key={r.slug} p={r.p!} lang={lang} />
          ))}
        </ul>
      </section>
      <section className="wrap-narrow section-sm">
        <div className="card stack">
          <h2 className="h2">{t.sample.title}</h2>
          <LeadForm
            type="sample"
            lang={lang}
            t={formText(lang, t.sample.submit)}
            hidden={{ offer: token }}
            fields={[{ name: 'codes', label: t.forms.sampleCodes, kind: 'text', required: true, span: 2, defaultValue: matched.slice(0, 3).map((r) => r.p!.code).join(', ') }, ...contactFields(lang, { message: false }).map((f) => (f.name === 'company' ? { ...f, defaultValue: o.company } : f))]}
          />
        </div>
      </section>
    </>
  );
}
