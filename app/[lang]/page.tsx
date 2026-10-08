import type { Metadata } from 'next';
import Icon from '@/components/Icon';
import JsonLd from '@/components/JsonLd';
import HeroPart from '@/components/three/HeroPart';
import HeroVideo from '@/components/scroll/HeroVideo';
import HeroStage from '@/components/scroll/HeroStage';
import Photo from '@/components/Photo';
import ExplodedStory from '@/components/three/ExplodedStory';
import SliceReveal from '@/components/scroll/SliceReveal';
import Globe from '@/components/scroll/Globe';
import Counter from '@/components/scroll/Counter';
import { href, LOCALE_META, type Locale } from '@/lib/i18n';
import { BRANDS, BRAND_KEYS, CATEGORIES, FIELDS, countsByBrand, countsByCategory, getProduct, totalCodes } from '@/lib/catalog';
import { brandHref, categoryHref, productHref } from '@/lib/links';
import { stats, upcomingFairs, fairDate } from '@/lib/site';
import { baseMeta, webPageNode, abs, ORG_ID } from '@/lib/seo';
import { pageGraph } from '@/lib/graph';
import { storySteps } from '@/lib/story';
import { getDict, getPages, fmt } from '@/content/i18n';

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return baseMeta({ lang, title: t.meta.homeTitle, description: t.meta.homeDescription, path: (l) => `/${l}/`, absoluteTitle: true });
}

