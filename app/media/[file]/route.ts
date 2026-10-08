import { NextResponse, type NextRequest } from 'next/server';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { db, catalogVersion } from '@/lib/db';
import type { Product } from '@/lib/types';

/**
 * Ürün görseli kaynağı (görsel CDN'inin kökeni):
 *  - Sabit, açıklayıcı adres: /media/egerot-er0107-torque-rod-man-81432306000-front.webp
 *  - ?w=200|400|800|1600|2400 → genişlik varyantı; Accept'e göre AVIF ya da WebP
 *  - İlk istekte asıl dosya eski siteden indirilir (taşıma), sonra yerel önbellekten verilir.
 * Üretimde önüne CDN konur (Cloudflare/Vercel); bu rota yalnız köken olarak çalışır.
 */
const CACHE = path.join(process.cwd(), 'media-cache');
const WIDTHS = [200, 400, 800, 1600, 2400];

let index: { v: number; map: Map<string, { source: string; width: number }> } | null = null;
function lookup(file: string) {
  const v = catalogVersion();
  if (!index || index.v !== v) {
    const map = new Map<string, { source: string; width: number }>();
    for (const r of db().prepare(`select doc from products where status != 'archive'`).all() as { doc: string }[]) {
      const p = JSON.parse(r.doc) as Product;
      for (const img of p.images) map.set(img.file, { source: img.source, width: img.width });
    }
    index = { v, map };
  }
  return index.map.get(file);
}

async function original(file: string, source: string): Promise<Buffer> {
  const local = path.join(CACHE, 'orig', file.replace(/\.webp$/, '') + path.extname(new URL(source).pathname));
  try {
    return await readFile(local);
  } catch {}
  if (!/^https:\/\/ozteknikoto\.com\/wp-content\/uploads\//.test(source)) throw new Error('kaynak izinli değil');
  const res = await fetch(source, { headers: { 'User-Agent': 'OzteknikMigration/1.0' } });
  if (!res.ok) throw new Error(`kaynak ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(path.dirname(local), { recursive: true });
  await writeFile(local, buf);
  return buf;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[a-z0-9-]+\.webp$/.test(file)) return new NextResponse('Not found', { status: 404 });
  const hit = lookup(file);
  if (!hit) return new NextResponse('Not found', { status: 404 });

  const wq = Number(req.nextUrl.searchParams.get('w')) || 0;
  const w = wq ? WIDTHS.find((x) => x >= wq) ?? 2400 : 0;
  const avif = (req.headers.get('accept') || '').includes('image/avif') && w > 0;
  const fmt = avif ? 'avif' : 'webp';
  const out = path.join(CACHE, 'v', `${file.replace(/\.webp$/, '')}-${w || 'o'}.${fmt}`);

  let body: Buffer;
  try {
    await stat(out);
    body = await readFile(out);
  } catch {
    try {
      const src = await original(file, hit.source);
      let img = sharp(src).rotate();
      if (w) img = img.resize({ width: w, withoutEnlargement: true });
      body = avif ? await img.avif({ quality: 55, effort: 4 }).toBuffer() : await img.webp({ quality: 82 }).toBuffer();
      await mkdir(path.dirname(out), { recursive: true });
      await writeFile(out, body);
    } catch (e) {
      return new NextResponse(`Image unavailable: ${(e as Error).message}`, { status: 502 });
    }
  }
  return new NextResponse(new Uint8Array(body), {
    headers: {
      'Content-Type': `image/${fmt}`,
      'Cache-Control': 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=604800',
      Vary: 'Accept',
      'Content-Disposition': `inline; filename="${file}"`,
    },
  });
}
