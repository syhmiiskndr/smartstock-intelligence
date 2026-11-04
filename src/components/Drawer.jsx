import { useRef } from 'react';
import { S, L, U, uw, pn, fq, prod, itemTone, ringMetrics, hist, batches, dateStr, suggest, orderSay, useStore, closeDrawer, speakSim } from '../store/store';
import { rm, clamp } from '../lib/format';
import { Icon } from '../lib/icons';

// Item inspector sheet: level bar, usage chart, batches, recent movements and quick voice actions.
export default function Drawer() {
  useStore();
  const last = useRef(null);
  if (S.drawer) last.current = S.drawer; // keep the content while the sheet slides out
  const p = last.current && prod(last.current);
  return (
    <aside id="drawer" className={S.drawer ? 'open' : ''} aria-label={L('Item details', 'Butiran item')}>
      {p && <DrawerBody p={p} />}
    </aside>
  );
}

function DrawerBody({ p }) {
  const low = p.qty <= p.reorder, tone = itemTone(p), n = pn(p).toLowerCase(), m = ringMetrics(p);
  const h = hist(p), mx = Math.max(...h) * 1.15, W = 420, H = 90, bw = 22, gap = (W - bw * 14) / 13;
  const ay = H - (p.avg / mx) * H;
  const moveLabel = { usage: L('Used', 'Digunakan'), receive: L('Received', 'Diterima'), waste: L('Wasted', 'Dibuang') };
  const mv = S.moves.filter((x) => x.p === p.id).slice(0, 5);
  const act = [
    { l: L(`Use 1 ${U(p.unit)}`, `Guna 1 ${U(p.unit)}`), s: `${L('Use', 'Guna')} 1 ${uw(p.unit)} ${n}` },
    { l: L(`Receive 10 ${U(p.unit)}`, `Terima 10 ${U(p.unit)}`), s: `${L('Receive', 'Terima')} 10 ${uw(p.unit)} ${n}` },
    ...(S.role === 'admin' ? [{ l: `Order ${suggest(p)} ${U(p.unit)}`, s: orderSay(p) }] : []),
  ];
  return (
    <>
      <div className="dr-top">
        <div>
          <span className={'pill ' + tone}>{low ? L('Low stock', 'Stok rendah') : p.exp <= 3 ? L('Expiring soon', 'Hampir luput') : L('Healthy', 'Baik')}</span>
          <h2>{pn(p)}</h2>
        </div>
        <button className="p-x" onClick={closeDrawer} aria-label={L('Close', 'Tutup')}><Icon name="x" size={16} /></button>
      </div>
      <div className="dr-hero">
        <div className="dr-big"><b>{fq(p.qty)}</b><small>{U(p.unit)} {L('of', 'daripada')} {p.cap}</small></div>
        <span className={'lvbar lg ' + tone}>
          <i style={{ '--w': clamp((p.qty / p.cap) * 100, 3, 100).toFixed(1) + '%' }} />
          <u style={{ left: clamp((p.reorder / p.cap) * 100, 0, 100).toFixed(1) + '%' }} />
        </span>
        <div className="dr-leg">{m.slice(1).map((r) => <div key={r.k}><b style={r.crit ? { color: 'var(--r-crit)' } : undefined}>{r.val}</b>{r.label}</div>)}</div>
      </div>
      <div className="facts" style={{ marginTop: 16 }}>
        <div><b>{p.sup}</b><span>{L('supplier', 'pembekal')}</span></div>
        {S.role === 'admin' && <><div><b>{rm(p.qty * p.cost)}</b><span>{L('value', 'nilai')}</span></div><div><b>{rm(p.cost)}/{U(p.unit)}</b><span>{L('unit cost', 'kos seunit')}</span></div></>}
      </div>
      <div className="dr-h">{L('Usage, last 14 days', 'Penggunaan, 14 hari lalu')}</div>
      <svg className="spark" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={L('Usage chart', 'Carta penggunaan')}>
        <line x1="0" x2={W} y1={ay} y2={ay} stroke="var(--ink-2)" strokeDasharray="3 5" opacity=".6" />
        {h.map((v, i) => {
          const bh = (v / mx) * H;
          const d = i === 13 ? L('Today', 'Hari ini') : dateStr(i - 13);
          return <rect key={i} x={i * (bw + gap)} y={H - bh} width={bw} height={bh} rx="7" fill={i === 13 ? 'var(--accent)' : 'var(--accent-soft)'} data-tip={`${d}: ${fq(v)} ${U(p.unit)}`} />;
        })}
      </svg>
      <div className="dr-h">{L('Batches', 'Kelompok')}</div>
      <div className="tblwrap">
        <table className="tbl">
          <thead><tr><th>{L('Batch', 'Kelompok')}</th><th>{L('Received', 'Diterima')}</th><th>{L('Expires', 'Luput')}</th><th style={{ textAlign: 'right' }}>{L('Qty', 'Kuantiti')}</th></tr></thead>
          <tbody>
            {batches(p).map((b) => (
              <tr key={b.id}><td>{b.id}</td><td>{dateStr(b.rec)}</td><td><span className={'pill ' + (b.exp <= 3 ? 'warn' : '')}>{dateStr(b.exp)}</span></td><td style={{ textAlign: 'right' }}>{fq(b.qty)} {U(p.unit)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="dr-h">{L('Recent movements', 'Pergerakan terkini')}</div>
      <div className="mv">
        {mv.length ? mv.map((x, i) => (
          <div key={i}>
            <i className={x.type === 'receive' ? 'up' : 'dn'}><Icon name={x.type === 'receive' ? 'up' : 'down'} size={15} /></i>
            <span>{moveLabel[x.type]} {fq(x.q)} {U(p.unit)}<br /><small>{x.who}</small></span>
            <small>{x.t}</small>
          </div>
        )) : <p className="p-body">{L('No movements yet.', 'Belum ada pergerakan.')}</p>}
      </div>
      <div className="dr-h">{L('Say or tap', 'Sebut atau tekan')}</div>
      <div className="p-chips" style={{ marginTop: 0 }}>{act.map((a) => <button key={a.s} className="chip" onClick={() => speakSim(a.s)}>{a.l}</button>)}</div>
    </>
  );
}
