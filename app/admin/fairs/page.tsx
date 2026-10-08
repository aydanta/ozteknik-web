import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Shell from '@/components/admin/Shell';
import { requireUser } from '@/lib/auth';
import { db, audit } from '@/lib/db';
import { LOCALES, href } from '@/lib/i18n';

export const metadata = { title: 'Fuarlar' };
interface F { id: number; name: string; city: string; country: string; starts_on: string; ends_on: string; booth: string; url: string; active: number }

async function saveFair(fd: FormData) {
  'use server';
  const user = await requireUser(['admin', 'editor']);
  const id = Number(fd.get('id')) || 0;
  const v = (k: string) => String(fd.get(k) || '').trim().slice(0, 200);
  const ends = v('ends_on') || v('starts_on');
  if (fd.get('delete') && id) db().prepare('delete from fairs where id = ?').run(id);
  else if (id) db().prepare('update fairs set name=?, city=?, country=?, starts_on=?, ends_on=?, booth=?, url=?, active=? where id=?').run(v('name'), v('city'), v('country'), v('starts_on'), ends, v('booth'), v('url'), fd.get('active') ? 1 : 0, id);
  else if (v('name') && v('starts_on')) db().prepare('insert into fairs(name, city, country, starts_on, ends_on, booth, url, active) values(?,?,?,?,?,?,?,1)').run(v('name'), v('city'), v('country'), v('starts_on'), ends, v('booth'), v('url'));
  audit(user.email, 'fair-save', String(id || 'new'));
  for (const l of LOCALES) {
    revalidatePath(`/${l}/`);
    revalidatePath(href(l, 'media'));
  }
  redirect('/admin/fairs/?ok=1');
}
function FairForm({ f }: { f?: F }) {
  return (
    <form action={saveFair} className="form-grid">
      <input type="hidden" name="id" value={f?.id ?? 0} />
      <input className="input" name="name" defaultValue={f?.name} placeholder="Fuar adı" required />
      <input className="input" name="city" defaultValue={f?.city} placeholder="Şehir" />
      <label className="field">
        <span>Başlangıç</span>
        <input className="input" type="date" name="starts_on" defaultValue={f?.starts_on} required />
      </label>
      <label className="field">
        <span>Bitiş</span>
        <input className="input" type="date" name="ends_on" defaultValue={f?.ends_on} />
      </label>
      <input className="input" name="booth" defaultValue={f?.booth} placeholder="Salon / stant" />
      <input className="input" name="url" defaultValue={f?.url} placeholder="https://" />
      <input className="input mono" name="country" defaultValue={f?.country} placeholder="Ülke kodu" maxLength={2} />
      <label className="check">
        <input type="checkbox" name="active" defaultChecked={f ? !!f.active : true} /> Sitede göster
      </label>
      <div className="row span-2">
        <button className="btn btn--sm btn--primary">{f ? 'Kaydet' : 'Ekle'}</button>
        {f && (
          <button className="btn btn--sm btn--ghost" name="delete" value="1">
            Sil
          </button>
        )}
      </div>
    </form>
  );
}
export default async function Fairs({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const user = await requireUser(['admin', 'editor']);
  const sp = await searchParams;
  const rows = db().prepare('select * from fairs order by starts_on').all() as unknown as F[];
  return (
    <Shell user={user} active="/admin/fairs/">
      <div className="adm-head">
        <h1>Fuar takvimi</h1>
      </div>
      {sp.ok && <p className="flash">Kaydedildi.</p>}
      <fieldset>
        <legend>Yeni fuar</legend>
        <FairForm />
      </fieldset>
      {rows.map((f) => (
        <fieldset key={f.id}>
          <legend>
            {f.name} · {f.starts_on}
          </legend>
          <FairForm f={f} />
        </fieldset>
      ))}
    </Shell>
  );
}
