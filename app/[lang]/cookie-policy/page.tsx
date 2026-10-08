import type { Locale } from '@/lib/i18n';
import { legalMeta, LegalPage } from '@/lib/legal';
import { getDict } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }> };
export async function generateMetadata({ params }: P) {
  const { lang } = await params;
  return legalMeta(lang, 'cookies', getDict(lang).footer.cookies);
}
export default async function Page({ params }: P) {
  const { lang } = await params;
  return <LegalPage lang={lang} name="cookies" title={getDict(lang).footer.cookies} />;
}
