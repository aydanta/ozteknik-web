#!/usr/bin/env node
/**
 * Veritabanını taşınan katalogla doldurur (data/catalog.json → data/ozteknik.db).
 * Panelde düzenlenmiş ürünlere dokunmaz (--force hariç). Tekrar çalıştırmak güvenlidir.
 *
 *   npm run db:seed            # yeni ürünleri ekle, dizini yenile
 *   npm run db:seed -- --force # tüm ürünleri kaynaktan yeniden yaz
 *
 * İlk yönetici: .env.local içindeki ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD (yoksa üretilir ve oraya yazılır).
 */
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, existsSync, appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { randomBytes, scryptSync } from 'node:crypto';
import path from 'node:path';

const root = process.cwd();
const force = process.argv.includes('--force');
const DB_PATH = process.env.DB_PATH || path.join(root, 'data', 'ozteknik.db');
mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(readFileSync(path.join(root, 'lib', 'schema.sql'), 'utf8'));

const now = new Date().toISOString();
const normKey = (s) => {
  let k = String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (/^A\d{10}$/.test(k)) k = k.slice(1);
  return k;
};

/* ---------- ürünler ---------- */
const catalog = JSON.parse(readFileSync(path.join(root, 'data', 'catalog.json'), 'utf8'));
const exists = db.prepare(`select json_extract(doc, '$.edited') as edited from products where slug = ?`);
const up = db.prepare(
  `insert into products(slug, code, brand, category, status, doc, updated_at) values(?,?,?,?,?,?,?)
   on conflict(slug) do update set code=excluded.code, brand=excluded.brand, category=excluded.category,
   status=excluded.status, doc=excluded.doc, updated_at=excluded.updated_at`,
);
const delRefs = db.prepare('delete from refs where slug = ?');
const addRef = db.prepare('insert into refs(norm, kind, display, make, slug) values(?,?,?,?,?)');

let inserted = 0;
let skipped = 0;
db.exec('begin');
for (const p of catalog) {
  const row = exists.get(p.slug);
  if (row && !force) {
    skipped++;
    continue;
  }
  up.run(p.slug, p.code, p.brand, p.category, p.status, JSON.stringify(p), p.updatedAt);
  delRefs.run(p.slug);
  addRef.run(normKey(p.code), 'code', p.code, null, p.slug);
  for (const o of p.oe) addRef.run(o.norm, 'oe', o.display, o.make, p.slug);
  for (const c of p.cross) addRef.run(c.norm, 'cross', c.value, c.brand, p.slug);
  inserted++;
}
db.exec('commit');

/* ---------- ayarlar (yoksa) ---------- */
const setIfMissing = (key, value) =>
  db.prepare('insert into settings(key, value) values(?, ?) on conflict(key) do nothing').run(key, JSON.stringify(value));

