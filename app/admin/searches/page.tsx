import Shell from '@/components/admin/Shell';
import { requireUser } from '@/lib/auth';
import { topMisses } from '@/lib/admin-data';

export const metadata = { title: 'Bulunamayan aramalar' };
/** Şartname: "hangi OE'ler aranıyor ama yok" — ürün geliştirme girdisi */
export default async function Misses() {
  const user = await requireUser();
  const rows = topMisses(500);
  return (
    <Shell user={user} active="/admin/searches/">
      <div className="adm-head">
        <div>
          <p className="eyebrow">Ürün geliştirme girdisi</p>
          <h1>Aranıp bulunamayan numaralar</h1>
        </div>
        <a className="btn btn--sm" href="/admin/export/?what=misses">
          CSV indir
        </a>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Numara (normalize)</th>
              <th>Yazılan</th>
              <th>Arama</th>
              <th>Diller</th>
              <th>İlk</th>
              <th>Son</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.norm}>
                <td className="mono">{r.norm}</td>
                <td className="mono">{r.query}</td>
                <td className="mono">{r.hits}</td>
                <td>{r.langs}</td>
                <td className="small muted">{r.first_at.slice(0, 10)}</td>
                <td className="small muted">{r.last_at.slice(0, 10)}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={6} className="muted">
                  Henüz kayıt yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
