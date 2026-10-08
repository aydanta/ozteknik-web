import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Shell from '@/components/admin/Shell';
import { requireUser, hashPassword } from '@/lib/auth';
import { db, now, audit, getSetting, setSetting } from '@/lib/db';
import { company, stats, type Company } from '@/lib/site';
import { regions, type Region } from '@/lib/leads';

export const metadata = { title: 'Ayarlar' };

async function saveCompany(fd: FormData) {
  'use server';
  const user = await requireUser(['admin']);
  const c = company();
  const v = (k: string) => String(fd.get(k) ?? '').trim().slice(0, 300);
  const next: Company = {
    ...c,
    legalName: v('legalName') || c.legalName,
    tradeName: v('tradeName'),
    address: v('address'),
    postalCode: v('postalCode'),
    city: v('city'),
    region: v('region'),
    phone: v('phone'),
    fax: v('fax'),
    email: v('email'),
    whatsapp: v('whatsapp').replace(/[^\d+]/g, ''),
    registry: { mersis: v('mersis'), taxOffice: v('taxOffice'), taxNo: v('taxNo'), tradeRegistry: v('tradeRegistry'), representative: v('representative') },
  };
  setSetting('company', next);
  setSetting('stats', { ...stats(), countries: Number(v('countries')) || stats().countries, areaTotalM2: Number(v('areaTotalM2')) || stats().areaTotalM2 });
  audit(user.email, 'settings-company', 'company');
  revalidatePath('/', 'layout');
  redirect('/admin/settings/?ok=company');
}
async function saveRegions(fd: FormData) {
  'use server';
  const user = await requireUser(['admin']);
  const rs = regions().map((r) => ({ ...r, email: String(fd.get(`email_${r.key}`) || r.email).trim(), countries: String(fd.get(`countries_${r.key}`) || '').split(/[\s,]+/).filter((x) => /^[A-Z]{2}$/.test(x.toUpperCase())).map((x) => x.toUpperCase()) })) as Region[];
  setSetting('regions', rs);
  setSetting('crm', { webhookUrl: String(fd.get('webhookUrl') || '').trim(), provider: String(fd.get('provider') || 'none') });
  setSetting('publishGate', { requireOe: !!fd.get('requireOe'), requireImage: !!fd.get('requireImage') });
  setSetting('require2fa', !!fd.get('require2fa'));
  audit(user.email, 'settings-sales', 'regions');
  redirect('/admin/settings/?ok=sales');
}
async function addUser(fd: FormData) {
  'use server';
  const user = await requireUser(['admin']);
  const email = String(fd.get('email') || '').trim().toLowerCase();
  const pw = String(fd.get('password') || '');
  if (!email.includes('@') || pw.length < 12) redirect('/admin/settings/?err=user');
  db().prepare('insert or ignore into users(email, name, role, pass_hash, region, created_at) values(?,?,?,?,?,?)').run(email, String(fd.get('name') || ''), String(fd.get('role') || 'sales'), hashPassword(pw), String(fd.get('region') || ''), now());
  audit(user.email, 'user-add', email);
  redirect('/admin/settings/?ok=user');
}

