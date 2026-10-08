'use client';
import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import LeadForm, { type Field, type FormText } from '@/components/forms/LeadForm';
import { useQuote, hydrateQuote } from './store';
import { productHref } from '@/lib/links';
import type { Locale } from '@/lib/i18n';

interface Info {
  slug: string;
  code: string;
  brand: string;
  brandKey: string;
  type: string;
  oe: string;
  image: string | null;
}

export default function QuoteList({ lang, t, fields, formText, catalogueHref, searchHref }: { lang: Locale; t: Record<string, string>; fields: Field[]; formText: FormText; catalogueHref: string; searchHref: string }) {
  const { items, setQty, remove, clear } = useQuote();
  const [info, setInfo] = useState<Record<string, Info>>({});
  const [ready, setReady] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  useEffect(() => {
    hydrateQuote();
    setReady(true);
  }, []);
  useEffect(() => {
    const slugs = items.map((i) => i.slug).filter((s): s is string => !!s && !info[s]);
    if (!slugs.length) return;
    fetch('/api/quote-items/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slugs, lang }) })
      .then((r) => r.json())
      .then((j: { items: Info[] }) => setInfo((cur) => ({ ...cur, ...Object.fromEntries(j.items.map((x) => [x.slug, x])) })));
  }, [items, lang, info]);

  if (!ready) return <p className="muted">…</p>;
  if (doneId)
    return (
      <div className="alert alert--ok" role="status" style={{ fontSize: 16 }}>
        <Icon name="check" /> {t.success.replace('{id}', doneId)}
      </div>
    );
  if (!items.length)
    return (
      <div className="empty">
        <Icon name="clipboard" size={32} />
        <p>
          <b>{t.empty}</b>
          <br />
          {t.emptyHint}
        </p>
        <div className="row">
          <a className="btn btn--primary" href={catalogueHref}>
            {t.catalogue}
          </a>
          <a className="btn" href={searchHref}>
            {t.multiSearch}
          </a>
        </div>
      </div>
    );

  return (
    <div className="split" style={{ alignItems: 'start' }}>
      <div className="stack">
        <div className="table-wrap">
          <table className="table">
            <caption className="sr-only">{t.title}</caption>
            <thead>
              <tr>
                <th scope="col">{t.code}</th>
                <th scope="col">{t.product}</th>
                <th scope="col">{t.qty}</th>
                <th scope="col">
                  <span className="sr-only">{t.remove}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => {
                const x = i.slug ? info[i.slug] : undefined;
                return (
                  <tr key={i.code}>
                    <td>
                      {i.slug ? (
                        <a className="mono" href={productHref(lang, i.slug)} style={{ fontWeight: 600 }}>
                          {i.code}
                        </a>
                      ) : (
                        <span className="mono">{i.code}</span>
                      )}
                      {i.note && i.note !== 'unmatched' && i.note !== i.code && <div className="small muted mono">← {i.note}</div>}
                    </td>
                    <td>
                      {x ? (
                        <span className="row" style={{ gap: 10, flexWrap: 'nowrap' }}>
                          {x.image && <img src={x.image} alt="" width={56} height={42} style={{ width: 56, height: 42, objectFit: 'contain', background: '#fff', borderRadius: 6 }} />}
                          <span>
                            <span className={`badge badge--${x.brandKey}`}>{x.brand}</span> {x.type}
                            <br />
                            <span className="small muted mono">{x.oe}</span>
                          </span>
                        </span>
                      ) : (
                        <span className="small muted">{i.slug ? '…' : t.unknownCode}</span>
                      )}
                    </td>
                    <td>
                      <input
                        className="input mono"
                        type="number"
                        min={1}
                        max={99999}
                        value={i.qty}
                        onChange={(e) => setQty(i.code, Number(e.target.value))}
                        aria-label={`${t.qty} ${i.code}`}
                        style={{ width: 96, minHeight: 38 }}
                      />
                    </td>
                    <td>
                      <button type="button" className="icon-btn" onClick={() => remove(i.code)} aria-label={`${t.remove} ${i.code}`}>
                        <Icon name="trash" size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="muted small">{t.items.replace('{n}', String(items.length))}</span>
          <button type="button" className="btn btn--sm btn--ghost" onClick={() => clear()}>
            {t.clear}
          </button>
        </div>
      </div>
      <div className="card stack">
        <h2 className="h2">{t.formTitle}</h2>
        <p className="small muted">{t.note}</p>
        <LeadForm
          type="quote"
          lang={lang}
          fields={fields}
          t={{ ...formText, submit: t.submit }}
          getExtra={() => ({ items: JSON.stringify(items.map((i) => ({ code: i.code, slug: i.slug, qty: i.qty }))) })}
          event="quote_submit"
          onDone={(id) => {
            setDoneId(id);
            clear();
          }}
        />
      </div>
    </div>
  );
}
