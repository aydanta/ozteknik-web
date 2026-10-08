#!/usr/bin/env node
/**
 * Taşıma adım 5 — eski adres → yeni adres haritası (şartname §"Taşıma ve 301 yönlendirme planı").
 * Her eski adres tek adımda tek karşılığa gider; zincir yok. proxy.ts bu dosyayı kullanır.
 * Çıktı: data/redirects.json
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const raw = (f) => readFile(path.resolve('data/raw', f), 'utf8').then(JSON.parse);
const legacy = JSON.parse(await readFile(path.resolve('data/legacy-products.json'), 'utf8'));
const terms = JSON.parse(await readFile(path.resolve('content/categories.json'), 'utf8'));

// yeni sayfa anahtarı → dile göre yol kelimesi (lib/i18n.ts SEGMENTS ile aynı olmalı; check:seo doğrular)
const i18nSrc = await readFile(path.resolve('lib/i18n.ts'), 'utf8');
const SEG = {};
for (const m of i18nSrc.matchAll(/^\s{2}(\w+): \{ (en: '[^}]+) \},?$/gm)) {
  SEG[m[1]] = Object.fromEntries([...m[2].matchAll(/(\w+): '([^']+)'/g)].map((x) => [x[1], x[2]]));
}
const page = (lang, key) => (key ? `/${lang}/${SEG[key][lang]}/` : `/${lang}/`);

/* ---------- kurumsal sayfalar: dillerdeki sıra aynı (WPML) ---------- */
const SKIP = /^(clients|all-products-without-image|hesabim|odeme|sepet|magaza|kvkk-bilgilendirme-ve-aydinlatma-metni)/;
const ORDER = ['media', 'privacy', 'cookies', 'privacy', null, 'catalog', 'quality', 'contact', 'about', 'production', 'production', 'about', 'about', 'careers', 'sustainability', 'production', 'about', null];
const pages = {};
for (const lang of ['en', 'tr', 'de', 'es', 'it', 'ru']) {
  const list = (await raw(`pages-${lang}.json`)).filter((p) => !SKIP.test(decodeURIComponent(p.slug)));
  if (list.length !== ORDER.length) throw new Error(`${lang}: ${list.length} sayfa, beklenen ${ORDER.length}`);
  const target = lang === 'en' ? 'en' : lang;
  list.forEach((p, i) => {
    const from = new URL(p.link).pathname;
    if (from === '/' || from === `/${lang}/`) return;
    pages[from.toLowerCase()] = page(target, ORDER[i]);
  });
  for (const p of await raw(`posts-${lang}.json`)) pages[new URL(p.link).pathname.toLowerCase()] = page(target, 'media');
}
// yalnız TR'de olan KVKK metni ve EN'de kalan eski sayfalar
pages['/tr/kvkk-bilgilendirme-ve-aydinlatma-metni/'] = page('tr', 'privacy');
for (const s of ['all-products-without-image', 'magaza', 'sepet', 'odeme', 'hesabim']) pages[`/${s}/`] = page('en', 'catalog');
// yeni adresle aynı olan eski adresleri haritadan çıkar (döngü olmasın)
for (const [k, v] of Object.entries(pages)) if (k === v) delete pages[k];

/* ---------- ürünler: dil → eski slug → yeni slug ---------- */
const products = {};
for (const r of legacy) {
  const lang = r.lang;
  const old = decodeURIComponent(r.from.replace(/\/$/, '').split('/').pop()).toLowerCase();
  (products[lang] ||= {})[old] = r.to;
}

/* ---------- kategoriler: eski slug (tüm diller) → anahtar ---------- */
const categories = {};
for (const c of terms.categories) for (const l of c.legacy) categories[l] = c.key;
for (const lang of ['tr', 'de', 'es', 'it', 'ru']) {
  for (const c of await raw(`cat-${lang}.json`)) {
    const slug = decodeURIComponent(c.slug).toLowerCase();
    if (categories[slug]) continue;
    // WPML çeviri slug'ları: adla eşle
    const name = c.name.toLowerCase();
    const hit = terms.categories.find((t) => Object.values(t.many).some((n) => n.toLowerCase() === name) || Object.values(t.one).some((n) => n.toLowerCase() === name));
    if (hit) categories[slug] = hit.key;
  }
}
const catSlugs = Object.fromEntries(terms.categories.map((c) => [c.key, c.slug]));

const out = { generatedAt: new Date().toISOString(), seg: SEG, pages, products, categories, catSlugs };
await writeFile(path.resolve('data/redirects.json'), JSON.stringify(out));
console.log({
  pages: Object.keys(pages).length,
  products: Object.fromEntries(Object.entries(products).map(([l, m]) => [l, Object.keys(m).length])),
  categories: Object.keys(categories).length,
});
