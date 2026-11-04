import { useEffect } from 'react';
import { S, P, L, U, pn, fq, eta, itemTone, ringMetrics, stockValue, useStore, emit, openDetail } from '../store/store';
import { rm0, clamp } from '../lib/format';
import Seg from '../components/Seg';

export const path = '/stock';
export const title = 'Stock · SmartStock';

export default function Stock() {
  useStore();
  const f = S.filter;
  const isLow = (p) => p.qty <= p.reorder, isExp = (p) => p.exp <= 3;
  const ln = P.filter(isLow).length, en = P.filter(isExp).length;
  const pulse = S.pulse;
  useEffect(() => { S.pulse = null; }); // the pop animation only runs once
  const meta = S.role === 'admin' ? `${P.length} ${L('items', 'item')} · ${rm0(stockValue())}` : `${P.length} ${L('items', 'item')}`;
  return (
    <>
      <div className="sh"><h1 className="h1">{L('Stock', 'Stok')}</h1><p className="meta">{meta}</p></div>
      <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between', marginTop: 18 }}>
        <Seg
          label={L('Filter', 'Tapis')}
          value={f}
          onChange={(v) => { S.filter = v; emit(); }}
          options={[{ value: 'all', label: L('All', 'Semua') }, { value: 'low', label: `${L('Low', 'Rendah')} ${ln}` }, { value: 'exp', label: `${L('Expiring', 'Luput')} ${en}` }]}
        />
        <div className="legend" style={{ margin: 0 }}>
          <span><i style={{ background: 'var(--r-stock)' }} />{L('Healthy', 'Baik')}</span>
          <span><i style={{ background: 'var(--r-cover)' }} />{L('Expiring', 'Hampir luput')}</span>
          <span><i style={{ background: 'var(--r-crit)' }} />{L('Low stock', 'Stok rendah')}</span>
        </div>
      </div>
      <div className="rings" style={{ marginTop: 18 }}>
        {P.map((p, i) => {
          const m = ringMetrics(p), tone = itemTone(p);
          const dim = f === 'low' ? !isLow(p) : f === 'exp' ? !isExp(p) : false;
          const st = isLow(p) ? L(`Low · ${eta(p)} left`, `Rendah · ${eta(p)}`) : isExp(p) ? L(`Expires in ${p.exp} days`, `Luput ${p.exp} hari`) : L('Healthy', 'Baik');
          const fdot = p.exp <= 3 ? 'bad' : p.exp <= 7 ? 'warn' : 'ok';
          return (
            <button
              key={p.id}
              className={`rg ${dim ? 'dim' : ''} ${pulse === p.id ? 'pulse' : ''}`}
              data-tip={m.map((r) => `${r.label} ${r.val}`).join('  ·  ')}
              aria-label={`${pn(p)} ${fq(p.qty)} ${U(p.unit)}`}
              onClick={() => openDetail(p.id)}
            >
              <span className="rg-top"><span className="nm">{pn(p)}</span><span className="qv"><b>{fq(p.qty)}</b><small>{U(p.unit)}</small></span></span>
              <span className={'lvbar ' + tone}>
                <i style={{ '--w': clamp((p.qty / p.cap) * 100, 3, 100).toFixed(1) + '%', animationDelay: `${i * 60}ms` }} />
                <u style={{ left: clamp((p.reorder / p.cap) * 100, 0, 100).toFixed(1) + '%' }} />
              </span>
              <span className="rg-bot">
                <span className={'st ' + tone}>{st}</span>
                <span className={'fd ' + fdot} title={L('Freshness', 'Kesegaran')}><i />{p.exp >= 14 ? L('Fresh', 'Segar') : p.exp + L('d', 'h')}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="demo-note">{L('The bar shows stock level. The tick marks the minimum. Tap an item for details.', 'Bar tunjuk paras stok. Tanda ialah minimum. Tekan item untuk butiran.')}</p>
    </>
  );
}
