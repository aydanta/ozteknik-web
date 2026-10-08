import { NextResponse, type NextRequest } from 'next/server';
import R from './data/redirects.json';
import { isLocale, localSegmentToInternal, internalSegmentToLocal, SEGMENTS, type Locale } from './lib/i18n';

/**
 * İstek öncesi katman:
 *  1. Eski adresler → yeni adres (tek adım 301; şartname Ek D)
 *  2. Yerel yol kelimeleri → iç rota (rewrite): /tr/urun/x → /tr/product/x
 *  3. İç adla gelen istek → yerel adres (301): /de/product/x → /de/produkt/x
 *  4. Panel için iyimser oturum kontrolü (asıl yetki kontrolü sunucu tarafında)
 *  5. Test ortamı parola koruması (SITE_ENV=staging)
 * Dil tarayıcıya göre otomatik YÖNLENDİRİLMEZ (botlar tüm dilleri görmeli); yalnız "/" → /en/.
 */
type StrMap = Record<string, string>;
const PAGES = R.pages as StrMap;
const PRODUCTS = R.products as Record<string, StrMap>;
const CATS = R.categories as StrMap;
const CAT_SLUGS = R.catSlugs as Record<string, Record<Locale, string>>;
const SUBSITES = new Set(['hydcab', 'egerot', 'revol']);
const OLD_LANGS = new Set(['en', 'tr', 'de', 'es', 'it', 'ru']);

// NextURL sondaki eğik çizgiyi isteğe göre biçimlendirir; mutlak adresle kur ki hedef aynen korunsun
const moved = (req: NextRequest, to: string, keepQuery = false) => NextResponse.redirect(new URL(to + (keepQuery ? req.nextUrl.search : ''), req.nextUrl.origin), 301);
const normOe = (s: string) => {
  let k = s.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (/^A\d{10}$/.test(k)) k = k.slice(1);
  return k.toLowerCase();
};

function stagingAuth(req: NextRequest) {
  const pass = process.env.STAGING_PASSWORD;
  if (process.env.SITE_ENV !== 'staging' || !pass) return null;
  const h = req.headers.get('authorization') || '';
  const ok = h.startsWith('Basic ') && atob(h.slice(6)).split(':').slice(1).join(':') === pass;
  return ok ? null : new NextResponse('Auth required', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="staging"' } });
}

export function proxy(req: NextRequest) {
  const deny = stagingAuth(req);
  if (deny) return deny;

  const path = req.nextUrl.pathname;

  if (path.startsWith('/admin')) {
    if (!path.endsWith('/') && !path.startsWith('/admin/login/logout')) return moved(req, `${path}/`, true);
    if (!path.startsWith('/admin/login') && !req.cookies.get('oz_admin')) {
      const u = req.nextUrl.clone();
      u.pathname = '/admin/login/';
      u.search = `?next=${encodeURIComponent(path)}`;
      return NextResponse.redirect(u);
    }
    return NextResponse.next();
  }
  if (path === '/') return moved(req, '/en/');

  let lower: string;
  try {
    lower = decodeURIComponent(path).toLowerCase();
  } catch {
    lower = path.toLowerCase();
  }
  if (!lower.endsWith('/')) lower += '/';

  /* 1 — birebir eşleşen eski sayfalar */
  const page = PAGES[lower];
  if (page) return moved(req, page);

  const segs = lower.split('/').filter(Boolean);
  let i = 0;
  let sub: string | null = null;
  if (SUBSITES.has(segs[0])) {
    sub = segs[0];
    i++;
  }
  let lang: string | null = null;
  if (isLocale(segs[i]) || OLD_LANGS.has(segs[i])) {
    lang = segs[i];
    i++;
  }
  const rest = segs.slice(i);
  const L = (lang || 'en') as Locale;
  const legacyContext = !!sub || !lang; // alt site ya da dil öneksiz eski EN adresi

  if (sub && rest.length === 0) return moved(req, `/${L}/${sub}/`);

  // eski ürün adresi: /product/x, /tr/product/x, /hydcab/tr/product/x
  if (rest[0] === 'product' && rest[1] && (legacyContext || (OLD_LANGS.has(L) && SEGMENTS.product[L] !== 'product'))) {
    const slug = PRODUCTS[L]?.[rest[1]] ?? PRODUCTS.en?.[rest[1]] ?? rest[1];
    return moved(req, `/${L}/${SEGMENTS.product[L]}/${slug}/`);
  }
  // eski OE arşivi: /referans-numarasi/x
  if (rest[0] === 'referans-numarasi' && rest[1]) return moved(req, `/${L}/oe/${normOe(rest[1])}/`);
  // eski kategori: /product-category/x(/y)
  if (rest[0] === 'product-category') {
    const key = CATS[rest[rest.length - 1]];
    return moved(req, key ? `/${L}/${SEGMENTS.catalog[L]}/${CAT_SLUGS[key][L]}/` : `/${L}/${SEGMENTS.catalog[L]}/`);
  }
  // eski taksonomi arşivleri
  if (['marka', 'uretici', 'model', 'product-tag', 'urun-etiketi', 'shop', 'magaza'].includes(rest[0])) {
    return moved(req, `/${L}/${SEGMENTS.catalog[L]}/`);
  }
  if (sub) return moved(req, `/${L}/${sub}/`);
  // sondaki eğik çizgi (skipTrailingSlashRedirect: eski adres + eğik çizgi tek adımda)
  if (!path.endsWith('/') && !/\.[a-z0-9]{2,5}$/i.test(path)) return moved(req, `${path}/`, true);
  // bilinmeyen adres → site içi 404 (arama kutulu, gerçek 404 durumu). Kök düzende notFound() üretimde 500 verir.
  if (!lang || !isLocale(lang)) return NextResponse.rewrite(new URL('/en/__not-found__/', req.nextUrl.origin));

  /* 2/3 — yerel yol kelimeleri */
  if (rest.length) {
    const original = path.split('/').filter(Boolean);
    const first = original[1];
    const internal = localSegmentToInternal(L, first);
    if (internal && internal !== first) {
      const u = req.nextUrl.clone();
      u.pathname = `/${[L, internal, ...original.slice(2)].join('/')}/`;
      return NextResponse.rewrite(u);
    }
    if (!internal) {
      const local = internalSegmentToLocal(L, first);
      if (local && local !== first) return moved(req, `/${[L, local, ...original.slice(2)].join('/')}/`);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // statik dosyalar (uzantılı her yol: /drawings/*.webp, /img/*, /docs/*, /data/*.json…) proxy'ye hiç girmez
    '/((?!_next/|api/|media/|models/|brand/|og/|feeds/|fonts/|drawings/|img/|docs/|data/|video/|favicon\\.ico|icon|apple-icon|robots\\.txt|sitemap|llms|.*\\.(?:webp|png|jpe?g|svg|gif|avif|ico|json|glb|txt|xml|pdf|woff2?|css|js|map|mp4|webm)$).*)',
  ],
};
