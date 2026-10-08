import { Breadcrumbs } from '@/components/layout/Footer';
import Photo from '@/components/Photo';
import type { PhotoKey } from '@/lib/photos';

/**
 * Sayfa başlığı. photo veya media verilirse görselli bant (koyu perde, beyaz metin);
 * verilmezse ince bant + teknik çizim deseni (formlar ve yasal metinler).
 * 08.10.2026: Furkan'ın isteğiyle iç sayfalara görsel eklendi.
 */
export default function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  children,
  photo,
  media,
  kicker,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  crumbs: { name: string; href?: string }[];
  children?: React.ReactNode;
  photo?: PhotoKey;
  media?: React.ReactNode;
  /** başlığın üstünde (ör. marka logosu) */
  kicker?: React.ReactNode;
}) {
  const visual = media ?? (photo ? <Photo k={photo} eager /> : null);
  return (
    <>
      <Breadcrumbs items={crumbs} />
      <header className={visual ? 'page-hero page-hero--media' : 'page-hero page-hero--plain'}>
        {visual && <div className="page-hero-media">{visual}</div>}
        <div className="wrap stack page-hero-copy">
          {kicker}
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="d3">{title}</h1>
          {lead && <p className="lead">{lead}</p>}
          {children}
        </div>
      </header>
    </>
  );
}
