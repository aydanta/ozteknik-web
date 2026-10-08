'use client';
import { useEffect, useRef, useState } from 'react';

export interface StoryStep {
  brand: 'egerot' | 'hydcab' | 'revol';
  title: string;
  text: string;
  href: string;
  cta: string;
  labels: Record<string, string>;
  fallback: string; // WebGL yoksa gösterilecek görsel
}

/**
 * "Üç marka, tek üretici" — sabitlenmiş scroll anlatımı (GSAP ScrollTrigger).
 *  1) tork kolu parçalarına ayrılır  2) kabin silindirinin piston kolu çıkar  3) debriyaj diski katmanlarına ayrılır
 * Hareket yalnız parçanın yapısını anlatır (şartname tasarım ilkesi 3). Metin her zaman DOM'da;
 * hareketi azalt / WebGL yok → statik görseller ve aynı metin.
 */
export default function ExplodedStory({ steps, modelUrl, layersLabel }: { steps: StoryStep[]; modelUrl: string; layersLabel: string }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'static' | '3d'>('static');
  const [active, setActive] = useState(0);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    let started = false;
    const init = async () => {
        if (started) return;
        started = true;
        io.disconnect();
        const { canRender3D, makeStage, torqueRod, cabCylinder, clutchDisc } = await import('./parts');
        if (!canRender3D() || disposed) return;
        const [THREE, { gsap }, { ScrollTrigger }] = await Promise.all([import('three'), import('gsap'), import('gsap/ScrollTrigger')]);
        gsap.registerPlugin(ScrollTrigger);
        setMode('3d');
        const { renderer, scene, camera, resize } = await makeStage(canvas.current!);
        const LAYOUT = {
          egerot: { rot: [0.5, -0.5, 0.1], scale: 1, spinY: -0.5 },
          hydcab: { rot: [0.35, -0.6, 0.08], scale: 1.12, spinY: -0.6 },
          revol: { rot: [1.05, 0, 0.25], scale: 1.45, spinY: 0 },
        } as const;
        const parts = await Promise.all(steps.map((s) => (s.brand === 'egerot' ? torqueRod() : s.brand === 'hydcab' ? cabCylinder() : clutchDisc(modelUrl))));
        if (disposed) return;
        parts.forEach((p, i) => {
          const L = LAYOUT[steps[i].brand];
          p.group.rotation.set(L.rot[0], L.rot[1], L.rot[2]);
          p.group.scale.setScalar(L.scale);
        });
        for (const p of parts) {
          p.group.visible = false;
          scene.add(p.group);
        }
        camera.position.set(0, 0.02, 1.85);
        camera.lookAt(0, 0, 0);

        const state = { p: 0 };
        const labelEls = labelsRef.current ? Array.from(labelsRef.current.children) as HTMLElement[] : [];
        const v = new THREE.Vector3();

        const render = () => {
          const total = state.p * steps.length; // 0..3
          const idx = Math.min(steps.length - 1, Math.floor(total));
          const local = total - idx; // 0..1 içinde
          setActive((a) => (a === idx ? a : idx));
          parts.forEach((p, i) => {
            const on = i === idx;
            p.group.visible = on;
            if (!on) return;
            // giriş/çıkış: ilk ve son %12'de ölçek
            const fadeIn = Math.min(1, local / 0.12);
            const fadeOut = Math.min(1, (1 - local) / 0.12);
            const k = steps.length === 1 ? 1 : i === 0 ? fadeOut : i === steps.length - 1 ? fadeIn : Math.min(fadeIn, fadeOut);
            const s = LAYOUT[steps[i].brand].scale * (steps.length === 1 ? 1 : 0.86 + 0.14 * k);
            p.group.scale.setScalar(s);
            p.explode(Math.min(1, Math.max(0, (local - 0.1) / 0.65)));
            p.group.rotation.y += 0.0;
          });
          renderer.render(scene, camera);
          // etiketler
          const rect = canvas.current!.getBoundingClientRect();
          const part = parts[idx];
          const show = Math.min(1, Math.max(0, (local - 0.45) / 0.15)) * Math.min(1, (1 - local) / 0.1);
          labelEls.forEach((el) => {
            const a = part.anchors.find((x) => x.key === el.dataset.key && el.dataset.step === String(idx));
            if (!a) {
              el.style.opacity = '0';
              return;
            }
            a.obj.getWorldPosition(v);
            v.project(camera);
            el.style.transform = `translate(${((v.x + 1) / 2) * rect.width}px, ${((1 - v.y) / 2) * rect.height}px)`;
            el.style.opacity = String(show);
          });
        };

        // yalnız geliştirme: gizli sekmede (rAF yok) belirli bir ilerlemede tek kare çiz — görsel QA için
        if (process.env.NODE_ENV !== 'production') {
          (window as unknown as { __ozStory?: (p: number) => string }).__ozStory = (p: number) => {
            state.p = Math.min(0.9999, p);
            render();
            return canvas.current!.toDataURL();
          };
        }
        const st = ScrollTrigger.create({
          trigger: root.current!,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.6,
          onUpdate: (self) => {
            state.p = Math.min(0.9999, self.progress);
          },
        });
        let raf = 0;
        let visible = true;
        const vis = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
        vis.observe(root.current!);
        const ro = new ResizeObserver(resize);
        ro.observe(canvas.current!);
        const clock = new THREE.Timer();
        const loop = () => {
          raf = requestAnimationFrame(loop);
          if (!visible || document.hidden) return;
          clock.update();
          const t = clock.getElapsed();
          parts.forEach((p, i) => {
            if (p.group.visible) p.group.rotation.y = LAYOUT[steps[i].brand].spinY + Math.sin(t * 0.25) * 0.12 + (steps[i].brand === 'revol' ? t * 0.08 : 0);
          });
          render();
        };
        loop();
        cleanup = () => {
          cancelAnimationFrame(raf);
          st.kill();
          vis.disconnect();
          ro.disconnect();
          parts.forEach((p) => p.dispose());
          renderer.dispose();
        };
      };
    const io = new IntersectionObserver(([en]) => en.isIntersecting && void init(), { rootMargin: '400px 0px' });
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __ozForce3D?: () => Promise<void> }).__ozForce3D = init;
    if (root.current) io.observe(root.current);
    return () => {
      disposed = true;
      io.disconnect();
      cleanup();
    };
  }, [modelUrl, steps]);

  return (
    <section ref={root} className={`story story--${mode}${steps.length === 1 ? " story--single" : ""}`} style={{ ['--steps' as string]: steps.length }} aria-label={steps.map((s) => s.title).join(' · ')}>
      <div className="story-sticky">
        <div className="story-stage">
          <canvas ref={canvas} className="story-canvas" aria-hidden />
          <div ref={labelsRef} className="story-labels" aria-hidden>
            {steps.flatMap((s, i) =>
              Object.entries(s.labels).map(([k, label]) => (
                <span key={`${i}-${k}`} data-step={i} data-key={k} className="story-label">
                  <i />
                  {label}
                </span>
              )),
            )}
          </div>
          <div className="story-progress" aria-hidden>
            {steps.map((s, i) => (
              <span key={s.brand} data-on={i === active} className={`badge badge--${s.brand}`}>
                {s.brand}
              </span>
            ))}
          </div>
        </div>
        <ol className="story-steps">
          {steps.map((s, i) => (
            <li key={s.brand} data-on={mode === 'static' || i === active}>
              <span className={`badge badge--${s.brand}`}>{s.brand.toUpperCase()}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              <p className="story-layers">
                <b>{layersLabel}:</b> {Object.values(s.labels).join(' · ')}
              </p>
              <a className="link" href={s.href}>
                {s.cta} →
              </a>
              {mode === 'static' && <img className="story-fallback" src={s.fallback} alt="" loading="lazy" />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
