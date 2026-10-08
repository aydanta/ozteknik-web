import { statSync } from 'node:fs';
import path from 'node:path';
import { LOCALES, LOCALE_META, href, type Locale, type PageKey } from './i18n';
import { activeSlugs, allOeNorms, CATEGORIES, countsByCategory, BRAND_KEYS, getProductsBySlugs, CATEGORY, BRANDS } from './catalog';
import { brandHref, categoryHref, productHref, oeHref, mediaSrc } from './links';
import { abs, productCopy } from './seo';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const xml = (body: string, status = 200) =>
  new Response(body, { status, headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } });

const contentDate = (lang: Locale) => {
  try {
    return statSync(path.join(process.cwd(), 'content', 'pages', `${lang}.ts`)).mtime.toISOString();
  } catch {
    return new Date().toISOString();
  }
};

function urlEntry(loc: string, lastmod: string, alts?: (l: Locale) => string, images: { loc: string; caption: string }[] = []) {
  const links = alts
    ? LOCALES.map((l) => `<xhtml:link rel="alternate" hreflang="${LOCALE_META[l].bcp47}" href="${esc(abs(alts(l)))}"/>`).join('') +
      `<xhtml:link rel="alternate" hreflang="x-default" href="${esc(abs(alts('en')))}"/>`
    : '';
  const imgs = images.map((i) => `<image:image><image:loc>${esc(i.loc)}</image:loc><image:caption>${esc(i.caption)}</image:caption></image:image>`).join('');
  return `<url><loc>${esc(loc)}</loc><lastmod>${lastmod}</lastmod>${links}${imgs}</url>`;
}
const wrap = (entries: string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${entries.join('\n')}\n</urlset>`;

export const SITEMAP_TYPES = ['pages', 'categories', 'products', 'oe'] as const;
export type SitemapType = (typeof SITEMAP_TYPES)[number];

/** Dil ve tür bazlı site haritası; yalnız 200 dönen, indekslenebilir, kendi canonical'ı olan adresler */
export function buildSitemap(lang: Locale, type: SitemapType): string {
  const d = contentDate(lang);
  if (type === 'pages') {
    const keys: (PageKey | undefined)[] = [undefined, 'catalog', 'search', 'distributors', 'sample', 'dealers', 'quality', 'production', 'sustainability', 'about', 'media', 'contact', 'careers', 'imprint', 'accessibility', 'imageLicense'];
    if (lang === 'en' || lang === 'tr') keys.push('privacy', 'cookies');
    const entries = keys.map((k) => urlEntry(abs(href(lang, k)), d, (l) => href(l, k)));
    for (const b of BRAND_KEYS) entries.push(urlEntry(abs(brandHref(lang, b)), d, (l) => brandHref(l, b), [{ loc: abs(`/brand/${b}-logo.png`), caption: BRANDS[b].name }]));
    return wrap(entries);
  }
  if (type === 'categories') {
    const counts = countsByCategory();
    return wrap(
      CATEGORIES.filter((c) => counts[c.key]).map((c) =>
        urlEntry(abs(categoryHref(lang, c.key)), d, (l) => categoryHref(l, c.key), [{ loc: abs(`/drawings/${c.key === 'clutch-disc' ? 'clutch-kit' : c.key === 'repair-kit' ? 'rod-end' : c.key}.webp`), caption: `${BRANDS[c.brand].name} ${c.many[lang]}` }]),
      ),
    );
  }
  if (type === 'products') {
    const slugs = activeSlugs();
    const entries: string[] = [];
    for (let i = 0; i < slugs.length; i += 300) {
      for (const p of getProductsBySlugs(slugs.slice(i, i + 300).map((s) => s.slug))) {
        const c = productCopy(p, lang);
        entries.push(
          urlEntry(
            abs(productHref(lang, p.slug)),
            p.updatedAt,
            (l) => productHref(l, p.slug),
            p.images.map((img, k) => ({ loc: abs(mediaSrc(img.file)), caption: c.alt(k) })),
          ),
        );
      }
    }
    return wrap(entries);
  }
  return wrap(allOeNorms().map((o) => urlEntry(abs(oeHref(lang, o.norm)), o.updated_at)));
}

export function buildIndex(): string {
  const now = new Date().toISOString();
  const items = LOCALES.flatMap((l) => SITEMAP_TYPES.map((t) => `<sitemap><loc>${abs(`/sitemaps/${l}-${t}.xml`)}</loc><lastmod>${now}</lastmod></sitemap>`));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join('\n')}\n</sitemapindex>`;
}
export { CATEGORY };
