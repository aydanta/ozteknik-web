import Icon from '@/components/Icon';
import ProductCard from './ProductCard';
import { AddToQuote } from '@/components/quote/QuoteWidgets';
import { BRANDS, BRAND_KEYS, CATEGORIES, CATEGORY, FIELDS, countsByCategory, dimRanges, filterProducts, makesForBrand, type Filter } from '@/lib/catalog';
import { categoryHref, productHref, mediaSrc, brandHref } from '@/lib/links';
import { href, type Locale } from '@/lib/i18n';
import type { BrandKey, CategoryKey } from '@/lib/types';
import { getDict, fmt } from '@/content/i18n';

export type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

/** URL parametrelerinden filtre (sunucu taraflı sayfalama; katalog JS ile yüklenmez) */
export function readFilter(sp: SP, fixed: Partial<Filter> = {}): Filter {
  const num = (k: string) => {
    const v = parseFloat(one(sp[k]) || '');
    return Number.isFinite(v) ? v : undefined;
  };
  return {
    brand: (fixed.brand ?? (BRAND_KEYS.includes(one(sp.brand) as BrandKey) ? (one(sp.brand) as BrandKey) : undefined)) as BrandKey | undefined,
    category: fixed.category,
    make: one(sp.make),
    model: one(sp.model)?.slice(0, 40),
    dim: one(sp.dim),
    min: num('min'),
    max: num('max'),
    page: Math.max(1, Number(one(sp.page)) || 1),
    per: 24,
  };
}
export const isFiltered = (f: Filter) => !!(f.make || f.model || f.dim || f.min !== undefined || f.max !== undefined || (f.page && f.page > 1));

