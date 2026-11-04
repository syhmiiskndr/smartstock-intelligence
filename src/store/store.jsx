// The brain of the app: shared state, helpers, the voice command parser and every action.
// Components read S and call these functions; after any change we call emit() so React re-renders.
import { useSyncExternalStore } from 'react';
import { r2, fq, rm, rm0, clamp, sleep, hhmm } from '../lib/format';
import { Icon } from '../lib/icons';
import { P, S, EXAMPLES, NAV, DEMO, SCENE_PATH } from './data';

export { P, S };
export { fq, rm, rm0, clamp, r2 } from '../lib/format';

/* ---------- subscription (how components hear about changes) ---------- */
const subs = new Set();
let version = 0;
export const emit = () => {
  version += 1;
  subs.forEach((f) => f());
};
const subscribe = (f) => {
  subs.add(f);
  return () => subs.delete(f);
};
export const useStore = () => useSyncExternalStore(subscribe, () => version);

let navigate = () => {};
export const bindNavigate = (fn) => {
  navigate = fn;
};

/* ---------- language and small helpers ---------- */
export const L = (en, ms) => (S.lang === 'ms' ? ms : en);
export const prod = (id) => P.find((p) => p.id === id);
export const pn = (p) => L(p.en, p.name);
export const U = (u) => (u === 'biji' ? L('pcs', 'biji') : u);
export const uw = (u) => (S.lang === 'ms' ? { kg: 'kilo', L: 'liter', biji: 'biji' }[u] : { kg: 'kg', L: 'litres', biji: 'pieces' }[u]);
export const examples = () => EXAMPLES[S.lang][S.role];
export const NAV_ITEMS = () => NAV[S.role];
export const greet = () => {
  const h = new Date().getHours();
  return h < 11 ? L('Good morning', 'Selamat pagi') : h < 15 ? L('Good afternoon', 'Selamat tengah hari') : h < 19 ? L('Good evening', 'Selamat petang') : L('Good evening', 'Selamat malam');
};
export const dateStr = (off) => new Date(Date.now() + off * 864e5).toLocaleDateString(S.lang === 'ms' ? 'ms-MY' : 'en-GB', { day: '2-digit', month: 'short' });

export const costToday = () => P.reduce((a, p) => a + (S.use[p.id] || 0) * p.cost, 0);
export const costAvg = () => S.series.reduce((a, b) => a + b, 0) / S.series.length;
export const stockValue = () => P.reduce((a, p) => a + p.qty * p.cost, 0);
export const pending = () => S.requests.filter((r) => r.status === 'pending');
export const eta = (p) => {
  const h = (p.qty / p.avg) * 24;
  return h < 1 ? L('under 1 hour', 'kurang 1 jam') : h < 36 ? Math.round(h) + L(' hours', ' jam') : (h / 24).toFixed(1) + L(' days', ' hari');
};
export const suggest = (p) => Math.max(10, Math.round((p.avg * 2.5 - p.qty) / 10) * 10);
export const orderSay = (p) => `Order ${suggest(p)} ${uw(p.unit)} ${pn(p).toLowerCase()}`;
export const itemTone = (p) => (p.qty <= p.reorder ? 'bad' : p.exp <= 3 ? 'warn' : 'ok');
export const reqTitle = (r) => {
  const p = prod(r.item), a = `${fq(r.qty)} ${U(p.unit)} ${pn(p)}`;
  return r.kind === 'order' ? `Order ${a}` : L(`Write off ${a}`, `Tulis-off ${a}`);
};
export const reqReason = (r) => {
  const p = prod(r.item);
  return r.rkey === 'exp' ? L('Expired', 'Luput') : r.rkey === 'rep' ? L('Reported spoiled', 'Dilapor rosak') : L('Runs out in ', 'Habis dalam ') + eta(p);
};
export const byName = (b) => (b === 'staff' ? L('Staff', 'Staf') : b);
export const ringMetrics = (p) => {
  const cover = p.qty / p.avg;
  return [
    { k: 'stock', v: clamp((p.qty / p.cap) * 100, 3, 100), crit: p.qty <= p.reorder, label: L('Stock', 'Stok'), val: `${fq(p.qty)} / ${p.cap} ${U(p.unit)}` },
    { k: 'fresh', v: p.exp >= 14 ? 100 : clamp((p.exp / 14) * 100, 3, 100), crit: p.exp <= 3, label: L('Freshness', 'Kesegaran'), val: p.exp >= 14 ? L('Good', 'Baik') : `${p.exp} ${L('days', 'hari')}` },
    { k: 'cover', v: clamp((cover / 5) * 100, 3, 100), crit: cover < 1, label: L('Cover', 'Tempoh'), val: eta(p) },
  ];
};
// last 7 or 30 days of cost (deterministic sample data, today is real)
export function seriesN(n) {
  if (n === 7) return [...S.series, costToday()];
  let s = 11;
  const out = [];
  for (let i = 0; i < n - 1; i++) {
    s = (s * 9301 + 49297) % 233280;
    out.push(Math.round(345 + 70 * Math.sin(i / 3.2) + (50 * s) / 233280));
  }
  out.push(costToday());
  return out;
}
export function hist(p) {
  let s = [...p.id].reduce((a, c) => a + c.charCodeAt(0), 7);
  const out = [];
  for (let i = 0; i < 13; i++) {
    s = (s * 9301 + 49297) % 233280;
    out.push(r2(p.avg * (0.78 + (0.44 * s) / 233280)));
  }
  out.push(S.use[p.id]);
  return out;
}
export function batches(p) {
  const a = r2(p.qty * 0.4), b = r2(p.qty - a), k = p.id.slice(0, 2).toUpperCase(), far = p.exp <= 3 ? 4 : 14;
  return [{ id: `B-${k}-204`, rec: -3, exp: p.exp, qty: a }, { id: `B-${k}-205`, rec: -1, exp: p.exp + far, qty: b }];
}

