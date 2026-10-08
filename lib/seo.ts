import type { Metadata } from 'next';
import { LOCALES, LOCALE_META, DEFAULT_LOCALE, href, type Locale, type PageKey } from './i18n';
import { BRANDS, CATEGORY, compactOe, groupOe, primaryMake, sizeLabel, imageUrl } from './catalog';
import { COPY, vehicleClass } from '@/content/product-copy';
import type { Product } from './types';

/**
 * SEO + GEO tek karar noktası: başlık, açıklama, canonical, hreflang ve JSON-LD buradan üretilir.
 * (vault standardı ilke 2: "Tek karar noktası")
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ozteknikoto.com').replace(/\/$/, '');
export const IS_STAGING = process.env.SITE_ENV === 'staging';
export const abs = (path: string) => `${SITE_URL}${path}`;
export const ORG_ID = `${SITE_URL}/#organization`;
export const SITE_ID = `${SITE_URL}/#website`;

/** Her dil için aynı sayfanın adresi → hreflang + x-default (EN) */
export function alternates(build: (lang: Locale) => string, current: Locale, opts: { langs?: Locale[] } = {}): Metadata['alternates'] {
  const langs = opts.langs ?? [...LOCALES];
  const languages: Record<string, string> = {};
  for (const l of langs) languages[LOCALE_META[l].bcp47] = abs(build(l));
  if (langs.includes(DEFAULT_LOCALE)) languages['x-default'] = abs(build(DEFAULT_LOCALE));
  return { canonical: abs(build(current)), languages };
}
export const pageAlternates = (key: PageKey | undefined, lang: Locale, ...rest: string[]) => alternates((l) => href(l, key, ...rest), lang);

export function baseMeta(o: {
  lang: Locale;
  title: string;
  description: string;
  path: (l: Locale) => string;
  image?: string;
  noindex?: boolean;
  absoluteTitle?: boolean;
  type?: 'website' | 'article';
}): Metadata {
  const url = abs(o.path(o.lang));
  return {
    title: o.absoluteTitle ? { absolute: o.title } : o.title,
    description: o.description,
    alternates: alternates(o.path, o.lang),
    robots: o.noindex || IS_STAGING ? { index: false, follow: true } : { index: true, follow: true, 'max-image-preview': 'large' },
    openGraph: {
      type: o.type ?? 'website',
      url,
      title: o.title,
      description: o.description,
      siteName: 'Özteknik',
      locale: LOCALE_META[o.lang].og,
      images: [{ url: o.image ?? '/og/ozteknik-og.png', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: o.title, description: o.description, images: [o.image ?? '/og/ozteknik-og.png'] },
  };
}

/* ---------------- ürün metinleri ---------------- */
export function productCopy(p: Product, lang: Locale) {
  const c = COPY[lang];
  const def = CATEGORY[p.category];
  const type = def.one[lang];
  const brand = BRANDS[p.brand].name;
  const size = sizeLabel(p);
  const make = primaryMake(p);
  const cls = vehicleClass(p.makes);
  const oes = p.oe.map((o) => o.display);
  const cross = p.cross.map((x) => `${x.brand} ${x.value}`);
  const input = { code: p.code, brand, type, size, makes: p.makes, cls, oes, oeTotal: p.oe.length, cross, models: p.models };

  // Başlık formülü: {Marka} {Kod} {Ürün tipi} {ölçü} – {Araç markası} OE {ilk OE} | Özteknik  (~65; sığmazsa ölçü düşer)
  const first = p.oe[0];
  const tail = first ? ` – ${make ? `${make} ` : ''}OE ${compactOe(first)}` : '';
  const sizeT = lang === 'ru' ? size.replace(/ mm\b/g, ' мм') : lang === 'ar' ? size.replace(/ mm\b/g, ' مم') : size;
  let main = `${brand} ${p.code} ${type}${sizeT ? ` ${sizeT}` : ''}${tail}`;
  if (main.length > 72 && sizeT) main = `${brand} ${p.code} ${type}${tail}`;
  if (main.length > 74 && first) main = `${brand} ${p.code} ${type} – OE ${compactOe(first)}`;
  const title = `${main} | Özteknik`;

  let description = '';
  for (const n of [3, 2, 1]) {
    description = c.meta(input, n);
    if (description.length <= 160) break;
  }
  const summary = p.overrides.summary?.[lang] || c.summary(input);
  const faq = p.overrides.faq?.[lang]?.length ? p.overrides.faq[lang]! : c.faq(input);
  const h1 = `${p.code} ${type}`;
  const alt = (i: number) => {
    const img = p.images[i];
    return c.alt({ brand, code: p.code, type, make, cls, oe: first ? compactOe(first) : null, angle: c.angle[img?.angle ?? 'front'] });
  };
  return { title, description, summary, faq, h1, type, brand, size, make, cls, alt, groups: groupOe(p) };
}

/* ---------------- JSON-LD ---------------- */
type Node = Record<string, unknown>;
export const graph = (nodes: Node[]) => ({ '@context': 'https://schema.org', '@graph': nodes });

export function organizationNode(company: {
  legalName: string;
  address: string;
  postalCode: string;
  city: string;
  region: string;
  country: string;
  phone: string;
  email: string;
  sameAs: string[];
  founded: number;
  geo?: { lat: number; lng: number };
  mapsUrl?: string;
}): Node {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: 'Özteknik',
    legalName: company.legalName,
    alternateName: ['Özteknik Oto', 'Ozteknik', 'Özteknik A.Ş.'],
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: abs('/brand/ozteknik-logo-schema.png'), width: 600, height: 600 }, // 08.10.2026: eski kayıt 205×21 dosyayı 600×200 diye bildiriyordu
    foundingDate: String(company.founded),
    description:
      'Turkish manufacturer of heavy-duty truck, bus and agricultural vehicle parts since 1971: EGEROT steering & suspension, HYDCAB cab tilting hydraulics and REVOL clutch systems. IATF 16949 certified.',
    email: company.email,
    telephone: company.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.address,
      postalCode: company.postalCode,
      addressLocality: company.city,
      addressRegion: company.region,
      addressCountry: company.country,
    },
    ...(company.geo ? { location: { '@type': 'Place', geo: { '@type': 'GeoCoordinates', latitude: company.geo.lat, longitude: company.geo.lng }, hasMap: company.mapsUrl } } : {}),
    brand: (['egerot', 'hydcab', 'revol'] as const).map((b) => ({ '@type': 'Brand', '@id': `${SITE_URL}/#brand-${b}`, name: BRANDS[b].name, url: abs(`/en/${b}/`) })),
    hasCredential: ['IATF 16949:2016', 'ISO 9001:2015', 'ISO 14064-1', 'EAC'].map((n) => ({ '@type': 'EducationalOccupationalCredential', name: n, credentialCategory: 'certificate' })),
    sameAs: company.sameAs,
    contactPoint: [{ '@type': 'ContactPoint', contactType: 'sales', email: company.email, telephone: company.phone, availableLanguage: ['en', 'tr', 'de', 'fr', 'es', 'it', 'ru', 'ar'] }],
  };
}

