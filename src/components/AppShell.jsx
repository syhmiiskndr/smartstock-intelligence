import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { S, L, useStore, bindNavigate, go, signOut, setLang, setRole, runDemo, showAudit, showNotes, startHints, stopHints, abortListening, hidePanel, closeCmd, openCmd, closeDrawer, orbClick } from '../store/store';
import { pathToScene } from '../store/data';
import { Icon } from '../lib/icons';
import Seg from './Seg';
import Island from './Island';
import Panel from './Panel';
import CmdBar from './CmdBar';
import Drawer from './Drawer';
import Dock from './Dock';
import Tip from './Tip';
import LoginScreen from './LoginScreen';
import '../styles/smartstock.css';

// Layout shared by every page: header, tools, Dynamic Island, dock, panels. The page itself is <Outlet />.
export default function AppShell() {
  useStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  S.scene = pathToScene(pathname); // the URL decides which scene is active
  bindNavigate(navigate);

  useEffect(() => { document.documentElement.lang = S.lang === 'ms' ? 'ms' : 'en'; });

  useEffect(() => {
    startHints();
    return () => { stopHints(); abortListening(); };
  }, []);

  // keyboard: Esc closes things, Space talks, "/" opens the typed command bar
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { closeCmd(); hidePanel(); closeDrawer(); }
      if (/INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
      if (e.code === 'Space' && !e.target.closest('button')) { e.preventDefault(); orbClick(); }
      if (e.key === '/') { e.preventDefault(); openCmd(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // light that follows the pointer, 3D tilt on stock cards, small haptic tap on phones
  useEffect(() => {
    const move = (e) => {
      const el = e.target.closest && e.target.closest('#ss-root .w,#ss-root .rg,#ss-root .tile,#ss-root .rcard,#ss-root .po,#ss-root .sup');
      if (!el) return;
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', (x * 100).toFixed(0) + '%');
      el.style.setProperty('--my', (y * 100).toFixed(0) + '%');
      if (el.classList.contains('rg')) {
        el.style.setProperty('--ry', ((x - 0.5) * 16).toFixed(1) + 'deg');
        el.style.setProperty('--rx', ((0.5 - y) * 16).toFixed(1) + 'deg');
      }
    };
    const out = (e) => {
      const el = e.target.closest && e.target.closest('.rg');
      if (el && !el.contains(e.relatedTarget)) { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); }
    };
    const tap = (e) => { if (e.target.closest('#ss-root button')) { try { navigator.vibrate && navigator.vibrate(6); } catch (x) { /* unsupported */ } } };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerout', out);
    document.addEventListener('click', tap, true);
    return () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerout', out); document.removeEventListener('click', tap, true); };
  }, []);

  const unread = S.notes.filter((n) => !n.read).length;
  const admin = S.role === 'admin';
  return (
    <div id="ss-root">
      <div id="app">
        <header className="bar">
          <div className="lhs">
            <button className="brand" id="brand" aria-label={L('Home', 'Utama')} onClick={() => go('home')}>
              <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
                <circle cx="14" cy="14" r="11" fill="none" stroke="#007AFF" strokeWidth="3.2" strokeDasharray="52 100" strokeLinecap="round" transform="rotate(-90 14 14)" />
                <circle cx="14" cy="14" r="6" fill="none" stroke="#34C759" strokeWidth="3.2" strokeDasharray="26 100" strokeLinecap="round" transform="rotate(-90 14 14)" />
              </svg>
              <span>SmartStock</span>
            </button>
            <span className="biz" id="biz">{L('Dapur Syahmi · Melaka outlet', 'Dapur Syahmi · Cawangan Melaka')}</span>
          </div>
          <div className="rhs">
            <button className="tbtn bell" id="t-bell" aria-label={L('Notifications', 'Notifikasi')} onClick={showNotes}><Icon name="bell" size={16} />{unread ? <u>{unread}</u> : null}</button>
            <button className="avatar" id="t-user" aria-label="Account" title={admin ? 'Syahmi · Admin' : 'Syafiq · ' + L('Staff', 'Staf')} style={{ background: admin ? 'var(--accent)' : 'var(--ok)' }} onClick={signOut}>{admin ? 'S' : 'F'}</button>
          </div>
        </header>
        <div className="tools">
          <Seg label="Role" value={S.role} onChange={setRole} options={[{ value: 'admin', label: 'Admin' }, { value: 'staff', label: L('Staff', 'Staf') }]} />
          <button className="tbtn" id="t-demo" aria-pressed={S.demo} onClick={runDemo}>
            <Icon name={S.demo ? 'stop' : 'play'} size={16} /><span className="lbl">{S.demo ? L('Stop demo', 'Henti demo') : L('1-minute demo', 'Demo 1 minit')}</span>
          </button>
          <button className="tbtn" id="t-log" aria-label={L('Command trail', 'Jejak arahan')} onClick={showAudit}><Icon name="clock" size={16} /><span className="lbl">{L('Trail', 'Jejak')}</span></button>
          <button className="tbtn" id="t-lang" title={L('Language for screen and microphone', 'Bahasa skrin dan mikrofon')} onClick={() => setLang(S.lang === 'ms' ? 'en' : 'ms')}><Icon name="mic" size={16} /><span>{S.lang === 'ms' ? 'BM' : 'EN'}</span></button>
        </div>
        <main id="stage" className="bloom" key={pathname}><Outlet /></main>
      </div>
      <Island />
      <Panel />
      <Drawer />
      <CmdBar />
      <Tip />
      <Dock />
      <LoginScreen />
    </div>
  );
}