/* ---------- timers that must stop when you sign out ---------- */
let live = [];
const later = (fn, ms) => {
  const id = setTimeout(fn, ms);
  live.push(id);
  return id;
};
const clearLive = () => {
  live.forEach(clearTimeout);
  live = [];
};

/* ---------- navigation ---------- */
export function go(scene) {
  if (S.role === 'staff' && !['home', 'stock', 'fresh'].includes(scene)) return deny();
  closeDrawer();
  S.scene = scene;
  navigate(SCENE_PATH[scene]);
  emit();
}
function deny() {
  panel({ state: L('No access', 'Tiada akses'), tone: 'bad', title: L('This screen is for admins only.', 'Skrin ini untuk admin sahaja.'), chips: [{ label: L('Open stock', 'Buka stok'), say: L('Open stock', 'Buka stok') }], ttl: 5000 });
}

/* ---------- the panel (answers, questions, confirmations) ---------- */
let panelTimer;
export function panel(o) {
  clearTimeout(panelTimer);
  S.ui.panel = { ...o, show: true, k: Math.random() };
  if (!o.persist) panelTimer = setTimeout(hidePanel, o.ttl || 9000);
  emit();
}
export function hidePanel() {
  if (S.ui.panel && S.ui.panel.show) {
    S.ui.panel = { ...S.ui.panel, show: false };
    emit();
  }
}

/* ---------- Dynamic Island: voice state, hints, live alerts ---------- */
export function setOrb(s) {
  S.ui.orb = s;
  if (s !== 'idle') S.ui.island = { ...S.ui.island, mode: '' };
  emit();
}
export function setHint(t, liveText) {
  S.ui.hint = t;
  S.ui.hintLive = !!liveText;
  emit();
}
let hintTimer, hintI = 0;
const rotateHint = () => {
  const ex = examples();
  setHint(`${L('Try saying', 'Cuba sebut')} “${ex[hintI++ % ex.length]}”`);
};
export function startHints() {
  clearInterval(hintTimer);
  rotateHint();
  hintTimer = setInterval(() => {
    if (S.ui.orb === 'idle' && !S.ui.cmd.open) rotateHint();
  }, 4200);
}
export const stopHints = () => clearInterval(hintTimer);

const islQ = [];
let islBusy = false;
function pumpIsland() {
  if (islBusy || !islQ.length) return;
  if (S.ui.orb !== 'idle') {
    setTimeout(pumpIsland, 900);
    return;
  }
  islBusy = true;
  const n = islQ.shift();
  S.ui.island = { mode: 'note', note: n };
  emit();
  setTimeout(() => {
    S.ui.island = { ...S.ui.island, mode: '' };
    islBusy = false;
    emit();
    setTimeout(pumpIsland, 450);
  }, 4800);
}
export function notify(tone, title, body) {
  S.notes.unshift({ tone, title, body, t: new Date(), read: false });
  islQ.push({ tone, title, body });
  pumpIsland();
  emit();
}
export function showNotes() {
  S.notes.forEach((n) => (n.read = true));
  const rows = S.notes.length ? (
    S.notes.slice(0, 8).map((n, i) => (
      <div key={i}><i className={n.tone} /><span><b>{n.title}</b>{n.body}</span><time>{hhmm(n.t)}</time></div>
    ))
  ) : (
    <p className="p-body">{L('Nothing yet. SmartStock will alert you about low stock, expiry and orders.', 'Belum ada. SmartStock akan beri amaran stok rendah, luput dan order.')}</p>
  );
  panel({ state: L('Notifications', 'Notifikasi'), title: L('What needs your attention', 'Apa yang perlukan perhatian'), node: <div className="nl">{rows}</div>, persist: true });
}

/* ---------- typed command bar ---------- */
const NOMIC = () => L('Microphone is not available here. Type, or tap a phrase to simulate voice.', 'Mikrofon tidak aktif di sini. Taip atau tekan frasa untuk demo suara.');
export function openCmd(note) {
  hidePanel();
  S.ui.cmd = { open: true, mounted: true, note: note || L('Type a command, or tap a phrase.', 'Taip arahan atau tekan satu frasa.') };
  emit();
}
export function closeCmd() {
  S.ui.cmd = { ...S.ui.cmd, open: false };
  emit();
  setTimeout(() => {
    if (!S.ui.cmd.open) {
      S.ui.cmd = { ...S.ui.cmd, mounted: false };
      emit();
    }
  }, 250);
}
export async function submitCmd(v) {
  closeCmd();
  setOrb('processing');
  await sleep(350);
  setOrb('idle');
  run(v, 'text');
}

