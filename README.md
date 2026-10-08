# Özteknik — yeni web sitesi + katalog + yönetim paneli

EGEROT · HYDCAB · REVOL. 8 dil (EN x-default, TR, DE, FR, ES, IT, RU, AR/RTL), OE numarasıyla aranabilir 2.662 ürünlük katalog, teklif listesi, 2FA'lı yönetim paneli.
Müşterinin şartnamesine göre kuruldu: `ozteknik-yeni-web-sitesi-sartnamesi-2026-10-08.pdf`. Kopyası vault'ta: `02-Websites/projects/ozteknik-oto/`.

## Çalıştırma

```bash
export PATH=$HOME/.local/node/bin:$PATH        # bu Mac'te Node kullanıcı klasöründe (v24)
npm run migrate:fetch       # 1) ozteknikoto.com'dan ham veri (WP REST + Woo Store API) → data/raw/  (~12 dk)
npm run migrate:normalize   # 2) temizleme → data/catalog.json, legacy-products.json, migration-report.json
npm run migrate:media       # 3) logolar, kategori çizimleri, sertifikalar → public/
node scripts/migrate/05-redirects.mjs   # 4) 301 haritası → data/redirects.json
npm run db:seed             # 5) SQLite (data/ozteknik.db) + ilk yönetici (.env.local)
npm run dev                 # http://localhost:3300   ·   panel: /admin/
npm run build && npm start  # üretim: http://localhost:3400
```

`node_modules` bu makinede `~/nefin-web-v3/node_modules`'ün APFS klonu (`cp -cR`); disk dolu olduğu için. Başka makinede `npm ci` yeterli.

## Yığın

