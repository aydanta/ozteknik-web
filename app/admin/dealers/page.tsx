import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Shell from '@/components/admin/Shell';
import { requireUser } from '@/lib/auth';
import { db, now, audit } from '@/lib/db';
import { LOCALES, href } from '@/lib/i18n';

export const metadata = { title: 'Bayiler' };
interface D { id: number; name: string; country: string; city: string; address: string; phone: string; email: string; website: string; brands: string; consent: number; active: number }

async function saveDealer(fd: FormData) {
  'use server';
  const user = await requireUser();
  const id = Number(fd.get('id')) || 0;
  const v = (k: string) => String(fd.get(k) || '').trim().slice(0, 300);
  const row = [v('name'), v('country').toUpperCase().slice(0, 2), v('city'), v('address'), v('phone'), v('email'), v('website'), v('brands'), fd.get('consent') ? 1 : 0, fd.get('active') ? 1 : 0, now()];
  if (fd.get('delete') && id) db().prepare('delete from dealers where id = ?').run(id);
  else if (id) db().prepare('update dealers set name=?, country=?, city=?, address=?, phone=?, email=?, website=?, brands=?, consent=?, active=?, updated_at=? where id=?').run(...row, id);
  else if (v('name') && v('country')) db().prepare('insert into dealers(name, country, city, address, phone, email, website, brands, consent, active, updated_at) values(?,?,?,?,?,?,?,?,?,?,?)').run(...row);
  audit(user.email, 'dealer-save', String(id || 'new'));
  for (const l of LOCALES) revalidatePath(href(l, 'dealers'));
  redirect('/admin/dealers/?ok=1');
}

function DealerForm({ d }: { d?: D }) {
  return (
    <form action={saveDealer} className="form-grid">
      <input type="hidden" name="id" value={d?.id ?? 0} />
      <input className="input" name="name" defaultValue={d?.name} placeholder="Bayi adı" required />
      <input className="input mono" name="country" defaultValue={d?.country} placeholder="Ülke kodu (AE, DE…)" required maxLength={2} />
      <input className="input" name="city" defaultValue={d?.city} placeholder="Şehir" />
      <input className="input" name="phone" defaultValue={d?.phone} placeholder="Telefon" />
      <input className="input" name="email" defaultValue={d?.email} placeholder="E-posta" />
      <input className="input" name="website" defaultValue={d?.website} placeholder="https://" />
      <input className="input span-2" name="address" defaultValue={d?.address} placeholder="Adres" />
      <input className="input span-2" name="brands" defaultValue={d?.brands} placeholder="Taşıdığı markalar (EGEROT, REVOL…)" />
      <label className="check">
        <input type="checkbox" name="consent" defaultChecked={!!d?.consent} /> Listelenmeye yazılı izin verdi
      </label>
      <label className="check">
        <input type="checkbox" name="active" defaultChecked={d ? !!d.active : true} /> Aktif
      </label>
      <div className="row span-2">
        <button className="btn btn--sm btn--primary">{d ? 'Kaydet' : 'Ekle'}</button>
        {d && (
          <button className="btn btn--sm btn--ghost" name="delete" value="1">
            Sil
          </button>
        )}
      </div>
    </form>
  );
}

export default async function Dealers({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const rows = db().prepare('select * from dealers order by country, city, name').all() as unknown as D[];
  return (
    <Shell user={user} active="/admin/dealers/">
      <div className="adm-head">
        <div>
          <p className="eyebrow">Bayi bulucu</p>
          <h1>Bayiler</h1>
        </div>
      </div>
      {sp.ok && <p className="flash">Kaydedildi.</p>}
      <p className="small muted">Sitede yalnız "izin verdi" ve "aktif" işaretli bayiler görünür (şartname). Örnek: Gear Systems, Emirates Truck — izinleri alınınca eklenecek.</p>
      <fieldset>
        <legend>Yeni bayi</legend>
        <DealerForm />
      </fieldset>
      {rows.map((d) => (
        <fieldset key={d.id}>
          <legend>
            {d.name} · {d.country} {d.consent && d.active ? <span className="pill pill--ok">sitede</span> : <span className="pill pill--warn">gizli</span>}
          </legend>
          <DealerForm d={d} />
        </fieldset>
      ))}
    </Shell>
  );
}
