import { BRANDS } from './catalog';
import { brandHref } from './links';
import type { Locale } from './i18n';
import type { BrandKey } from './types';
import type { StoryStep } from '@/components/three/ExplodedStory';
import { getDict, getPages } from '@/content/i18n';

/** 3D anlatı adımları (ana sayfa: üçü; marka sayfası: biri) — metin içerik dosyalarından */
export function storySteps(lang: Locale, brands: BrandKey[] = ['egerot', 'hydcab', 'revol']): StoryStep[] {
  const t = getDict(lang);
  const pg = getPages(lang);
  const D = pg.disc.parts as Record<string, string>;
  const all: Record<BrandKey, StoryStep> = {
    egerot: {
      brand: 'egerot',
      title: `EGEROT — ${BRANDS.egerot.line[lang]}`,
      text: pg.brands.egerot.story,
      href: brandHref(lang, 'egerot'),
      cta: t.brand.goCatalogue,
      labels: Object.fromEntries(pg.brands.egerot.structure.map((s, i) => [['tube', 'bushing', 'pin'][i], s.t])),
      fallback: '/drawings/torque-rod.webp',
    },
    hydcab: {
      brand: 'hydcab',
      title: `HYDCAB — ${BRANDS.hydcab.line[lang]}`,
      text: pg.brands.hydcab.story,
      href: brandHref(lang, 'hydcab'),
      cta: t.brand.goCatalogue,
      labels: Object.fromEntries(pg.brands.hydcab.structure.map((s, i) => [['tube', 'piston', 'seals', 'valve'][i], s.t])),
      fallback: '/drawings/cab-tilting-cylinder.webp',
    },
    revol: {
      brand: 'revol',
      title: `REVOL — ${BRANDS.revol.line[lang]}`,
      text: pg.disc.lead,
      href: brandHref(lang, 'revol'),
      cta: t.brand.goCatalogue,
      labels: { facing: D['facing-top'], cushion: D.cushion, 'damper-spring': D['damper-spring'], hub: D.hub },
      fallback: '/drawings/clutch-kit.webp',
    },
  };
  return brands.map((b) => all[b]);
}
