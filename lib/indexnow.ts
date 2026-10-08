import { SITE_URL } from './seo';

/** IndexNow: yeni/güncellenen adresi dakikalar içinde Bing ve Yandex'e bildirir (ChatGPT araması Bing dizinini kullanır) */
export async function indexNow(paths: string[]) {
  const key = process.env.INDEXNOW_KEY;
  if (!key || process.env.SITE_ENV === 'staging' || !paths.length) return { skipped: true };
  const host = new URL(SITE_URL).host;
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key, keyLocation: `${SITE_URL}/${key}.txt`, urlList: paths.slice(0, 10000).map((p) => `${SITE_URL}${p}`) }),
      signal: AbortSignal.timeout(10000),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
