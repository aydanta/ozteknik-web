import Shell from '@/components/admin/Shell';
import { requireUser } from '@/lib/auth';
import { listLeads, leadRef, regions } from '@/lib/leads';

export const metadata = { title: 'Talepler' };
const TYPE: Record<string, string> = { quote: 'Teklif', sample: 'Numune', distributor: 'Distribütör', project: 'Proje', contact: 'İletişim', notfound: 'Bulunamayan no.', career: 'Kariyer', newsletter: 'Bülten' };
const STATUS: Record<string, string> = { new: 'Yeni', assigned: 'Atandı', quoted: 'Teklif verildi', won: 'Kazanıldı', lost: 'Kaybedildi', spam: 'Spam' };
type SP = { type?: string; status?: string; region?: string; q?: string; page?: string };

export default async function Leads({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const page = Number(sp.page) || 1;
  // satış rolü yalnız kendi bölgesini görür
  const region = user.role === 'sales' && user.region ? user.region : sp.region;
  const res = listLeads({ ...sp, region, limit: 50, offset: (page - 1) * 50 });
  const ageH = (s: string) => (Date.now() - new Date(s).getTime()) / 36e5;
  return (
    <Shell user={user} active="/admin/leads/">
      <div className="adm-head">
        <div>
          <p className="eyebrow">CRM gelen kutusu</p>
          <h1>Talepler</h1>
        </div>
        <a className="btn btn--sm" href={`/admin/export/?what=leads&type=${sp.type ?? ''}`}>
          CSV indir
        </a>
      </div>
      <form className="adm-filters" method="get">
        <input className="input" name="q" defaultValue={sp.q} placeholder="Firma, e-posta, kod" aria-label="Ara" />
        <select className="select" name="type" defaultValue={sp.type ?? ''} aria-label="Tür">
          <option value="">Tüm türler</option>
          {Object.entries(TYPE).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select className="select" name="status" defaultValue={sp.status ?? ''} aria-label="Durum">
          <option value="">Tüm durumlar</option>
          {Object.entries(STATUS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        {user.role !== 'sales' && (
          <select className="select" name="region" defaultValue={sp.region ?? ''} aria-label="Bölge">
            <option value="">Tüm bölgeler</option>
            {regions().map((r) => (
              <option key={r.key} value={r.key}>
                {r.name}
              </option>
            ))}
          </select>
        )}
        <button className="btn btn--sm btn--primary">Filtrele</button>
      </form>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>No</th>
              <th>Tür</th>
              <th>Firma</th>
              <th>Kişi</th>
              <th>Ülke</th>
              <th>Kalem</th>
              <th>Durum</th>
              <th>Yaş</th>
            </tr>
          </thead>
          <tbody>
            {res.rows.map((l) => {
              const h = ageH(l.createdAt);
              const late = l.status === 'new' && h > 24 && ['quote', 'sample', 'distributor', 'project', 'notfound'].includes(l.type);
              return (
                <tr key={l.id}>
                  <td className="mono">
                    <a href={`/admin/leads/${l.id}/`}>{leadRef(l)}</a>
                  </td>
                  <td>{TYPE[l.type]}</td>
                  <td>{l.company}</td>
                  <td>
                    {l.name}
                    <br />
                    <span className="small muted">{l.email}</span>
                  </td>
                  <td>{l.country}</td>
                  <td className="mono">{Array.isArray((l.payload as { items?: unknown[] }).items) ? (l.payload as { items: unknown[] }).items.length : '—'}</td>
                  <td>
                    <span className={`pill ${l.status === 'new' ? 'pill--warn' : l.status === 'won' ? 'pill--ok' : ''}`}>{STATUS[l.status]}</span>
                  </td>
                  <td className={late ? 'mono' : 'mono muted'} style={late ? { color: 'var(--err)' } : undefined}>
                    {h < 48 ? `${h.toFixed(0)} sa` : `${(h / 24).toFixed(0)} g`}
                  </td>
                </tr>
              );
            })}
            {!res.rows.length && (
              <tr>
                <td colSpan={8} className="muted">
                  Kayıt yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="small muted">
        {res.total} talep · sayfa {page}
        {page > 1 && (
          <>
            {' '}
            · <a href={`?${new URLSearchParams({ ...(sp as Record<string, string>), page: String(page - 1) })}`}>önceki</a>
          </>
        )}
        {res.total > page * 50 && (
          <>
            {' '}
            · <a href={`?${new URLSearchParams({ ...(sp as Record<string, string>), page: String(page + 1) })}`}>sonraki</a>
          </>
        )}
      </p>
    </Shell>
  );
}
