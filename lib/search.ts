import { db, catalogVersion, now } from './db';
import { allLite, type Lite } from './catalog';

/**
 * Arama — şartname §"Arama":
 *  - Boşluk, nokta, tire, eğik çizgi yok sayılır; büyük/küçük harf farkı yok.
 *  - Mercedes "A" öneki ve MAN "81." noktalı yazımı eşleşir.
 *  - Yanlış yazımda en yakın kodlar (1–2 karakter tolerans).
 *  - Çoklu arama: 200 satıra kadar; eşleşen / birden fazla / eşleşmeyen.
 * Bellek içi dizin; katalog sürümü değişince yenilenir. 12 bin anahtar için < 10 ms.
 */
export const normKey = (s: string) => {
  let k = String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (/^A\d{10}$/.test(k)) k = k.slice(1);
  return k;
};

const MAKE_PREFIX = /^(OE|OEM|REF|MAN|MB|MERCEDES|MERCEDESBENZ|BENZ|VOLVO|DAF|SCANIA|IVECO|RENAULT|SACHS|LUK|VALEO|FEBI|DT|EGEROT|HYDCAB|REVOL)(?=\d|A\d)/;

type Kind = 'code' | 'oe' | 'cross';
interface Ref {
  norm: string;
  kind: Kind;
  display: string;
  make: string | null;
  slug: string;
}
interface Index {
  v: number;
  byNorm: Map<string, Ref[]>;
  sorted: string[];
  lite: Map<string, Lite>;
}
let index: Index | null = null;

function getIndex(): Index {
  const v = catalogVersion();
  if (index && index.v === v) return index;
  const rows = db()
    .prepare(`select r.norm, r.kind, r.display, r.make, r.slug from refs r join products p on p.slug = r.slug where p.status = 'active'`)
    .all() as unknown as Ref[];
  const byNorm = new Map<string, Ref[]>();
  for (const r of rows) {
    if (!byNorm.has(r.norm)) byNorm.set(r.norm, []);
    byNorm.get(r.norm)!.push(r);
  }
  index = { v, byNorm, sorted: [...byNorm.keys()].sort(), lite: new Map(allLite().map((l) => [l.slug, l])) };
  return index;
}

/** Sınırlı Levenshtein (max k); aşarsa k+1 döner */
function lev(a: string, b: string, k: number): number {
  if (Math.abs(a.length - b.length) > k) return k + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > k) return k + 1;
    prev = cur;
  }
  return prev[b.length];
}

export interface Hit {
  slug: string;
  code: string;
  brand: Lite['brand'];
  category: Lite['category'];
  image: Lite['image'];
  firstOe: string | null;
  match: { kind: Kind; display: string; make: string | null; exact: boolean; distance: number };
}

function lowerBound(arr: string[], q: string) {
  let lo = 0,
    hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < q) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function toHits(refs: Ref[], idx: Index, exact: boolean, distance: number): Hit[] {
  const out: Hit[] = [];
  for (const r of refs) {
    const l = idx.lite.get(r.slug);
    if (!l) continue;
    out.push({
      slug: l.slug,
      code: l.code,
      brand: l.brand,
      category: l.category,
      image: l.image,
      firstOe: l.firstOe,
      match: { kind: r.kind, display: r.display, make: r.make, exact, distance },
    });
  }
  return out;
}

