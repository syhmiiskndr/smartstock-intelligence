import { useState } from 'react';
import { S, P, L, pn, seriesN, dateStr, useStore, emit } from '../store/store';
import { rm0 } from '../lib/format';
import Seg from '../components/Seg';

export const path = '/cost';
export const title = 'Cost · SmartStock';

export default function Cost() {
  useStore();
  const [scrub, setScrub] = useState(null); // amount under the pointer, shown in the big number
  const days = seriesN(S.range), n = days.length, cost = days[n - 1];
  const prev = days.slice(0, -1), avg = prev.reduce((a, b) => a + b, 0) / prev.length, pct = Math.round((cost / avg - 1) * 100);
  const W = 560, H = 170, gap = n > 7 ? 4 : 12, bw = (W - gap * (n - 1)) / n, max = Math.max(...days) * 1.2;
  const locale = S.lang === 'ms' ? 'ms-MY' : 'en-GB';
  const lab = (i) => (i === n - 1 ? L('Today', 'Hari ini') : dateStr(i - (n - 1)));
  const axis = (i) => (i === n - 1 ? L('Today', 'Hari ini') : n === 7 ? new Date(Date.now() - (n - 1 - i) * 864e5).toLocaleDateString(locale, { weekday: 'short' }) : dateStr(i - (n - 1)));
  const ay = H - (avg / max) * H;
  const vals = (p) => S.use[p.id] * p.cost;
  const top = [...P].sort((a, b) => vals(b) - vals(a)).slice(0, 4);
  return (
    <>
      <div className="sh"><h1 className="h1">{L('Cost', 'Kos')}</h1><p className="meta">{L(`${n - 1}-day average ${rm0(avg)}`, `purata ${n - 1} hari ${rm0(avg)}`)}</p></div>
      <div className="bignum" id="bn">{scrub || rm0(cost)}</div>
      <span className={'pill ' + (pct > 10 ? 'warn' : 'ok')}>{pct >= 0 ? '+' : ''}{pct}% {L('vs average', 'dari purata')}</span>
      <div className="cost-tools">
        <Seg value={S.range} onChange={(v) => { S.range = v; emit(); }} options={[{ value: 7, label: '7D' }, { value: 30, label: '30D' }]} label={L('Range', 'Julat')} />
        <span className="say" style={{ margin: 0 }}>{L('Hover a bar for details', 'Letak kursor pada bar untuk butiran')}</span>
      </div>
      <svg className="chart" viewBox={`0 0 ${W} ${H + 26}`} role="img" aria-label={L('Daily cost', 'Kos harian')} onPointerLeave={() => setScrub(null)}>
        <line x1="0" x2={W} y1={ay} y2={ay} stroke="var(--ink-2)" strokeDasharray="4 5" opacity=".6" />
        <text x={W} y={ay - 6} textAnchor="end">{L('average', 'purata')}</text>
        {days.map((v, i) => {
          const h = (v / max) * H, x = i * (bw + gap), d = Math.round((v / avg - 1) * 100);
          const showLab = n === 7 || i % 5 === 0 || i === n - 1;
          return (
            <g key={i}>
              <rect x={x} y={H - h} width={bw} height={h} rx={Math.min(10, bw / 3)} fill={i === n - 1 ? 'var(--accent)' : 'var(--accent-soft)'}
                data-tip={`${lab(i)}: ${rm0(v)} (${d >= 0 ? '+' : ''}${d}% ${L('vs average', 'dari purata')})`}
                onPointerEnter={() => setScrub(rm0(v))} />
              {showLab && <text x={x + bw / 2} y={H + 18} textAnchor={i === n - 1 ? 'end' : 'middle'}>{axis(i)}</text>}
            </g>
          );
        })}
      </svg>
      <h2 className="h2">{L('Biggest cost drivers today', 'Pemacu kos terbesar hari ini')}</h2>
      <div className="drivers">
        {top.map((p) => (
          <div className="drv" key={p.id}>
            <span style={{ textAlign: 'left', color: 'var(--ink)' }}>{pn(p)}</span>
            <i><u style={{ width: `${((vals(p) / vals(top[0])) * 100).toFixed(0)}%` }} /></i>
            <span>{rm0(vals(p))}</span>
          </div>
        ))}
      </div>
      <span className="say" style={{ marginTop: 14 }}>{L('ask', 'tanya')} <q>{L('Why did costs rise?', 'Kenapa kos naik?')}</q></span>
    </>
  );
}
