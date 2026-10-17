import { Fragment } from 'react';
import { DCLogic } from '../lib/DCLogic';
import Sidebar from '../components/Sidebar';
import './Settings.css';

export const path = '/settings';
export const title = 'Settings';

export default class Settings extends DCLogic {
  renderVals() {
    const t = (this.state && this.state.tab) || 'rules';
    const defs = [
      ['rules', 'Alert rules'],
      ['cats', 'Categories'],
      ['sup', 'Suppliers'],
      ['audit', 'Audit log'],
    ];
    return {
      showRules: t === 'rules',
      showCats: t === 'cats',
      showSup: t === 'sup',
      showAudit: t === 'audit',
      tabs: defs.map((d) => ({
        label: d[1],
        cls: d[0] === t ? 'tab on' : 'tab',
        pick: () => this.setState({ tab: d[0] }),
      })),
    };
  }

  template(v) {
    const { showAudit, showCats, showRules, showSup, tabs } = v;
    return (
      <div className="pg-settings">
        <div className="app-shell" style={{ minHeight: '1000px', display: 'flex', flexWrap: 'wrap', background: '#EEF1EF' }}>
          <div className="app-side" style={{ flex: '0 0 248px' }}>
            <Sidebar active="settings" />
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
                Settings
              </h1>
              <p style={{ margin: '8px 0 0', fontSize: '15.5px', color: '#55645E' }}>
                Rules and master data for the whole shop. Only administrators and managers can change these.
              </p>
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
              {showRules ? (
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
                        flex: '1 1 400px',
                        maxWidth: '480px',
                        minWidth: '0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '24px',
                      }}
                      action="Settings.dc.html"
                    >
                      <div>
                        <label className="lbl" htmlFor="s-days">
                          Warn before expiry, in days
                        </label>{' '}
                        <input id="s-days" className="field" type="number" placeholder="3" />
                        <p
                          style={{
                            margin: '8px 0 0',
                            fontSize: '13.5px',
                            lineHeight: '1.5',
                            color: '#55645E',
                          }}
                        >
                          The default for every product. A product can use its own number.
                        </p>
                      </div>
                      <div>
                        <label className="lbl" htmlFor="s-time">
                          Run the daily check at
                        </label>{' '}
                        <select id="s-time" className="field">
                          <option>08:00</option>
                          <option>06:00</option>
                          <option>12:00</option>
                        </select>
                        <p
                          style={{
                            margin: '8px 0 0',
                            fontSize: '13.5px',
                            lineHeight: '1.5',
                            color: '#55645E',
                          }}
                        >
                          Checks also run after every stock movement.
                        </p>
                      </div>
                      <div>
                        <label className="lbl" htmlFor="s-conf">
                          Low-confidence threshold for photo inspections
                        </label>{' '}
                        <input id="s-conf" className="field" type="text" placeholder="70%" />
                        <p
                          style={{
                            margin: '8px 0 0',
                            fontSize: '13.5px',
                            lineHeight: '1.5',
                            color: '#55645E',
                          }}
                        >
                          Results below this score are marked low confidence and ask for a manual check.
                        </p>
                      </div>
                      <div>
                        <button className="btn" type="button">
                          Save rules
                        </button>
                      </div>
                    </form>
                    <aside
                      style={{
                        flex: '1 1 300px',
                        maxWidth: '400px',
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
                        Active model
                      </h2>
                      <dl
                        style={{
                          margin: '14px 0 0',
                          display: 'grid',
                          gridTemplateColumns: 'auto 1fr',
                          fontSize: '14.5px',
                        }}
                      >
                        <dt
                          style={{
                            padding: '11px 16px 11px 0',
                            borderTop: '1px solid #DDE3DF',
                            color: '#55645E',
                          }}
                        >
                          Version
                        </dt>
                        <dd
                          style={{
                            margin: '0',
                            padding: '11px 0',
                            borderTop: '1px solid #DDE3DF',
                            textAlign: 'right',
                            fontWeight: '600',
                          }}
                        >
                          freshness-v1
                        </dd>
                        <dt
                          style={{
                            padding: '11px 16px 11px 0',
                            borderTop: '1px solid #DDE3DF',
                            color: '#55645E',
                          }}
                        >
                          Classes
                        </dt>
                        <dd
                          style={{
                            margin: '0',
                            padding: '11px 0',
                            borderTop: '1px solid #DDE3DF',
                            textAlign: 'right',
                            fontWeight: '600',
                          }}
                        >
                          Fresh, Spoiled
                        </dd>
                        <dt
                          style={{
                            padding: '11px 16px 11px 0',
                            borderTop: '1px solid #DDE3DF',
                            borderBottom: '1px solid #DDE3DF',
                            color: '#55645E',
                          }}
                        >
                          Photo limit
                        </dt>
                        <dd
                          style={{
                            margin: '0',
                            padding: '11px 0',
                            borderTop: '1px solid #DDE3DF',
                            borderBottom: '1px solid #DDE3DF',
                            textAlign: 'right',
                            fontWeight: '600',
                          }}
                        >
                          JPEG or PNG, 5 MB
                        </dd>
                      </dl>
                      <p
                        style={{
                          margin: '14px 0 0',
                          fontSize: '13.5px',
                          lineHeight: '1.5',
                          color: '#55645E',
                        }}
                      >
                        Older inspections keep the model version that produced them, even after a new model is
                        activated.
                      </p>
                    </aside>
                  </div>
                </>
              ) : null}
              {showCats ? (
                <>
                  <div
                    style={{
                      marginTop: '24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <span style={{ fontSize: '15px', color: '#55645E' }}>
                      A category with products can be deactivated, not deleted.
                    </span>
                    <button className="btn">Add category</button>
                  </div>
                  <div style={{ marginTop: '12px', maxWidth: '760px', fontSize: '15px' }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 110px 120px',
                        gap: '16px',
                        padding: '12px 0',
                        borderBottom: '1px solid #14231E',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#55645E',
                      }}
                    >
                      <span>Category</span>
                      <span style={{ textAlign: 'right' }}>Products</span>
                      <span></span>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 110px 120px',
                        gap: '16px',
                        alignItems: 'center',
                        padding: '14px 0',
                        borderBottom: '1px solid #E7ECE9',
                      }}
                    >
                      <span style={{ fontWeight: '600' }}>Vegetables</span>
                      <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>41</span>
                      <span style={{ textAlign: 'right' }}>
                        <button className="link">Edit</button>
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 110px 120px',
                        gap: '16px',
                        alignItems: 'center',
                        padding: '14px 0',
                        borderBottom: '1px solid #E7ECE9',
                      }}
                    >
                      <span style={{ fontWeight: '600' }}>Fruit</span>
                      <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>29</span>
                      <span style={{ textAlign: 'right' }}>
                        <button className="link">Edit</button>
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 110px 120px',
                        gap: '16px',
                        alignItems: 'center',
                        padding: '14px 0',
                        borderBottom: '1px solid #E7ECE9',
                      }}
                    >
                      <span style={{ fontWeight: '600' }}>Herbs</span>
                      <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>18</span>
                      <span style={{ textAlign: 'right' }}>
                        <button className="link">Edit</button>
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 110px 120px',
                        gap: '16px',
                        alignItems: 'center',
                        padding: '14px 0',
                        borderBottom: '1px solid #E7ECE9',
                      }}
                    >
                      <span style={{ fontWeight: '600' }}>Root crops</span>
                      <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>16</span>
                      <span style={{ textAlign: 'right' }}>
                        <button className="link">Edit</button>
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 110px 120px',
                        gap: '16px',
                        alignItems: 'center',
                        padding: '14px 0',
                        borderBottom: '1px solid #E7ECE9',
                      }}
                    >
                      <span style={{ fontWeight: '600' }}>Leafy greens</span>
                      <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>14</span>
                      <span style={{ textAlign: 'right' }}>
                        <button className="link">Edit</button>
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 110px 120px',
                        gap: '16px',
                        alignItems: 'center',
                        padding: '14px 0',
                        borderBottom: '1px solid #E7ECE9',
                      }}
                    >
                      <span style={{ fontWeight: '600' }}>Packaged</span>
                      <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>10</span>
                      <span style={{ textAlign: 'right' }}>
                        <button className="link">Edit</button>
                      </span>
                    </div>
                  </div>
                </>
              ) : null}
              {showSup ? (
                <>
                  <div
                    style={{
                      marginTop: '24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <span style={{ fontSize: '15px', color: '#55645E' }}>
                      Suppliers are linked to the batches they deliver.
                    </span>
                    <button className="btn">Add supplier</button>
                  </div>
                  <div style={{ marginTop: '12px', overflowX: 'auto' }}>
                    <div style={{ minWidth: '700px', fontSize: '15px' }}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(180px,1.4fr) minmax(140px,1fr) 140px 90px 70px',
                          gap: '16px',
                          padding: '12px 0',
                          borderBottom: '1px solid #14231E',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#55645E',
                        }}
                      >
                        <span>Supplier</span>
                        <span>Contact</span>
                        <span>Phone</span>
                        <span style={{ textAlign: 'right' }}>Batches</span>
                        <span></span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(180px,1.4fr) minmax(140px,1fr) 140px 90px 70px',
                          gap: '16px',
                          alignItems: 'center',
                          padding: '14px 0',
                          borderBottom: '1px solid #E7ECE9',
                        }}
                      >
                        <span style={{ fontWeight: '600' }}>Kebun Hijau Supply</span>
                        <span>Roslan Ahmad</span>
                        <span style={{ color: '#55645E' }}>012-555 0142</span>
                        <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>14</span>
                        <span style={{ textAlign: 'right' }}>
                          <button className="link">Edit</button>
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(180px,1.4fr) minmax(140px,1fr) 140px 90px 70px',
                          gap: '16px',
                          alignItems: 'center',
                          padding: '14px 0',
                          borderBottom: '1px solid #E7ECE9',
                        }}
                      >
                        <span style={{ fontWeight: '600' }}>Ladang Segar</span>
                        <span>Mei Ling Tan</span>
                        <span style={{ color: '#55645E' }}>013-555 0188</span>
                        <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>9</span>
                        <span style={{ textAlign: 'right' }}>
                          <button className="link">Edit</button>
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(180px,1.4fr) minmax(140px,1fr) 140px 90px 70px',
                          gap: '16px',
                          alignItems: 'center',
                          padding: '14px 0',
                          borderBottom: '1px solid #E7ECE9',
                        }}
                      >
                        <span style={{ fontWeight: '600' }}>Pasar Borong Melaka</span>
                        <span>Kamal Yusof</span>
                        <span style={{ color: '#55645E' }}>011-555 0127</span>
                        <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>21</span>
                        <span style={{ textAlign: 'right' }}>
                          <button className="link">Edit</button>
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
              {showAudit ? (
                <>
                  <p style={{ margin: '24px 0 0', fontSize: '15px', color: '#55645E' }}>
                    Only administrators can see this log.
                  </p>
                  <div style={{ marginTop: '12px', overflowX: 'auto' }}>
                    <div style={{ minWidth: '700px', fontSize: '14.5px' }}>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '150px 120px 1fr',
                          gap: '16px',
                          padding: '12px 0',
                          borderBottom: '1px solid #14231E',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#55645E',
                        }}
                      >
                        <span>When</span>
                        <span>Who</span>
                        <span>What happened</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '150px 120px 1fr',
                          gap: '16px',
                          padding: '14px 0',
                          borderBottom: '1px solid #E7ECE9',
                        }}
                      >
                        <span style={{ color: '#55645E' }}>Today, 09:05</span>
                        <span style={{ fontWeight: '600' }}>Aina</span>
                        <span>Recorded an adjustment of −2 kg on strawberries, batch S-044.</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '150px 120px 1fr',
                          gap: '16px',
                          padding: '14px 0',
                          borderBottom: '1px solid #E7ECE9',
                        }}
                      >
                        <span style={{ color: '#55645E' }}>Today, 07:58</span>
                        <span style={{ fontWeight: '600' }}>Aina</span>
                        <span>Logged in.</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '150px 120px 1fr',
                          gap: '16px',
                          padding: '14px 0',
                          borderBottom: '1px solid #E7ECE9',
                        }}
                      >
                        <span style={{ color: '#55645E' }}>Yesterday, 18:20</span>
                        <span style={{ fontWeight: '600' }}>Amir</span>
                        <span>Changed the default expiry warning from 2 days to 3 days.</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '150px 120px 1fr',
                          gap: '16px',
                          padding: '14px 0',
                          borderBottom: '1px solid #E7ECE9',
                        }}
                      >
                        <span style={{ color: '#55645E' }}>Yesterday, 16:02</span>
                        <span style={{ fontWeight: '600' }}>Aina</span>
                        <span>Approved adjustment R-029 for lettuce, batch L-014.</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '150px 120px 1fr',
                          gap: '16px',
                          padding: '14px 0',
                          borderBottom: '1px solid #E7ECE9',
                        }}
                      >
                        <span style={{ color: '#55645E' }}>2 Sep, 10:14</span>
                        <span style={{ fontWeight: '600' }}>Amir</span>
                        <span>Deactivated the user Hana Zulkifli.</span>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '150px 120px 1fr',
                          gap: '16px',
                          padding: '14px 0',
                          borderBottom: '1px solid #E7ECE9',
                        }}
                      >
                        <span style={{ color: '#55645E' }}>1 Sep, 09:30</span>
                        <span style={{ fontWeight: '600' }}>Amir</span>
                        <span>Activated model freshness-v1.</span>
                      </div>
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
