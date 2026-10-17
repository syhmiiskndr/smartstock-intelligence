import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { DCLogic } from '../lib/DCLogic';
import Sidebar from '../components/Sidebar';
import './Alerts.css';

export const path = '/alerts';
export const title = 'Alerts';

export default class Alerts extends DCLogic {
  renderVals() {
    const st = this.state || {};
    const f = st.filter || 'all';
    const read = st.read || {};
    const all = !!st.all;
    const base = [
      {
        id: 'a1',
        kind: 'expired',
        title: 'Strawberries, batch S-044',
        detail: '2 kg expired yesterday and is still in stock. Remove it as waste or adjust the count.',
        time: 'Today, 08:00',
        unread: true,
      },
      {
        id: 'a2',
        kind: 'near',
        title: 'Strawberries, batch B-209',
        detail: '5 kg expires tomorrow. Consider a promotion or issue it first.',
        time: 'Today, 08:00',
        unread: true,
      },
      {
        id: 'a3',
        kind: 'near',
        title: 'Papayas, batch P-118',
        detail: '18 kg expires in 3 days.',
        time: 'Today, 08:00',
        unread: false,
      },
      {
        id: 'a4',
        kind: 'low',
        title: 'Oranges',
        detail: '6 kg left. Reorder level is 10 kg.',
        time: 'Today, 08:40',
        unread: true,
      },
      {
        id: 'a5',
        kind: 'low',
        title: 'Green chillies',
        detail: '3 kg left. Reorder level is 5 kg.',
        time: 'Yesterday, 17:05',
        unread: false,
      },
      {
        id: 'a6',
        kind: 'expired',
        title: 'Lettuce, batch L-014',
        detail: 'Resolved after 3 kg was removed as waste.',
        time: 'Yesterday, 15:10',
        unread: false,
        resolved: true,
      },
    ];
    const withState = base.map((a) => Object.assign({}, a, { unread: a.unread && !all && !read[a.id] }));
    const shown = f === 'all' ? withState : withState.filter((a) => a.kind === f);
    const unreadCount = withState.filter((a) => a.unread).length;
    const items = shown.map((a) => ({
      title: a.title,
      detail: a.detail,
      time: a.time,
      unread: a.unread,
      resolved: !!a.resolved,
      isExpired: a.kind === 'expired' && !a.resolved,
      isNear: a.kind === 'near',
      isLow: a.kind === 'low',
      markRead: () => this.setState({ read: Object.assign({}, read, { [a.id]: true }) }),
    }));
    const defs = [
      ['all', 'All'],
      ['low', 'Low stock'],
      ['near', 'Near expiry'],
      ['expired', 'Expired'],
    ];
    return {
      unreadText:
        unreadCount === 0
          ? 'You are all caught up.'
          : unreadCount === 1
            ? '1 unread alert.'
            : unreadCount + ' unread alerts.',
      markAll: () => this.setState({ all: true }),
      items,
      isEmpty: items.length === 0,
      tabs: defs.map((d) => ({
        label: d[1],
        cls: d[0] === f ? 'tab on' : 'tab',
        pick: () => this.setState({ filter: d[0] }),
      })),
    };
  }

