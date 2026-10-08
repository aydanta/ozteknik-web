import { currentSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { listLeads, leadRef } from '@/lib/leads';

const cell = (v: unknown) => {
  const s = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export async function GET(req: Request) {
  const s = await currentSession();
  if (!s || (s.user.totp_enabled && !s.mfaOk)) return new Response('Unauthorized', { status: 401 });
  const u = new URL(req.url);
  const what = u.searchParams.get('what');
  let lines: string[] = [];
  if (what === 'misses') {
    lines = ['norm,query,hits,langs,first_at,last_at', ...(db().prepare('select * from search_misses order by hits desc').all() as Record<string, unknown>[]).map((r) => [r.norm, r.query, r.hits, r.langs, r.first_at, r.last_at].map(cell).join(','))];
  } else {
    const type = u.searchParams.get('type') || undefined;
    const region = s.user.role === 'sales' ? s.user.region : undefined;
    const { rows } = listLeads({ type, region, limit: 10000 });
    lines = ['ref,type,status,created_at,first_response_at,lang,country,company,name,email,phone,region,assignee,screening,payload', ...rows.map((l) => [leadRef(l), l.type, l.status, l.createdAt, l.firstResponseAt, l.lang, l.country, l.company, l.name, l.email, l.phone, l.region, l.assignee, l.screening, l.payload].map(cell).join(','))];
  }
  return new Response('﻿' + lines.join('\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="ozteknik-${what || 'leads'}-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
