'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Ana sayfa 3D parça: fareyi izleyen EGEROT tork kolu (ER0107), rakamlar bandının altında. LCP öğesi asla 3D değildir — önde aynı parçanın
 * teknik çizimi (poster) durur; WebGL hazır olunca yumuşak geçiş. Hareketi azalt / WebGL yok → poster kalır.
 * Ekran dışındayken çizim durur.
 */
export default function HeroPart({ poster, alt }: { poster: string; alt: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let raf = 0;
    let disposed = false;
    let cleanup = () => {};
    const el = canvas.current!;
    const start = async () => {
      const { canRender3D, makeStage, torqueRod } = await import('./parts');
      if (!canRender3D() || disposed) return;
      const THREE = await import('three');
      const { renderer, scene, camera, resize } = await makeStage(el);
      const part = torqueRod();
      part.group.rotation.set(0.35, -0.55, 0.12);
      scene.add(part.group);
      camera.position.set(0, -0.06, 1.62);
      camera.lookAt(0, -0.06, 0);
      const target = { x: 0, y: 0 };
      const cur = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => {
        target.x = (e.clientX / window.innerWidth - 0.5) * 0.7;
        target.y = (e.clientY / window.innerHeight - 0.5) * 0.4;
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      let visible = true;
      const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
      io.observe(el);
      // kadraj: tuval oranı ne olursa olsun parça yatayda aynı oranı doldursun (1,15 oranında z = 1,62)
      const fit = () => {
        resize();
        camera.position.z = 1.86 / camera.aspect;
      };
      fit();
      const ro = new ResizeObserver(fit);
      ro.observe(el);
      const clock = new THREE.Timer();
      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (!visible || document.hidden) return;
        clock.update();
        const t = clock.getElapsed();
        cur.x += (target.x - cur.x) * 0.05;
        cur.y += (target.y - cur.y) * 0.05;
        part.group.rotation.y = -0.55 + cur.x + Math.sin(t * 0.35) * 0.08;
        part.group.rotation.x = 0.35 + cur.y;
        part.group.position.y = 0.02 + Math.sin(t * 0.8) * 0.006;
        renderer.render(scene, camera);
      };
      loop();
      setReady(true);
      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', onMove);
        io.disconnect();
        ro.disconnect();
        part.dispose();
        renderer.dispose();
      };
    };
    // ana iş parçacığını ilk boyamada meşgul etme
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 600));
    idle(() => void start());
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div className="hero-part" data-ready={ready}>
      <img className="hero-poster drawing" src={poster} alt={alt} width={527} height={391} fetchPriority="high" />
      <canvas ref={canvas} className="hero-canvas" aria-hidden />
    </div>
  );
}