/** Tekli arama: önce birebir, sonra önek, sonra yakın yazım. */
export function search(q: string, limit = 12): { query: string; norm: string; hits: Hit[]; mode: 'exact' | 'prefix' | 'fuzzy' | 'none' } {
  const idx = getIndex();
  let norm = normKey(q);
  if (!idx.byNorm.has(norm)) {
    const stripped = normKey(norm.replace(MAKE_PREFIX, ''));
    if (stripped.length >= 4 && idx.byNorm.has(stripped)) norm = stripped;
  }
  if (norm.length < 2) return { query: q, norm, hits: [], mode: 'none' };

  const seen = new Set<string>();
  const uniq = (hits: Hit[]) => hits.filter((h) => (seen.has(h.slug) ? false : (seen.add(h.slug), true)));
  const order: Record<Kind, number> = { code: 0, oe: 1, cross: 2 };

  const exact = idx.byNorm.get(norm);
  if (exact?.length) {
    const hits = uniq(toHits([...exact].sort((a, b) => order[a.kind] - order[b.kind]), idx, true, 0));
    return { query: q, norm, hits: hits.slice(0, limit), mode: 'exact' };
  }

  if (norm.length >= 3) {
    const out: Ref[] = [];
    for (let i = lowerBound(idx.sorted, norm); i < idx.sorted.length && out.length < limit * 3; i++) {
      const k = idx.sorted[i];
      if (!k.startsWith(norm)) break;
      out.push(...idx.byNorm.get(k)!);
    }
    if (out.length) {
      const hits = uniq(toHits(out.sort((a, b) => order[a.kind] - order[b.kind] || a.norm.length - b.norm.length), idx, false, 0));
      return { query: q, norm, hits: hits.slice(0, limit), mode: 'prefix' };
    }
  }

  if (norm.length >= 5) {
    const k = norm.length >= 8 ? 2 : 1;
    const cand: { r: Ref; d: number }[] = [];
    for (const key of idx.sorted) {
      if (Math.abs(key.length - norm.length) > k) continue;
      const d = lev(norm, key, k);
      if (d <= k) for (const r of idx.byNorm.get(key)!) cand.push({ r, d });
    }
    cand.sort((a, b) => a.d - b.d || order[a.r.kind] - order[b.r.kind]);
    const hits: Hit[] = [];
    for (const c of cand) hits.push(...toHits([c.r], idx, false, c.d));
    const u = uniq(hits);
    if (u.length) return { query: q, norm, hits: u.slice(0, limit), mode: 'fuzzy' };
  }
  return { query: q, norm, hits: [], mode: 'none' };
}

/* ---------------- çoklu arama ---------------- */
export interface MultiRow {
  line: number;
  input: string;
  qty: number;
  status: 'matched' | 'multiple' | 'none' | 'fuzzy';
  hits: Hit[];
}

/** Excel/CSV yapıştırması: "kod<TAB>adet", "kod;adet", "kod  adet" ya da yalnız kod */
export function parseLines(text: string, max = 200): { input: string; qty: number }[] {
  const rows: { input: string; qty: number }[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const cells = line.split(/\t|;|,(?=\s*\d+\s*$)|\|| {2,}/).map((c) => c.trim()).filter(Boolean);
    let input = cells[0] ?? '';
    let qty = 1;
    if (cells.length > 1) {
      const last = cells[cells.length - 1];
      if (/^\d{1,6}$/.test(last) && normKey(last).length <= 6 && cells.length >= 2) {
        qty = Math.max(1, parseInt(last, 10));
        input = cells.slice(0, -1).join(' ');
      }
    }
    if (normKey(input).length < 3) continue;
    rows.push({ input, qty });
    if (rows.length >= max) break;
  }
  return rows;
}

export function multiSearch(text: string): MultiRow[] {
  return parseLines(text).map(({ input, qty }, i) => {
    const r = search(input, 5);
    const status: MultiRow['status'] =
      r.mode === 'exact' ? (r.hits.length === 1 ? 'matched' : 'multiple') : r.mode === 'none' ? 'none' : r.hits.length ? 'fuzzy' : 'none';
    return { line: i + 1, input, qty, status, hits: r.hits };
  });
}

/** Bulunamayan aramaları ürün geliştirme için kaydet */
export function logMiss(query: string, lang: string) {
  const norm = normKey(query);
  if (norm.length < 5 || norm.length > 24) return;
  const t = now();
  db()
    .prepare(
      `insert into search_misses(norm, query, hits, langs, first_at, last_at) values(?,?,1,?,?,?)
       on conflict(norm) do update set hits = hits + 1, last_at = excluded.last_at,
       langs = case when instr(langs, excluded.langs) > 0 then langs else langs || ',' || excluded.langs end`,
    )
    .run(norm, query.slice(0, 80), lang, t, t);
}
