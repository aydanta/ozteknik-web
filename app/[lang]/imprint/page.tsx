import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import { href, type Locale } from '@/lib/i18n';
import { baseMeta } from '@/lib/seo';
import { company, telHref } from '@/lib/site';
import { getDict } from '@/content/i18n';

type P = { params: Promise<{ lang: Locale }> };
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { lang } = await params;
  return baseMeta({ lang, title: getDict(lang).footer.imprint, description: 'Özteknik A.Ş. — Impressum / imprint', path: (l) => href(l, 'imprint') });
}
/** Impressum (Almanca sürümde yasal zorunluluk): ünvan, adres, sicil, vergi no., yetkili — panel → Ayarlar'dan doldurulur */
export default async function Imprint({ params }: P) {
  const { lang } = await params;
  const t = getDict(lang);
  const c = company();
  const r = c.registry ?? { mersis: '', taxOffice: '', taxNo: '', tradeRegistry: '', representative: '' };
  const rows: [string, string][] = [
    ['Firma / Company', c.tradeName && !c.tradeName.startsWith('❓') ? c.tradeName : c.legalName],
    ['Anschrift / Address', `${c.address}, ${c.postalCode} ${c.city} / ${c.region}, Türkiye`],
    ['Telefon / Phone', c.phone],
    ['E-Mail', c.email],
    ['Vertretungsberechtigt / Authorised representative', r.representative],
    ['Handelsregister / Trade registry', r.tradeRegistry],
    ['MERSİS', r.mersis],
    ['Steuernummer / Tax no.', [r.taxOffice, r.taxNo].filter(Boolean).join(' — ')],
  ];
  const missing = rows.some(([, v]) => !v);
  return (
    <>
      <PageHero eyebrow={t.footer.legal} title={lang === 'de' ? 'Impressum' : t.footer.imprint} crumbs={[{ name: t.common.home, href: `/${lang}/` }, { name: t.footer.imprint }]} />
      <section className="wrap-narrow section-sm stack">
        <div className="table-wrap">
          <table className="table">
            <tbody>
              {rows
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <tr key={k}>
                    <th scope="row" style={{ textTransform: 'none', letterSpacing: 0 }}>
                      {k}
                    </th>
                    <td>{k.includes('Phone') ? <a href={telHref(v)}>{v}</a> : k === 'E-Mail' ? <a href={`mailto:${v}`}>{v}</a> : v}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {missing && <p className="note">{t.legal.pending}</p>}
      </section>
    </>
  );
}
