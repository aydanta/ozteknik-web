import { redirect } from 'next/navigation';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import Shell from '@/components/admin/Shell';
import { requireUser } from '@/lib/auth';
import { audit } from '@/lib/db';
import { activeSlugs, allOeNorms, getProductsBySlugs } from '@/lib/catalog';
import { productCopy, SITE_URL } from '@/lib/seo';
import { indexNow } from '@/lib/indexnow';
import { LOCALES } from '@/lib/i18n';
import { productHref } from '@/lib/links';

export const metadata = { title: 'SEO / GEO' };

async function pingAll() {
  'use server';
  const user = await requireUser(['admin', 'editor']);
  const slugs = activeSlugs().map((s) => s.slug);
  const r = await indexNow(slugs.flatMap((s) => LOCALES.map((l) => productHref(l, s))).slice(0, 10000));
  audit(user.email, 'indexnow-all', String(slugs.length), JSON.stringify(r));
  redirect(`/admin/seo/?ping=${encodeURIComponent(JSON.stringify(r))}`);
}

export default async function Seo({ searchParams }: { searchParams: Promise<{ ping?: string; test?: string }> }) {
  const user = await requireUser(['admin', 'editor']);
  const sp = await searchParams;
  const slugs = activeSlugs();
  // rastgele 50 üründe başlık / açıklama / özet kontrolü (şartname kabul kriteri)
  const sample = getProductsBySlugs(slugs.filter((_, i) => i % Math.max(1, Math.floor(slugs.length / 50)) === 0).slice(0, 50).map((s) => s.slug));
  const checks = sample.map((p) => {
    const c = productCopy(p, 'en');
    return { slug: p.slug, code: p.code, title: c.title, tl: c.title.length, dl: c.description.length, summary: !!c.summary, oe: p.oe.length };
  });
  const bad = checks.filter((c) => c.dl > 160 || c.dl < 70 || !c.summary || c.tl > 82);
  let report: { source: Record<string, number>; target: Record<string, unknown>; fixes: Record<string, number> } | null = null;
  try {
    report = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'migration-report.json'), 'utf8'));
  } catch {}
  let test: { url: string; status: number; location: string | null } | null = null;
  if (sp.test) {
    try {
      const u = new URL(sp.test, 'http://localhost:3300');
      const res = await fetch(`http://127.0.0.1:${process.env.PORT || 3300}${u.pathname}`, { redirect: 'manual' });
      test = { url: u.pathname, status: res.status, location: res.headers.get('location') };
    } catch {
      test = { url: sp.test, status: 0, location: null };
    }
  }
  return (
    <Shell user={user} active="/admin/seo/">
      <div className="adm-head">
        <div>
          <p className="eyebrow">Yayın kapısı · {SITE_URL}</p>
          <h1>SEO / GEO kontrol</h1>
        </div>
        <form action={pingAll}>
          <button className="btn btn--sm">Tüm ürünleri IndexNow'a bildir</button>
        </form>
      </div>
      {sp.ping && <p className="flash">IndexNow: {sp.ping}</p>}
      <div className="kpis">
        <div className="kpi">
          <b>{slugs.length}</b>
          <span>Yayındaki ürün × 8 dil</span>
        </div>
        <div className="kpi">
          <b>{allOeNorms().length}</b>
          <span>İndekslenebilir OE sayfası</span>
        </div>
        <div className={`kpi ${bad.length ? 'kpi--warn' : ''}`}>
          <b>
            {checks.length - bad.length}/{checks.length}
          </b>
          <span>Örneklemde başlık/açıklama/özet uygun</span>
        </div>
      </div>
      <div className="adm-grid">
        <section className="stack">
          <h2 className="h3">50 ürün örneklemi (EN)</h2>
          <div className="table-wrap" style={{ maxHeight: 480, overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Kod</th>
                  <th>Başlık</th>
                  <th>Uz.</th>
                  <th>Açıkl.</th>
                </tr>
              </thead>
              <tbody>
                {checks.map((c) => (
                  <tr key={c.slug}>
                    <td className="mono">
                      <a href={`/admin/products/${c.slug}/`}>{c.code}</a>
                    </td>
                    <td className="small">{c.title}</td>
                    <td className="mono">{c.tl}</td>
                    <td className={`mono ${c.dl > 160 ? 'pill--err' : ''}`}>{c.dl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="stack">
          <h2 className="h3">Yönlendirme test aracı (301)</h2>
          <form className="adm-filters" method="get">
            <input className="input mono" name="test" defaultValue={sp.test} placeholder="/hydcab/tr/product/ck0-122-801/" style={{ minWidth: 280 }} />
            <button className="btn btn--sm">Test et</button>
          </form>
          {test && (
            <p className="mono small">
              {test.url} → <b>{test.status}</b> {test.location ?? ''}
            </p>
          )}
          <h2 className="h3">Taşıma raporu</h2>
          {report && (
            <div className="table-wrap">
              <table className="table">
                <tbody>
                  <tr>
                    <td>Kaynak ürün / hedef ürün</td>
                    <td className="mono">
                      {report.source.products} / {String(report.target.products)}
                    </td>
                  </tr>
                  <tr>
                    <td>OE terimi / hedef OE + çapraz</td>
                    <td className="mono">
                      {report.source.oeTerms} / {String(report.target.oe)} + {String(report.target.cross)}
                    </td>
                  </tr>
                  <tr>
                    <td>Görsel kaynak / hedef</td>
                    <td className="mono">
                      {report.source.imagesInStore} / {String(report.target.images)}
                    </td>
                  </tr>
                  {Object.entries(report.fixes).map(([k, v]) => (
                    <tr key={k}>
                      <td className="small">{k}</td>
                      <td className="mono">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <h2 className="h3">Bağlantılar</h2>
          <ul className="small" style={{ display: 'grid', gap: 6 }}>
            {['/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt', '/feeds/catalog.json', '/feeds/catalog.csv'].map((u) => (
              <li key={u}>
                <a className="mono" href={u} target="_blank">
                  {u}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Shell>
  );
}
