import { revalidatePath } from 'next/cache';
import { db, now, audit, bumpCatalogVersion, getSetting } from './db';
import { LOCALES } from './i18n';
import { CATEGORY } from './catalog';
import { productHref, oeHref, categoryHref } from './links';
import { normKey } from './search';
import { indexNow } from './indexnow';
import type { Product, OeRef, CrossRef, Spec } from './types';

/** Sunucuda yeniden hesaplanan kalite bayrakları (yayın kapısı) */
export function qualityIssues(p: Product): string[] {
  const keep = p.issues.filter((i) => /^(brand-|spec-unmapped|code-prefix)/.test(i));
  const out = [...keep];
  if (!p.oe.length) out.push(p.cross.length ? 'oe-only-competitor' : 'oe-missing');
  if (!p.images.length) out.push('image-missing');
  if (p.images.some((i) => i.width && i.width < 1200)) out.push('image-lowres');
  if (p.images.some((i) => i.watermark)) out.push('image-watermark');
  if (!p.models.length) out.push('models-missing');
  if (p.oe.some((o) => !o.make)) out.push('oe-make-unassigned');
  if (CATEGORY[p.category].brand !== p.brand) out.push(`brand-mismatch:${p.brand}->${CATEGORY[p.category].brand}`);
  return [...new Set(out)];
}

export function gateErrors(p: Product): string[] {
  const g = getSetting('publishGate', { requireOe: true, requireImage: true });
  const e: string[] = [];
  if (g.requireOe && !p.oe.length) e.push('OE numarası olmayan ürün yayına alınamaz.');
  if (g.requireImage && !p.images.length) e.push('Görseli olmayan ürün yayına alınamaz.');
  if (CATEGORY[p.category].brand !== p.brand) e.push(`Marka kategoriyle uyuşmuyor (${CATEGORY[p.category].brand.toUpperCase()} olmalı).`);
  return e;
}

/** "Mercedes-Benz; A 001 250 97 01" satırları → OE listesi */
export function parseOe(text: string): OeRef[] {
  const seen = new Set<string>();
  const out: OeRef[] = [];
  for (const line of text.split(/\r?\n/)) {
    const [a, b] = line.includes(';') ? line.split(';') : ['', line];
    const value = (b ?? '').trim();
    if (!value) continue;
    const norm = normKey(value);
    if (seen.has(norm)) continue;
    seen.add(norm);
    const make = a.trim() || null;
    let display = value.toUpperCase();
    if (make === 'Mercedes-Benz' && /^\d{10}$/.test(norm)) display = `A ${norm.slice(0, 3)} ${norm.slice(3, 6)} ${norm.slice(6, 8)} ${norm.slice(8)}`;
    if (make === 'MAN' && /^\d{11}$/.test(norm)) display = `${norm.slice(0, 2)}.${norm.slice(2, 7)}-${norm.slice(7)}`;
    out.push({ make, value, norm, display });
  }
  return out;
}
export function parseCross(text: string): CrossRef[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.split(';'))
    .filter((p) => p[1]?.trim())
    .map(([brand, v]) => ({ brand: brand.trim(), value: v.trim(), norm: normKey(v) }));
}
export function parseSpecs(text: string): Spec[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.split('='))
    .filter((p) => p[0]?.trim() && p[1]?.trim())
    .map(([k, v]) => {
      const key = k.trim();
      const unit = ['tube', 'length', 'cone', 'outerDiameter', 'holeAxis', 'holeDiameter', 'thickness', 'threadDiameter', 'diameter'].includes(key) ? 'mm' : undefined;
      return { key, value: v.trim(), unit };
    });
}

/** Ürünü kaydet: belge + arama dizini + yalnız ilgili sayfaların yenilenmesi + IndexNow */
export async function saveProduct(prev: Product, next: Product, userEmail: string) {
  next.issues = qualityIssues(next);
  next.updatedAt = now();
  (next as Product & { edited?: boolean }).edited = true;
  const d = db();
  d.exec('begin');
  try {
    d.prepare('update products set code = ?, brand = ?, category = ?, status = ?, doc = ?, updated_at = ? where slug = ?').run(
      next.code,
      next.brand,
      next.category,
      next.status,
      JSON.stringify(next),
      next.updatedAt,
      prev.slug,
    );
    d.prepare('delete from refs where slug = ?').run(prev.slug);
    const add = d.prepare('insert into refs(norm, kind, display, make, slug) values(?,?,?,?,?)');
    add.run(normKey(next.code), 'code', next.code, null, prev.slug);
    for (const o of next.oe) add.run(o.norm, 'oe', o.display, o.make, prev.slug);
    for (const x of next.cross) add.run(x.norm, 'cross', x.value, x.brand, prev.slug);
    d.exec('commit');
  } catch (e) {
    d.exec('rollback');
    throw e;
  }
  bumpCatalogVersion();
  audit(userEmail, 'product-save', next.slug, `status ${prev.status}→${next.status}`);

  // veri değişince yalnızca ilgili sayfa yenilenir (şartname §Teknik kurallar — önbellek)
  const paths = new Set<string>();
  const norms = new Set([...prev.oe, ...next.oe].map((o) => o.norm));
  for (const l of LOCALES) {
    paths.add(productHref(l, next.slug));
    paths.add(`/${l}/product/${next.slug}/`);
    paths.add(categoryHref(l, next.category));
    for (const n of norms) paths.add(oeHref(l, n));
  }
  for (const p of paths) revalidatePath(p);
  revalidatePath('/sitemaps/[name]', 'page');
  const ping = next.status === 'active' ? await indexNow(LOCALES.map((l) => productHref(l, next.slug))) : { skipped: true };
  return { issues: next.issues, ping };
}

export function listProducts(f: { q?: string; brand?: string; category?: string; status?: string; issue?: string; page?: number }) {
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (f.brand) {
    where.push('p.brand = ?');
    args.push(f.brand);
  }
  if (f.category) {
    where.push('p.category = ?');
    args.push(f.category);
  }
  if (f.status) {
    where.push('p.status = ?');
    args.push(f.status);
  }
  if (f.issue) {
    where.push(`p.doc like ?`);
    args.push(`%"${f.issue}%`);
  }
  if (f.q) {
    const n = normKey(f.q);
    where.push('p.slug in (select slug from refs where norm like ?)');
    args.push(`${n}%`);
  }
  const w = where.length ? `where ${where.join(' and ')}` : '';
  const per = 50;
  const page = Math.max(1, f.page ?? 1);
  const total = (db().prepare(`select count(*) n from products p ${w}`).get(...args) as { n: number }).n;
  const rows = (db().prepare(`select p.doc from products p ${w} order by p.code limit ? offset ?`).all(...args, per, (page - 1) * per) as { doc: string }[]).map(
    (r) => JSON.parse(r.doc) as Product,
  );
  return { total, page, pages: Math.max(1, Math.ceil(total / per)), rows };
}
