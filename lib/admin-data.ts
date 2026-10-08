import { db, getSetting } from './db';
import type { Product } from './types';

/** Panel sorguları (yalnız sunucu) */
export function productStats() {
  const d = db();
  const status = Object.fromEntries((d.prepare('select status, count(*) n from products group by status').all() as { status: string; n: number }[]).map((r) => [r.status, r.n]));
  const issues: Record<string, number> = {};
  for (const r of d.prepare('select doc from products').all() as { doc: string }[]) {
    for (const i of (JSON.parse(r.doc) as Product).issues) {
      const k = i.split(':')[0];
      issues[k] = (issues[k] || 0) + 1;
    }
  }
  return { status, issues };
}
export const ISSUE_LABEL: Record<string, string> = {
  'oe-missing': 'OE numarası yok',
  'oe-only-competitor': 'Yalnız rakip (Sachs) numarası var',
  'image-missing': 'Görsel yok',
  'image-lowres': 'Görsel 1.200 px altında',
  'image-watermark': 'Görselde filigran (EGEROT)',
  'models-missing': 'Araç modeli yok',
  'oe-make-unassigned': "OE'nin araç üreticisi belirsiz",
  'brand-mismatch': 'Marka kategoriyle çelişiyordu (düzeltildi)',
  'brand-missing-fixed-by-category': 'Marka boştu (kategoriden atandı)',
  'spec-unmapped': 'Eşlenemeyen ölçü etiketi',
  'category-unknown': 'Kategori bilinmiyor',
  'code-prefix-review': 'Kod öneki incelenmeli (IP_/IPX_)',
};
export function topMisses(limit = 10) {
  return db().prepare('select * from search_misses order by hits desc, last_at desc limit ?').all(limit) as { norm: string; query: string; hits: number; langs: string; first_at: string; last_at: string }[];
}
export function hotOffers(limit = 5) {
  return db().prepare(`select token, company, views, last_view_at from offers where active = 1 and views > 0 order by last_view_at desc limit ?`).all(limit) as {
    token: string;
    company: string;
    views: number;
    last_view_at: string;
  }[];
}
export function recentAudit(limit = 12) {
  return db().prepare('select * from audit order by id desc limit ?').all(limit) as { id: number; at: string; user_email: string; action: string; entity: string; detail: string }[];
}
export const gate = () => getSetting('publishGate', { requireOe: true, requireImage: true });
