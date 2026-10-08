import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import JsonLd from '@/components/JsonLd';
import Icon from '@/components/Icon';
import { Breadcrumbs } from '@/components/layout/Footer';
import ProductCard from '@/components/catalog/ProductCard';
import ModelViewer from '@/components/three/ModelViewer';
import { AddToQuote, CopyButton } from '@/components/quote/QuoteWidgets';
import { href, type Locale } from '@/lib/i18n';
import { BRANDS, CATEGORY, FIELDS, MODELS, getProduct, kitLinks, relatedProducts, compactOe } from '@/lib/catalog';
import { brandHref, categoryHref, drawingFor, mediaSrc, mediaSrcSet, oeHref, productHref } from '@/lib/links';
import { abs, alternates, breadcrumbNode, faqNode, productCopy, productNode, webPageNode, IS_STAGING } from '@/lib/seo';
import { pageGraph } from '@/lib/graph';
import { company, waHref } from '@/lib/site';
import { getDict, fmt } from '@/content/i18n';
import { COPY } from '@/content/product-copy';

type P = { params: Promise<{ lang: Locale; slug: string }> };

export const revalidate = 86400; // ISR: panelde değişince revalidatePath ile anında yenilenir
export const dynamicParams = true; // [lang] düzenindeki false değeri miras kalmasın: sayfalar istek üzerine üretilir (ISR)
export function generateStaticParams() {
  return []; // 21.000 sayfa istek üzerine üretilir ve CDN'de önbelleklenir
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  const c = productCopy(p, lang);
  const img = p.images[0];
  return {
    title: { absolute: c.title },
    description: c.description,
    alternates: alternates((l) => productHref(l, p.slug), lang),
    robots: IS_STAGING ? { index: false } : { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      type: 'website',
      url: abs(productHref(lang, p.slug)),
      title: c.title,
      description: c.description,
      siteName: 'Özteknik',
      images: img ? [{ url: mediaSrc(img.file, 1600), alt: c.alt(0) }] : [{ url: drawingFor(p.category) ?? '/og/ozteknik-og.png' }],
    },
    twitter: { card: 'summary_large_image', title: c.title, description: c.description, images: img ? [mediaSrc(img.file, 1600)] : [] },
  };
}

