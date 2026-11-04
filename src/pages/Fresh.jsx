import { S, L, useStore, scan, speakSim } from '../store/store';
import { rm0 } from '../lib/format';

export const path = '/fresh';
export const title = 'Freshness · SmartStock';

function Banana({ bad }) {
  const f = bad ? '#7A5A2B' : '#F2C94C', s = bad ? '#4C3516' : '#B8901A';
  return (
    <svg viewBox="0 0 200 140" width="62%" aria-hidden="true">
      <path d="M22 60C40 112 118 126 180 52c-24 36-84 44-132-6z" fill={f} stroke={s} strokeWidth="4" strokeLinejoin="round" />
      {bad && <><circle cx="80" cy="92" r="6" fill="#3a2810" /><circle cx="116" cy="88" r="5" fill="#3a2810" /><circle cx="140" cy="74" r="4" fill="#3a2810" /></>}
      <path d="M22 60l-8-10" stroke={s} strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export default function Fresh() {
  useStore();
  const F = S.fresh, r = F.res, c = 2 * Math.PI * 30;
  const wt = S.waste.reduce((a, w) => a + w.amt, 0), mx = Math.max(...S.waste.map((w) => w.amt));
  const color = r && (r.bad ? 'var(--bad)' : 'var(--ok)');
  return (
    <>
      <div className="sh"><h1 className="h1">{L('Fresh', 'Segar')}</h1><p className="meta">{L(`waste this week ${rm0(wt)}`, `sisa minggu ini ${rm0(wt)}`)}</p></div>
      <div className="fresh">
        <div>
          <div className={'finder ' + (F.scanning ? 'scanning' : '')}>
            <i className="fc f1" /><i className="fc f2" /><i className="fc f3" /><i className="fc f4" />
            <Banana bad={r && r.bad} />
          </div>
          <div className="row">
            <button className="btn primary big" aria-label={L('Scan', 'Imbas')} disabled={F.scanning} onClick={scan}>{F.scanning ? L('Scanning…', 'Mengimbas…') : L('Scan', 'Imbas')}</button>
          </div>
        </div>
        <div>
          {r ? (
            <>
              <div className="result">
                <svg width="76" height="76" viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="38" cy="38" r="30" fill="none" stroke="var(--surface-2)" strokeWidth="8" />
                  <circle cx="38" cy="38" r="30" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${((r.conf / 100) * c).toFixed(1)} ${c.toFixed(1)}`} />
                </svg>
                <div>
                  <b style={{ color }}>{r.bad ? L('Spoiled', 'Rosak') : L('Fresh', 'Segar')} {r.conf}%</b>
                  <span className="say">{L('An indicator only, not a food-safety certification.', 'Indikator sahaja, bukan pengesahan keselamatan makanan.')}</span>
                </div>
              </div>
              {r.bad && <div className="p-chips"><button className="btn primary" onClick={() => speakSim(L('Waste 2 kg banana', 'Buang 2 kilo pisang'))}>{L('Log 2 kg as waste', 'Rekod sisa 2 kg')}</button></div>}
            </>
          ) : (
            <p className="meta" style={{ marginTop: 14 }}>{L('Place the banana in the frame, then scan.', 'Letak pisang dalam bingkai, tekan imbas.')}<span className="say">{L('or say', 'atau sebut')} <q>{L('Scan banana', 'Imbas pisang')}</q></span></p>
          )}
          <h2 className="h2" style={{ marginTop: r ? 22 : 6 }}>{L('Waste by cost (RM)', 'Sisa ikut kos (RM)')}</h2>
          <div className="bubbles">
            {S.waste.map((w, i) => {
              const d = 46 + (w.amt / mx) * 54;
              return <span key={i} className="bub" style={{ width: d, height: d }}>{w.n}<br />{Math.round(w.amt)}</span>;
            })}
          </div>
        </div>
      </div>
      <p className="demo-note">{L('Demo mode. Production model: Google Teachable Machine (banana, fresh or spoiled).', 'Mod demo. Model sebenar: Google Teachable Machine (pisang, segar atau rosak).')}</p>
    </>
  );
}
