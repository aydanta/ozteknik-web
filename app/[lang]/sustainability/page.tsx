import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import HeroVideo from '@/components/scroll/HeroVideo';
import Photo from '@/components/Photo';
import { photoSrc, photoSrcSet, type PhotoKey } from '@/lib/photos';

/** çevre · insan · ekonomi sütunlarının görselleri (sıra content/pages/*.ts → sustainability.pillars ile aynı) */
const PILLAR_PHOTO: PhotoKey[] = ['solar', 'operator', 'production'];
import JsonLd from '@/components/JsonLd';
import { href, type Locale } from '@/lib/i18n';
import { baseMeta, webPageNode, abs } from '@/lib/seo';
import { pageGraph } from '@/lib/graph';
import { getDict, getPages } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return baseMeta({ lang, title: `${t.sustainability.title} — ISO 14064-1`, description: getPages(lang).sustainability.intro.slice(0, 155), path: (l) => href(l, 'sustainability') });
}
export default async function Sustainability({ params }: P) {
  const { lang } = await params;
  const t = getDict(lang);
  const s = getPages(lang).sustainability;
  return (
    <>
      <JsonLd data={pageGraph(lang, [webPageNode({ url: abs(href(lang, 'sustainability')), name: t.sustainability.title, description: s.intro, lang })])} />
      <PageHero
        eyebrow={t.nav.company}
        title={t.sustainability.title}
        lead={s.intro.split(/(?<=[.!?])\s/)[0]}
        crumbs={[{ name: t.common.home, href: `/${lang}/` }, { name: t.sustainability.title }]}
        media={
          // tesisin GES drone videosu (eski sitenin sürdürülebilirlik videosu, 9 sn)
          <HeroVideo
            alt={t.photo.solar}
            pause={t.common.pauseVideo}
            play={t.common.playVideo}
            src={{ hi: '/video/ozteknik-ges-drone-720p.mp4', lo: '/video/ozteknik-ges-drone-480p.mp4', poster: photoSrc('aerial'), posterSet: photoSrcSet('aerial') }}
          />
        }
      />
      <section className="wrap section-sm stack">
        <div className="stat-band">
          {s.figures.map((f) => (
            <div key={f.l} className="stat">
              <b style={{ fontSize: 'clamp(30px,3.4vw,48px)' }}>{f.v}</b>
              <span>{f.l}</span>
            </div>
          ))}
        </div>
        <p className="note">{s.figuresNote}</p>
      </section>
      <section className="wrap section-sm grid grid-3">
        {s.pillars.map((p, i) => (
          <div key={p.t} className="card stack pillar-card reveal">
            <Photo k={PILLAR_PHOTO[i] ?? 'campus'} sizes="(max-width: 900px) 100vw, 33vw" className="pillar-img" />
            <h2 className="h2">{p.t}</h2>
            <ul className="prose" style={{ display: 'grid', gap: 10 }}>
              {p.items.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <section className="wrap section-sm split" style={{ alignItems: 'center' }}>
        <div className="stack">
          <h2 className="h1">{s.solarTitle}</h2>
          {s.solar.map((p) => (
            <p key={p.slice(0, 20)} className="muted">
              {p}
            </p>
          ))}
        </div>
        <div className="media-stack reveal">
          <Photo k="solar" alt={t.photo.solar} sizes="(max-width: 900px) 100vw, 50vw" />
          <img src="/img/sustainability-rooftop-solar.webp" alt={s.solarTitle} width={800} height={533} loading="lazy" />
        </div>
      </section>
    </>
  );
}