export default async function Settings({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const user = await requireUser(['admin']);
  const sp = await searchParams;
  const c = company();
  const s = stats();
  const rs = regions();
  const crm = getSetting('crm', { webhookUrl: '', provider: 'none' });
  const gate = getSetting('publishGate', { requireOe: true, requireImage: true });
  const req2fa = getSetting('require2fa', true);
  const users = db().prepare('select id, email, name, role, region, totp_enabled, last_login_at from users order by id').all() as { id: number; email: string; name: string; role: string; region: string; totp_enabled: number; last_login_at: string | null }[];
  const F = ({ n, l, v, mono }: { n: string; l: string; v?: string | number; mono?: boolean }) => (
    <div className="field">
      <label htmlFor={n}>{l}</label>
      <input id={n} className={`input ${mono ? 'mono' : ''}`} name={n} defaultValue={v} />
    </div>
  );
  return (
    <Shell user={user} active="/admin/settings/">
      <div className="adm-head">
        <h1>Ayarlar</h1>
      </div>
      {sp.ok && <p className="flash">Kaydedildi.</p>}
      {sp.err && <p className="flash flash--err">Kaydedilemedi — alanları kontrol edin (parola en az 12 karakter).</p>}
      <form action={saveCompany} className="stack">
        <fieldset>
          <legend>Firma bilgileri (NAP — sitede, şemada ve profillerde harfi harfine aynı olmalı)</legend>
          {c && (c as Company & { _verify?: string })._verify && <p className="flash flash--err small">❓ {(c as Company & { _verify?: string })._verify}</p>}
          <div className="form-grid">
            <F n="legalName" l="Ticari unvan" v={c.legalName} />
            <F n="tradeName" l="Tam unvan (Impressum)" v={c.tradeName} />
            <F n="address" l="Adres" v={c.address} />
            <F n="postalCode" l="Posta kodu" v={c.postalCode} mono />
            <F n="city" l="İlçe" v={c.city} />
            <F n="region" l="İl" v={c.region} />
            <F n="phone" l="Telefon" v={c.phone} mono />
            <F n="fax" l="Faks" v={c.fax} mono />
            <F n="email" l="E-posta (görünür)" v={c.email} />
            <F n="whatsapp" l="WhatsApp (uluslararası, +90…)" v={c.whatsapp} mono />
            <F n="countries" l="İhracat ülke sayısı" v={s.countries} mono />
            <F n="areaTotalM2" l="Toplam alan (m²)" v={s.areaTotalM2} mono />
          </div>
        </fieldset>
        <fieldset>
          <legend>Yasal (Impressum — Almanca sürümde zorunlu)</legend>
          <div className="form-grid">
            <F n="representative" l="Yetkili" v={c.registry?.representative} />
            <F n="tradeRegistry" l="Ticaret sicil" v={c.registry?.tradeRegistry} />
            <F n="mersis" l="MERSİS" v={c.registry?.mersis} mono />
            <F n="taxOffice" l="Vergi dairesi" v={c.registry?.taxOffice} />
            <F n="taxNo" l="Vergi no." v={c.registry?.taxNo} mono />
          </div>
        </fieldset>
        <button className="btn btn--primary">Firma bilgilerini kaydet</button>
      </form>

      <form action={saveRegions} className="stack">
        <fieldset>
          <legend>Bölge satış sorumluları (talepler ülkeye göre atanır)</legend>
          {rs.map((r) => (
            <div key={r.key} className="form-grid">
              <div className="field">
                <label htmlFor={`email_${r.key}`}>{r.name} — rol adresi</label>
                <input id={`email_${r.key}`} className="input" name={`email_${r.key}`} defaultValue={r.email} />
              </div>
              <div className="field">
                <label htmlFor={`countries_${r.key}`}>Ülkeler</label>
                <input id={`countries_${r.key}`} className="input mono" name={`countries_${r.key}`} defaultValue={r.countries.join(' ')} />
              </div>
            </div>
          ))}
        </fieldset>
        <fieldset>
          <legend>CRM aktarımı (HubSpot / Pipedrive / Make / Zapier webhook)</legend>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="provider">Sağlayıcı</label>
              <select id="provider" className="select" name="provider" defaultValue={crm.provider}>
                <option value="none">Yok</option>
                <option value="hubspot">HubSpot</option>
                <option value="pipedrive">Pipedrive</option>
                <option value="webhook">Genel webhook</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="webhookUrl">Webhook adresi</label>
              <input id="webhookUrl" className="input mono" name="webhookUrl" defaultValue={crm.webhookUrl} placeholder="https://" />
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>Kurallar</legend>
          <label className="check">
            <input type="checkbox" name="requireOe" defaultChecked={gate.requireOe} /> OE numarası olmayan ürün yayına alınamaz
          </label>
          <label className="check">
            <input type="checkbox" name="requireImage" defaultChecked={gate.requireImage} /> Görseli olmayan ürün yayına alınamaz
          </label>
          <label className="check">
            <input type="checkbox" name="require2fa" defaultChecked={req2fa} /> Panelde iki adımlı doğrulama zorunlu
          </label>
        </fieldset>
        <button className="btn btn--primary">Satış ve kuralları kaydet</button>
      </form>

      <fieldset>
        <legend>Kullanıcılar</legend>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>E-posta</th>
                <th>Ad</th>
                <th>Rol</th>
                <th>Bölge</th>
                <th>2FA</th>
                <th>Son giriş</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{u.name}</td>
                  <td>{u.role}</td>
                  <td>{u.region}</td>
                  <td>{u.totp_enabled ? <span className="pill pill--ok">açık</span> : <span className="pill pill--warn">kurulmadı</span>}</td>
                  <td className="small muted">{u.last_login_at?.slice(0, 16).replace('T', ' ') ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form action={addUser} className="form-grid">
          <input className="input" name="email" type="email" placeholder="E-posta" required />
          <input className="input" name="name" placeholder="Ad Soyad" />
          <select className="select" name="role" defaultValue="sales">
            <option value="admin">Yönetici</option>
            <option value="editor">Editör (ürün, içerik)</option>
            <option value="sales">Satış (yalnız kendi bölgesi)</option>
          </select>
          <select className="select" name="region" defaultValue="">
            <option value="">Bölge yok</option>
            {rs.map((r) => (
              <option key={r.key} value={r.key}>
                {r.name}
              </option>
            ))}
          </select>
          <input className="input span-2" name="password" type="password" placeholder="Geçici parola (en az 12 karakter)" minLength={12} required autoComplete="new-password" />
          <button className="btn span-2">Kullanıcı ekle</button>
        </form>
      </fieldset>
    </Shell>
  );
}
