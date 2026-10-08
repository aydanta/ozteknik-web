'use server';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { getProduct } from '@/lib/catalog';
import { saveProduct, gateErrors, parseOe, parseCross, parseSpecs } from '@/lib/product-admin';
import { LOCALES } from '@/lib/i18n';
import type { Product, BrandKey, CategoryKey, ProductStatus } from '@/lib/types';

export async function updateProduct(fd: FormData) {
  const user = await requireUser(['admin', 'editor']);
  const slug = String(fd.get('slug'));
  const prev = getProduct(slug, { includeDraft: true });
  if (!prev) redirect('/admin/products/');
  const lines = (k: string) =>
    String(fd.get(k) || '')
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  const summary: Partial<Record<(typeof LOCALES)[number], string>> = {};
  for (const l of LOCALES) {
    const v = String(fd.get(`summary_${l}`) || '').trim();
    if (v) summary[l] = v.slice(0, 600);
  }
  const next: Product = {
    ...prev,
    brand: String(fd.get('brand')) as BrandKey,
    category: String(fd.get('category')) as CategoryKey,
    status: String(fd.get('status')) as ProductStatus,
    makes: lines('makes'),
    models: lines('models'),
    oe: parseOe(String(fd.get('oe') || '')),
    cross: parseCross(String(fd.get('cross') || '')),
    specs: parseSpecs(String(fd.get('specs') || '')),
    kit: lines('kit'),
    images: prev.images.map((img, i) => ({ ...img, watermark: fd.get(`wm_${i}`) === 'on' || undefined })),
    overrides: { ...prev.overrides, summary },
  };
  if (next.status === 'active') {
    const errs = gateErrors(next);
    if (errs.length) {
      next.status = 'draft';
      await saveProduct(prev, next, user.email);
      redirect(`/admin/products/${slug}/?err=${encodeURIComponent(`Taslak olarak kaydedildi. ${errs.join(' ')}`)}`);
    }
  }
  const r = await saveProduct(prev, next, user.email);
  const ping = 'ok' in r.ping ? (r.ping.ok ? ' IndexNow bildirildi.' : ' IndexNow bildirimi başarısız.') : '';
  redirect(`/admin/products/${slug}/?ok=${encodeURIComponent(`Kaydedildi; 8 dildeki sayfa yenilendi.${ping}`)}`);
}
