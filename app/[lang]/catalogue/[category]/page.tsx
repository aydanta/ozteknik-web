import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/layout/Footer';
import CatalogView, { readFilter, isFiltered, type SP } from '@/components/catalog/CatalogView';
import { href, type Locale } from '@/lib/i18n';
import { BRANDS, CATEGORY, categoryBySlug, countsByCategory, makesForBrand } from '@/lib/catalog';
import { brandHref, categoryHref, drawingFor } from '@/lib/links';
import { baseMeta, breadcrumbNode, faqNode, webPageNode, abs } from '@/lib/seo';
import { pageGraph } from '@/lib/graph';
import { getDict, fmt } from '@/content/i18n';
import { CATEGORY_FAQ } from '@/content/catalog-faq';

export const dynamicParams = true;
type P = { params: Promise<{ lang: Locale; category: string }>; searchParams: Promise<SP> };

function load(lang: Locale, slug: string) {
  const c = categoryBySlug(lang, decodeURIComponent(slug));
  if (!c || !countsByCategory()[c.key]) return null;
  return c;
}

export async function generateMetadata({ params, searchParams }: P): Promise<Metadata> {
  const { lang, category } = await params;
  const c = load(lang, category);
  if (!c) return {};
  const t = getDict(lang);
  const n = countsByCategory()[c.key];
  const brand = BRANDS[c.brand].name;
  const makes = makesForBrand(undefined, c.key).slice(0, 4).map((m) => m.make).join(', ');
  return baseMeta({
    lang,
    title: `${c.many[lang]} — ${brand} | ${makes}`.slice(0, 68),
    description: fmt(t.catalogue.categoryLead, { n, type: c.many[lang].toLowerCase(), brand }).slice(0, 158),
    path: (l) => categoryHref(l, c.key),
    noindex: isFiltered(readFilter(await searchParams)),
    image: drawingFor(c.key) ?? undefined,
  });
}

export default async function CategoryPage({ params, searchParams }: P) {
  const { lang, category } = await params;
  const c = load(lang, category);
  if (!c) notFound();
  const sp = await searchParams;
  const t = getDict(lang);
  const n = countsByCategory()[c.key];
  const brand = BRANDS[c.brand].name;
  const makes = makesForBrand(undefined, c.key);
  const faq = CATEGORY_FAQ[lang]({ one: c.one[lang], many: c.many[lang], n, makes: makes.slice(0, 6).map((m) => m.make).join(', '), brand });
  const url = abs(categoryHref(lang, c.key));
  const lead = fmt(t.catalogue.categoryLead, { n, type: c.many[lang].toLowerCase(), brand });
  return (
    <>
      <JsonLd
        data={pageGraph(lang, [
          webPageNode({ url, name: c.many[lang], description: lead, lang, type: 'CollectionPage' }),
          breadcrumbNode([
            { name: t.common.home, path: `/${lang}/` },
            { name: t.catalogue.title, path: href(lang, 'catalog') },
            { name: brand, path: brandHref(lang, c.brand) },
            { name: c.many[lang], path: categoryHref(lang, c.key) },
          ]),
          faqNode(faq, url),
        ])}
      />
      <Breadcrumbs
        items={[
          { name: t.common.home, href: `/${lang}/` },
          { name: t.catalogue.title, href: href(lang, 'catalog') },
          { name: brand, href: brandHref(lang, c.brand) },
          { name: c.many[lang] },
        ]}
      />
      <header className="wrap split" style={{ paddingTop: 24, alignItems: 'center' }}>
        <div className="stack">
          <span className={`badge badge--${c.brand}`} style={{ justifySelf: 'start' }}>
            {brand}
          </span>
          <h1 className="d4">{c.many[lang]}</h1>
          <p className="lead">{lead}</p>
          <ul className="row chips" aria-label={t.brand.makes}>
            {makes.slice(0, 10).map((m) => (
              <li key={m.make}>
                <a className="chip" href={`${categoryHref(lang, c.key)}?make=${encodeURIComponent(m.make)}`}>
                  {m.make} <span className="mono">{m.n}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        {drawingFor(c.key) && (
          <figure style={{ margin: 0 }}>
            <img className="drawing" src={drawingFor(c.key)!} alt={`${brand} ${c.one[lang]} — ${t.product.drawing}`} style={{ maxHeight: 280, width: '100%', objectFit: 'contain' }} />
          </figure>
        )}
      </header>
      <CatalogView lang={lang} sp={sp} base={categoryHref(lang, c.key)} fixed={{ category: c.key, brand: c.brand }} />
      <section className="wrap-narrow faq" style={{ paddingBottom: 96 }}>
        <h2 className="h2" style={{ marginBottom: 12 }}>
          {t.product.faq}
        </h2>
        {faq.map((f, i) => (
          <details key={i} open={i === 0}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>
    </>
  );
}
