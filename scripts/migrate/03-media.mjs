#!/usr/bin/env node
/**
 * Taşıma adım 3 — site varlıkları: logolar, kategori çizimleri, marka/kesit görselleri, sertifikalar.
 * Mevcut sitenin medya kütüphanesinde dosya adıyla arar, ASIL dosyayı indirir, açıklayıcı adla kaydeder.
 * (Ürün fotoğrafları ayrı: /media rotası ilk istekte indirip önbelleğe alır — data/catalog.json → images[].source)
 *
 * Çıktı: public/brand/*, public/drawings/*, public/img/*, public/docs/*  + data/assets.json (boyutlar, kaynak)
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const BASE = 'https://ozteknikoto.com';
const UA = 'OzteknikMigration/1.0';
const ASSETS = [
  // [hedef klasör, yeni ad, aranacak dosya adı kökü, biçim]
  ['brand', 'ozteknik-logo', 'ozteknik-logo', 'png'],
  ['brand', 'ozteknik-logo-white', 'ozteknik-beyaz-logo', 'png'],
  ['brand', 'ozteknik-favicon', 'ozteknik-fav', 'png'],
  ['brand', 'egerot-logo', 'egerot-logo', 'png'],
  ['brand', 'hydcab-logo', 'hydcab-logo', 'png'],
  ['brand', 'revol-logo', 'revol-logo', 'png'],
  ['drawings', 'torque-rod', 'TORQUE-ROD', 'webp'],
  ['drawings', 'v-stay', 'V-Stay', 'webp'],
  ['drawings', 'tie-rod', 'TIE-ROD-ASSY', 'webp'],
  ['drawings', 'rod-end', 'ROD-END', 'webp'],
  ['drawings', 'stabilizer-link', 'STABILIZER', 'webp'],
  ['drawings', 'cab-tilting-cylinder', 'CABIN-TILTING-CYLINDER', 'webp'],
  ['drawings', 'cab-tilting-pump', 'CABIN-TILTING-PUMP', 'webp'],
  ['drawings', 'cab-latch', 'CABIN-LATCH', 'webp'],
  ['drawings', 'steering-cylinder', 'STEERING-CYLINDER-cphoto', 'webp'],
  ['drawings', 'axle-lift-cylinder', 'AXLE-LIFT-CYLINDER', 'webp'],
  ['drawings', 'hydraulic-repair-kit', 'HYDRAULIC-REPAIR-KIT', 'webp'],
  ['drawings', 'connection-components', 'CONNECTION-COMPONENTS', 'webp'],
  ['drawings', 'attachment-kit', 'ATTACHMENT-KIT', 'webp'],
  ['drawings', 'clutch-kit', 'CLUTCH-KIT', 'webp'],
  ['drawings', 'pressure-plate', 'PP2-083-032-0000-baski-plakasi', 'webp'],
  ['drawings', 'release-bearing', 'RELEASER', 'webp'],
  ['img', 'revol-clutch-kit-render', 'clutch-kit-transparan-siyah-1', 'webp'],
  ['img', 'egerot-er0108-torque-rod', 'er0108', 'webp'],
  ['img', 'hydcab-steering-cylinder-exterior', 'gorsel2', 'webp'],
  ['img', 'hydcab-steering-cylinder-section', 'gorsel1', 'webp'],
  ['img', 'revol-clutch-disc', '1-11', 'webp'],
  ['img', 'sustainability-rooftop-solar', 'sustainability-photo-1', 'webp'],
  ['docs', 'iatf-16949-2016-certificate', 'IATF-16949-2016', 'webp'],
  ['docs', 'iso-9001-2015-certificate', 'ISO-9001-2015', 'webp'],
  ['docs', 'iso-14064-1-verification', 'ISO-14064-1', 'webp'],
  ['docs', 'eac-certificate', 'eac-sertifika', 'webp'],
];

async function findMedia(stem) {
  const url = `${BASE}/wp-json/wp/v2/media?search=${encodeURIComponent(stem)}&per_page=20&_fields=id,source_url,media_details`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const rows = await res.json();
  const exact = rows.filter((r) => {
    const file = decodeURIComponent(r.source_url.split('/').pop()).replace(/\.[a-z]+$/i, '');
    return file.toLowerCase() === stem.toLowerCase() || file.toLowerCase().replace(/-\d+$/, '') === stem.toLowerCase();
  });
  const pick = (exact.length ? exact : rows).sort((a, b) => (b.media_details?.width || 0) - (a.media_details?.width || 0))[0];
  return pick?.source_url ?? null;
}

const report = {};
for (const [dir, name, stem, fmt] of ASSETS) {
  try {
    const src = await findMedia(stem);
    if (!src) {
      report[`${dir}/${name}`] = { error: 'bulunamadı', stem };
      console.log('✗', stem);
      continue;
    }
    const buf = Buffer.from(await (await fetch(src, { headers: { 'User-Agent': UA } })).arrayBuffer());
    await mkdir(path.resolve('public', dir), { recursive: true });
    const img = sharp(buf);
    const meta = await img.metadata();
    let out;
    if (fmt === 'png') {
      out = `${name}.png`;
      await img.png({ compressionLevel: 9 }).toFile(path.resolve('public', dir, out));
      await sharp(buf).webp({ quality: 90 }).toFile(path.resolve('public', dir, `${name}.webp`));
    } else {
      out = `${name}.webp`;
      const w = Math.min(meta.width || 2400, 2400);
      await img.resize({ width: w, withoutEnlargement: true }).webp({ quality: dir === 'docs' ? 82 : 86, alphaQuality: 90 }).toFile(path.resolve('public', dir, out));
    }
    report[`${dir}/${name}`] = { file: `/${dir}/${out}`, source: src, width: meta.width, height: meta.height, alpha: meta.hasAlpha };
    console.log('✓', `${dir}/${out}`, `${meta.width}×${meta.height}`, meta.hasAlpha ? 'alfa' : '');
  } catch (e) {
    report[`${dir}/${name}`] = { error: String(e.message || e), stem };
    console.log('✗', stem, e.message);
  }
}
await writeFile(path.resolve('data/assets.json'), JSON.stringify(report, null, 1));