/* ---------- voice: simulated (works everywhere) and real (Web Speech API) ---------- */
let typing = null;
export function speakSim(text) {
  return new Promise((res) => {
    closeCmd();
    hidePanel();
    clearInterval(typing);
    setOrb('listening');
    let i = 0;
    const step = Math.max(18, Math.min(45, 1300 / text.length));
    typing = setInterval(() => {
      i++;
      setHint('“' + text.slice(0, i) + '”', true);
      if (i >= text.length) {
        clearInterval(typing);
        setOrb('processing');
        setTimeout(() => {
          setOrb('idle');
          setHint('');
          run(text, 'voice');
          startHints();
          res();
        }, 450);
      }
    }, step);
  });
}
const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
let rec = null;
export const abortListening = () => {
  try { rec && rec.abort(); } catch (e) { /* not running */ }
};
function listen() {
  if (!SR || S.micBlocked) return openCmd(S.micBlocked ? NOMIC() : L('This browser has no speech recognition. Type, or tap a phrase.', 'Pelayar ini tiada pengecaman suara. Taip atau tekan frasa.'));
  try {
    rec = new SR();
    rec.lang = S.lang === 'ms' ? 'ms-MY' : 'en-US';
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    let final = '', got = false;
    rec.onstart = () => { setOrb('listening'); setHint(L('Listening…', 'Mendengar…'), true); hidePanel(); };
    rec.onresult = (e) => {
      let t = '';
      for (const r of e.results) { t += r[0].transcript; if (r.isFinal) final = t; }
      setHint('“' + t + '”', true);
    };
    rec.onerror = (e) => {
      got = true; setOrb('idle'); startHints();
      if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(e.error)) { S.micBlocked = true; openCmd(NOMIC()); }
      else if (e.error === 'no-speech') panel({ state: L("Didn't catch that", 'Tak dengar'), tone: 'bad', title: L('No speech detected. Try again.', 'Tiada suara dikesan. Cuba lagi.'), ttl: 4000 });
    };
    rec.onend = () => {
      if (S.ui.orb === 'listening') { setOrb('idle'); startHints(); }
      if (final && !got) { got = true; setOrb('processing'); setTimeout(() => { setOrb('idle'); run(final, 'voice'); startHints(); }, 300); }
    };
    rec.start();
  } catch (err) {
    S.micBlocked = true;
    openCmd(NOMIC());
  }
}
export function orbClick() {
  const st = S.ui.orb;
  if (st === 'listening') {
    try { rec && rec.stop(); } catch (e) { /* ignore */ }
    clearInterval(typing); setOrb('idle'); startHints();
    return;
  }
  if (st === 'idle') listen();
}

/* ---------- audit trail ---------- */
function log(text, intent, status) {
  S.audit.unshift({ t: new Date(), who: S.role, text, intent, status });
}
export function showAudit() {
  const cls = (s) => (/Rejected|Not allowed|Not understood|Ditolak|Tidak/.test(s) ? 'bad' : /Awaiting|Menunggu/.test(s) ? 'warn' : 'ok');
  const rows = S.audit.length ? (
    S.audit.slice(0, 8).map((a, i) => (
      <div key={i}>
        <time>{hhmm(a.t)}</time>
        <span><b>{a.text}</b><br /><span className="say" style={{ margin: 0 }}>{a.who === 'admin' ? 'Admin' : L('Staff', 'Staf')} · {a.intent}</span></span>
        <span className={'pill ' + cls(a.status)}>{a.status}</span>
      </div>
    ))
  ) : (
    <p className="p-body">{L('No commands yet. Every voice command is recorded here.', 'Belum ada arahan. Setiap arahan suara akan direkod di sini.')}</p>
  );
  panel({ state: L('Command trail', 'Jejak arahan'), title: L('Who said what, and what happened', 'Siapa cakap apa, dan apa jadi'), node: <div className="log">{rows}</div>, persist: true });
}

