import type { NextConfig } from 'next';

/**
 * Güvenlik başlıkları (şartname §"Yasal, güvenlik ve uyum"): HTTPS/HSTS, CSP, X-Frame-Options.
 * CSP'de script-src 'unsafe-inline' Next'in satır içi önyükleme betikleri ve JSON-LD için;
 * canlıda nonce'a geçilecek (README → "Yayın öncesi").
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://ozteknikoto.com https://i.ytimg.com https://www.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self'",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com",
  "frame-src https://www.youtube-nocookie.com https://www.google.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const security = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
];

const config: NextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  skipTrailingSlashRedirect: true, // proxy.ts eski adres + eğik çizgiyi tek adımda çözer
  poweredByHeader: false,
  // ürün görselleri /media yolundan kendi dönüştürücümüzle (sharp) servis edilir: sabit adres + AVIF/WebP + 400/800/1600/2400
  images: { unoptimized: true },
  experimental: { globalNotFound: true },
  outputFileTracingIncludes: { '/**': ['./lib/schema.sql', './data/redirects.json'] },
  async headers() {
    return [
      { source: '/:path*', headers: security },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'no-store' }] },
      { source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex' }] },
      { source: '/models/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/brand/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }] },
    ];
  },
  async redirects() {
    // Marka alan adları → ana site (şartname §"Taşıma ve 301"); tek adım
    const hosts: [string, string][] = [
      ['egerot.com', '/en/egerot/'],
      ['www.egerot.com', '/en/egerot/'],
      ['revolclutch.com', '/en/revol/'],
      ['www.revolclutch.com', '/en/revol/'],
      ['hydcab.com', '/en/hydcab/'],
      ['www.hydcab.com', '/en/hydcab/'],
      ['lenkstark.com', '/ru/'],
      ['www.lenkstark.com', '/ru/'],
      ['www.ozteknikoto.com', ''],
    ];
    return hosts.map(([host, dest]) => ({
      source: '/:path*',
      has: [{ type: 'host' as const, value: host }],
      destination: dest ? `https://ozteknikoto.com${dest}` : 'https://ozteknikoto.com/:path*',
      permanent: true,
    }));
  },
};

export default config;
