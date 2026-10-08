import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import { Breadcrumbs } from '@/components/layout/Footer';
import ProductCard from '@/components/catalog/ProductCard';
import { CopyButton } from '@/components/quote/QuoteWidgets';
import { href, type Locale } from '@/lib/i18n';
import { BRANDS, CATEGORY, allLite, oeLookup, compactOe } from '@/lib/catalog';
import { oeHref, productHref } from '@/lib/links';
import { abs, alternates, breadcrumbNode, webPageNode, IS_STAGING } from '@/lib/seo';
import { pageGraph } from '@/lib/graph';
import { normKey } from '@/lib/search';
import { getDict, fmt } from '@/content/i18n';
import { COPY } from '@/content/product-copy';

type P = { params: Promise<{ lang: Locale; number: string }> };
export const revalidate = 86400;
export const dynamicParams = true; // [lang] düzenindeki false değeri miras kalmasın: sayfalar istek üzerine üretilir (ISR)
export function generateStaticParams() {
  return [];
}

function load(raw: string) {
  const norm = normKey(decodeURIComponent(raw));
  const hits = oeLookup(norm);
  if (!hits.length) return null;
  const lite = new Map(allLite().map((l) => [l.slug, l]));
  const products = [...new Set(hits.map((h) => h.slug))].map((s) => lite.get(s)!).filter(Boolean);
  const oe = hits.find((h) => h.kind === 'oe');
  const cross = hits.find((h) => h.kind === 'cross');
  const make = oe?.make ?? null;
  const display = oe?.display ?? cross?.display ?? norm;
  const compact = oe ? compactOe({ make, norm }) : norm;
  const variants = [...new Set([display, compact, norm, make === 'Mercedes-Benz' ? `A${norm}` : '', /^\d{11}$/.test(norm) && make === 'MAN' ? `${norm.slice(0, 2)}.${norm.slice(2, 7)}.${norm.slice(7)}` : ''].filter(Boolean))];
  return { norm, products, make, display, compact, variants, isCross: !oe, crossBrand: cross?.make ?? null };
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, number } = await params;
  const d = load(number);
  if (!d) return { robots: { index: false } };
  const t = getDict(lang);
  const first = d.products[0];
  const type = CATEGORY[first.category].one[lang];
  const label = d.isCross ? `${d.crossBrand} ${d.display}` : `${d.make ? `${d.make} ` : ''}OE ${d.compact}`;
  const title = `${label} → ${BRANDS[first.brand].name} ${first.code} ${type}`;
  const description = `${fmt(t.oe.lead, { make: d.make ? `${d.make} ` : '', number: d.display }).replace(/:$/, '')} ${d.products.map((p) => p.code).slice(0, 4).join(', ')}. ${t.oe.alsoWritten}: ${d.variants.slice(0, 3).join(', ')}.`;
  return {
    title: title.length > 66 ? `${label} → ${first.code} ${type}` : title,
    description: description.slice(0, 158),
    alternates: alternates((l) => oeHref(l, d.norm), lang),
    robots: IS_STAGING ? { index: false } : { index: true, follow: true, 'max-image-preview': 'large' },
  };
}

export default async function OePage({ params }: P) {
  const { lang, number } = await params;
  const d = load(number);
  if (!d) notFound();
  if (number !== d.norm.toLowerCase()) permanentRedirect(oeHref(lang, d.norm));
  const t = getDict(lang);
  const url = abs(oeHref(lang, d.norm));
  const heading = d.isCross ? `${d.crossBrand} ${d.display}` : `OE ${d.display}`;
  const lead = d.isCross
    ? `${t.product.cross}: ${d.crossBrand} ${d.display}`
    : fmt(t.oe.lead, { make: d.make ? `${d.make} ` : '', number: d.display });
  return (
    <>
      <JsonLd
        data={pageGraph(lang, [
          webPageNode({ url, name: heading, description: lead, lang, type: 'CollectionPage' }),
          breadcrumbNode([
            { name: t.common.home, path: `/${lang}/` },
            { name: t.catalogue.title, path: href(lang, 'catalog') },
            { name: heading, path: oeHref(lang, d.norm) },
          ]),
          {
            '@type': 'ItemList',
            name: lead,
            itemListElement: d.products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(productHref(lang, p.slug)), name: `${BRANDS[p.brand].name} ${p.code}` })),
          },
        ])}
      />
      <Breadcrumbs items={[{ name: t.common.home, href: `/${lang}/` }, { name: t.catalogue.title, href: href(lang, 'catalog') }, { name: heading }]} />
      <section className="wrap" style={{ paddingBlock: '24px 96px' }}>
        <div className="stack" style={{ maxWidth: 860, gap: 18 }}>
          {d.make && <span className="eyebrow">{d.make}</span>}
          <h1 className="d4">
            <span className="mono">{heading}</span>
          </h1>
          <p className="lead">{lead}</p>
          <p className="small muted">
            {t.oe.alsoWritten}:{' '}
            {d.variants.map((v) => (
              <span key={v} className="code" style={{ marginInlineEnd: 8 }}>
                {v}
                <CopyButton value={v} label={t.common.copy} copied={t.common.copied} />
              </span>
            ))}
          </p>
        </div>
        <ul className="products-grid" style={{ marginTop: 32 }}>
          {d.products.map((p, i) => (
            <ProductCard key={p.slug} p={p} lang={lang} eager={i < 4} />
          ))}
        </ul>
        <p className="note" style={{ marginTop: 32 }}>
          {COPY[lang].oeDisclaimer}
        </p>
      </section>
    </>
  );
}
