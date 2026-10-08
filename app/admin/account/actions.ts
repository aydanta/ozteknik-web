'use server';
import { redirect } from 'next/navigation';
import { db, audit } from '@/lib/db';
import { requireUser, verifyTotp, markMfa, verifyPassword, hashPassword } from '@/lib/auth';

export async function setup2fa(fd: FormData) {
  const user = await requireUser(undefined, { allowSetup: true });
  const secret = user.totp_secret ?? '';
  if (!/^[A-Z2-7]{32}$/.test(secret) || !verifyTotp(secret, String(fd.get('code') || ''))) redirect(`/admin/account/?setup=2fa&err=${encodeURIComponent('Kod doğrulanamadı, tekrar deneyin.')}`);
  db().prepare('update users set totp_enabled = 1 where id = ?').run(user.id);
  await markMfa();
  audit(user.email, '2fa-enabled', 'user');
  redirect(`/admin/account/?ok=${encodeURIComponent('İki adımlı doğrulama etkin.')}`);
}

export async function changePassword(fd: FormData) {
  const user = await requireUser(undefined, { allowSetup: true });
  const row = db().prepare('select pass_hash from users where id = ?').get(user.id) as { pass_hash: string };
  const next = String(fd.get('next') || '');
  if (!verifyPassword(String(fd.get('current') || ''), row.pass_hash) || next.length < 12) redirect(`/admin/account/?err=${encodeURIComponent('Parola değiştirilemedi.')}`);
  db().prepare('update users set pass_hash = ? where id = ?').run(hashPassword(next), user.id);
  audit(user.email, 'password-changed', 'user');
  redirect(`/admin/account/?ok=${encodeURIComponent('Parola güncellendi.')}`);
}
