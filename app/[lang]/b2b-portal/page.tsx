import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import Icon from '@/components/Icon';
import { href, type Locale } from '@/lib/i18n';
import { baseMeta } from '@/lib/seo';
import { getDict } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return baseMeta({ lang, title: t.b2b.title, description: t.b2b.lead, path: (l) => href(l, 'b2b'), noindex: true });
}
/** Faz 3: bayiye özel fiyat, stok, sipariş geçmişi. Şimdilik giriş ekranı + bilgilendirme. */
export default async function B2B({ params }: P) {
  const { lang } = await params;
  const t = getDict(lang);
  return (
    <>
      <PageHero photo="cad" title={t.b2b.title} lead={t.b2b.lead} crumbs={[{ name: t.common.home, href: `/${lang}/` }, { name: t.b2b.title }]} />
      <section className="wrap-narrow section-sm">
        <div className="card stack" style={{ maxWidth: 440 }}>
          <Icon name="lock" size={28} />
          <h2 className="h2">{t.b2b.login}</h2>
          <input className="input" type="email" placeholder={t.forms.email} disabled aria-label={t.forms.email} />
          <button className="btn btn--primary" disabled>
            {t.b2b.login}
          </button>
          <p className="small muted">{t.b2b.soon}</p>
          <a className="link" href={href(lang, 'contact')}>
            {t.nav.contact} →
          </a>
        </div>
      </section>
    </>
  );
}
