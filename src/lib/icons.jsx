// Line icons (24x24 grid). Usage: <Icon name="box" size={22} />
const PATHS = {
  home: 'M3 11l9-8 9 8M5 10v10h14V10',
  box: 'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
  coin: 'M12 3v18M16.500 7H10a3 3 0 000 6h4a3 3 0 010 6H7.500',
  leaf: 'M5 19C5 10 11 4 20 4c0 9-6 15-15 15zM5 19l8-8',
  check: 'M20 6L9 17l-5-5',
  users: 'M16 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9.500 10a3.500 3.500 0 100-7 3.500 3.500 0 000 7M21 20v-2a4 4 0 00-3-3.900M16 3.100a3.500 3.500 0 010 6.800',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  kbd: 'M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M7 14h10',
  mic: 'M12 3a3 3 0 013 3v6a3 3 0 01-6 0V6a3 3 0 013-3zM5 11a7 7 0 0014 0M12 18v3',
  bell: 'M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4',
  sliders: 'M4 6h8M16 6h4M4 12h2M10 12h10M4 18h12M12 4v4M8 10v4M16 16v4',
  out: 'M9 21H5V3h4M16 17l5-5-5-5M21 12H9',
  clock: 'M12 7v5l3 2M21 12a9 9 0 11-3-6.700L21 8M21 3v5h-5',
  x: 'M6 6l12 12M18 6L6 18',
  play: 'M7 4l13 8-13 8z',
  stop: 'M6 6h12v12H6z',
  spk: 'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 010 6',
  send: 'M4 12l16-8-6 16-3-7z',
  down: 'M12 4v13M6 12l6 6 6-6',
  up: 'M12 20V7M6 12l6-6 6 6',
  alert: 'M12 4l10 17H2zM12 10v5M12 18h.01',
  clockw: 'M12 6v6l4 2M12 21a9 9 0 100-18 9 9 0 000 18z',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  trend: 'M3 17l6-6 4 4 8-8M15 7h6v6',
};

export function Icon({ name, size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
