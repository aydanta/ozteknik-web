import * as THREE from 'three';

/**
 * Parça modelleri — üç hat, tek üretici.
 *  - EGEROT tork kolu (ER0107: Ø50 boru, 740 mm eksen arası) — prosedürel, ürün çizimine göre
 *  - HYDCAB kabin kaldırma silindiri — prosedürel (piston kolu dışarı çıkar)
 *  - REVOL debriyaj diski CD8 007 072 — firmanın CAD verisinden (public/models, 869 KB)
 * Birim: metre. Her parça explode(t) ile 0 (montajlı) → 1 (patlatılmış) arasında anime edilir.
 * Prosedürel modeller CAD GLB'leri gelince aynı arayüzle değiştirilir (şartname: "modeller CAD GLB ile değiştirilir").
 */
export interface Part {
  group: THREE.Group;
  explode: (t: number) => void;
  anchors: { key: string; obj: THREE.Object3D }[];
  dispose: () => void;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (t: number, a: number, b: number) => ease(clamp01((t - a) / (b - a)));

export const MAT = {
  paint: () => new THREE.MeshStandardMaterial({ color: 0x1a1d21, metalness: 0.45, roughness: 0.5 }),
  steel: () => new THREE.MeshStandardMaterial({ color: 0x7d8389, metalness: 0.92, roughness: 0.34 }),
  zinc: () => new THREE.MeshStandardMaterial({ color: 0xb9bec3, metalness: 1, roughness: 0.22 }),
  chrome: () => new THREE.MeshStandardMaterial({ color: 0xe4e8eb, metalness: 1, roughness: 0.06 }),
  rubber: () => new THREE.MeshStandardMaterial({ color: 0x0c0d0f, metalness: 0, roughness: 0.92 }),
  seal: () => new THREE.MeshStandardMaterial({ color: 0x1f6fd1, metalness: 0.1, roughness: 0.5 }),
  accent: () => new THREE.MeshStandardMaterial({ color: 0x18a99e, metalness: 0.3, roughness: 0.4, emissive: 0x0a3d39, emissiveIntensity: 0.4 }),
};

function anchor(parent: THREE.Object3D, key: string, x: number, y: number, z: number) {
  const o = new THREE.Object3D();
  o.position.set(x, y, z);
  o.name = key;
  parent.add(o);
  return { key, obj: o };
}

function disposeGroup(g: THREE.Object3D) {
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) {
      m.geometry.dispose();
      (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => x.dispose());
    }
  });
}

/** Ortası delik yassı pim ucu (bar pin lug) */
function lugGeometry(w: number, d: number, h: number, hole: number) {
  const s = new THREE.Shape();
  const r = Math.min(w, d) * 0.28;
  s.moveTo(-w / 2 + r, -d / 2);
  s.lineTo(w / 2 - r, -d / 2);
  s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r);
  s.lineTo(w / 2, d / 2 - r);
  s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2);
  s.lineTo(-w / 2 + r, d / 2);
  s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r);
  s.lineTo(-w / 2, -d / 2 + r);
  s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
  const p = new THREE.Path();
  p.absarc(0, 0, hole, 0, Math.PI * 2, true);
  s.holes.push(p);
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelSize: 0.0015, bevelThickness: 0.0015, bevelSegments: 2, curveSegments: 24 });
  g.translate(0, 0, -h / 2);
  return g;
}

