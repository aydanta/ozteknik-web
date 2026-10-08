import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import Icon from '@/components/Icon';
import PageHero from '@/components/PageHero';
import type { PhotoKey } from '@/lib/photos';
import ExplodedStory from '@/components/three/ExplodedStory';
import SliceReveal from '@/components/scroll/SliceReveal';
import { href, type Locale } from '@/lib/i18n';
import { BRANDS, BRAND_KEYS, CATEGORIES, countsByBrand, countsByCategory, makesForBrand } from '@/lib/catalog';
import { brandHref, categoryHref, drawingFor } from '@/lib/links';
import { abs, baseMeta, breadcrumbNode, webPageNode, SITE_URL } from '@/lib/seo';
import { pageGraph } from '@/lib/graph';
import { storySteps } from '@/lib/story';
import { getDict, getPages, fmt } from '@/content/i18n';
import type { BrandKey } from '@/lib/types';

type P = { params: Promise<{ lang: Locale; brand: string }> };
/** marka sayfası başlık fotoğrafı (fabrika filminden kareler) */
const BRAND_PHOTO: Record<string, PhotoKey> = { egerot: 'weld', hydcab: 'testbench', revol: 'clutch' };

export const dynamicParams = false;
export function generateStaticParams() {
  return BRAND_KEYS.map((brand) => ({ brand }));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, brand } = await params;
  const b = brand as BrandKey;
  const pg = getPages(lang);
  const n = countsByBrand()[b];
  return baseMeta({
    lang,
    title: `${BRANDS[b].name} — ${BRANDS[b].line[lang]}`,
    description: `${pg.brands[b].story}`.slice(0, 155),
    path: (l) => brandHref(l, b),
    image: `/brand/${b}-logo.png`,
  });
  void n;
}

