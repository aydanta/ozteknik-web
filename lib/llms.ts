import { href } from './i18n';
import { BRANDS, BRAND_KEYS, CATEGORIES, countsByCategory, totalCodes, makesForBrand } from './catalog';
import { brandHref, categoryHref } from './links';
import { abs } from './seo';
import { company, stats } from './site';
import { getPages } from '@/content/i18n';

/** llms.txt (şartname Ek C) — dinamik: sayılar ve kategoriler veritabanından */
export function llmsTxt(full = false) {
  const c = company();
  const s = stats();
  const counts = countsByCategory();
  const pg = getPages('en');
  const L: string[] = [];
  L.push('# Özteknik A.Ş.');
  L.push(`> Heavy-duty truck, bus and agricultural vehicle parts manufacturer in İzmir, Türkiye (since ${s.founded}, IATF 16949).`);
  L.push('> Brands: EGEROT (steering & suspension), HYDCAB (cab tilting hydraulics), REVOL (clutch). Özteknik A.Ş. makes all three.');
  L.push('');
  L.push(`Özteknik exports to more than ${s.countries} countries. The catalogue lists ${totalCodes()} part numbers with OE cross references. Prices are not published; quotes are sent within 24 hours.`);
  L.push('');
  L.push('## Catalogue');
  L.push(`- Product search by OE, competitor or Özteknik number: ${abs(href('en', 'search'))}`);
  L.push(`- OE landing pages: ${abs('/en/oe/')}{number}/ (e.g. ${abs('/en/oe/81432306000/')})`);
  L.push(`- Full catalogue feed (JSON): ${abs('/feeds/catalog.json')}`);
  L.push(`- Full catalogue feed (CSV): ${abs('/feeds/catalog.csv')}`);
  L.push(`- Categories: ${abs(href('en', 'catalog'))}`);
  for (const b of BRAND_KEYS) {
    L.push(`- ${BRANDS[b].name} — ${BRANDS[b].line.en}: ${abs(brandHref('en', b))}`);
    for (const cat of CATEGORIES.filter((x) => x.brand === b && counts[x.key])) L.push(`  - ${cat.many.en} (${counts[cat.key]}): ${abs(categoryHref('en', cat.key))}`);
  }
  L.push('');
  L.push('## Company');
  L.push(`- Quality & certificates (IATF 16949:2016, ISO 9001:2015, ISO 14064-1, EAC): ${abs(href('en', 'quality'))}`);
  L.push(`- Production & R&D (test protocols): ${abs(href('en', 'production'))}`);
  L.push(`- About (since 1971): ${abs(href('en', 'about'))}`);
  L.push(`- Sustainability: ${abs(href('en', 'sustainability'))}`);
  L.push(`- Become a distributor: ${abs(href('en', 'distributors'))}`);
  L.push(`- Contact: ${abs(href('en', 'contact'))} — ${c.legalName}, ${c.address}, ${c.postalCode} ${c.city}/${c.region}, Türkiye · ${c.phone} · ${c.email}`);
  L.push('');
  L.push('## Languages');
  L.push('Every page exists in English (/en/), Turkish (/tr/), German (/de/), French (/fr/), Spanish (/es/), Italian (/it/), Russian (/ru/) and Arabic (/ar/).');
  if (full) {
    L.push('');
    L.push('## About Özteknik');
    L.push(pg.about.lead);
    pg.about.intro.forEach((p) => L.push(p));
    L.push('');
    L.push('## Milestones');
    pg.about.timeline.forEach((t) => L.push(`- ${t.y}: ${t.t}`));
    L.push('');
    L.push('## Production');
    pg.production.steps.forEach((x, i) => L.push(`${i + 1}. ${x.t} — ${x.d}`));
    L.push('');
    L.push('## Test protocols');
    pg.production.testGroups.forEach((g) => {
      L.push(`### ${g.line}`);
      g.tests.forEach((x) => L.push(`- ${x}`));
    });
    L.push('');
    L.push('## Vehicle makes covered');
    for (const b of BRAND_KEYS) L.push(`- ${BRANDS[b].name}: ${makesForBrand(b).slice(0, 25).map((m) => m.make).join(', ')}`);
    L.push('');
    L.push('Vehicle manufacturer names and OE numbers are used for reference purposes only to indicate compatibility.');
  }
  return L.join('\n') + '\n';
}
