import { S, P, L, U, pn, fq, eta, greet, examples, costToday, costAvg, pending, seriesN, suggest, orderSay, useStore, emit, speakSim, speakBrief, startDraft, go } from '../store/store';
import { rm0, clamp } from '../lib/format';
import { Icon } from '../lib/icons';
import RingSet from '../components/RingSet';

export const path = '/';
export const title = 'SmartStock Intelligence';

export default function Home() {
  useStore();
  return S.role === 'admin' ? <HomeAdmin /> : <HomeStaff />;
}

const SayHint = ({ text }) => <span className="say">{L('or say', 'atau sebut')} <q>{text}</q></span>;

function HomeStaff() {
  const done = S.tasks.filter((t) => t.done).length;
  const tile = (bg, icon, label, onClick) => (
    <button className="tile" onClick={onClick}><span className="ico" style={{ background: bg }}><Icon name={icon} size={24} /></span>{label}</button>
  );
  return (
    <div className="staff">
      <h1 className="h1">{L('Just say it.', 'Cakap je.')}</h1>
      <p className="meta" style={{ marginTop: 10 }}>{L('Tap the orb and say what you did.', 'Tekan orb, sebut apa yang anda buat.')}<SayHint text={examples()[0]} /></p>
      <div className="tiles">
        {tile('linear-gradient(150deg,#FFB340,#FF7A00)', 'down', L('Use stock', 'Guna stok'), () => startDraft('usage', null, null, null, ''))}
        {tile('linear-gradient(150deg,#4CD964,#1FAE4B)', 'up', L('Receive stock', 'Terima stok'), () => startDraft('receive', null, null, null, ''))}
        {tile('linear-gradient(150deg,#64D2FF,#0A84FF)', 'leaf', L('Check freshness', 'Semak segar'), () => go('fresh'))}
        {tile('linear-gradient(150deg,#FF6B5E,#D70015)', 'trash', L('Report waste', 'Lapor rosak'), () => startDraft('waste', null, null, null, ''))}
      </div>
      <h2 className="h2">{L("Today's tasks", 'Tugas hari ini')} <span className={'pill ' + (done === 3 ? 'ok' : '')} style={{ verticalAlign: 'middle' }}>{done}/3</span></h2>
      <div className="tasks">
        {S.tasks.map((t) => (
          <button key={t.id} className={'task ' + (t.done ? 'done' : '')} onClick={() => { t.done = !t.done; emit(); }}>
            <i><Icon name="check" size={14} /></i>{L(t.en, t.ms)}
          </button>
        ))}
      </div>
    </div>
  );
}
function MiniRing({ v, k, crit, children }) {
  return <div className="mini"><RingSet vals={[{ k, v, crit }]} size={72} sw={10} /><span className="ctr">{children}</span></div>;
}

