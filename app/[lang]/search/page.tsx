import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import PageHero from '@/components/PageHero';
import InlineSearch from '@/components/search/InlineSearch';
import MultiSearch from '@/components/search/MultiSearch';
import ProductCard from '@/components/catalog/ProductCard';
import { href, type Locale } from '@/lib/i18n';
import { allLite, CATEGORY, makesForBrand } from '@/lib/catalog';
import { search, logMiss } from '@/lib/search';
import { categoryHref } from '@/lib/links';
import { baseMeta, webPageNode, abs } from '@/lib/seo';
import { pageGraph } from '@/lib/graph';
import { searchProps } from '@/lib/site';
import { getDict, fmt } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }>; searchParams: Promise<Record<string, string | undefined>> };

export async function generateMetadata({ params, searchParams }: P): Promise<Metadata> {
  const { lang } = await params;
  const sp = await searchParams;
  const t = getDict(lang);
  // iç arama sonuçları dizine girmez (ince sayfa); boş arama sayfası girer
  return baseMeta({ lang, title: t.search.pageTitle, description: t.search.pageLead.slice(0, 155), path: (l) => href(l, 'search'), noindex: !!(sp.q || sp.make) });
}

export default async function SearchPage({ params, searchParams }: P) {
  const { lang } = await params;
  const sp = await searchParams;
  const t = getDict(lang);
  const q = (sp.q || '').slice(0, 80);
  const res = q ? search(q, 24) : null;
  if (res && res.mode === 'none') logMiss(q, lang);
  const lite = new Map(allLite().map((l) => [l.slug, l]));
  const make = sp.make;
  const model = (sp.model || '').toLowerCase();
  const makes = makesForBrand().slice(0, 60);
  const vehicleRows = make ? allLite().filter((r) => r.makes.includes(make) && (!model || r.models.some((m) => m.toLowerCase().includes(model)))) : [];
  const byCat = new Map<string, number>();
  vehicleRows.forEach((r) => byCat.set(r.category, (byCat.get(r.category) || 0) + 1));
  const models = make
    ? [...new Set(allLite().filter((r) => r.makes.length === 1 && r.makes[0] === make).flatMap((r) => r.models))]
        .filter((m) => m.length < 28)
        .sort()
        .slice(0, 300)
    : [];

  const mt = {
    multiTitle: t.search.multiTitle,
    multiPlaceholder: t.search.multiPlaceholder,
    upload: t.search.upload,
    run: t.search.run,
    lines: t.search.lines,
    matched: t.search.matched,
    multiple: t.search.multiple,
    fuzzy: t.search.fuzzy,
    none: t.search.none,
    addMatched: t.search.addMatched,
    input: t.search.input,
    qty: t.search.qty,
    result: t.search.result,
    sendNumber: t.search.sendNumber,
    notFoundHref: href(lang, 'contact'),
    quoteHref: href(lang, 'quote'),
    quoteList: t.nav.quoteList,
  };

  return (
    <>
      <JsonLd data={pageGraph(lang, [webPageNode({ url: abs(href(lang, 'search')), name: t.search.pageTitle, description: t.search.pageLead, lang, type: 'SearchResultsPage' })])} />
      <PageHero photo="cad" title={t.search.pageTitle} lead={t.search.pageLead} crumbs={[{ name: t.common.home, href: `/${lang}/` }, { name: t.nav.search }]}>
        <nav className="tabs" aria-label={t.nav.search}>
          <a href="#single" aria-current="page">
            {t.search.tabSingle}
          </a>
          <a href="#multi">{t.search.tabMulti}</a>
          <a href="#vehicle">{t.search.tabVehicle}</a>
        </nav>
      </PageHero>

      <section id="single" className="wrap" style={{ paddingBlock: '40px 64px' }}>
        <InlineSearch lang={lang} action={href(lang, 'search')} t={searchProps(lang)} defaultValue={q} />
        {res && (
          <div style={{ marginTop: 28 }}>
            {res.hits.length ? (
              <>
                <p className="muted" style={{ marginBottom: 16 }}>
                  {res.mode !== 'exact' && <b>{t.search.similar}: </b>}
                  {fmt(t.catalogue.results, { n: res.hits.length })} · <span className="mono">{q}</span>
                </p>
                <ul className="products-grid">
                  {res.hits.map((h) => (lite.get(h.slug) ? <ProductCard key={h.slug} p={lite.get(h.slug)!} lang={lang} /> : null))}
                </ul>
              </>
            ) : (
              <div className="empty">
                <p>{fmt(t.search.noResults, { q })}</p>
                <a className="btn btn--primary" href={`${href(lang, 'contact')}?number=${encodeURIComponent(q)}`}>
                  {t.search.sendNumber}
                </a>
              </div>
            )}
          </div>
        )}
      </section>

      <section id="multi" className="wrap section-sm" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="section-head">
          <h2 className="h1">{t.search.multiTitle}</h2>
          <p className="lead">{t.search.multiLead}</p>
        </div>
        <MultiSearch lang={lang} t={mt} />
      </section>

      <section id="vehicle" className="wrap section-sm" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="section-head">
          <h2 className="h1">{t.search.vehicleTitle}</h2>
          <p className="lead">{t.search.vehicleLead}</p>
        </div>
        <form className="row" action={`${href(lang, 'search')}#vehicle`} method="get" style={{ alignItems: 'end' }}>
          <div className="field">
            <label htmlFor="v-make">{t.search.make}</label>
            <select id="v-make" className="select" name="make" defaultValue={make ?? ''} style={{ minWidth: 220 }}>
              <option value="">{t.search.chooseMake}</option>
              {makes.map((m) => (
                <option key={m.make} value={m.make}>
                  {m.make} ({m.n})
                </option>
              ))}
            </select>
          </div>
          {make && (
            <div className="field">
              <label htmlFor="v-model">{t.search.model}</label>
              <input id="v-model" className="input" name="model" list="v-models" defaultValue={sp.model ?? ''} placeholder={t.search.anyModel} style={{ minWidth: 220 }} />
              <datalist id="v-models">
                {models.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
          )}
          <button className="btn btn--primary" type="submit">
            {t.search.showParts}
          </button>
        </form>
        <p className="note" style={{ marginTop: 10 }}>
          {t.search.yearsNote}
        </p>
        {make && (
          <ul className="cat-tiles" style={{ marginTop: 24 }}>
            {[...byCat.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([k, n]) => (
                <li key={k}>
                  <a className="cat-tile" href={`${categoryHref(lang, k)}?make=${encodeURIComponent(make)}${model ? `&model=${encodeURIComponent(sp.model!)}` : ''}`}>
                    <strong>{CATEGORY[k as keyof typeof CATEGORY].many[lang]}</strong>
                    <span className="muted small mono">{fmt(t.common.products, { n })}</span>
                  </a>
                </li>
              ))}
            {!byCat.size && <li className="muted">{t.catalogue.noResults}</li>}
          </ul>
        )}
      </section>
    </>
  );
}
