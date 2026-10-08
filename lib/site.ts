import { getSetting } from './db';
import { href, type Locale } from './i18n';
import { BRANDS, BRAND_KEYS, CATEGORIES, countsByCategory } from './catalog';
import { categoryHref, brandHref, drawingFor } from './links';
import { getDict } from '@/content/i18n';
import type { NavBrand, HeaderProps } from '@/components/layout/Header';

export interface Company {
  legalName: string;
  tradeName: string;
  address: string;
  postalCode: string;
  city: string;
  region: string;
  country: string;
  phone: string;
  fax: string;
  email: string;
  whatsapp: string;
  geo: { lat: number; lng: number };
  mapsUrl: string;
  founded: number;
  sameAs: string[];
  registry: { mersis: string; taxOffice: string; taxNo: string; tradeRegistry: string; representative: string };
}
export const company = () => getSetting<Company>('company', {} as Company);
export const stats = () => getSetting('stats', { founded: 1971, countries: 65, areaProductionM2: 15000, areaTotalM2: 24000, facilities: 2 });

export const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`;
export const waHref = (num: string, text: string) => `https://wa.me/${num.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;

/** Üst menü verisi (sunucuda üretilir, istemci bileşenine düz veri olarak gider) */
export function headerProps(lang: Locale): HeaderProps {
  const t = getDict(lang);
  const counts = countsByCategory();
  const brands: NavBrand[] = BRAND_KEYS.map((b) => ({
    key: b,
    name: BRANDS[b].name,
    line: BRANDS[b].line[lang],
    href: brandHref(lang, b),
    cats: CATEGORIES.filter((c) => c.brand === b && counts[c.key]).map((c) => ({
      key: c.key,
      name: c.many[lang],
      href: categoryHref(lang, c.key),
      count: counts[c.key] ?? 0,
      drawing: drawingFor(c.key),
    })),
  }));
  return {
    lang,
    brands,
    catalogueHref: href(lang, 'catalog'),
    quoteHref: href(lang, 'quote'),
    searchHref: href(lang, 'search'),
    groups: [
      {
        key: 'sales',
        label: t.nav.sales,
        links: [
          { href: href(lang, 'distributors'), label: t.nav.distributors, hint: t.distributors.lead },
          { href: href(lang, 'search'), label: t.nav.multiSearch, hint: t.search.multiLead },
          { href: href(lang, 'sample'), label: t.nav.sample, hint: t.sample.lead },
          { href: href(lang, 'dealers'), label: t.nav.dealers, hint: t.dealers.lead },
          { href: href(lang, 'quote'), label: t.nav.quoteList, hint: t.quote.lead },
          { href: href(lang, 'b2b'), label: t.nav.b2b, hint: t.b2b.lead },
        ],
      },
      {
        key: 'company',
        label: t.nav.company,
        links: [
          { href: href(lang, 'about'), label: t.nav.about, hint: getPagesLead(lang, 'about') },
          { href: href(lang, 'production'), label: t.nav.production, hint: t.production.lead },
          { href: href(lang, 'quality'), label: t.nav.quality, hint: t.quality.lead },
          { href: href(lang, 'sustainability'), label: t.nav.sustainability, hint: t.sustainability.lead },
          { href: href(lang, 'media'), label: t.nav.media, hint: t.media.lead },
          { href: href(lang, 'careers'), label: t.nav.careers, hint: t.careers.lead },
          { href: href(lang, 'contact'), label: t.nav.contact, hint: t.contact.lead },
        ],
      },
    ],
    t: {
      catalogue: t.nav.catalogue,
      allProducts: t.nav.allProducts,
      menu: t.common.menu,
      close: t.common.close,
      language: t.common.language,
      quoteList: t.nav.quoteList,
      searchPlaceholder: t.search.placeholder,
      skip: t.common.skip,
      products: t.common.products.replace('{n}', '').trim(),
      palette: {
        label: t.search.label,
        placeholder: t.search.placeholder,
        examples: t.search.examples,
        loading: t.common.loading,
        noResults: t.search.noResults,
        sendNumber: t.search.sendNumber,
        notFoundHref: href(lang, 'contact'),
        matchCode: t.search.matchCode,
        matchOe: t.search.matchOe,
        matchCross: t.search.matchCross,
        similar: t.search.similar,
        close: t.common.close,
        multiLink: `${t.nav.multiSearch} →`,
      },
    },
  };
}

import { getPages } from '@/content/i18n';
function getPagesLead(lang: Locale, key: 'about') {
  return getPages(lang)[key].lead.split('. ')[0] + '.';
}

/** Sayfa içi arama kutusu metinleri */
export function searchProps(lang: Locale) {
  const t = getDict(lang);
  return {
    label: t.search.label,
    placeholder: t.search.placeholder,
    button: t.nav.search,
    noResults: t.search.noResults,
    sendNumber: t.search.sendNumber,
    notFoundHref: href(lang, 'contact'),
    matchOe: t.search.matchOe,
    matchCross: t.search.matchCross,
  };
}

import { db } from './db';
export interface Fair {
  id: number;
  name: string;
  city: string;
  country: string;
  starts_on: string;
  ends_on: string;
  booth: string;
  url: string;
}
export function upcomingFairs(): Fair[] {
  const today = new Date().toISOString().slice(0, 10);
  return db().prepare('select * from fairs where active = 1 and ends_on >= ? order by starts_on').all(today) as unknown as Fair[];
}
export function fairDate(f: Fair, lang: Locale) {
  const loc = lang === 'ar' ? 'ar-EG-u-nu-latn' : lang;
  const d = (s: string) => new Date(`${s}T12:00:00Z`);
  if (f.starts_on === f.ends_on) return new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'long', year: 'numeric' }).format(d(f.starts_on));
  return new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'long', year: 'numeric' }).formatRange(d(f.starts_on), d(f.ends_on));
}
