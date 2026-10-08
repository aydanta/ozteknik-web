import InlineSearch from '@/components/search/InlineSearch';
import { href, isLocale, type Locale } from '@/lib/i18n';
import { getDict } from '@/content/i18n';
import { searchProps } from '@/lib/site';

/** 404: arama kutusu ile (şartname §Teknik kurallar — "404 sayfasında arama kutusu") */
export default function NotFoundView({ forceLang = 'en' }: { forceLang?: Locale }) {
  const lang: Locale = isLocale(forceLang) ? forceLang : 'en';
  const t = getDict(lang);
  return (
    <section className="section wrap-narrow">
      <div className="stack" style={{ gap: 24 }}>
        <p className="eyebrow">404</p>
        <h1 className="d3">{t.notFound.title}</h1>
        <p className="lead">{t.notFound.lead}</p>
        <InlineSearch lang={lang} action={href(lang, 'search')} t={searchProps(lang)} autoFocus />
        <a className="link" href={`/${lang}/`}>
          {t.notFound.home} →
        </a>
      </div>
    </section>
  );
}
