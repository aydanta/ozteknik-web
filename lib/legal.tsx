import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import LegalText from '@/components/LegalText';
import { href, type Locale, type PageKey } from '@/lib/i18n';
import { baseMeta } from '@/lib/seo';
import { getDict } from '@/content/i18n';

/** Gizlilik ve çerez sayfaları: metin EN ve TR'de; diğer dillerde EN metin + not, noindex */
export function legalMeta(lang: Locale, key: PageKey, title: string): Metadata {
  return baseMeta({ lang, title, description: title, path: (l) => href(l, key), noindex: lang !== 'en' && lang !== 'tr' });
}
export function LegalPage({ lang, name, title }: { lang: Locale; name: 'privacy' | 'cookies'; title: string }) {
  const t = getDict(lang);
  const src = lang === 'tr' ? 'tr' : 'en';
  return (
    <>
      <PageHero eyebrow={t.footer.legal} title={title} crumbs={[{ name: t.common.home, href: `/${lang}/` }, { name: title }]} />
      <section className="wrap section-sm stack" style={{ gap: 20 }}>
        <p className="alert">{t.legal.pending}</p>
        {lang !== 'en' && lang !== 'tr' && <p className="note">{t.legal.englishOnly}</p>}
        <div lang={src}>
          <LegalText name={name} lang={src} />
        </div>
      </section>
    </>
  );
}
