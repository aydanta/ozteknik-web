import type { Locale } from '@/lib/i18n';

/**
 * Ürün sayfası metin şablonları (8 dil) — şartname §"Ürün detay sayfası şablonu".
 * Özet cümlesi (GEO), meta açıklama, SSS ve görsel alt metni yapılandırılmış veriden üretilir;
 * editör panelden dil bazında üzerine yazabilir (overrides). Kod ve OE numaraları asla çevrilmez.
 * ⚠ AI ilk çeviri; her dil için sektör editörü onayı bekler (şartname: "Teknik metin çevirisi").
 */
export type VehicleClass = 'trucks' | 'buses' | 'agri' | 'construction' | 'commercial';

export interface CopyInput {
  code: string;
  brand: string;
  type: string; // dile göre ürün tipi (başlık hâli)
  size: string; // "Ø50 / 740 mm"
  makes: string[];
  cls: VehicleClass;
  oes: string[]; // görünen yazım, ilk 3–6
  oeTotal: number;
  cross: string[]; // "Sachs 3400 122 801"
  models: string[];
}

const BUS = new Set(['Neoplan', 'Kässbohrer (Setra)', 'Setra', 'Van Hool', 'EvoBus', 'Bova', 'Solaris', 'Temsa', 'Otokar', 'Irisbus', 'Ikarus', 'King Long', 'Heuliez', 'Auwarter', 'Den Oudsten', 'Alexander Dennis', 'Optare', 'MCW', 'Karosa', 'Autosan', 'Sunwin', 'Menarini', 'BredaMenarinibus', 'Metrocab', 'Güleryüz', 'Drögmöller', 'Ayats', 'Dennis']);
const AGRI = new Set(['Case IH', 'Claas', 'John Deere', 'Deutz-Fahr', 'New Holland', 'Massey Ferguson', 'Fiatagri', 'Deutz', 'Same', 'Hanomag']);
const CONSTR = new Set(['Liebherr', 'Caterpillar', 'JCB', 'Terex', 'Grove', 'Demag', 'Faun', 'Krupp', 'Manitowoc', 'Bell', 'Kaelble', 'Harnischfeger', 'Orenstein Koppel', 'Krauss-Maffei', 'Terberg']);
export function vehicleClass(makes: string[]): VehicleClass {
  if (!makes.length) return 'commercial';
  const cls = new Set(makes.map((m) => (BUS.has(m) ? 'buses' : AGRI.has(m) ? 'agri' : CONSTR.has(m) ? 'construction' : 'trucks')));
  return cls.size === 1 ? ([...cls][0] as VehicleClass) : 'commercial';
}

const lcWords = (s: string) =>
  s
    .split(' ')
    .map((w) => (/^[A-Z]-/.test(w) || /^[A-Z]$/.test(w) ? w : w.toLowerCase()))
    .join(' ');

