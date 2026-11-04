import { S, L, U, pn, fq, uw, prod, STEPS, speakSim, useStore } from '../store/store';

// Purchase order progress: Approved, Sent, Confirmed, Delivered.
export default function OrderTracking() {
  useStore();
  if (!S.orders.length) return null;
  const steps = STEPS();
  return (
    <>
      <h2 className="h2">{L('Order tracking', 'Penjejakan order')}</h2>
      {S.orders.map((o) => {
        const p = prod(o.item);
        return (
          <div className="po" key={o.no}>
            <div className="po-h">
              <b>PO #{o.no} · {fq(o.qty)} {U(p.unit)} {pn(p)}</b>
              <span className={'pill ' + (o.done ? 'ok' : '')}>{o.done ? L('Received', 'Diterima') : o.sup}</span>
            </div>
            <div className="steps">
              {steps.map((s, i) => <div key={s} className={'st ' + (i <= o.step || o.done ? 'on' : '')}><i />{s}</div>)}
            </div>
            {o.step === 3 && !o.done && (
              <div className="row">
                <button className="btn primary" onClick={() => speakSim(`${L('Receive', 'Terima')} ${fq(o.qty)} ${uw(p.unit)} ${pn(p).toLowerCase()}`)}>{L('Receive stock', 'Terima stok')}</button>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