  template(v) {
    const { isEmpty, items, markAll, tabs, unreadText } = v;
    return (
      <div className="pg-alerts">
        <div className="app-shell" style={{ minHeight: '1000px', display: 'flex', flexWrap: 'wrap', background: '#EEF1EF' }}>
          <div className="app-side" style={{ flex: '0 0 248px' }}>
            <Sidebar active="alerts" />
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
                    Alerts
                  </h1>
                  <p style={{ margin: '8px 0 0', fontSize: '15.5px', color: '#55645E' }}>{unreadText}</p>
                </div>
                <button className="btn" onClick={markAll}>
                  Mark all as read
                </button>
              </div>
              <div style={{ marginTop: '28px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {tabs.map((t, _i) => (
                  <Fragment key={_i}>
                    <button className={t.cls} onClick={t.pick}>
                      {t.label}
                    </button>
                  </Fragment>
                ))}
              </div>
              <div
                style={{
                  marginTop: '24px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '40px',
                  alignItems: 'flex-start',
                }}
              >
                <section style={{ flex: '1.8 1 560px', minWidth: '0', borderTop: '1px solid #14231E' }}>
                  {items.map((a, _i) => (
                    <Fragment key={_i}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '16px',
                          alignItems: 'flex-start',
                          padding: '20px 0',
                          borderBottom: '1px solid #E7ECE9',
                        }}
                      >
                        <span style={{ flex: 'none', width: '20px', paddingTop: '7px' }}>
                          {a.unread ? (
                            <>
                              <span
                                style={{
                                  display: 'block',
                                  width: '9px',
                                  height: '9px',
                                  borderRadius: '50%',
                                  background: '#2D4BE0',
                                }}
                                title="Unread"
                              ></span>
                            </>
                          ) : null}
                        </span>
                        <div style={{ flex: '1 1 280px', minWidth: '0' }}>
                          <div
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}
                          >
                            {a.isExpired ? (
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
                                  Expired
                                </span>
                              </>
                            ) : null}
                            {a.isNear ? (
                              <>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '7px',
                                    padding: '3px 10px',
                                    borderRadius: '999px',
                                    background: '#FBEFD0',
                                    color: '#7A5200',
                                    fontSize: '12.5px',
                                    fontWeight: '600',
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%',
                                      background: '#D9981E',
                                    }}
                                  ></span>
                                  Near expiry
                                </span>
                              </>
                            ) : null}
                            {a.isLow ? (
                              <>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '7px',
                                    padding: '3px 10px',
                                    borderRadius: '999px',
                                    background: '#FBEFD0',
                                    color: '#7A5200',
                                    fontSize: '12.5px',
                                    fontWeight: '600',
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%',
                                      background: '#D9981E',
                                    }}
                                  ></span>
                                  Low stock
                                </span>
                              </>
                            ) : null}
                            {a.resolved ? (
                              <>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    padding: '3px 10px',
                                    borderRadius: '999px',
                                    background: '#E7ECE9',
                                    color: '#2C3B35',
                                    fontSize: '12.5px',
                                    fontWeight: '600',
                                  }}
                                >
                                  Resolved
                                </span>
                              </>
                            ) : null}
                            <span style={{ fontSize: '13px', color: '#55645E' }}>{a.time}</span>
                          </div>
                          <div style={{ marginTop: '8px', fontSize: '16px', fontWeight: '600' }}>
                            {a.title}
                          </div>
                          <div
                            style={{
                              marginTop: '2px',
                              fontSize: '14.5px',
                              lineHeight: '1.5',
                              color: '#55645E',
                            }}
                          >
                            {a.detail}
                          </div>
                        </div>
                        <div
                          style={{
                            flex: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: '10px',
                            paddingTop: '4px',
                          }}
                        >
                          <Link
                            to="/products/detail"
                            style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              textDecoration: 'underline',
                              textUnderlineOffset: '4px',
                            }}
                          >
                            Open product
                          </Link>
                          {a.unread ? (
                            <>
                              <button className="link" onClick={a.markRead}>
                                Mark as read
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </Fragment>
                  ))}
                  {isEmpty ? (
                    <>
                      <p style={{ margin: '24px 0', fontSize: '15px', color: '#55645E' }}>
                        Nothing to show here. Alerts appear when stock runs low or a batch nears its expiry
                        date.
                      </p>
                    </>
                  ) : null}
                </section>
                <aside
                  style={{
                    flex: '1 1 300px',
                    minWidth: '0',
                    background: '#F4F6F5',
                    borderRadius: '18px',
                    padding: '24px 26px',
                  }}
                >
                  <h2
                    className="d"
                    style={{ margin: '0', fontSize: '19px', fontWeight: '600', letterSpacing: '-0.02em' }}
                  >
                    How alerts are raised
                  </h2>
                  <div style={{ marginTop: '14px', fontSize: '14.5px', lineHeight: '1.5' }}>
                    <p style={{ margin: '0', padding: '13px 0', borderTop: '1px solid #DDE3DF' }}>
                      <strong>Low stock</strong> when the total on hand is at or below the product's reorder
                      level.
                    </p>
                    <p style={{ margin: '0', padding: '13px 0', borderTop: '1px solid #DDE3DF' }}>
                      <strong>Near expiry</strong> when a batch with stock expires within 3 days. Each product
                      can use its own number.
                    </p>
                    <p style={{ margin: '0', padding: '13px 0', borderTop: '1px solid #DDE3DF' }}>
                      <strong>Expired</strong> when a batch still has stock after its expiry date.
                    </p>
                    <p
                      style={{
                        margin: '0',
                        padding: '13px 0',
                        borderTop: '1px solid #DDE3DF',
                        borderBottom: '1px solid #DDE3DF',
                      }}
                    >
                      Rules run every morning at 08:00 and again after each stock movement. An alert clears
                      itself when the problem is fixed.
                    </p>
                  </div>
                  <p style={{ margin: '16px 0 0' }}>
                    <Link
                      to="/settings"
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        textDecoration: 'underline',
                        textUnderlineOffset: '4px',
                      }}
                    >
                      Change alert rules
                    </Link>
                  </p>
                </aside>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
