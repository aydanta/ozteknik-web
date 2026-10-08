import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { mkdirSync, readFileSync } from 'node:fs';

/**
 * Tek veri kaynağı (PIM yerine geçen hafif katman). Site, akışlar (feeds), llms.txt ve panel buradan okur.
 * Üretimde Postgres/Turso'ya taşınabilir: tüm SQL bu dosyada ve lib/catalog.ts, lib/leads.ts'de.
 */
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'data', 'ozteknik.db');


declare global {
  // eslint-disable-next-line no-var
  var __oz_db: DatabaseSync | undefined;
}

export function db(): DatabaseSync {
  if (!globalThis.__oz_db) {
    mkdirSync(path.dirname(DB_PATH), { recursive: true });
    // timeout: derleme işçileri ve çalışan sunucu aynı dosyayı açar; kilitte hemen hata yerine bekle
    const d = new DatabaseSync(DB_PATH, { timeout: 15000 });
    // şema ve WAL yalnız gerekiyorsa (her açılışta yazma kilidi istemesin)
    const ready = d.prepare(`select count(*) n from sqlite_master where type = 'table' and name in ('products','refs','leads','settings')`).get() as { n: number };
    if (ready.n < 4) d.exec(readFileSync(path.join(process.cwd(), 'lib', 'schema.sql'), 'utf8'));
    else if ((d.prepare('pragma journal_mode').get() as { journal_mode: string }).journal_mode !== 'wal') d.exec('pragma journal_mode = wal');
    d.exec('pragma foreign_keys = on');
    globalThis.__oz_db = d;
  }
  return globalThis.__oz_db;
}

export const now = () => new Date().toISOString();

export function getSetting<T = string>(key: string, fallback: T): T {
  const row = db().prepare('select value from settings where key = ?').get(key) as { value: string } | undefined;
  if (!row) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

export function setSetting(key: string, value: unknown) {
  db()
    .prepare('insert into settings(key, value) values(?, ?) on conflict(key) do update set value = excluded.value')
    .run(key, JSON.stringify(value));
}

export function audit(userEmail: string, action: string, entity: string, detail = '') {
  db().prepare('insert into audit(at, user_email, action, entity, detail) values(?,?,?,?,?)').run(now(), userEmail, action, entity, detail);
}

/** Katalog sürümü — panel her yazışta artırır; bellek içi arama dizini buna bakıp yenilenir. */
export function catalogVersion(): number {
  return getSetting<number>('catalog_version', 0);
}
export function bumpCatalogVersion() {
  setSetting('catalog_version', catalogVersion() + 1);
}
