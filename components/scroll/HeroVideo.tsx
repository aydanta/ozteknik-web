'use client';
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';

/**
 * Arka plan videosu. Varsayılan: mevcut siteden taşınan fabrika filmi (58 sn; 40 MB kaynak → 720p 14,8 MB / 480p 6,3 MB, sessiz).
 *  - İlk boyamada poster resmi (LCP öğesi video değil); video sayfa yüklenince başlar.
 *  - Telefonda 480p, masaüstünde 720p.
 *  - Hareketi azalt / veri tasarrufu → yalnız poster.
 *  - Duraklat/oynat düğmesi (WCAG 2.2.2: 5 sn'den uzun hareketli içerik durdurulabilmeli).
 */
const FACTORY = {
  hi: '/video/ozteknik-fabrika-720p.mp4',
  lo: '/video/ozteknik-fabrika-480p.mp4',
  poster: '/video/ozteknik-fabrika-poster-1920.webp',
  posterSet: '/video/ozteknik-fabrika-poster-960.webp 960w, /video/ozteknik-fabrika-poster-1920.webp 1920w',
};

export default function HeroVideo({
  alt,
  pause,
  play,
  src = FACTORY,
}: {
  alt: string;
  pause: string;
  play: string;
  /** varsayılan: fabrika filmi. Başka video için 720p (hi), 480p (lo) ve poster */
  src?: { hi: string; lo: string; poster: string; posterSet: string };
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<'poster' | 'playing' | 'paused'>('poster');

  useEffect(() => {
    const v = ref.current!;
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || nav.connection?.saveData) return;
    const start = () => {
      v.src = window.matchMedia('(max-width: 900px)').matches ? src.lo : src.hi;
      v.play()
        .then(() => setState('playing'))
        .catch(() => setState('paused'));
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    // ekran dışındayken durdur (pil ve CPU)
    const io = new IntersectionObserver(([en]) => {
      if (!v.src) return;
      if (en.isIntersecting && v.dataset.user !== 'paused') void v.play().catch(() => {});
      else if (!en.isIntersecting) v.pause();
    });
    io.observe(v);
    // sekme arka plandayken oynatma reddedilirse, görünür olunca yeniden dene
    const onVis = () => {
      if (document.hidden || !v.src || v.dataset.user === 'paused' || !v.paused) return;
      void v.play().then(() => setState('playing')).catch(() => {});
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      window.removeEventListener('load', start);
      document.removeEventListener('visibilitychange', onVis);
      io.disconnect();
    };
  }, [src.hi, src.lo]);

  const toggle = () => {
    const v = ref.current!;
    if (state === 'playing') {
      v.pause();
      v.dataset.user = 'paused';
      setState('paused');
    } else {
      if (!v.src) v.src = src.hi;
      delete v.dataset.user;
      void v.play().then(() => setState('playing'));
    }
  };

  return (
    <div className="hero-media" data-state={state}>
      <img
        className="hero-media-poster"
        src={src.poster}
        srcSet={src.posterSet}
        sizes="100vw"
        alt={alt}
        width={1920}
        height={1080}
        fetchPriority="high"
      />
      <video ref={ref} className="hero-media-video" muted loop playsInline preload="none" aria-hidden tabIndex={-1} />
      <button type="button" className="hero-media-toggle" onClick={toggle} aria-label={state === 'playing' ? pause : play} title={state === 'playing' ? pause : play}>
        <Icon name={state === 'playing' ? 'pause' : 'play'} size={16} />
      </button>
    </div>
  );
}
