#!/usr/bin/env node
/**
 * Mevcut sitedeki CAD kaynaklı GLB'yi (CD8 007 072 debriyaj diski, 14 MB, indekssiz, normalsiz)
 * web'e uygun hâle getirir: köşe birleştirme → parça/katman ayrımı → sadeleştirme → tek GLB (< 3 MB).
 * Normal vektörleri istemcide kırışık açıyla hesaplanır (dosya küçük kalır).
 *
 *   node scripts/migrate/04-optimize-glb.mjs <girdi.glb> public/models/revol-cd8-007-072-clutch-disc.glb
 *
 * Katmanlar (patlatılmış görünüm sırası) üçgen ağırlık merkezinin disk eksenindeki (Y) konumundan çıkar;
 * parça adları disk geometrisinden (yarıçap aralığı + CAD renk grubu) atanır.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { MeshoptSimplifier } from 'meshoptimizer';

const [, , input, output] = process.argv;
if (!input || !output) {
  console.error('kullanım: 04-optimize-glb.mjs <girdi.glb> <çıktı.glb>');
  process.exit(1);
}
await MeshoptSimplifier.ready;

const buf = await readFile(input);
const jsonLen = buf.readUInt32LE(12);
const gltf = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));
const binStart = 20 + jsonLen + 8;
const bin = buf.subarray(binStart, binStart + buf.readUInt32LE(20 + jsonLen));

function positions(meshIndex) {
  const acc = gltf.accessors[gltf.meshes[meshIndex].primitives[0].attributes.POSITION];
  const bv = gltf.bufferViews[acc.bufferView];
  const start = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  return new Float32Array(bin.buffer.slice(bin.byteOffset + start, bin.byteOffset + start + acc.count * 12));
}

/* --- genel sınırlar: merkez + ölçek (mm → m) --- */
let min = [Infinity, Infinity, Infinity];
let max = [-Infinity, -Infinity, -Infinity];
const raw = gltf.meshes.map((_, i) => positions(i));
for (const p of raw)
  for (let i = 0; i < p.length; i += 3)
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], p[i + k]);
      max[k] = Math.max(max[k], p[i + k]);
    }
const center = [(min[0] + max[0]) / 2, 0, (min[2] + max[2]) / 2];
const MID_Y = 270.5; // diskin orta düzlemi (balata merkezleri)
const S = 0.001;

/* CAD renk grubu (malzeme indeksi) → parça türü */
const KIND = { 0: 'hub', 5: 'hub-flange', 3: 'facing', 2: 'cushion', 4: 'rivet-ring', 6: 'damper-spring', 7: 'stop-pin', 1: 'plate' };

/* --- her parçayı Y bandına göre böl --- */
const pieces = new Map(); // ad → { kind, tris: number[] (düz konumlar) }
function add(name, kind, tri) {
  if (!pieces.has(name)) pieces.set(name, { kind, data: [] });
  pieces.get(name).data.push(...tri);
}
gltf.meshes.forEach((m, mi) => {
  const kind = KIND[m.primitives[0].material] || 'plate';
  const p = raw[mi];
  for (let t = 0; t < p.length; t += 9) {
    const cy = (p[t + 1] + p[t + 4] + p[t + 7]) / 3;
    let band;
    if (kind === 'hub' || kind === 'hub-flange' || kind === 'damper-spring' || kind === 'stop-pin' || kind === 'cushion' || kind === 'rivet-ring') band = '';
    else if (kind === 'facing') band = cy > MID_Y ? '-top' : '-bottom';
    else band = cy > 280 ? '-top' : cy < 266 ? '-bottom' : '-mid';
    add(kind + band, kind, Array.from(p.subarray(t, t + 9)));
  }
});

/* --- birleştir, sadeleştir --- */
const out = [];
for (const [name, { kind, data }] of pieces) {
  const map = new Map();
  const verts = [];
  const idx = new Uint32Array(data.length / 3);
  for (let v = 0; v < data.length / 3; v++) {
    const x = data[v * 3] - center[0];
    const y = data[v * 3 + 1] - MID_Y;
    const z = data[v * 3 + 2] - center[2];
    const key = `${Math.round(x * 1e3)},${Math.round(y * 1e3)},${Math.round(z * 1e3)}`;
    let id = map.get(key);
    if (id === undefined) {
      id = verts.length / 3;
      map.set(key, id);
      verts.push(x * S, y * S, z * S);
    }
    idx[v] = id;
  }
  const pos = new Float32Array(verts);
  const ratio = kind === 'damper-spring' ? 0.35 : kind === 'hub' ? 0.3 : 0.18;
  const target = Math.max(300, Math.floor((idx.length * ratio) / 3) * 3);
  const [simp] = MeshoptSimplifier.simplify(idx, pos, 3, target, 0.0025, ['LockBorder']);
  // kullanılmayan köşeleri at
  const remap = new Int32Array(pos.length / 3).fill(-1);
  const packed = [];
  const newIdx = new Uint32Array(simp.length);
  for (let i = 0; i < simp.length; i++) {
    const o = simp[i];
    if (remap[o] < 0) {
      remap[o] = packed.length / 3;
      packed.push(pos[o * 3], pos[o * 3 + 1], pos[o * 3 + 2]);
    }
    newIdx[i] = remap[o];
  }
  const p32 = new Float32Array(packed);
  let ymin = Infinity, ymax = -Infinity;
  for (let i = 1; i < p32.length; i += 3) { ymin = Math.min(ymin, p32[i]); ymax = Math.max(ymax, p32[i]); }
  out.push({ name, kind, pos: p32, idx: newIdx, yc: (ymin + ymax) / 2, tris: newIdx.length / 3, srcTris: idx.length / 3 });
}

