import { S, L, useStore, emit } from '../store/store';

export const path = '/rules';
export const title = 'Rules · SmartStock';

const Switch = ({ k, on, disabled }) => (
  <button className="sw" role="switch" aria-checked={on} disabled={disabled} aria-label={k} onClick={() => { S.rules[k] = !S.rules[k]; emit(); }} />
);
const Rule = ({ t, d, children }) => <div className="rule"><div><b>{t}</b><span className="d">{d}</span></div>{children}</div>;

export default function Rules() {
  useStore();
  const R = S.rules;
  return (
    <>
      <div className="sh"><h1 className="h1">{L('Rules', 'Tetapan')}</h1><p className="meta">{L('How much SmartStock may do on its own', 'Setakat mana SmartStock boleh bertindak sendiri')}</p></div>

      <div className="lvl">
        <div className="lvl-h"><span className="pill ok">{L('Level 1', 'Tahap 1')}</span><h3>{L('Runs automatically', 'Berjalan automatik')}</h3></div>
        <Rule t={L('Recalculate costs', 'Kira semula kos')} d={L('Every recorded transaction updates cost and stock value.', 'Setiap transaksi mengemas kini kos dan nilai stok.')}><Switch k="cost" on disabled /></Rule>
        <Rule t={L('Low-stock alerts', 'Amaran stok rendah')} d={L('Notify admin when an item drops below its minimum.', 'Maklumkan admin bila item bawah paras minimum.')}><Switch k="lowAlert" on={R.lowAlert} /></Rule>
        <Rule t={L('Expiry alerts', 'Amaran luput')} d={L('Notify when a batch is close to expiry.', 'Maklumkan bila kelompok hampir luput.')}><Switch k="expAlert" on={R.expAlert} /></Rule>
        <Rule t={L('Confirm before recording', 'Sahkan sebelum rekod')} d={L('Ask "Confirm?" after a voice command to use or receive stock. Turn off for hands-free speed.', 'Tanya "Betul?" selepas arahan suara guna atau terima stok. Matikan untuk lebih pantas.')}><Switch k="confirm" on={R.confirm} /></Rule>
      </div>

      <div className="lvl">
        <div className="lvl-h"><span className="pill warn">{L('Level 2', 'Tahap 2')}</span><h3>{L('Suggests, you decide', 'Cadang, anda putuskan')}</h3></div>
        <Rule t={L('Flag unusual usage', 'Tanda penggunaan luar biasa')} d={L('Warn when an item is used far above its normal rate.', 'Beri amaran bila penggunaan jauh melebihi kadar biasa.')}><Switch k="anomaly" on={R.anomaly} /></Rule>
        <Rule t={L('Reorder suggestions', 'Cadangan order semula')} d={L('Suggest quantities based on average daily use.', 'Cadang kuantiti berdasarkan purata guna harian.')}><Switch k="suggest" on disabled /></Rule>
      </div>

      <div className="lvl">
        <div className="lvl-h"><span className="pill bad">{L('Level 3', 'Tahap 3')}</span><h3>{L('Needs your approval', 'Perlu kelulusan anda')}</h3></div>
        <Rule t={L('Purchase orders', 'Pesanan pembelian')} d={L('Always require admin approval before sending to a supplier.', 'Sentiasa perlu kelulusan admin sebelum dihantar kepada pembekal.')}><Switch k="po" on disabled /></Rule>
        <Rule t={L('Write-off limit', 'Had tulis-off')} d={L('Waste above this amount waits for approval.', 'Sisa melebihi jumlah ini menunggu kelulusan.')}>
          <div className="slide">
            <input type="range" id="limit" min="0" max="100" step="5" value={R.limit} aria-label={L('Write-off limit', 'Had tulis-off')} onChange={(e) => { R.limit = +e.target.value; emit(); }} />
            <b id="limit-v">RM {R.limit}</b>
          </div>
        </Rule>
      </div>
      <p className="demo-note">{L('Try it: set the limit to RM 5, then say "Waste 1 kg banana".', 'Cuba: tetapkan had RM 5, kemudian sebut "Buang 1 kilo pisang".')}</p>
    </>
  );
}
