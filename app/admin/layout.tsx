import type { Metadata } from 'next';
import { Archivo, Inter, JetBrains_Mono } from 'next/font/google';
import '../styles/tokens.css';
import '../styles/base.css';
import './admin.css';

const archivo = Archivo({ subsets: ['latin', 'latin-ext'], axes: ['wdth'], variable: '--f-archivo' });
const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--f-inter' });
const mono = JetBrains_Mono({ subsets: ['latin', 'latin-ext'], variable: '--f-mono' });

export const metadata: Metadata = { title: { default: 'Özteknik Panel', template: '%s · Özteknik Panel' }, robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${archivo.variable} ${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
