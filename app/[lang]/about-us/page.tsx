import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import Timeline from '@/components/scroll/Timeline';
import Icon from '@/components/Icon';
import { Breadcrumbs } from '@/components/layout/Footer';
import Photo from '@/components/Photo';
import { photoSrc } from '@/lib/photos';
import { href, LOCALE_META, type Locale } from '@/lib/i18n';
import { BRANDS, BRAND_KEYS, totalCodes } from '@/lib/catalog';
import { brandHref } from '@/lib/links';
import { company } from '@/lib/site';
import { baseMeta, webPageNode, abs, ORG_ID } from '@/lib/seo';
import { pageGraph } from '@/lib/graph';
import { getDict, getPages } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }> };
const SECTOR_ICON: Record<string, string> = { trucks: 'truck', buses: 'bus', agri: 'tractor', construction: 'crane' };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const pg = getPages(lang).about;
  return baseMeta({
    lang,
    title: pg.title,
    description: pg.lead.slice(0, 155),
    path: (l) => href(l, 'about'),
    image: abs(photoSrc('campus')),
  });
}

export default async function About({ params }: P) {
  const { lang } = await params;
  const t = getDict(lang);
  const pages = getPages(lang);
  const a = pages.about;
  const ta = t.about;
  const c = company();
  const nf = new Intl.NumberFormat(lang === 'ar' ? 'ar-EG-u-nu-latn' : LOCALE_META[lang].bcp47);
  const figures = [...a.facts, { v: nf.format(totalCodes()), l: t.home.statCodes }, { v: 'IATF 16949', l: t.home.statQuality }];
  const companies = [
    { name: c.legalName, y: '1971', d: a.group[0] },
    { name: 'EgeROT San. Tic. Ltd. Şti.', y: '2006', d: a.group[1] },
    { name: 'Taşsan A.Ş.', y: '2009', d: a.group[2] },
  ];

  return (
    <>
      <JsonLd
        data={pageGraph(lang, [
          webPageNode({ url: abs(href(lang, 'about')), name: a.title, description: a.lead, lang, type: 'AboutPage', about: ORG_ID }),
        ])}
      />
      <Breadcrumbs items={[{ name: t.common.home, href: `/${lang}/` }, { name: a.title }]} />

      {/* ---------- açılış: tesis görseli ---------- */}
      <header className="about-hero">
        <Photo k="campus" alt={t.photo.campus} sizes="100vw" eager className="about-hero-img" />
        <div className="wrap about-hero-copy">
          <p className="eyebrow">{ta.eyebrow}</p>
          <h1 className="d3">{a.title}</h1>
          <p className="lead">{a.lead}</p>
        </div>
      </header>

      {/* ---------- temel göstergeler ---------- */}
      <section className="wrap" aria-label={ta.who}>
        <dl className="facts-card">
          {figures.map((f) => (
            <div key={f.l} className={/^[\d.,+]+$/.test(f.v) ? undefined : 'is-text'}>
              <dt>{f.l}</dt>
              <dd>{f.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---------- biz kimiz ---------- */}
      <section className="wrap section about-who">
        <div className="stack">
          <p className="eyebrow">{ta.who}</p>
          <h2 className="d4">{ta.whoTitle}</h2>
          {a.intro.map((p, i) => (
            <p key={p.slice(0, 24)} className={i === 0 ? 'lead' : 'muted'}>
              {p}
            </p>
          ))}
        </div>
        <div className="media-stack reveal">
          <Photo k="hall" alt={t.photo.hall} sizes="(max-width: 900px) 100vw, 50vw" />
          <Photo k="robot" alt={t.photo.robot} sizes="(max-width: 900px) 48vw, 24vw" />
        </div>
      </section>

      {/* ---------- vizyon / misyon ---------- */}
      <section className="vm-band">
        <div className="wrap vm-grid">
          <figure>
            <figcaption className="eyebrow">{ta.vision}</figcaption>
            <blockquote>{a.vision}</blockquote>
          </figure>
          <figure>
            <figcaption className="eyebrow">{ta.mission}</figcaption>
            <blockquote>{a.mission}</blockquote>
          </figure>
        </div>
      </section>

      {/* ---------- grup yapısı: şirketler + markalar ---------- */}
      <section className="wrap section">
        <div className="section-head">
          <h2 className="d4">{ta.group}</h2>
          <p className="lead">{ta.groupLead}</p>
        </div>
        <h3 className="about-subhead">{ta.companies}</h3>
        <div className="grid grid-3">
          {companies.map((co) => (
            <article key={co.name} className="card group-card reveal">
              <span className="mono small muted">{co.y}</span>
              <h4 className="h3">{co.name}</h4>
              <p className="muted">{co.d}</p>
            </article>
          ))}
        </div>
        <h3 className="about-subhead">{t.nav.brands}</h3>
        <div className="grid grid-3">
          {BRAND_KEYS.map((b) => (
            <a key={b} className={`card card--link group-brand group-brand--${b}`} href={brandHref(lang, b)}>
              <img src={`/brand/${b}-logo.webp`} alt={BRANDS[b].name} width={150} height={50} loading="lazy" />
              <span className="mono small muted">{pages.brands[b].founded}</span>
              <h4 className="h3">{BRANDS[b].line[lang]}</h4>
              <p className="muted">{pages.brands[b].tagline}</p>
              <span className="link">
                {t.brand.goCatalogue} <Icon name="arrow" size={14} />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ---------- yetkinlik: dövmeden son teste ---------- */}
      <section className="about-cap section">
        <div className="wrap">
          <div className="section-head section-head--row">
            <div className="stack">
              <p className="eyebrow">{t.nav.production}</p>
              <h2 className="d4">{ta.capTitle}</h2>
              <p className="lead">{ta.capLead}</p>
            </div>
            <a className="btn" href={href(lang, 'production')}>
              <Icon name="factory" size={16} /> {t.nav.production}
            </a>
          </div>
          <div className="cap-gallery reveal">
            <Photo k="cad" alt={t.photo.cad} sizes="(max-width: 900px) 100vw, 34vw" />
            <Photo k="clutch" alt={t.photo.clutch} sizes="(max-width: 900px) 50vw, 22vw" />
            <Photo k="springs" alt={t.photo.springs} sizes="(max-width: 900px) 50vw, 22vw" />
            <Photo k="testbench" alt={t.photo.testbench} sizes="(max-width: 900px) 100vw, 34vw" />
          </div>
          <ol className="cap-steps">
            {pages.production.steps.map((s, i) => (
              <li key={s.t}>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="h3">{s.t}</h3>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- kalite + patentler ---------- */}
      <section className="wrap section about-quality">
        <div className="stack">
          <p className="eyebrow">{t.nav.quality}</p>
          <h2 className="d4">{ta.qualityTitle}</h2>
          <p className="lead">{pages.quality.intro}</p>
          <ul className="cert-list">
            {pages.quality.certs.map((x) => (
              <li key={x.key}>
                <Icon name="cert" size={22} />
                <b>{x.name}</b>
              </li>
            ))}
          </ul>
          <a className="link" href={href(lang, 'quality')}>
            {t.nav.quality} →
          </a>
        </div>
        <div className="stack">
          <Photo k="cmm" alt={t.photo.cmm} sizes="(max-width: 900px) 100vw, 45vw" className="about-quality-img reveal" />
          <h3 className="h2">{ta.ipTitle}</h3>
          <ul className="ip-list">
            {a.ip.map((x, i) => (
              <li key={x.y}>
                <span className="mono">{x.y}</span>
                <div>
                  <b>{i === 0 ? ta.patent : ta.utilityModel}</b>
                  <p className="muted">{x.t}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- kilometre taşları ---------- */}
      <section className="about-timeline section-sm">
        <div className="wrap split">
          <div className="stack about-sticky">
            <p className="eyebrow">1971 — 2020</p>
            <h2 className="d4">{ta.timeline}</h2>
          </div>
          <Timeline items={a.timeline} />
        </div>
      </section>

      {/* ---------- pazarlar ---------- */}
      <section className="wrap section-sm">
        <div className="section-head section-head--row">
          <h2 className="d4">{t.home.sectorsTitle}</h2>
          <a className="link" href={href(lang, 'dealers')}>
            {t.nav.dealers} →
          </a>
        </div>
        <div className="grid grid-4">
          {pages.sectors.map((s) => (
            <article key={s.key} className="card sector sector--compact reveal">
              <Icon name={SECTOR_ICON[s.key]} size={28} />
              <h3 className="h3">{s.t}</h3>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- satış sonrası + sürdürülebilirlik ---------- */}
      <section className="wrap section-sm">
        <div className="grid grid-2">
          <article className="card about-panel">
            <Icon name="check" size={24} />
            <h2 className="h2">{a.afterSalesTitle}</h2>
            <p className="muted">{a.afterSales}</p>
          </article>
          <article className="card about-panel">
            <Icon name="leaf" size={24} />
            <h2 className="h2">{t.nav.sustainability}</h2>
            <p className="muted">{pages.sustainability.intro.split(/(?<=[.!?])\s/)[0]}</p>
            <a className="link" href={href(lang, 'sustainability')}>
              {t.nav.sustainability} →
            </a>
          </article>
        </div>
      </section>

      {/* ---------- çağrı ---------- */}
      <section className="wrap section-sm">
        <div className="cta-band">
          <div className="stack">
            <h2 className="d4">{ta.ctaTitle}</h2>
            <p className="lead">{ta.ctaLead}</p>
          </div>
          <div className="row">
            <a className="btn btn--primary btn--lg" href={href(lang, 'distributors')}>
              {t.home.ctaDistributor} <Icon name="arrow" size={18} />
            </a>
            <a className="btn btn--lg" href={href(lang, 'contact')}>
              {t.nav.contact}
            </a>
            <a className="btn btn--lg" href={href(lang, 'careers')}>
              {t.nav.careers}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
