'use client';
import { useEffect, useRef, useState } from 'react';

/** Rakam bandı sayacı — görünür olunca sayar; hareketi azalt modunda sabit (şartname bileşen tablosu). */
export default function Counter({ value, prefix = '', suffix = '', locale }: { value: number; prefix?: string; suffix?: string; locale: string }) {
  const ref = useRef<HTMLElement>(null);
  const [n, setN] = useState(value);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current!;
    let raf = 0;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting || document.hidden) return; // gizli sekmede rAF durur; sayı yarıda kalmasın
      io.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / 1200);
        setN(Math.round(value * (1 - Math.pow(1 - t, 3))));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      setN(0);
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);
  const fmt = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG-u-nu-latn' : locale, { useGrouping: value >= 10000 });
  return (
    <b ref={ref}>
      {prefix}
      {fmt.format(n)}
      {suffix}
    </b>
  );
}
