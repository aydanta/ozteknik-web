'use client';
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';

/**
 * 3D görüntüleyici: döndür, yakınlaştır, patlatılmış görünüm. Model yalnız "3D görünüm"e basınca yüklenir
 * (ürün sayfası < 1 MB bütçesi). WebGL yoksa poster kalır.
 */
export default function ModelViewer({ src, poster, label, explodeLabel }: { src: string; poster: string; label: string; explodeLabel: string }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<'poster' | 'loading' | 'ready' | 'unsupported'>('poster');
  const [explode, setExplode] = useState(0.0);
  const api = useRef<{ explode: (t: number) => void } | null>(null);

  useEffect(() => {
    api.current?.explode(explode);
  }, [explode]);

  useEffect(() => {
    if (state !== 'loading') return;
    let raf = 0;
    let cleanup = () => {};
    (async () => {
      const parts = await import('./parts');
      const c = document.createElement('canvas');
      if (!(c.getContext('webgl2') || c.getContext('webgl'))) {
        setState('unsupported');
        return;
      }
      const [THREE, { OrbitControls }] = await Promise.all([import('three'), import('three/examples/jsm/controls/OrbitControls.js')]);
      const { renderer, scene, camera, resize } = await parts.makeStage(canvas.current!);
      const part = await parts.clutchDisc(src);
      part.group.rotation.set(1.0, 0, 0.2);
      part.group.scale.setScalar(1.5);
      scene.add(part.group);
      camera.position.set(0, 0.1, 1.5);
      const controls = new OrbitControls(camera, canvas.current!);
      controls.enableDamping = true;
      controls.minDistance = 0.6;
      controls.maxDistance = 3;
      controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      controls.autoRotateSpeed = 0.8;
      api.current = { explode: (t) => part.explode(t) };
      const ro = new ResizeObserver(resize);
      ro.observe(canvas.current!);
      const loop = () => {
        raf = requestAnimationFrame(loop);
        controls.update();
        renderer.render(scene, camera);
      };
      loop();
      setState('ready');
      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        controls.dispose();
        part.dispose();
        renderer.dispose();
        void THREE;
      };
    })();
    return () => cleanup();
  }, [state, src]);

  return (
    <div ref={host} className="viewer3d">
      {state !== 'ready' && <img src={poster} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', padding: '8%' }} />}
      <canvas ref={canvas} aria-label={label} role="img" style={{ opacity: state === 'ready' ? 1 : 0 }} />
      <div className="row">
        {state === 'poster' && (
          <button type="button" className="btn btn--primary btn--sm" onClick={() => setState('loading')}>
            <Icon name="cube" size={16} /> {label}
          </button>
        )}
        {state === 'loading' && <span className="chip">…</span>}
        {state === 'ready' && (
          <label className="chip" style={{ gap: 10 }}>
            <Icon name="layers" size={14} /> {explodeLabel}
            <input type="range" min={0} max={1} step={0.01} value={explode} onChange={(e) => setExplode(Number(e.target.value))} style={{ accentColor: 'var(--accent)' }} />
          </label>
        )}
      </div>
    </div>
  );
}
