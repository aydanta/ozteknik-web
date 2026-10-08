import { readFileSync } from 'node:fs';
import path from 'node:path';

/** Mevcut sitedeki onaylı yasal metin (EN/TR) — hukuk onayıyla güncellenecek. "## " başlık, "• " madde. */
export default function LegalText({ name, lang }: { name: 'privacy' | 'cookies'; lang: 'en' | 'tr' }) {
  const raw = readFileSync(path.join(process.cwd(), 'content', 'legal', `${name}.${lang}.txt`), 'utf8');
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) blocks.push(<ul key={blocks.length}>{list.map((l, i) => <li key={i}>{l}</li>)}</ul>);
    list = [];
  };
  for (const line of raw.split('\n')) {
    if (line.startsWith('# ')) continue;
    if (line.startsWith('• ')) {
      list.push(line.slice(2));
      continue;
    }
    flush();
    if (line.startsWith('## ')) blocks.push(<h2 key={blocks.length}>{line.slice(3)}</h2>);
    else if (line.trim()) blocks.push(<p key={blocks.length}>{line}</p>);
  }
  flush();
  return <div className="prose legal">{blocks}</div>;
}