const BRAND_IMG: Record<string, { src: string; w: number; h: number; drawing?: boolean }> = {
  egerot: { src: '/img/egerot-er0108-torque-rod.webp', w: 534, h: 412 },
  hydcab: { src: '/img/hydcab-steering-cylinder-exterior.webp', w: 2400, h: 497 },
  revol: { src: '/img/revol-clutch-kit-render.webp', w: 1492, h: 784 },
};
const SECTOR_ICON: Record<string, string> = { trucks: 'truck', buses: 'bus', agri: 'tractor', construction: 'crane' };

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const t = getDict(lang);
  const pg = getPages(lang);
  const loc = LOCALE_META[lang].bcp47;
  const nf = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG-u-nu-latn' : loc);
  const st = stats();
  const codes = totalCodes();
  const byBrand = countsByBrand();
  const byCat = countsByCategory();
  const hero = getProduct('er0107');
  const heroOe = hero?.oe[0];
  const fairs = upcomingFairs();

  const steps = storySteps(lang);

  const url = abs(`/${lang}/`);
  return (
    <>
      <JsonLd
        data={pageGraph(lang, [
          webPageNode({ url, name: t.meta.homeTitle, description: t.meta.homeDescription, lang, about: ORG_ID }),
          {
            '@type': 'VideoObject',
            name: t.home.videoTitle,
            description: t.home.videoAlt,
            thumbnailUrl: abs('/video/ozteknik-fabrika-poster-1920.webp'),
            contentUrl: abs('/video/ozteknik-fabrika-720p.mp4'),
            uploadDate: '2024-10-25T14:29:35+03:00', // eski sitedeki medya kaydı
            duration: 'PT58S',
            publisher: { '@id': ORG_ID },
          },
        ])}
      />

      {/* ---------- açılış: fabrika filmi, yalnız logo (08.10.2026, Furkan: arama ve yazılar kaldırıldı; referans ajans sitesindeki gibi
           video kenardan kenara, menü üstünde saydam, kaydırınca video alttan kısalır ve marka logoları belirir) ---------- */}
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.dataset.hero='over'" }} />
      <HeroStage>
        <section className="hero hero--video" aria-labelledby="hero-title">
          <div className="hero-frame">
            <HeroVideo alt={t.home.videoAlt} pause={t.common.pauseVideo} play={t.common.playVideo} />
            <div className="hero-scrim" aria-hidden />
            <div className="wrap hero-inner">
              {/* h1 görsel olarak logo; başlık metni ekran okuyucu ve arama motoru için duruyor */}
              <h1 className="hero-logo" id="hero-title">
                <img src="/brand/ozteknik-logo-white.svg" alt="Özteknik" width={205} height={21} fetchPriority="high" />
                <span className="sr-only"> — {t.home.title}</span>
              </h1>
            </div>
            <a className="hero-scroll" href="#about" aria-label={t.about.homeEyebrow}>
              <Icon name="chevron" size={18} />
            </a>
          </div>
          <nav className="hero-brands" aria-label={t.nav.brands}>
            {BRAND_KEYS.map((b) => (
              <a key={b} href={brandHref(lang, b)}>
                <img src={`/brand/${b}-logo.webp`} alt={`${BRANDS[b].name} — ${BRANDS[b].line[lang]}`} width={300} height={100} loading="lazy" />
              </a>
            ))}
          </nav>
        </section>
      </HeroStage>

      {/* ---------- hakkımızda (özet) + rakamlar ---------- */}
      <section className="section wrap" id="about" aria-labelledby="about-title">
        <div className="home-about">
          <div className="media-stack reveal">
            <img
              src="/img/company/ozteknik-kemalpasa-izmir-plant-1920.webp"
              srcSet="/img/company/ozteknik-kemalpasa-izmir-plant-960.webp 960w, /img/company/ozteknik-kemalpasa-izmir-plant-1920.webp 1920w"
              sizes="(max-width: 900px) 100vw, 50vw"
              alt={t.photo.campus}
              width={1920}
              height={1080}
              loading="lazy"
            />
            <img
              src="/img/company/ozteknik-cnc-machining-hall-960.webp"
              alt={t.photo.hall}
              width={960}
              height={540}
              loading="lazy"
            />
          </div>
          <div className="stack home-about-copy">
            <p className="eyebrow">{t.about.homeEyebrow}</p>
            <h2 className="d4" id="about-title">
              {t.about.homeTitle}
            </h2>
            <p className="lead">{pg.about.lead}</p>
            <p className="muted">{pg.about.intro[1]}</p>
            <div className="row">
              <a className="btn btn--primary" href={href(lang, 'about')}>
                {t.about.more} <Icon name="arrow" size={16} />
              </a>
              <a className="btn" href={href(lang, 'production')}>
                <Icon name="factory" size={16} /> {t.nav.production}
              </a>
            </div>
          </div>
        </div>
        <div className="stat-band home-about-stats">
          <div className="stat">
            <Counter value={st.founded} locale={loc} />
            <span>{t.home.statFounded}</span>
          </div>
          <div className="stat">
            <Counter value={st.countries} suffix="+" locale={loc} />
            <span>{t.home.statCountries}</span>
          </div>
          <div className="stat">
            <Counter value={codes} locale={loc} />
            <span>{t.home.statCodes}</span>
          </div>
          <div className="stat">
            <b className="stat-text">IATF 16949</b>
            <span>{t.home.statQuality}</span>
          </div>
        </div>
      </section>

      {/* ---------- fabrikadan kareler (referans sitedeki fotoğraf ızgarası gibi; az yazı) ---------- */}
      <section className="wrap section-sm" aria-labelledby="gallery-title">
        <div className="section-head section-head--row">
          <h2 className="d4" id="gallery-title">
            {t.about.capTitle}
          </h2>
          <a className="link" href={href(lang, 'production')}>
            {t.nav.production} →
          </a>
        </div>
        <div className="factory-gallery">
          <Photo k="welding" alt={t.photo.welding} sizes="(max-width: 900px) 100vw, 50vw" className="g1 reveal" />
          <Photo k="production" alt={t.photo.production} sizes="(max-width: 900px) 100vw, 50vw" className="g2 reveal" />
          <Photo k="clutch" alt={t.photo.clutch} sizes="(max-width: 900px) 50vw, 25vw" className="g3 reveal" />
          <Photo k="cad" alt={t.photo.cad} sizes="(max-width: 900px) 50vw, 25vw" className="g4 reveal" />
        </div>
      </section>

      {/* ---------- parça yakından: fareyi izleyen 3D tork kolu + teknik veri (şartname: ana sayfa 3D ürün sahnesi) ---------- */}
      <section className="wrap section-sm part-spot">
        <div className="hero-visual">
          <HeroPart poster="/drawings/torque-rod.webp" alt={`EGEROT ER0107 ${CATEGORIES[0].one[lang]}`} />
        </div>
        {hero && (
          <aside className="spec-panel spec-panel--static" aria-label={t.home.panelTitle}>
            <p className="eyebrow">{t.home.panelTitle}</p>
            <p className="spec-panel-code">
              <span className="badge badge--egerot">EGEROT</span> <b className="mono">{hero.code}</b>
            </p>
            <dl>
              {hero.specs.map((s) => (
                <div key={s.key}>
                  <dt>{FIELDS[s.key]?.label[lang] ?? s.key}</dt>
                  <dd className="mono">
                    {s.key === 'tube' ? 'Ø' : ''}
                    {s.value} {s.unit}
                  </dd>
                </div>
              ))}
              {heroOe && (
                <div>
                  <dt>{t.home.panelReplaces}</dt>
                  <dd className="mono">
                    {heroOe.make} {heroOe.display}
                  </dd>
                </div>
              )}
            </dl>
            <a className="link" href={productHref(lang, hero.slug)}>
              {t.home.panelOpen} →
            </a>
          </aside>
        )}
      </section>

      {/* ---------- üç marka, tek üretici (3D scroll) ---------- */}
      <section className="section-sm wrap" id="brands">
        <div className="section-head">
          <p className="eyebrow">{t.home.brandsEyebrow}</p>
          <h2 className="d4">{t.home.brandsTitle}</h2>
          <p className="lead">{t.home.brandsLead}</p>
        </div>
      </section>
      <ExplodedStory steps={steps} modelUrl="/models/revol-cd8-007-072-clutch-disc.glb" layersLabel={t.home.layers} />

      {/* ---------- marka kartları ---------- */}
      <section className="section wrap">
        <div className="grid grid-3 brand-cards">
          {BRAND_KEYS.map((b) => {
            const img = BRAND_IMG[b];
            const cats = CATEGORIES.filter((c) => c.brand === b && byCat[c.key]);
            return (
              <article key={b} className={`brand-card brand-card--${b} reveal`}>
                <div className="brand-card-top">
                  <img src={`/brand/${b}-logo.webp`} alt={BRANDS[b].name} width={150} height={50} className="brand-logo" loading="lazy" />
                  <span className="muted small">{fmt(t.brand.since, { year: pg.brands[b].founded })}</span>
                </div>
                <div className="brand-card-img">
                  <img src={img.src} alt={`${BRANDS[b].name} — ${BRANDS[b].line[lang]}`} width={img.w} height={img.h} loading="lazy" />
                </div>
                <h3 className="h3">{BRANDS[b].line[lang]}</h3>
                <p className="muted">{pg.brands[b].tagline}</p>
                <ul className="row chips" aria-label={t.brand.categories}>
                  {cats.map((c) => (
                    <li key={c.key}>
                      <a className="chip" href={categoryHref(lang, c.key)}>
                        {c.many[lang]} <span className="mono">{byCat[c.key]}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <a className="btn btn--block" href={brandHref(lang, b)}>
                  {t.brand.goCatalogue} · {nf.format(byBrand[b])} <Icon name="arrow" size={16} />
                </a>
              </article>
            );
          })}
        </div>
      </section>

      {/* ---------- kanıt: kesit ---------- */}
      <section className="section-sm proof">
        <div className="wrap">
          <div className="section-head section-head--row">
            <div className="stack">
              <p className="eyebrow">HYDCAB · {CATEGORIES.find((c) => c.key === 'steering-cylinder')!.one[lang]}</p>
              <h2 className="d4">{t.home.proofTitle}</h2>
              <p className="lead">{t.home.proofLead}</p>
            </div>
            <div className="row">
              <a className="btn" href={href(lang, 'quality')}>
                <Icon name="cert" size={16} /> {t.nav.quality}
              </a>
              <a className="btn" href={href(lang, 'production')}>
                <Icon name="factory" size={16} /> {t.nav.production}
              </a>
            </div>
          </div>
        </div>
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
      </section>

      {/* ---------- sektörler ---------- */}
      <section className="section wrap" id="sectors">
        <div className="section-head">
          <h2 className="d4">{t.home.sectorsTitle}</h2>
        </div>
        <div className="grid grid-4">
          {pg.sectors.map((s) => (
            <article key={s.key} className="card sector sector--compact reveal">
              <Icon name={SECTOR_ICON[s.key]} size={28} />
              <h3 className="h3">{s.t}</h3>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- küresel erişim ---------- */}
      <section className="section-sm reach">
        <div className="wrap split">
          <div className="stack" style={{ alignSelf: 'center' }}>
            <h2 className="d4">{fmt(t.home.reachTitle, { n: st.countries })}</h2>
            <p className="lead">{t.home.reachLead}</p>
            <div className="row">
              <a className="btn btn--primary" href={href(lang, 'distributors')}>
                {t.home.ctaDistributor} <Icon name="arrow" size={16} />
              </a>
              <a className="btn" href={href(lang, 'dealers')}>
                {t.nav.dealers}
              </a>
            </div>
          </div>
          <Globe label={fmt(t.home.reachTitle, { n: st.countries })} />
        </div>
      </section>

      {/* ---------- fuarlar ---------- */}
      <section className="section-sm wrap">
        <div className="section-head section-head--row">
          <h2 className="d4">{t.home.fairsTitle}</h2>
          <a className="link" href={href(lang, 'media')}>
            {t.nav.media} →
          </a>
        </div>
        {fairs.length ? (
          <ul className="fairs">
            {fairs.map((f) => (
              <li key={f.id} className="card">
                <span className="mono small muted">{fairDate(f, lang)}</span>
                <h3 className="h3">{f.name}</h3>
                <span className="muted">
                  <Icon name="pin" size={14} /> {f.city}
                  {f.booth ? ` · ${f.booth}` : ''}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">{t.home.fairsEmpty}</p>
        )}
      </section>

      {/* ---------- çoklu arama ---------- */}
      <section className="section wrap">
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
