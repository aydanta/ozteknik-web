import type { Metadata } from 'next';
import { Archivo, Inter } from 'next/font/google';
import './styles/tokens.css';
import './styles/base.css';
import './styles/pages.css';
import NotFoundView from '@/components/NotFoundView';

const archivo = Archivo({ subsets: ['latin', 'latin-ext'], axes: ['wdth'], variable: '--f-archivo' });
const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--f-inter' });

export const metadata: Metadata = { title: 'Page not found | Özteknik', robots: { index: false } };

/** Hiçbir rotayla eşleşmeyen adresler (dil öneksiz eski adresler dahil) — İngilizce 404 */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable}`}>
      <body>
        <main id="main">
          <div className="wrap" style={{ paddingTop: 32 }}>
            <a href="/en/">
              <img src="/brand/ozteknik-logo.svg" alt="Özteknik" width={164} height={17} />
            </a>
          </div>
          <NotFoundView forceLang="en" />
        </main>
      </body>
    </html>
  );
}
