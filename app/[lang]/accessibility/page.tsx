import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import { href, type Locale } from '@/lib/i18n';
import { baseMeta } from '@/lib/seo';
import { company } from '@/lib/site';
import { getDict } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  return baseMeta({ lang, title: getDict(lang).footer.accessibility, description: 'WCAG 2.2 AA', path: (l) => href(l, 'accessibility') });
}
/** Erişilebilirlik beyanı — WCAG 2.2 AA hedefi ve geri bildirim adresi (şartname). Metin EN; dil sürümleri editör onayıyla. */
export default async function A11y({ params }: P) {
  const { lang } = await params;
  const t = getDict(lang);
  const c = company();
  return (
    <>
      <PageHero eyebrow={t.footer.legal} title={t.footer.accessibility} crumbs={[{ name: t.common.home, href: `/${lang}/` }, { name: t.footer.accessibility }]} />
      <section className="wrap-narrow section-sm prose" lang="en">
        <p>Özteknik aims to conform to the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA, in line with the European Accessibility Act for sites selling into the EU.</p>
        <h2>What we do</h2>
        <ul>
          <li>Full keyboard navigation with visible focus, and a skip link on every page.</li>
          <li>Text contrast of at least 4.5:1 in dark and light themes.</li>
          <li>Form errors are announced in text, not by colour alone.</li>
          <li>Animations and 3D scenes stop when “reduce motion” is enabled; all product data is available as text and tables.</li>
          <li>Correct right-to-left layout for Arabic.</li>
        </ul>
        <h2>Feedback</h2>
        <p>
          If you find a barrier, please write to <a href={`mailto:${c.email}`}>{c.email}</a>.
        </p>
        <p className="note">{t.legal.pending}</p>
      </section>
    </>
  );
}
