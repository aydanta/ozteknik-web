import { NextResponse, type NextRequest } from 'next/server';
import { multiSearch, logMiss } from '@/lib/search';
import { CATEGORY } from '@/lib/catalog';
import { isLocale, type Locale } from '@/lib/i18n';
import { mediaSrc } from '@/lib/links';

/** Çoklu arama: 200 satıra kadar (yapıştır ya da Excel/CSV'den gelen metin). */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { text?: string; lang?: string };
  const lang: Locale = isLocale(body.lang) ? body.lang : 'en';
  const text = String(body.text || '').slice(0, 40_000);
  const rows = multiSearch(text).map((r) => {
    if (r.status === 'none') logMiss(r.input, lang);
    return {
      ...r,
      hits: r.hits.map((h) => ({ ...h, categoryName: CATEGORY[h.category].one[lang], image: h.image ? mediaSrc(h.image.file) : null })),
    };
  });
  const sum = { matched: 0, multiple: 0, fuzzy: 0, none: 0 } as Record<string, number>;
  rows.forEach((r) => sum[r.status]++);
  return NextResponse.json({ rows, sum });
}