/* ---------- language: parse Malay and English, always both ---------- */
const norm = (t) => t.toLowerCase().replace(/[.,!?'"“”]/g, ' ').replace(/\s+/g, ' ').trim();
const SYN = [['ayam', 'ayam'], ['chicken', 'ayam'], ['tepung', 'tepung'], ['flour', 'tepung'], ['susu', 'susu'], ['milk', 'susu'], ['telur', 'telur'], ['eggs', 'telur'], ['egg', 'telur'], ['beras', 'beras'], ['rice', 'beras'], ['minyak', 'minyak'], ['oil', 'minyak'], ['pisang', 'pisang'], ['banana', 'pisang'], ['bawang', 'bawang'], ['onions', 'bawang'], ['onion', 'bawang']];
const findItem = (t) => {
  for (const [w, id] of SYN) if (new RegExp('\\b' + w + '\\b').test(t)) return id;
  return null;
};
const NW = { setengah: 0.5, separuh: 0.5, half: 0.5, satu: 1, one: 1, dua: 2, two: 2, tiga: 3, three: 3, empat: 4, four: 4, lima: 5, five: 5, enam: 6, six: 6, tujuh: 7, seven: 7, lapan: 8, eight: 8, sembilan: 9, nine: 9, sepuluh: 10, ten: 10, 'dua puluh': 20, twenty: 20, 'tiga puluh': 30, thirty: 30, 'lima puluh': 50, fifty: 50 };
const UR = '(kilogram|kilos|kilo|kg|grams|gram|g|millilitre|ml|litres|litre|liters|liter|l|biji|butir|pcs|pieces|piece|keping)';
const UM = { kilogram: 'kg', kilos: 'kg', kilo: 'kg', kg: 'kg', grams: 'g', gram: 'g', g: 'g', millilitre: 'ml', ml: 'ml', litres: 'L', litre: 'L', liters: 'L', liter: 'L', l: 'L', biji: 'biji', butir: 'biji', pcs: 'biji', pieces: 'biji', piece: 'biji', keping: 'biji' };
function findQty(t) {
  let n = null, u = null;
  const m = t.match(new RegExp('(\\d+(?:[.,]\\d+)?)\\s*' + UR + '?(?![a-z])'));
  if (m) { n = parseFloat(m[1].replace(',', '.')); u = m[2]; }
  else for (const k of Object.keys(NW).sort((a, b) => b.length - a.length)) {
    const mm = t.match(new RegExp('\\b' + k + '\\b\\s*' + UR + '?(?![a-z])'));
    if (mm) { n = NW[k]; u = mm[2]; break; }
  }
  if (n == null) return null;
  u = u ? UM[u] : null;
  if (u === 'g') { n /= 1000; u = 'kg'; }
  if (u === 'ml') { n /= 1000; u = 'L'; }
  return { n, u };
}
const V = { usage: /\b(guna|digunakan|used|use|potong|keluarkan)\b/, receive: /\b(terima|receive|received|receiving|masuk|tambah|restock)\b/, order: /\b(order|tempah|pesan|beli|purchase)\b/, waste: /\b(buang|waste|wasted|rosak|basi|spoiled)\b/ };
const YES = /\b(ya|yes|betul|ok|okay|confirm|setuju|boleh|sahkan|correct)\b/;
const NO = /\b(tak|tidak|no|batal|cancel|salah|ulang)\b/;
const NAVR = [['home', /\b(utama|home|dashboard|balik|mula)\b/], ['stock', /\b(stok|stock|produk|product|inventori|inventory|barang)\b/], ['cost', /\b(kos|cost|kewangan|belanja)\b/],
  ['fresh', /\b(segar|fresh|freshness|kesegaran|imbas|scan|sisa|waste)\b/], ['ops', /\b(lulus|kelulusan|approve|approval|approvals|tindakan|operasi|operations)\b/], ['rules', /\b(rules|automation|settings|tetapan|automasi|peraturan)\b/], ['people', /\b(pasukan|team|staf|staff|pembekal|supplier|suppliers|orang|people)\b/]];
const navName = (id) => {
  const n = NAV.admin.find((x) => x[0] === id);
  return n ? L(n[1], n[2]).toLowerCase() : id;
};
const INTENT = { order: ['Order', 'Order'], usage: ['Use stock', 'Guna stok'], receive: ['Receive stock', 'Terima stok'], waste: ['Report waste', 'Lapor sisa'] };

export function run(raw) {
  const text = raw.trim();
  if (!text) return;
  const t = norm(text);
  const d = S.draft;
  if (d) {
    if (d.awaiting === 'confirm') {
      if (YES.test(t)) { log(text, L('Confirm', 'Sahkan'), L('Done', 'Dilaksana')); return commit(); }
      if (NO.test(t)) { log(text, L('Cancel', 'Batal'), L('Cancelled', 'Dibatalkan')); return cancelDraft(); }
    } else if (d.awaiting === 'item') {
      const it = findItem(t);
      if (it) { d.item = it; log(text, L('Pick item', 'Pilih item'), L('Accepted', 'Diterima')); return advance(); }
    } else if (d.awaiting === 'qty') {
      const q = findQty(t);
      if (q) { d.qty = q.n; d.u = q.u; log(text, L('Pick quantity', 'Pilih kuantiti'), L('Accepted', 'Diterima')); return advance(); }
    }
    S.draft = null;
  }
  const item = findItem(t), q = findQty(t), navVerb = /\b(buka|open|pergi|go|tunjuk|show)\b/.test(t);
  // transactions
  for (const k of ['order', 'usage', 'receive', 'waste']) {
    if (V[k].test(t) && (item || q || k === 'order')) {
      log(text, L(...INTENT[k]), L('Awaiting confirmation', 'Menunggu pengesahan'));
      return startDraft(k, item, q ? q.n : null, q ? q.u : null, text);
    }
  }
  // approvals
  if ((!navVerb && /\b(lulus|luluskan|approve|approved)\b/.test(t) && pending().length) || /\b(tolak|reject|decline)\b/.test(t)) {
    const ok = !/\b(tolak|reject|decline)\b/.test(t);
    log(text, ok ? L('Approve', 'Lulus') : L('Reject', 'Tolak'), S.role === 'admin' ? L('Done', 'Dilaksana') : L('Not allowed', 'Tidak dibenarkan'));
    return decide(ok, text);
  }
  // questions
  if (/\b(nilai|worth|value)\b/.test(t) && /\b(stok|stock|inventori|inventory)\b/.test(t)) {
    log(text, L('Stock value question', 'Soalan nilai stok'), L('Answered', 'Dijawab'));
    if (S.role !== 'admin') return deny();
    return panel({ state: L('Answer', 'Jawapan'), said: text, title: L('Stock value right now', 'Nilai stok sekarang'), big: rm0(stockValue()), facts: [[L('items', 'item'), String(P.length)], [L('method', 'kaedah'), L('balance × unit cost', 'baki × kos seunit')]], chips: [{ label: L('Open stock', 'Buka stok'), say: L('Open stock', 'Buka stok') }] });
  }
  if (/\b(kenapa|mengapa|why)\b/.test(t) && /\b(kos|cost|costs)\b/.test(t)) {
    log(text, L('Cost question', 'Soalan kos'), L('Answered', 'Dijawab'));
    if (S.role !== 'admin') return deny();
    const dr = P.map((p) => ({ p, x: (S.use[p.id] - p.avg) * p.cost })).sort((a, b) => b.x - a.x)[0], pct = Math.round((costToday() / costAvg() - 1) * 100);
    return panel({ state: L('Answer', 'Jawapan'), said: text, title: L(`${pn(dr.p)} pushes cost up the most`, `${pn(dr.p)} paling menaikkan kos`), big: '+' + rm0(dr.x), facts: [[L('used today', 'guna hari ini'), `${fq(S.use[dr.p.id])} ${U(dr.p.unit)}`], [L('usual', 'biasa'), `${dr.p.avg} ${U(dr.p.unit)}`], [L('total cost', 'jumlah kos'), `${pct >= 0 ? '+' : ''}${pct}%`]], chips: [{ label: L('Open cost', 'Buka kos'), say: L('Open cost', 'Buka kos') }], ttl: 14000 });
  }
  if (item && !V.usage.test(t) && /\b(bila|when|habis|run out|runs out|lama|how long)\b/.test(t)) {
    const p = prod(item);
    log(text, L('Stock forecast', 'Ramalan stok'), L('Answered', 'Dijawab'));
    return panel({ state: L('Estimate', 'Anggaran'), said: text, title: L(`${pn(p)} will last`, `${pn(p)} cukup untuk`), big: eta(p), facts: [[L('balance', 'baki'), `${fq(p.qty)} ${U(p.unit)}`], [L('average use', 'purata guna'), `${p.avg} ${U(p.unit)}/${L('day', 'hari')}`], [L('based on', 'asas'), L('14 days of sample data', '14 hari data contoh')]], body: L('Estimated from average use, not guaranteed.', 'Anggaran dari purata guna, bukan jaminan.'), chips: S.role === 'admin' ? [{ label: `Order ${suggest(p)} ${U(p.unit)}`, say: orderSay(p) }] : [], ttl: 14000 });
  }
  if (/\b(ringkasan|briefing|summary|brief)\b/.test(t)) { log(text, L('Daily briefing', 'Ringkasan harian'), L('Answered', 'Dijawab')); go('home'); return setTimeout(speakBrief, 700); }
  // filters
  if (/\b(expire|expires|expiry|expiring|luput|tamat tempoh|hampir tamat)\b/.test(t)) { log(text, L('Filter expiring', 'Tapis hampir luput'), L('Navigated', 'Navigasi')); S.filter = 'exp'; return go('stock'); }
  if (/\b(rendah|low|hampir habis|kurang|nak habis)\b/.test(t)) { log(text, L('Filter low stock', 'Tapis stok rendah'), L('Navigated', 'Navigasi')); S.filter = 'low'; return go('stock'); }
  // navigation
  for (const [sc, re] of NAVR) {
    if (re.test(t)) {
      if (S.role === 'staff' && !['home', 'stock', 'fresh'].includes(sc)) { log(text, L('Open ', 'Buka ') + navName(sc), L('Not allowed', 'Tidak dibenarkan')); return deny(); }
      log(text, L('Open ', 'Buka ') + navName(sc), L('Navigated', 'Navigasi'));
      if (sc === 'stock') S.filter = 'all';
      const auto = sc === 'fresh' && /\b(imbas|scan)\b/.test(t);
      go(sc);
      if (auto) setTimeout(scan, 900);
      return;
    }
  }
  if (item) { log(text, L('Item details', 'Butiran item'), L('Navigated', 'Navigasi')); S.filter = 'all'; go('stock'); return setTimeout(() => openDetail(item), 500); }
  log(text, L('Not understood', 'Tidak faham'), L('Not understood', 'Tidak difahami'));
  panel({ state: L('Not sure', 'Saya tak pasti'), tone: 'bad', said: text, title: L('Try one of these:', 'Cuba salah satu ini:'), chips: examples().slice(0, 4).map((x) => ({ label: x, say: x })), ttl: 12000 });
}

/* ---------- guided actions: ask only for what is missing, validate, confirm ---------- */
const TITLES = () => ({ usage: L('Use what?', 'Guna apa?'), receive: L('Receive what?', 'Terima apa?'), order: L('Order what?', 'Order apa?'), waste: L('Waste what?', 'Buang apa?') });
const QOPT = (t, p) => (p.unit === 'biji' ? [10, 30, 60] : t === 'order' ? [10, 20, 50] : [0.5, 1, 2, 5]);
const VERB = () => ({ usage: L('Use', 'Guna'), receive: L('Receive', 'Terima'), order: 'Order', waste: L('Waste', 'Buang') });
export function startDraft(type, item, qty, u, said) {
  S.draft = { type, item, qty, u, said };
  advance();
}
function cancelDraft() {
  S.draft = null;
  panel({ state: L('Cancelled', 'Dibatalkan'), title: L('No changes made.', 'Tiada perubahan dibuat.'), ttl: 2500 });
}
function advance() {
  const d = S.draft;
  if (!d) return;
  if (!d.item) {
    d.awaiting = 'item';
    return panel({ state: L('Question', 'Tanya'), tone: 'warn', said: d.said, title: TITLES()[d.type], chips: P.map((p) => ({ label: pn(p), fn: () => { d.item = p.id; advance(); } })), persist: true });
  }
  const p = prod(d.item);
  if (d.u && d.u !== p.unit) {
    S.draft = null;
    return panel({ state: L('Unit mismatch', 'Unit tak sepadan'), tone: 'bad', title: L(`${pn(p)} is measured in ${U(p.unit)}, not ${U(d.u)}.`, `${pn(p)} diukur dalam ${U(p.unit)}, bukan ${U(d.u)}.`), chips: [{ label: L('Try again', 'Cuba lagi'), say: `${VERB()[d.type]} 2 ${uw(p.unit)} ${pn(p).toLowerCase()}` }], ttl: 7000 });
  }
  if (d.qty == null) {
    d.awaiting = 'qty';
    return panel({ state: L('Question', 'Tanya'), tone: 'warn', said: d.said, title: L(`How many ${U(p.unit)} of ${pn(p).toLowerCase()}?`, `Berapa ${U(p.unit)} ${pn(p).toLowerCase()}?`), chips: QOPT(d.type, p).map((n) => ({ label: `${n} ${U(p.unit)}`, fn: () => { d.qty = n; advance(); } })), persist: true });
  }
  const q = d.qty;
  if (q <= 0) {
    S.draft = null;
    return panel({ state: L('Invalid', 'Tidak sah'), tone: 'bad', title: L('Quantity must be above zero.', 'Kuantiti mesti lebih daripada sifar.'), ttl: 4000 });
  }
  if ((d.type === 'usage' || d.type === 'waste') && q > p.qty) {
    S.draft = null;
    log(d.said || '', VERB()[d.type], L('Rejected (not enough stock)', 'Ditolak (stok tak cukup)'));
    return panel({ state: L('Checked by system', 'Disemak sistem'), tone: 'bad', title: L(`Only ${fq(p.qty)} ${U(p.unit)} of ${pn(p).toLowerCase()} in stock.`, `Stok ${pn(p).toLowerCase()} cuma ${fq(p.qty)} ${U(p.unit)}.`), body: L('The system does not allow a negative balance.', 'Sistem tak benarkan baki jadi negatif.'), chips: [{ label: `${fq(p.qty)} ${U(p.unit)}`, fn: () => startDraft(d.type, d.item, p.qty) }], ttl: 9000 });
  }
  if (d.type === 'receive' && p.qty + q > p.cap) {
    S.draft = null;
    return panel({ state: L('Checked by system', 'Disemak sistem'), tone: 'bad', title: L(`Exceeds ${pn(p).toLowerCase()} capacity (${p.cap} ${U(p.unit)}).`, `Melebihi kapasiti ${pn(p).toLowerCase()} (${p.cap} ${U(p.unit)}).`), ttl: 7000 });
  }
  d.awaiting = 'confirm';
  if (!S.rules.confirm && (d.type === 'usage' || d.type === 'receive')) return commit();
  const amt = q * p.cost, sign = d.type === 'receive' ? '+' : d.type === 'order' ? '' : '−';
  const lvl = d.type === 'order' ? L('Needs admin approval', 'Perlu kelulusan admin') : d.type === 'waste' && amt > S.rules.limit ? L(`Over RM ${S.rules.limit}, needs approval`, `Melebihi RM ${S.rules.limit}, perlu kelulusan`) : '';
  const facts = d.type === 'order' ? [[L('estimate', 'anggaran'), rm(amt)], [L('supplier', 'pembekal'), p.sup]] : [[L('new balance', 'baki baru'), `${fq(d.type === 'receive' ? p.qty + q : p.qty - q)} ${U(p.unit)}`], ...(S.role === 'admin' ? [[L('cost', 'kos'), rm(amt)]] : [])];
  panel({
    state: lvl || L('Confirm', 'Sahkan'), tone: lvl ? 'warn' : '', said: d.said, title: VERB()[d.type] + ' ' + pn(p).toLowerCase(), big: `${sign}${fq(q)} ${U(p.unit)}`, facts,
    actions: [{ label: L('Redo', 'Ulang'), fn: () => { S.draft = null; hidePanel(); } }, { label: d.type === 'order' && S.role === 'staff' ? L('Send to admin', 'Hantar kepada admin') : L('Confirm', 'Betul'), kind: 'ok', fn: commit }],
    bigBtn: true, persist: true,
    node: <span className="say" style={{ marginTop: 12 }}>{L('or say', 'atau sebut')} <q>{L('confirm', 'betul')}</q></span>,
  });
}
function tick(key) {
  const t = S.tasks.find((x) => x.key === key && !x.done);
  if (t) t.done = true;
}
function addMove(p, type, q) {
  S.moves.unshift({ p: p.id, type, q, t: hhmm(new Date()), who: S.role === 'admin' ? 'Syahmi' : 'Syafiq' });
}
function addReq(r) {
  r.id = S.rid++;
  r.status = 'pending';
  S.requests.unshift(r);
  emit();
}
function commit() {
  const d = S.draft;
  if (!d) return;
  S.draft = null;
  const p = prod(d.item), q = d.qty, amt = q * p.cost, before = p.qty, n = pn(p).toLowerCase();
  if (d.type === 'usage') {
    p.qty = r2(p.qty - q); S.use[p.id] += q; tick('usage:' + p.id); addMove(p, 'usage', q);
    const crossed = before > p.reorder && p.qty <= p.reorder && S.rules.lowAlert;
    if (crossed) notify('bad', L('Low stock: ' + pn(p), 'Stok rendah: ' + pn(p)), L(`${fq(p.qty)} ${U(p.unit)} left. Alert sent to admin.`, `Baki ${fq(p.qty)} ${U(p.unit)}. Amaran dihantar kepada admin.`));
    S.pulse = p.id; emit();
    panel({
      state: L('Recorded', 'Direkod'), tone: 'ok', title: L(`${pn(p)}: ${fq(p.qty)} ${U(p.unit)} left`, `${pn(p)}: baki ${fq(p.qty)} ${U(p.unit)}`),
      body: S.role === 'admin' ? L(`Cost today ${rm(costToday())}.`, `Kos hari ini ${rm(costToday())}.`) : L('Thanks. Cost is calculated automatically.', 'Terima kasih. Kos dikira automatik.'),
      node: crossed ? <div className="row"><span className="pill bad"><Icon name="alert" size={13} />{L('Low-stock alert sent to admin', 'Amaran stok rendah dihantar kepada admin')}</span></div> : null,
      chips: crossed && S.role === 'admin' ? [{ label: `Order ${suggest(p)} ${U(p.unit)}`, say: orderSay(p) }] : [], ttl: 10000,
    });
  } else if (d.type === 'receive') {
    p.qty = r2(p.qty + q); tick('receive:' + p.id); addMove(p, 'receive', q); receivePO(p); S.pulse = p.id; emit();
    panel({ state: L('Recorded', 'Direkod'), tone: 'ok', title: L(`${pn(p)}: ${fq(p.qty)} ${U(p.unit)} now`, `${pn(p)}: baki ${fq(p.qty)} ${U(p.unit)}`), body: L('New batch added with an expiry date.', 'Kelompok baru ditambah dengan tarikh luput.'), ttl: 7000 });
  } else if (d.type === 'waste') {
    if (amt > S.rules.limit) {
      addReq({ kind: 'writeoff', item: p.id, qty: q, amount: amt, by: S.role === 'admin' ? 'Syahmi' : 'staff', rkey: 'rep' });
      panel({ state: L('Awaiting approval', 'Menunggu kelulusan'), tone: 'warn', title: L('Sent to admin.', 'Dihantar kepada admin.'), body: L(`${rm(amt)} is above the automatic write-off limit.`, `${rm(amt)} melebihi had tulis-off automatik.`), ttl: 7000 });
    } else {
      p.qty = r2(p.qty - q); addMove(p, 'waste', q); S.waste.push({ n: pn(p), amt }); S.pulse = p.id; emit();
      panel({ state: L('Recorded', 'Direkod'), tone: 'ok', title: L(`Waste logged: ${fq(q)} ${U(p.unit)} ${n}.`, `Sisa ${fq(q)} ${U(p.unit)} ${n} direkod.`), body: L(`Waste cost ${rm(amt)}.`, `Kos sisa ${rm(amt)}.`), ttl: 7000 });
    }
  } else if (d.type === 'order') {
    const dup = pending().find((r) => r.kind === 'order' && r.item === p.id);
    if (!dup) addReq({ kind: 'order', item: p.id, qty: q, amount: amt, supplier: p.sup, by: S.role === 'admin' ? 'Syahmi' : 'staff', rkey: 'low' });
    if (S.role === 'admin') {
      go('ops');
      setTimeout(() => panel({ state: dup ? L('Already waiting', 'Sudah menunggu') : L('Awaiting approval', 'Menunggu kelulusan'), tone: 'warn', title: L(`The ${n} order is on the top card.`, `Order ${n} ada di kad atas.`), ttl: 5000 }), 900);
    } else panel({ state: L('Sent', 'Dihantar'), tone: 'ok', title: L('Order suggestion sent to admin.', 'Cadangan order dihantar kepada admin.'), ttl: 6000 });
  }
}
export function decide(ok, said) {
  if (S.role !== 'admin') return panel({ state: L('No access', 'Tiada akses'), tone: 'bad', title: L('Only admins can approve.', 'Hanya admin boleh meluluskan.'), ttl: 4000 });
  const r = pending()[0];
  if (!r) return panel({ state: L('None', 'Tiada'), title: L('Nothing is waiting for approval.', 'Tiada kelulusan menunggu.'), ttl: 3000 });
  r.status = ok ? 'approved' : 'rejected';
  if (ok && r.kind === 'order') newPO(r);
  if (ok && r.kind === 'writeoff') { const p = prod(r.item); p.qty = r2(Math.max(0, p.qty - r.qty)); S.waste.push({ n: pn(p), amt: r.amount }); }
  if (S.scene === 'ops') emit(); else go('ops');
  panel({ state: ok ? L('Approved', 'Dilulus') : L('Rejected', 'Ditolak'), tone: ok ? 'ok' : 'bad', said, title: ok ? (r.kind === 'order' ? L(`Order sent to ${r.supplier}.`, `Order dihantar kepada ${r.supplier}.`) : L('Stock written off and waste cost calculated.', 'Stok ditulis-off dan kos sisa dikira.')) : L('Request rejected and recorded.', 'Permintaan ditolak dan direkod.'), body: L('The action is in the audit trail.', 'Tindakan masuk jejak audit.'), chips: [{ label: L('View trail', 'Lihat jejak'), fn: showAudit }], ttl: 8000 });
}
export function decideFromUi(ok, how) {
  const label = how === 'button' ? L('(button)', '(butang)') : ok ? L('(drag right)', '(seret kanan)') : L('(drag left)', '(seret kiri)');
  log(label, ok ? L('Approve', 'Lulus') : L('Reject', 'Tolak'), L('Done', 'Dilaksana'));
  decide(ok);
}

/* ---------- purchase order tracking ---------- */
export const STEPS = () => [L('Approved', 'Dilulus'), L('Sent', 'Dihantar'), L('Confirmed', 'Disahkan'), L('Delivered', 'Tiba')];
function newPO(r) {
  const p = prod(r.item), po = { no: 1042 + S.orders.length, item: p.id, qty: r.qty, sup: r.supplier || p.sup, step: 1, done: false };
  S.orders.unshift(po);
  notify('ok', L(`PO #${po.no} sent`, `PO #${po.no} dihantar`), L(`${fq(po.qty)} ${U(p.unit)} ${pn(p).toLowerCase()} to ${po.sup}.`, `${fq(po.qty)} ${U(p.unit)} ${pn(p).toLowerCase()} kepada ${po.sup}.`));
  later(() => { po.step = 2; notify('ok', L(`${po.sup} confirmed`, `${po.sup} sahkan`), L('Delivery tomorrow, 8 am.', 'Penghantaran esok, 8 pagi.')); emit(); }, 7000);
  later(() => { po.step = 3; notify('warn', L(`PO #${po.no} delivered`, `PO #${po.no} tiba`), L(`Say "${L('Receive', 'Terima')} ${fq(po.qty)} ${uw(p.unit)} ${pn(p).toLowerCase()}".`, `Sebut "${L('Receive', 'Terima')} ${fq(po.qty)} ${uw(p.unit)} ${pn(p).toLowerCase()}".`)); emit(); }, 16000);
}
function receivePO(p) {
  const po = S.orders.find((o) => o.item === p.id && o.step === 3 && !o.done);
  if (po) { po.done = true; notify('ok', L(`PO #${po.no} received`, `PO #${po.no} diterima`), L('Stock updated and batch recorded.', 'Stok dikemas kini dan kelompok direkod.')); }
}

/* ---------- freshness scan (demo), drawer, briefing ---------- */
export function scan() {
  if (S.scene !== 'fresh' || S.fresh.scanning) return;
  S.fresh.scanning = true; S.fresh.res = null; emit();
  setTimeout(() => {
    const bad = S.fresh.n % 2 === 1;
    S.fresh.n++; S.fresh.res = { bad, conf: bad ? 88 : 94 }; S.fresh.scanning = false; tick('fresh');
    log(L('(scan)', '(imbas)'), L('Freshness classification', 'Klasifikasi segar'), bad ? L('Spoiled 88%', 'Rosak 88%') : L('Fresh 94%', 'Segar 94%'));
    emit();
  }, 1600);
}
export function openDetail(id) {
  S.drawer = id;
  hidePanel();
  emit();
}
export function closeDrawer() {
  if (S.drawer) { S.drawer = null; emit(); }
}
export function speakBrief() {
  const low = P.filter((p) => p.qty <= p.reorder);
  const txt = L(
    `${greet()}, Syahmi. ${low.length ? low.map((p) => `${pn(p)} is almost out, about ${eta(p)} left.`).join(' ') : 'Stock levels are healthy.'} Cost today is ${Math.round(costToday())} ringgit.`,
    `${greet()}, Syahmi. ${low.length ? low.map((p) => `${pn(p)} hampir habis, cukup ${eta(p)}.`).join(' ') : 'Stok semua baik.'} Kos hari ini ${Math.round(costToday())} ringgit.`,
  );
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); u.lang = S.lang === 'ms' ? 'ms-MY' : 'en-US'; speechSynthesis.speak(u); } catch (e) { /* no speech output */ }
  panel({ state: L('Daily briefing', 'Ringkasan harian'), title: txt, ttl: 12000 });
}

