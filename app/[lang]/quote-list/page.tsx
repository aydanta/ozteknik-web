import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import QuoteList from '@/components/quote/QuoteList';
import { href, type Locale } from '@/lib/i18n';
import { baseMeta } from '@/lib/seo';
import { contactFields, formText } from '@/lib/forms';
import { getDict } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return baseMeta({ lang, title: t.quote.title, description: t.quote.lead, path: (l) => href(l, 'quote'), noindex: true });
}
export default async function QuotePage({ params }: P) {
  const { lang } = await params;
  const t = getDict(lang);
  return (
    <>
      <PageHero photo="packing" title={t.quote.title} lead={t.quote.lead} crumbs={[{ name: t.common.home, href: `/${lang}/` }, { name: t.quote.title }]} />
      <section className="wrap section-sm">
        <QuoteList
          lang={lang}
          catalogueHref={href(lang, 'catalog')}
          searchHref={href(lang, 'search')}
          fields={contactFields(lang)}
          formText={formText(lang)}
          t={{ ...t.quote, code: t.product.partNumber, product: t.catalogue.category, catalogue: t.nav.catalogue, multiSearch: t.nav.multiSearch }}
        />
      </section>
    </>
  );
}
