import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import Photo from '@/components/Photo';
import JsonLd from '@/components/JsonLd';
import CertCard from '@/components/media/CertCard';
import { href, type Locale } from '@/lib/i18n';
import { baseMeta, webPageNode, abs, ORG_ID } from '@/lib/seo';
import { pageGraph } from '@/lib/graph';
import { getDict, getPages } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }> };
const FILES: Record<string, string> = {
  iatf: '/docs/iatf-16949-2016-certificate.webp',
  iso9001: '/docs/iso-9001-2015-certificate.webp',
  iso14064: '/docs/iso-14064-1-verification.webp',
  eac: '/docs/eac-certificate.webp',
};
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return baseMeta({ lang, title: `${t.quality.title} — IATF 16949, ISO 9001, ISO 14064-1, EAC`, description: t.quality.lead, path: (l) => href(l, 'quality') });
}
export default async function Quality({ params }: P) {
  const { lang } = await params;
  const t = getDict(lang);
  const pg = getPages(lang);
  return (
    <>
      <JsonLd data={pageGraph(lang, [webPageNode({ url: abs(href(lang, 'quality')), name: t.quality.title, description: t.quality.lead, lang, about: ORG_ID })])} />
      <PageHero photo="cmm" eyebrow={t.nav.company} title={t.quality.title} lead={t.quality.lead} crumbs={[{ name: t.common.home, href: `/${lang}/` }, { name: t.quality.title }]} />
      <section className="wrap section-sm stack" style={{ gap: 32 }}>
        <p className="lead">{pg.quality.intro}</p>
        <div className="cert-grid">
          {pg.quality.certs.map((c) => (
            <CertCard key={c.key} name={c.name} desc={c.d} src={FILES[c.key]} view={t.quality.view} download={t.common.download} />
          ))}
        </div>
      </section>
      <section className="wrap section-sm stack" style={{ gap: 24 }}>
        <div className="split split--center">
          <div className="stack" style={{ gap: 18 }}>
            <h2 className="h1">{t.quality.labTitle}</h2>
            <p className="lead">{pg.quality.lab}</p>
          </div>
          <div className="media-stack reveal">
            <Photo k="testbench" alt={t.photo.testbench} sizes="(max-width: 900px) 100vw, 50vw" />
            <Photo k="springs" alt={t.photo.springs} sizes="(max-width: 900px) 48vw, 24vw" />
          </div>
        </div>
        <div className="test-groups">
          {pg.production.testGroups.map((g) => (
            <div key={g.line} className="card stack">
              <h3 className="h3">{g.line}</h3>
              <ul>
                {g.tests.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
