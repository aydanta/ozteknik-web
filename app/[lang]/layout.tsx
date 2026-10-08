import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { Archivo, Inter, JetBrains_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/site.css';
import '../styles/pages.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { QuoteBar } from '@/components/quote/QuoteWidgets';
import { CookieConsent, LangSuggest, RevealObserver } from '@/components/layout/ClientChrome';
import Intro, { introScript } from '@/components/layout/Intro';
import { LOCALES, LOCALE_META, href, isLocale, type Locale } from '@/lib/i18n';
import { headerProps } from '@/lib/site';
import { getDict } from '@/content/i18n';
import { SITE_URL } from '@/lib/seo';

const archivo = Archivo({ subsets: ['latin', 'latin-ext'], axes: ['wdth'], variable: '--f-archivo', display: 'swap' });
const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--f-inter', display: 'swap' });
// Kiril yalnız Rusça sayfada kullanılır: önyüklenmez, unicode-range ile gerektiğinde iner
const interCyr = Inter({ subsets: ['cyrillic'], variable: '--f-inter-cyr', display: 'swap', preload: false });
const mono = JetBrains_Mono({ subsets: ['latin', 'cyrillic'], variable: '--f-mono', display: 'swap', preload: false });
const arabic = IBM_Plex_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600', '700'], variable: '--f-arabic', display: 'swap', preload: false });

// dynamicParams burada false OLMAMALI: alt rotalara (ürün, OE — ISR) miras kalır ve hepsini 404 yapar.
// Geçersiz dil kodu aşağıda isLocale ile 404 döner.
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang as Locale);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.homeTitle, template: '%s | Özteknik' },
    description: t.meta.homeDescription,
    applicationName: 'Özteknik',
    icons: { icon: '/brand/ozteknik-favicon.png' },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: '#F3F5F6',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
};


export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLocale(raw)) notFound();
  const lang = raw as Locale;
  const t = getDict(lang);
  const meta = LOCALE_META[lang];
  const hp = headerProps(lang);
  const suggest = Object.fromEntries(LOCALES.map((l) => [l, getDict(l).langSuggest])) as Record<Locale, { text: string; switch: string; dismiss: string }>;

  return (
    <html lang={meta.bcp47} dir={meta.dir} className={`${archivo.variable} ${inter.variable} ${interCyr.variable} ${mono.variable} ${arabic.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <link rel="alternate" type="application/json" href="/feeds/catalog.json" title="Özteknik catalogue feed" />
      </head>
      <body>
        <Intro />
        <a className="skip-link" href="#main">
          {t.common.skip}
        </a>
        <LangSuggest lang={lang} texts={suggest} />
        <Header {...hp} />
        <main id="main">{children}</main>
        <Footer lang={lang} />
        <QuoteBar href={href(lang, 'quote')} label={t.quote.bar} review={t.quote.review} itemsLabel={t.quote.items} />
        <CookieConsent t={t.cookie} policyHref={href(lang, 'cookies')} gaId={process.env.NEXT_PUBLIC_GA_ID} />
        <RevealObserver />
      </body>
    </html>
  );
}
