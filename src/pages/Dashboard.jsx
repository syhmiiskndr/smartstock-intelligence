import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { DCLogic } from '../lib/DCLogic';
import Sidebar from '../components/Sidebar';
import './Dashboard.css';

export const path = '/dashboard';
export const title = 'Dashboard';

export default class Dashboard extends DCLogic {
  renderVals() {
    return {};
  }

  template(v) {
    return (
      <div className="pg-dashboard">
        <div className="app-shell" style={{ minHeight: '1000px', display: 'flex', flexWrap: 'wrap', background: '#EEF1EF' }}>
          <div className="app-side" style={{ flex: '0 0 248px' }}>
            <Sidebar active="dashboard" />
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
                minHeight: '1068px',
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
                    Good morning, Aina
                  </h1>
                  <p style={{ margin: '8px 0 0', fontSize: '15.5px', color: '#55645E' }}>
                    Thursday 15 October. Two batches need attention today.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Link className="btn ghost" to="/inspect">
                    Run inspection
                  </Link>{' '}
                  <Link className="btn" to="/stock">
                    Receive stock
                  </Link>
                </div>
              </div>
              <div
                style={{
                  marginTop: '32px',
                  background: '#F4F6F5',
                  borderRadius: '18px',
                  padding: '24px 8px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))',
                  rowGap: '20px',
                }}
              >
                <div style={{ padding: '0 24px' }}>
                  <div style={{ fontSize: '14px', color: '#55645E' }}>Active products</div>
                  <div
                    className="d"
                    style={{
                      marginTop: '6px',
                      fontSize: '40px',
                      lineHeight: '1',
                      fontWeight: '600',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    128
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '13.5px', color: '#55645E' }}>
                    In 6 categories
                  </div>
                </div>
                <div style={{ padding: '0 24px', borderLeft: '1px solid #DDE3DF' }}>
                  <div style={{ fontSize: '14px', color: '#55645E' }}>Low stock</div>
                  <div
                    className="d"
                    style={{
                      marginTop: '6px',
                      fontSize: '40px',
                      lineHeight: '1',
                      fontWeight: '600',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    6
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '13.5px', fontWeight: '500', color: '#7A5200' }}>
                    Below reorder level
                  </div>
                </div>
                <div style={{ padding: '0 24px', borderLeft: '1px solid #DDE3DF' }}>
                  <div style={{ fontSize: '14px', color: '#55645E' }}>Near expiry</div>
                  <div
                    className="d"
                    style={{
                      marginTop: '6px',
                      fontSize: '40px',
                      lineHeight: '1',
                      fontWeight: '600',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    9
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '13.5px', fontWeight: '500', color: '#7A5200' }}>
                    Within 3 days
                  </div>
                </div>
                <div style={{ padding: '0 24px', borderLeft: '1px solid #DDE3DF' }}>
                  <div style={{ fontSize: '14px', color: '#55645E' }}>Expired</div>
                  <div
                    className="d"
                    style={{
                      marginTop: '6px',
                      fontSize: '40px',
                      lineHeight: '1',
                      fontWeight: '600',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    2
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '13.5px', fontWeight: '500', color: '#8E2434' }}>
                    Still in stock
                  </div>
                </div>
                <div style={{ padding: '0 24px', borderLeft: '1px solid #DDE3DF' }}>
                  <div style={{ fontSize: '14px', color: '#55645E' }}>Inspections today</div>
                  <div
                    className="d"
                    style={{
                      marginTop: '6px',
                      fontSize: '40px',
                      lineHeight: '1',
                      fontWeight: '600',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    7
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '13.5px', fontWeight: '500', color: '#1F36A8' }}>
                    1 needs review
                  </div>
                </div>
              </div>
              <div
                style={{
                  marginTop: '28px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '32px',
                  alignItems: 'flex-start',
                }}
              >
                <section
                  style={{
                    flex: '1.5 1 540px',
                    minWidth: '0',
                    border: '1px solid #E1E7E3',
                    borderRadius: '18px',
                    padding: '24px 28px 28px',
                  }}
                >
                  <h2
                    className="d"
                    style={{ margin: '0', fontSize: '21px', fontWeight: '600', letterSpacing: '-0.02em' }}
                  >
                    Expiry runway
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#55645E' }}>
                    Batches with stock, by days left until expiry.
                  </p>
                  <div
                    style={{
                      marginTop: '22px',
                      display: 'grid',
                      gridTemplateColumns: '168px repeat(14,minmax(0,1fr))',
                      rowGap: '12px',
                      alignItems: 'center',
                      fontSize: '12.5px',
                      color: '#55645E',
                    }}
                  >
                    <span></span> <span style={{ textAlign: 'left' }}>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                    <span>5</span>
                    <span>6</span>
                    <span>7</span>
                    <span>8</span>
                    <span>9</span>
                    <span>10</span>
                    <span>11</span>
                    <span>12</span>
                    <span>13</span>
                    <span>14</span>
                    <div style={{ color: '#14231E', lineHeight: '1.25' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>Strawberries</div>
                      <div style={{ fontSize: '12.5px', color: '#8E2434' }}>S-044, expired</div>
                    </div>
                    <div
                      style={{
                        gridColumn: '2 / span 1',
                        height: '14px',
                        borderRadius: '7px',
                        background: '#C2384D',
                      }}
                    ></div>
                    <span style={{ gridColumn: '3 / span 13' }}></span>
                    <div style={{ color: '#14231E', lineHeight: '1.25' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>Strawberries</div>
                      <div style={{ fontSize: '12.5px', color: '#7A5200' }}>B-209, 1 day left</div>
                    </div>
                    <div
                      style={{
                        gridColumn: '2 / span 1',
                        height: '14px',
                        borderRadius: '7px',
                        background: '#D9981E',
                      }}
                    ></div>
                    <span style={{ gridColumn: '3 / span 13' }}></span>
                    <div style={{ color: '#14231E', lineHeight: '1.25' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>Papayas</div>
                      <div style={{ fontSize: '12.5px', color: '#7A5200' }}>P-118, 3 days left</div>
                    </div>
                    <div
                      style={{
                        gridColumn: '2 / span 3',
                        height: '14px',
                        borderRadius: '7px',
                        background: '#D9981E',
                      }}
                    ></div>
                    <span style={{ gridColumn: '5 / span 11' }}></span>
                    <div style={{ color: '#14231E', lineHeight: '1.25' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>Bananas</div>
                      <div style={{ fontSize: '12.5px', color: '#17603D' }}>N-077, 5 days left</div>
                    </div>
                    <div
                      style={{
                        gridColumn: '2 / span 5',
                        height: '14px',
                        borderRadius: '7px',
                        background: '#2E8B5B',
                      }}
                    ></div>
                    <span style={{ gridColumn: '7 / span 9' }}></span>
                    <div style={{ color: '#14231E', lineHeight: '1.25' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>Oranges</div>
                      <div style={{ fontSize: '12.5px', color: '#17603D' }}>O-032, 6 days left</div>
                    </div>
                    <div
                      style={{
                        gridColumn: '2 / span 6',
                        height: '14px',
                        borderRadius: '7px',
                        background: '#2E8B5B',
                      }}
                    ></div>
                    <span style={{ gridColumn: '8 / span 8' }}></span>
                    <div style={{ color: '#14231E', lineHeight: '1.25' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>Red grapes</div>
                      <div style={{ fontSize: '12.5px', color: '#17603D' }}>G-126, 9 days left</div>
                    </div>
                    <div
                      style={{
                        gridColumn: '2 / span 9',
                        height: '14px',
                        borderRadius: '7px',
                        background: '#2E8B5B',
                      }}
                    ></div>
                    <span style={{ gridColumn: '11 / span 5' }}></span>
                    <div style={{ color: '#14231E', lineHeight: '1.25' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>Gala apples</div>
                      <div style={{ fontSize: '12.5px', color: '#17603D' }}>A-081, 12 days left</div>
                    </div>
                    <div
                      style={{
                        gridColumn: '2 / span 12',
                        height: '14px',
                        borderRadius: '7px',
                        background: '#2E8B5B',
                      }}
                    ></div>
                    <span style={{ gridColumn: '14 / span 2' }}></span>
                  </div>
                </section>
                <section style={{ flex: '1 1 340px', minWidth: '0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h2
                      className="d"
                      style={{ margin: '0', fontSize: '21px', fontWeight: '600', letterSpacing: '-0.02em' }}
                    >
                      Needs attention
                    </h2>
                    <Link
                      to="/alerts"
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        textDecoration: 'underline',
                        textUnderlineOffset: '4px',
                      }}
                    >
                      All alerts
                    </Link>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ padding: '16px 0', borderTop: '1px solid #E1E7E3' }}>
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
                          style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C2384D' }}
                        ></span>
                        Expired
                      </span>
                      <div style={{ marginTop: '8px', fontSize: '15px', fontWeight: '600' }}>
                        Strawberries S-044
                      </div>
                      <div style={{ fontSize: '14px', color: '#55645E', lineHeight: '1.45' }}>
                        Expired yesterday. 2 kg is still in stock.
                      </div>
                    </div>
                    <div style={{ padding: '16px 0', borderTop: '1px solid #E1E7E3' }}>
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
                          style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D9981E' }}
                        ></span>
                        Near expiry
                      </span>
                      <div style={{ marginTop: '8px', fontSize: '15px', fontWeight: '600' }}>
                        Strawberries B-209
                      </div>
                      <div style={{ fontSize: '14px', color: '#55645E', lineHeight: '1.45' }}>
                        Expires tomorrow. 5 kg on hand.
                      </div>
                    </div>
                    <div style={{ padding: '16px 0', borderTop: '1px solid #E1E7E3' }}>
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
                          style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D9981E' }}
                        ></span>
                        Low stock
                      </span>
                      <div style={{ marginTop: '8px', fontSize: '15px', fontWeight: '600' }}>Oranges</div>
                      <div style={{ fontSize: '14px', color: '#55645E', lineHeight: '1.45' }}>
                        6 kg left. Reorder level is 10 kg.
                      </div>
                    </div>
                    <div style={{ padding: '16px 0', borderTop: '1px solid #E1E7E3' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '7px',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          background: '#E3E8FD',
                          color: '#1F36A8',
                          fontSize: '12.5px',
                          fontWeight: '600',
                        }}
                      >
                        <span
                          style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2D4BE0' }}
                        ></span>
                        Review
                      </span>
                      <div style={{ marginTop: '8px', fontSize: '15px', fontWeight: '600' }}>
                        Oranges O-032
                      </div>
                      <div style={{ fontSize: '14px', color: '#55645E', lineHeight: '1.45' }}>
                        Low-confidence inspection. Check by hand.
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              <div
                style={{
                  marginTop: '32px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '40px',
                  alignItems: 'flex-start',
                }}
              >
                <section style={{ flex: '1.5 1 540px', minWidth: '0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h2
                      className="d"
                      style={{ margin: '0', fontSize: '21px', fontWeight: '600', letterSpacing: '-0.02em' }}
                    >
                      Recent movements
                    </h2>
                    <Link
                      to="/adjustments"
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        textDecoration: 'underline',
                        textUnderlineOffset: '4px',
                      }}
                    >
                      All transactions
                    </Link>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '14.5px', overflowX: 'auto' }}>
                    <div style={{ minWidth: '480px' }}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '64px 104px 1fr 84px 72px',
                          gap: '12px',
                          padding: '10px 0',
                          borderBottom: '1px solid #14231E',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#55645E',
                        }}
                      >
                        <span>Time</span>
                        <span>Movement</span>
                        <span>Product and batch</span>
                        <span style={{ textAlign: 'right' }}>Quantity</span>
                        <span>By</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '64px 104px 1fr 84px 72px',
                          gap: '12px',
                          padding: '12px 0',
                          borderBottom: '1px solid #E7ECE9',
                        }}
                      >
                        <span style={{ color: '#55645E' }}>10:15</span>
                        <span>Stock-in</span>
                        <span>Bananas N-079</span>
                        <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>+25 kg</span>
                        <span>Farid</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '64px 104px 1fr 84px 72px',
                          gap: '12px',
                          padding: '12px 0',
                          borderBottom: '1px solid #E7ECE9',
                        }}
                      >
                        <span style={{ color: '#55645E' }}>09:42</span>
                        <span>Stock-out</span>
                        <span>Gala apples A-077</span>
                        <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>−3 kg</span>
                        <span>Daniel</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '64px 104px 1fr 84px 72px',
                          gap: '12px',
                          padding: '12px 0',
                          borderBottom: '1px solid #E7ECE9',
                        }}
                      >
                        <span style={{ color: '#55645E' }}>09:05</span>
                        <span>Adjustment</span>
                        <span>Strawberries S-044</span>
                        <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>−2 kg</span>
                        <span>Aina</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '64px 104px 1fr 84px 72px',
                          gap: '12px',
                          padding: '12px 0',
                          borderBottom: '1px solid #E7ECE9',
                        }}
                      >
                        <span style={{ color: '#55645E' }}>08:40</span>
                        <span>Stock-out</span>
                        <span>Oranges O-032</span>
                        <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>−4 kg</span>
                        <span>Siti</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '64px 104px 1fr 84px 72px',
                          gap: '12px',
                          padding: '12px 0',
                        }}
                      >
                        <span style={{ color: '#55645E' }}>08:12</span>
                        <span>Stock-in</span>
                        <span>Red grapes G-126</span>
                        <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>+40 kg</span>
                        <span>Farid</span>
                      </div>
                    </div>
                  </div>
                </section>
                <section style={{ flex: '1 1 340px', minWidth: '0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h2
                      className="d"
                      style={{ margin: '0', fontSize: '21px', fontWeight: '600', letterSpacing: '-0.02em' }}
                    >
                      Today's inspections
                    </h2>
                    <Link
                      to="/history"
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        textDecoration: 'underline',
                        textUnderlineOffset: '4px',
                      }}
                    >
                      View all
                    </Link>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '13px 0',
                        borderTop: '1px solid #E1E7E3',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          flex: 'none',
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: '#A04432',
                        }}
                      ></span>
                      <div style={{ flex: '1 1 130px', minWidth: '0' }}>
                        <div style={{ fontSize: '15px', fontWeight: '600' }}>Gala apples A-077</div>
                        <div style={{ fontSize: '13px', color: '#55645E' }}>09:42 by Daniel</div>
                      </div>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          background: '#F8DDE0',
                          color: '#8E2434',
                          fontSize: '12.5px',
                          fontWeight: '600',
                        }}
                      >
                        <span
                          style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C2384D' }}
                        ></span>
                        Spoiled 88%
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '13px 0',
                        borderTop: '1px solid #E1E7E3',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          flex: 'none',
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: '#3F8D4D',
                        }}
                      ></span>
                      <div style={{ flex: '1 1 130px', minWidth: '0' }}>
                        <div style={{ fontSize: '15px', fontWeight: '600' }}>Oranges O-032</div>
                        <div style={{ fontSize: '13px', color: '#55645E' }}>11:05 by Siti</div>
                      </div>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          background: '#FBEFD0',
                          color: '#7A5200',
                          fontSize: '12.5px',
                          fontWeight: '600',
                        }}
                      >
                        <span
                          style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D9981E' }}
                        ></span>
                        Low confidence 61%
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '13px 0',
                        borderTop: '1px solid #E1E7E3',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          flex: 'none',
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: '#D5412B',
                        }}
                      ></span>
                      <div style={{ flex: '1 1 130px', minWidth: '0' }}>
                        <div style={{ fontSize: '15px', fontWeight: '600' }}>Papayas P-118</div>
                        <div style={{ fontSize: '13px', color: '#55645E' }}>10:30 by Farid</div>
                      </div>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          background: '#E1F1E7',
                          color: '#17603D',
                          fontSize: '12.5px',
                          fontWeight: '600',
                        }}
                      >
                        <span
                          style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2E8B5B' }}
                        ></span>
                        Fresh 94%
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
