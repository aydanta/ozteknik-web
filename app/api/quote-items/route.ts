import { NextResponse, type NextRequest } from 'next/server';
import { getProductsBySlugs, CATEGORY, BRANDS } from '@/lib/catalog';
import { isLocale, type Locale } from '@/lib/i18n';
import { mediaSrc } from '@/lib/links';

/** Teklif listesindeki kodların görünen bilgileri (ad, marka, görsel) */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { slugs?: string[]; lang?: string };
  const lang: Locale = isLocale(body.lang) ? body.lang : 'en';
  const slugs = (body.slugs || []).filter((s) => typeof s === 'string').slice(0, 400);
  const items = getProductsBySlugs(slugs).map((p) => ({
    slug: p.slug,
    code: p.code,
    brand: BRANDS[p.brand].name,
    brandKey: p.brand,
    type: CATEGORY[p.category].one[lang],
    oe: p.oe[0] ? `${p.oe[0].make ?? ''} ${p.oe[0].display}`.trim() : '',
    image: p.images[0] ? mediaSrc(p.images[0].file, 400) : null,
  }));
  return NextResponse.json({ items });
}
