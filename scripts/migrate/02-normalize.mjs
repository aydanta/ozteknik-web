#!/usr/bin/env node
/**
 * Taşıma adım 2 — ham WP/Woo verisini temiz ürün modeline çevirir.
 *
 * Kurallar (şartname):
 *  - Tek marka, kategoriye göre denetlenir; çelişen/boş marka kategoriden düzeltilir ve bayraklanır.
 *  - OE numaraları araç üreticisine bağlanır; Sachs numaraları çapraz referansa ayrılır.
 *  - Normalize anahtar: boşluk, nokta, tire, eğik çizgi yok; Mercedes "A" öneki atılır.
 *  - OE'siz veya görselsiz ürün "taslak" kalır (yayın kapısı) — panelde eksik listesine düşer.
 *  - Kopya kodlar tek kayda iner; diğerleri 301 ile ona yönlenir.
 *  - Uydurma yok: model yılı, ölçü vb. kaynakta yoksa boş kalır.
 *
 * Çıktı: data/catalog.json, data/legacy-products.json, data/migration-report.json
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const RAW = path.resolve('data/raw');
const OUT = path.resolve('data');
const read = async (f) => JSON.parse(await readFile(path.join(RAW, f), 'utf8'));
const terms = JSON.parse(await readFile(path.resolve('content/categories.json'), 'utf8'));

const decode = (s) =>
  String(s ?? '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8243;|&Prime;/g, '″')
    .replace(/&nbsp;| /g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&([a-zA-Z]+);/g, (m, n) => NAMED[n] ?? m);
const NAMED = { ccedil: 'ç', Ccedil: 'Ç', Oslash: 'Ø', oslash: 'ø', Ouml: 'Ö', ouml: 'ö', Uuml: 'Ü', uuml: 'ü', iacute: 'í', eacute: 'é', times: '×', deg: '°', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…', prime: '′', Prime: '″', plusmn: '±', frac12: '½' };
const strip = (s) => decode(String(s ?? '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

/* ---------------- sözlükler ---------------- */
const CAT_BY_WP = new Map();
for (const c of terms.categories) for (const l of c.legacy) CAT_BY_WP.set(l, c.key);
const CAT = Object.fromEntries(terms.categories.map((c) => [c.key, c]));

