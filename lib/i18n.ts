/**
 * Dil ve URL kuralları — tek karar noktası.
 * Şartname §"Çok dilli yapı": tek alan adı, 8 dil, her dil kendi klasöründe; x-default = EN.
 * Ürün kodu ve OE numaraları asla çevrilmez; yol kelimeleri (ürün, katalog…) çevrilir.
 */
export const LOCALES = ['en', 'tr', 'de', 'fr', 'es', 'it', 'ru', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const isLocale = (v: string | undefined | null): v is Locale => !!v && (LOCALES as readonly string[]).includes(v);

export const LOCALE_META: Record<Locale, { native: string; english: string; dir: 'ltr' | 'rtl'; og: string; bcp47: string }> = {
  en: { native: 'English', english: 'English', dir: 'ltr', og: 'en_GB', bcp47: 'en' },
  tr: { native: 'Türkçe', english: 'Turkish', dir: 'ltr', og: 'tr_TR', bcp47: 'tr' },
  de: { native: 'Deutsch', english: 'German', dir: 'ltr', og: 'de_DE', bcp47: 'de' },
  fr: { native: 'Français', english: 'French', dir: 'ltr', og: 'fr_FR', bcp47: 'fr' },
  es: { native: 'Español', english: 'Spanish', dir: 'ltr', og: 'es_ES', bcp47: 'es' },
  it: { native: 'Italiano', english: 'Italian', dir: 'ltr', og: 'it_IT', bcp47: 'it' },
  ru: { native: 'Русский', english: 'Russian', dir: 'ltr', og: 'ru_RU', bcp47: 'ru' },
  ar: { native: 'العربية', english: 'Arabic', dir: 'rtl', og: 'ar_AE', bcp47: 'ar' },
};

/**
 * Sayfa anahtarı → dile göre yol kelimesi. İç rota klasörleri İngilizce anahtar adını taşır
 * (app/[lang]/product/…); proxy.ts yerel kelimeyi iç rotaya yeniden yazar, iç adı yerel adrese 301'ler.
 * ASCII tutulur (ru/ar dahil) — paylaşılan bağlantılarda kodlanmış karakter çıkmasın.
 */
export const SEGMENTS = {
  catalog: { en: 'catalogue', tr: 'katalog', de: 'katalog', fr: 'catalogue', es: 'catalogo', it: 'catalogo', ru: 'katalog', ar: 'catalogue' },
  product: { en: 'product', tr: 'urun', de: 'produkt', fr: 'produit', es: 'producto', it: 'prodotto', ru: 'produkt', ar: 'product' },
  oe: { en: 'oe', tr: 'oe', de: 'oe', fr: 'oe', es: 'oe', it: 'oe', ru: 'oe', ar: 'oe' },
  search: { en: 'search', tr: 'arama', de: 'suche', fr: 'recherche', es: 'buscar', it: 'ricerca', ru: 'poisk', ar: 'search' },
  quote: { en: 'quote-list', tr: 'teklif-listesi', de: 'angebotsliste', fr: 'liste-de-devis', es: 'lista-de-cotizacion', it: 'lista-preventivo', ru: 'zapros-ceny', ar: 'quote-list' },
  sample: { en: 'sample-request', tr: 'numune-talebi', de: 'musteranfrage', fr: 'demande-echantillon', es: 'solicitud-de-muestra', it: 'richiesta-campione', ru: 'zapros-obrazca', ar: 'sample-request' },
  distributors: { en: 'become-a-distributor', tr: 'distributor-olun', de: 'distributor-werden', fr: 'devenir-distributeur', es: 'hazte-distribuidor', it: 'diventa-distributore', ru: 'stat-distributorom', ar: 'become-a-distributor' },
  dealers: { en: 'dealer-locator', tr: 'bayi-bulucu', de: 'haendlersuche', fr: 'trouver-un-revendeur', es: 'buscador-de-distribuidores', it: 'trova-rivenditore', ru: 'dilery', ar: 'dealer-locator' },
  quality: { en: 'quality-certificates', tr: 'kalite-sertifikalar', de: 'qualitaet-zertifikate', fr: 'qualite-certificats', es: 'calidad-certificados', it: 'qualita-certificati', ru: 'kachestvo-sertifikaty', ar: 'quality-certificates' },
  production: { en: 'production-rd', tr: 'uretim-arge', de: 'produktion-entwicklung', fr: 'production-rd', es: 'produccion-id', it: 'produzione-rs', ru: 'proizvodstvo-nioktr', ar: 'production-rd' },
  sustainability: { en: 'sustainability', tr: 'surdurulebilirlik', de: 'nachhaltigkeit', fr: 'durabilite', es: 'sostenibilidad', it: 'sostenibilita', ru: 'ustoychivoe-razvitie', ar: 'sustainability' },
  about: { en: 'about-us', tr: 'hakkimizda', de: 'ueber-uns', fr: 'a-propos', es: 'sobre-nosotros', it: 'chi-siamo', ru: 'o-kompanii', ar: 'about-us' },
  media: { en: 'media-centre', tr: 'medya-merkezi', de: 'medienzentrum', fr: 'centre-medias', es: 'centro-de-medios', it: 'centro-media', ru: 'media-centr', ar: 'media-centre' },
  contact: { en: 'contact', tr: 'iletisim', de: 'kontakt', fr: 'contact', es: 'contacto', it: 'contatti', ru: 'kontakty', ar: 'contact' },
  careers: { en: 'careers', tr: 'kariyer', de: 'karriere', fr: 'carrieres', es: 'empleo', it: 'lavora-con-noi', ru: 'karera', ar: 'careers' },
  privacy: { en: 'privacy-policy', tr: 'gizlilik-ve-kvkk', de: 'datenschutz', fr: 'confidentialite', es: 'privacidad', it: 'privacy', ru: 'konfidencialnost', ar: 'privacy-policy' },
  cookies: { en: 'cookie-policy', tr: 'cerez-politikasi', de: 'cookie-richtlinie', fr: 'politique-cookies', es: 'politica-de-cookies', it: 'cookie-policy', ru: 'cookie', ar: 'cookie-policy' },
  imprint: { en: 'imprint', tr: 'kunye', de: 'impressum', fr: 'mentions-legales', es: 'aviso-legal', it: 'note-legali', ru: 'rekvizity', ar: 'imprint' },
  accessibility: { en: 'accessibility', tr: 'erisilebilirlik', de: 'barrierefreiheit', fr: 'accessibilite', es: 'accesibilidad', it: 'accessibilita', ru: 'dostupnost', ar: 'accessibility' },
  imageLicense: { en: 'image-license', tr: 'gorsel-lisansi', de: 'bildlizenz', fr: 'licence-images', es: 'licencia-de-imagenes', it: 'licenza-immagini', ru: 'licenziya-izobrazheniy', ar: 'image-license' },
  offer: { en: 'for', tr: 'for', de: 'for', fr: 'for', es: 'for', it: 'for', ru: 'for', ar: 'for' },
  b2b: { en: 'b2b-portal', tr: 'b2b-portal', de: 'b2b-portal', fr: 'b2b-portal', es: 'b2b-portal', it: 'b2b-portal', ru: 'b2b-portal', ar: 'b2b-portal' },
} as const satisfies Record<string, Record<Locale, string>>;

export type PageKey = keyof typeof SEGMENTS;

/** İç rota klasör adları (app/[lang]/<internal>) */
export const INTERNAL: Record<PageKey, string> = {
  catalog: 'catalogue',
  product: 'product',
  oe: 'oe',
  search: 'search',
  quote: 'quote-list',
  sample: 'sample-request',
  distributors: 'become-a-distributor',
  dealers: 'dealer-locator',
  quality: 'quality-certificates',
  production: 'production-rd',
  sustainability: 'sustainability',
  about: 'about-us',
  media: 'media-centre',
  contact: 'contact',
  careers: 'careers',
  privacy: 'privacy-policy',
  cookies: 'cookie-policy',
  imprint: 'imprint',
  accessibility: 'accessibility',
  imageLicense: 'image-license',
  offer: 'for',
  b2b: 'b2b-portal',
};

/** Yerel ilk segment → iç segment (proxy rewrite için). */
export function localSegmentToInternal(lang: Locale, seg: string): string | null {
  for (const key of Object.keys(SEGMENTS) as PageKey[]) {
    if (SEGMENTS[key][lang] === seg) return INTERNAL[key];
  }
  return null;
}

/** İç segment → yerel segment (iç adla gelen isteği yerel adrese 301'lemek için). */
export function internalSegmentToLocal(lang: Locale, seg: string): string | null {
  for (const key of Object.keys(INTERNAL) as PageKey[]) {
    if (INTERNAL[key] === seg) return SEGMENTS[key][lang];
  }
  return null;
}

/** Sayfa adresi üretir; sondaki eğik çizgi dahil (trailingSlash: true). */
export function href(lang: Locale, key?: PageKey, ...rest: (string | number | undefined)[]): string {
  const parts = [lang, key ? SEGMENTS[key][lang] : undefined, ...rest].filter((p) => p !== undefined && p !== '');
  return `/${parts.join('/')}/`;
}

/** Ürün kodu → URL parçası: "CK0 122 801" → "ck0-122-801" */
export const codeToSlug = (code: string) =>
  code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Sayılar ve tarihler için dil biçimi */
export const nf = (lang: Locale) => new Intl.NumberFormat(LOCALE_META[lang].bcp47 === 'ar' ? 'ar-EG-u-nu-latn' : LOCALE_META[lang].bcp47);
