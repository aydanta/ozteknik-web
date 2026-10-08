import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import PageHero from '@/components/PageHero';
import CatalogView, { readFilter, isFiltered, type SP } from '@/components/catalog/CatalogView';
import { href, type Locale } from '@/lib/i18n';
import { BRANDS, BRAND_KEYS, CATEGORIES, countsByCategory, totalCodes } from '@/lib/catalog';
import { categoryHref, drawingFor } from '@/lib/links';
import { baseMeta, breadcrumbNode, webPageNode, abs } from '@/lib/seo';
import { pageGraph } from '@/lib/graph';
import { getDict, fmt } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }>; searchParams: Promise<SP> };

export async function generateMetadata({ params, searchParams }: P): Promise<Metadata> {
  const { lang } = await params;
  const sp = await searchParams;
  const t = getDict(lang);
  const m = baseMeta({
    lang,
    title: `${t.catalogue.title} — EGEROT, HYDCAB, REVOL`,
    description: fmt(t.catalogue.lead, { n: totalCodes() }).slice(0, 158),
    path: (l) => href(l, 'catalog'),
    noindex: isFiltered(readFilter(sp)),
  });
  return m;
}

export default async function Catalogue({ params, searchParams }: P) {
  const { lang } = await params;
  const sp = await searchParams;
  const t = getDict(lang);
  const counts = countsByCategory();
  const url = abs(href(lang, 'catalog'));
  return (
    <>
      <JsonLd
        data={pageGraph(lang, [
          webPageNode({ url, name: t.catalogue.title, description: fmt(t.catalogue.lead, { n: totalCodes() }), lang, type: 'CollectionPage' }),
          breadcrumbNode([
            { name: t.common.home, path: `/${lang}/` },
            { name: t.catalogue.title, path: href(lang, 'catalog') },
          ]),
        ])}
      />
      <PageHero
        photo="hall"
        title={t.catalogue.title}
        lead={fmt(t.catalogue.lead, { n: new Intl.NumberFormat(lang === 'ar' ? 'en' : lang).format(totalCodes()) })}
        crumbs={[{ name: t.common.home, href: `/${lang}/` }, { name: t.catalogue.title }]}
      />
      <section className="wrap" style={{ paddingTop: 8 }}>
        {BRAND_KEYS.map((b) => (
          <section key={b} style={{ marginTop: 36 }}>
            <h2 className="h3" style={{ marginBottom: 14 }}>
              <span className={`badge badge--${b}`}>{BRANDS[b].name}</span> {BRANDS[b].line[lang]}
            </h2>
            <ul className="cat-tiles">
              {CATEGORIES.filter((c) => c.brand === b && counts[c.key]).map((c) => (
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
        ))}
      </section>
      <CatalogView lang={lang} sp={sp} base={href(lang, 'catalog')} />
    </>
  );
}
