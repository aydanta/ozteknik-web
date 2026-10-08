import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import { href, type Locale } from '@/lib/i18n';
import { baseMeta } from '@/lib/seo';
import { company } from '@/lib/site';
import { getDict } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  return baseMeta({ lang, title: getDict(lang).footer.imageLicense, description: '© Özteknik A.Ş. — product images', path: (l) => href(l, 'imageLicense') });
}
/** ImageObject.license hedefi (şartname Ek E). Lisans koşulları firma kararı — burada yalnız telif ve izin yolu. */
export default async function ImageLicense({ params }: P) {
  const { lang } = await params;
  const t = getDict(lang);
  const c = company();
  return (
    <>
      <PageHero eyebrow={t.footer.legal} title={t.footer.imageLicense} crumbs={[{ name: t.common.home, href: `/${lang}/` }, { name: t.footer.imageLicense }]} />
      <section className="wrap-narrow section-sm prose" lang="en">
        <p>All product photographs, technical drawings and 3D renderings on this website are © Özteknik A.Ş. (EGEROT, HYDCAB, REVOL).</p>
        <p>
          Distributors and media who want to use these images should request permission at <a href={`mailto:${c.email}`}>{c.email}</a> or via the <a href={href(lang, 'contact')}>contact page</a>.
        </p>
        <p className="note">{t.legal.pending}</p>
      </section>
    </>
  );
}
