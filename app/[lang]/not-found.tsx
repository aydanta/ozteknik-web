import NotFoundClient from '@/components/NotFoundClient';
import { LOCALES, href, type Locale } from '@/lib/i18n';
import { getDict } from '@/content/i18n';
import { searchProps } from '@/lib/site';

export default function NotFound() {
  const texts = Object.fromEntries(
    LOCALES.map((l: Locale) => {
      const t = getDict(l).notFound;
      return [l, { title: t.title, lead: t.lead, home: t.home, search: searchProps(l), action: href(l, 'search') }];
    }),
  ) as Parameters<typeof NotFoundClient>[0]['texts'];
  return <NotFoundClient texts={texts} />;
}