- Next.js 16 (App Router, Turbopack), React 19, TypeScript; UI kütüphanesi yok, CSS değişkenleri (`app/styles/tokens.css` = şartname token'ları)
- Veri: Node'un yerleşik `node:sqlite`'ı (`lib/db.ts`, `lib/schema.sql`). Tüm SQL `lib/` altında; Postgres/Turso'ya taşınabilir.
- 3D: three.js (dinamik yüklenir), scroll: GSAP ScrollTrigger. Model: `public/models/revol-cd8-007-072-clutch-disc.glb`. Firmanın CAD GLB'si 14 MB'tan 869 KB'a indirildi (`scripts/migrate/04-optimize-glb.mjs`).
- Tema: yalnız açık (08.10.2026'da koyu tema kaldırıldı). Turkuaz dolguda `--accent`, metinde `--accent-hi`.
- Logo: `public/brand/ozteknik-logo{,-white}.svg` 205×21 PNG'den izlendi (geçici; firmanın orijinal vektörü gelince aynı adla değiştir). JSON-LD için `ozteknik-logo-schema.png` (600×600).
- QA (headless Chrome, ek paket yok): `node scripts/qa/check-overflow.mjs 320 <url>...` yatay taşmaları listeler (8 dilde çalıştır; taşmalar hep DE/RU/FR/ES'te çıkıyor). `node scripts/qa/shot.mjs <url> <png> 1440 900 1` tam sayfa ekran görüntüsü. `scripts/qa/trace-logo.py` PNG logoyu SVG'ye izler.
- Görseller tek kayıttan: `lib/photos.ts` + `components/Photo.tsx` (alt metin `photo.*`, 8 dil). Başlık bandı: `<PageHero photo="hall" …/>`; görselsiz → teknik çizim deseni.
- Açılış: `components/scroll/HeroStage.tsx` (kaydırınca video perdesi, saydam menü). Yükleme ekranı: `components/layout/Intro.tsx` (oturumda bir kez). GES videosu: `public/video/ozteknik-ges-drone-{720p,480p}.mp4`.
- Kurumsal fotoğraflar: `public/img/company/<ad>-{960,1920}.webp`, fabrika videosundan alınan kareler (yüzü görünen çalışan yok).
- Açılış videosu: `public/video/ozteknik-fabrika-{720p,480p}.mp4` + `-poster-{960,1920}.webp`. Kaynak eski sitedeki `ozteknikoto-slide-web.mp4` (40 MB). Bu Mac'te ffmpeg yok, AVFoundation ile kodlandı. Daha iyi bir kaynak gelirse aynı adlarla değiştirmek yeterli. Bileşen: `components/scroll/HeroVideo.tsx`.
- Görseller: `/media/<açıklayıcı-ad>.webp?w=400|800|1600|2400`. Sabit adres, AVIF/WebP, sharp. Asıl dosya ilk istekte eski siteden çekilir ve `media-cache/`e yazılır.

## Klasörler

| Yol | Ne |
|---|---|
| `app/[lang]/…` | Halka açık site (iç rota adları İngilizce; `proxy.ts` yerel kelimeleri yeniden yazar: `/tr/urun/` → `/tr/product/`) |
| `app/admin/…` | Yönetim paneli (TR): pano, talepler/CRM, ürünler (PIM), bulunamayan aramalar, kişiye özel sayfalar, bayiler, fuarlar, SEO/GEO, ayarlar, hesap/2FA |
| `app/api/` | `search`, `search/multi`, `leads`, `quote-items` |
| `app/sitemap.xml`, `app/sitemaps/[name]`, `app/robots.txt`, `app/llms.txt`, `app/llms-full.txt`, `app/feeds/[file]` | SEO/GEO uçları (dil × tür sitemap, hreflang + `image:image`; JSON/CSV katalog akışı) |
| `content/i18n/*.ts` | Arayüz metinleri (8 dil; EN ana) |
| `content/pages/*.ts` | Kurumsal sayfa içeriği (8 dil; kaynak: mevcut site) |
| `content/categories.json` | 18 kategori × 8 dil ürün tipi adı, URL kelimesi, ölçü alanları, eski slug'lar |
| `content/product-copy.ts` | Ürün özet cümlesi (GEO), meta açıklama, SSS, alt metin şablonları (8 dil) |
| `lib/seo.ts` | Başlık/açıklama/canonical/hreflang/JSON-LD tek karar noktası |
| `lib/search.ts` | OE normalizasyonu, önek + 1–2 karakter toleranslı arama, çoklu arama |
| `scripts/` | Taşıma (01–05), `db-seed`, `check-search`, `totp` (yerel test), `build-globe` |

## Kabul testleri (şartname)

```bash
BASE=http://localhost:3400 node scripts/check-search.mjs 1000   # 1.000 OE × 3 yazım → doğru ürün ilk sırada
```
Son sonuçlar (08.10.2026, yerel üretim derlemesi):
- Arama: 3.000/3.000 doğru, p95 < 10 ms.
- TTFB: 5–90 ms.
- Ürün sayfası: 526 KB sıkıştırılmış (görseller hariç; 3D istek üzerine yüklenir).
- Eski adresler: tek adım 301.

## Canlıya çıkmadan önce

- **Barındırma:** SQLite ve medya önbelleği kalıcı disk ister. İki seçenek var:
  - Node sunucusu (VPS ya da Render/Fly, kalıcı disk) + önünde Cloudflare CDN
  - Vercel: `lib/db.ts` Turso/Postgres'e, `media` görsel CDN'ine taşınır
- **Ortam değişkenleri:**
  - `NEXT_PUBLIC_SITE_URL=https://ozteknikoto.com`
  - `SESSION_SECRET`, `INDEXNOW_KEY`
  - `NEXT_PUBLIC_GA_ID` (isteğe bağlı; çerez onayından sonra yüklenir)
  - Test ortamı için `SITE_ENV=staging` + `STAGING_PASSWORD` (noindex + parola)
- **Güvenlik:**
  - CSP'yi nonce'a geçir (`next.config.ts`).
  - Panel kullanıcıları: ilk yöneticinin parolasını değiştir; 2FA zorunlu (açık).
- **Cloudflare:** "AI botlarını engelle" kapalı olmalı. Eski alan adları (egerot.com, revolclutch.com, hydcab.com, lenkstark.com) bu sunucuya yönlenmeli; 301'ler `next.config.ts`'te.
- Açık sorular ve müşteriden beklenenler: vault `02-Websites/projects/ozteknik-oto/ozteknik-web-site-plani.md`.
