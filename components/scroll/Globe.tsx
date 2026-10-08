'use client';
import { useEffect, useRef } from 'react';

/**
 * Noktalı dünya küresi — İzmir'den bölge rotaları; sürüklenebilir. Canvas 2D ortografik izdüşüm (WebGL yok, ~3 KB kod).
 * JS yok / hareketi azalt → statik çizim (ilk kare) kalır. Bölgeler şartnamedeki hedef pazar tablosundan.
 */
const IZMIR: [number, number] = [38.42, 27.14];
const ROUTES: [number, number][] = [
  [50.1, 8.7], // Orta Avrupa
  [48.9, 2.3], // Fransa / Benelüks
  [40.4, -3.7], // İberya
  [45.5, 9.2], // İtalya
  [51.2, 71.4], // Kazakistan / Orta Asya
  [25.2, 55.3], // Körfez
  [33.3, 44.4], // Irak
  [30.0, 31.2], // Mısır
  [33.6, -7.6], // Mağrip
  [14.7, -17.4], // Batı Afrika
  [-33.4, -70.6], // Şili
  [-12.0, -77.0], // Peru
];

export default function Globe({ label }: { label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext('2d')!;
    let dots: number[] = [];
    let rotLng = -IZMIR[1] - 18;
    const rotLat = -22;
    let drag: { x: number; r: number } | null = null;
    let raf = 0;
    let visible = false;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const css = getComputedStyle(document.documentElement);
    const col = (v: string, f: string) => css.getPropertyValue(v).trim() || f;

    const rad = Math.PI / 180;
    const project = (lat: number, lng: number, R: number, cx: number, cy: number) => {
      const φ = lat * rad;
      const λ = (lng + rotLng) * rad;
      const φ0 = rotLat * rad;
      const cosc = Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(λ);
      const x = R * Math.cos(φ) * Math.sin(λ);
      const y = R * (Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ));
      return { x: cx + x, y: cy - y, front: cosc > 0, depth: cosc };
    };
    const slerp = (a: [number, number], b: [number, number], t: number): [number, number] => {
      const toV = ([la, lo]: [number, number]) => [Math.cos(la * rad) * Math.cos(lo * rad), Math.cos(la * rad) * Math.sin(lo * rad), Math.sin(la * rad)];
      const A = toV(a);
      const B = toV(b);
      const d = Math.acos(Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
      const s = Math.sin(d) || 1;
      const k1 = Math.sin((1 - t) * d) / s;
      const k2 = Math.sin(t * d) / s;
      const v = [A[0] * k1 + B[0] * k2, A[1] * k1 + B[1] * k2, A[2] * k1 + B[2] * k2];
      return [Math.atan2(v[2], Math.hypot(v[0], v[1])) / rad, Math.atan2(v[1], v[0]) / rad];
    };

    let t0 = performance.now();
    const draw = (now: number) => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (c.width !== w * dpr) {
        c.width = w * dpr;
        c.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * 0.46;
      const cx = w / 2;
      const cy = h / 2;
      const g = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.4, R * 0.1, cx, cy, R);
      g.addColorStop(0, 'rgba(24,169,158,0.10)');
      g.addColorStop(1, 'rgba(24,169,158,0.02)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = col('--line-strong', 'rgba(255,255,255,.16)');
      ctx.stroke();
      const dotCol = col('--text-2', '#8d99a4');
      for (let i = 0; i < dots.length; i += 2) {
        const p = project(dots[i], dots[i + 1], R, cx, cy);
        if (!p.front) continue;
        ctx.globalAlpha = 0.25 + 0.75 * p.depth;
        ctx.fillStyle = dotCol;
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
      }
      ctx.globalAlpha = 1;
      const phase = ((now - t0) / 2600) % 1;
      const accent = col('--accent-hi', '#2fd9c9');
      for (const [i, dst] of ROUTES.entries()) {
        ctx.beginPath();
        let started = false;
        for (let s = 0; s <= 48; s++) {
          const [la, lo] = slerp(IZMIR, dst, s / 48);
          const lift = 1 + Math.sin((s / 48) * Math.PI) * 0.12;
          const p = project(la, lo, R * lift, cx, cy);
          if (!project(la, lo, R, cx, cy).front) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(p.x, p.y);
            started = true;
          } else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = accent;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        // ilerleyen nokta
        const tt = (phase + i / ROUTES.length) % 1;
        const [la, lo] = slerp(IZMIR, dst, tt);
        const pp = project(la, lo, R * (1 + Math.sin(tt * Math.PI) * 0.12), cx, cy);
        if (project(la, lo, R, cx, cy).front && !reduce) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = accent;
          ctx.beginPath();
          ctx.arc(pp.x, pp.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
        const d = project(dst[0], dst[1], R, cx, cy);
        if (d.front) {
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = accent;
          ctx.beginPath();
          ctx.arc(d.x, d.y, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      const iz = project(IZMIR[0], IZMIR[1], R, cx, cy);
      ctx.globalAlpha = 1;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(iz.x, iz.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(iz.x, iz.y, 10 + 6 * Math.sin(now / 400), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = col('--text', '#e9eef1');
      ctx.font = '600 12px ui-monospace, monospace';
      ctx.fillText('İZMİR', iz.x + 10, iz.y - 8);
    };
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      if (!drag && !reduce) rotLng += 0.03;
      draw(now);
    };
    const down = (e: PointerEvent) => {
      drag = { x: e.clientX, r: rotLng };
      c.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (drag) {
        rotLng = drag.r + (e.clientX - drag.x) * 0.35;
        if (reduce) draw(performance.now());
      }
    };
    const up = () => (drag = null);
    c.addEventListener('pointerdown', down);
    c.addEventListener('pointermove', move);
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible && !dots.length)
        fetch('/data/globe-dots.json')
          .then((r) => r.json())
          .then((d) => {
            dots = d;
            t0 = performance.now();
            draw(t0);
          });
    });
    io.observe(c);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      c.removeEventListener('pointerdown', down);
      c.removeEventListener('pointermove', move);
      c.removeEventListener('pointerup', up);
      c.removeEventListener('pointercancel', up);
    };
  }, []);
  return <canvas ref={ref} className="globe" role="img" aria-label={label} />;
}
