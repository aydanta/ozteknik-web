import { feedRows } from '@/lib/feed';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 86400;
const csvCell = (v: unknown) => {
  const s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const rows = feedRows();
  const head = { 'Cache-Control': 'public, max-age=3600, s-maxage=86400', 'Access-Control-Allow-Origin': '*' };
  if (file === 'catalog.json') {
    return Response.json(
      {
        publisher: 'Özteknik A.Ş.',
        brands: ['EGEROT', 'HYDCAB', 'REVOL'],
        license: `${SITE_URL}/en/image-license/`,
        generated_at: new Date().toISOString(),
        count: rows.length,
        note: 'Vehicle manufacturer names and OE numbers are used for reference purposes only.',
        products: rows,
      },
      { headers: head },
    );
  }
  if (file === 'catalog.csv') {
    const cols = ['code', 'brand', 'product_type', 'oe', 'cross_references', 'vehicle_makes', 'url', 'image_url'];
    const lines = [cols.join(',')];
    for (const r of rows)
      lines.push(
        [r.code, r.brand, r.product_type, r.oe.map((o) => `${o.make ?? ''} ${o.number}`.trim()), r.cross_references.map((x) => `${x.brand} ${x.number}`), r.vehicle_makes, r.url, r.image_url].map(csvCell).join(','),
      );
    return new Response('﻿' + lines.join('\n'), { headers: { ...head, 'Content-Type': 'text/csv; charset=utf-8' } });
  }
  return new Response('Not found', { status: 404 });
}
