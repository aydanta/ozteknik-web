/** ISO 3166-1 alfa-2 — adlar Intl.DisplayNames ile dile göre üretilir (ek veri yok) */
export const COUNTRIES = 'AD AE AF AG AL AM AO AR AT AU AZ BA BB BD BE BF BG BH BI BJ BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CL CM CN CO CR CU CV CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FR GA GB GD GE GH GM GN GQ GR GT GW GY HN HR HT HU ID IE IL IN IQ IR IS IT JM JO JP KE KG KH KM KN KR KW KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MG MK ML MM MN MR MT MU MV MW MX MY MZ NA NE NG NI NL NO NP NZ OM PA PE PG PH PK PL PS PT PY QA RO RS RU RW SA SB SC SD SE SG SI SK SL SM SN SO SR SS ST SV SY SZ TD TG TH TJ TL TM TN TO TR TT TW TZ UA UG US UY UZ VE VN YE ZA ZM ZW'.split(' ');

export function countryOptions(lang: string) {
  let dn: Intl.DisplayNames | null = null;
  try {
    dn = new Intl.DisplayNames([lang], { type: 'region' });
  } catch {}
  return COUNTRIES.map((c) => ({ code: c, name: dn?.of(c) ?? c })).sort((a, b) => a.name.localeCompare(b.name, lang));
}