export function websiteNode(lang: Locale): Node {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: SITE_URL,
    name: 'Özteknik',
    publisher: { '@id': ORG_ID },
    inLanguage: LOCALES.map((l) => LOCALE_META[l].bcp47),
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${abs(href(lang, 'search'))}?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbNode(items: { name: string; path: string }[]): Node {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export function faqNode(faq: { q: string; a: string }[], url: string): Node {
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function imageNode(p: Product, i: number, caption: string, lang: Locale): Node {
  const img = p.images[i];
  return {
    '@type': 'ImageObject',
    contentUrl: abs(imageUrl(img.file)),
    url: abs(imageUrl(img.file)),
    caption,
    width: img.width || undefined,
    height: img.height || undefined,
    inLanguage: LOCALE_META[lang].bcp47,
    creator: { '@id': ORG_ID },
    creditText: 'Özteknik A.Ş.',
    copyrightNotice: '© Özteknik A.Ş.',
    license: abs(href('en', 'imageLicense')),
    acquireLicensePage: abs(href('en', 'contact')),
  };
}

export function productNode(p: Product, lang: Locale, url: string, copy: ReturnType<typeof productCopy>): Node {
  const def = CATEGORY[p.category];
  return {
    '@type': 'Product',
    '@id': `${url}#product`,
    name: `${copy.brand} ${p.code} ${def.one[lang]}${copy.size ? ` ${copy.size}` : ''}`,
    sku: p.code,
    mpn: p.code,
    brand: { '@type': 'Brand', '@id': `${SITE_URL}/#brand-${p.brand}`, name: copy.brand },
    manufacturer: { '@id': ORG_ID },
    category: def.one.en,
    description: copy.summary,
    url,
    image: p.images.map((_, i) => imageNode(p, i, copy.alt(i), lang)),
    additionalProperty: p.specs
      .filter((s) => s.key !== 'typeCode')
      .map((s) => ({
        '@type': 'PropertyValue',
        name: def.fields.includes(s.key) ? s.key : s.key,
        value: s.value,
        ...(s.unit === 'mm' ? { unitCode: 'MMT', unitText: 'mm' } : {}),
      })),
    identifier: [
      ...p.oe.map((o) => ({ '@type': 'PropertyValue', propertyID: o.make ? `OE ${o.make}` : 'OE', value: o.norm })),
      ...p.cross.map((x) => ({ '@type': 'PropertyValue', propertyID: `Cross reference ${x.brand}`, value: x.norm })),
    ],
    isRelatedTo: p.kit.length ? p.kit.map((k) => ({ '@type': 'Product', sku: k })) : undefined,
    countryOfOrigin: { '@type': 'Country', name: 'TR' },
  };
}

export function webPageNode(o: { url: string; name: string; description: string; lang: Locale; type?: string; dateModified?: string; about?: string }): Node {
  return {
    '@type': o.type ?? 'WebPage',
    '@id': `${o.url}#webpage`,
    url: o.url,
    name: o.name,
    description: o.description,
    inLanguage: LOCALE_META[o.lang].bcp47,
    isPartOf: { '@id': SITE_ID },
    publisher: { '@id': ORG_ID },
    ...(o.dateModified ? { dateModified: o.dateModified } : {}),
    ...(o.about ? { about: { '@id': o.about } } : {}),
  };
}

