'use server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db, now, audit } from '@/lib/db';
import { createSession, currentSession, markMfa, noteFail, tooMany, verifyPassword, verifyTotp } from '@/lib/auth';

export async function login(_: unknown, fd: FormData) {
  const email = String(fd.get('email') || '').trim().toLowerCase();
  const pw = String(fd.get('password') || '');
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0] || 'local';
  const key = `${ip}|${email}`;
  if (tooMany(key)) return { error: 'Çok fazla deneme. 15 dakika sonra tekrar deneyin.' };
  const u = db().prepare('select id, pass_hash, totp_enabled from users where email = ?').get(email) as { id: number; pass_hash: string; totp_enabled: number } | undefined;
  if (!u || !verifyPassword(pw, u.pass_hash)) {
    noteFail(key);
    return { error: 'E-posta ya da parola hatalı.' };
  }
  await createSession(u.id, false);
  db().prepare('update users set last_login_at = ? where id = ?').run(now(), u.id);
  audit(email, 'login', 'user', ip);
  const next = String(fd.get('next') || '/admin/');
  redirect(u.totp_enabled ? `/admin/login/?step=2fa&next=${encodeURIComponent(next)}` : next.startsWith('/admin') ? next : '/admin/');
}

export async function verify2fa(_: unknown, fd: FormData) {
  const s = await currentSession();
  if (!s) redirect('/admin/login/');
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0] || 'local';
  const key = `2fa|${ip}|${s.user.email}`;
  if (tooMany(key)) return { error: 'Çok fazla deneme. 15 dakika sonra tekrar deneyin.' };
  if (!s.user.totp_secret || !verifyTotp(s.user.totp_secret, String(fd.get('code') || ''))) {
    noteFail(key);
    return { error: 'Kod geçersiz.' };
  }
  await markMfa();
  const next = String(fd.get('next') || '/admin/');
  redirect(next.startsWith('/admin') ? next : '/admin/');
}
