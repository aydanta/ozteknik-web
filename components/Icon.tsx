/** Satır içi SVG ikon seti (harici istek yok). 1.6 px çizgi, 24 px ızgara. */
const P: Record<string, string> = {
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm9 16-4.35-4.35',
  chevron: 'm6 9 6 6 6-6',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  'arrow-left': 'M19 12H5m6 6-6-6 6-6',
  close: 'M6 6l12 12M18 6 6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  list: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  check: 'm5 12 5 5 9-10',
  copy: 'M9 9h10v10H9zM5 15V5h10',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-9 9h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z',
  sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10 1.4 1.4m0-12.8L17 7m-10 10-1.4 1.4',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z',
  clipboard: 'M9 4h6v3H9zM7 5H5v16h14V5h-2M8 11h8M8 15h6',
  upload: 'M12 16V4m-5 5 5-5 5 5M4 20h16',
  download: 'M12 4v12m-5-5 5 5 5-5M4 20h16',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  pin: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  truck: 'M3 6h11v9H3zM14 9h4l3 3v3h-7M7.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z',
  bus: 'M5 4h14v13H5zM5 11h14M8 20v-3m8 3v-3M8.5 14.5h.01m7 0h.01',
  tractor: 'M7 18.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM5 11V6h6l2 5h6v5',
  crane: 'M4 20h10M7 20V8l9-4v4M7 8h13M16 8v5m-2 0h4v3h-4z',
  cert: 'M12 3l2.4 1.8 3 .1.9 2.9 2.2 2-1 2.8 1 2.8-2.2 2-.9 2.9-3 .1L12 21l-2.4-1.8-3-.1-.9-2.9-2.2-2 1-2.8-1-2.8 2.2-2 .9-2.9 3-.1Z M9 12l2 2 4-4',
  play: 'M7 4l13 8-13 8z',
  pause: 'M7 5h3.5v14H7zM13.5 5H17v14h-3.5z',
  whatsapp:
    'M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Zm-3 5.5c.3-.6.6-.6.9-.6h.6c.2 0 .4 0 .6.5l.8 1.9c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5a7 7 0 0 0 3.3 2.9c.2.1.4 0 .5-.1l.7-.8c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.3.4.4 0 .5-.2 1.2-.8 1.6-.6.4-1.5.6-2.6.2a10 10 0 0 1-5.6-5c-.6-1.2-.4-2.3-.1-2.9Z',
  linkedin: 'M4 9h3.5v11H4zM5.75 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM10 9h3.3v1.6c.5-.9 1.7-1.9 3.5-1.9 3.6 0 4.2 2.4 4.2 5.4V20h-3.5v-5.2c0-1.3 0-2.9-1.8-2.9s-2.1 1.4-2.1 2.8V20H10z',
  youtube: 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3z',
  instagram: 'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5.5-1.5h.01',
  facebook: 'M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5c0-.3.2-.5.5-.5Z',
  x: 'M4 4l16 16M20 4 4 20',
  cube: 'M12 2 3 7v10l9 5 9-5V7zM3 7l9 5 9-5M12 12v10',
  layers: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
  file: 'M6 3h8l4 4v14H6zM14 3v4h4',
  external: 'M14 4h6v6m0-6-9 9M18 14v6H4V6h6',
  trash: 'M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0',
  lock: 'M6 11h12v10H6zM8 11V8a4 4 0 1 1 8 0v3',
  filter: 'M4 5h16l-6 7v6l-4 2v-8z',
  factory: 'M3 21V10l6 3V10l6 3V6h6v15zM7 17h2m4 0h2',
  leaf: 'M5 19c0-8 5-14 15-15-1 10-7 15-15 15Zm0 0 7-7',
};

export default function Icon({ name, size = 18, className, label }: { name: keyof typeof P | string; size?: number; className?: string; label?: string }) {
  const filled = name === 'whatsapp' || name === 'play' || name === 'pause';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      className={className}
    >
      <path d={P[name] ?? ''} />
    </svg>
  );
}
