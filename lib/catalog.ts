import { db, catalogVersion } from './db';
import terms from '@/content/categories.json';
import type { BrandKey, CategoryKey, Product } from './types';
import { LOCALES, type Locale } from './i18n';

/* ---------------- sözlük ---------------- */
type L10n = Record<Locale, string>;
export interface CategoryDef {
  key: CategoryKey;
  brand: BrandKey;
  drawing: string | null;
  size: string[];
  fields: string[];
  one: L10n;
  many: L10n;
  slug: L10n;
  legacy: string[];
}
export const CATEGORIES = terms.categories as unknown as CategoryDef[];
export const CATEGORY = Object.fromEntries(CATEGORIES.map((c) => [c.key, c])) as Record<CategoryKey, CategoryDef>;
export const BRANDS = terms.brands as unknown as Record<BrandKey, { name: string; line: L10n; legacyHosts: string[] }>;
export const BRAND_KEYS: BrandKey[] = ['egerot', 'hydcab', 'revol'];
export const FIELDS = terms.fields as unknown as Record<string, { unit: string; label: L10n }>;

export const categoryBySlug = (lang: Locale, slug: string) => CATEGORIES.find((c) => c.slug[lang] === slug);
export const UPLOADS = 'https://ozteknikoto.com/wp-content/uploads/';

/* ---------------- ürün okuma ---------------- */
interface Row {
  doc: string;
}
const parse = (r: Row | undefined): Product | null => (r ? (JSON.parse(r.doc) as Product) : null);

export function getProduct(slug: string, opts: { includeDraft?: boolean } = {}): Product | null {
  const p = parse(db().prepare('select doc from products where slug = ?').get(slug) as Row | undefined);
  if (!p) return null;
  if (!opts.includeDraft && p.status !== 'active') return null;
  return p;
}

export function getProductsBySlugs(slugs: string[]): Product[] {
  if (!slugs.length) return [];
  const q = db().prepare(`select doc from products where status = 'active' and slug in (${slugs.map(() => '?').join(',')})`);
  const rows = q.all(...slugs) as unknown as Row[];
  const map = new Map(rows.map((r) => [JSON.parse(r.doc).slug as string, JSON.parse(r.doc) as Product]));
  return slugs.map((s) => map.get(s)).filter(Boolean) as Product[];
}

export function activeSlugs(): { slug: string; updated_at: string }[] {
  return db().prepare(`select slug, updated_at from products where status = 'active' order by slug`).all() as unknown as {
    slug: string;
    updated_at: string;
  }[];
}

/* ---------------- bellek içi katalog (filtre ve sayımlar için) ---------------- */
export interface Lite {
  slug: string;
  code: string;
  brand: BrandKey;
  category: CategoryKey;
  makes: string[];
  models: string[];
  oeCount: number;
  firstOe: string | null;
  firstOeMake: string | null;
  image: { file: string; width: number; height: number } | null;
  specs: Record<string, string>;
  updatedAt: string;
}

let liteCache: { v: number; at: number; rows: Lite[] } | null = null;
export function allLite(): Lite[] {
  const v = catalogVersion();
  if (liteCache && liteCache.v === v && Date.now() - liteCache.at < 60_000) return liteCache.rows;
  const rows = (db().prepare(`select doc from products where status = 'active'`).all() as unknown as Row[]).map((r) => {
    const p = JSON.parse(r.doc) as Product;
    const img = p.images[0];
    return {
      slug: p.slug,
      code: p.code,
      brand: p.brand,
      category: p.category,
      makes: p.makes,
      models: p.models,
      oeCount: p.oe.length,
      firstOe: p.oe[0]?.display ?? null,
      firstOeMake: p.oe[0]?.make ?? null,
      image: img ? { file: img.file, width: img.width, height: img.height } : null,
      specs: Object.fromEntries(p.specs.map((s) => [s.key, s.value])),
      updatedAt: p.updatedAt,
    } satisfies Lite;
  });
  rows.sort((a, b) => a.code.localeCompare(b.code, 'en', { numeric: true }));
  liteCache = { v, at: Date.now(), rows };
  return rows;
}

export function countsByCategory(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of allLite()) out[r.category] = (out[r.category] || 0) + 1;
  return out;
}
export function countsByBrand(): Record<BrandKey, number> {
  const out = { egerot: 0, hydcab: 0, revol: 0 } as Record<BrandKey, number>;
  for (const r of allLite()) out[r.brand]++;
  return out;
}
export function totalCodes(): number {
  return (db().prepare(`select count(*) n from products where status != 'archive'`).get() as { n: number }).n;
}
export function makesForBrand(brand?: BrandKey, category?: CategoryKey): { make: string; n: number }[] {
  const m = new Map<string, number>();
  for (const r of allLite()) {
    if (brand && r.brand !== brand) continue;
    if (category && r.category !== category) continue;
    for (const k of r.makes) m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].map(([make, n]) => ({ make, n })).sort((a, b) => b.n - a.n);
}

/* ---------------- filtreleme (sunucu taraflı sayfalama) ---------------- */
export interface Filter {
  brand?: BrandKey;
  category?: CategoryKey;
  make?: string;
  model?: string;
  /** ölçü aralığı (mm): tube / length / diameter */
  dim?: string;
  min?: number;
  max?: number;
  q?: string;
  page?: number;
  per?: number;
}
const toNum = (v: string | undefined) => {
  if (!v) return NaN;
  const n = parseFloat(v.split('/')[0].replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
};
export function filterProducts(f: Filter) {
  const per = f.per ?? 24;
  let rows = allLite();
  if (f.brand) rows = rows.filter((r) => r.brand === f.brand);
  if (f.category) rows = rows.filter((r) => r.category === f.category);
  if (f.make) rows = rows.filter((r) => r.makes.includes(f.make!));
  if (f.model) rows = rows.filter((r) => r.models.some((m) => m.toLowerCase().includes(f.model!.toLowerCase())));
  if (f.dim && (f.min !== undefined || f.max !== undefined)) {
    rows = rows.filter((r) => {
      const v = toNum(r.specs[f.dim!]);
      if (!Number.isFinite(v)) return false;
      if (f.min !== undefined && v < f.min) return false;
      if (f.max !== undefined && v > f.max) return false;
      return true;
    });
  }
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / per));
  const page = Math.min(Math.max(1, f.page ?? 1), pages);
  return { total, page, pages, per, items: rows.slice((page - 1) * per, page * per) };
}

