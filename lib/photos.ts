/**
 * Kurumsal fotoğraflar: public/img/company/<ad>-{960,1920}.webp
 * Kaynak: mevcut sitenin kendi çekimleri, fabrika filmi ve GES drone videosundan kareler.
 * Stok görsel ve yüzü görünen çalışan yok (çalışan izni ❓, marka brief §5).
 * Alt metinler: content/i18n/*.ts → photo.<anahtar>
 */
export const PHOTOS = {
  campus: 'ozteknik-kemalpasa-izmir-plant',
  aerial: 'ozteknik-plant-aerial-sign',
  solar: 'ozteknik-rooftop-solar-aerial',
  hall: 'ozteknik-cnc-machining-hall',
  production: 'ozteknik-production-hall',
  operator: 'ozteknik-cnc-operator',
  machining: 'ozteknik-cnc-machining',
  robot: 'ozteknik-robotic-welding-cell',
  welding: 'ozteknik-robotic-welding',
  weld: 'ozteknik-tube-welding',
  cmm: 'ozteknik-cmm-measurement',
  cad: 'ozteknik-cad-engineering',
  clutch: 'revol-clutch-cover-assembly',
  springs: 'revol-clutch-pressure-springs',
  packing: 'revol-clutch-packing',
  testbench: 'hydcab-cylinder-test-bench',
  logistics: 'ozteknik-logistics-visual',
  export: 'ozteknik-export-markets-visual',
} as const;
export type PhotoKey = keyof typeof PHOTOS;

export const photoSrc = (k: PhotoKey, w: 960 | 1920 = 1920) => `/img/company/${PHOTOS[k]}-${w}.webp`;
export const photoSrcSet = (k: PhotoKey) => `${photoSrc(k, 960)} 960w, ${photoSrc(k, 1920)} 1920w`;
