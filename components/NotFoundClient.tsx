'use client';
import { usePathname } from 'next/navigation';
import InlineSearch from '@/components/search/InlineSearch';
import { isLocale, type Locale } from '@/lib/i18n';

type T = { title: string; lead: string; home: string; search: Parameters<typeof InlineSearch>[0]['t']; action: string };

/** [lang] altındaki 404 — dil adres çubuğundan okunur (headers() kullanmaz; sayfalar statik kalır) */
export default function NotFoundClient({ texts }: { texts: Record<Locale, T> }) {
  const seg = (usePathname() || '').split('/')[1];
  const lang: Locale = isLocale(seg) ? seg : 'en';
  const t = texts[lang];
  return (
    <section className="section wrap-narrow">
      <div className="stack" style={{ gap: 24 }}>
        <p className="eyebrow">404</p>
        <h1 className="d3">{t.title}</h1>
        <p className="lead">{t.lead}</p>
        <InlineSearch lang={lang} action={t.action} t={t.search} autoFocus />
        <a className="link" href={`/${lang}/`}>
          {t.home} →
        </a>
      </div>
    </section>
  );
}
