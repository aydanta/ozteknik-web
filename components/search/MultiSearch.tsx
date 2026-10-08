'use client';
import { useState } from 'react';
import Icon from '@/components/Icon';
import { useQuote, hydrateQuote } from '@/components/quote/store';
import { productHref } from '@/lib/links';
import { track } from '@/components/layout/ClientChrome';
import type { Locale } from '@/lib/i18n';
import type { ApiHit } from './SearchPalette';

interface Row {
  line: number;
  input: string;
  qty: number;
  status: 'matched' | 'multiple' | 'fuzzy' | 'none';
  hits: ApiHit[];
}

/** .xlsx → düz metin (ilk sayfa, A ve B sütunları). fflate ile tarayıcıda açılır; sunucuya dosya gitmez. */
async function readXlsx(file: File): Promise<string> {
  const { unzipSync, strFromU8 } = await import('fflate');
  const z = unzipSync(new Uint8Array(await file.arrayBuffer()));
  const shared: string[] = [];
  const ss = z['xl/sharedStrings.xml'] ? strFromU8(z['xl/sharedStrings.xml']) : '';
  for (const si of ss.match(/<si>[\s\S]*?<\/si>/g) || []) shared.push((si.match(/<t[^>]*>([\s\S]*?)<\/t>/g) || []).map((x) => x.replace(/<[^>]+>/g, '')).join(''));
  const sheetName = Object.keys(z).find((k) => /^xl\/worksheets\/sheet1\.xml$/.test(k)) ?? Object.keys(z).find((k) => k.startsWith('xl/worksheets/sheet'));
  if (!sheetName) return '';
  const xml = strFromU8(z[sheetName]);
  const lines: string[] = [];
  for (const row of xml.match(/<row[\s\S]*?<\/row>/g) || []) {
    const cells: Record<string, string> = {};
    for (const c of row.match(/<c [\s\S]*?(?:\/>|<\/c>)/g) || []) {
      const ref = c.match(/r="([A-Z]+)\d+"/)?.[1] ?? '';
      const typ = c.match(/t="(\w+)"/)?.[1];
      let v = c.match(/<v>([\s\S]*?)<\/v>/)?.[1] ?? c.match(/<t[^>]*>([\s\S]*?)<\/t>/)?.[1] ?? '';
      if (typ === 's') v = shared[Number(v)] ?? '';
      cells[ref] = v.replace(/&amp;/g, '&').trim();
    }
    const a = cells.A ?? '';
    const b = cells.B ?? '';
    if (a) lines.push(b ? `${a}\t${b}` : a);
  }
  return lines.join('\n');
}

export default function MultiSearch({ lang, t }: { lang: Locale; t: Record<string, string> }) {
  const [text, setText] = useState('');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [choice, setChoice] = useState<Record<number, string>>({});
  const addMany = useQuote((s) => s.addMany);
  const lines = text.split(/\r?\n/).filter((l) => l.trim()).length;

  async function run() {
    setBusy(true);
    setAdded(false);
    try {
      const r = await fetch('/api/search/multi/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, lang }) });
      const j = await r.json();
      setRows(j.rows);
      track('multi_search', { lines: j.rows.length });
    } finally {
      setBusy(false);
    }
  }
  async function onFile(f: File | undefined) {
    if (!f) return;
    const s = /\.xlsx$/i.test(f.name) ? await readXlsx(f) : await f.text();
    setText(s.split(/\r?\n/).slice(0, 200).join('\n'));
  }
  const pick = (r: Row) => r.hits.find((h) => h.slug === choice[r.line]) ?? (r.status === 'matched' || r.status === 'multiple' || r.status === 'fuzzy' ? r.hits[0] : undefined);
  const sum = rows ? { matched: rows.filter((r) => r.status === 'matched').length, multiple: rows.filter((r) => r.status === 'multiple').length, fuzzy: rows.filter((r) => r.status === 'fuzzy').length, none: rows.filter((r) => r.status === 'none').length } : null;

  function addAll() {
    hydrateQuote();
    if (!rows) return;
    const items = rows
      .map((r) => {
        const h = r.status === 'none' ? undefined : pick(r);
        return h ? { slug: h.slug, code: h.code, qty: r.qty, note: r.input } : { slug: null, code: r.input, qty: r.qty, note: 'unmatched' };
      })
      .filter((x) => x.slug || x.code);
    addMany(items);
    setAdded(true);
    track('quote_add_multi', { n: items.length });
  }

  return (
    <div className="multi">
      <div className="stack">
        <label htmlFor="multi-text" className="label">
          {t.multiTitle} · <span className="mono">{t.lines.replace('{n}', String(lines))}</span>
        </label>
        <textarea id="multi-text" className="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder={t.multiPlaceholder} spellCheck={false} />
        <div className="row">
          <button type="button" className="btn btn--primary" onClick={run} disabled={!lines || busy}>
            <Icon name="search" size={16} /> {busy ? '…' : t.run}
          </button>
          <label className="btn" style={{ cursor: 'pointer' }}>
            <Icon name="upload" size={16} /> {t.upload}
            <input type="file" accept=".xlsx,.csv,.txt" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          </label>
        </div>
      </div>
      <div className="stack" aria-live="polite">
        {sum && rows && (
          <>
            <div className="summary-chips">
              <span className="chip status status--matched">
                {t.matched}: {sum.matched}
              </span>
              <span className="chip status status--multiple">
                {t.multiple}: {sum.multiple}
              </span>
              <span className="chip status status--fuzzy">
                {t.fuzzy}: {sum.fuzzy}
              </span>
              <span className="chip status status--none">
                {t.none}: {sum.none}
              </span>
            </div>
            <div className="table-wrap" style={{ maxHeight: 520, overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t.input}</th>
                    <th>{t.qty}</th>
                    <th>{t.result}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const h = pick(r);
                    return (
                      <tr key={r.line}>
                        <td className="mono small muted">{r.line}</td>
                        <td>
                          <span className="mono">{r.input}</span>
                          <br />
                          <span className={`status status--${r.status}`}>{t[r.status]}</span>
                        </td>
                        <td className="mono">{r.qty}</td>
                        <td>
                          {r.status === 'none' ? (
                            <a className="link small" href={`${t.notFoundHref}?number=${encodeURIComponent(r.input)}`}>
                              {t.sendNumber}
                            </a>
                          ) : r.hits.length > 1 ? (
                            <select className="select mono" value={h?.slug} onChange={(e) => setChoice({ ...choice, [r.line]: e.target.value })} aria-label={t.result}>
                              {r.hits.map((x) => (
                                <option key={x.slug} value={x.slug}>
                                  {x.code} — {x.categoryName}
                                </option>
                              ))}
                            </select>
                          ) : h ? (
                            <a className="mono" href={productHref(lang, h.slug)} target="_blank" rel="noopener">
                              {h.code}
                            </a>
                          ) : null}
                          {h && <div className="small muted">{h.categoryName}</div>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="row">
              <button type="button" className="btn btn--primary" onClick={addAll}>
                <Icon name="plus" size={16} /> {t.addMatched.replace('{n}', String(rows.length))}
              </button>
              {added && (
                <a className="link" href={t.quoteHref}>
                  {t.quoteList} →
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
