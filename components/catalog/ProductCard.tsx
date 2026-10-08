import { AddToQuote } from '@/components/quote/QuoteWidgets';
import { BRANDS, CATEGORY, type Lite } from '@/lib/catalog';
import { drawingFor, mediaSrc, productHref } from '@/lib/links';
import type { Locale } from '@/lib/i18n';
import { getDict, fmt } from '@/content/i18n';
import { COPY, vehicleClass } from '@/content/product-copy';

/** Ürün kartı: fotoğraf / teknik çizim geçişi (hover, yalnız masaüstü), kod, marka rozeti, OE sayısı, "listeye ekle" */
export default function ProductCard({ p, lang, eager = false }: { p: Lite; lang: Locale; eager?: boolean }) {
  const t = getDict(lang);
  const type = CATEGORY[p.category].one[lang];
  const drawing = drawingFor(p.category);
  const alt = COPY[lang].alt({ brand: BRANDS[p.brand].name, code: p.code, type, make: p.firstOeMake, cls: vehicleClass(p.makes), oe: p.firstOe, angle: COPY[lang].angle.front });
  return (
    <li className="pcard">
      <div className="pcard-media">
        {p.image ? (
          <img
            className="pcard-photo"
            src={mediaSrc(p.image.file, 400)}
            srcSet={`${mediaSrc(p.image.file, 400)} 400w, ${mediaSrc(p.image.file, 800)} 800w`}
            sizes="(max-width: 560px) 50vw, 260px"
            alt={alt}
            width={p.image.width || 400}
            height={p.image.height || 300}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : null}
        {drawing && <img className="pcard-drawing drawing-on-white" src={drawing} alt="" loading="lazy" aria-hidden />}
      </div>
      <div className="pcard-body">
        <span className={`badge badge--${p.brand}`} style={{ justifySelf: 'start' }}>
          {BRANDS[p.brand].name}
        </span>
        <a href={productHref(lang, p.slug)} className="pcard-code">
          {p.code}
        </a>
        <span className="pcard-meta">{type}</span>
        {p.firstOe && (
          <span className="pcard-meta mono small">
            OE {p.firstOeMake ? `${p.firstOeMake} ` : ''}
            {p.firstOe}
            {p.oeCount > 1 ? ` · ${fmt(t.catalogue.oeCount, { n: p.oeCount })}` : ''}
          </span>
        )}
      </div>
      <div className="pcard-foot">
        <AddToQuote slug={p.slug} code={p.code} size="sm" t={{ add: t.quote.add, added: t.quote.added, qty: t.quote.qty }} />
      </div>
    </li>
  );
}
