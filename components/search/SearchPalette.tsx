'use client';
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { productHref, drawingFor } from '@/lib/links';
import type { Locale } from '@/lib/i18n';

export interface ApiHit {
  slug: string;
  code: string;
  brand: string;
  category: string;
  categoryName: string;
  image: string | null;
  firstOe: string | null;
  match: { kind: 'code' | 'oe' | 'cross'; display: string; make: string | null; exact: boolean; distance: number };
}

/** Global arama (komut paleti): kod, OE ve rakip numarası; görselli öneri listesi. Durumlar: boş, yükleniyor, sonuç yok. */
export default function SearchPalette({ lang, onClose, t, searchHref }: { lang: Locale; onClose: () => void; t: Record<string, string>; searchHref: string }) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<ApiHit[]>([]);
  const [mode, setMode] = useState<'idle' | 'loading' | 'done'>('idle');
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => {
    input.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.replace(/[^a-z0-9]/gi, '').length < 3) {
      setHits([]);
      setMode('idle');
      return;
    }
    setMode('loading');
    const id = setTimeout(async () => {
      ctrl.current?.abort();
      ctrl.current = new AbortController();
      try {
        const r = await fetch(`/api/search/?q=${encodeURIComponent(term)}&lang=${lang}`, { signal: ctrl.current.signal });
        const j = await r.json();
        setHits(j.hits ?? []);
        setActive(0);
        setMode('done');
      } catch {}
    }, 120);
    return () => clearTimeout(id);
  }, [q, lang]);

  const go = (h: ApiHit) => (window.location.href = productHref(lang, h.slug));
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, hits.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (hits[active]) go(hits[active]);
      else if (q.trim()) window.location.href = `${searchHref}?q=${encodeURIComponent(q.trim())}`;
    }
  };
  const kindLabel = (k: ApiHit['match']['kind']) => (k === 'code' ? t.matchCode : k === 'oe' ? t.matchOe : t.matchCross);

  return (
    <div className="palette-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="palette" role="dialog" aria-modal="true" aria-label={t.label}>
        <div className="palette-input">
          <Icon name="search" size={20} />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder={t.placeholder}
            aria-label={t.label}
            role="combobox"
            aria-expanded={hits.length > 0}
            aria-controls="palette-list"
            aria-activedescendant={hits[active] ? `hit-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
            inputMode="search"
          />
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t.close}>
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="palette-results" id="palette-list" role="listbox" aria-busy={mode === 'loading'}>
          {mode === 'idle' && (
            <p className="palette-meta">
              {t.examples}: <span className="mono">81432306000</span> · <span className="mono">A 001 250 97 01</span> · <span className="mono">3400 122 801</span> · <span className="mono">ER0107</span>
            </p>
          )}
          {mode === 'loading' && !hits.length && <p className="palette-meta">{t.loading}</p>}
          {mode === 'done' && !hits.length && (
            <div className="palette-meta stack">
              <p>{t.noResults.replace('{q}', q.trim())}</p>
              <a className="btn btn--primary btn--sm" href={`${t.notFoundHref}?number=${encodeURIComponent(q.trim())}`} style={{ justifySelf: 'start' }}>
                {t.sendNumber} <Icon name="arrow" size={16} />
              </a>
            </div>
          )}
          {hits.map((h, i) => (
            <a
              key={h.slug}
              id={`hit-${i}`}
              role="option"
              aria-selected={i === active}
              className="palette-hit"
              href={productHref(lang, h.slug)}
              onMouseEnter={() => setActive(i)}
            >
              {h.image ? (
                <img className="thumb" src={`${h.image}?w=200`} alt="" loading="lazy" width={64} height={48} />
              ) : (
                <img className="thumb thumb--drawing drawing" src={drawingFor(h.category) ?? ''} alt="" width={64} height={48} />
              )}
              <span>
                <strong>{h.code}</strong>
                <small>
                  {h.categoryName} · <span className={`badge badge--${h.brand}`}>{h.brand}</span>
                </small>
              </span>
              <small className="mono" style={{ textAlign: 'end' }}>
                {h.match.kind !== 'code' ? `${kindLabel(h.match.kind)} ${h.match.display}` : h.firstOe ? `OE ${h.firstOe}` : ''}
                {!h.match.exact && h.match.distance > 0 ? ` · ${t.similar}` : ''}
              </small>
            </a>
          ))}
        </div>
        <div className="palette-foot">
          <span>↑↓ · ↵ · esc</span>
          <a href={searchHref}>{t.multiLink}</a>
        </div>
      </div>
    </div>
  );
}
