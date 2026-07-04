// Hand-rolled geometric icon set — thin-stroke, cohesive with the vault aesthetic.
// All icons inherit currentColor, 1.5px stroke, 24x24 viewBox.

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function Icon({ name, size = 20, className = '', ...rest }) {
  const props = { ...base, width: size, height: size, className, ...rest }
  const p = ICONS[name]
  if (!p) return null
  return <svg {...props} dangerouslySetInnerHTML={{ __html: p }} />
}

export const ICONS = {
  // brand / privacy
  vault: `<path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z"/><path d="M9 11.5 11 13.5 15.5 9"/><circle cx="12" cy="10" r="0.4" fill="currentColor"/>`,
  shieldLock: `<path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5l-8-3Z"/><rect x="9.5" y="10.5" width="5" height="4" rx="1"/><path d="M10.8 10.5v-1a1.2 1.2 0 0 1 2.4 0v1"/>`,
  // modules
  cube: `<path d="M12 2.5 21 7v10l-9 4.5L3 17V7l9-4.5Z"/><path d="m3 7 9 4.5L21 7"/><path d="M12 11.5V21"/>`,
  quill: `<path d="M20 4c-7 1-12 5-15 12l3 3C15 16 19 11 20 4Z"/><path d="M8 16c2 0 4 0 5-1"/><path d="m5 19 3 3"/>`,
  image: `<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m4 17 4.5-4.5L13 16"/><path d="m13 14 3-3 4 4"/>`,
  code: `<path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/><path d="m13 6-2 12"/>`,
  harddrive: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18"/><circle cx="7" cy="14" r="0.6" fill="currentColor"/><circle cx="10" cy="14" r="0.6" fill="currentColor"/>`,
  sliders: `<path d="M4 6h10"/><path d="M18 6h2"/><path d="M4 12h4"/><path d="M12 12h8"/><path d="M4 18h10"/><path d="M18 18h2"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>`,
  home: `<path d="M4 11 12 4l8 7"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/>`,
  // actions
  plus: `<path d="M12 5v14M5 12h14"/>`,
  search: `<circle cx="11" cy="11" r="6"/><path d="m20 20-3.5-3.5"/>`,
  play: `<path d="M7 5.5v13l11-6.5-11-6.5Z"/>`,
  stop: `<rect x="6.5" y="6.5" width="11" height="11" rx="1.5"/>`,
  send: `<path d="M5 12h13"/><path d="m13 6 6 6-6 6"/>`,
  copy: `<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 0 1 1-1h9"/>`,
  download: `<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 19h14"/>`,
  upload: `<path d="M12 20V9"/><path d="m7 14 5-5 5 5"/><path d="M5 5h14"/>`,
  trash: `<path d="M5 7h14"/><path d="M9 7V5h6v2"/><path d="M7 7l1 12h8l1-12"/><path d="M10 11v5M14 11v5"/>`,
  pin: `<path d="M9 4h6l-1 5 3 3H7l3-3-1-5Z"/><path d="M12 12v8"/>`,
  export: `<path d="M12 3v10"/><path d="m8 7 4-4 4 4"/><path d="M5 14v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5"/>`,
  refresh: `<path d="M4 12a8 8 0 0 1 13.5-5.8L20 8"/><path d="M20 4v4h-4"/><path d="M20 12a8 8 0 0 1-13.5 5.8L4 16"/><path d="M4 20v-4h4"/>`,
  lock: `<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>`,
  check: `<path d="m5 12 5 5L20 7"/>`,
  chevronR: `<path d="m9 6 6 6-6 6"/>`,
  chevronD: `<path d="m6 9 6 6 6-6"/>`,
  close: `<path d="M6 6l12 12M18 6 6 18"/>`,
  cpu: `<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3"/>`,
  gpu: `<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="8.5" cy="12" r="2.2"/><circle cx="15.5" cy="12" r="2.2"/><path d="M3 9h18"/>`,
  chip: `<rect x="6" y="6" width="12" height="12" rx="1"/><path d="M9 9h6v6H9z"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>`,
  bolt: `<path d="M13 2 5 13h6l-1 9 8-11h-6l1-9Z"/>`,
  folder: `<path d="M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z"/>`,
  file: `<path d="M6 3h7l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M13 3v5h5"/>`,
  doc: `<path d="M6 3h7l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M8 12h8M8 15h8M8 18h5"/>`,
  globe: `<circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.5 2.2 4 5 4 8s-1.5 5.8-4 8c-2.5-2.2-4-5-4-8s1.5-5.8 4-8Z"/>`,
  scroll: `<path d="M6 4h11a1 1 0 0 1 1 1v13a2 2 0 0 0 2 2H8a2 2 0 0 1-2-2V4Z"/><path d="M6 4a2 2 0 0 0-2 2v1h2"/><path d="M9 8h6M9 11h6M9 14h4"/>`,
  megaphone: `<path d="M4 10v4l9 4V6l-9 4Z"/><path d="M13 8c2 0 3 1.5 3 4s-1 4-3 4"/><path d="M4 10H3v4h1"/>`,
  graduation: `<path d="m3 9 9-4 9 4-9 4-9-4Z"/><path d="M7 11v4c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5v-4"/><path d="M21 9v5"/>`,
  mail: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>`,
  clipboard: `<rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1H9V5Z"/><path d="M9 12h6M9 15h4"/>`,
  compress: `<path d="M5 9h5V4M19 15h-5v5"/><path d="m7 7 3 2M17 17l-3-2"/>`,
  hash: `<path d="M9 4 7 20M17 4l-2 16M5 9h14M4 15h14"/>`,
  film: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 9h18M3 15h18M8 5v14M16 5v14"/>`,
  chart: `<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-7"/>`,
  palette: `<path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.6 0-1.2-1-1.6-1-2.6 0-.8.7-1.4 1.5-1.4H16a4 4 0 0 0 4-4c0-4.4-3.6-7.8-8-7.8Z"/><circle cx="7.5" cy="11" r="1" fill="currentColor"/><circle cx="9.5" cy="7.5" r="1" fill="currentColor"/><circle cx="14" cy="7.5" r="1" fill="currentColor"/>`,
  sparkles: `<path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4Z"/><path d="M18 15l.7 1.8L20.5 17.5 18.7 18.2 18 20l-.7-1.8L15.5 17.5 17.3 16.8 18 15Z"/>`,
  wifiOff: `<path d="M3 4l18 18"/><path d="M9 17a3 3 0 0 1 6 0"/><path d="M6 13a8 8 0 0 1 3-2"/><path d="M18 13a8 8 0 0 0-3-2"/><path d="M3 9a13 13 0 0 1 5-2.5"/>`,
  database: `<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>`,
  terminal: `<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3"/><path d="M13 15h4"/>`,
  cursor: `<path d="M5 4l6 16 2-6 6-2L5 4Z"/>`,
  gauge: `<path d="M4 18a8 8 0 1 1 16 0"/><path d="m12 14 4-4"/><circle cx="12" cy="18" r="0.6" fill="currentColor"/>`,
  layers: `<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>`,
  puzzle: `<path d="M9 4a1.5 1.5 0 0 1 3 0c0 .8.6 1.3 1.3 1.3H15a1 1 0 0 1 1 1v1.4c0 .7.5 1.3 1.3 1.3a1.5 1.5 0 0 1 0 3c-.8 0-1.3.6-1.3 1.3V16a1 1 0 0 1-1 1h-1.4c-.7 0-1.3.5-1.3 1.3a1.5 1.5 0 0 1-3 0c0-.8-.6-1.3-1.3-1.3H6a1 1 0 0 1-1-1v-1.4C5 13.5 4.5 13 3.7 13a1.5 1.5 0 0 1 0-3c.8 0 1.3-.6 1.3-1.3V6a1 1 0 0 1 1-1h1.4C8.4 5 9 4.5 9 4Z"/>`,
  power: `<path d="M12 4v8"/><path d="M7 6a8 8 0 1 0 10 0"/>`,
  eye: `<path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z"/><circle cx="12" cy="12" r="2.5"/>`,
  sun: `<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>`,
  moon: `<path d="M20 13.5A8 8 0 0 1 10.5 4 8 8 0 1 0 20 13.5Z"/>`,
  more: `<circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/>`,
}

export const ICON_NAMES = Object.keys(ICONS)
