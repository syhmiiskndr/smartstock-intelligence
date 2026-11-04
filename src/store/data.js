// Sample data and constants. All figures are illustrative, not real business data.

// Products. `qty` changes while the app runs (use, receive, waste), so this array is mutated in place.
export const P = [
  { id: 'ayam', name: 'Ayam', en: 'Chicken', unit: 'kg', qty: 4.2, cap: 40, reorder: 10, cost: 9.5, exp: 2, avg: 9, sup: 'Segar Jaya' },
  { id: 'tepung', name: 'Tepung', en: 'Flour', unit: 'kg', qty: 38, cap: 50, reorder: 15, cost: 3.2, exp: 120, avg: 11, sup: 'Mill Sentosa' },
  { id: 'minyak', name: 'Minyak', en: 'Oil', unit: 'L', qty: 14, cap: 25, reorder: 8, cost: 7.5, exp: 200, avg: 6, sup: 'Mill Sentosa' },
  { id: 'susu', name: 'Susu', en: 'Milk', unit: 'L', qty: 26, cap: 40, reorder: 10, cost: 6.8, exp: 3, avg: 11, sup: 'Ladang Hijau' },
  { id: 'telur', name: 'Telur', en: 'Eggs', unit: 'biji', qty: 240, cap: 360, reorder: 100, cost: 0.55, exp: 12, avg: 85, sup: 'Segar Jaya' },
  { id: 'beras', name: 'Beras', en: 'Rice', unit: 'kg', qty: 70, cap: 100, reorder: 30, cost: 3.8, exp: 300, avg: 15, sup: 'Mill Sentosa' },
  { id: 'pisang', name: 'Pisang', en: 'Banana', unit: 'kg', qty: 14, cap: 20, reorder: 6, cost: 4.5, exp: 2, avg: 6, sup: 'Ladang Hijau' },
  { id: 'bawang', name: 'Bawang', en: 'Onion', unit: 'kg', qty: 9, cap: 20, reorder: 8, cost: 5.2, exp: 25, avg: 4, sup: 'Segar Jaya' },
];

// Example phrases shown as hints, per language and role.
export const EXAMPLES = {
  ms: {
    admin: ['Buka stok produk', 'Tunjuk stok rendah', 'Kenapa kos naik?', 'Bila ayam habis?', 'Order 20 kilo ayam', 'Lulus', 'Imbas pisang'],
    staff: ['Ayam dah guna 2 kilo', 'Terima 10 liter susu', 'Buang 1 kilo pisang', 'Imbas pisang', 'Buka stok'],
  },
  en: {
    admin: ['Open product stock', 'Show low stock', 'Why did costs rise?', 'When will chicken run out?', 'Order 20 kg chicken', 'Approve', 'Scan banana'],
    staff: ['We used 2 kg chicken', 'Receive 10 litres milk', 'Waste 1 kg banana', 'Scan banana', 'Open stock'],
  },
};

// Dock items per role: [scene, English label, Malay label, icon]
export const NAV = {
  admin: [['home', 'Home', 'Utama', 'home'], ['stock', 'Stock', 'Stok', 'box'], ['cost', 'Cost', 'Kos', 'coin'], ['fresh', 'Fresh', 'Segar', 'leaf'], ['ops', 'Approve', 'Lulus', 'check'], ['people', 'People', 'Orang', 'users'], ['rules', 'Rules', 'Tetapan', 'sliders']],
  staff: [['home', 'Home', 'Utama', 'home'], ['stock', 'Stock', 'Stok', 'box'], ['fresh', 'Fresh', 'Segar', 'leaf']],
};

export const DOCK_COLORS = {
  home: ['#5AC8FA', '#007AFF'], stock: ['#FFB340', '#FF7A00'], cost: ['#4CD964', '#1FAE4B'], fresh: ['#5EE0D0', '#14A7B8'],
  ops: ['#FF6B5E', '#E5243B'], people: ['#C98BF5', '#8B3FD1'], rules: ['#A8A8B0', '#6B6B73'],
};

// scene name <-> route
export const SCENE_PATH = { home: '/', stock: '/stock', cost: '/cost', fresh: '/fresh', ops: '/approvals', people: '/people', rules: '/rules' };
export const pathToScene = (pathname) => Object.keys(SCENE_PATH).find((k) => SCENE_PATH[k] === pathname) || 'home';

// Script for the "1-minute demo" button: [role to switch to (0 = keep), English, Malay]
export const DEMO = [['admin', 'Open product stock', 'Buka stok produk'], [0, 'Show low stock', 'Tunjuk stok rendah'], ['staff', 'We used 2 kg chicken', 'Ayam dah guna 2 kilo'], [0, 'Confirm', 'Betul'], ['admin', 'When will chicken run out?', 'Bila ayam habis?'], [0, 'Order 20 kg chicken', 'Order 20 kilo ayam'], [0, 'Confirm', 'Betul'], [0, 'Approve', 'Lulus'], [0, 'Why did costs rise?', 'Kenapa kos naik?'], [0, 'Scan banana', 'Imbas pisang']];

// Application state. It is one shared object; call emit() (see store.jsx) after changing it.
export const S = {
  role: 'admin', scene: 'home', filter: 'all', lang: 'en', draft: null, pulse: null, demo: false, micBlocked: false, user: null, drawer: null, range: 7,
  use: { ayam: 14, tepung: 12, minyak: 6, susu: 12, telur: 90, beras: 15, pisang: 6, bawang: 4 },
  series: [352, 388, 371, 405, 366, 389],
  requests: [{ id: 1, kind: 'writeoff', title: '', tkey: 'wo', item: 'susu', qty: 3, amount: 20.4, by: 'Siti', reason: '', rkey: 'exp', status: 'pending' }],
  waste: [{ n: 'Susu', amt: 13.6 }, { n: 'Pisang', amt: 9 }, { n: 'Telur', amt: 5.5 }, { n: 'Bawang', amt: 4.2 }],
  tasks: [
    { id: 't1', en: 'Check banana freshness', ms: 'Semak kesegaran pisang', done: false, key: 'fresh' },
    { id: 't2', en: 'Receive 10 L milk', ms: 'Terima 10 L susu', done: false, key: 'receive:susu' },
    { id: 't3', en: 'Log chicken usage', ms: 'Rekod guna ayam', done: false, key: 'usage:ayam' },
  ],
  audit: [], notes: [], orders: [], rid: 2,
  fresh: { res: null, scanning: false, n: 0 },
  rules: { lowAlert: true, expAlert: true, anomaly: true, confirm: true, limit: 15 },
  moves: [
    { p: 'ayam', type: 'usage', q: 3, t: '08:40', who: 'Syafiq' }, { p: 'susu', type: 'receive', q: 20, t: '07:55', who: 'Hakim' },
    { p: 'ayam', type: 'receive', q: 20, t: 'Yesterday', who: 'Hakim' }, { p: 'telur', type: 'usage', q: 30, t: '09:10', who: 'Syafiq' }, { p: 'ayam', type: 'usage', q: 4, t: '10:25', who: 'Syafiq' },
  ],
  // what is on screen right now
  ui: { panel: null, orb: 'idle', hint: '', hintLive: false, cmd: { open: false, mounted: false, note: '' }, island: { mode: '', note: null } },
};