/** Kategoride kullanılabilir ölçü filtreleri ve aralıkları */
export function dimRanges(category: CategoryKey) {
  const def = CATEGORY[category];
  const out: { key: string; min: number; max: number }[] = [];
  for (const key of ['tube', 'length', 'diameter']) {
    if (!def.fields.includes(key)) continue;
    const vals = allLite()
      .filter((r) => r.category === category)
      .map((r) => toNum(r.specs[key]))
      .filter(Number.isFinite);
    if (vals.length > 3) out.push({ key, min: Math.min(...vals), max: Math.max(...vals) });
  }
  return out;
}

/* ---------------- OE açılış sayfası ---------------- */
export interface OeHit {
  norm: string;
  display: string;
  make: string | null;
  kind: 'oe' | 'cross' | 'code';
  slug: string;
}
export function oeLookup(norm: string): OeHit[] {
  return db()
    .prepare(
      `select r.norm, r.display, r.make, r.kind, r.slug from refs r join products p on p.slug = r.slug
       where r.norm = ? and p.status = 'active' and r.kind in ('oe','cross')`,
    )
    .all(norm) as unknown as OeHit[];
}
export function allOeNorms(): { norm: string; updated_at: string }[] {
  return db()
    .prepare(
      `select r.norm, max(p.updated_at) updated_at from refs r join products p on p.slug = r.slug
       where r.kind = 'oe' and p.status = 'active' group by r.norm order by r.norm`,
    )
    .all() as unknown as { norm: string; updated_at: string }[];
}

/* ---------------- ürün metni yardımcıları ---------------- */
export function productType(p: Pick<Product, 'category'>, lang: Locale) {
  return CATEGORY[p.category].one[lang];
}

/** Başlıktaki ölçü: kategoriye göre ("Ø50 740 mm", "430 mm", "M30x1.5") */
export function sizeLabel(p: Pick<Product, 'category' | 'specs'>): string {
  const def = CATEGORY[p.category];
  const v = (k: string) => p.specs.find((s) => s.key === k)?.value;
  const parts: string[] = [];
  for (const k of def.size) {
    const val = v(k);
    if (!val) continue;
    if (k === 'tube') parts.push(`Ø${val}`);
    else if (k === 'thread') parts.push(val.replace(/\s*(RHT|LHT)$/i, ''));
    else if (k === 'threadDiameter') parts.push(`Ø${val} mm`);
    else parts.push(`${val} mm`);
  }
  return parts.join(' ');
}

/** Normalize OE'nin sıkı yazımı (başlıkta kullanılır): Mercedes → "A0012509701" */
export const compactOe = (o: { make: string | null; norm: string }) =>
  o.make === 'Mercedes-Benz' && /^\d{10}$/.test(o.norm) ? `A${o.norm}` : o.norm;

export function primaryMake(p: Product): string | null {
  return p.oe[0]?.make ?? (p.makes.length === 1 ? p.makes[0] : null);
}

/** OE'leri araç üreticisine göre grupla (belirsiz üretici en sonda) */
export function groupOe(p: Product) {
  const groups = new Map<string, Product['oe']>();
  for (const o of p.oe) {
    const k = o.make ?? '';
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(o);
  }
  return [...groups.entries()].sort((a, b) => (a[0] === '' ? 1 : b[0] === '' ? -1 : 0));
}

export const imageUrl = (file: string) => `/media/${file}`;
export const localesWithProduct = (_p: Product): Locale[] => [...LOCALES];

/** İç bağlantı: aynı ürün tipinde, aynı araç markası için diğer ürünler */
export function relatedProducts(p: Product, limit = 8): Lite[] {
  const make = p.makes[0];
  const rows = allLite().filter((r) => r.category === p.category && r.slug !== p.slug);
  const same = make ? rows.filter((r) => r.makes.includes(make)) : rows;
  return (same.length >= 4 ? same : rows).slice(0, limit);
}

/** Kit bileşenleri ve bu ürünü içeren kitler */
export function kitLinks(p: Product): { contains: Lite[]; partOf: Lite[] } {
  const lite = allLite();
  const byCode = new Map(lite.map((l) => [l.code.replace(/\s/g, ''), l]));
  const contains = p.kit.map((k) => byCode.get(k.replace(/\s/g, ''))).filter(Boolean) as Lite[];
  const partOf: Lite[] = [];
  for (const r of db().prepare(`select doc from products where status = 'active' and category = 'clutch-kit' and doc like ?`).all(`%${p.code}%`) as unknown as Row[]) {
    const k = JSON.parse(r.doc) as Product;
    if (k.kit.includes(p.code)) {
      const l = lite.find((x) => x.slug === k.slug);
      if (l) partOf.push(l);
    }
  }
  return { contains, partOf };
}

/** Gerçek CAD modeli olan ürünler (GLB) — şartname: "30–50 çok satan üründe 3D" */
export const MODELS: Record<string, { src: string; poster: string }> = {
  'cd8-007-072': { src: '/models/revol-cd8-007-072-clutch-disc.glb', poster: '/drawings/clutch-kit.webp' },
};