function HomeAdmin() {
  const low = P.filter((p) => p.qty <= p.reorder);
  const exp = P.filter((p) => p.exp <= 3 && !low.includes(p)).sort((a, b) => a.exp - b.exp);
  const cost = costToday(), pct = Math.round((cost / costAvg() - 1) * 100), pend = pending(), pa = pend.reduce((a, r) => a + r.amount, 0);
  const health = clamp(100 - 10 * low.length - 3 * P.filter((p) => p.exp <= 3).length - (pct > 10 ? 4 : 0) - pend.length, 0, 100);
  const sH = Math.round(((P.length - low.length) / P.length) * 100), fH = Math.round((P.filter((p) => p.exp > 3).length / P.length) * 100), cH = clamp(100 - Math.max(0, pct), 0, 100);
  const ser = seriesN(7), mx = Math.max(...ser) * 1.1;
  const qty = (p) => <span className="num">{fq(p.qty)}<small style={{ fontSize: 14, color: 'var(--ink-2)', fontWeight: 500 }}> {U(p.unit)}</small></span>;
  return (
    <>
      <div className="hello"><h1 className="h1">{greet()}, Syahmi</h1></div>
      <div className="widgets">
        <div className="w w-health">
          <span className="cap">{L('Business health', 'Kesihatan bisnes')}</span>
          <div className="health-body">
            <div className="hr">
              <RingSet vals={[{ k: 'stock', v: clamp(health, 3, 100), crit: health < 50 }]} size={160} sw={18} />
              <div className="ctr"><b>{health}<span>%</span></b></div>
            </div>
            <div className="hl">
              <div className="c1"><b>{sH}%</b>{L('Stock above minimum', 'Stok melebihi minimum')}</div>
              <div className="c2"><b>{fH}%</b>{L('Items fresh', 'Item segar')}</div>
              <div className="c3"><b>{cH}%</b>{L('Cost control', 'Kawalan kos')}</div>
            </div>
          </div>
          <button className="tbtn" onClick={speakBrief}><Icon name="spk" size={16} /><span>{L('Hear briefing', 'Dengar ringkasan')}</span></button>
        </div>

        {low.map((p) => (
          <div className="w w-s ins-w" key={p.id}>
            <MiniRing v={clamp((p.qty / p.avg / 5) * 100, 3, 100)} k="cover" crit><Icon name="alert" size={22} /></MiniRing>
            <div className="tx"><h3>{L(`${pn(p)} runs out in ${eta(p)}`, `${pn(p)} habis dalam ${eta(p)}`)}</h3><button className="btn primary" onClick={() => speakSim(orderSay(p))}>Order {suggest(p)} {U(p.unit)}</button></div>
            {qty(p)}
          </div>
        ))}
        {exp[0] && (
          <div className="w w-s ins-w">
            <MiniRing v={clamp((exp[0].exp / 14) * 100, 3, 100)} k="fresh" crit><Icon name="leaf" size={22} /></MiniRing>
            <div className="tx"><h3>{L(`${pn(exp[0])} expires in ${exp[0].exp} days`, `${pn(exp[0])} luput ${exp[0].exp} hari`)}</h3><button className="btn" onClick={() => speakSim(`${L('Scan', 'Imbas')} ${pn(exp[0]).toLowerCase()}`)}>{L('Scan freshness', 'Imbas segar')}</button></div>
            {qty(exp[0])}
          </div>
        )}
        {!low.length && !exp[0] && (
          <div className="w w-s ins-w"><MiniRing v={100} k="fresh" crit={false}><Icon name="check" size={22} /></MiniRing><div className="tx"><h3>{L('Everything looks good', 'Semuanya nampak baik')}</h3></div></div>
        )}

        <div className="w w-m">
          <span className="cap">{L('Cost today', 'Kos hari ini')}</span>
          <span className="num">{rm0(cost)}</span>
          <svg width="100%" viewBox="0 0 140 44" preserveAspectRatio="none" style={{ height: 44 }} aria-hidden="true">
            {ser.map((v, i) => <rect key={i} x={i * 20} y={44 - (v / mx) * 44} width="14" height={(v / mx) * 44} rx="5" fill={i === 6 ? 'var(--accent)' : 'var(--accent-soft)'} />)}
          </svg>
          <span className={'pill ' + (pct > 10 ? 'warn' : 'ok')} style={{ alignSelf: 'flex-start' }}>{pct >= 0 ? '+' : ''}{pct}% {L('vs average', 'dari purata')}</span>
        </div>
        <div className="w w-m">
          <span className="cap">{L('Approvals', 'Kelulusan')}</span>
          <span className="num">{pend.length}</span>
          <span className="say" style={{ margin: 0 }}>{pend.length ? L(`${rm0(pa)} waiting for you`, `${rm0(pa)} menunggu anda`) : L('Nothing waiting', 'Tiada menunggu')}</span>
          <button className="btn" onClick={() => go('ops')} style={{ alignSelf: 'flex-start', marginTop: 'auto' }}>{L('Review', 'Semak')}</button>
        </div>
        <div className="w w-m">
          <span className="cap"><Icon name="mic" size={14} /> {L('Try saying', 'Cuba sebut')}</span>
          <div className="sug">{examples().slice(0, 4).map((x) => <button key={x} className="chip" onClick={() => speakSim(x)}>{x}</button>)}</div>
        </div>
      </div>
      <p className="demo-note">{L('All figures are sample data for demonstration.', 'Semua nombor ialah data contoh untuk demo.')}</p>
    </>
  );
}