export default async function BrandPage({ params }: P) {
  const { lang, brand } = await params;
  if (!BRAND_KEYS.includes(brand as BrandKey)) notFound();
  const b = brand as BrandKey;
  const t = getDict(lang);
  const pg = getPages(lang);
  const counts = countsByCategory();
  const cats = CATEGORIES.filter((c) => c.brand === b && counts[c.key]);
  const makes = makesForBrand(b).slice(0, 24);
  const n = countsByBrand()[b];
  const tests = pg.production.testGroups[b === 'hydcab' ? 0 : b === 'egerot' ? 1 : 2];
  const url = abs(brandHref(lang, b));
  const nf = new Intl.NumberFormat(lang === 'ar' ? 'en' : lang);
  return (
    <>
      <JsonLd
        data={pageGraph(lang, [
          webPageNode({ url, name: `${BRANDS[b].name} — ${BRANDS[b].line[lang]}`, description: pg.brands[b].story, lang, type: 'CollectionPage', about: `${SITE_URL}/#brand-${b}` }),
          breadcrumbNode([
            { name: t.common.home, path: `/${lang}/` },
            { name: t.catalogue.title, path: href(lang, 'catalog') },
            { name: BRANDS[b].name, path: brandHref(lang, b) },
          ]),
        ])}
      />
      <PageHero
        photo={BRAND_PHOTO[b]}
        title={BRANDS[b].line[lang]}
        lead={pg.brands[b].story}
        crumbs={[{ name: t.common.home, href: `/${lang}/` }, { name: t.catalogue.title, href: href(lang, 'catalog') }, { name: BRANDS[b].name }]}
        kicker={
          <span className="brand-plate">
            <img src={`/brand/${b}-logo.webp`} alt={BRANDS[b].name} width={240} height={80} />
          </span>
        }
      >
        <div className="row chips-on-media">
          <span className="chip">{fmt(t.brand.since, { year: pg.brands[b].founded })}</span>
          <span className="chip">{fmt(t.common.products, { n: nf.format(n) })}</span>
          <span className="chip">IATF 16949</span>
        </div>
        <div className="row">
          <a className="btn btn--primary btn--lg" href={href(lang, 'catalog') + `?brand=${b}`}>
            {t.brand.goCatalogue} <Icon name="arrow" size={18} />
          </a>
          <a className="btn btn--lg btn--on-media" href={href(lang, 'search')}>
            {t.nav.multiSearch}
          </a>
        </div>
      </PageHero>

      <section className="wrap section-sm" aria-labelledby="structure">
        <div className="section-head">
          <p className="eyebrow">{t.brand.structure}</p>
          <h2 id="structure" className="d4">
            {pg.brands[b].tagline}
          </h2>
        </div>
      </section>
      {b === 'hydcab' ? (
        <SliceReveal
          outside="/img/hydcab-steering-cylinder-exterior.webp"
          inside="/img/hydcab-steering-cylinder-section.webp"
          ratio={2400 / 497}
          altOutside={`HYDCAB ${CATEGORIES.find((c) => c.key === 'steering-cylinder')!.one[lang]}`}
          altInside={`HYDCAB ${CATEGORIES.find((c) => c.key === 'steering-cylinder')!.one[lang]} — ${t.brand.structure}`}
          labels={[
            { key: 'tube', text: pg.brands.hydcab.structure[0].t, x: 33, y: 22 },
            { key: 'piston', text: pg.brands.hydcab.structure[1].t, x: 45, y: 44 },
            { key: 'valve', text: pg.brands.hydcab.structure[3].t, x: 49.5, y: 30 },
            { key: 'seals', text: pg.brands.hydcab.structure[2].t, x: 70.5, y: 44 },
          ]}
        />
      ) : (
        <ExplodedStory steps={storySteps(lang, [b])} modelUrl="/models/revol-cd8-007-072-clutch-disc.glb" layersLabel={t.home.layers} />
      )}
      <section className="wrap section-sm">
        <ul className="feature-list" style={{ listStyle: 'none' }}>
          {pg.brands[b].structure.map((s) => (
            <li key={s.t} style={{ background: 'var(--card)', padding: 28, display: 'grid', gap: 10 }}>
              <h3 className="h3">{s.t}</h3>
              <p className="muted">{s.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap section-sm" aria-labelledby="groups">
        <h2 id="groups" className="h1" style={{ marginBottom: 24 }}>
          {t.brand.categories}
        </h2>
        <ul className="cat-tiles">
          {cats.map((c) => (
            <li key={c.key}>
              <a className="cat-tile" href={categoryHref(lang, c.key)}>
                {drawingFor(c.key) && <img className="drawing" src={drawingFor(c.key)!} alt="" loading="lazy" />}
                <strong>{c.many[lang]}</strong>
                <span className="muted small mono">{fmt(t.common.products, { n: counts[c.key] })}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="wrap section-sm split">
        <div className="stack">
          <h2 className="h1">{t.brand.tests}</h2>
          <ul className="prose" style={{ display: 'grid', gap: 8 }}>
            {tests.tests.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <a className="link" href={href(lang, 'production')}>
            {t.nav.production} →
          </a>
        </div>
        <div className="stack">
          <h2 className="h1">{t.brand.makes}</h2>
          <ul className="row chips">
            {makes.map((m) => (
              <li key={m.make}>
                <a className="chip" href={`${href(lang, 'catalog')}?brand=${b}&make=${encodeURIComponent(m.make)}`}>
                  {m.make} <span className="mono">{m.n}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="note">{getDict(lang).footer.oeNote}</p>
        </div>
      </section>
      <section className="wrap section">
        <div className="cta-band">
          <div className="stack">
            <h2 className="d4">{t.home.listTitle}</h2>
            <p className="lead">{t.home.listLead}</p>
          </div>
          <a className="btn btn--primary btn--lg" href={href(lang, 'search')}>
            {t.home.listCta} <Icon name="arrow" size={18} />
          </a>
        </div>
      </section>
    </>
  );
}
