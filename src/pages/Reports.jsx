import { Fragment } from 'react';
import { DCLogic } from '../lib/DCLogic';
import Sidebar from '../components/Sidebar';
import './Reports.css';

export const path = '/reports';
export const title = 'Reports';

export default class Reports extends DCLogic {
  renderVals() {
    const t = (this.state && this.state.tab) || 'stock';
    const defs = [
      ['stock', 'Stock summary'],
      ['moves', 'Movements'],
      ['insp', 'Inspections'],
    ];
    return {
      showStock: t === 'stock',
      showMoves: t === 'moves',
      showInsp: t === 'insp',
      tabs: defs.map((d) => ({
        label: d[1],
        cls: d[0] === t ? 'tab on' : 'tab',
        pick: () => this.setState({ tab: d[0] }),
      })),
    };
  }

  template(v) {
    const { showInsp, showMoves, showStock, tabs } = v;
    return (
      <div className="pg-reports">
        <div className="app-shell" style={{ minHeight: '1000px', display: 'flex', flexWrap: 'wrap', background: '#EEF1EF' }}>
          <div className="app-side" style={{ flex: '0 0 248px' }}>
            <Sidebar active="reports" />
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
                    Reports
                  </h1>
                  <p style={{ margin: '8px 0 0', fontSize: '15.5px', color: '#55645E' }}>
                    Totals always match the records behind them.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button className="btn ghost">Export CSV</button>
                  <button className="btn">Export PDF</button>
                </div>
              </div>
              <div
                style={{
                  marginTop: '28px',
                  borderBottom: '1px solid #E1E7E3',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  gap: '12px',
                }}
                role="tablist"
              >
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {tabs.map((t, _i) => (
                    <Fragment key={_i}>
                      <button className={t.cls} onClick={t.pick}>
                        {t.label}
                      </button>
                    </Fragment>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingBottom: '8px' }}>
                  <label
                    htmlFor="r-range"
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
                  <select id="r-range" className="field">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>This year</option>
                  </select>{' '}
                  <label
                    htmlFor="r-cat"
                    style={{
                      position: 'absolute',
                      width: '1px',
                      height: '1px',
                      overflow: 'hidden',
                      clip: 'rect(0 0 0 0)',
                    }}
                  >
                    Category
                  </label>{' '}
                  <select id="r-cat" className="field">
                    <option>All categories</option>
                    <option>Vegetables</option>
                    <option>Fruit</option>
                    <option>Leafy greens</option>
                  </select>
                </div>
              </div>
              {showStock ? (
                <>
                  <div style={{ marginTop: '12px', overflowX: 'auto' }}>
                    <div style={{ minWidth: '640px', fontSize: '15px' }}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(180px,1.6fr) repeat(4,minmax(80px,1fr))',
                          gap: '16px',
                          padding: '14px 0',
                          borderBottom: '1px solid #14231E',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#55645E',
                        }}
                      >
                        <span>Category</span>
                        <span style={{ textAlign: 'right' }}>Products</span>
                        <span style={{ textAlign: 'right' }}>Low stock</span>
                        <span style={{ textAlign: 'right' }}>Near expiry</span>
                        <span style={{ textAlign: 'right' }}>Expired</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(180px,1.6fr) repeat(4,minmax(80px,1fr))',
                          gap: '16px',
                          padding: '15px 0',
                          borderBottom: '1px solid #E7ECE9',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span style={{ fontWeight: '600' }}>Vegetables</span>
                        <span style={{ textAlign: 'right' }}>41</span>
                        <span style={{ textAlign: 'right' }}>3</span>
                        <span style={{ textAlign: 'right' }}>3</span>
                        <span style={{ textAlign: 'right' }}>0</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(180px,1.6fr) repeat(4,minmax(80px,1fr))',
                          gap: '16px',
                          padding: '15px 0',
                          borderBottom: '1px solid #E7ECE9',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span style={{ fontWeight: '600' }}>Fruit</span>
                        <span style={{ textAlign: 'right' }}>29</span>
                        <span style={{ textAlign: 'right' }}>1</span>
                        <span style={{ textAlign: 'right' }}>3</span>
                        <span style={{ textAlign: 'right' }}>0</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(180px,1.6fr) repeat(4,minmax(80px,1fr))',
                          gap: '16px',
                          padding: '15px 0',
                          borderBottom: '1px solid #E7ECE9',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span style={{ fontWeight: '600' }}>Leafy greens</span>
                        <span style={{ textAlign: 'right' }}>14</span>
                        <span style={{ textAlign: 'right' }}>1</span>
                        <span style={{ textAlign: 'right' }}>1</span>
                        <span style={{ textAlign: 'right' }}>1</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(180px,1.6fr) repeat(4,minmax(80px,1fr))',
                          gap: '16px',
                          padding: '15px 0',
                          borderBottom: '1px solid #E7ECE9',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span style={{ fontWeight: '600' }}>Herbs</span>
                        <span style={{ textAlign: 'right' }}>18</span>
                        <span style={{ textAlign: 'right' }}>1</span>
                        <span style={{ textAlign: 'right' }}>2</span>
                        <span style={{ textAlign: 'right' }}>1</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(180px,1.6fr) repeat(4,minmax(80px,1fr))',
                          gap: '16px',
                          padding: '15px 0',
                          borderBottom: '1px solid #E7ECE9',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span style={{ fontWeight: '600' }}>Root crops</span>
                        <span style={{ textAlign: 'right' }}>16</span>
                        <span style={{ textAlign: 'right' }}>0</span>
                        <span style={{ textAlign: 'right' }}>0</span>
                        <span style={{ textAlign: 'right' }}>0</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(180px,1.6fr) repeat(4,minmax(80px,1fr))',
                          gap: '16px',
                          padding: '15px 0',
                          borderBottom: '1px solid #E7ECE9',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span style={{ fontWeight: '600' }}>Packaged</span>
                        <span style={{ textAlign: 'right' }}>10</span>
                        <span style={{ textAlign: 'right' }}>0</span>
                        <span style={{ textAlign: 'right' }}>0</span>
                        <span style={{ textAlign: 'right' }}>0</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(180px,1.6fr) repeat(4,minmax(80px,1fr))',
                          gap: '16px',
                          padding: '16px 0',
                          borderBottom: '2px solid #14231E',
                          fontVariantNumeric: 'tabular-nums',
                          fontWeight: '600',
                        }}
                      >
                        <span>All products</span>
                        <span style={{ textAlign: 'right' }}>128</span>
                        <span style={{ textAlign: 'right' }}>6</span>
                        <span style={{ textAlign: 'right' }}>9</span>
                        <span style={{ textAlign: 'right' }}>2</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
              {showMoves ? (
                <>
                  <div
                    style={{
                      marginTop: '28px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '40px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ flex: '1.5 1 520px', minWidth: '0' }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '20px',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          fontSize: '14px',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '3px',
                              background: '#14231E',
                            }}
                          ></span>
                          Stock-in, kg
                        </span>{' '}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '3px',
                              background: '#8FA79C',
                            }}
                          ></span>
                          Stock-out, kg
                        </span>
                      </div>
                      <svg
                        viewBox="0 0 640 260"
                        style={{ display: 'block', width: '100%', height: 'auto', marginTop: '12px' }}
                        role="img"
                        aria-label="Stock-in and stock-out in kilograms for each of the last seven days. Stock-in peaked at 210 kg on Sunday."
                      >
                        <g stroke="#E1E7E3" strokeWidth="1">
                          <path d="M48 220H620M48 179H620M48 138H620M48 97H620M48 56H620" />
                        </g>
                        <g
                          fontSize="12"
                          fill="#55645E"
                          fontFamily="Instrument Sans, system-ui, sans-serif"
                          textAnchor="end"
                        >
                          <text x="40" y="224">
                            0
                          </text>
                          <text x="40" y="183">
                            50
                          </text>
                          <text x="40" y="142">
                            100
                          </text>
                          <text x="40" y="101">
                            150
                          </text>
                          <text x="40" y="60">
                            200
                          </text>
                        </g>
                        <g fill="#14231E">
                          <rect x="88" y="122" width="22" height="98" rx="3" />
                          <rect x="168" y="142" width="22" height="78" rx="3" />
                          <rect x="248" y="48" width="22" height="172" rx="3" />
                          <rect x="328" y="105" width="22" height="115" rx="3" />
                          <rect x="408" y="159" width="22" height="61" rx="3" />
                          <rect x="488" y="89" width="22" height="131" rx="3" />
                          <rect x="568" y="167" width="22" height="53" rx="3" />
                        </g>
                        <g fill="#8FA79C">
                          <rect x="112" y="140" width="22" height="80" rx="3" />
                          <rect x="192" y="114" width="22" height="106" rx="3" />
                          <rect x="272" y="148" width="22" height="72" rx="3" />
                          <rect x="352" y="128" width="22" height="92" rx="3" />
                          <rect x="432" y="137" width="22" height="83" rx="3" />
                          <rect x="512" y="122" width="22" height="98" rx="3" />
                          <rect x="592" y="181" width="22" height="39" rx="3" />
                        </g>
                        <g
                          fontSize="12.5"
                          fill="#2C3B35"
                          fontFamily="Instrument Sans, system-ui, sans-serif"
                          textAnchor="middle"
                        >
                          <text x="111" y="242">
                            Fri
                          </text>
                          <text x="191" y="242">
                            Sat
                          </text>
                          <text x="271" y="242">
                            Sun
                          </text>
                          <text x="351" y="242">
                            Mon
                          </text>
                          <text x="431" y="242">
                            Tue
                          </text>
                          <text x="511" y="242">
                            Wed
                          </text>
                          <text x="591" y="242">
                            Thu
                          </text>
                        </g>
                      </svg>
                    </div>
                    <div style={{ flex: '1 1 300px', minWidth: '0', fontSize: '15px' }}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr repeat(2,64px)',
                          gap: '12px',
                          padding: '12px 0',
                          borderBottom: '1px solid #14231E',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#55645E',
                        }}
                      >
                        <span>Day</span>
                        <span style={{ textAlign: 'right' }}>In</span>
                        <span style={{ textAlign: 'right' }}>Out</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr repeat(2,64px)',
                          gap: '12px',
                          padding: '12px 0',
                          borderBottom: '1px solid #E7ECE9',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span>Fri 9 Oct</span>
                        <span style={{ textAlign: 'right' }}>120</span>
                        <span style={{ textAlign: 'right' }}>98</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr repeat(2,64px)',
                          gap: '12px',
                          padding: '12px 0',
                          borderBottom: '1px solid #E7ECE9',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span>Sat 10 Oct</span>
                        <span style={{ textAlign: 'right' }}>95</span>
                        <span style={{ textAlign: 'right' }}>130</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr repeat(2,64px)',
                          gap: '12px',
                          padding: '12px 0',
                          borderBottom: '1px solid #E7ECE9',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span>Sun 11 Oct</span>
                        <span style={{ textAlign: 'right' }}>210</span>
                        <span style={{ textAlign: 'right' }}>88</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr repeat(2,64px)',
                          gap: '12px',
                          padding: '12px 0',
                          borderBottom: '1px solid #E7ECE9',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span>Mon 12 Oct</span>
                        <span style={{ textAlign: 'right' }}>140</span>
                        <span style={{ textAlign: 'right' }}>112</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr repeat(2,64px)',
                          gap: '12px',
                          padding: '12px 0',
                          borderBottom: '1px solid #E7ECE9',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span>Tue 13 Oct</span>
                        <span style={{ textAlign: 'right' }}>75</span>
                        <span style={{ textAlign: 'right' }}>102</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr repeat(2,64px)',
                          gap: '12px',
                          padding: '12px 0',
                          borderBottom: '1px solid #E7ECE9',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span>Wed 14 Oct</span>
                        <span style={{ textAlign: 'right' }}>160</span>
                        <span style={{ textAlign: 'right' }}>120</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr repeat(2,64px)',
                          gap: '12px',
                          padding: '12px 0',
                          borderBottom: '1px solid #E7ECE9',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        <span>Thu 15 Oct, so far</span>
                        <span style={{ textAlign: 'right' }}>65</span>
                        <span style={{ textAlign: 'right' }}>48</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr repeat(2,64px)',
                          gap: '12px',
                          padding: '14px 0',
                          borderBottom: '2px solid #14231E',
                          fontVariantNumeric: 'tabular-nums',
                          fontWeight: '600',
                        }}
                      >
                        <span>Total</span>
                        <span style={{ textAlign: 'right' }}>865</span>
                        <span style={{ textAlign: 'right' }}>698</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ margin: '20px 0 0', fontSize: '13px', color: '#55645E' }}>
                    Sample figures for the prototype. Adjustments are listed separately.
                  </p>
                </>
              ) : null}
              {showInsp ? (
                <>
                  <div style={{ marginTop: '28px', maxWidth: '760px' }}>
                    <div
                      className="d"
                      style={{ fontSize: '22px', fontWeight: '600', letterSpacing: '-0.02em' }}
                    >
                      63 inspections in the last 7 days
                    </div>
                    <div
                      style={{
                        marginTop: '20px',
                        display: 'flex',
                        height: '22px',
                        borderRadius: '11px',
                        overflow: 'hidden',
                      }}
                      role="img"
                      aria-label="51 fresh, 8 spoiled, 4 low confidence"
                    >
                      <span style={{ width: '81%', background: '#2E8B5B' }}></span>
                      <span style={{ width: '13%', background: '#C2384D' }}></span>
                      <span style={{ width: '6%', background: '#D9981E' }}></span>
                    </div>
                    <div style={{ marginTop: '22px', fontSize: '15px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px 0',
                          borderTop: '1px solid #E7ECE9',
                        }}
                      >
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            background: '#2E8B5B',
                          }}
                        ></span>
                        <span style={{ flex: '1' }}>Fresh</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: '600' }}>51</span>
                        <span style={{ width: '52px', textAlign: 'right', color: '#55645E' }}>81%</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px 0',
                          borderTop: '1px solid #E7ECE9',
                        }}
                      >
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            background: '#C2384D',
                          }}
                        ></span>
                        <span style={{ flex: '1' }}>Spoiled</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: '600' }}>8</span>
                        <span style={{ width: '52px', textAlign: 'right', color: '#55645E' }}>13%</span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px 0',
                          borderTop: '1px solid #E7ECE9',
                          borderBottom: '1px solid #E7ECE9',
                        }}
                      >
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '3px',
                            background: '#D9981E',
                          }}
                        ></span>
                        <span style={{ flex: '1' }}>Low confidence, check by hand</span>
                        <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: '600' }}>4</span>
                        <span style={{ width: '52px', textAlign: 'right', color: '#55645E' }}>6%</span>
                      </div>
                    </div>
                    <p
                      style={{
                        margin: '18px 0 0',
                        fontSize: '14px',
                        lineHeight: '1.55',
                        color: '#55645E',
                        maxWidth: '620px',
                      }}
                    >
                      These are the classes the model predicted, not a measure of how accurate it is. Accuracy
                      is measured separately on photos the model has not seen. Sample figures for the
                      prototype.
                    </p>
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
