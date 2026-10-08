#!/usr/bin/env node
/** Yerel test: .env.local'deki ADMIN_SEED_TOTP_SECRET için anlık 6 haneli kod (yalnız geliştirme) */
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
const secret = process.argv[2] || readFileSync('.env.local', 'utf8').match(/^ADMIN_SEED_TOTP_SECRET=(.*)$/m)?.[1]?.trim();
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
let bits = '';
for (const ch of secret) bits += B32.indexOf(ch).toString(2).padStart(5, '0');
const key = Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
const msg = Buffer.alloc(8);
msg.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
const h = createHmac('sha1', key).update(msg).digest();
const o = h[h.length - 1] & 0xf;
console.log(((h.readUInt32BE(o) & 0x7fffffff) % 1e6).toString().padStart(6, '0'));