const MAKE_FIX = {
  MERCEDES: 'Mercedes-Benz',
  'MERCEDES-BENZ': 'Mercedes-Benz',
  RENAULT: 'Renault Trucks',
  'RENAULT TRUCKS': 'Renault Trucks',
  'FORD OTOSAN': 'Ford Trucks',
  FORD: 'Ford',
  VW: 'Volkswagen',
  'UD TRUCKS': 'UD Trucks',
  UD: 'UD Trucks',
  'DONGFENG (DFM)': 'Dongfeng',
  KÄSSBOHRER: 'Kässbohrer (Setra)',
  'ÖSTERREICHISCHE AUTOMOBILFABRIK (ÖAF)': 'ÖAF',
  'LEYLAND-DAF': 'Leyland DAF',
  'Ural AZ': 'Ural',
  EVOBUS: 'EvoBus',
  'CASE IH': 'Case IH',
  'KRAUSS-MAFFEI AG': 'Krauss-Maffei',
  'MANITOWOC CRANE GROUP': 'Manitowoc',
  'BHARAT BENZ': 'BharatBenz',
  'DEUTZ-FAHR': 'Deutz-Fahr',
  'MAGIRUS-DEUTZ': 'Magirus-Deutz',
  'TERBERG-BENSCHOP': 'Terberg',
  'DEN OUDSTEN BUSSEN': 'Den Oudsten',
  'ALEXANDER DENNIS': 'Alexander Dennis',
  'NEW HOLLAND': 'New Holland',
  'JOHN DEERE': 'John Deere',
  'MASSEY FERGUSON': 'Massey Ferguson',
  'KING LONG': 'King Long',
  'VAN HOOL': 'Van Hool',
  BREDAMENARINIBUS: 'BredaMenarinibus',
};
const ACRONYM = new Set(['MAN', 'DAF', 'BMC', 'VDL', 'ERF', 'ZG', 'JCB', 'KHD', 'MCW', 'SAF', 'BPW', 'TAM', 'UD', 'TATA', 'SISU', 'KAMAZ']);
const titleCase = (s) =>
  s
    .toLowerCase()
    .replace(/(^|[\s-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
const makeName = (raw) => {
  const r = raw.trim();
  if (MAKE_FIX[r]) return MAKE_FIX[r];
  if (ACRONYM.has(r)) return r === 'TATA' ? 'Tata' : r === 'SISU' ? 'Sisu' : r === 'KAMAZ' ? 'KAMAZ' : r;
  return titleCase(r);
};
const COMPETITOR_MAKES = new Set(['SACHS', 'EATON']);

/* ---------------- numara biçimleri ---------------- */
export const normKey = (s) => {
  let k = String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (/^A\d{10}$/.test(k)) k = k.slice(1); // Mercedes A öneki
  return k;
};
const digits = (s) => String(s).replace(/\D/g, '');
const SACHS = /^(3400|3482|3483|3488|3489|3401|1878|1862|1861|1864|1868|3151|3100|3189|3181|3182|3183|3459)\d{6}$/;

function guessMake(value, makes) {
  const raw = String(value).toUpperCase().replace(/\s+/g, '');
  const d = digits(raw);
  const has = (m) => makes.includes(m);
  if (has('Mercedes-Benz') && (/^A\d{10}$/.test(raw.replace(/[^A-Z0-9]/g, '')) || (/^\d{10}$/.test(d) && /^[09]/.test(d) && d.length === raw.replace(/[^A-Z0-9]/g, '').length))) return 'Mercedes-Benz';
  if (has('MAN') && (/^81\./.test(raw) || (/^(81|36|85|88|51|06)\d{9}$/.test(d) && d.length === raw.replace(/[^A-Z0-9]/g, '').length))) return 'MAN';
  if (has('Iveco') && /^5801\d{6}$/.test(d)) return 'Iveco';
  if (has('Renault Trucks') && /^(50|74|56|55)\d{8}$/.test(d) && d.length === raw.replace(/[^A-Z0-9]/g, '').length) return 'Renault Trucks';
  return null;
}

function displayOe(value, make) {
  const k = String(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (make === 'Mercedes-Benz' && /^A?\d{10}$/.test(k)) {
    const d = k.replace(/^A/, '');
    return `A ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8)}`;
  }
  if (make === 'MAN' && /^\d{11}$/.test(k)) return `${k.slice(0, 2)}.${k.slice(2, 7)}-${k.slice(7)}`;
  return String(value).trim().toUpperCase();
}
const displaySachs = (v) => {
  const d = digits(v);
  return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`;
};

/* ---------------- ölçüler ---------------- */
const LABEL_MAP = [
  [/^tube/i, 'tube'],
  [/^boru/i, 'tube'],
  [/^length/i, 'length'],
  [/^cone|^konik/i, 'cone'],
  [/^thread size|^dis ölçüsü/i, 'thread'],
  [/^thread diameter/i, 'threadDiameter'],
  [/^dis çap/i, 'outerDiameter'],
  [/^hole: ekseni/i, 'holeAxis'],
  [/^hole: ?ø/i, 'holeDiameter'],
  [/^thickness/i, 'thickness'],
  [/^diameter|^sistem çap/i, 'diameter'],
  [/^product type|^type of revol|^ürün tipi/i, 'typeCode'],
  [/^spline|^priz direk/i, 'spline'],
  [/^motor/i, 'engine'],
  [/^sanziman/i, 'gearbox'],
  [/^pressure|^disk|^disc|^rulman|^bearing/i, 'kit'],
];
const num = (s) => s.replace(/Ø/g, '').replace(/mm\.?/gi, '').replace(/,/g, '.').trim();
function cleanValue(key, v) {
  v = v.replace(/^:\s*/, '').trim();
  if (!v) return '';
  if (['tube', 'length', 'diameter', 'holeAxis', 'holeDiameter', 'thickness', 'threadDiameter', 'outerDiameter'].includes(key)) {
    const parts = v.split('/').map(num).filter(Boolean);
    if (!parts.length || parts.some((p) => !/^\d+(\.\d+)?$/.test(p))) return v; // olduğu gibi bırak, bayrakla
    return parts.join(' / ');
  }
  if (key === 'cone') return v.split('/').map(num).join(' / ');
  if (key === 'spline') return v.replace(/×/g, '×');
  return v;
}

function parseSpecs(html) {
  const specs = [];
  const kit = new Set();
  const issues = [];
  const rows = [...String(html).matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => m[1]);
  for (const row of rows) {
    const m = row.match(/<strong>([\s\S]*?)<\/strong>([\s\S]*)/);
    const text = strip(row);
    // etiketsiz satırlardaki kodlar (PP2 081 231, CD8 004 832, RB1 000 278)
    for (const c of text.matchAll(/\b(PP\d|CD\d|RB\d|CS\d|CK\d)\s?(\d{3})\s?(\d{3})\b/g)) kit.add(`${c[1]} ${c[2]} ${c[3]}`);
    if (!m) continue;
    let label = strip(m[1]).replace(/:+\s*$/, '').trim();
    let value = strip(m[2]);
    // "Motor : ECOTORQ 12.7" gibi değer etiketin içinde
    const inLabel = label.match(/^(motor|sanziman|sistem çapi)\s*:\s*(.+)$/i);
    if (inLabel && !value) {
      label = inLabel[1];
      value = inLabel[2];
    }
    if (!value) continue;
    let key = LABEL_MAP.find(([re]) => re.test(label))?.[1];
    if (!key && label === '' && /^\d+([.,]\d+)?\/\d+([.,]\d+)?$/.test(value)) key = 'cone';
    if (!key) {
      issues.push(`spec-unmapped:${label || '∅'}=${value}`);
      continue;
    }
    if (key === 'kit') continue; // yukarıda kod olarak yakalandı
    const v = cleanValue(key, value);
    if (!v) continue;
    if (!specs.find((s) => s.key === key)) specs.push({ key, value: v, unit: terms.fields[key]?.unit || undefined });
  }
  return { specs, kit: [...kit], issues };
}

/* ---------------- görsel adı ---------------- */
const slugify = (s) =>
  String(s)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
const codeSlug = (code) => slugify(code);

/* ---------------- yükle ---------------- */
const [P, store, taxCat, taxMarka, taxUretici, taxModel, taxRef] = await Promise.all([
  read('products-wp-en.json'),
  read('products-store-en.json'),
  read('tax-product_cat.json'),
  read('tax-marka.json'),
  read('tax-uretici.json'),
  read('tax-model.json'),
  read('tax-referans-numarasi.json'),
]);
const byId = (rows) => new Map(rows.map((r) => [r.id, r]));
const catT = byId(taxCat);
const markaT = byId(taxMarka);
const ureT = byId(taxUretici);
const modelT = byId(taxModel);
const refT = byId(taxRef);
const storeById = new Map(store.map((s) => [s.id, s]));

const langRows = {};
for (const l of ['tr', 'de', 'es', 'it', 'ru']) langRows[l] = await read(`products-wp-${l}.json`);

const report = {
  generatedAt: new Date().toISOString(),
  source: { products: P.length, oeTerms: taxRef.length, makes: taxUretici.length, models: taxModel.length, imagesInStore: 0 },
  target: {},
  fixes: { brandFromCategory: 0, brandMismatch: 0, duplicateCodes: 0, sachsMovedToCross: 0, oeWithoutMake: 0, specUnmapped: 0 },
  lists: { brandMismatch: [], duplicates: [], noOe: [], onlySachs: [], noImage: [], unmappedSpecs: [] },
};

const products = [];
for (const p of P) {
  const code = decode(p.title.rendered).trim();
  const wpCat = catT.get((p.product_cat || []).find((id) => catT.get(id)?.slug !== 'default'))?.slug;
  const category = CAT_BY_WP.get(wpCat) || null;
  const issues = [];
  if (!category) {
    issues.push(`category-unknown:${wpCat || '∅'}`);
  }
  const catDef = category ? CAT[category] : null;
  const wpBrand = markaT.get((p.marka || [])[0])?.slug || null;
  let brand = catDef?.brand || wpBrand || 'egerot';
  if (!wpBrand) {
    issues.push('brand-missing-fixed-by-category');
    report.fixes.brandFromCategory++;
  } else if (catDef && wpBrand !== catDef.brand) {
    issues.push(`brand-mismatch:${wpBrand}->${catDef.brand}`);
    report.fixes.brandMismatch++;
    report.lists.brandMismatch.push({ code, wp: wpBrand, fixed: catDef.brand, category });
  }

  const rawMakes = (p.uretici || []).map((id) => ureT.get(id)?.name).filter(Boolean);
  const makes = [...new Set(rawMakes.filter((m) => !COMPETITOR_MAKES.has(m)).map(makeName))];
  const models = [...new Set((p.model || []).map((id) => decode(modelT.get(id)?.name || '').trim()).filter(Boolean))];

  const oe = [];
  const cross = [];
  for (const id of p['referans-numarasi'] || []) {
    const t = refT.get(id);
    if (!t) continue;
    const value = decode(t.name).trim();
    const d = digits(value);
    if (brand === 'revol' && SACHS.test(d) && d.length === value.replace(/[^A-Za-z0-9]/g, '').length) {
      cross.push({ brand: 'Sachs', value: displaySachs(d), norm: normKey(d) });
      report.fixes.sachsMovedToCross++;
      continue;
    }
    // tek markalı üründe bile numara o üreticinin bilinen biçimine uymuyorsa üretici atanmaz (ör. Mercedes 10 hane, MAN 11 hane);
    // kaynakta OE diye girilmiş rakip numaraları (LuK 643…, Valeo 805…) böylece "doğrulanacak" grubuna düşer
    const fits = (m) => {
      const k = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (m === 'Mercedes-Benz') return /^A?\d{10}$/.test(k);
      if (m === 'MAN') return /^\d{11}$/.test(k);
      return true;
    };
    const make = makes.length === 1 ? (fits(makes[0]) ? makes[0] : null) : guessMake(value, makes);
    if (!make) report.fixes.oeWithoutMake++;
    oe.push({ make, value, norm: normKey(value), display: displayOe(value, make) });
  }
  // aynı normalize anahtarı bir kez; MAN'da 81. ile başlayan ana numara öne alınır (şartname örneği: ER0107 → 81432306000)
  const seen = new Set();
  const rank = (o) => (o.make === 'MAN' && o.norm.startsWith('81') ? 0 : o.make ? 1 : 2);
  const oeU = oe
    .filter((o) => (seen.has(o.norm) ? false : seen.add(o.norm)))
    .map((o, i) => ({ o, i }))
    .sort((a, b) => rank(a.o) - rank(b.o) || a.i - b.i)
    .map(({ o }) => o);
  const crossU = cross.filter((o) => (seen.has('X' + o.norm) ? false : seen.add('X' + o.norm)));

  const { specs, kit, issues: specIssues } = parseSpecs(p.content?.rendered || '');
  issues.push(...specIssues);
  report.fixes.specUnmapped += specIssues.length;
  if (specIssues.length) report.lists.unmappedSpecs.push({ code, issues: specIssues });

  const st = storeById.get(p.id);
  const typeEn = catDef ? catDef.one.en : 'part';
  const firstOe = oeU[0];
  const images = (st?.images || []).map((img, i) => {
    const thumb = /-(\d+)x(\d+)\.\w+$/.exec(img.thumbnail || '');
    const widths = [...String(img.srcset || '').matchAll(/ (\d+)w/g)].map((m) => Number(m[1]));
    const width = widths.length ? Math.max(...widths) : 0;
    const height = thumb && width ? Math.round((width * Number(thumb[2])) / Number(thumb[1])) : width;
    const angle = i === 0 ? 'front' : i === 1 ? '34' : 'detail';
    const nameParts = [brand, codeSlug(code), slugify(typeEn), firstOe?.make ? slugify(firstOe.make) : null, firstOe ? normKey(firstOe.value).toLowerCase() : null, angle].filter(Boolean);
    return {
      file: `${nameParts.join('-')}.webp`,
      source: img.src,
      width,
      height,
      kind: 'photo',
      angle,
      watermark: brand === 'egerot' ? true : undefined,
    };
  });
  report.source.imagesInStore += (st?.images || []).length;

  if (!oeU.length) {
    if (crossU.length) {
      issues.push('oe-only-competitor');
      report.lists.onlySachs.push(code);
    } else {
      issues.push('oe-missing');
      report.lists.noOe.push(code);
    }
  }
  if (!images.length) {
    issues.push('image-missing');
    report.lists.noImage.push(code);
  }
  if (!models.length) issues.push('models-missing');
  if (oeU.some((o) => !o.make)) issues.push('oe-make-unassigned');
  if (images.some((i) => i.width && i.width < 1200)) issues.push('image-lowres');
  if (brand === 'egerot' && images.length) issues.push('image-watermark');
  if (/^IP_/i.test(code)) issues.push('code-prefix-review');

  const publishable = category && oeU.length > 0 && images.length > 0;
  products.push({
    code,
    slug: codeSlug(code),
    brand,
    category: category || 'connection-components',
    status: publishable ? 'active' : 'draft',
    makes,
    models,
    oe: oeU,
    cross: crossU,
    specs,
    kit: kit.filter((k) => normKey(k) !== normKey(code)),
    images,
    overrides: {},
    issues,
    legacy: { wpId: p.id, url: new URL(p.link).pathname, langs: ['en'] },
    updatedAt: p.modified_gmt ? `${p.modified_gmt}Z` : new Date().toISOString(),
    _score: oeU.length * 3 + images.length * 5 + specs.length + models.length,
  });
}

/* ---------------- kopya kodlar ---------------- */
const bySlug = new Map();
const legacyProducts = []; // { from: '/xx/product/old-slug/', to: slug, lang }
for (const p of products.sort((a, b) => b._score - a._score)) {
  if (bySlug.has(p.slug)) {
    report.fixes.duplicateCodes++;
    report.lists.duplicates.push({ code: p.code, keptWpId: bySlug.get(p.slug).legacy.wpId, droppedWpId: p.legacy.wpId });
    legacyProducts.push({ from: p.legacy.url, to: p.slug, lang: 'en' });
    // kopyadaki OE/model bilgisini kaybetme: tutulan kayda birleştir
    const keep = bySlug.get(p.slug);
    for (const o of p.oe) if (!keep.oe.find((x) => x.norm === o.norm)) keep.oe.push(o);
    for (const m of p.models) if (!keep.models.includes(m)) keep.models.push(m);
    continue;
  }
  bySlug.set(p.slug, p);
  legacyProducts.push({ from: p.legacy.url, to: p.slug, lang: 'en' });
}

/* ---------------- diğer dillerdeki eski adresler (kodla eşle) ---------------- */
const slugByNorm = new Map([...bySlug.values()].map((p) => [normKey(p.code), p.slug]));
for (const [lang, rows] of Object.entries(langRows)) {
  for (const r of rows) {
    const code = decode(r.title.rendered).trim();
    const slug = slugByNorm.get(normKey(code));
    if (!slug) continue;
    legacyProducts.push({ from: new URL(r.link).pathname, to: slug, lang });
    const p = bySlug.get(slug);
    if (!p.legacy.langs.includes(lang)) p.legacy.langs.push(lang);
  }
}

const final = [...bySlug.values()]
  .map(({ _score, ...p }) => p)
  .sort((a, b) => a.code.localeCompare(b.code, 'en', { numeric: true }));

// set içeriği yalnız katalogda var olan kodlarla
const known = new Set(final.map((p) => normKey(p.code)));
for (const p of final) p.kit = p.kit.filter((k) => known.has(normKey(k)));

report.target = {
  products: final.length,
  active: final.filter((p) => p.status === 'active').length,
  draft: final.filter((p) => p.status === 'draft').length,
  oe: final.reduce((n, p) => n + p.oe.length, 0),
  cross: final.reduce((n, p) => n + p.cross.length, 0),
  images: final.reduce((n, p) => n + p.images.length, 0),
  byBrand: Object.fromEntries(['egerot', 'hydcab', 'revol'].map((b) => [b, final.filter((p) => p.brand === b).length])),
  byCategory: Object.fromEntries(terms.categories.map((c) => [c.key, final.filter((p) => p.category === c.key).length])),
  legacyProductUrls: legacyProducts.length,
};

await writeFile(path.join(OUT, 'catalog.json'), JSON.stringify(final));
await writeFile(path.join(OUT, 'legacy-products.json'), JSON.stringify(legacyProducts));
await writeFile(path.join(OUT, 'migration-report.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify({ source: report.source, target: report.target, fixes: report.fixes }, null, 1));
