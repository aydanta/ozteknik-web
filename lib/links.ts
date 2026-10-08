import { SEGMENTS, href, type Locale } from './i18n';
import terms from '@/content/categories.json';

/** İstemci + sunucu ortak adres üreticileri (veritabanına dokunmaz) */
const CATS = terms.categories as unknown as { key: string; slug: Record<Locale, string>; drawing: string | null }[];
const DRAWING_FILE: Record<string, string> = {
  'torque-rod': 'torque-rod',
  'v-stay': 'v-stay',
  'tie-rod': 'tie-rod',
  'rod-end': 'rod-end',
  'stabilizer-link': 'stabilizer-link',
  'cab-tilting-cylinder': 'cab-tilting-cylinder',
  'cab-tilting-pump': 'cab-tilting-pump',
  'cab-latch': 'cab-latch',
  'steering-cylinder': 'steering-cylinder',
  'axle-lift-cylinder': 'axle-lift-cylinder',
  'hydraulic-repair-kit': 'hydraulic-repair-kit',
  'connection-components': 'connection-components',
  'attachment-kit': 'attachment-kit',
  'clutch-kit': 'clutch-kit',
  'pressure-plate': 'pressure-plate',
  'release-bearing': 'release-bearing',
  'clutch-disc': 'clutch-kit',
  'repair-kit': 'rod-end',
};

export const productHref = (lang: Locale, slug: string) => `/${lang}/${SEGMENTS.product[lang]}/${slug}/`;
export const oeHref = (lang: Locale, norm: string) => `/${lang}/oe/${norm.toLowerCase()}/`;
export const brandHref = (lang: Locale, brand: string) => `/${lang}/${brand}/`;
export const categoryHref = (lang: Locale, key: string) => {
  const c = CATS.find((x) => x.key === key);
  return c ? `/${lang}/${SEGMENTS.catalog[lang]}/${c.slug[lang]}/` : href(lang, 'catalog');
};
export const drawingFor = (category: string): string | null => (DRAWING_FILE[category] ? `/drawings/${DRAWING_FILE[category]}.webp` : null);
export const mediaSrc = (file: string, w?: number) => `/media/${file}${w ? `?w=${w}` : ''}`;
export const mediaSrcSet = (file: string, maxW: number) =>
  [400, 800, 1600, 2400]
    .filter((w) => w <= Math.max(400, maxW))
    .map((w) => `/media/${file}?w=${w} ${w}w`)
    .join(', ');
