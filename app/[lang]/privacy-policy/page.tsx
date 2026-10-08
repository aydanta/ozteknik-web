import type { Locale } from '@/lib/i18n';
import { legalMeta, LegalPage } from '@/lib/legal';
import { getDict } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }> };
export async function generateMetadata({ params }: P) {
  const { lang } = await params;
  return legalMeta(lang, 'privacy', getDict(lang).footer.privacy);
}
export default async function Page({ params }: P) {
  const { lang } = await params;
  return <LegalPage lang={lang} name="privacy" title={getDict(lang).footer.privacy} />;
}