/* ---------------- EGEROT tork kolu ---------------- */
export function torqueRod(): Part {
  const group = new THREE.Group();
  const CC = 0.74; // eksenler arası
  const tubeLen = CC - 0.2;
  const m = { paint: MAT.paint(), steel: MAT.steel(), zinc: MAT.zinc(), rubber: MAT.rubber() };

  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, tubeLen, 64, 1), m.paint);
  tube.rotation.z = Math.PI / 2;
  group.add(tube);
  // ince kaynak/şekillendirme halkaları
  for (const sx of [-1, 1]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0255, 0.0018, 12, 64), m.steel);
    ring.rotation.y = Math.PI / 2;
    ring.position.x = sx * (tubeLen / 2 - 0.004);
    group.add(ring);
  }

  const ends: { housing: THREE.Group; bush: THREE.Mesh; pin: THREE.Group; sx: number }[] = [];
  for (const sx of [-1, 1]) {
    const housing = new THREE.Group();
    housing.position.x = (sx * CC) / 2;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.072, 72, 1, true), m.steel);
    body.rotation.x = Math.PI / 2;
    housing.add(body);
    const faceGeo = new THREE.RingGeometry(0.044, 0.05, 72);
    for (const sz of [-1, 1]) {
      const face = new THREE.Mesh(faceGeo, m.steel);
      face.position.z = sz * 0.036;
      if (sz < 0) face.rotation.y = Math.PI;
      housing.add(face);
    }
    // boru boynu (konik geçiş)
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.034, 0.06, 48), m.steel);
    neck.rotation.z = Math.PI / 2;
    neck.position.x = -sx * 0.072;
    housing.add(neck);
    group.add(housing);

    // kauçuk-metal burç
    const bush = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.044, 0.078, 64, 1, true), m.rubber);
    bush.rotation.x = Math.PI / 2;
    const bushFace = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.044, 64), m.rubber);
    bushFace.position.y = 0.039;
    bushFace.rotation.x = -Math.PI / 2;
    const bushFace2 = bushFace.clone();
    bushFace2.position.y = -0.039;
    bushFace2.rotation.x = Math.PI / 2;
    bush.add(bushFace, bushFace2);
    bush.position.set((sx * CC) / 2, 0, 0);
    group.add(bush);

    // pim (orta silindir + iki delikli yassı uç)
    const pin = new THREE.Group();
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.1, 48), m.zinc);
    core.rotation.x = Math.PI / 2;
    pin.add(core);
    for (const sz of [-1, 1]) {
      const lug = new THREE.Mesh(lugGeometry(0.075, 0.034, 0.018, 0.0085), m.zinc);
      lug.rotation.x = Math.PI / 2;
      lug.position.z = sz * 0.068;
      pin.add(lug);
    }
    pin.position.set((sx * CC) / 2, 0, 0);
    group.add(pin);
    ends.push({ housing, bush, pin, sx });
  }

  const anchors = [anchor(tube, 'tube', 0, 0.03, 0), anchor(ends[1].bush, 'bushing', 0, 0, 0.05), anchor(ends[1].pin, 'pin', 0.04, 0, 0.07)];

  return {
    group,
    anchors,
    explode(t) {
      const a = seg(t, 0, 0.45);
      const b = seg(t, 0.3, 0.8);
      const c = seg(t, 0.5, 1);
      for (const e of ends) {
        e.housing.position.x = (e.sx * CC) / 2 + e.sx * 0.1 * a;
        e.bush.position.x = e.housing.position.x;
        e.pin.position.x = e.housing.position.x;
        e.bush.position.z = 0.13 * b;
        e.pin.position.z = 0.13 * b + 0.15 * c;
      }
    },
    dispose: () => disposeGroup(group),
  };
}

/* ---------------- HYDCAB kabin kaldırma silindiri ---------------- */
export function cabCylinder(): Part {
  const group = new THREE.Group();
  const m = { paint: MAT.paint(), steel: MAT.steel(), chrome: MAT.chrome(), seal: MAT.seal(), zinc: MAT.zinc(), rubber: MAT.rubber() };
  m.paint.transparent = true;
  const L = 0.42;

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.034, L, 72, 1, true), m.paint);
  barrel.rotation.z = Math.PI / 2;
  barrel.position.x = -0.06;
  group.add(barrel);
  const capGeo = new THREE.CylinderGeometry(0.037, 0.037, 0.022, 72);
  const capA = new THREE.Mesh(capGeo, m.steel);
  capA.rotation.z = Math.PI / 2;
  capA.position.x = -0.06 - L / 2;
  const capB = capA.clone();
  capB.position.x = -0.06 + L / 2;
  group.add(capA, capB);

  // taban göz (montaj)
  const eyeGeo = new THREE.TorusGeometry(0.022, 0.009, 16, 48);
  const baseEye = new THREE.Mesh(eyeGeo, m.steel);
  baseEye.position.x = -0.06 - L / 2 - 0.035;
  group.add(baseEye);
  const baseNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.02, 32), m.steel);
  baseNeck.rotation.z = Math.PI / 2;
  baseNeck.position.x = -0.06 - L / 2 - 0.012;
  group.add(baseNeck);

  // valf bloğu + port
  const valve = new THREE.Group();
  const block = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.05, 0.06), m.zinc);
  valve.add(block);
  for (const dx of [-0.018, 0.018]) {
    const fit = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.03, 24), m.steel);
    fit.position.set(dx, 0.04, 0);
    const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.012, 6), m.steel);
    nut.position.set(dx, 0.03, 0);
    valve.add(fit, nut);
  }
  valve.position.set(-0.06 - L / 2 + 0.05, 0.058, 0);
  group.add(valve);

  // piston + kol
  const rod = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0145, 0.0145, L, 48), m.chrome);
  shaft.rotation.z = Math.PI / 2;
  shaft.position.x = L / 2;
  rod.add(shaft);
  const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.0315, 0.0315, 0.034, 64), m.steel);
  piston.rotation.z = Math.PI / 2;
  rod.add(piston);
  const seals: THREE.Mesh[] = [];
  for (const dx of [-0.009, 0.009]) {
    const s = new THREE.Mesh(new THREE.TorusGeometry(0.0318, 0.0028, 12, 64), m.seal);
    s.rotation.y = Math.PI / 2;
    s.position.x = dx;
    rod.add(s);
    seals.push(s);
  }
  const tipEye = new THREE.Mesh(eyeGeo, m.steel);
  tipEye.position.x = L + 0.03;
  rod.add(tipEye);
  rod.position.x = -0.06 - L / 2 + 0.06;
  group.add(rod);
  const rodHome = rod.position.x;

  // rod contası (kapakta)
  const rodSeal = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.003, 12, 48), m.seal);
  rodSeal.rotation.y = Math.PI / 2;
  rodSeal.position.x = -0.06 + L / 2 + 0.012;
  group.add(rodSeal);

  const anchors = [
    anchor(barrel, 'tube', 0.0, 0.0, 0.035),
    anchor(piston, 'piston', 0, 0.035, 0),
    anchor(rodSeal, 'seals', 0, 0.02, 0),
    anchor(valve, 'valve', 0, 0.04, 0),
  ];

  return {
    group,
    anchors,
    explode(t) {
      const a = seg(t, 0, 0.55);
      const b = seg(t, 0.35, 0.9);
      rod.position.x = rodHome + 0.24 * a;
      group.position.x = -0.13 * a; // uzayan kol çerçevede kalsın
      m.paint.opacity = 1 - 0.78 * b;
      m.paint.depthWrite = b < 0.2;
      valve.position.y = 0.058 + 0.07 * b;
      seals[0].position.x = -0.009 - 0.02 * b;
      seals[1].position.x = 0.009 + 0.02 * b;
      rodSeal.position.x = -0.06 + L / 2 + 0.012 + 0.05 * b;
    },
    dispose: () => disposeGroup(group),
  };
}

