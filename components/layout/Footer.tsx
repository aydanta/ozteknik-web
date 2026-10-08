import Icon from '@/components/Icon';
import { href, type Locale } from '@/lib/i18n';
import { BRANDS, BRAND_KEYS, CATEGORIES, countsByCategory } from '@/lib/catalog';
import { brandHref, categoryHref } from '@/lib/links';
import { company, telHref } from '@/lib/site';
import { getDict, fmt } from '@/content/i18n';
import { CookieSettingsButton } from './ClientChrome';

const SOCIAL: [string, string][] = [
  ['linkedin', 'LinkedIn'],
  ['youtube', 'YouTube'],
  ['instagram', 'Instagram'],
  ['facebook', 'Facebook'],
  ['x', 'X'],
];

/** Alt bilgi: kurumsal ve yasal bağlantılar, NAP (sitede, şemada ve profillerde harfi harfine aynı), hizmet menüsü */
export default function Footer({ lang }: { lang: Locale }) {
  const t = getDict(lang);
  const c = company();
  const counts = countsByCategory();
  const top = CATEGORIES.filter((x) => counts[x.key]).sort((a, b) => (counts[b.key] ?? 0) - (counts[a.key] ?? 0)).slice(0, 7);
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="stack" style={{ gap: 18 }}>
            <img src="/brand/ozteknik-logo.svg" alt="Özteknik" width={164} height={17} className="logo-footer" />
            <p className="muted" style={{ maxWidth: 360 }}>
              {t.footer.tagline}
            </p>
            <address className="footer-nap">
              <span>{c.legalName}</span>
              <span>
                {c.address}, {c.postalCode} {c.city} / {c.region}, Türkiye
              </span>
              <a href={telHref(c.phone)}>{c.phone}</a>
              <a href={`mailto:${c.email}`}>{c.email}</a>
            </address>
            <div className="social">
              {SOCIAL.map(([k, label], i) =>
                c.sameAs?.find((u) => u.includes(k === 'x' ? 'twitter' : k)) ? (
                  <a key={k} className="icon-btn" href={c.sameAs.find((u) => u.includes(k === 'x' ? 'twitter' : k))} rel="noopener me" target="_blank" aria-label={label}>
                    <Icon name={k} size={16} />
                  </a>
                ) : (
                  <span key={i} hidden />
                ),
              )}
            </div>
          </div>
          <nav aria-label={t.nav.brands}>
            <h2>{t.nav.brands}</h2>
            <ul>
              {BRAND_KEYS.map((b) => (
                <li key={b}>
                  <a href={brandHref(lang, b)}>
                    {BRANDS[b].name} — {BRANDS[b].line[lang]}
                  </a>
                </li>
              ))}
              <li>
                <a href={href(lang, 'catalog')}>{t.nav.allProducts}</a>
              </li>
            </ul>
          </nav>
          <nav aria-label={t.catalogue.groups}>
            <h2>{t.catalogue.groups}</h2>
            <ul>
              {top.map((x) => (
                <li key={x.key}>
                  <a href={categoryHref(lang, x.key)}>{x.many[lang]}</a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={t.nav.sales}>
            <h2>{t.nav.sales}</h2>
            <ul>
              <li><a href={href(lang, 'search')}>{t.nav.multiSearch}</a></li>
              <li><a href={href(lang, 'quote')}>{t.nav.quoteList}</a></li>
              <li><a href={href(lang, 'distributors')}>{t.nav.distributors}</a></li>
              <li><a href={href(lang, 'sample')}>{t.nav.sample}</a></li>
              <li><a href={href(lang, 'dealers')}>{t.nav.dealers}</a></li>
              <li><a href={href(lang, 'b2b')}>{t.nav.b2b}</a></li>
            </ul>
          </nav>
          <nav aria-label={t.nav.company}>
            <h2>{t.nav.company}</h2>
            <ul>
              <li><a href={href(lang, 'about')}>{t.nav.about}</a></li>
              <li><a href={href(lang, 'production')}>{t.nav.production}</a></li>
              <li><a href={href(lang, 'quality')}>{t.nav.quality}</a></li>
              <li><a href={href(lang, 'sustainability')}>{t.nav.sustainability}</a></li>
              <li><a href={href(lang, 'media')}>{t.nav.media}</a></li>
              <li><a href={href(lang, 'careers')}>{t.nav.careers}</a></li>
              <li><a href={href(lang, 'contact')}>{t.nav.contact}</a></li>
            </ul>
          </nav>
        </div>
        <p className="small muted" style={{ marginTop: 40 }}>
          {t.footer.oeNote}
        </p>
        <div className="footer-bottom">
          <span>{fmt(t.footer.rights, { year: new Date().getFullYear() })}</span>
          <nav aria-label={t.footer.legal}>
            <a href={href(lang, 'privacy')}>{t.footer.privacy}</a>
            <a href={href(lang, 'cookies')}>{t.footer.cookies}</a>
            <a href={href(lang, 'imprint')}>{t.footer.imprint}</a>
            <a href={href(lang, 'accessibility')}>{t.footer.accessibility}</a>
            <a href={href(lang, 'imageLicense')}>{t.footer.imageLicense}</a>
            <a href="/feeds/catalog.json">{t.footer.feed}</a>
            <CookieSettingsButton label={t.footer.cookieSettings} />
          </nav>
        </div>
      </div>
    </footer>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="wrap">
      <ol className="crumbs">
        {items.map((it, i) =>
          it.href && i < items.length - 1 ? (
            <li key={i}>
              <a href={it.href}>{it.name}</a>
            </li>
          ) : (
            <li key={i} aria-current="page">
              {it.name}
            </li>
          ),
        )}
      </ol>
    </nav>
  );
}
