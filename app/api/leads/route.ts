import { NextResponse, type NextRequest } from 'next/server';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { createLead, leadRef, pushToCrm } from '@/lib/leads';
import { isLocale } from '@/lib/i18n';
import type { LeadType } from '@/lib/types';

/**
 * Tüm formlar tek uç: teklif, numune, distribütör, proje, iletişim, bulunamayan numara, kariyer, bülten.
 * Bot koruması görünmezdir: bal küpü alan + zaman tuzağı + IP başına oran sınırı (CAPTCHA yok).
 * Kişisel veri: yalnız gerekli alanlar; açık rıza zorunlu (KVKK/GDPR).
 */
const TYPES = ['quote', 'sample', 'distributor', 'project', 'contact', 'notfound', 'career', 'newsletter'] as const;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const t = Date.now();
  const arr = (hits.get(ip) || []).filter((x) => t - x < 60_000);
  arr.push(t);
  hits.set(ip, arr);
  return arr.length > 6;
}

const base = z.object({
  type: z.enum(TYPES),
  lang: z.string().default('en'),
  name: z.string().trim().max(120).default(''),
  company: z.string().trim().max(160).default(''),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(40).default(''),
  country: z.string().trim().toUpperCase().max(2).default(''),
  message: z.string().trim().max(5000).default(''),
  consent: z.literal('on'),
  source: z.string().max(300).default(''),
});
const REQUIRED: Partial<Record<LeadType, string[]>> = {
  quote: ['company', 'country', 'name'],
  sample: ['company', 'country', 'name'],
  distributor: ['company', 'country', 'name'],
  project: ['company', 'country', 'name'],
  contact: ['name'],
  career: ['name'],
};
const ALLOWED_FILE = /\.(pdf|xlsx|xls|csv|png|jpe?g|webp|step|stp|dwg|dxf)$/i;

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (limited(ip)) return NextResponse.json({ ok: false, error: 'rate' }, { status: 429 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false, error: 'bad' }, { status: 400 });
  // bal küpü ve zaman tuzağı: botları sessizce "başarılı" gibi karşıla
  const hp = String(form.get('website2') || '');
  const elapsed = Number(form.get('t') || 0);
  if (hp || (elapsed && elapsed < 2500)) return NextResponse.json({ ok: true, id: 'X-0' });

  const raw = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === 'string')) as Record<string, string>;
  const parsed = base.safeParse(raw);
  if (!parsed.success) {
    const fields = parsed.error.issues.map((i) => String(i.path[0]));
    return NextResponse.json({ ok: false, error: 'invalid', fields }, { status: 422 });
  }
  const d = parsed.data;
  const missing = (REQUIRED[d.type] || []).filter((k) => !String((d as Record<string, unknown>)[k] || '').trim());
  if (missing.length) return NextResponse.json({ ok: false, error: 'invalid', fields: missing }, { status: 422 });

  // türe özgü alanlar
  const payload: Record<string, unknown> = { message: d.message };
  for (const k of ['website', 'volume', 'lines', 'brandsCarried', 'department', 'position', 'projectType', 'quantity', 'number', 'shipping', 'codes', 'marketing', 'offer']) {
    const v = form.getAll(k).filter((x) => typeof x === 'string') as string[];
    if (v.length) payload[k] = v.length > 1 ? v : v[0];
  }
  if (d.type === 'quote') {
    try {
      const items = JSON.parse(String(form.get('items') || '[]')) as { code: string; slug: string | null; qty: number }[];
      payload.items = items.slice(0, 400).map((i) => ({ code: String(i.code).slice(0, 40), slug: i.slug ? String(i.slug).slice(0, 60) : null, qty: Math.max(1, Math.min(99999, Number(i.qty) || 1)) }));
      if (!(payload.items as unknown[]).length) return NextResponse.json({ ok: false, error: 'invalid', fields: ['items'] }, { status: 422 });
    } catch {
      return NextResponse.json({ ok: false, error: 'invalid', fields: ['items'] }, { status: 422 });
    }
  }

  const lead = createLead({
    type: d.type,
    lang: isLocale(d.lang) ? d.lang : 'en',
    country: d.country,
    company: d.company,
    name: d.name,
    email: d.email,
    phone: d.phone,
    payload,
    source: d.source || req.headers.get('referer') || '',
  });

  // dosya ekleri (liste, CV, çizim) — en fazla 3 dosya, 8 MB
  const files = form.getAll('file').filter((f): f is File => typeof f !== 'string' && f.size > 0).slice(0, 3);
  if (files.length) {
    const dir = path.join(process.cwd(), 'data', 'uploads', String(lead.id));
    await mkdir(dir, { recursive: true });
    const saved: string[] = [];
    for (const f of files) {
      if (f.size > 8 * 1024 * 1024 || !ALLOWED_FILE.test(f.name)) continue;
      const name = f.name.replace(/[^\w.-]+/g, '_').slice(-80);
      await writeFile(path.join(dir, name), Buffer.from(await f.arrayBuffer()));
      saved.push(name);
    }
    if (saved.length) {
      const { db } = await import('@/lib/db');
      db().prepare('update leads set payload = json_set(payload, ?, json(?)) where id = ?').run('$.files', JSON.stringify(saved), lead.id);
    }
  }

  void pushToCrm(lead);
  return NextResponse.json({ ok: true, id: leadRef(lead) });
}
