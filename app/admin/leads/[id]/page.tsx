import { Fragment } from 'react';
import { notFound, redirect } from 'next/navigation';
import Shell from '@/components/admin/Shell';
import { requireUser } from '@/lib/auth';
import { getLead, leadRef, updateLead, regions } from '@/lib/leads';
import { audit } from '@/lib/db';
import { getProductsBySlugs, CATEGORY } from '@/lib/catalog';
import { productHref } from '@/lib/links';
import type { LeadStatus, Lead } from '@/lib/types';

export const metadata = { title: 'Talep' };
const STATUS: Record<string, string> = { new: 'Yeni', assigned: 'Atandı', quoted: 'Teklif verildi', won: 'Kazanıldı', lost: 'Kaybedildi', spam: 'Spam' };

async function save(fd: FormData) {
  'use server';
  const user = await requireUser();
  const id = Number(fd.get('id'));
  updateLead(id, {
    status: String(fd.get('status')) as LeadStatus,
    assignee: String(fd.get('assignee') || ''),
    region: String(fd.get('region') || ''),
    screening: String(fd.get('screening')) as Lead['screening'],
    notes: String(fd.get('notes') || '').slice(0, 5000),
  });
  audit(user.email, 'lead-update', String(id), String(fd.get('status')));
  redirect(`/admin/leads/${id}/?ok=1`);
}

export default async function LeadPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const l = getLead(Number(id));
  if (!l || (user.role === 'sales' && user.region && l.region !== user.region)) notFound();
  const pl = l.payload as { items?: { code: string; slug: string | null; qty: number }[]; message?: string; files?: string[]; [k: string]: unknown };
  const products = new Map(getProductsBySlugs((pl.items ?? []).map((i) => i.slug).filter(Boolean) as string[]).map((p) => [p.slug, p]));
  const extra = Object.entries(pl).filter(([k]) => !['items', 'message', 'files'].includes(k));
  const subject = encodeURIComponent(`Özteknik — ${leadRef(l)}`);
  return (
    <Shell user={user} active="/admin/leads/">
      <div className="adm-head">
        <div>
          <p className="eyebrow">
            <a href="/admin/leads/">Talepler</a> / {l.type}
          </p>
          <h1 className="mono">{leadRef(l)}</h1>
        </div>
        <a className="btn btn--primary" href={`mailto:${l.email}?subject=${subject}`}>
          E-postayla yanıtla
        </a>
      </div>
      {sp.ok && <p className="flash">Kaydedildi.</p>}
      <div className="adm-grid">
        <div className="stack">
          <fieldset>
            <legend>Gönderen</legend>
            <p>
              <b>{l.company}</b> · {l.name} · <a href={`mailto:${l.email}`}>{l.email}</a> · {l.phone} · {l.country} · dil: {l.lang}
            </p>
            <p className="small muted">
              {new Date(l.createdAt).toLocaleString('tr-TR')} · kaynak: {l.source}
            </p>
          </fieldset>
          {pl.items && (
            <fieldset>
              <legend>Teklif listesi ({pl.items.length} kalem)</legend>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Kod</th>
                      <th>Ürün</th>
                      <th>Adet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pl.items.map((i) => {
                      const p = i.slug ? products.get(i.slug) : undefined;
                      return (
                        <tr key={i.code}>
                          <td className="mono">{p ? <a href={productHref('tr', p.slug)} target="_blank">{i.code}</a> : i.code}</td>
                          <td>{p ? CATEGORY[p.category].one.tr : <span className="pill pill--warn">katalogda yok</span>}</td>
                          <td className="mono">{i.qty}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </fieldset>
          )}
          {pl.message && (
            <fieldset>
              <legend>Mesaj</legend>
              <p style={{ whiteSpace: 'pre-wrap' }}>{pl.message}</p>
            </fieldset>
          )}
          {extra.length > 0 && (
            <fieldset>
              <legend>Diğer alanlar</legend>
              <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', margin: 0 }}>
                {extra.map(([k, v]) => (
                  <Fragment key={k}>
                    <dt className="muted small">{k}</dt>
                    <dd style={{ margin: 0 }}>{Array.isArray(v) ? v.join(', ') : String(v)}</dd>
                  </Fragment>
                ))}
              </dl>
            </fieldset>
          )}
          {pl.files && (
            <fieldset>
              <legend>Ekler</legend>
              <ul>
                {pl.files.map((f) => (
                  <li key={f} className="mono small">
                    data/uploads/{l.id}/{f}
                  </li>
                ))}
              </ul>
            </fieldset>
          )}
        </div>
        <form action={save} className="stack">
          <input type="hidden" name="id" value={l.id} />
          <fieldset>
            <legend>Süreç</legend>
            <div className="field">
              <label>Durum</label>
              <select className="select" name="status" defaultValue={l.status}>
                {Object.entries(STATUS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Bölge</label>
              <select className="select" name="region" defaultValue={l.region}>
                {regions().map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Sorumlu (e-posta)</label>
              <input className="input" name="assignee" defaultValue={l.assignee} />
            </div>
            <div className="field">
              <label>Yaptırım taraması (AB/ABD/BK listeleri)</label>
              <select className="select" name="screening" defaultValue={l.screening}>
                <option value="pending">Bekliyor</option>
                <option value="clear">Temiz</option>
                <option value="review">İncelemede</option>
              </select>
            </div>
            <div className="field">
              <label>Notlar</label>
              <textarea className="textarea" name="notes" defaultValue={l.notes} rows={6} />
            </div>
            <p className="small muted">İlk yanıt: {l.firstResponseAt ? new Date(l.firstResponseAt).toLocaleString('tr-TR') : '—'}</p>
            <button className="btn btn--primary">Kaydet</button>
          </fieldset>
        </form>
      </div>
    </Shell>
  );
}
