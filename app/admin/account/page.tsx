import Shell from '@/components/admin/Shell';
import { requireUser, newTotpSecret, otpauthUri } from '@/lib/auth';
import { db } from '@/lib/db';
import { setup2fa, changePassword } from './actions';

export const metadata = { title: 'Hesabım' };
export default async function Account({ searchParams }: { searchParams: Promise<{ setup?: string; ok?: string; err?: string }> }) {
  const user = await requireUser(undefined, { allowSetup: true });
  const sp = await searchParams;
  // bekleyen anahtar kullanıcı kaydında tutulur: sayfa yenilense de değişmez, formdan gelmez
  let secret = user.totp_secret ?? '';
  if (!user.totp_enabled && !/^[A-Z2-7]{32}$/.test(secret)) {
    secret = newTotpSecret();
    db().prepare('update users set totp_secret = ? where id = ? and totp_enabled = 0').run(secret, user.id);
  }
  return (
    <Shell user={user} active="/admin/account/">
      <div className="adm-head">
        <h1>Hesabım</h1>
      </div>
      {sp.setup === '2fa' && !user.totp_enabled && <p className="flash flash--err">Panel kullanılmadan önce iki adımlı doğrulama (2FA) kurulmalıdır.</p>}
      {sp.ok && <p className="flash">{sp.ok}</p>}
      {sp.err && <p className="flash flash--err">{sp.err}</p>}
      <div className="adm-grid">
        <fieldset>
          <legend>İki adımlı doğrulama (TOTP)</legend>
          {user.totp_enabled ? (
            <p className="pill pill--ok">Etkin</p>
          ) : (
            <form action={setup2fa} className="stack">
              <p className="small muted">Google Authenticator, Microsoft Authenticator ya da 1Password gibi bir uygulamada "anahtarı elle gir" seçeneğiyle aşağıdaki anahtarı ekleyin, uygulamanın ürettiği 6 haneli kodu yazın.</p>
              <p className="code" style={{ fontSize: 15, letterSpacing: '0.08em' }}>
                {secret.match(/.{1,4}/g)!.join(' ')}
              </p>
              <a className="link small" href={otpauthUri(user.email, secret)}>
                Bu cihazdaki doğrulayıcı uygulamada aç (otpauth://)
              </a>
              <div className="field">
                <label htmlFor="code">Doğrulama kodu</label>
                <input id="code" className="input mono" name="code" inputMode="numeric" required style={{ maxWidth: 200 }} />
              </div>
              <button className="btn btn--primary">2FA'yı etkinleştir</button>
            </form>
          )}
        </fieldset>
        <fieldset>
          <legend>Parola değiştir</legend>
          <form action={changePassword} className="stack">
            <div className="field">
              <label htmlFor="cur">Mevcut parola</label>
              <input id="cur" className="input" name="current" type="password" required autoComplete="current-password" />
            </div>
            <div className="field">
              <label htmlFor="np">Yeni parola (en az 12 karakter)</label>
              <input id="np" className="input" name="next" type="password" minLength={12} required autoComplete="new-password" />
            </div>
            <button className="btn">Kaydet</button>
          </form>
        </fieldset>
      </div>
    </Shell>
  );
}
