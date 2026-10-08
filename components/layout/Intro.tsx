import { readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Özteknik yükleme ekranı (oturum başına bir kez; hareketi azalt → hiç).
 * Logo soldan sağa talaşlı işleme gibi açılır (turkuaz kesici çizgi), Ö noktası en son oturur,
 * sonra panel açılış videosundaki perde gibi yukarı kalkar. Tamamı CSS: JS çalışmasa da ~1,9 sn'de kendiliğinden kapanır.
 * Logo public/brand/ozteknik-logo-white.svg'den okunur (firmanın orijinal vektörü gelince kendiliğinden güncellenir).
 */
const svg = readFileSync(path.join(process.cwd(), 'public', 'brand', 'ozteknik-logo-white.svg'), 'utf8');
const letters = svg.match(/<path fill="#FFFFFF"[^>]* d="([^"]+)"/)?.[1] ?? '';
const dot = svg.match(/<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/);
const iMark = svg.match(/<g fill="#1AA99E">.*?<path d="([^"]+)"/)?.[1] ?? '';

/** <head> içinde, ilk boyamadan önce: JS var işareti + bu oturumda gösterildiyse atla */
export const introScript = `(function(){var d=document.documentElement;d.dataset.js='1';try{if(sessionStorage.getItem('oz-intro')||matchMedia('(prefers-reduced-motion: reduce)').matches){d.dataset.intro='skip'}else{sessionStorage.setItem('oz-intro','1')}}catch(e){d.dataset.intro='skip'}})()`;

export default function Intro() {
  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-mark">
        <svg className="intro-logo" viewBox="0 0 205 21" width="205" height="21">
          <path className="intro-letters" fill="#fff" fillRule="evenodd" d={letters} />
          <path fill="#1AA99E" d={iMark} />
          {dot && <circle className="intro-dot" cx={dot[1]} cy={dot[2]} r={dot[3]} fill="#1AA99E" />}
        </svg>
        <span className="intro-cut" />
      </div>
    </div>
  );
}
