import type { Locale } from './i18n';

export type BrandKey = 'egerot' | 'hydcab' | 'revol';

export type CategoryKey =
  | 'torque-rod'
  | 'v-stay'
  | 'tie-rod'
  | 'rod-end'
  | 'stabilizer-link'
  | 'connection-components'
  | 'attachment-kit'
  | 'repair-kit'
  | 'cab-tilting-cylinder'
  | 'cab-tilting-pump'
  | 'cab-latch'
  | 'steering-cylinder'
  | 'axle-lift-cylinder'
  | 'hydraulic-repair-kit'
  | 'clutch-kit'
  | 'pressure-plate'
  | 'clutch-disc'
  | 'release-bearing';

export type ProductStatus = 'active' | 'draft' | 'archive';

/** OE numarası: araç üreticisiyle birlikte; normalize + görünen yazım. */
export interface OeRef {
  /** Araç üreticisi (normalize ad, ör. "Mercedes-Benz"); belirsizse null → panelde "üretici atanmalı" */
  make: string | null;
  /** Kaynaktaki yazım */
  value: string;
  /** Arama anahtarı: yalnız A-Z0-9, büyük harf, Mercedes "A" öneki atılmış */
  norm: string;
  /** Üreticiye özgü okunur yazım ("A 001 250 97 01", "81.43230-6000") */
  display: string;
}

/** Rakip aftermarket çapraz referansı (OE alanından ayrı) */
export interface CrossRef {
  brand: string;
  value: string;
  norm: string;
}

export interface Spec {
  key: string;
  value: string;
  unit?: string;
}

export interface ProductImage {
  /** Kalıcı, açıklayıcı dosya adı: {marka}-{kod}-{ürün-tipi-en}-{araç}-{oe}-{açı}.webp */
  file: string;
  /** Kaynak (taşıma sırasında indirilecek asıl) */
  source: string;
  width: number;
  height: number;
  kind: 'photo' | 'drawing';
  angle: 'front' | '34' | 'detail' | 'side';
  watermark?: boolean;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface Product {
  code: string;
  slug: string;
  brand: BrandKey;
  category: CategoryKey;
  status: ProductStatus;
  makes: string[];
  models: string[];
  oe: OeRef[];
  cross: CrossRef[];
  specs: Spec[];
  /** Set içeriği / ilgili parçalar (ürün kodları) */
  kit: string[];
  images: ProductImage[];
  /** Editör onaylı metin (dil bazında); boşsa şablondan üretilir */
  overrides: {
    summary?: Partial<Record<Locale, string>>;
    faq?: Partial<Record<Locale, FaqItem[]>>;
  };
  /** Kalite bayrakları (yayın kapısı) */
  issues: string[];
  legacy: { wpId: number; url: string; langs: string[] };
  updatedAt: string;
}

export type LeadType = 'quote' | 'sample' | 'distributor' | 'project' | 'contact' | 'notfound' | 'career' | 'newsletter';
export type LeadStatus = 'new' | 'assigned' | 'quoted' | 'won' | 'lost' | 'spam';

export interface Lead {
  id: number;
  type: LeadType;
  status: LeadStatus;
  createdAt: string;
  firstResponseAt: string | null;
  lang: Locale;
  country: string;
  company: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  assignee: string;
  payload: Record<string, unknown>;
  notes: string;
  screening: 'pending' | 'clear' | 'review';
  source: string;
}
