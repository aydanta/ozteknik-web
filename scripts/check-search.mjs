#!/usr/bin/env node
/**
 * Şartname kabul kriteri (Arama): "1.000 rastgele OE numarasının üç farklı yazım biçimiyle yapılan testte
 * doğru ürün ilk sırada çıkar." Çalışan siteye karşı (varsayılan http://localhost:3300) /api/search ile test eder.
 *
 *   BASE=http://localhost:3300 node scripts/check-search.mjs [adet]
 */
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const BASE = process.env.BASE || 'http://localhost:3300';
const N = Number(process.argv[2]) || 1000;
const db = new DatabaseSync(path.resolve('data/ozteknik.db'), { readOnly: true });
const rows = db
  .prepare(`select r.norm, r.display, r.make, r.slug from refs r join products p on p.slug = r.slug where r.kind = 'oe' and p.status = 'active' order by random() limit ?`)
  .all(N);

const variants = (r) => {
  const n = r.norm;
  const spaced = n.replace(/(\d{3})(?=\d)/g, '$1 ');
  const dotted = r.make === 'MAN' && n.length === 11 ? `${n.slice(0, 2)}.${n.slice(2, 7)}-${n.slice(7)}` : r.make === 'Mercedes-Benz' ? `A ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6, 8)} ${n.slice(8)}` : n.split('').join('-').replace(/-(?=\d-?$)/, '');
  return [n, r.display !== n ? r.display : dotted, spaced.toLowerCase()];
};

let ok = 0;
let total = 0;
const fails = [];
const t0 = Date.now();
const times = [];
// aynı OE birden çok ürüne bağlı olabilir: doğru ürün = OE'nin bağlı olduğu ürünlerden biri ilk sırada
const owners = db.prepare(`select slug from refs where norm = ? and kind = 'oe'`);
for (const r of rows) {
  const allowed = new Set(owners.all(r.norm).map((x) => x.slug));
  for (const v of variants(r)) {
    total++;
    const s = performance.now();
    const res = await fetch(`${BASE}/api/search/?q=${encodeURIComponent(v)}&limit=3`);
    const j = await res.json();
    times.push(performance.now() - s);
    if (j.hits?.[0] && allowed.has(j.hits[0].slug)) ok++;
    else if (fails.length < 15) fails.push({ q: v, want: [...allowed], got: j.hits?.[0]?.slug ?? null });
  }
}
times.sort((a, b) => a - b);
const pct = (p) => times[Math.floor(times.length * p)].toFixed(1);
console.log(`${ok}/${total} doğru (%${((ok / total) * 100).toFixed(2)}) · ${rows.length} OE × 3 yazım · p50 ${pct(0.5)} ms · p95 ${pct(0.95)} ms · toplam ${((Date.now() - t0) / 1000).toFixed(1)} sn`);
if (fails.length) console.log('Örnek hatalar:', fails);
process.exit(ok === total ? 0 : 1);
