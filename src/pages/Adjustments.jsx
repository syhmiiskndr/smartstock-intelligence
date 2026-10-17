import { Fragment } from 'react';
import { DCLogic } from '../lib/DCLogic';
import Sidebar from '../components/Sidebar';
import './Adjustments.css';

export const path = '/adjustments';
export const title = 'Adjustments and history';

export default class Adjustments extends DCLogic {
  renderVals() {
    const st = this.state || {};
    const tab = st.tab || 'req';
    const decisions = st.decisions || {};
    const base = [
      {
        id: 'R-031',
        product: 'Oranges',
        batch: 'O-032',
        change: '−1.5 kg',
        reason: 'Damaged in delivery, not sellable',
        by: 'Amin',
        when: 'Today, 08:55',
        status: 'pending',
      },
      {
        id: 'R-030',
        product: 'Bananas',
        batch: 'N-077',
        change: '+2 kg',
        reason: 'Count correction after stock take',
        by: 'Aina',
        when: 'Yesterday, 17:40',
        status: 'pending',
      },
      {
        id: 'R-029',
        product: 'Lettuce',
        batch: 'L-014',
        change: '−3 kg',
        reason: 'Wilted and discarded',
        by: 'Tanusha',
        when: 'Yesterday, 15:10',
        status: 'approved',
      },
      {
        id: 'R-028',
        product: 'Green chillies',
        batch: 'H-009',
        change: '−1 kg',
        reason: 'Shelf count looked low',
        by: 'Aina',
        when: '12 Oct, 11:20',
        status: 'rejected',
      },
    ];
    const requests = base.map((r) => {
      const s = decisions[r.id] || r.status;
      return {
        id: r.id,
        product: r.product,
        batch: r.batch,
        change: r.change,
        reason: r.reason,
        by: r.by,
        when: r.when,
        isPending: s === 'pending',
        isApproved: s === 'approved',
        isRejected: s === 'rejected',
        approve: () => this.setState({ decisions: Object.assign({}, decisions, { [r.id]: 'approved' }) }),
        reject: () => this.setState({ decisions: Object.assign({}, decisions, { [r.id]: 'rejected' }) }),
      };
    });
    const pending = requests.filter((r) => r.isPending).length;
    const txs = [
      {
        when: '15 Oct, 10:15',
        type: 'Stock-in',
        product: 'Bananas',
        batch: 'N-079',
        qty: '+25 kg',
        by: 'Amin',
        reason: 'Delivery',
      },
      {
        when: '15 Oct, 09:42',
        type: 'Stock-out',
        product: 'Gala apples',
        batch: 'A-077',
        qty: '−3 kg',
        by: 'Tanusha',
        reason: 'Waste',
      },
      {
        when: '15 Oct, 09:05',
        type: 'Adjustment',
        product: 'Strawberries',
        batch: 'S-044',
        qty: '−2 kg',
        by: 'Syahmi',
        reason: 'Expired, removed',
      },
      {
        when: '15 Oct, 08:40',
        type: 'Stock-out',
        product: 'Oranges',
        batch: 'O-032',
        qty: '−4 kg',
        by: 'Aina',
        reason: 'Sale',
      },
      {
        when: '15 Oct, 08:12',
        type: 'Stock-in',
        product: 'Red grapes',
        batch: 'G-126',
        qty: '+40 kg',
        by: 'Amin',
        reason: 'Delivery',
      },
      {
        when: '14 Oct, 17:20',
        type: 'Stock-out',
        product: 'Papayas',
        batch: 'P-118',
        qty: '−6 kg',
        by: 'Amin',
        reason: 'Sale',
      },
      {
        when: '14 Oct, 07:55',
        type: 'Stock-in',
        product: 'Papayas',
        batch: 'P-125',
        qty: '+8 kg',
        by: 'Aina',
        reason: 'Delivery',
      },
      {
        when: '13 Oct, 09:10',
        type: 'Stock-out',
        product: 'Papayas',
        batch: 'P-118',
        qty: '−6 kg',
        by: 'Tanusha',
        reason: 'Used in kitchen',
      },
    ];
    const defs = [
      ['req', 'Adjustment requests'],
      ['tx', 'All transactions'],
    ];
    return {
      pendingText:
        pending === 0
          ? 'No requests are waiting for approval.'
          : pending === 1
            ? '1 request is waiting for approval.'
            : pending + ' requests are waiting for approval.',
      showReq: tab === 'req',
      showTx: tab === 'tx',
      requests,
      txs,
      tabs: defs.map((d) => ({
        label: d[1],
        cls: d[0] === tab ? 'tab on' : 'tab',
        pick: () => this.setState({ tab: d[0] }),
      })),
    };
  }

