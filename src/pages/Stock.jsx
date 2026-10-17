import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { DCLogic } from '../lib/DCLogic';
import Sidebar from '../components/Sidebar';
import './Stock.css';

export const path = '/stock';
export const title = 'Stock in and out';

export default class Stock extends DCLogic {
  renderVals() {
    const m = (this.state && this.state.mode) || 'in';
    const defs = [
      ['in', 'Receive stock'],
      ['out', 'Issue stock'],
    ];
    return {
      isIn: m === 'in',
      isOut: m === 'out',
      tabs: defs.map((d) => ({
        label: d[1],
        cls: d[0] === m ? 'seg on' : 'seg',
        pick: () => this.setState({ mode: d[0] }),
      })),
    };
  }

  template(v) {
    const { isIn, isOut, tabs } = v;
    return (
      <div className="pg-stock">
        <div className="app-shell" style={{ minHeight: '1000px', display: 'flex', flexWrap: 'wrap', background: '#EEF1EF' }}>
          <div className="app-side" style={{ flex: '0 0 248px' }}>
            <Sidebar active="stock" />
          </div>
          <main
            className="app-main"
            style={{
              flex: '999 1 560px',
              minWidth: '0',
              padding: '16px 16px 16px 0',
              boxSizing: 'border-box',
            }}
          >
            <div
              className="app-card"
              style={{
                background: '#fff',
                borderRadius: '22px',
                padding: '36px 40px 40px',
                minHeight: '968px',
                boxSizing: 'border-box',
              }}
            >
              <h1
                className="d"
                style={{ margin: '0', fontSize: '34px', lineHeight: '1.1', fontWeight: '600' }}
              >
                Stock in and out
              </h1>
              <p style={{ margin: '8px 0 0', fontSize: '15.5px', color: '#55645E' }}>
                Every movement is saved as a transaction that cannot be edited later.
              </p>
              <div
                style={{
                  marginTop: '28px',
                  display: 'inline-flex',
                  padding: '4px',
                  borderRadius: '13px',
                  background: '#EEF1EF',
                  gap: '2px',
                }}
                role="tablist"
              >
                {tabs.map((t, _i) => (
                  <Fragment key={_i}>
                    <button className={t.cls} onClick={t.pick}>
                      {t.label}
                    </button>
                  </Fragment>
                ))}
              </div>
              {isIn ? (
                <>
                  <div
                    style={{
                      marginTop: '32px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '56px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <form
                      style={{
                        flex: '1 1 440px',
                        maxWidth: '600px',
                        minWidth: '0',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
                        gap: '22px 20px',
                      }}
                      action="Stock.dc.html"
                    >
                      <div style={{ gridColumn: '1 / span 2' }}>
                        <label className="lbl" htmlFor="in-product">
                          Product
                        </label>{' '}
                        <select id="in-product" className="field">
                          <option>Papayas (PAP-001)</option>
                          <option>Red grapes (GRP-001)</option>
                          <option>Oranges (ORG-001)</option>
                          <option>Bananas (BAN-001)</option>
                        </select>
                      </div>
                      <div style={{ gridColumn: '1 / span 2' }}>
                        <label className="lbl" htmlFor="in-supplier">
                          Supplier
                        </label>{' '}
                        <select id="in-supplier" className="field">
                          <option>Kebun Hijau Supply</option>
                          <option>Ladang Segar</option>
                          <option>Pasar Borong Melaka</option>
                        </select>
                      </div>
                      <div>
                        <label className="lbl" htmlFor="in-batch">
                          Batch number
                        </label>{' '}
                        <input id="in-batch" className="field" type="text" placeholder="G-126" />
                      </div>
                      <div>
                        <label className="lbl" htmlFor="in-qty">
                          Quantity in kg
                        </label>{' '}
                        <input id="in-qty" className="field" type="number" placeholder="40" />
                      </div>
                      <div>
                        <label className="lbl" htmlFor="in-received">
                          Received on
                        </label>{' '}
                        <input id="in-received" className="field" type="date" />
                      </div>
                      <div>
                        <label className="lbl" htmlFor="in-expiry">
                          Expires on
                        </label>{' '}
                        <input id="in-expiry" className="field" type="date" />
                      </div>
                      <div
                        style={{
                          gridColumn: '1 / span 2',
                          display: 'flex',
                          gap: '12px',
                          flexWrap: 'wrap',
                          marginTop: '6px',
                        }}
                      >
                        <button className="btn" type="button">
                          Save stock-in
                        </button>{' '}
                        <Link className="btn ghost" to="/products">
                          Cancel
                        </Link>
                      </div>
                    </form>
                    <aside
                      style={{
                        flex: '1 1 340px',
                        minWidth: '0',
                        maxWidth: '440px',
                        background: '#F4F6F5',
                        borderRadius: '18px',
                        padding: '26px 28px',
                      }}
                    >
                      <h2
                        className="d"
                        style={{ margin: '0', fontSize: '20px', fontWeight: '600', letterSpacing: '-0.02em' }}
                      >
                        What happens when you save
                      </h2>
                      <div style={{ marginTop: '16px' }}>
                        <p
                          style={{
                            margin: '0',
                            padding: '14px 0',
                            borderTop: '1px solid #DDE3DF',
                            fontSize: '15px',
                            lineHeight: '1.5',
                          }}
                        >
                          A new batch is created for the product, with the quantity you entered.
                        </p>
                        <p
                          style={{
                            margin: '0',
                            padding: '14px 0',
                            borderTop: '1px solid #DDE3DF',
                            fontSize: '15px',
                            lineHeight: '1.5',
                          }}
                        >
                          One stock-in transaction is recorded under your name.
                        </p>
                        <p
                          style={{
                            margin: '0',
                            padding: '14px 0',
                            borderTop: '1px solid #DDE3DF',
                            fontSize: '15px',
                            lineHeight: '1.5',
                          }}
                        >
                          Low-stock and expiry alerts are checked again straight away.
                        </p>
                        <p
                          style={{
                            margin: '0',
                            padding: '14px 0',
                            borderTop: '1px solid #DDE3DF',
                            borderBottom: '1px solid #DDE3DF',
                            fontSize: '15px',
                            lineHeight: '1.5',
                          }}
                        >
                          Perishable products need an expiry date, and it cannot be before the received date.
                        </p>
                      </div>
                    </aside>
                  </div>
                </>
              ) : null}
              {isOut ? (
                <>
                  <div
                    style={{
                      marginTop: '32px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '56px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <form
                      style={{
                        flex: '1 1 440px',
                        maxWidth: '600px',
                        minWidth: '0',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
                        gap: '22px 20px',
                      }}
                      action="Stock.dc.html"
                    >
                      <div style={{ gridColumn: '1 / span 2' }}>
                        <label className="lbl" htmlFor="out-product">
                          Product
                        </label>{' '}
                        <select id="out-product" className="field">
                          <option>Papayas (46 kg on hand)</option>
                          <option>Red grapes (40 kg on hand)</option>
                          <option>Oranges (6 kg on hand)</option>
                        </select>
                      </div>
                      <div>
                        <label className="lbl" htmlFor="out-qty">
                          Quantity in kg
                        </label>{' '}
                        <input id="out-qty" className="field" type="number" placeholder="25" />
                      </div>
                      <div>
                        <label className="lbl" htmlFor="out-reason">
                          Reason
                        </label>{' '}
                        <select id="out-reason" className="field">
                          <option>Sale</option>
                          <option>Used in kitchen</option>
                          <option>Waste</option>
                          <option>Transfer</option>
                        </select>
                      </div>
                      <div style={{ gridColumn: '1 / span 2' }}>
                        <label className="lbl" htmlFor="out-note">
                          Note (optional)
                        </label>{' '}
                        <input id="out-note" className="field" type="text" placeholder="Add a short note" />
                      </div>
                      <div
                        style={{
                          gridColumn: '1 / span 2',
                          display: 'flex',
                          gap: '12px',
                          flexWrap: 'wrap',
                          marginTop: '6px',
                        }}
                      >
                        <button className="btn" type="button">
                          Confirm stock-out
                        </button>{' '}
                        <button className="btn ghost" type="button">
                          Choose batches myself
                        </button>
                      </div>
                    </form>
                    <aside
                      style={{
                        flex: '1 1 360px',
                        minWidth: '0',
                        maxWidth: '460px',
                        background: '#F4F6F5',
                        borderRadius: '18px',
                        padding: '26px 28px',
                      }}
                    >
                      <h2
                        className="d"
                        style={{ margin: '0', fontSize: '20px', fontWeight: '600', letterSpacing: '-0.02em' }}
                      >
                        Issue 25 kg of Papayas
                      </h2>
                      <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#55645E' }}>
                        Taken from the batches that expire first.
                      </p>
                      <div
                        style={{
                          marginTop: '18px',
                          display: 'grid',
                          gridTemplateColumns: '1fr auto auto',
                          gap: '0 20px',
                          alignItems: 'center',
                          fontSize: '14.5px',
                        }}
                      >
                        <span style={{ padding: '12px 0', borderTop: '1px solid #DDE3DF' }}>
                          <span style={{ display: 'block', fontWeight: '600' }}>P-118</span>
                          <span style={{ display: 'block', fontSize: '13px', color: '#7A5200' }}>
                            Expires in 3 days
                          </span>
                        </span>{' '}
                        <span
                          style={{
                            padding: '12px 0',
                            borderTop: '1px solid #DDE3DF',
                            fontVariantNumeric: 'tabular-nums',
                            fontWeight: '600',
                          }}
                        >
                          −18 kg
                        </span>{' '}
                        <span
                          style={{
                            padding: '12px 0',
                            borderTop: '1px solid #DDE3DF',
                            fontSize: '13px',
                            color: '#55645E',
                          }}
                        >
                          0 left
                        </span>{' '}
                        <span style={{ padding: '12px 0', borderTop: '1px solid #DDE3DF' }}>
                          <span style={{ display: 'block', fontWeight: '600' }}>P-121</span>
                          <span style={{ display: 'block', fontSize: '13px', color: '#17603D' }}>
                            Expires in 6 days
                          </span>
                        </span>{' '}
                        <span
                          style={{
                            padding: '12px 0',
                            borderTop: '1px solid #DDE3DF',
                            fontVariantNumeric: 'tabular-nums',
                            fontWeight: '600',
                          }}
                        >
                          −7 kg
                        </span>{' '}
                        <span
                          style={{
                            padding: '12px 0',
                            borderTop: '1px solid #DDE3DF',
                            fontSize: '13px',
                            color: '#55645E',
                          }}
                        >
                          13 left
                        </span>{' '}
                        <span
                          style={{
                            padding: '12px 0',
                            borderTop: '1px solid #DDE3DF',
                            borderBottom: '1px solid #DDE3DF',
                            color: '#55645E',
                          }}
                        >
                          P-125 is not used
                        </span>{' '}
                        <span
                          style={{
                            padding: '12px 0',
                            borderTop: '1px solid #DDE3DF',
                            borderBottom: '1px solid #DDE3DF',
                            fontVariantNumeric: 'tabular-nums',
                            color: '#55645E',
                          }}
                        >
                          0 kg
                        </span>{' '}
                        <span
                          style={{
                            padding: '12px 0',
                            borderTop: '1px solid #DDE3DF',
                            borderBottom: '1px solid #DDE3DF',
                            fontSize: '13px',
                            color: '#55645E',
                          }}
                        >
                          8 left
                        </span>
                      </div>
                      <p style={{ margin: '16px 0 0', fontSize: '14.5px', lineHeight: '1.5' }}>
                        21 kg will remain in stock. Two transactions will be recorded, one for each batch.
                      </p>
                      <p
                        style={{
                          margin: '14px 0 0',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          background: '#FBEFD0',
                          color: '#5C3E00',
                          fontSize: '13.5px',
                          lineHeight: '1.5',
                        }}
                      >
                        Stock that has expired can only be removed as waste. SmartStock will ask for that
                        reason if you pick an expired batch.
                      </p>
                    </aside>
                  </div>
                </>
              ) : null}
            </div>
          </main>
        </div>
      </div>
    );
  }
}
