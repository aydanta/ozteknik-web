'use client';
import { useActionState } from 'react';
import { login, verify2fa } from './actions';

export default function LoginForm({ step, next }: { step: 'password' | '2fa'; next: string }) {
  const [state, action, pending] = useActionState(step === '2fa' ? verify2fa : login, null as { error?: string } | null);
  return (
    <form action={action} className="stack">
      <input type="hidden" name="next" value={next} />
      {step === 'password' ? (
        <>
          <div className="field">
            <label htmlFor="email">E-posta</label>
            <input id="email" className="input" name="email" type="email" autoComplete="username" required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="password">Parola</label>
            <input id="password" className="input" name="password" type="password" autoComplete="current-password" required />
          </div>
        </>
      ) : (
        <div className="field">
          <label htmlFor="code">Doğrulama kodu (kimlik doğrulayıcı uygulama)</label>
          <input id="code" className="input mono" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" required autoFocus />
        </div>
      )}
      {state?.error && (
        <p className="alert alert--err" role="alert">
          {state.error}
        </p>
      )}
      <button className="btn btn--primary btn--lg" disabled={pending}>
        {pending ? '…' : step === '2fa' ? 'Doğrula' : 'Giriş yap'}
      </button>
    </form>
  );
}
