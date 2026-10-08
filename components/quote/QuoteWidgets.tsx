'use client';
import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import { useQuote, hydrateQuote } from './store';

/** Ekranda sabit teklif listesi çubuğu — boşken görünmez */
export function QuoteBar({ href, label, review, itemsLabel }: { href: string; label: string; review: string; itemsLabel: string }) {
  const items = useQuote((s) => s.items);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    hydrateQuote();
    setReady(true);
  }, []);
  if (!ready || !items.length || (typeof window !== 'undefined' && window.location.pathname === href)) return null;
  const total = items.reduce((n, i) => n + i.qty, 0);
  return (
    <aside className="quote-bar no-print" aria-label={label}>
      <Icon name="clipboard" />
      <strong>
        {label} · {itemsLabel.replace('{n}', String(items.length))}
        <span className="muted small"> ({total})</span>
      </strong>
      <a className="btn btn--primary btn--sm" href={href}>
        {review} <Icon name="arrow" size={16} />
      </a>
    </aside>
  );
}

/** "Teklif listesine ekle" — adet seçimli; eklendi durumu */
export function AddToQuote({
  slug,
  code,
  t,
  withQty = false,
  size = 'md',
}: {
  slug: string;
  code: string;
  t: { add: string; added: string; qty: string };
  withQty?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const add = useQuote((s) => s.add);
  const inList = useQuote((s) => s.items.some((i) => i.code === code));
  const [qty, setQty] = useState(1);
  const [flash, setFlash] = useState(false);
  useEffect(() => hydrateQuote(), []);
  const cls = `btn ${inList ? '' : 'btn--primary'} ${size === 'sm' ? 'btn--sm' : size === 'lg' ? 'btn--lg' : ''}`;
  return (
    <div className="row" style={{ gap: 8 }}>
      {withQty && (
        <label className="qty">
          <span className="sr-only">{t.qty}</span>
          <input className="input mono" type="number" min={1} max={99999} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} style={{ width: 92 }} />
        </label>
      )}
      <button
        type="button"
        className={cls}
        aria-live="polite"
        onClick={() => {
          add({ slug, code, qty });
          setFlash(true);
          setTimeout(() => setFlash(false), 1600);
        }}
      >
        <Icon name={inList || flash ? 'check' : 'plus'} size={16} />
        {inList || flash ? t.added : t.add}
      </button>
    </div>
  );
}

/** Tek tıkla kopyala (kod ve OE numaraları) */
export function CopyButton({ value, label, copied }: { value: string; label: string; copied: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="copy-btn"
      data-copied={ok}
      aria-label={ok ? copied : `${label} ${value}`}
      title={ok ? copied : label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setOk(true);
          setTimeout(() => setOk(false), 1400);
        } catch {}
      }}
    >
      <Icon name={ok ? 'check' : 'copy'} size={14} />
    </button>
  );
}
