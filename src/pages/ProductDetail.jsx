import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { DCLogic } from '../lib/DCLogic';
import Sidebar from '../components/Sidebar';
import './ProductDetail.css';

export const path = '/products/detail';
export const title = 'Papayas';

export default class ProductDetail extends DCLogic {
  renderVals() {
    const t = (this.state && this.state.tab) || 'tx';
    const defs = [
      ['tx', 'Transactions'],
      ['insp', 'Inspections'],
    ];
    return {
      showTx: t === 'tx',
      showInsp: t === 'insp',
      tabs: defs.map((d) => ({
        label: d[1],
        cls: d[0] === t ? 'tab on' : 'tab',
        pick: () => this.setState({ tab: d[0] }),
      })),
    };
  }

  template(v) {
    const { showInsp, showTx, tabs } = v;
    return (
      <div className="pg-productdetail">
        <div className="app-shell" style={{ minHeight: '1000px', display: 'flex', flexWrap: 'wrap', background: '#EEF1EF' }}>
          <div className="app-side" style={{ flex: '0 0 248px' }}>
            <Sidebar active="products" />
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
                padding: '32px 40px 40px',
                minHeight: '968px',
                boxSizing: 'border-box',
              }}
            >
              <Link
                to="/products"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#55645E',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 5l-7 7 7 7" />
                </svg>
                Products
              </Link>
              <div
                style={{
                  marginTop: '16px',
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
                    style={{ margin: '0', fontSize: '36px', lineHeight: '1.1', fontWeight: '600' }}
                  >
                    Papayas
                  </h1>
                  <p style={{ margin: '8px 0 0', fontSize: '15.5px', color: '#55645E' }}>
                    PAP-001 in Vegetables. Sold by the kilogram.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Link className="btn ghost" to="/inspect">
                    Inspect a batch
                  </Link>{' '}
                  <Link className="btn ghost" to="/stock">
                    Issue stock
                  </Link>{' '}
                  <Link className="btn" to="/stock">
                    Receive stock
                  </Link>
                </div>
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
                <section style={{ flex: '1.7 1 540px', minWidth: '0' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', flexWrap: 'wrap' }}>
                    <div
                      className="d"
                      style={{
                        fontSize: '52px',
                        lineHeight: '1',
                        fontWeight: '600',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      46 kg
                    </div>
                    <div style={{ fontSize: '15px', color: '#55645E' }}>on hand across 3 batches</div>
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
                  </div>
                  <div style={{ marginTop: '24px', overflowX: 'auto' }}>
                    <div style={{ minWidth: '560px' }}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '130px 1fr 150px 90px',
                          gap: '16px',
                          padding: '10px 0',
                          borderBottom: '1px solid #14231E',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#55645E',
                        }}
                      >
                        <span>Batch</span>
                        <span>Supplier</span>
                        <span>Days until expiry</span>
                        <span style={{ textAlign: 'right' }}>Remaining</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '130px 1fr 150px 90px',
                          gap: '16px',
                          alignItems: 'center',
                          padding: '16px 0',
                          borderBottom: '1px solid #E7ECE9',
                          fontSize: '14.5px',
                        }}
                      >
                        <span>
                          <span style={{ display: 'block', fontWeight: '600' }}>P-118</span>
                          <span
                            style={{
                              display: 'inline-block',
                              marginTop: '4px',
                              padding: '1px 8px',
                              borderRadius: '6px',
                              background: '#14231E',
                              color: '#fff',
                              fontSize: '11.5px',
                              fontWeight: '600',
                            }}
                          >
                            Issued first
                          </span>
                        </span>{' '}
                        <span>
                          <span style={{ display: 'block' }}>Kebun Hijau Supply</span>
                          <span style={{ display: 'block', fontSize: '13px', color: '#55645E' }}>
                            Received 12 Oct, 30 kg
                          </span>
                        </span>{' '}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{ flex: '1', height: '8px', borderRadius: '4px', background: '#E7ECE9' }}
                          >
                            <span
                              style={{
                                display: 'block',
                                width: '21%',
                                height: '8px',
                                borderRadius: '4px',
                                background: '#D9981E',
                              }}
                            ></span>
                          </span>
                          <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#7A5200' }}>
                            3 days
                          </span>
                        </span>{' '}
                        <span
                          style={{
                            textAlign: 'right',
                            fontVariantNumeric: 'tabular-nums',
                            fontWeight: '600',
                          }}
                        >
                          18 kg
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '130px 1fr 150px 90px',
                          gap: '16px',
                          alignItems: 'center',
                          padding: '16px 0',
                          borderBottom: '1px solid #E7ECE9',
                          fontSize: '14.5px',
                        }}
                      >
                        <span style={{ fontWeight: '600' }}>P-121</span>{' '}
                        <span>
                          <span style={{ display: 'block' }}>Ladang Segar</span>
                          <span style={{ display: 'block', fontSize: '13px', color: '#55645E' }}>
                            Received 11 Oct, 20 kg
                          </span>
                        </span>{' '}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{ flex: '1', height: '8px', borderRadius: '4px', background: '#E7ECE9' }}
                          >
                            <span
                              style={{
                                display: 'block',
                                width: '43%',
                                height: '8px',
                                borderRadius: '4px',
                                background: '#2E8B5B',
                              }}
                            ></span>
                          </span>
                          <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#17603D' }}>
                            6 days
                          </span>
                        </span>{' '}
                        <span
                          style={{
                            textAlign: 'right',
                            fontVariantNumeric: 'tabular-nums',
                            fontWeight: '600',
                          }}
                        >
                          20 kg
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '130px 1fr 150px 90px',
                          gap: '16px',
                          alignItems: 'center',
                          padding: '16px 0',
                          borderBottom: '1px solid #E7ECE9',
                          fontSize: '14.5px',
                        }}
                      >
                        <span style={{ fontWeight: '600' }}>P-125</span>{' '}
                        <span>
                          <span style={{ display: 'block' }}>Kebun Hijau Supply</span>
                          <span style={{ display: 'block', fontSize: '13px', color: '#55645E' }}>
                            Received 14 Oct, 8 kg
                          </span>
                        </span>{' '}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{ flex: '1', height: '8px', borderRadius: '4px', background: '#E7ECE9' }}
                          >
                            <span
                              style={{
                                display: 'block',
                                width: '64%',
                                height: '8px',
                                borderRadius: '4px',
                                background: '#2E8B5B',
                              }}
                            ></span>
                          </span>
                          <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#17603D' }}>
                            9 days
                          </span>
                        </span>{' '}
                        <span
                          style={{
                            textAlign: 'right',
                            fontVariantNumeric: 'tabular-nums',
                            fontWeight: '600',
                          }}
                        >
                          8 kg
                        </span>
                      </div>
                    </div>
                  </div>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <h2
                      className="d"
                      style={{ margin: '0', fontSize: '19px', fontWeight: '600', letterSpacing: '-0.02em' }}
                    >
                      Product details
                    </h2>
                    <Link
                      to="/products"
                      style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        textDecoration: 'underline',
                        textUnderlineOffset: '4px',
                      }}
                    >
                      Edit
                    </Link>
                  </div>
                  <dl
                    style={{
                      margin: '16px 0 0',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '0',
                      fontSize: '14.5px',
                    }}
                  >
                    <dt style={{ padding: '12px 0', borderTop: '1px solid #DDE3DF', color: '#55645E' }}>
                      Category
                    </dt>
                    <dd
                      style={{
                        margin: '0',
                        padding: '12px 0',
                        borderTop: '1px solid #DDE3DF',
                        fontWeight: '600',
                        textAlign: 'right',
                      }}
                    >
                      Vegetables
                    </dd>
                    <dt style={{ padding: '12px 0', borderTop: '1px solid #DDE3DF', color: '#55645E' }}>
                      Unit
                    </dt>
                    <dd
                      style={{
                        margin: '0',
                        padding: '12px 0',
                        borderTop: '1px solid #DDE3DF',
                        fontWeight: '600',
                        textAlign: 'right',
                      }}
                    >
                      kg
                    </dd>
                    <dt style={{ padding: '12px 0', borderTop: '1px solid #DDE3DF', color: '#55645E' }}>
                      Reorder level
                    </dt>
                    <dd
                      style={{
                        margin: '0',
                        padding: '12px 0',
                        borderTop: '1px solid #DDE3DF',
                        fontWeight: '600',
                        textAlign: 'right',
                      }}
                    >
                      10 kg
                    </dd>
                    <dt style={{ padding: '12px 0', borderTop: '1px solid #DDE3DF', color: '#55645E' }}>
                      Warn before expiry
                    </dt>
                    <dd
                      style={{
                        margin: '0',
                        padding: '12px 0',
                        borderTop: '1px solid #DDE3DF',
                        fontWeight: '600',
                        textAlign: 'right',
                      }}
                    >
                      3 days
                    </dd>
                    <dt style={{ padding: '12px 0', borderTop: '1px solid #DDE3DF', color: '#55645E' }}>
                      Perishable
                    </dt>
                    <dd
                      style={{
                        margin: '0',
                        padding: '12px 0',
                        borderTop: '1px solid #DDE3DF',
                        fontWeight: '600',
                        textAlign: 'right',
                      }}
                    >
                      Yes
                    </dd>
                    <dt style={{ padding: '12px 0', borderTop: '1px solid #DDE3DF', color: '#55645E' }}>
                      Photo inspection
                    </dt>
                    <dd
                      style={{
                        margin: '0',
                        padding: '12px 0',
                        borderTop: '1px solid #DDE3DF',
                        fontWeight: '600',
                        textAlign: 'right',
                        color: '#1F36A8',
                      }}
                    >
                      Supported
                    </dd>
                  </dl>
                </aside>
              </div>
              <section style={{ marginTop: '36px' }}>
                <div
                  style={{ borderBottom: '1px solid #E1E7E3', display: 'flex', flexWrap: 'wrap' }}
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
                {showTx ? (
                  <>
                    <div style={{ overflowX: 'auto' }}>
                      <div style={{ minWidth: '560px', fontSize: '14.5px' }}>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '150px 120px 100px 1fr 90px',
                            gap: '16px',
                            padding: '12px 0',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#55645E',
                          }}
                        >
                          <span>When</span>
                          <span>Movement</span>
                          <span>Batch</span>
                          <span>By</span>
                          <span style={{ textAlign: 'right' }}>Quantity</span>
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '150px 120px 100px 1fr 90px',
                            gap: '16px',
                            padding: '13px 0',
                            borderTop: '1px solid #E7ECE9',
                          }}
                        >
                          <span style={{ color: '#55645E' }}>14 Oct, 17:20</span>
                          <span>Stock-out</span>
                          <span>P-118</span>
                          <span>Aina</span>
                          <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            −6 kg
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '150px 120px 100px 1fr 90px',
                            gap: '16px',
                            padding: '13px 0',
                            borderTop: '1px solid #E7ECE9',
                          }}
                        >
                          <span style={{ color: '#55645E' }}>14 Oct, 07:55</span>
                          <span>Stock-in</span>
                          <span>P-125</span>
                          <span>Amin</span>
                          <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            +8 kg
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '150px 120px 100px 1fr 90px',
                            gap: '16px',
                            padding: '13px 0',
                            borderTop: '1px solid #E7ECE9',
                          }}
                        >
                          <span style={{ color: '#55645E' }}>13 Oct, 09:10</span>
                          <span>Stock-out</span>
                          <span>P-118</span>
                          <span>Tanusha</span>
                          <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            −6 kg
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '150px 120px 100px 1fr 90px',
                            gap: '16px',
                            padding: '13px 0',
                            borderTop: '1px solid #E7ECE9',
                          }}
                        >
                          <span style={{ color: '#55645E' }}>12 Oct, 08:05</span>
                          <span>Stock-in</span>
                          <span>P-118</span>
                          <span>Amin</span>
                          <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            +30 kg
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '150px 120px 100px 1fr 90px',
                            gap: '16px',
                            padding: '13px 0',
                            borderTop: '1px solid #E7ECE9',
                            borderBottom: '1px solid #E7ECE9',
                          }}
                        >
                          <span style={{ color: '#55645E' }}>11 Oct, 08:30</span>
                          <span>Stock-in</span>
                          <span>P-121</span>
                          <span>Aina</span>
                          <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            +20 kg
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
                {showInsp ? (
                  <>
                    <div style={{ overflowX: 'auto' }}>
                      <div style={{ minWidth: '560px', fontSize: '14.5px' }}>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '150px 100px 1fr 1fr',
                            gap: '16px',
                            padding: '12px 0',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#55645E',
                          }}
                        >
                          <span>When</span>
                          <span>Batch</span>
                          <span>Result</span>
                          <span>By</span>
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '150px 100px 1fr 1fr',
                            gap: '16px',
                            padding: '13px 0',
                            borderTop: '1px solid #E7ECE9',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ color: '#55645E' }}>15 Oct, 10:30</span>
                          <span>P-118</span>
                          <span>
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
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: '#2E8B5B',
                                }}
                              ></span>
                              Fresh 94%
                            </span>
                          </span>
                          <span>Amin</span>
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '150px 100px 1fr 1fr',
                            gap: '16px',
                            padding: '13px 0',
                            borderTop: '1px solid #E7ECE9',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ color: '#55645E' }}>13 Oct, 09:15</span>
                          <span>P-118</span>
                          <span>
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
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: '#2E8B5B',
                                }}
                              ></span>
                              Fresh 97%
                            </span>
                          </span>
                          <span>Aina</span>
                        </div>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '150px 100px 1fr 1fr',
                            gap: '16px',
                            padding: '13px 0',
                            borderTop: '1px solid #E7ECE9',
                            borderBottom: '1px solid #E7ECE9',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ color: '#55645E' }}>12 Oct, 08:20</span>
                          <span>P-118</span>
                          <span>
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
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: '#2E8B5B',
                                }}
                              ></span>
                              Fresh 96%
                            </span>
                          </span>
                          <span>Amin</span>
                        </div>
                      </div>
                      <p style={{ margin: '14px 0 0', fontSize: '13px', color: '#55645E' }}>
                        Visual estimates only. A person decides what happens to the stock.
                      </p>
                    </div>
                  </>
                ) : null}
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