/* ---------------- REVOL debriyaj diski (CAD) ---------------- */
export async function clutchDisc(url: string): Promise<Part> {
  const [{ GLTFLoader }, { toCreasedNormals }] = await Promise.all([
    import('three/examples/jsm/loaders/GLTFLoader.js'),
    import('three/examples/jsm/utils/BufferGeometryUtils.js'),
  ]);
  const gltf = await new GLTFLoader().loadAsync(url);
  const root = gltf.scene;
  const group = new THREE.Group();
  const pieces: { obj: THREE.Mesh; layer: number; base: number; kind: string }[] = [];
  const COLOR: Record<string, THREE.MeshStandardMaterialParameters> = {
    facing: { color: 0x26221f, metalness: 0, roughness: 0.95 },
    cushion: { color: 0x9aa1a7, metalness: 0.9, roughness: 0.3 },
    'rivet-ring': { color: 0xb08d57, metalness: 0.9, roughness: 0.35 },
    'damper-spring': { color: 0x3a3f45, metalness: 0.85, roughness: 0.32 },
    'stop-pin': { color: 0xaab0b5, metalness: 0.9, roughness: 0.3 },
    hub: { color: 0xb5ad94, metalness: 0.9, roughness: 0.32 },
    'hub-flange': { color: 0x8f949a, metalness: 0.9, roughness: 0.38 },
    plate: { color: 0x2c3036, metalness: 0.75, roughness: 0.42 },
  };
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const extras = (mesh.userData && Object.keys(mesh.userData).length ? mesh.userData : mesh.parent?.userData) as { kind?: string; layer?: number };
    const kind = extras?.kind ?? 'plate';
    const geo = toCreasedNormals(mesh.geometry, (32 * Math.PI) / 180);
    const mat = new THREE.MeshStandardMaterial({ ...(COLOR[kind] ?? COLOR.plate), side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat);
    m.name = mesh.name;
    pieces.push({ obj: m, layer: extras?.layer ?? 0, base: 0, kind });
    group.add(m);
  });
  const maxLayer = Math.max(...pieces.map((p) => p.layer));
  // eğim için ara grup (dış grup sahnede döndürülür)
  const tilt = new THREE.Group();
  for (const p of pieces) tilt.add(p.obj);
  group.add(tilt);
  const pick = (k: string) => pieces.find((p) => p.obj.name.startsWith(k))?.obj ?? group;
  const anchors = [
    anchor(pick('facing-top'), 'facing', 0.2, 0, 0),
    anchor(pick('cushion'), 'cushion', 0.15, 0, 0.08),
    anchor(pick('damper-spring'), 'damper-spring', 0.09, 0, -0.03),
    anchor(pick('hub'), 'hub', 0, 0.03, 0.03),
  ];
  return {
    group,
    anchors,
    explode(t) {
      const e = ease(clamp01(t));
      for (const p of pieces) p.obj.position.y = (p.layer - maxLayer / 2) * 0.044 * e;
      // patlarken yandan bakışa dön: katmanlar üst üste değil, yelpaze gibi görünsün
      tilt.rotation.x = -0.62 * e;
    },
    dispose: () => disposeGroup(group),
  };
}

/** Ortak sahne: PBR yansımaları için oda ortamı + anahtar/kenar ışığı. */
export async function makeStage(canvas: HTMLCanvasElement) {
  const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(1.2, 1.6, 1.4);
  const rim = new THREE.DirectionalLight(0x2fd9c9, 0.9);
  rim.position.set(-1.6, 0.6, -1.2);
  scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.08));
  const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 20);
  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  return { renderer, scene, camera, resize };
}

/** 3D çizmeye değer mi? WebGL yoksa, hareketi azalt açıksa veya cihaz zayıfsa → fotoğraf/çizim */
export function canRender3D(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return false;
  if (nav.deviceMemory !== undefined && nav.deviceMemory < 3) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
