'use client';
import { useEffect, useRef } from 'react';

/**
 * Açılış sahnesi (referans: Furkan'ın paylaştığı ajans sitesi): video ekranı kaplar, menü üstünde saydam durur.
 * Kaydırdıkça video alttan yukarı kısalır (--p: 0 → 1), logo yerinde kalır, açılan bantta marka logoları belirir.
 * Hareketi azalt → efekt yok, bant videonun altında düz durur.
 */
export default function HeroStage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const CURTAIN = 0.34; // pages.css .hero-frame clip-path ile aynı oran
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = reduce ? 0 : Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - vh)));
      el.style.setProperty('--p', p.toFixed(4));
      // videonun görünen alt kenarı menünün altındaysa menü saydam + beyaz
      const stickyTop = r.top > 0 ? r.top : Math.min(0, r.bottom - vh);
      const videoBottom = stickyTop + vh * (1 - CURTAIN * p);
      const headerH = document.querySelector('.site-header')?.getBoundingClientRect().height ?? 72;
      root.dataset.hero = videoBottom > headerH + 8 ? 'over' : 'off';
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      cancelAnimationFrame(raf);
      delete root.dataset.hero;
    };
  }, []);
  return (
    <div ref={ref} className="hero-stage">
      {children}
    </div>
  );
}
