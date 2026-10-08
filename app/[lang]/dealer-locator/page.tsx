import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import Icon from '@/components/Icon';
import { href, type Locale } from '@/lib/i18n';
import { baseMeta } from '@/lib/seo';
import { db } from '@/lib/db';
import { telHref } from '@/lib/site';
import { getDict } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }>; searchParams: Promise<{ country?: string }> };
interface Dealer {
  id: number;
  name: string;
  country: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  whatsapp: string;
  brands: string;
}
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(lang);
  return baseMeta({ lang, title: t.dealers.title, description: t.dealers.lead, path: (l) => href(l, 'dealers') });
}
export default async function Dealers({ params, searchParams }: P) {
  const { lang } = await params;
  const { country } = await searchParams;
  const t = getDict(lang);
  // yalnızca listelenmeye izin veren bayiler (şartname)
  const all = db().prepare('select * from dealers where active = 1 and consent = 1 order by country, city, name').all() as unknown as Dealer[];
  const countries = [...new Set(all.map((d) => d.country))];
  const list = country ? all.filter((d) => d.country === country) : all;
  let dn: Intl.DisplayNames | null = null;
  try {
    dn = new Intl.DisplayNames([lang], { type: 'region' });
  } catch {}
  return (
    <>
      <PageHero photo="export" eyebrow={t.nav.sales} title={t.dealers.title} lead={t.dealers.lead} crumbs={[{ name: t.common.home, href: `/${lang}/` }, { name: t.dealers.title }]} />
      <section className="wrap section-sm stack" style={{ gap: 24 }}>
        {countries.length > 0 && (
          <form className="row" method="get">
            <label className="sr-only" htmlFor="d-country">
              {t.dealers.country}
            </label>
            <select id="d-country" className="select" name="country" defaultValue={country ?? ''} style={{ maxWidth: 320 }}>
              <option value="">{t.dealers.all}</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {dn?.of(c) ?? c}
                </option>
              ))}
            </select>
            <button className="btn" type="submit">
              {t.catalogue.apply}
            </button>
          </form>
        )}
        {list.length ? (
          <ul className="dealer-list">
            {list.map((d) => (
              <li key={d.id} className="card stack" style={{ gap: 8 }}>
                <span className="eyebrow">
                  {dn?.of(d.country) ?? d.country} · {d.city}
                </span>
                <h2 className="h3">{d.name}</h2>
                {d.address && <p className="muted small">{d.address}</p>}
                {d.brands && <p className="small mono">{d.brands}</p>}
                <div className="row">
                  {d.phone && (
                    <a className="btn btn--sm btn--primary" href={telHref(d.phone)}>
                      <Icon name="phone" size={14} /> {t.dealers.call}
                    </a>
                  )}
                  {d.website && (
                    <a className="btn btn--sm" href={d.website} rel="noopener" target="_blank">
                      {t.dealers.website}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty">
            <Icon name="pin" size={28} />
            <p>{t.dealers.empty}</p>
            <a className="btn btn--primary" href={href(lang, 'contact')}>
              {t.dealers.contactCta}
            </a>
          </div>
        )}
      </section>
    </>
  );
}