export default function CatalogView({ lang, sp, base, fixed = {} }: { lang: Locale; sp: SP; base: string; fixed?: Partial<Filter> }) {
  const t = getDict(lang);
  const f = readFilter(sp, fixed);
  const res = filterProducts(f);
  const view = one(sp.view) === 'list' ? 'list' : 'grid';
  const counts = countsByCategory();
  const makes = makesForBrand(f.brand, f.category).slice(0, 40);
  const dims = f.category ? dimRanges(f.category) : [];
  const qs = (patch: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const cur: Record<string, string | undefined> = { brand: fixed.brand ? undefined : f.brand, make: f.make, model: f.model, dim: f.dim, min: f.min?.toString(), max: f.max?.toString(), view: view === 'list' ? 'list' : undefined };
    for (const [k, v] of Object.entries({ ...cur, ...patch })) if (v !== undefined && v !== '') p.set(k, String(v));
    const s = p.toString();
    return s ? `${base}?${s}` : base;
  };

  return (
    <div className="catalog-layout wrap">
      <aside className="filters" id="filters" aria-label={t.catalogue.filters}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2>{t.catalogue.filters}</h2>
          {isFiltered(f) && (
            <a className="link small" href={base}>
              {t.catalogue.clear}
            </a>
          )}
        </div>
        {!fixed.brand && !fixed.category && (
          <div className="filter-group">
            <span className="label">{t.catalogue.brand}</span>
            <ul>
              {BRAND_KEYS.map((b) => (
                <li key={b}>
                  <a href={brandHref(lang, b)}>
                    {BRANDS[b].name} <span>{BRANDS[b].line[lang]}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="filter-group">
          <span className="label">{t.catalogue.category}</span>
          <ul>
            {CATEGORIES.filter((c) => counts[c.key] && (!f.brand || c.brand === f.brand)).map((c) => (
              <li key={c.key}>
                <a href={categoryHref(lang, c.key)} aria-current={c.key === f.category}>
                  {c.many[lang]} <span>{counts[c.key]}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <form className="filter-group" action={base} method="get">
          {view === 'list' && <input type="hidden" name="view" value="list" />}
          {!fixed.brand && f.brand && <input type="hidden" name="brand" value={f.brand} />}
          <label className="label" htmlFor="flt-make">
            {t.catalogue.make}
          </label>
          <select id="flt-make" className="select" name="make" defaultValue={f.make ?? ''}>
            <option value="">{t.catalogue.anyMake}</option>
            {makes.map((m) => (
              <option key={m.make} value={m.make}>
                {m.make} ({m.n})
              </option>
            ))}
          </select>
          <label className="label" htmlFor="flt-model">
            {t.catalogue.model}
          </label>
          <input id="flt-model" className="input" name="model" defaultValue={f.model ?? ''} placeholder="TGA, Actros, FH…" />
          {dims.length > 0 && (
            <>
              <label className="label" htmlFor="flt-dim">
                {t.catalogue.size}
              </label>
              <select id="flt-dim" className="select" name="dim" defaultValue={f.dim ?? dims[0].key}>
                {dims.map((d) => (
                  <option key={d.key} value={d.key}>
                    {FIELDS[d.key].label[lang]} ({d.min}–{d.max})
                  </option>
                ))}
              </select>
              <div className="range">
                <input className="input mono" name="min" type="number" step="any" placeholder={t.catalogue.from} defaultValue={f.min} aria-label={`${t.catalogue.size} ${t.catalogue.from}`} />
                <input className="input mono" name="max" type="number" step="any" placeholder={t.catalogue.to} defaultValue={f.max} aria-label={`${t.catalogue.size} ${t.catalogue.to}`} />
              </div>
            </>
          )}
          <button className="btn btn--primary" type="submit">
            <Icon name="filter" size={16} /> {t.catalogue.apply}
          </button>
        </form>
      </aside>

      <section aria-live="polite">
        <div className="toolbar">
          <p className="muted">
            <b style={{ color: 'var(--text)' }}>{fmt(t.catalogue.results, { n: res.total })}</b>
            {res.pages > 1 ? ` · ${fmt(t.common.page, { page: res.page, pages: res.pages })}` : ''}
          </p>
          <div className="row">
            <a className="btn btn--sm filter-open" href="#filters">
              <Icon name="filter" size={14} /> {t.catalogue.filters}
            </a>
            <nav className="view-toggle" aria-label="View">
              <a href={qs({ view: undefined, page: f.page && f.page > 1 ? f.page : undefined })} aria-current={view === 'grid'}>
                <Icon name="grid" size={14} /> {t.catalogue.grid}
              </a>
              <a href={qs({ view: 'list', page: f.page && f.page > 1 ? f.page : undefined })} aria-current={view === 'list'}>
                <Icon name="list" size={14} /> {t.catalogue.list}
              </a>
            </nav>
          </div>
        </div>

        {res.total === 0 ? (
          <div className="empty">
            <p>{t.catalogue.noResults}</p>
            <a className="btn" href={base}>
              {t.catalogue.clear}
            </a>
          </div>
        ) : view === 'grid' ? (
          <ul className="products-grid">
            {res.items.map((p, i) => (
              <ProductCard key={p.slug} p={p} lang={lang} eager={i < 4} />
            ))}
          </ul>
        ) : (
          <div className="table-wrap products-list">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only">{t.product.photo}</span>
                  </th>
                  <th scope="col">{t.product.partNumber}</th>
                  <th scope="col">{t.catalogue.category}</th>
                  <th scope="col">OE</th>
                  <th scope="col">{t.product.specs}</th>
                  <th scope="col">
                    <span className="sr-only">{t.quote.add}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {res.items.map((p) => (
                  <tr key={p.slug}>
                    <td>{p.image ? <img src={mediaSrc(p.image.file, 200)} alt="" loading="lazy" width={72} height={54} /> : null}</td>
                    <td>
                      <a className="mono" href={productHref(lang, p.slug)} style={{ fontWeight: 600 }}>
                        {p.code}
                      </a>
                      <br />
                      <span className={`badge badge--${p.brand}`}>{BRANDS[p.brand].name}</span>
                    </td>
                    <td>{CATEGORY[p.category].one[lang]}</td>
                    <td className="mono small">
                      {p.firstOeMake ? `${p.firstOeMake} ` : ''}
                      {p.firstOe}
                      {p.oeCount > 1 ? <span className="muted"> +{p.oeCount - 1}</span> : null}
                    </td>
                    <td className="mono small">
                      {Object.entries(p.specs)
                        .filter(([k]) => k !== 'typeCode')
                        .slice(0, 3)
                        .map(([k, v]) => `${FIELDS[k]?.label[lang] ?? k}: ${v}${FIELDS[k]?.unit ? ` ${FIELDS[k].unit}` : ''}`)
                        .join(' · ')}
                    </td>
                    <td>
                      <AddToQuote slug={p.slug} code={p.code} size="sm" t={{ add: t.quote.add, added: t.quote.added, qty: t.quote.qty }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {res.pages > 1 && (
          <nav className="pager" aria-label="Pagination">
            {res.page > 1 ? (
              <a className="btn btn--sm" rel="prev" href={qs({ page: res.page > 2 ? res.page - 1 : undefined })}>
                ← {t.common.prev}
              </a>
            ) : (
              <span />
            )}
            <span className="muted small">{fmt(t.common.page, { page: res.page, pages: res.pages })}</span>
            {res.page < res.pages && (
              <a className="btn btn--sm" rel="next" href={qs({ page: res.page + 1 })}>
                {t.common.next} →
              </a>
            )}
          </nav>
        )}
      </section>
    </div>
  );
}

export const categoryFilter = (key: CategoryKey) => ({ category: key, brand: CATEGORY[key].brand });
export const catalogueHref = (lang: Locale) => href(lang, 'catalog');
