import Shell from '@/components/admin/Shell';
import { requireUser } from '@/lib/auth';
import { listProducts } from '@/lib/product-admin';
import { ISSUE_LABEL } from '@/lib/admin-data';
import { BRANDS, BRAND_KEYS, CATEGORIES } from '@/lib/catalog';
import { mediaSrc, productHref } from '@/lib/links';

export const metadata = { title: 'Ürünler' };
type SP = { q?: string; brand?: string; category?: string; status?: string; issue?: string; page?: string };

export default async function Products({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser(['admin', 'editor']);
  const sp = await searchParams;
  const res = listProducts({ ...sp, page: Number(sp.page) || 1 });
  const qs = (patch: Partial<SP>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => v) as [string, string][]);
    return `/admin/products/?${p}`;
  };
  return (
    <Shell user={user} active="/admin/products/">
      <div className="adm-head">
        <div>
          <p className="eyebrow">PIM</p>
          <h1>Ürünler</h1>
        </div>
        <span className="muted">{res.total} kayıt</span>
      </div>
      <form className="adm-filters" method="get">
        <input className="input mono" name="q" defaultValue={sp.q} placeholder="Kod, OE ya da rakip no." aria-label="Ara" />
        <select className="select" name="brand" defaultValue={sp.brand ?? ''} aria-label="Marka">
          <option value="">Tüm markalar</option>
          {BRAND_KEYS.map((b) => (
            <option key={b} value={b}>
              {BRANDS[b].name}
            </option>
          ))}
        </select>
        <select className="select" name="category" defaultValue={sp.category ?? ''} aria-label="Kategori">
          <option value="">Tüm kategoriler</option>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.many.tr}
            </option>
          ))}
        </select>
        <select className="select" name="status" defaultValue={sp.status ?? ''} aria-label="Durum">
          <option value="">Tüm durumlar</option>
          <option value="active">Yayında</option>
          <option value="draft">Taslak</option>
          <option value="archive">Arşiv</option>
        </select>
        <select className="select" name="issue" defaultValue={sp.issue ?? ''} aria-label="Eksik">
          <option value="">Tüm kalite durumları</option>
          {Object.entries(ISSUE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <button className="btn btn--sm btn--primary">Filtrele</button>
        <a className="btn btn--sm btn--ghost" href="/admin/products/">
          Temizle
        </a>
      </form>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Kod</th>
              <th>Marka</th>
              <th>Kategori</th>
              <th>OE</th>
              <th>Görsel</th>
              <th>Durum</th>
              <th>Eksikler</th>
            </tr>
          </thead>
          <tbody>
            {res.rows.map((p) => (
              <tr key={p.slug}>
                <td style={{ width: 56 }}>{p.images[0] ? <img src={mediaSrc(p.images[0].file, 200)} alt="" width={48} height={36} style={{ width: 48, height: 36, objectFit: 'contain', background: '#fff', borderRadius: 4 }} loading="lazy" /> : null}</td>
                <td className="mono">
                  <a href={`/admin/products/${p.slug}/`} style={{ fontWeight: 600 }}>
                    {p.code}
                  </a>
                </td>
                <td>
                  <span className={`badge badge--${p.brand}`}>{BRANDS[p.brand].name}</span>
                </td>
                <td>{CATEGORIES.find((c) => c.key === p.category)?.one.tr}</td>
                <td className="mono">{p.oe.length}</td>
                <td className="mono">{p.images.length}</td>
                <td>
                  <span className={`pill ${p.status === 'active' ? 'pill--ok' : 'pill--warn'}`}>{p.status === 'active' ? 'Yayında' : p.status === 'draft' ? 'Taslak' : 'Arşiv'}</span>{' '}
                  {p.status === 'active' && (
                    <a className="small" href={productHref('tr', p.slug)} target="_blank">
                      ↗
                    </a>
                  )}
                </td>
                <td className="small muted">{p.issues.map((i) => ISSUE_LABEL[i.split(':')[0]] ?? i).join(' · ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <nav className="row" aria-label="Sayfalar">
        {res.page > 1 && (
          <a className="btn btn--sm" href={qs({ page: String(res.page - 1) })}>
            ← Önceki
          </a>
        )}
        <span className="muted small">
          Sayfa {res.page} / {res.pages}
        </span>
        {res.page < res.pages && (
          <a className="btn btn--sm" href={qs({ page: String(res.page + 1) })}>
            Sonraki →
          </a>
        )}
      </nav>
    </Shell>
  );
}
