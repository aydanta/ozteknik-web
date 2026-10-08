import type { Locale } from '@/lib/i18n';
import en from './en';
import tr from './tr';
import de from './de';
import fr from './fr';
import es from './es';
import it from './it';
import ru from './ru';
import ar from './ar';
import pEn from '../pages/en';
import pTr from '../pages/tr';
import pDe from '../pages/de';
import pFr from '../pages/fr';
import pEs from '../pages/es';
import pIt from '../pages/it';
import pRu from '../pages/ru';
import pAr from '../pages/ar';

export type Dict = typeof en;
export type Pages = typeof pEn;

const DICTS: Record<Locale, Dict> = { en, tr, de, fr, es, it, ru, ar };
const PAGES: Record<Locale, Pages> = { en: pEn, tr: pTr, de: pDe, fr: pFr, es: pEs, it: pIt, ru: pRu, ar: pAr };

export const getDict = (lang: Locale): Dict => DICTS[lang];
export const getPages = (lang: Locale): Pages => PAGES[lang];

/** "{n} products" → değişken doldurma */
export function fmt(s: string, vars: Record<string, string | number> = {}): string {
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}
