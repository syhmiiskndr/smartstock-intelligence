import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { DCLogic } from '../lib/DCLogic';
import Sidebar from '../components/Sidebar';
import './Waste.css';

export const path = '/waste';
export const title = 'Waste';

// Demo batches. In the real system these come from the batches table (Supabase).
const BATCHES = [
  { id: 'N-079', label: 'Bananas, N-079', onHand: 24, unitCost: 3.2 },
  { id: 'N-081', label: 'Bananas, N-081', onHand: 12, unitCost: 3.4 },
  { id: 'A-077', label: 'Gala apples, A-077', onHand: 29, unitCost: 5.8 },
  { id: 'P-118', label: 'Papayas, P-118', onHand: 18, unitCost: 4.5 },
];
const REASONS = ['Spoiled', 'Expired', 'Damaged', 'Other'];
const money = (n) => 'RM ' + n.toFixed(2);

export default class Waste extends DCLogic {
  constructor(props) {
    super(props);
    this.state = {
      batch: 0,
      qty: '',
      reason: 'Spoiled',
      note: '',
      error: '',
      editing: null,
      records: [
        { id: 'W-0012', batch: 'N-079', product: 'Bananas', qty: 4, cost: 12.8, reason: 'Spoiled', by: 'Aina', date: '16 Oct', rev: 0 },
        { id: 'W-0011', batch: 'P-118', product: 'Papayas', qty: 2, cost: 9.0, reason: 'Expired', by: 'Daniel', date: '15 Oct', rev: 1 },
        { id: 'W-0010', batch: 'A-077', product: 'Gala apples', qty: 3, cost: 17.4, reason: 'Damaged', by: 'Aina', date: '13 Oct', rev: 0 },
      ],
    };
  }

  renderVals() {
    const st = this.state;
    const b = BATCHES[st.batch];
    const qty = parseFloat(st.qty);
    const valid = qty > 0 && qty <= b.onHand;
    const cost = valid ? qty * b.unitCost : 0;
    const total = st.records.reduce((a, r) => a + r.cost, 0);
    const kg = st.records.reduce((a, r) => a + r.qty, 0);
    return {
      b,
      st,
      cost,
      valid,
      total,
      kg,
      batchOpts: BATCHES.map((x, i) => ({ i, label: x.label + ' (' + x.onHand + ' kg)' })),
      reasons: REASONS,
      setBatch: (e) => this.setState({ batch: +e.target.value, error: '' }),
      setQty: (e) => this.setState({ qty: e.target.value, error: '' }),
      setReason: (e) => this.setState({ reason: e.target.value }),
      setNote: (e) => this.setState({ note: e.target.value }),
      confirm: () => {
        if (!valid) {
          this.setState({ error: qty > b.onHand ? 'That is more than the ' + b.onHand + ' kg on hand. Stock cannot go below zero.' : 'Enter a quantity above zero.' });
          return;
        }
        const n = String(13 + st.records.length - 2).padStart(4, '0');
        const rec = { id: 'W-' + n, batch: b.id, product: b.label.split(',')[0], qty, cost, reason: st.reason, by: 'You', date: 'Today', rev: 0 };
        this.setState({ records: [rec, ...st.records], qty: '', note: '', error: '', flash: rec.id });
      },
      edit: (id) => this.setState({ editing: id }),
      cancelEdit: () => this.setState({ editing: null }),
      saveEdit: (id, e) => {
        const q = parseFloat(this.editQty && this.editQty.value);
        if (!(q > 0)) return;
        this.setState({
          records: st.records.map((r) => {
            if (r.id !== id) return r;
            const unit = r.cost / r.qty;
            return { ...r, qty: q, cost: q * unit, rev: r.rev + 1 };
          }),
          editing: null,
        });
      },
      setEditRef: (el) => { this.editQty = el; },
    };
  }