  template(v) {
    const { pendingText, requests, showReq, showTx, tabs, txs } = v;
    return (
      <div className="pg-adjustments">
        <div className="app-shell" style={{ minHeight: '1000px', display: 'flex', flexWrap: 'wrap', background: '#EEF1EF' }}>
          <div className="app-side" style={{ flex: '0 0 248px' }}>
            <Sidebar active="adjustments" />
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
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '20px',
                }}
              >
                <div>
                  <h1
                    className="d"
                    style={{ margin: '0', fontSize: '34px', lineHeight: '1.1', fontWeight: '600' }}
                  >
                    Adjustments and history
                  </h1>
                  <p style={{ margin: '8px 0 0', fontSize: '15.5px', color: '#55645E' }}>{pendingText}</p>
                </div>
                <button className="btn">Request an adjustment</button>
              </div>
              <div
                style={{
                  marginTop: '28px',
                  borderBottom: '1px solid #E1E7E3',
                  display: 'flex',
                  flexWrap: 'wrap',
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
              {showReq ? (
                <>
                  <div style={{ marginTop: '8px', overflowX: 'auto' }}>
                    <div style={{ minWidth: '900px', fontSize: '14.5px' }}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            '70px minmax(160px,1.3fr) 84px minmax(180px,1.6fr) 150px 210px',
                          gap: '16px',
                          padding: '14px 0',
                          borderBottom: '1px solid #14231E',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#55645E',
                        }}
                      >
                        <span>Request</span>
                        <span>Product and batch</span>
                        <span style={{ textAlign: 'right' }}>Change</span>
                        <span>Reason</span>
                        <span>Requested by</span>
                        <span>Decision</span>
                      </div>
                      {requests.map((r, _i) => (
                        <Fragment key={_i}>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns:
                                '70px minmax(160px,1.3fr) 84px minmax(180px,1.6fr) 150px 210px',
                              gap: '16px',
                              alignItems: 'center',
                              padding: '16px 0',
                              borderBottom: '1px solid #E7ECE9',
                            }}
                          >
                            <span style={{ color: '#55645E' }}>{r.id}</span>{' '}
                            <span>
                              <span style={{ display: 'block', fontWeight: '600' }}>{r.product}</span>
                              <span style={{ display: 'block', fontSize: '13px', color: '#55645E' }}>
                                Batch {r.batch}
                              </span>
                            </span>{' '}
                            <span
                              style={{
                                textAlign: 'right',
                                fontVariantNumeric: 'tabular-nums',
                                fontWeight: '600',
                              }}
                            >
                              {r.change}
                            </span>{' '}
                            <span style={{ lineHeight: '1.4' }}>{r.reason}</span>{' '}
                            <span>
                              <span style={{ display: 'block' }}>{r.by}</span>
                              <span style={{ display: 'block', fontSize: '13px', color: '#55645E' }}>
                                {r.when}
                              </span>
                            </span>{' '}
                            <span>
                              {r.isPending ? (
                                <>
                                  <span style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn sm" onClick={r.approve}>
                                      Approve
                                    </button>
                                    <button className="btn sm ghost" onClick={r.reject}>
                                      Reject
                                    </button>
                                  </span>
                                </>
                              ) : null}
                              {r.isApproved ? (
                                <>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '7px',
                                      padding: '3px 10px',
                                      borderRadius: '999px',
                                      background: '#E1F1E7',
                                      color: '#17603D',
                                      fontSize: '12.5px',
                                      fontWeight: '600',
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: '#2E8B5B',
                                      }}
                                    ></span>
                                    Approved by Syahmi
                                  </span>
                                </>
                              ) : null}
                              {r.isRejected ? (
                                <>
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '7px',
                                      padding: '3px 10px',
                                      borderRadius: '999px',
                                      background: '#F8DDE0',
                                      color: '#8E2434',
                                      fontSize: '12.5px',
                                      fontWeight: '600',
                                    }}
                                  >
                                    <span
                                      style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: '#C2384D',
                                      }}
                                    ></span>
                                    Rejected by Syahmi
                                  </span>
                                </>
                              ) : null}
                            </span>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                  <p
                    style={{
                      margin: '18px 0 0',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      color: '#55645E',
                      maxWidth: '620px',
                    }}
                  >
                    Stock changes only after a manager approves. An approved request creates one adjustment
                    transaction with the requester and the approver recorded.
                  </p>
                </>
              ) : null}
              {showTx ? (
                <>
                  <div
                    style={{
                      marginTop: '20px',
                      display: 'flex',
                      gap: '12px',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <label
                      htmlFor="f-type"
                      style={{
                        position: 'absolute',
                        width: '1px',
                        height: '1px',
                        overflow: 'hidden',
                        clip: 'rect(0 0 0 0)',
                      }}
                    >
                      Movement type
                    </label>{' '}
                    <select id="f-type" className="field">
                      <option>All movements</option>
                      <option>Stock-in</option>
                      <option>Stock-out</option>
                      <option>Adjustment</option>
                    </select>{' '}
                    <label
                      htmlFor="f-date"
                      style={{
                        position: 'absolute',
                        width: '1px',
                        height: '1px',
                        overflow: 'hidden',
                        clip: 'rect(0 0 0 0)',
                      }}
                    >
                      Date range
                    </label>{' '}
                    <select id="f-date" className="field">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>This year</option>
                    </select>{' '}
                    <span style={{ fontSize: '14px', color: '#55645E', marginLeft: '6px' }}>
                      Transactions cannot be edited or deleted. Fix a mistake with an adjustment.
                    </span>
                  </div>
                  <div style={{ marginTop: '12px', overflowX: 'auto' }}>
                    <div style={{ minWidth: '860px', fontSize: '14.5px' }}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            '150px 110px minmax(160px,1.3fr) 90px 80px 90px minmax(140px,1fr)',
                          gap: '16px',
                          padding: '14px 0',
                          borderBottom: '1px solid #14231E',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#55645E',
                        }}
                      >
                        <span>When</span>
                        <span>Movement</span>
                        <span>Product</span>
                        <span>Batch</span>
                        <span style={{ textAlign: 'right' }}>Quantity</span>
                        <span>By</span>
                        <span>Reason</span>
                      </div>
                      {txs.map((x, _i) => (
                        <Fragment key={_i}>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns:
                                '150px 110px minmax(160px,1.3fr) 90px 80px 90px minmax(140px,1fr)',
                              gap: '16px',
                              padding: '14px 0',
                              borderBottom: '1px solid #E7ECE9',
                            }}
                          >
                            <span style={{ color: '#55645E' }}>{x.when}</span>
                            <span>{x.type}</span>
                            <span style={{ fontWeight: '600' }}>{x.product}</span>
                            <span>{x.batch}</span>
                            <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                              {x.qty}
                            </span>
                            <span>{x.by}</span>
                            <span style={{ color: '#2C3B35' }}>{x.reason}</span>
                          </div>
                        </Fragment>
                      ))}
                    </div>
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
