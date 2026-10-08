import Shell from '@/components/admin/Shell';
import { requireUser } from '@/lib/auth';
import { leadStats, listLeads, leadRef } from '@/lib/leads';
import { productStats, topMisses, hotOffers, recentAudit, ISSUE_LABEL } from '@/lib/admin-data';

export const metadata = { title: 'Pano' };
const TYPE: Record<string, string> = { quote: 'Teklif', sample: 'Numune', distributor: 'Distribütör', project: 'Proje', contact: 'İletişim', notfound: 'Bulunamayan no.', career: 'Kariyer', newsletter: 'Bülten' };
const fmtDate = (s: string) => new Date(s).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const ls = leadStats();
  const ps = productStats();
  const recent = listLeads({ limit: 8 }).rows;
  const misses = topMisses(8);
  const hot = hotOffers();
  const log = recentAudit(8);
  const total = Object.values(ps.status).reduce((a, b) => a + b, 0);
  const types = Object.fromEntries(ls.byType.map((r) => [r.type, r.n]));
  return (
    <Shell user={user} active="/admin/">
      <div className="adm-head">
        <div>
          <p className="eyebrow">Son 30 gün</p>
          <h1>Pano</h1>
        </div>
        <a className="btn btn--sm" href="/admin/export/?what=leads">
          Talepleri CSV indir
        </a>
      </div>
      {sp.denied && <p className="flash flash--err">Bu bölüm için yetkiniz yok.</p>}
      <div className="kpis">
        <a className="kpi" href="/admin/leads/?type=quote">
          <b>{types.quote ?? 0}</b>
          <span>Teklif listesi gönderimi</span>
        </a>
        <a className="kpi" href="/admin/leads/?type=sample">
          <b>{types.sample ?? 0}</b>
          <span>Numune talebi</span>
        </a>
        <a className="kpi" href="/admin/leads/?type=distributor">
          <b>{types.distributor ?? 0}</b>
          <span>Distribütör başvurusu</span>
        </a>
        <a className={`kpi ${ls.overdue ? 'kpi--err' : ''}`} href="/admin/leads/?status=new">
          <b>{ls.overdue}</b>
          <span>24 saati geçen yanıtsız talep</span>
        </a>
        <div className="kpi">
          <b>{ls.avgResponseHours == null ? '—' : `${ls.avgResponseHours.toFixed(1)} sa`}</b>
          <span>Ort. ilk yanıt süresi (hedef &lt; 24 sa)</span>
        </div>
        <a className="kpi" href="/admin/products/?status=active">
          <b>{ps.status.active ?? 0}</b>
          <span>Yayındaki ürün / {total}</span>
        </a>
        <a className="kpi kpi--warn" href="/admin/products/?status=draft">
          <b>{ps.status.draft ?? 0}</b>
          <span>Taslak (yayın kapısında)</span>
        </a>
      </div>

      <div className="adm-grid">
        <section className="stack">
          <h2 className="h3">Son talepler</h2>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Tür</th>
                  <th>Firma / kişi</th>
                  <th>Ülke</th>
                  <th>Bölge</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((l) => (
                  <tr key={l.id}>
                    <td className="mono">
                      <a href={`/admin/leads/${l.id}/`}>{leadRef(l)}</a>
                    </td>
                    <td>{TYPE[l.type]}</td>
                    <td>{l.company || l.name || l.email}</td>
                    <td>{l.country}</td>
                    <td>{l.region}</td>
                    <td>
                      <span className={`pill ${l.status === 'new' ? 'pill--warn' : 'pill--ok'}`}>{l.status}</span>
                    </td>
                    <td className="small muted">{fmtDate(l.createdAt)}</td>
                  </tr>
                ))}
                {!recent.length && (
                  <tr>
                    <td colSpan={7} className="muted">
                      Henüz talep yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <h2 className="h3">Ülke bazlı talep</h2>
          <div className="stack" style={{ gap: 8 }}>
            {ls.byCountry.map((c) => (
              <div key={c.country} className="row" style={{ flexWrap: 'nowrap' }}>
                <span className="mono" style={{ width: 36 }}>
                  {c.country}
                </span>
                <div className="bar" style={{ flex: 1 }}>
                  <i style={{ width: `${(c.n / (ls.byCountry[0]?.n || 1)) * 100}%` }} />
                </div>
                <span className="mono small">{c.n}</span>
              </div>
            ))}
            {!ls.byCountry.length && <p className="muted small">Veri yok.</p>}
          </div>
        </section>

        <section className="stack">
          <h2 className="h3">Veri kalitesi (yayın kapısı)</h2>
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {Object.entries(ps.issues)
                  .sort((a, b) => b[1] - a[1])
                  .map(([k, n]) => (
                    <tr key={k}>
                      <td>
                        <a href={`/admin/products/?issue=${k}`}>{ISSUE_LABEL[k] ?? k}</a>
                      </td>
                      <td className="mono">{n}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <h2 className="h3">En çok aranıp bulunamayan</h2>
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {misses.map((m) => (
                  <tr key={m.norm}>
                    <td className="mono">{m.query}</td>
                    <td className="mono">{m.hits}×</td>
                    <td className="small muted">{m.langs}</td>
                  </tr>
                ))}
                {!misses.length && (
                  <tr>
                    <td className="muted">Henüz kayıt yok.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <h2 className="h3">Sıcak müşteriler (kişiye özel sayfa ziyareti)</h2>
          <ul className="stack" style={{ gap: 6, listStyle: 'none' }}>
            {hot.map((h) => (
              <li key={h.token} className="row">
                <span className="pill pill--accent">{h.views} ziyaret</span> {h.company} <span className="small muted">{fmtDate(h.last_view_at)}</span>
              </li>
            ))}
            {!hot.length && <li className="muted small">Ziyaret yok.</li>}
          </ul>
          <h2 className="h3">Son işlemler</h2>
          <ul className="small muted" style={{ listStyle: 'none', display: 'grid', gap: 4 }}>
            {log.map((a) => (
              <li key={a.id}>
                {fmtDate(a.at)} · {a.user_email} · {a.action} · {a.entity}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Shell>
  );
}
