#!/usr/bin/env node
/**
 * Taşıma adım 1 — mevcut ozteknikoto.com verisini herkese açık API'lerden çeker.
 * Şartname: "Mevcut sitedeki veri ve görsellerin tamamı otomatik olarak çekilip temizlenir; elle kopyalama yapılmaz."
 *
 * Kaynaklar: WordPress REST (wp/v2) + WooCommerce Store API (wc/store/v1).
 * Çıktı: data/raw/*.json (ham; temizleme 02-normalize.mjs'te).
 *
 *   node scripts/migrate/01-fetch-wp.mjs            # hepsi
 *   node scripts/migrate/01-fetch-wp.mjs tax        # yalnız taksonomiler
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://ozteknikoto.com';
const OUT = path.resolve('data/raw');
const UA = 'OzteknikMigration/1.0 (+site migration; contact via agency)';
const CONCURRENCY = 5;
const LANGS = ['en', 'tr', 'de', 'es', 'it', 'ru']; // mevcut sitedeki 6 dil (EN varsayılan)

const only = process.argv[2];

async function getJSON(url, tries = 4) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
      if (res.status === 400 && url.includes('page=')) return { data: [], total: 0, pages: 0 };
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return {
        data,
        total: Number(res.headers.get('x-wp-total') || 0),
        pages: Number(res.headers.get('x-wp-totalpages') || 0),
      };
    } catch (err) {
      if (i === tries) throw new Error(`${url} → ${err.message}`);
      await new Promise((r) => setTimeout(r, 1500 * i));
    }
  }
}

async function pool(items, fn, n = CONCURRENCY) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    }),
  );
  return out;
}

/** Sayfalı bir uç noktanın tamamını çeker. */
async function all(endpoint, params = {}) {
  const qs = (page) => new URLSearchParams({ per_page: '100', page: String(page), ...params }).toString();
  const first = await getJSON(`${BASE}${endpoint}?${qs(1)}`);
  const pages = Math.max(1, first.pages);
  const rest = await pool(
    Array.from({ length: pages - 1 }, (_, i) => i + 2),
    async (p) => (await getJSON(`${BASE}${endpoint}?${qs(p)}`)).data,
  );
  const rows = [first.data, ...rest].flat();
  console.log(`  ${endpoint} ${JSON.stringify(params)} → ${rows.length}/${first.total}`);
  return rows;
}

async function save(name, rows) {
  await writeFile(path.join(OUT, name), JSON.stringify(rows));
}

await mkdir(OUT, { recursive: true });
const t0 = Date.now();

if (!only || only === 'tax') {
  console.log('Taksonomiler');
  for (const tax of ['marka', 'product_cat', 'uretici', 'model', 'referans-numarasi']) {
    const rows = await all(`/wp-json/wp/v2/${tax}`, { _fields: 'id,name,slug,count,parent,description' });
    await save(`tax-${tax}.json`, rows);
  }
}

if (!only || only === 'products') {
  console.log('Ürünler (wp/v2, dil bazında)');
  const fields = 'id,slug,title,content,modified,link,status,featured_media,marka,model,referans-numarasi,uretici,product_cat';
  for (const lang of LANGS) {
    const rows = await all('/wp-json/wp/v2/product', { _fields: fields, lang });
    await save(`products-wp-${lang}.json`, rows);
  }
  console.log('Ürünler (Store API — görseller)');
  const store = await all('/wp-json/wc/store/v1/products', {});
  await save(
    'products-store-en.json',
    store.map(({ id, slug, name, description, images, categories }) => ({ id, slug, name, description, images, categories })),
  );
}

if (!only || only === 'pages') {
  console.log('Kurumsal sayfalar ve blog');
  for (const lang of LANGS) {
    const pages = await all('/wp-json/wp/v2/pages', { _fields: 'id,slug,link,title,content,modified,parent', lang });
    await save(`pages-${lang}.json`, pages);
    const posts = await all('/wp-json/wp/v2/posts', { _fields: 'id,slug,link,title,content,excerpt,date,modified,featured_media', lang });
    await save(`posts-${lang}.json`, posts);
  }
}

console.log(`Bitti: ${((Date.now() - t0) / 1000).toFixed(0)} sn → ${OUT}`);
