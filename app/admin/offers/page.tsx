import { redirect } from 'next/navigation';
import { randomBytes } from 'node:crypto';
import Shell from '@/components/admin/Shell';
import { requireUser } from '@/lib/auth';
import { db, now, audit } from '@/lib/db';
import { search } from '@/lib/search';
import { LOCALES, LOCALE_META } from '@/lib/i18n';

export const metadata = { title: 'Kişiye özel sayfalar' };
interface O { token: string; company: string; country: string; lang: string; intro: string; rows: string; created_at: string; expires_on: string | null; views: number; last_view_at: string | null; active: number }

async function createOffer(fd: FormData) {
  'use server';
  const user = await requireUser();
  const company = String(fd.get('company') || '').trim().slice(0, 120);
  const lang = String(fd.get('lang') || 'en');
  if (!company) redirect('/admin/offers/?err=1');
  // müşterinin kodlarını otomatik eşleştir (birebir eşleşme)
  const rows = String(fd.get('codes') || '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 200)
    .map((their) => {
      const r = search(their, 1);
      return r.mode === 'exact' && r.hits[0] ? { their, slug: r.hits[0].slug } : null;
    })
    .filter(Boolean);
  const token = `${company.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24)}-${randomBytes(5).toString('hex')}`;
  db().prepare('insert into offers(token, company, country, lang, contact, intro, rows, created_at, expires_on) values(?,?,?,?,?,?,?,?,?)').run(
    token,
    company,
    String(fd.get('country') || '').toUpperCase().slice(0, 2),
    lang,
    String(fd.get('contact') || '').slice(0, 160),
    String(fd.get('intro') || '').slice(0, 600),
    JSON.stringify(rows),
    now(),
    String(fd.get('expires_on') || '') || null,
  );
  audit(user.email, 'offer-create', token, `${rows.length} eşleşme`);
  redirect(`/admin/offers/?created=${token}`);
}
async function toggleOffer(fd: FormData) {
  'use server';
  await requireUser();
  db().prepare('update offers set active = 1 - active where token = ?').run(String(fd.get('token')));
  redirect('/admin/offers/');
}

export default async function Offers({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const rows = db().prepare('select * from offers order by created_at desc').all() as unknown as O[];
  return (
    <Shell user={user} active="/admin/offers/">
      <div className="adm-head">
        <div>
          <p className="eyebrow">Hesap bazlı pazarlama · noindex</p>
          <h1>Kişiye özel teklif sayfaları</h1>
        </div>
      </div>
      {sp.created && (
        <p className="flash">
          Sayfa oluşturuldu: <a href={`/${rows.find((r) => r.token === sp.created)?.lang ?? 'en'}/for/${sp.created}/`} target="_blank">/for/{sp.created}/</a>
        </p>
      )}
      <fieldset>
        <legend>Yeni sayfa</legend>
        <form action={createOffer} className="form-grid">
          <input className="input" name="company" placeholder="Hedef firma" required />
          <input className="input" name="contact" placeholder="Kişi (isteğe bağlı)" />
          <input className="input mono" name="country" placeholder="Ülke kodu" maxLength={2} />
          <select className="select" name="lang" defaultValue="en">
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {LOCALE_META[l].native}
              </option>
            ))}
          </select>
          <label className="field">
            <span>Geçerlilik sonu</span>
            <input className="input" type="date" name="expires_on" />
          </label>
          <textarea className="textarea span-2" name="intro" placeholder="Giriş metni (boşsa standart metin)" rows={2} />
          <textarea className="textarea mono-area span-2" name="codes" placeholder={'Firmanın kullandığı kodlar (satır başına) — OE ya da rakip no.\n81432306000\n3400 122 801'} rows={6} required />
          <button className="btn btn--primary span-2">Oluştur ve eşleştir</button>
        </form>
      </fieldset>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Firma</th>
              <th>Eşleşme</th>
              <th>Ziyaret</th>
              <th>Son ziyaret</th>
              <th>Bağlantı</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.token}>
                <td>
                  {o.company} <span className="small muted">{o.country}</span>
                </td>
                <td className="mono">{JSON.parse(o.rows).length}</td>
                <td>{o.views > 0 ? <span className="pill pill--accent">{o.views} · sıcak</span> : <span className="muted">0</span>}</td>
                <td className="small muted">{o.last_view_at ? new Date(o.last_view_at).toLocaleString('tr-TR') : '—'}</td>
                <td className="mono small">
                  <a href={`/${o.lang}/for/${o.token}/`} target="_blank">
                    /{o.lang}/for/{o.token}/
                  </a>
                </td>
                <td>
                  <form action={toggleOffer}>
                    <input type="hidden" name="token" value={o.token} />
                    <button className="btn btn--sm btn--ghost">{o.active ? 'Kapat' : 'Aç'}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