export default async function ProductPage({ params }: P) {
  const { lang, slug } = await params;
  const p = getProduct(slug);
  if (!p) {
    const lower = slug.toLowerCase();
    if (lower !== slug && getProduct(lower)) permanentRedirect(productHref(lang, lower));
    notFound();
  }
  const t = getDict(lang);
  const c = productCopy(p, lang);
  const def = CATEGORY[p.category];
  const brand = BRANDS[p.brand].name;
  const url = abs(productHref(lang, p.slug));
  const drawing = drawingFor(p.category);
  const model = MODELS[p.slug];
  const kit = kitLinks(p);
  const related = relatedProducts(p);
  const co = company();
  const mm = (s: string) => (lang === 'ru' ? s.replace(/\bmm\b/g, 'мм') : lang === 'ar' ? s.replace(/\bmm\b/g, 'مم') : s);
  const crumbs = [
    { name: t.common.home, path: `/${lang}/` },
    { name: t.catalogue.title, path: href(lang, 'catalog') },
    { name: brand, path: brandHref(lang, p.brand) },
    { name: def.many[lang], path: categoryHref(lang, p.category) },
    { name: p.code, path: productHref(lang, p.slug) },
  ];

  return (
    <article className="pdp">
      <JsonLd
        data={pageGraph(lang, [
          webPageNode({ url, name: c.title, description: c.description, lang, type: 'ItemPage', dateModified: p.updatedAt, about: `${url}#product` }),
          productNode(p, lang, url, c),
          breadcrumbNode(crumbs),
          faqNode(c.faq, url),
        ])}
      />
      <Breadcrumbs items={crumbs.map((x, i) => ({ name: x.name, href: i < crumbs.length - 1 ? x.path : undefined }))} />

      <div className="wrap pdp-top" style={{ paddingTop: 24 }}>
        {/* görsel alanı: fotoğraf + teknik çizim (+ 3D) — ana görsel HTML <img>, tembel yüklenmez, sabit adres */}
        <div className="pdp-gallery">
          <figure className="pdp-main-img" style={{ margin: 0 }}>
            {p.images[0] ? (
              <img
                src={mediaSrc(p.images[0].file)}
                srcSet={mediaSrcSet(p.images[0].file, p.images[0].width)}
                sizes="(max-width: 900px) 100vw, 640px"
                alt={c.alt(0)}
                width={p.images[0].width || 800}
                height={p.images[0].height || 600}
                fetchPriority="high"
              />
            ) : drawing ? (
              <img className="drawing-on-white" src={drawing} alt={`${brand} ${p.code} ${c.type} — ${t.product.drawing}`} />
            ) : null}
          </figure>
          <figcaption className="small muted">
            {brand} {p.code} · {c.type}
            {p.images[0]?.width && p.images[0].width < 1200 ? ` · ${t.product.imageNote}` : ''}
          </figcaption>
          <div className="pdp-thumbs">
            {p.images.slice(1).map((img, i) => (
              <figure key={img.file}>
                <img src={mediaSrc(img.file, 400)} alt={c.alt(i + 1)} loading="lazy" width={img.width} height={img.height} />
              </figure>
            ))}
            {drawing && (
              <figure className="is-drawing" title={t.product.drawing}>
                <img className="drawing" src={drawing} alt={`${c.type} — ${t.product.drawing}`} loading="lazy" />
              </figure>
            )}
          </div>
          {model && <ModelViewer src={model.src} poster={model.poster} label={t.product.view3d} explodeLabel={t.home.layers} />}
        </div>

        <div className="pdp-head">
          <div className="row">
            <span className={`badge badge--${p.brand}`}>{brand}</span>
            <span className="chip">{t.product.madeIn}</span>
            <span className="chip">{t.product.certified}</span>
          </div>
          <h1>
            <span className="mono">{p.code}</span> {c.type}
          </h1>
          <p className="pdp-summary">{c.summary}</p>

          <div className="cta-box no-print">
            <strong>{t.product.ctaTitle}</strong>
            <p className="small muted">{t.product.ctaLead}</p>
            <AddToQuote slug={p.slug} code={p.code} withQty size="lg" t={{ add: t.quote.add, added: t.quote.added, qty: t.quote.qty }} />
            <div className="row">
              <a className="btn btn--sm" href={`${href(lang, 'sample')}?code=${encodeURIComponent(p.code)}`}>
                {t.product.sample}
              </a>
              {co.whatsapp ? (
                <a className="btn btn--sm" href={waHref(co.whatsapp, fmt(t.product.whatsappText, { code: p.code }))} target="_blank" rel="noopener">
                  <Icon name="whatsapp" size={16} /> {t.product.whatsapp}
                </a>
              ) : (
                <a className="btn btn--sm" href={`mailto:${co.email}?subject=${encodeURIComponent(`${p.code} — ${c.type}`)}`}>
                  <Icon name="mail" size={16} /> {co.email}
                </a>
              )}
            </div>
          </div>

          <div className="table-wrap">
            <table className="table spec-table">
              <caption className="sr-only">{t.product.specs}</caption>
              <tbody>
                <tr>
                  <th scope="row">{t.product.partNumber}</th>
                  <td>
                    <span className="code">
                      {p.code}
                      <CopyButton value={p.code} label={t.common.copy} copied={t.common.copied} />
                    </span>
                  </td>
                </tr>
                <tr>
                  <th scope="row">{t.product.brand}</th>
                  <td>
                    <a href={brandHref(lang, p.brand)}>{brand}</a>
                  </td>
                </tr>
                <tr>
                  <th scope="row">{t.product.category}</th>
                  <td>
                    <a href={categoryHref(lang, p.category)}>{c.type}</a>
                  </td>
                </tr>
                {p.specs.map((s) => (
                  <tr key={s.key}>
                    <th scope="row">{FIELDS[s.key]?.label[lang] ?? s.key}</th>
                    <td>
                      {s.key === 'tube' ? 'Ø' : ''}
                      {s.value}
                      {s.unit ? ` ${mm(s.unit)}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="wrap">
        {/* OE referansları — araç üreticisine göre; her numara OE sayfasına bağlanır; boşluklu + boşluksuz yazım */}
        <section className="pdp-section" aria-labelledby="oe">
          <h2 id="oe">{t.product.oeRefs}</h2>
          <p className="muted small">{t.product.oeRefsLead}</p>
          {c.groups.map(([make, list]) => (
            <div key={make || 'x'} className="oe-group">
              <h3>{make ? `${make} OE` : t.product.oeUnassigned}</h3>
              <ul className="oe-chips">
                {list.map((o) => {
                  const compact = compactOe(o);
                  return (
                    <li key={o.norm} className="code">
                      <a href={oeHref(lang, o.norm)}>{o.display}</a>
                      {compact !== o.display && <span className="alt">{compact}</span>}
                      <CopyButton value={compact} label={t.common.copy} copied={t.common.copied} />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          <p className="note">{COPY[lang].oeDisclaimer}</p>
        </section>

        {p.cross.length > 0 && (
          <section className="pdp-section" aria-labelledby="cross">
            <h2 id="cross">{t.product.cross}</h2>
            <ul className="oe-chips">
              {p.cross.map((x) => (
                <li key={x.norm} className="code">
                  <a href={oeHref(lang, x.norm)}>
                    {x.brand} {x.value}
                  </a>
                  <CopyButton value={x.norm} label={t.common.copy} copied={t.common.copied} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {(p.makes.length > 0 || p.models.length > 0) && (
          <section className="pdp-section" aria-labelledby="veh">
            <h2 id="veh">{t.product.vehicles}</h2>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">{t.product.vehiclesMake}</th>
                    <th scope="col">{t.product.vehiclesModels}</th>
                    <th scope="col">{t.product.vehiclesYears}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{p.makes.join(', ') || '—'}</td>
                    <td>{p.models.join(' · ') || '—'}</td>
                    <td className="muted small">{t.product.yearsPending}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {(kit.contains.length > 0 || kit.partOf.length > 0) && (
          <section className="pdp-section" aria-labelledby="kit">
            <h2 id="kit">{t.product.kit}</h2>
            <ul className="products-grid">
              {[...kit.contains, ...kit.partOf].map((k) => (
                <ProductCard key={k.slug} p={k} lang={lang} />
              ))}
            </ul>
          </section>
        )}

        <section className="pdp-section" aria-labelledby="docs">
          <h2 id="docs">{t.product.documents}</h2>
          <ul className="doc-list">
            <li>
              <span>
                <Icon name="file" size={16} /> {t.product.docAssembly}
              </span>
              <span className="muted small">{t.product.onRequest}</span>
            </li>
            <li>
              <span>
                <Icon name="file" size={16} /> {t.product.docDrawing}
              </span>
              <span className="muted small">{t.product.onRequest}</span>
            </li>
            <li>
              <span>
                <Icon name="cert" size={16} /> {t.product.docCertificate}
              </span>
              <a className="link small" href={href(lang, 'quality')}>
                {t.quality.view} →
              </a>
            </li>
          </ul>
        </section>

        <section className="pdp-section faq" aria-labelledby="faq">
          <h2 id="faq">{t.product.faq}</h2>
          <div>
            {c.faq.map((f, i) => (
              <details key={i} open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="pdp-section" aria-labelledby="rel">
            <h2 id="rel">{fmt(t.product.related, { type: def.many[lang], make: p.makes[0] ?? '' }).replace(/\s+$/, '')}</h2>
            <ul className="products-grid">
              {related.map((r) => (
                <ProductCard key={r.slug} p={r} lang={lang} />
              ))}
            </ul>
          </section>
        )}
        <p className="note" style={{ marginTop: 32 }}>
          {t.product.updated}: <time dateTime={p.updatedAt}>{p.updatedAt.slice(0, 10)}</time>
        </p>
      </div>
    </article>
  );
}
