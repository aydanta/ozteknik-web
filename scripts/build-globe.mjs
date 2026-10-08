#!/usr/bin/env node
/**
 * Noktalı dünya küresi verisi: world-atlas (Natural Earth 110m, kamu malı) kara poligonlarından
 * enleme göre eşit aralıklı nokta ızgarası üretir → public/data/globe-dots.json (~20 KB).
 * İstemci yalnız bu küçük dosyayı yükler; harita kütüphanesi yok.
 */
import { writeFile, mkdir } from 'node:fs/promises';

const topo = await (await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json')).json();
const { scale, translate } = topo.transform;
const arcs = topo.arcs.map((arc) => {
  let x = 0,
    y = 0;
  return arc.map(([dx, dy]) => {
    x += dx;
    y += dy;
    return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
  });
});
const ring = (ids) =>
  ids.flatMap((id, i) => {
    const a = id < 0 ? [...arcs[~id]].reverse() : arcs[id];
    return i ? a.slice(1) : a;
  });
const polys = [];
for (const g of topo.objects.land.geometries) {
  const ps = g.type === 'Polygon' ? [g.arcs] : g.arcs;
  for (const p of ps) polys.push(p.map(ring));
}
const inRing = (x, y, r) => {
  let inside = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i];
    const [xj, yj] = r[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const onLand = (lng, lat) => polys.some((p) => inRing(lng, lat, p[0]) && !p.slice(1).some((h) => inRing(lng, lat, h)));

const STEP = 2.1;
const dots = [];
for (let lat = -58; lat <= 78; lat += STEP) {
  const n = Math.max(1, Math.round((360 / STEP) * Math.cos((lat * Math.PI) / 180)));
  for (let i = 0; i < n; i++) {
    const lng = -180 + (i / n) * 360;
    if (onLand(lng, lat)) dots.push(Math.round(lat * 10) / 10, Math.round(lng * 10) / 10);
  }
}
await mkdir('public/data', { recursive: true });
await writeFile('public/data/globe-dots.json', JSON.stringify(dots));
console.log(`${dots.length / 2} nokta`);
