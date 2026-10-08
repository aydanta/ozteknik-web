import LoginForm from './LoginForm';

export const metadata = { title: 'Giriş' };
export default async function Login({ searchParams }: { searchParams: Promise<{ step?: string; next?: string }> }) {
  const sp = await searchParams;
  const step = sp.step === '2fa' ? '2fa' : 'password';
  return (
    <main className="login">
      <div className="card">
        <img src="/brand/ozteknik-logo.svg" alt="Özteknik" width={164} height={17} />
        <h1 className="h2">{step === '2fa' ? 'İki adımlı doğrulama' : 'Yönetim paneli'}</h1>
        <LoginForm step={step} next={sp.next && sp.next.startsWith('/admin') ? sp.next : '/admin/'} />
        <p className="small muted">Yetkisiz erişim denemeleri kaydedilir.</p>
      </div>
    </main>
  );
}