setIfMissing('company', {
  legalName: 'Özteknik A.Ş.',
  // ❓ Ticaret unvanının tam yazımı, MERSİS, vergi no., sicil ve yetkili — Impressum için firmadan alınacak
  tradeName: '❓ doğrulanacak',
  address: 'Mehmet Akif Ersoy Mah. No:34/3 1. Öteyaka Küme',
  postalCode: '35730',
  city: 'Kemalpaşa',
  region: 'İzmir',
  country: 'TR',
  phone: '+90 232 887 17 18',
  fax: '+90 232 887 16 28',
  email: 'info@ozteknikoto.com',
  whatsapp: '',
  geo: { lat: 38.4533285, lng: 27.4446338 },
  mapsUrl: 'https://www.google.com/maps/place/%C3%96zteknik+A.%C5%9E./@38.4533285,27.4446338,15z',
  founded: 1971,
  sameAs: [
    'https://www.linkedin.com/company/ozteknik-as/',
    'https://www.youtube.com/@%C3%96zteknikCorp.Global',
    'https://www.instagram.com/ozteknikcorp.global/',
    'https://www.facebook.com/ozteknikcorp.global',
    'https://twitter.com/OzteknikC',
  ],
  registry: { mersis: '', taxOffice: '', taxNo: '', tradeRegistry: '', representative: '' },
  _verify: 'Posta kodu iki yerde farklı (iletişim: 35730, ana sayfa: 35171). WhatsApp numarası sitede yok.',
});
setIfMissing('stats', { founded: 1971, countries: 65, areaProductionM2: 15000, areaTotalM2: 30000, facilities: 2 });
setIfMissing('regions', [
  { key: 'europe', name: 'Europe', email: 'info@ozteknikoto.com', countries: ['DE', 'AT', 'CH', 'FR', 'BE', 'NL', 'LU', 'IT', 'ES', 'PT', 'PL', 'CZ', 'SK', 'HU', 'RO', 'BG', 'GR', 'HR', 'SI', 'RS', 'BA', 'MK', 'AL', 'GB', 'IE', 'DK', 'SE', 'NO', 'FI', 'EE', 'LV', 'LT', 'UA', 'MD', 'CY'] },
  { key: 'cis', name: 'CIS & Central Asia', email: 'info@ozteknikoto.com', countries: ['RU', 'BY', 'KZ', 'UZ', 'KG', 'TJ', 'TM', 'AZ', 'GE', 'AM', 'MN'] },
  { key: 'mena', name: 'Middle East & Gulf', email: 'info@ozteknikoto.com', countries: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'YE', 'IQ', 'JO', 'LB', 'SY', 'IL', 'PS', 'IR', 'EG'] },
  { key: 'africa', name: 'Maghreb & Africa', email: 'info@ozteknikoto.com', countries: ['MA', 'DZ', 'TN', 'LY', 'SN', 'CI', 'ML', 'BF', 'NE', 'GN', 'CM', 'GA', 'CG', 'CD', 'NG', 'GH', 'KE', 'TZ', 'ET', 'ZA', 'SD', 'MR', 'BJ', 'TG'] },
  { key: 'latam', name: 'Latin America', email: 'info@ozteknikoto.com', countries: ['CL', 'PE', 'AR', 'BR', 'MX', 'CO', 'EC', 'BO', 'UY', 'PY', 'VE'] },
  { key: 'domestic', name: 'Türkiye', email: 'info@ozteknikoto.com', countries: ['TR'] },
  { key: 'other', name: 'Other markets', email: 'info@ozteknikoto.com', countries: [] },
]);
setIfMissing('crm', { webhookUrl: '', provider: 'none' });
setIfMissing('publishGate', { requireOe: true, requireImage: true });
setIfMissing('catalog_version', 1);
db.prepare('update settings set value = ? where key = ?').run(JSON.stringify(Date.now()), 'catalog_version');

/* ---------- fuarlar (şartname: proje planı) ---------- */
if (!db.prepare('select count(*) n from fairs').get().n) {
  const f = db.prepare('insert into fairs(name, city, country, starts_on, ends_on, booth, url) values(?,?,?,?,?,?,?)');
  f.run('Automechanika Dubai', 'Dubai', 'AE', '2026-11-10', '2026-11-10', '', '');
  f.run('Automechanika İstanbul', 'İstanbul', 'TR', '2027-03-24', '2027-03-27', '', '');
}

/* ---------- ilk yönetici ---------- */
const envFile = path.join(root, '.env.local');
const env = existsSync(envFile) ? readFileSync(envFile, 'utf8') : '';
const getEnv = (k) => env.match(new RegExp(`^${k}=(.*)$`, 'm'))?.[1]?.trim();
let email = getEnv('ADMIN_SEED_EMAIL');
let password = getEnv('ADMIN_SEED_PASSWORD');
if (!email || !password) {
  email = 'admin@ozteknikoto.local';
  password = randomBytes(12).toString('base64url');
  appendFileSync(envFile, `\n# İlk yönetici (yalnız yerel geliştirme; canlıda değiştirin)\nADMIN_SEED_EMAIL=${email}\nADMIN_SEED_PASSWORD=${password}\n`);
}
if (!getEnv('SESSION_SECRET')) appendFileSync(envFile, `SESSION_SECRET=${randomBytes(32).toString('hex')}\n`);
if (!getEnv('INDEXNOW_KEY')) appendFileSync(envFile, `INDEXNOW_KEY=${randomBytes(16).toString('hex')}\n`);
// IndexNow anahtar dosyası site kökünde: /<anahtar>.txt
{
  const key = readFileSync(envFile, 'utf8').match(/^INDEXNOW_KEY=(.*)$/m)?.[1]?.trim();
  if (key) writeFileSync(path.join(root, 'public', `${key}.txt`), key);
}
if (!db.prepare('select id from users where email = ?').get(email)) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  db.prepare('insert into users(email, name, role, pass_hash, created_at) values(?,?,?,?,?)').run(
    email,
    'Yönetici',
    'admin',
    `scrypt$16384$${salt.toString('base64')}$${hash.toString('base64')}`,
    now,
  );
  console.log(`Yönetici oluşturuldu: ${email} (parola .env.local içinde)`);
}

const counts = db.prepare("select status, count(*) n from products group by status").all();
console.log({ inserted, skipped, counts, refs: db.prepare('select kind, count(*) n from refs group by kind').all() });
