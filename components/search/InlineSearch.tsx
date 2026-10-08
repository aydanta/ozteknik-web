'use client';
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { productHref } from '@/lib/links';
import type { Locale } from '@/lib/i18n';
import type { ApiHit } from './SearchPalette';

/**
 * Sayfa içi arama kutusu (ana sayfa, 404, arama sayfası). JS yoksa form GET ile arama sayfasına gider;
 * JS varsa yazarken öneri listesi (300 ms hedefi). Eşleşme yoksa "bize gönderin" bağlantısı.
 */
export default function InlineSearch({
  lang,
  action,
  t,
  defaultValue = '',
  autoFocus = false,
  size = 'lg',
}: {
  lang: Locale;
  action: string;
  t: { label: string; placeholder: string; button: string; noResults: string; sendNumber: string; notFoundHref: string; matchOe: string; matchCross: string };
  defaultValue?: string;
  autoFocus?: boolean;
  size?: 'md' | 'lg';
}) {
  const [q, setQ] = useState(defaultValue);
  const [hits, setHits] = useState<ApiHit[] | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.replace(/[^a-z0-9]/gi, '').length < 3) {
      setHits(null);
      return;
    }
    const ctrl = new AbortController();
    const id = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search/?q=${encodeURIComponent(term)}&lang=${lang}&limit=6`, { signal: ctrl.signal });
        const j = await r.json();
        setHits(j.hits);
        setActive(-1);
        setOpen(true);
      } catch {}
    }, 110);
    return () => {
      clearTimeout(id);
      ctrl.abort();
    };
  }, [q, lang]);

  useEffect(() => {
    const close = (e: MouseEvent) => box.current && !box.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <form
      ref={box}
      className={`inline-search inline-search--${size}`}
      action={action}
      method="get"
      role="search"
      onSubmit={(e) => {
        if (hits && active >= 0 && hits[active]) {
          e.preventDefault();
          window.location.href = productHref(lang, hits[active].slug);
        }
      }}
    >
      <label className="sr-only" htmlFor={`is-${size}`}>
        {t.label}
      </label>
      <Icon name="search" size={20} />
      <input
        id={`is-${size}`}
        name="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => hits && setOpen(true)}
        onKeyDown={(e) => {
          if (!hits?.length) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, hits.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, -1));
          } else if (e.key === 'Escape') setOpen(false);
        }}
        placeholder={t.placeholder}
        autoComplete="off"
        spellCheck={false}
        autoFocus={autoFocus}
        role="combobox"
        aria-expanded={open && !!hits}
        aria-controls={`is-list-${size}`}
        aria-autocomplete="list"
      />
      <button className="btn btn--primary" type="submit">
        {t.button}
      </button>
      {open && hits && (
        <div className="inline-results" id={`is-list-${size}`} role="listbox">
          {hits.length ? (
            hits.map((h, i) => (
              <a key={h.slug} role="option" aria-selected={i === active} href={productHref(lang, h.slug)} onMouseEnter={() => setActive(i)}>
                <span className="mono">{h.code}</span>
                <span className="muted">{h.categoryName}</span>
                <span className="mono small muted">{h.match.kind === 'code' ? (h.firstOe ? `OE ${h.firstOe}` : '') : `${h.match.kind === 'oe' ? t.matchOe : t.matchCross} ${h.match.display}`}</span>
              </a>
            ))
          ) : (
            <div className="inline-empty">
              <span>{t.noResults.replace('{q}', q.trim())}</span>
              <a className="link" href={`${t.notFoundHref}?number=${encodeURIComponent(q.trim())}`}>
                {t.sendNumber} →
              </a>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