function list(items: string[], and: string, sep = ', ') {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(sep)} ${and} ${items[items.length - 1]}`;
}
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const unit = (s: string, u: string) => s.replace(/ mm\b/g, ` ${u}`);
const makesShort = (m: string[]) => (m.length > 3 ? [...m.slice(0, 3)] : m);

interface LangCopy {
  and: string;
  mm: string;
  summary(i: CopyInput): string;
  meta(i: CopyInput, nOe: number): string;
  faq(i: CopyInput): { q: string; a: string }[];
  alt(i: { brand: string; code: string; type: string; make: string | null; cls: VehicleClass; oe: string | null; angle: string }): string;
  angle: Record<'front' | '34' | 'detail' | 'side', string>;
  oeDisclaimer: string;
  more: (n: number) => string;
}

const CLS: Record<Locale, Record<VehicleClass, string>> = {
  en: { trucks: 'trucks', buses: 'buses', agri: 'agricultural machinery', construction: 'construction machinery', commercial: 'commercial vehicles' },
  tr: { trucks: 'kamyonları', buses: 'otobüsleri', agri: 'tarım makineleri', construction: 'iş makineleri', commercial: 'ticari araçları' },
  de: { trucks: 'Lkw', buses: 'Busse', agri: 'Landmaschinen', construction: 'Baumaschinen', commercial: 'Nutzfahrzeuge' },
  fr: { trucks: 'camions', buses: 'autobus', agri: 'machines agricoles', construction: 'engins de chantier', commercial: 'véhicules industriels' },
  es: { trucks: 'camiones', buses: 'autobuses', agri: 'maquinaria agrícola', construction: 'maquinaria de construcción', commercial: 'vehículos industriales' },
  it: { trucks: 'camion', buses: 'autobus', agri: 'macchine agricole', construction: 'macchine movimento terra', commercial: 'veicoli industriali' },
  ru: { trucks: 'грузовиков', buses: 'автобусов', agri: 'сельхозтехники', construction: 'строительной техники', commercial: 'коммерческого транспорта' },
  ar: { trucks: 'شاحنات', buses: 'حافلات', agri: 'الآلات الزراعية من', construction: 'معدات البناء من', commercial: 'المركبات التجارية من' },
};

const withSize = (type: string, size: string, before = false) => (size ? (before ? `${size} ${type}` : `${type} ${size}`) : type);

export const COPY: Record<Locale, LangCopy> = {
  en: {
    and: 'and',
    mm: 'mm',
    summary: (i) => {
      const t = lcWords(i.type);
      const head = withSize(t, i.size, true);
      const art = /^[aeiou8]|^1[18]\b/i.test(head) ? 'an' : 'a';
      const who = [makesShort(i.makes).join(', '), CLS.en[i.cls]].filter(Boolean).join(' ');
      const repl = list([...i.oes.slice(0, 3).map((o, n) => (n === 0 ? `OE ${o}` : o)), ...i.cross.slice(0, 1)], 'and');
      return `${i.code} is ${art} ${head} for ${who}${repl ? `; it replaces ${repl}` : ''}.`;
    },
    meta: (i, n) =>
      `${cap(withSize(lcWords(i.type), i.size, true))} for ${[makesShort(i.makes).join(', '), CLS.en[i.cls]].filter(Boolean).join(' ')}. Replaces ${list([...i.oes.slice(0, n).map((o, k) => (k === 0 ? `OE ${o}` : o)), ...i.cross.slice(0, 1)], 'and')}. IATF 16949 certified, made in Türkiye by Özteknik.`,
    faq: (i) => [
      {
        q: `Which vehicles does ${i.code} fit?`,
        a: `${i.code} fits ${[i.makes.join(', '), CLS.en[i.cls]].filter(Boolean).join(' ')}${i.models.length ? `, including ${list(i.models.slice(0, 5), 'and')}` : ''}. Always confirm fitment with the OE number before ordering.`,
      },
      {
        q: `Which numbers does ${i.code} replace?`,
        a: `${i.code} replaces OE ${list(i.oes.slice(0, 6), 'and')}${i.oeTotal > 6 ? ` and ${i.oeTotal - 6} more OE numbers listed on this page` : ''}.${i.cross.length ? ` It is also compatible with ${list(i.cross, 'and')}.` : ''}`,
      },
      {
        q: 'What is the minimum order quantity?',
        a: `Minimum order quantities depend on the product line and destination. Add ${i.code} to your quote list and our export team replies with price, MOQ and lead time within 24 hours.`,
      },
      {
        q: `Who manufactures ${i.code}?`,
        a: `${i.code} is a ${i.brand} part made in Türkiye by Özteknik A.Ş., İzmir, under an IATF 16949 certified quality management system.`,
      },
    ],
    alt: (a) => `${a.brand} ${a.code} ${lcWords(a.type)}${a.make ? ` for ${a.make} ${CLS.en[a.cls]}` : ''}${a.oe ? `, OE ${a.oe}` : ''}, ${a.angle}`,
    angle: { front: 'front view', '34': '3/4 view', detail: 'detail view', side: 'side view' },
    oeDisclaimer: 'Vehicle manufacturer names and OE numbers are used for reference purposes only to indicate compatibility.',
    more: (n) => `+${n} more`,
  },
  tr: {
    and: 've',
    mm: 'mm',
    summary: (i) => {
      const who = [makesShort(i.makes).join(', '), CLS.tr[i.cls]].filter(Boolean).join(' ');
      const repl = list([...i.oes.slice(0, 3).map((o, n) => (n === 0 ? `OE ${o}` : o)), ...i.cross.slice(0, 1)], 've');
      return `${i.code}, ${who} için ${withSize(i.type.toLocaleLowerCase('tr'), i.size, true)}${repl ? `; ${repl} numaralarının yerine geçer` : ''}.`;
    },
    meta: (i, n) =>
      `${[makesShort(i.makes).join(', '), CLS.tr[i.cls]].filter(Boolean).join(' ')} için ${withSize(i.type.toLocaleLowerCase('tr'), i.size, true)}. ${list([...i.oes.slice(0, n).map((o, k) => (k === 0 ? `OE ${o}` : o)), ...i.cross.slice(0, 1)], 've')} muadili. IATF 16949, yerli üretim.`,
    faq: (i) => [
      {
        q: `${i.code} hangi araçlara uyar?`,
        a: `${i.code}, ${[i.makes.join(', '), CLS.tr[i.cls]].filter(Boolean).join(' ')} için uygundur${i.models.length ? `; uyumlu modeller arasında ${list(i.models.slice(0, 5), 've')} bulunur` : ''}. Sipariş öncesinde uyumu OE numarasıyla doğrulayın.`,
      },
      {
        q: `${i.code} hangi numaraların yerine geçer?`,
        a: `${i.code}; OE ${list(i.oes.slice(0, 6), 've')}${i.oeTotal > 6 ? ` ile bu sayfada listelenen ${i.oeTotal - 6} OE numarasının daha` : ''} yerine geçer.${i.cross.length ? ` Ayrıca ${list(i.cross, 've')} ile uyumludur.` : ''}`,
      },
      {
        q: 'Minimum sipariş miktarı nedir?',
        a: `Minimum sipariş miktarı ürün hattına ve varış ülkesine göre değişir. ${i.code} ürününü teklif listenize ekleyin; ihracat ekibimiz fiyat, minimum adet ve teslim süresiyle 24 saat içinde dönüş yapar.`,
      },
      {
        q: `${i.code} ürününü kim üretiyor?`,
        a: `${i.code}, Özteknik A.Ş. tarafından İzmir'de, IATF 16949 sertifikalı kalite yönetim sistemiyle üretilen bir ${i.brand} ürünüdür.`,
      },
    ],
    alt: (a) => `${a.brand} ${a.code} ${a.type.toLocaleLowerCase('tr')}${a.make ? `, ${a.make} ${CLS.tr[a.cls]} için` : ''}${a.oe ? `, OE ${a.oe}` : ''}, ${a.angle}`,
    angle: { front: 'önden görünüm', '34': '3/4 görünüm', detail: 'detay görünüm', side: 'yandan görünüm' },
    oeDisclaimer: 'Araç üreticisi adları ve OE numaraları yalnızca uyumluluğu belirtmek amacıyla referans olarak kullanılır.',
    more: (n) => `+${n} daha`,
  },
  de: {
    and: 'und',
    mm: 'mm',
    summary: (i) => {
      const who = [makesShort(i.makes).join(', '), CLS.de[i.cls]].filter(Boolean).join(' ');
      const repl = list([...i.oes.slice(0, 3).map((o, n) => (n === 0 ? `OE ${o}` : o)), ...i.cross.slice(0, 1)], 'und');
      return `${i.code}: ${withSize(i.type, i.size)} für ${who}${repl ? `; ersetzt ${repl}` : ''}.`;
    },
    meta: (i, n) =>
      `${withSize(i.type, i.size)} für ${[makesShort(i.makes).join(', '), CLS.de[i.cls]].filter(Boolean).join(' ')}. Ersetzt ${list([...i.oes.slice(0, n).map((o, k) => (k === 0 ? `OE ${o}` : o)), ...i.cross.slice(0, 1)], 'und')}. IATF-16949-zertifiziert, hergestellt in der Türkei von Özteknik.`,
    faq: (i) => [
      {
        q: `Für welche Fahrzeuge passt ${i.code}?`,
        a: `${i.code} passt für ${[i.makes.join(', '), CLS.de[i.cls]].filter(Boolean).join(' ')}${i.models.length ? `, unter anderem ${list(i.models.slice(0, 5), 'und')}` : ''}. Prüfen Sie die Passgenauigkeit vor der Bestellung stets anhand der OE-Nummer.`,
      },
      {
        q: `Welche Nummern ersetzt ${i.code}?`,
        a: `${i.code} ersetzt OE ${list(i.oes.slice(0, 6), 'und')}${i.oeTotal > 6 ? ` sowie ${i.oeTotal - 6} weitere OE-Nummern auf dieser Seite` : ''}.${i.cross.length ? ` Außerdem kompatibel mit ${list(i.cross, 'und')}.` : ''}`,
      },
      {
        q: 'Wie hoch ist die Mindestbestellmenge?',
        a: `Die Mindestbestellmenge hängt von Produktlinie und Zielland ab. Legen Sie ${i.code} auf Ihre Angebotsliste – unser Exportteam antwortet innerhalb von 24 Stunden mit Preis, MOQ und Lieferzeit.`,
      },
      {
        q: `Wer stellt ${i.code} her?`,
        a: `${i.code} ist ein ${i.brand}-Teil, hergestellt von Özteknik A.Ş. in İzmir (Türkei) unter einem nach IATF 16949 zertifizierten Qualitätsmanagementsystem.`,
      },
    ],
    alt: (a) => `${a.brand} ${a.code} ${a.type}${a.make ? ` für ${a.make} ${CLS.de[a.cls]}` : ''}${a.oe ? `, OE ${a.oe}` : ''}, ${a.angle}`,
    angle: { front: 'Vorderansicht', '34': '3/4-Ansicht', detail: 'Detailansicht', side: 'Seitenansicht' },
    oeDisclaimer: 'Fahrzeughersteller-Namen und OE-Nummern dienen ausschließlich als Vergleichsreferenz zur Angabe der Kompatibilität.',
    more: (n) => `+${n} weitere`,
  },
  fr: {
    and: 'et',
    mm: 'mm',
    summary: (i) => {
      const who = [CLS.fr[i.cls], makesShort(i.makes).join(', ')].filter(Boolean).join(' ');
      const repl = list([...i.oes.slice(0, 3).map((o, n) => (n === 0 ? `OE ${o}` : o)), ...i.cross.slice(0, 1)], 'et');
      return `${i.code} : ${withSize(lcWords(i.type), i.size)} pour ${who}${repl ? ` ; remplace ${repl}` : ''}.`;
    },
    meta: (i, n) =>
      `${withSize(i.type, i.size)} pour ${[CLS.fr[i.cls], makesShort(i.makes).join(', ')].filter(Boolean).join(' ')}. Remplace ${list([...i.oes.slice(0, n).map((o, k) => (k === 0 ? `OE ${o}` : o)), ...i.cross.slice(0, 1)], 'et')}. Certifié IATF 16949, fabriqué en Turquie par Özteknik.`,
    faq: (i) => [
      {
        q: `Sur quels véhicules ${i.code} se monte-t-il ?`,
        a: `${i.code} se monte sur ${[CLS.fr[i.cls], i.makes.join(', ')].filter(Boolean).join(' ')}${i.models.length ? `, notamment ${list(i.models.slice(0, 5), 'et')}` : ''}. Vérifiez toujours la compatibilité avec le numéro OE avant de commander.`,
      },
      {
        q: `Quelles références ${i.code} remplace-t-il ?`,
        a: `${i.code} remplace OE ${list(i.oes.slice(0, 6), 'et')}${i.oeTotal > 6 ? ` ainsi que ${i.oeTotal - 6} autres numéros OE listés sur cette page` : ''}.${i.cross.length ? ` Il est également compatible avec ${list(i.cross, 'et')}.` : ''}`,
      },
      {
        q: 'Quelle est la quantité minimale de commande ?',
        a: `La quantité minimale dépend de la gamme et du pays de destination. Ajoutez ${i.code} à votre liste de devis : notre équipe export répond sous 24 heures avec prix, MOQ et délai.`,
      },
      {
        q: `Qui fabrique ${i.code} ?`,
        a: `${i.code} est une pièce ${i.brand} fabriquée en Turquie par Özteknik A.Ş. (İzmir), selon un système de management de la qualité certifié IATF 16949.`,
      },
    ],
    alt: (a) => `${a.brand} ${a.code} ${lcWords(a.type)}${a.make ? ` pour ${CLS.fr[a.cls]} ${a.make}` : ''}${a.oe ? `, OE ${a.oe}` : ''}, ${a.angle}`,
    angle: { front: 'vue de face', '34': 'vue 3/4', detail: 'vue de détail', side: 'vue de côté' },
    oeDisclaimer: "Les noms des constructeurs et les numéros OE sont cités uniquement à titre de référence pour indiquer la compatibilité.",
    more: (n) => `+${n} autres`,
  },
  es: {
    and: 'y',
    mm: 'mm',
    summary: (i) => {
      const who = [CLS.es[i.cls], makesShort(i.makes).join(', ')].filter(Boolean).join(' ');
      const repl = list([...i.oes.slice(0, 3).map((o, n) => (n === 0 ? `OE ${o}` : o)), ...i.cross.slice(0, 1)], 'y');
      return `${i.code}: ${lcWords(i.type)}${i.size ? ` de ${i.size}` : ''} para ${who}${repl ? `; sustituye a ${repl}` : ''}.`;
    },
    meta: (i, n) =>
      `${i.type}${i.size ? ` de ${i.size}` : ''} para ${[CLS.es[i.cls], makesShort(i.makes).join(', ')].filter(Boolean).join(' ')}. Sustituye a ${list([...i.oes.slice(0, n).map((o, k) => (k === 0 ? `OE ${o}` : o)), ...i.cross.slice(0, 1)], 'y')}. Certificado IATF 16949, fabricado en Turquía por Özteknik.`,
    faq: (i) => [
      {
        q: `¿En qué vehículos se monta ${i.code}?`,
        a: `${i.code} se monta en ${[CLS.es[i.cls], i.makes.join(', ')].filter(Boolean).join(' ')}${i.models.length ? `, entre ellos ${list(i.models.slice(0, 5), 'y')}` : ''}. Confirme siempre la compatibilidad con el número OE antes de pedir.`,
      },
      {
        q: `¿Qué números sustituye ${i.code}?`,
        a: `${i.code} sustituye a OE ${list(i.oes.slice(0, 6), 'y')}${i.oeTotal > 6 ? ` y a otros ${i.oeTotal - 6} números OE indicados en esta página` : ''}.${i.cross.length ? ` También es compatible con ${list(i.cross, 'y')}.` : ''}`,
      },
      {
        q: '¿Cuál es el pedido mínimo?',
        a: `El pedido mínimo depende de la línea de producto y del país de destino. Añada ${i.code} a su lista de cotización y nuestro equipo de exportación responde en 24 horas con precio, MOQ y plazo.`,
      },
      {
        q: `¿Quién fabrica ${i.code}?`,
        a: `${i.code} es una pieza ${i.brand} fabricada en Turquía por Özteknik A.Ş. (Esmirna) con un sistema de gestión de calidad certificado IATF 16949.`,
      },
    ],
    alt: (a) => `${a.brand} ${a.code} ${lcWords(a.type)}${a.make ? ` para ${CLS.es[a.cls]} ${a.make}` : ''}${a.oe ? `, OE ${a.oe}` : ''}, ${a.angle}`,
    angle: { front: 'vista frontal', '34': 'vista 3/4', detail: 'vista de detalle', side: 'vista lateral' },
    oeDisclaimer: 'Los nombres de fabricantes y los números OE se utilizan únicamente como referencia para indicar la compatibilidad.',
    more: (n) => `+${n} más`,
  },
  it: {
    and: 'e',
    mm: 'mm',
    summary: (i) => {
      const who = [CLS.it[i.cls], makesShort(i.makes).join(', ')].filter(Boolean).join(' ');
      const repl = list([...i.oes.slice(0, 3).map((o, n) => (n === 0 ? `OE ${o}` : o)), ...i.cross.slice(0, 1)], 'e');
      return `${i.code}: ${withSize(lcWords(i.type), i.size)} per ${who}${repl ? `; sostituisce ${repl}` : ''}.`;
    },
    meta: (i, n) =>
      `${withSize(i.type, i.size)} per ${[CLS.it[i.cls], makesShort(i.makes).join(', ')].filter(Boolean).join(' ')}. Sostituisce ${list([...i.oes.slice(0, n).map((o, k) => (k === 0 ? `OE ${o}` : o)), ...i.cross.slice(0, 1)], 'e')}. Certificato IATF 16949, prodotto in Turchia da Özteknik.`,
    faq: (i) => [
      {
        q: `Su quali veicoli si monta ${i.code}?`,
        a: `${i.code} si monta su ${[CLS.it[i.cls], i.makes.join(', ')].filter(Boolean).join(' ')}${i.models.length ? `, tra cui ${list(i.models.slice(0, 5), 'e')}` : ''}. Verificare sempre la compatibilità con il numero OE prima dell'ordine.`,
      },
      {
        q: `Quali codici sostituisce ${i.code}?`,
        a: `${i.code} sostituisce OE ${list(i.oes.slice(0, 6), 'e')}${i.oeTotal > 6 ? ` e altri ${i.oeTotal - 6} numeri OE elencati in questa pagina` : ''}.${i.cross.length ? ` È inoltre compatibile con ${list(i.cross, 'e')}.` : ''}`,
      },
      {
        q: "Qual è il quantitativo minimo d'ordine?",
        a: `Il minimo d'ordine dipende dalla linea di prodotto e dal Paese di destinazione. Aggiunga ${i.code} alla lista preventivo: il nostro team export risponde entro 24 ore con prezzo, MOQ e tempi di consegna.`,
      },
      {
        q: `Chi produce ${i.code}?`,
        a: `${i.code} è un ricambio ${i.brand} prodotto in Turchia da Özteknik A.Ş. (Smirne) con un sistema di gestione qualità certificato IATF 16949.`,
      },
    ],
    alt: (a) => `${a.brand} ${a.code} ${lcWords(a.type)}${a.make ? ` per ${CLS.it[a.cls]} ${a.make}` : ''}${a.oe ? `, OE ${a.oe}` : ''}, ${a.angle}`,
    angle: { front: 'vista frontale', '34': 'vista 3/4', detail: 'vista di dettaglio', side: 'vista laterale' },
    oeDisclaimer: 'I nomi dei costruttori e i numeri OE sono utilizzati esclusivamente come riferimento per indicare la compatibilità.',
    more: (n) => `+${n} altri`,
  },
  ru: {
    and: 'и',
    mm: 'мм',
    summary: (i) => {
      const who = [CLS.ru[i.cls], makesShort(i.makes).join(', ')].filter(Boolean).join(' ');
      const repl = list([...i.oes.slice(0, 3).map((o, n) => (n === 0 ? `OE ${o}` : o)), ...i.cross.slice(0, 1)], 'и');
      return `${i.code} — ${withSize(i.type.toLowerCase(), unit(i.size, 'мм'))} для ${who}${repl ? `; заменяет ${repl}` : ''}.`;
    },
    meta: (i, n) =>
      `${withSize(i.type, unit(i.size, 'мм'))} для ${[CLS.ru[i.cls], makesShort(i.makes).join(', ')].filter(Boolean).join(' ')}. Заменяет ${list([...i.oes.slice(0, n).map((o, k) => (k === 0 ? `OE ${o}` : o)), ...i.cross.slice(0, 1)], 'и')}. Сертификат IATF 16949, производство Özteknik, Турция.`,
    faq: (i) => [
      {
        q: `На какие автомобили подходит ${i.code}?`,
        a: `${i.code} подходит для ${[CLS.ru[i.cls], i.makes.join(', ')].filter(Boolean).join(' ')}${i.models.length ? `, в том числе ${list(i.models.slice(0, 5), 'и')}` : ''}. Перед заказом всегда проверяйте применимость по номеру OE.`,
      },
      {
        q: `Какие номера заменяет ${i.code}?`,
        a: `${i.code} заменяет OE ${list(i.oes.slice(0, 6), 'и')}${i.oeTotal > 6 ? ` и ещё ${i.oeTotal - 6} номеров OE, перечисленных на этой странице` : ''}.${i.cross.length ? ` Также совместим с ${list(i.cross, 'и')}.` : ''}`,
      },
      {
        q: 'Какой минимальный объём заказа?',
        a: `Минимальный объём заказа зависит от товарной линии и страны назначения. Добавьте ${i.code} в запрос цены — наш экспортный отдел ответит в течение 24 часов с ценой, MOQ и сроком поставки.`,
      },
      {
        q: `Кто производит ${i.code}?`,
        a: `${i.code} — деталь ${i.brand}, произведённая компанией Özteknik A.Ş. в Измире (Турция) по системе менеджмента качества, сертифицированной по IATF 16949.`,
      },
    ],
    alt: (a) => `${a.brand} ${a.code} ${a.type.toLowerCase()}${a.make ? ` для ${CLS.ru[a.cls]} ${a.make}` : ''}${a.oe ? `, OE ${a.oe}` : ''}, ${a.angle}`,
    angle: { front: 'вид спереди', '34': 'вид 3/4', detail: 'детальный вид', side: 'вид сбоку' },
    oeDisclaimer: 'Названия производителей транспортных средств и номера OE используются исключительно для указания применимости.',
    more: (n) => `ещё ${n}`,
  },
  ar: {
    and: 'و',
    mm: 'مم',
    summary: (i) => {
      const who = [`ل${CLS.ar[i.cls]}`, makesShort(i.makes).join('، ')].filter(Boolean).join(' ');
      const repl = list([...i.oes.slice(0, 3).map((o, n) => (n === 0 ? `OE ${o}` : o)), ...i.cross.slice(0, 1)], 'و', '، ');
      return `${i.code}: ${withSize(i.type, unit(i.size, 'مم'))} مخصص ${who}${repl ? `، ويحل محل ${repl}` : ''}.`;
    },
    meta: (i, n) =>
      `${withSize(i.type, unit(i.size, 'مم'))} ${[`ل${CLS.ar[i.cls]}`, makesShort(i.makes).join('، ')].filter(Boolean).join(' ')}. بديل لـ ${list([...i.oes.slice(0, n).map((o, k) => (k === 0 ? `OE ${o}` : o)), ...i.cross.slice(0, 1)], 'و', '، ')}. شهادة IATF 16949، صُنع في تركيا بواسطة Özteknik.`,
    faq: (i) => [
      {
        q: `ما المركبات التي يناسبها ${i.code}؟`,
        a: `يناسب ${i.code} ${[CLS.ar[i.cls], i.makes.join('، ')].filter(Boolean).join(' ')}${i.models.length ? `، ومنها ${list(i.models.slice(0, 5), 'و', '، ')}` : ''}. تحقق دائمًا من التوافق برقم OE قبل الطلب.`,
      },
      {
        q: `ما الأرقام التي يحل ${i.code} محلها؟`,
        a: `يحل ${i.code} محل OE ${list(i.oes.slice(0, 6), 'و', '، ')}${i.oeTotal > 6 ? ` و${i.oeTotal - 6} رقم OE آخر مدرج في هذه الصفحة` : ''}.${i.cross.length ? ` كما أنه متوافق مع ${list(i.cross, 'و', '، ')}.` : ''}`,
      },
      {
        q: 'ما الحد الأدنى للطلب؟',
        a: `يعتمد الحد الأدنى للطلب على خط المنتج وبلد الوجهة. أضف ${i.code} إلى قائمة عرض السعر وسيرد فريق التصدير خلال 24 ساعة بالسعر والحد الأدنى ومدة التوريد.`,
      },
      {
        q: `من يصنّع ${i.code}؟`,
        a: `${i.code} قطعة من علامة ${i.brand} تصنعها شركة Özteknik A.Ş. في إزمير، تركيا، وفق نظام إدارة جودة حاصل على شهادة IATF 16949.`,
      },
    ],
    alt: (a) => `${a.brand} ${a.code} ${a.type}${a.make ? ` ل${CLS.ar[a.cls]} ${a.make}` : ''}${a.oe ? `، OE ${a.oe}` : ''}، ${a.angle}`,
    angle: { front: 'منظر أمامي', '34': 'منظر 3/4', detail: 'منظر تفصيلي', side: 'منظر جانبي' },
    oeDisclaimer: 'تُستخدم أسماء الشركات المصنعة للمركبات وأرقام OE لأغراض مرجعية فقط لبيان التوافق.',
    more: (n) => `+${n} أخرى`,
  },
};
