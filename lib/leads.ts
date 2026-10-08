import { db, now, getSetting } from './db';
import type { Lead, LeadStatus, LeadType } from './types';

export interface Region {
  key: string;
  name: string;
  email: string;
  countries: string[];
}
export const regions = () => getSetting<Region[]>('regions', []);
export function regionFor(country: string): Region | undefined {
  const rs = regions();
  return rs.find((r) => r.countries.includes(country.toUpperCase())) ?? rs.find((r) => r.key === 'other');
}

export const LEAD_PREFIX: Record<LeadType, string> = {
  quote: 'Q',
  sample: 'S',
  distributor: 'D',
  project: 'P',
  contact: 'C',
  notfound: 'N',
  career: 'K',
  newsletter: 'B',
};
export const leadRef = (l: Pick<Lead, 'id' | 'type' | 'createdAt'>) => `${LEAD_PREFIX[l.type]}-${l.createdAt.slice(0, 4)}-${String(l.id).padStart(5, '0')}`;

interface Row {
  id: number;
  type: LeadType;
  status: LeadStatus;
  created_at: string;
  first_response_at: string | null;
  lang: string;
  country: string;
  company: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  assignee: string;
  payload: string;
  notes: string;
  screening: Lead['screening'];
  source: string;
}
const toLead = (r: Row): Lead => ({
  id: r.id,
  type: r.type,
  status: r.status,
  createdAt: r.created_at,
  firstResponseAt: r.first_response_at,
  lang: r.lang as Lead['lang'],
  country: r.country,
  company: r.company,
  name: r.name,
  email: r.email,
  phone: r.phone,
  region: r.region,
  assignee: r.assignee,
  payload: JSON.parse(r.payload || '{}'),
  notes: r.notes,
  screening: r.screening,
  source: r.source,
});

export function createLead(l: Omit<Lead, 'id' | 'createdAt' | 'status' | 'firstResponseAt' | 'notes' | 'screening' | 'region' | 'assignee'>): Lead {
  const region = regionFor(l.country || '');
  const createdAt = now();
  const res = db()
    .prepare(
      `insert into leads(type, status, created_at, lang, country, company, name, email, phone, region, assignee, payload, screening, source)
       values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(l.type, 'new', createdAt, l.lang, l.country, l.company, l.name, l.email, l.phone, region?.key ?? '', region?.email ?? '', JSON.stringify(l.payload), 'pending', l.source);
  return getLead(Number(res.lastInsertRowid))!;
}

export function getLead(id: number): Lead | null {
  const r = db().prepare('select * from leads where id = ?').get(id) as Row | undefined;
  return r ? toLead(r) : null;
}

export function listLeads(f: { type?: string; status?: string; region?: string; q?: string; limit?: number; offset?: number } = {}) {
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (f.type) {
    where.push('type = ?');
    args.push(f.type);
  }
  if (f.status) {
    where.push('status = ?');
    args.push(f.status);
  }
  if (f.region) {
    where.push('region = ?');
    args.push(f.region);
  }
  if (f.q) {
    where.push('(company like ? or email like ? or name like ? or payload like ?)');
    const like = `%${f.q}%`;
    args.push(like, like, like, like);
  }
  const w = where.length ? `where ${where.join(' and ')}` : '';
  const total = (db().prepare(`select count(*) n from leads ${w}`).get(...args) as { n: number }).n;
  const rows = db()
    .prepare(`select * from leads ${w} order by created_at desc limit ? offset ?`)
    .all(...args, f.limit ?? 50, f.offset ?? 0) as unknown as Row[];
  return { total, rows: rows.map(toLead) };
}

export function updateLead(id: number, patch: Partial<Pick<Lead, 'status' | 'assignee' | 'notes' | 'screening' | 'region'>>) {
  const cur = getLead(id);
  if (!cur) return null;
  const firstResponse = cur.firstResponseAt ?? (patch.status && patch.status !== 'new' ? now() : null);
  db()
    .prepare('update leads set status = ?, assignee = ?, notes = ?, screening = ?, region = ?, first_response_at = ? where id = ?')
    .run(patch.status ?? cur.status, patch.assignee ?? cur.assignee, patch.notes ?? cur.notes, patch.screening ?? cur.screening, patch.region ?? cur.region, firstResponse, id);
  return getLead(id);
}

/** CRM'e aktarım (HubSpot/Pipedrive webhook ya da Zapier/Make); ayar yoksa sessizce geçer */
export async function pushToCrm(lead: Lead) {
  const crm = getSetting<{ webhookUrl: string }>('crm', { webhookUrl: '' });
  if (!crm.webhookUrl) return { skipped: true };
  try {
    const res = await fetch(crm.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: leadRef(lead), ...lead }),
      signal: AbortSignal.timeout(8000),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

/** Panel panosu için özet */
export function leadStats() {
  const d = db();
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const byType = d.prepare('select type, count(*) n from leads where created_at >= ? group by type').all(since) as { type: string; n: number }[];
  const byCountry = d.prepare(`select country, count(*) n from leads where created_at >= ? and country != '' group by country order by n desc limit 10`).all(since) as {
    country: string;
    n: number;
  }[];
  const open = (d.prepare(`select count(*) n from leads where status in ('new','assigned')`).get() as { n: number }).n;
  const resp = d
    .prepare(`select avg((julianday(first_response_at) - julianday(created_at)) * 24) h from leads where first_response_at is not null and created_at >= ?`)
    .get(since) as { h: number | null };
  const overdue = (
    d.prepare(`select count(*) n from leads where status = 'new' and created_at < ? and type in ('quote','sample','distributor','project','notfound')`).get(new Date(Date.now() - 864e5).toISOString()) as {
      n: number;
    }
  ).n;
  return { byType, byCountry, open, avgResponseHours: resp.h, overdue };
}