/* ---------- sign in, roles, language, demo ---------- */
export function enter(role) {
  S.role = role; S.scene = 'home'; S.filter = 'all'; S.draft = null; S.user = role;
  navigate('/');
  clearLive();
  startHints();
  if (role === 'admin') {
    later(() => { if (S.rules.expAlert) notify('warn', L('Milk batch B-MI-204 expires in 3 days', 'Kelompok susu B-MI-204 luput dalam 3 hari'), L('Use it first, or schedule a promotion.', 'Guna dahulu, atau jalankan promosi.')); }, 4500);
    later(() => { if (S.rules.anomaly) notify('warn', L('Unusual chicken usage', 'Penggunaan ayam luar biasa'), L('Used 56% above the normal daily rate.', 'Digunakan 56% melebihi kadar harian biasa.')); }, 10000);
  } else later(() => notify('ok', L('New task assigned', 'Tugas baru diberikan'), L('Check banana freshness before 10 am.', 'Semak kesegaran pisang sebelum 10 pagi.')), 5000);
  emit();
}
export function signOut() {
  clearLive(); closeDrawer(); hidePanel(); S.demo = false; S.user = null;
  emit();
}
export function setLang(l) {
  if (S.lang === l) return;
  S.lang = l; S.draft = null; abortListening(); hidePanel(); closeCmd(); startHints();
  emit();
}
export function setRole(r) {
  if (S.role === r) return;
  S.role = r; S.draft = null; S.filter = 'all'; S.scene = 'home';
  navigate('/'); closeCmd(); closeDrawer(); startHints();
  panel({ state: r === 'admin' ? L('Admin view', 'Paparan admin') : L('Staff view', 'Paparan staf'), title: r === 'admin' ? L('Briefing, costs and approvals.', 'Ringkasan, kos dan kelulusan.') : L('A simple screen. Just say what you did.', 'Skrin ringkas. Cakap apa yang anda buat.'), ttl: 2600 });
}
export async function runDemo() {
  if (S.demo) { S.demo = false; emit(); return; }
  S.demo = true; emit();
  for (const [r, en, ms] of DEMO) {
    if (!S.demo) break;
    if (r) { setRole(r); await sleep(1200); }
    await speakSim(S.lang === 'ms' ? ms : en);
    await sleep(r === 'staff' || en === 'Confirm' ? 1700 : 2600);
  }
  S.demo = false; emit();
}
