'use client';
import { useEffect, useRef, useState } from 'react';

export interface SliceLabel {
  key: string;
  text: string;
  x: number; // görsel genişliğinin %'si
  y: number; // görsel yüksekliğinin %'si
}

/**
 * Parça görselini dilimlere bölüp scroll ile birleştirir, ardından kesite geçer.
 *  0.00–0.45  dış görünüm dilimleri derinlikten gelip birleşir
 *  0.50–0.85  kesit çizgisi soldan sağa ilerler, iç yapı açılır
 *  0.80–1.00  piston, conta, valf etiketleri
 * Hareketi azalt → birleşik dış görünüm + kesit + etiketler statik.
 */
export default function SliceReveal({
  outside,
  inside,
  ratio,
  labels,
  slices = 14,
  altOutside,
  altInside,
}: {
  outside: string;
  inside: string;
  ratio: number; // en/boy
  labels: SliceLabel[];
  slices?: number;
  altOutside: string;
  altInside: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(1);
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setMotion(true);
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = root.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setP(Math.min(1, Math.max(0, -r.top / Math.max(1, total))));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const k = (a: number, b: number) => {
    const t = Math.min(1, Math.max(0, (p - a) / (b - a)));
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };
  const assemble = motion ? k(0, 0.45) : 1;
  const cut = motion ? k(0.5, 0.85) : 1;
  const lab = motion ? k(0.8, 0.95) : 1;
  // deterministik "dağınıklık" (sunucu ve istemci aynı)
  const scatter = (i: number) => {
    const s = Math.sin(i * 12.9898) * 43758.5453;
    return s - Math.floor(s);
  };

  return (
    <div ref={root} className={`slice ${motion ? 'slice--motion' : 'slice--static'}`}>
      <div className="slice-sticky">
        <figure className="slice-figure" style={{ aspectRatio: String(ratio) }}>
          <div className="slice-strips" aria-hidden={motion}>
            {Array.from({ length: slices }, (_, i) => {
              const r = scatter(i + 1);
              const r2 = scatter(i + 7);
              const inv = 1 - assemble;
              return (
                <span
                  key={i}
                  style={{
                    backgroundImage: `url(${outside})`,
                    backgroundSize: `${slices * 100}% 100%`,
                    backgroundPosition: `${(i / (slices - 1)) * 100}% 0`,
                    transform: `translate3d(0, ${(r - 0.5) * 70 * inv}%, ${(r2 - 0.5) * 420 * inv}px) rotateY(${(r - 0.5) * 50 * inv}deg)`,
                    opacity: 0.25 + 0.75 * assemble,
                  }}
                />
              );
            })}
          </div>
          {/* SEO + erişilebilirlik: gerçek img etiketleri */}
          <img className="slice-base" src={outside} alt={altOutside} loading="lazy" style={{ opacity: assemble >= 1 ? 1 : 0 }} />
          <img className="slice-inside" src={inside} alt={altInside} loading="lazy" style={{ clipPath: `inset(0 ${100 - cut * 100}% 0 0)` }} />
          {cut > 0 && cut < 1 && <i className="slice-scan" style={{ insetInlineStart: `${cut * 100}%` }} aria-hidden />}
          <div className="slice-labels" style={{ opacity: lab }}>
            {labels.map((l) => (
              <span key={l.key} className="slice-label" style={{ left: `${l.x}%`, top: `${l.y}%` }}>
                <i />
                <b>{l.text}</b>
              </span>
            ))}
          </div>
        </figure>
      </div>
    </div>
  );
}
