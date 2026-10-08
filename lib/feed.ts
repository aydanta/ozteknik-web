import { activeSlugs, getProductsBySlugs, CATEGORY, BRANDS } from './catalog';
import { productHref, mediaSrc } from './links';
import { abs } from './seo';

/** Açık katalog verisi (şartname GEO §8): kod, marka, ürün tipi, OE'ler, araç markaları, sayfa adresi, görsel */
export function feedRows() {
  const slugs = activeSlugs().map((s) => s.slug);
  const out = [];
  for (let i = 0; i < slugs.length; i += 400) {
    for (const p of getProductsBySlugs(slugs.slice(i, i + 400))) {
      out.push({
        code: p.code,
        brand: BRANDS[p.brand].name,
        product_type: CATEGORY[p.category].one.en,
        category: p.category,
        oe: p.oe.map((o) => ({ make: o.make, number: o.norm, display: o.display })),
        cross_references: p.cross.map((x) => ({ brand: x.brand, number: x.norm })),
        vehicle_makes: p.makes,
        models: p.models,
        specs: Object.fromEntries(p.specs.map((s) => [s.key, s.unit ? `${s.value} ${s.unit}` : s.value])),
        url: abs(productHref('en', p.slug)),
        image_url: p.images[0] ? abs(mediaSrc(p.images[0].file)) : null,
        updated_at: p.updatedAt,
      });
    }
  }
  return out;
}
