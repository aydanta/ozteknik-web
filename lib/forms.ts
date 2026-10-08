import { href, type Locale } from './i18n';
import { getDict } from '@/content/i18n';
import type { Field, FormText } from '@/components/forms/LeadForm';

export function formText(lang: Locale, submit?: string): FormText {
  const t = getDict(lang);
  return {
    submit: submit ?? t.common.send,
    sending: t.common.sending,
    ok: t.forms.ok,
    errRequired: t.forms.errRequired,
    errEmail: t.forms.errEmail,
    errConsent: t.forms.errConsent,
    errGeneric: t.forms.errGeneric,
    errRate: t.forms.errRate,
    consent: t.forms.consent,
    privacy: t.forms.privacy,
    privacyHref: href(lang, 'privacy'),
    required: t.common.required,
  };
}

/** Ortak alan setleri */
export function contactFields(lang: Locale, opts: { company?: boolean; message?: boolean; country?: boolean } = {}): Field[] {
  const f = getDict(lang).forms;
  const out: Field[] = [];
  if (opts.company !== false) out.push({ name: 'company', label: f.company, kind: 'text', required: true, autoComplete: 'organization' });
  out.push({ name: 'name', label: f.name, kind: 'text', required: true, autoComplete: 'name' });
  out.push({ name: 'email', label: f.email, kind: 'email', required: true, autoComplete: 'email' });
  out.push({ name: 'phone', label: f.phone, kind: 'tel', autoComplete: 'tel' });
  if (opts.country !== false) out.push({ name: 'country', label: f.country, kind: 'country', required: true });
  if (opts.message !== false) out.push({ name: 'message', label: f.message, kind: 'textarea' });
  return out;
}
