import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db, now, getSetting } from './db';

/**
 * Yönetim paneli kimlik doğrulama — şartname §Güvenlik: "yönetim paneline iki faktörlü giriş".
 *  - Parola: scrypt (N=16384) + tuz
 *  - Oturum: rastgele belirteç; veritabanında yalnız SHA-256 özeti tutulur; httpOnly + SameSite=Lax çerez, 12 saat
 *  - 2FA: TOTP (RFC 6238, 30 sn, 6 hane) — kurulmadan panel kullanılamaz (ayar: require2fa)
 *  - Deneme sınırı: IP+e-posta başına 15 dakikada 5 hatalı giriş
 */
export type Role = 'admin' | 'editor' | 'sales';
export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  totp_enabled: number;
  totp_secret: string | null;
  region: string;
}
const COOKIE = 'oz_admin';
const sha = (s: string) => createHash('sha256').update(s).digest('hex');

export function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$${salt.toString('base64')}$${hash.toString('base64')}`;
}
export function verifyPassword(pw: string, stored: string) {
  const [alg, n, salt, hash] = stored.split('$');
  if (alg !== 'scrypt') return false;
  const want = Buffer.from(hash, 'base64');
  const got = scryptSync(pw, Buffer.from(salt, 'base64'), want.length, { N: Number(n), r: 8, p: 1 });
  return timingSafeEqual(want, got);
}

/* ---------------- TOTP ---------------- */
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function newTotpSecret() {
  const bytes = randomBytes(20);
  let bits = '';
  for (const b of bytes) bits += b.toString(2).padStart(8, '0');
  let out = '';
  for (let i = 0; i + 5 <= bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5), 2)];
  return out;
}
function b32decode(s: string) {
  let bits = '';
  for (const ch of s.replace(/=+$/, '').toUpperCase()) bits += B32.indexOf(ch).toString(2).padStart(5, '0');
  const out = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(out);
}
export function totp(secret: string, step = Math.floor(Date.now() / 30000)) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(step));
  const h = createHmac('sha1', b32decode(secret)).update(msg).digest();
  const o = h[h.length - 1] & 0xf;
  const code = ((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000).toString().padStart(6, '0');
  return code;
}
export function verifyTotp(secret: string, code: string) {
  const c = code.replace(/\s/g, '');
  const step = Math.floor(Date.now() / 30000);
  return [-1, 0, 1].some((d) => totp(secret, step + d) === c);
}
export const otpauthUri = (email: string, secret: string) => `otpauth://totp/${encodeURIComponent(`Özteknik Panel:${email}`)}?secret=${secret}&issuer=${encodeURIComponent('Özteknik')}&period=30&digits=6`;

/* ---------------- deneme sınırı ---------------- */
const fails = new Map<string, number[]>();
export function tooMany(key: string) {
  const t = Date.now();
  const arr = (fails.get(key) || []).filter((x) => t - x < 15 * 60_000);
  fails.set(key, arr);
  return arr.length >= 5;
}
export const noteFail = (key: string) => fails.set(key, [...(fails.get(key) || []), Date.now()]);

/* ---------------- oturum ---------------- */
export async function createSession(userId: number, mfaOk: boolean) {
  const token = randomBytes(32).toString('base64url');
  const exp = new Date(Date.now() + 12 * 3600_000).toISOString();
  db().prepare('insert into sessions(token, user_id, created_at, expires_at, mfa_ok) values(?,?,?,?,?)').run(sha(token), userId, now(), exp, mfaOk ? 1 : 0);
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 12 * 3600 });
}
export async function markMfa() {
  const tok = (await cookies()).get(COOKIE)?.value;
  if (tok) db().prepare('update sessions set mfa_ok = 1 where token = ?').run(sha(tok));
}
export async function destroySession() {
  const c = await cookies();
  const tok = c.get(COOKIE)?.value;
  if (tok) db().prepare('delete from sessions where token = ?').run(sha(tok));
  c.delete(COOKIE);
}

export async function currentSession(): Promise<{ user: User; mfaOk: boolean } | null> {
  const tok = (await cookies()).get(COOKIE)?.value;
  if (!tok) return null;
  const row = db()
    .prepare(
      `select u.id, u.email, u.name, u.role, u.totp_enabled, u.totp_secret, u.region, s.mfa_ok, s.expires_at
       from sessions s join users u on u.id = s.user_id where s.token = ?`,
    )
    .get(sha(tok)) as (User & { mfa_ok: number; expires_at: string }) | undefined;
  if (!row || row.expires_at < now()) return null;
  const { mfa_ok, expires_at, ...user } = row;
  void expires_at;
  return { user, mfaOk: !!mfa_ok };
}

/** Her panel sayfası ve sunucu eylemi bunu çağırır (proxy kontrolü yalnız iyimser) */
export async function requireUser(roles?: Role[], opts: { allowSetup?: boolean } = {}): Promise<User> {
  const s = await currentSession();
  if (!s) redirect('/admin/login/');
  if (s.user.totp_enabled && !s.mfaOk) redirect('/admin/login/?step=2fa');
  const require2fa = getSetting<boolean>('require2fa', true);
  if (require2fa && !s.user.totp_enabled && !opts.allowSetup) redirect('/admin/account/?setup=2fa');
  if (roles && !roles.includes(s.user.role)) redirect('/admin/?denied=1');
  return s.user;
}