  template(v) {
    const { b, st, cost, valid, total, kg, batchOpts, reasons, setBatch, setQty, setReason, setNote, confirm, edit, cancelEdit, saveEdit, setEditRef } = v;
    return (
      <div className="pg-waste">
        <div className="app-shell" style={{ minHeight: '1000px', display: 'flex', flexWrap: 'wrap', background: '#EEF1EF' }}>
          <div className="app-side" style={{ flex: '0 0 248px' }}>
            <Sidebar active="waste" />
          </div>
          <main
            className="app-main"
            style={{ flex: '999 1 560px', minWidth: '0', padding: '16px 16px 16px 0', boxSizing: 'border-box' }}
          >
            <div
              className="app-card"
              style={{ background: '#fff', borderRadius: '22px', padding: '36px 40px 40px', minHeight: '968px', boxSizing: 'border-box' }}
            >
              <h1 className="d" style={{ margin: '0', fontSize: '34px', lineHeight: '1.1', fontWeight: '600' }}>
                Waste
              </h1>
              <p style={{ margin: '8px 0 0', fontSize: '15.5px', color: '#55645E' }}>
                Record produce you had to throw away. Confirming a record removes the stock once, as a single stock-out.
              </p>

              <div style={{ marginTop: '28px', display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                {[
                  ['Waste cost this month', money(total)],
                  ['Quantity wasted', kg + ' kg'],
                  ['Records', String(st.records.length)],
                ].map((t, i) => (
                  <div key={i} style={{ flex: '1 1 160px', background: '#F4F6F5', borderRadius: '16px', padding: '18px 20px' }}>
                    <div style={{ fontSize: '14px', color: '#55645E' }}>{t[0]}</div>
                    <div className="d" style={{ marginTop: '6px', fontSize: '28px', fontWeight: '600' }}>{t[1]}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '36px', display: 'flex', flexWrap: 'wrap', gap: '48px', alignItems: 'flex-start' }}>
                <form
                  className="wform"
                  onSubmit={(e) => e.preventDefault()}
                  style={{ flex: '1 1 420px', maxWidth: '560px', minWidth: '0', display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '22px 20px' }}
                >
                  <div style={{ gridColumn: '1 / span 2' }}>
                    <label className="lbl" htmlFor="w-batch">Product and batch</label>
                    <select id="w-batch" className="field" value={st.batch} onChange={setBatch}>
                      {batchOpts.map((o) => (
                        <option key={o.i} value={o.i}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="lbl" htmlFor="w-qty">Wasted quantity (kg)</label>
                    <input id="w-qty" className="field" type="number" min="0" step="0.5" placeholder="4" value={st.qty} onChange={setQty} />
                  </div>
                  <div>
                    <label className="lbl" htmlFor="w-reason">Reason</label>
                    <select id="w-reason" className="field" value={st.reason} onChange={setReason}>
                      {reasons.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / span 2' }}>
                    <label className="lbl" htmlFor="w-note">Note (optional)</label>
                    <textarea id="w-note" className="area" placeholder="What happened?" value={st.note} onChange={setNote} />
                  </div>
                  {st.error ? (
                    <p role="alert" style={{ gridColumn: '1 / span 2', margin: '0', padding: '12px 14px', borderRadius: '12px', background: '#F8DDE0', color: '#8E2434', fontSize: '14px' }}>
                      {st.error}
                    </p>
                  ) : null}
                  <div style={{ gridColumn: '1 / span 2', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="btn" type="button" onClick={confirm}>Confirm waste</button>{' '}
                    <Link className="btn ghost" to="/inspect">Check freshness first</Link>
                  </div>
                  {st.flash ? (
                    <p role="status" style={{ gridColumn: '1 / span 2', margin: '0', fontSize: '14px', color: '#17603D' }}>
                      Saved as {st.flash}. One stock-out was created for it.
                    </p>
                  ) : null}
                </form>

                <aside style={{ flex: '1 1 320px', minWidth: '0', maxWidth: '420px', background: '#F4F6F5', borderRadius: '18px', padding: '26px 28px' }}>
                  <h2 className="d" style={{ margin: '0', fontSize: '20px', fontWeight: '600', letterSpacing: '-0.02em' }}>
                    Waste cost
                  </h2>
                  <div className="d" style={{ marginTop: '10px', fontSize: '38px', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>
                    {money(cost)}
                  </div>
                  <p style={{ margin: '6px 0 0', fontSize: '14.5px', lineHeight: '1.5', color: '#55645E' }}>
                    {valid ? st.qty + ' kg × ' + money(b.unitCost) + ' unit cost of batch ' + b.id : 'Enter a quantity to see the cost. Waste cost = quantity × unit cost of the batch.'}
                  </p>
                  <p style={{ margin: '16px 0 0', paddingTop: '14px', borderTop: '1px solid #DDE3DF', fontSize: '14px', lineHeight: '1.5' }}>
                    Stock left after this record: <strong>{valid ? b.onHand - parseFloat(st.qty) : b.onHand} kg</strong>
                  </p>
                  <p style={{ margin: '12px 0 0', fontSize: '13px', lineHeight: '1.5', color: '#55645E' }}>
                    An AI inspection never removes stock. Only a confirmed waste record does.
                  </p>
                </aside>
              </div>

              <h2 className="d" style={{ margin: '44px 0 8px', fontSize: '22px', fontWeight: '600', letterSpacing: '-0.02em' }}>
                Waste history
              </h2>
              <div>
                {st.records.map((r) => (
                  <Fragment key={r.id}>
                    <div className="wrow">
                      <div style={{ flex: '1 1 200px', minWidth: '0' }}>
                        <div style={{ fontSize: '15.5px', fontWeight: '600' }}>{r.product}, batch {r.batch}</div>
                        <div style={{ fontSize: '13.5px', color: '#55645E' }}>
                          {r.id} · {r.date} · by {r.by}
                          {r.rev > 0 ? ' · revised ' + r.rev + (r.rev === 1 ? ' time' : ' times') : ''}
                        </div>
                      </div>
                      <span className="tag">{r.reason}</span>
                      <div style={{ flex: '0 1 150px', fontVariantNumeric: 'tabular-nums' }}>
                        <div style={{ fontWeight: '600' }}>{r.qty} kg</div>
                        <div style={{ fontSize: '13.5px', color: '#55645E' }}>{money(r.cost)}</div>
                      </div>
                      {st.editing === r.id ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input ref={setEditRef} className="field" style={{ width: '110px' }} type="number" min="0" step="0.5" defaultValue={r.qty} aria-label="Corrected quantity in kg" />
                          <button className="btn" type="button" onClick={() => saveEdit(r.id)}>Save</button>
                          <button className="btn ghost" type="button" onClick={cancelEdit}>Cancel</button>
                        </div>
                      ) : (
                        <button className="linkbtn" type="button" onClick={() => edit(r.id)}>Correct</button>
                      )}
                    </div>
                  </Fragment>
                ))}
              </div>
              <p style={{ margin: '14px 0 0', fontSize: '13px', lineHeight: '1.5', color: '#55645E' }}>
                Corrections are for Admin / Manager and keep a revision log. The original record is never overwritten silently.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
