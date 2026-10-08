'use client';
import { useEffect, useState } from 'react';
import { LOCALES, LOCALE_META, type Locale } from '@/lib/i18n';

/**
 * Çerez onayı (KVKK/GDPR): zorunlu olmayan hiçbir şey onaydan önce yüklenmez.
 * Analitik (GA4) yalnız "kabul" sonrası eklenir; seçim localStorage'da.
 */
export function CookieConsent({ t, policyHref, gaId }: { t: { title: string; text: string; accept: string; reject: string; more: string }; policyHref: string; gaId?: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let v: string | null = null;
    try {
      v = localStorage.getItem('oz-consent');
    } catch {}
    if (!v) setShow(true);
    if (v === 'analytics') loadGa(gaId);
    const reopen = () => setShow(true);
    window.addEventListener('oz:cookies', reopen);
    return () => window.removeEventListener('oz:cookies', reopen);
  }, [gaId]);
  const choose = (v: 'necessary' | 'analytics') => {
    try {
      localStorage.setItem('oz-consent', v);
    } catch {}
    setShow(false);
    if (v === 'analytics') loadGa(gaId);
  };
  if (!show) return null;
  return (
    <section className="cookie no-print" role="dialog" aria-labelledby="cookie-title" aria-live="polite">
      <h2 id="cookie-title">{t.title}</h2>
      <p>
        {t.text}{' '}
        <a href={policyHref} className="link">
          {t.more}
        </a>
      </p>
      <div className="row">
        <button type="button" className="btn btn--sm" onClick={() => choose('necessary')}>
          {t.reject}
        </button>
        <button type="button" className="btn btn--sm btn--primary" onClick={() => choose('analytics')}>
          {t.accept}
        </button>
      </div>
    </section>
  );
}

function loadGa(id?: string) {
  if (!id || (window as unknown as { __ga?: boolean }).__ga) return;
  (window as unknown as { __ga?: boolean }).__ga = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);
  const w = window as unknown as { dataLayer: unknown[]; gtag: (...a: unknown[]) => void };
  w.dataLayer = w.dataLayer || [];
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer.push(arguments);
  };
  w.gtag('js', new Date());
  w.gtag('config', id, { anonymize_ip: true });
}

/** Dönüşüm olayı (GA4 yüklüyse) — teklif, numune, başvuru, WhatsApp, katalog indirme */
export function track(event: string, params: Record<string, unknown> = {}) {
  const w = window as unknown as { gtag?: (...a: unknown[]) => void };
  w.gtag?.('event', event, params);
}

/** Tarayıcı diline göre ÖNERİ (otomatik yönlendirme yok — şartname) */
export function LangSuggest({ lang, texts }: { lang: Locale; texts: Record<Locale, { text: string; switch: string; dismiss: string }> }) {
  const [target, setTarget] = useState<{ l: Locale; href: string } | null>(null);
  useEffect(() => {
    try {
      if (sessionStorage.getItem('oz-lang-dismiss')) return;
    } catch {}
    const pref = (navigator.languages || [navigator.language]).map((x) => x.slice(0, 2).toLowerCase());
    const l = pref.find((p) => (LOCALES as readonly string[]).includes(p)) as Locale | undefined;
    if (!l || l === lang) return;
    const alt = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${LOCALE_META[l].bcp47}"]`);
    if (!alt) return;
    setTarget({ l, href: new URL(alt.href).pathname });
  }, [lang]);
  if (!target) return null;
  const t = texts[target.l];
  const dismiss = () => {
    try {
      sessionStorage.setItem('oz-lang-dismiss', '1');
    } catch {}
    setTarget(null);
  };
  return (
    <div className="lang-suggest" lang={target.l} dir={LOCALE_META[target.l].dir}>
      <div className="wrap">
        <span>{t.text.replace('{language}', LOCALE_META[target.l].native)}</span>
        <a href={target.href} hrefLang={target.l}>
          {t.switch} →
        </a>
        <button type="button" onClick={dismiss}>
          {t.dismiss}
        </button>
      </div>
    </div>
  );
}

/** Görünür olunca yumuşak giriş; hareketi azalt tercihinde CSS kapatır */
export function RevealObserver() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.is-in)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        }),
      { rootMargin: '0px 0px -8% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  });
  return null;
}

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button type="button" className="link" style={{ background: 'none', border: 0, padding: 0, color: 'var(--text-2)', fontWeight: 400 }} onClick={() => window.dispatchEvent(new Event('oz:cookies'))}>
      {label}
    </button>
  );
}