/* --- patlatma sırası: Y merkezine göre --- */
out.sort((a, b) => a.yc - b.yc);
out.forEach((o, i) => (o.layer = i));

/* --- GLB yaz --- */
const MATS = {
  hub: { name: 'zinc-steel', c: [0.62, 0.6, 0.55, 1], m: 0.85, r: 0.38 },
  'hub-flange': { name: 'zinc-steel-2', c: [0.55, 0.54, 0.5, 1], m: 0.85, r: 0.42 },
  facing: { name: 'friction', c: [0.1, 0.095, 0.09, 1], m: 0.0, r: 0.95 },
  cushion: { name: 'spring-steel', c: [0.42, 0.44, 0.46, 1], m: 0.9, r: 0.32 },
  'rivet-ring': { name: 'brass', c: [0.6, 0.48, 0.3, 1], m: 0.9, r: 0.35 },
  'damper-spring': { name: 'spring-steel-dark', c: [0.22, 0.23, 0.25, 1], m: 0.9, r: 0.3 },
  'stop-pin': { name: 'pin', c: [0.5, 0.52, 0.55, 1], m: 0.9, r: 0.3 },
  plate: { name: 'stamped-steel', c: [0.2, 0.21, 0.22, 1], m: 0.8, r: 0.45 },
};
const matKeys = [...new Set(out.map((o) => o.kind))];
const chunks = [];
let offset = 0;
const bufferViews = [];
const accessors = [];
const meshes = [];
const nodes = [];
function pushView(arr, target) {
  const bytes = Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
  const pad = (4 - (bytes.length % 4)) % 4;
  chunks.push(bytes, Buffer.alloc(pad));
  bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: bytes.length, target });
  offset += bytes.length + pad;
  return bufferViews.length - 1;
}
for (const o of out) {
  const pmin = [Infinity, Infinity, Infinity], pmax = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < o.pos.length; i += 3) for (let k = 0; k < 3; k++) { pmin[k] = Math.min(pmin[k], o.pos[i + k]); pmax[k] = Math.max(pmax[k], o.pos[i + k]); }
  const pv = pushView(o.pos, 34962);
  accessors.push({ bufferView: pv, componentType: 5126, count: o.pos.length / 3, type: 'VEC3', min: pmin, max: pmax });
  const pa = accessors.length - 1;
  const small = o.pos.length / 3 < 65536;
  const iv = pushView(small ? Uint16Array.from(o.idx) : o.idx, 34963);
  accessors.push({ bufferView: iv, componentType: small ? 5123 : 5125, count: o.idx.length, type: 'SCALAR' });
  meshes.push({ name: o.name, primitives: [{ attributes: { POSITION: pa }, indices: accessors.length - 1, material: matKeys.indexOf(o.kind) }] });
  nodes.push({ name: o.name, mesh: meshes.length - 1, extras: { kind: o.kind, layer: o.layer, yc: o.yc } });
}
const json = {
  asset: { version: '2.0', generator: 'ozteknik-web/04-optimize-glb', copyright: '© Özteknik A.Ş.' },
  scene: 0,
  scenes: [{ nodes: [nodes.length] }],
  nodes: [...nodes, { name: 'CD8-007-072', children: nodes.map((_, i) => i), extras: { code: 'CD8 007 072', brand: 'REVOL', diameterMm: 430 } }],
  meshes,
  materials: matKeys.map((k) => ({ name: MATS[k].name, pbrMetallicRoughness: { baseColorFactor: MATS[k].c, metallicFactor: MATS[k].m, roughnessFactor: MATS[k].r }, doubleSided: true })),
  accessors,
  bufferViews,
  buffers: [{ byteLength: offset }],
};
let jsonBuf = Buffer.from(JSON.stringify(json));
jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc((4 - (jsonBuf.length % 4)) % 4, 0x20)]);
const binBuf = Buffer.concat(chunks);
const header = Buffer.alloc(12);
header.write('glTF', 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(12 + 8 + jsonBuf.length + 8 + binBuf.length, 8);
const jh = Buffer.alloc(8);
jh.writeUInt32LE(jsonBuf.length, 0);
jh.write('JSON', 4);
const bh = Buffer.alloc(8);
bh.writeUInt32LE(binBuf.length, 0);
bh.write('BIN\0', 4);
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, Buffer.concat([header, jh, jsonBuf, bh, binBuf]));
console.table(out.map((o) => ({ part: o.name, layer: o.layer, tris: o.tris, from: o.srcTris, yc_mm: Math.round(o.yc * 1000) })));
console.log(`→ ${output} ${(12 + 16 + jsonBuf.length + binBuf.length) / 1024 | 0} KB`);
