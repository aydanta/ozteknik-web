'use client';
import { useEffect, useRef } from 'react';

/** 1971'den bugüne — scroll ile dolan çizgi (hareketi azalt → dolu) */
export default function Timeline({ items }: { items: { y: string; t: string }[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current!;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fill.current!.style.height = 'calc(100% - 12px)';
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height));
      fill.current!.style.height = `${p * 100}%`;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <div style={{ position: 'relative' }}>
      <span ref={fill} className="timeline-fill" aria-hidden />
      <ol ref={ref} className="timeline">
      {items.map((i) => (
        <li key={i.y + i.t.slice(0, 8)}>
          <b>{i.y}</b>
          <p className="muted">{i.t}</p>
        </li>
      ))}
      </ol>
    </div>
  );
}
