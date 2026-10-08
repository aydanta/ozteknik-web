'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Icon from '@/components/Icon';
import { countryOptions } from '@/lib/countries';
import { track } from '@/components/layout/ClientChrome';

export interface Field {
  name: string;
  label: string;
  kind: 'text' | 'email' | 'tel' | 'url' | 'number' | 'country' | 'textarea' | 'select' | 'chips' | 'file';
  required?: boolean;
  options?: { value: string; label: string }[];
  span?: 2;
  placeholder?: string;
  defaultValue?: string;
  accept?: string;
  autoComplete?: string;
}
export interface FormText {
  submit: string;
  sending: string;
  ok: string;
  errRequired: string;
  errEmail: string;
  errConsent: string;
  errGeneric: string;
  errRate: string;
  consent: string; // "{privacy}" yer tutuculu
  privacy: string;
  privacyHref: string;
  required: string;
}

/**
 * Genel form: hata, başarı, gönderiliyor durumları; hatalar metinle bildirilir (WCAG 2.2 AA).
 * JS yokken de çalışır? — Hayır: uç JSON döner; JS gerektiren tek akış formlardır, bu yüzden
 * her sayfada görünür e-posta adresi de bulunur (şartname: "görünür e-posta").
 */
export default function LeadForm({
  type,
  lang,
  fields,
  t,
  hidden = {},
  getExtra,
  event,
  onDone,
}: {
  type: string;
  lang: string;
  fields: Field[];
  t: FormText;
  hidden?: Record<string, string>;
  getExtra?: () => Record<string, string>;
  event?: string;
  onDone?: (id: string) => void;
}) {
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  const started = useRef(Date.now());
  const countries = useMemo(() => countryOptions(lang), [lang]);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    started.current = Date.now();
  }, []);

  const [pre, post] = t.consent.split('{privacy}');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const errs: Record<string, string> = {};
    for (const f of fields) {
      const v = fd.getAll(f.name).filter((x) => (typeof x === 'string' ? x.trim() : (x as File).size));
      if (f.required && !v.length) errs[f.name] = t.errRequired;
      if (f.kind === 'email' && v.length && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v[0]))) errs[f.name] = t.errEmail;
    }
    if (!fd.get('consent')) errs.consent = t.errConsent;
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(errs)[0]}"]`);
      first?.focus();
      return;
    }
    fd.set('type', type);
    fd.set('lang', lang);
    fd.set('t', String(Date.now() - started.current));
    fd.set('source', window.location.pathname);
    for (const [k, v] of Object.entries({ ...hidden, ...(getExtra?.() ?? {}) })) fd.set(k, v);
    setState('sending');
    try {
      const res = await fetch('/api/leads/', { method: 'POST', body: fd });
      const j = await res.json();
      if (res.status === 429) {
        setState('error');
        setMsg(t.errRate);
        return;
      }
      if (!j.ok) {
        const fe: Record<string, string> = {};
        (j.fields || []).forEach((f: string) => (fe[f] = f === 'email' ? t.errEmail : f === 'consent' ? t.errConsent : t.errRequired));
        setErrors(fe);
        setState('error');
        setMsg(t.errGeneric);
        return;
      }
      setState('ok');
      setMsg(t.ok.replace('{id}', j.id));
      track(event ?? `form_${type}`, { form: type });
      onDone?.(j.id);
    } catch {
      setState('error');
      setMsg(t.errGeneric);
    }
  }

  if (state === 'ok')
    return (
      <div className="alert alert--ok" role="status">
        <Icon name="check" /> {msg}
      </div>
    );

  return (
    <form ref={formRef} className="form-grid" onSubmit={submit} noValidate aria-busy={state === 'sending'}>
      {fields.map((f) => {
        const id = `f-${type}-${f.name}`;
        const err = errors[f.name];
        const common = {
          id,
          name: f.name,
          required: f.required,
          'aria-invalid': err ? true : undefined,
          'aria-describedby': err ? `${id}-err` : undefined,
          defaultValue: f.defaultValue,
          placeholder: f.placeholder,
          autoComplete: f.autoComplete,
        } as const;
        return (
          <div key={f.name} className={`field ${f.span === 2 || f.kind === 'textarea' || f.kind === 'chips' ? 'span-2' : ''}`}>
            {f.kind === 'chips' ? (
              <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className={`label ${f.required ? 'req' : ''}`}>{f.label}</legend>
                <div className="row" style={{ marginTop: 8 }}>
                  {f.options?.map((o) => (
                    <label key={o.value} className="chip" style={{ cursor: 'pointer' }}>
                      <input type="checkbox" name={f.name} value={o.value} style={{ accentColor: 'var(--accent)' }} /> {o.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : (
              <>
                <label htmlFor={id} className={f.required ? 'req' : ''}>
                  {f.label}
                </label>
                {f.kind === 'textarea' ? (
                  <textarea className="textarea" {...common} />
                ) : f.kind === 'country' ? (
                  <select className="select" {...common} defaultValue={f.defaultValue ?? ''} autoComplete="country">
                    <option value="" disabled>
                      —
                    </option>
                    {countries.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                ) : f.kind === 'select' ? (
                  <select className="select" {...common} defaultValue={f.defaultValue ?? ''}>
                    <option value="" disabled>
                      —
                    </option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.kind === 'file' ? (
                  <input className="input" type="file" {...common} name="file" accept={f.accept} />
                ) : (
                  <input className="input" type={f.kind} {...common} inputMode={f.kind === 'tel' ? 'tel' : undefined} />
                )}
              </>
            )}
            {err && (
              <span className="field-error" id={`${id}-err`} role="alert">
                {err}
              </span>
            )}
          </div>
        );
      })}
      {/* bal küpü: insanlar görmez, botlar doldurur */}
      <div className="hp" aria-hidden>
        <label>
          Website <input name="website2" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="field span-2">
        <label className="check">
          <input type="checkbox" name="consent" aria-invalid={errors.consent ? true : undefined} />
          <span>
            {pre}
            <a href={t.privacyHref} className="link" target="_blank" rel="noopener">
              {t.privacy}
            </a>
            {post}
          </span>
        </label>
        {errors.consent && (
          <span className="field-error" role="alert">
            {errors.consent}
          </span>
        )}
      </div>
      {state === 'error' && msg && (
        <div className="alert alert--err span-2" role="alert">
          {msg}
        </div>
      )}
      <div className="span-2 row">
        <button className="btn btn--primary btn--lg" type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? t.sending : t.submit}
          <Icon name="arrow" size={16} />
        </button>
        <span className="small muted">* {t.required}</span>
      </div>
    </form>
  );
}
