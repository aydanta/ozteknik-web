import { NextResponse, type NextRequest } from 'next/server';
import { search, logMiss } from '@/lib/search';
import { CATEGORY } from '@/lib/catalog';
import { isLocale, type Locale } from '@/lib/i18n';
import { mediaSrc } from '@/lib/links';

/** Tekli arama (öneri listesi). Şartname hedefi: 300 ms içinde öneri. */
export function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').slice(0, 80);
  const l = req.nextUrl.searchParams.get('lang');
  const lang: Locale = isLocale(l) ? l : 'en';
  const limit = Math.min(20, Math.max(1, Number(req.nextUrl.searchParams.get('limit')) || 10));
  const t0 = performance.now();
  const r = search(q, limit);
  if (r.mode === 'none') logMiss(q, lang);
  const hits = r.hits.map((h) => ({
    ...h,
    categoryName: CATEGORY[h.category].one[lang],
    image: h.image ? mediaSrc(h.image.file) : null,
  }));
  return NextResponse.json(
    { query: r.query, norm: r.norm, mode: r.mode, hits, ms: Math.round(performance.now() - t0) },
    { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } },
  );
}
