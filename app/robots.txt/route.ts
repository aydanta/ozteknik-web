import { SITE_URL, IS_STAGING } from '@/lib/seo';

/**
 * GEO §1 — yapay zekâ botlarına açık erişim (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot,
 * PerplexityBot, Google-Extended, Bingbot). Cloudflare'de "AI botlarını engelle" kapalı olmalı (panelden doğrulanır).
 */
export function GET() {
  const body = IS_STAGING
    ? 'User-agent: *\nDisallow: /\n'
    : [
        '# Özteknik — ozteknikoto.com',
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin/',
        'Disallow: /api/',
        'Disallow: /*/for/',
        'Disallow: /*/b2b-portal/',
        '',
        ...['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Bingbot', 'Applebot-Extended'].flatMap((b) => [
          `User-agent: ${b}`,
          'Allow: /',
          'Disallow: /admin/',
          'Disallow: /api/',
          '',
        ]),
        `Sitemap: ${SITE_URL}/sitemap.xml`,
        '',
      ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } });
}
