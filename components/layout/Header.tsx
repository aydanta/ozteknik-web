'use client';
import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import SearchPalette from '@/components/search/SearchPalette';
import { useQuote, hydrateQuote } from '@/components/quote/store';
import { LOCALES, LOCALE_META, type Locale } from '@/lib/i18n';

export interface NavCat {
  key: string;
  name: string;
  href: string;
  count: number;
  drawing: string | null;
}
export interface NavBrand {
  key: string;
  name: string;
  line: string;
  href: string;
  cats: NavCat[];
}
export interface HeaderProps {
  lang: Locale;
  brands: NavBrand[];
  catalogueHref: string;
  quoteHref: string;
  searchHref: string;
  groups: { key: string; label: string; links: { href: string; label: string; hint?: string }[] }[];
  t: {
    catalogue: string;
    allProducts: string;
    menu: string;
    close: string;
    language: string;
    quoteList: string;
    searchPlaceholder: string;
    skip: string;
    products: string;
    palette: Record<string, string>;
  };
}

export default function Header(p: HeaderProps) {
  const [open, setOpen] = useState<string | null>(null);
  const [brand, setBrand] = useState(p.brands[0]?.key);
  const [preview, setPreview] = useState<NavCat | null>(null);
  const [mobile, setMobile] = useState(false);
  const [lang, setLang] = useState(false);
  const [palette, setPalette] = useState(false);
  const [compact, setCompact] = useState(false);
  const [alts, setAlts] = useState<Record<string, string>>({});
  const count = useQuote((s) => s.items.length);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    hydrateQuote();
    const onScroll = () => setCompact(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !/input|textarea|select/i.test((e.target as HTMLElement)?.tagName))) {
        e.preventDefault();
        setPalette(true);
      }
      if (e.key === 'Escape') {
        setOpen(null);
        setLang(false);
      }
    };
    const onOpen = () => setPalette(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('oz:search', onOpen);
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(null);
        setLang(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('oz:search', onOpen);
      document.removeEventListener('mousedown', onDoc);
    };
  }, []);

  // Dil seçici: sayfanın kendi hreflang bağlantılarını kullanır (her dilde karşılık gelen adres)
  const readAlternates = () => {
    const out: Record<string, string> = {};
    document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]').forEach((l) => {
      const h = l.getAttribute('hreflang');
      if (h && h !== 'x-default') out[h] = new URL(l.href).pathname;
    });
    setAlts(out);
  };

  const current = p.brands.find((b) => b.key === brand) ?? p.brands[0];
  const shown = preview ?? current?.cats.find((c) => c.drawing) ?? null;

  return (
    <header ref={ref} className="site-header" data-compact={compact} data-open={open || lang ? 'true' : undefined}>
      <div className="wrap">
        <a className="logo" href={`/${p.lang}/`} aria-label="Özteknik">
          <img className="logo-dark" src="/brand/ozteknik-logo.svg" alt="Özteknik" width={205} height={21} />
          {/* ana sayfada video üstündeyken (html[data-hero=over]) beyaz logo */}
          <img className="logo-light" src="/brand/ozteknik-logo-white.svg" alt="" width={205} height={21} aria-hidden />
        </a>

        <nav className="main-nav" aria-label="Main">
          <ul>
            <li>
              <button type="button" className="nav-link" aria-expanded={open === 'catalogue'} onClick={() => setOpen(open === 'catalogue' ? null : 'catalogue')}>
                {p.t.catalogue}
                <Icon name="chevron" size={14} />
              </button>
            </li>
            {p.groups.map((g) => (
              <li key={g.key}>
                <button type="button" className="nav-link" aria-expanded={open === g.key} onClick={() => setOpen(open === g.key ? null : g.key)}>
                  {g.label}
                  <Icon name="chevron" size={14} />
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-tools">
          <button type="button" className="search-trigger" onClick={() => setPalette(true)} aria-label={p.t.searchPlaceholder}>
            <Icon name="search" size={16} />
            <span className="search-label">{p.t.searchPlaceholder}</span>
            <kbd>⌘K</kbd>
          </button>
          <a className="icon-btn" href={p.quoteHref} aria-label={`${p.t.quoteList} (${count})`}>
            <Icon name="clipboard" />
            {count > 0 && <span className="count-dot">{count}</span>}
          </a>
          <div className="lang-menu">
            <button
              type="button"
              className="icon-btn lang-btn"
              aria-expanded={lang}
              aria-label={p.t.language}
              onClick={() => {
                readAlternates();
                setLang(!lang);
              }}
            >
              <Icon name="globe" size={16} />
              {p.lang}
            </button>
            {lang && (
              <div className="popover" role="menu">
                {LOCALES.map((l) => {
                  const href = alts[LOCALE_META[l].bcp47];
                  if (!href && l !== p.lang && Object.keys(alts).length) return null; // çevirisi olmayan dil gizlenir
                  return (
                    <a key={l} role="menuitem" href={href ?? `/${l}/`} hrefLang={l} lang={l} aria-current={l === p.lang}>
                      {LOCALE_META[l].native}
                      <small>{l}</small>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          <button type="button" className="icon-btn menu-toggle" aria-label={p.t.menu} aria-expanded={mobile} onClick={() => setMobile(true)}>
            <Icon name="menu" />
          </button>
        </div>
      </div>

      {open === 'catalogue' && current && (
        <div className="mega">
          <div className="wrap mega-inner">
            <div className="mega-brands" role="tablist" aria-orientation="vertical">
              {p.brands.map((b) => (
                <button
                  key={b.key}
                  type="button"
                  role="tab"
                  className="mega-brand"
                  aria-selected={b.key === current.key}
                  onMouseEnter={() => {
                    setBrand(b.key);
                    setPreview(null);
                  }}
                  onFocus={() => setBrand(b.key)}
                  onClick={() => setBrand(b.key)}
                >
                  <strong>{b.name}</strong>
                  <span>{b.line}</span>
                </button>
              ))}
              <a className="link" href={p.catalogueHref} style={{ padding: '12px 14px' }}>
                {p.t.allProducts} <Icon name="arrow" size={16} />
              </a>
            </div>
            <ul className="mega-cats" role="tabpanel">
              {current.cats.map((c) => (
                <li key={c.key}>
                  <a href={c.href} onMouseEnter={() => setPreview(c)} onFocus={() => setPreview(c)}>
                    {c.name}
                    <span>{c.count}</span>
                  </a>
                </li>
              ))}
              <li>
                <a href={current.href} className="link">
                  {current.name} <Icon name="arrow" size={16} />
                </a>
              </li>
            </ul>
            <div className="mega-preview" aria-hidden>
              {shown?.drawing ? <img className="drawing" src={shown.drawing} alt="" loading="lazy" /> : <div style={{ height: 180 }} />}
              <p>
                <b>{shown?.name}</b>
                {shown ? ` · ${shown.count} ${p.t.products}` : ''}
              </p>
            </div>
          </div>
        </div>
      )}
      {p.groups.map(
        (g) =>
          open === g.key && (
            <div className="mega" key={g.key}>
              <div className="wrap mega-simple">
                {g.links.map((l) => (
                  <a key={l.href} href={l.href}>
                    <strong>{l.label}</strong>
                    {l.hint && <span>{l.hint}</span>}
                  </a>
                ))}
              </div>
            </div>
          ),
      )}

      {mobile && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label={p.t.menu}>
          <header>
            <img src="/brand/ozteknik-logo.svg" alt="Özteknik" width={164} height={17} />
            <button type="button" className="icon-btn" onClick={() => setMobile(false)} aria-label={p.t.close}>
              <Icon name="close" />
            </button>
          </header>
          <button type="button" className="search-trigger" style={{ width: '100%', marginTop: 8 }} onClick={() => { setMobile(false); setPalette(true); }}>
            <Icon name="search" size={16} />
            <span>{p.t.searchPlaceholder}</span>
          </button>
          <nav>
            {p.brands.map((b) => (
              <section key={b.key}>
                <h2>{b.name}</h2>
                <ul>
                  {b.cats.map((c) => (
                    <li key={c.key}>
                      <a href={c.href}>{c.name}</a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {p.groups.map((g) => (
              <section key={g.key}>
                <h2>{g.label}</h2>
                <ul>
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href}>{l.label}</a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>
      )}

      {palette && <SearchPalette lang={p.lang} onClose={() => setPalette(false)} t={p.t.palette} searchHref={p.searchHref} />}
    </header>
  );
}
