import { useRef } from 'react';
import { L, pending, reqTitle, reqReason, byName, useStore, decideFromUi } from '../store/store';
import { rm0 } from '../lib/format';
import { Icon } from '../lib/icons';
import OrderTracking from '../components/OrderTracking';

export const path = '/approvals';
export const title = 'Approvals · SmartStock';

// The top request card. Drag it right to approve, left to reject.
function SwipeCard({ t, kind }) {
  const el = useRef(null);
  const start = useRef(null);
  const down = (e) => {
    if (e.target.closest('button')) return;
    start.current = e.clientX;
    el.current.setPointerCapture(e.pointerId);
    el.current.style.transition = 'none';
  };
  const move = (e) => {
    if (start.current == null) return;
    const dx = e.clientX - start.current;
    el.current.style.transform = `translateX(${dx}px) rotate(${dx / 20}deg)`;
    el.current.dataset.dir = dx > 50 ? 'ok' : dx < -50 ? 'no' : '';
  };
  const end = (e) => {
    if (start.current == null) return;
    const dx = e.clientX - start.current;
    start.current = null;
    el.current.style.transition = '';
    if (dx > 110) decideFromUi(true, 'drag');
    else if (dx < -110) decideFromUi(false, 'drag');
    else { el.current.style.transform = ''; el.current.dataset.dir = ''; }
  };
  return (
    <article className="rcard top" id="rtop" ref={el} onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
      <span className={'pill ' + (t.kind === 'order' ? '' : 'warn')}>{kind}</span>
      <h3>{reqTitle(t)}</h3>
      <div className="amt">{rm0(t.amount)}</div>
      <div className="row">
        <span className="pill">{byName(t.by)}</span>
        {t.supplier && <span className="pill">{t.supplier}</span>}
        <span className={'pill ' + (t.kind === 'order' ? 'bad' : 'warn')}>{reqReason(t)}</span>
      </div>
      <div className="row" style={{ marginTop: 20 }}>
        <button className="btn big" onClick={() => decideFromUi(false, 'button')}>{L('Reject', 'Tolak')}</button>
        <button className="btn ok big" style={{ flex: 1 }} onClick={() => decideFromUi(true, 'button')}>{L('Approve', 'Lulus')}</button>
      </div>
    </article>
  );
}

export default function Approvals() {
  useStore();
  const pend = pending(), t = pend[0];
  const auto = (
    <div className="auto">
      {[L('Costs recalculated', 'Kos dikira semula'), L('Low-stock alert sent', 'Amaran stok rendah dihantar'), L('Daily report 10 pm', 'Laporan harian 10 malam')].map((x) => (
        <span key={x} className="pill ok"><Icon name="check" size={13} />{x}</span>
      ))}
    </div>
  );
  if (!t) {
    return (
      <>
        <div className="sh"><h1 className="h1">{L('Approve', 'Lulus')}</h1><p className="meta">{L('nothing waiting', 'tiada menunggu')}</p></div>
        <div className="empty">
          <i><Icon name="check" size={32} /></i>
          <div><h2 className="h2" style={{ margin: 0 }}>{L('All clear', 'Semua selesai')}</h2><span className="say">{L('New recommendations will appear here.', 'Cadangan baru akan muncul di sini.')}</span></div>
        </div>
        {auto}
        <OrderTracking />
      </>
    );
  }
  const kind = t.kind === 'order' ? L('Suggested order', 'Cadangan order') : L('Stock write-off', 'Tulis-off stok');
  return (
    <>
      <div className="sh"><h1 className="h1">{L('Approve', 'Lulus')}</h1><p className="meta">{pend.length} {L('waiting', 'menunggu')}</p></div>
      <div className="deck">
        {pend.length > 2 && <div className="rcard back b2" />}
        {pend.length > 1 && <div className="rcard back" />}
        <SwipeCard key={t.id} t={t} kind={kind} />
      </div>
      <span className="say">{L('Drag the card right, or say', 'Seret kad ke kanan, atau sebut')} <q>{L('approve', 'lulus')}</q></span>
      {auto}
      <OrderTracking />
    </>
  );
}
