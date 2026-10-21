import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { DCLogic } from '../lib/DCLogic';
import './Home.css';

export const path = '/';
export const title = 'SmartStock home';

export default class Home extends DCLogic {
  renderVals() {
    const s = (this.state && this.state.sample) || 0;
    const samples = [
      {
        label: 'Fresh',
        product: 'Bananas',
        batch: 'Batch N-079, received 12 Oct',
        kind: 'fresh',
        conf: 94,
        note: 'No visible spoilage found.',
      },
      {
        label: 'Spoiled',
        product: 'Bananas',
        batch: 'Batch N-079, received 12 Oct',
        kind: 'spoiled',
        conf: 88,
        note: 'Dark brown patches found. Check by hand, then decide what to do with the stock.',
      },
      {
        label: 'Needs review',
        product: 'Bananas',
        batch: 'Batch N-079, received 12 Oct',
        kind: 'low',
        conf: 61,
        note: 'The photo is blurry. Retake it in daylight before relying on this result.',
      },
    ];
    const cur = samples[s];
    return {
      showTomato: s === 0,
      showSpoil: s === 1,
      showCuke: s === 2,
      demo: {
        product: cur.product,
        batch: cur.batch,
        conf: cur.conf,
        confWidth: cur.conf + '%',
        note: cur.note,
        isFresh: cur.kind === 'fresh',
        isSpoiled: cur.kind === 'spoiled',
        isLow: cur.kind === 'low',
      },
      tabs: samples.map((x, i) => ({
        label: x.label,
        cls: i === s ? 'tab on' : 'tab',
        pick: () => this.setState({ sample: i }),
      })),
    };
  }

  template(v) {
    const { demo, showCuke, showSpoil, showTomato, tabs } = v;
    return (
      <div className="pg-home">
        <div style={{ minHeight: '3800px' }}>
          <header
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 40px',
              boxSizing: 'border-box',
              height: '84px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <Link
              to="/"
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              aria-label="SmartStock home"
            >
              <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
                <path
                  d="M4 2h18a2 2 0 0 1 2 2v12.2a2 2 0 0 1-.7 1.5l-9.3 7.6a2 2 0 0 1-2.6 0L2.7 17.7A2 2 0 0 1 2 16.2V4a2 2 0 0 1 2-2z"
                  fill="#14231E"
                />
                <circle cx="13" cy="8.5" r="2.6" fill="#EEF1EF" />
              </svg>{' '}
              <span className="d" style={{ fontSize: '21px', fontWeight: '700' }}>
                SmartStock
              </span>
            </Link>
            <nav
              style={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}
              aria-label="Main"
            >
              <a href="#how" style={{ fontSize: '15px', fontWeight: '500' }}>
                How it works
              </a>{' '}
              <a href="#inspection" style={{ fontSize: '15px', fontWeight: '500' }}>
                Inspection
              </a>{' '}
              <a href="#more" style={{ fontSize: '15px', fontWeight: '500' }}>
                Reports and roles
              </a>{' '}
              <Link to="/login" style={{ fontSize: '15px', fontWeight: '500' }}>
                Log in
              </Link>{' '}
              <Link
                className="btn"
                to="/login"
                style={{ height: '42px', padding: '0 20px', fontSize: '15px' }}
              >
                Open the app
              </Link>
            </nav>
          </header>
          <section
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '56px 40px 120px',
              boxSizing: 'border-box',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '64px',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: '1 1 440px', minWidth: '0' }}>
              <h1
                className="d"
                style={{
                  margin: '0',
                  fontSize: 'clamp(46px,6.2vw,80px)',
                  lineHeight: '1',
                  fontWeight: '600',
                  textWrap: 'balance',
                }}
              >
                Know what is on your shelves, and how fresh it is.
              </h1>
              <p
                style={{
                  margin: '28px 0 0',
                  fontSize: '19px',
                  lineHeight: '1.55',
                  color: '#55645E',
                  maxWidth: '460px',
                }}
              >
                SmartStock keeps a record of every batch, warns you before stock expires, and checks produce
                from a photo. Made for small fruit kiosks and stalls.
              </p>
              <div
                style={{
                  marginTop: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '28px',
                  flexWrap: 'wrap',
                }}
              >
                <Link className="btn" to="/login">
                  Open the app
                </Link>{' '}
                <a
                  href="#inspection"
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    textDecoration: 'underline',
                    textUnderlineOffset: '5px',
                  }}
                >
                  See how inspection works
                </a>
              </div>
              <p
                style={{
                  margin: '44px 0 0',
                  fontSize: '14px',
                  color: '#55645E',
                  maxWidth: '400px',
                  lineHeight: '1.5',
                }}
              >
                One web app for the counter computer and for a phone browser by the shelf. Both use the same
                stock records.
              </p>
            </div>
            <div style={{ flex: '1 1 480px', minWidth: '0' }}>
              <div style={{ position: 'relative', maxWidth: '560px', margin: '0 auto 36px' }}>
                {showTomato ? (
<>
<svg viewBox="0 0 560 520" style={{ display: 'block', width: '100%', height: 'auto' }} role="img" aria-label="A bunch of three fresh yellow bananas"><rect width="560" height="520" rx="28" fill="#DCE5E0"/><path d="M0 130H560M0 260H560M0 390H560" stroke="#CFDAD4" strokeWidth="2"/><g transform="translate(280 230) rotate(-6) scale(1)"><path d="M-170 -10 C -110 150, 120 170, 190 -60 C 130 40, -70 70, -170 -10 Z" fill="#F2C230"/><path d="M-150 0 C -90 120, 100 135, 170 -40" stroke="#C99A12" strokeWidth="5" fill="none" opacity=".45"/><rect x="-186" y="-24" width="22" height="26" rx="6" transform="rotate(-18 -175 -10)" fill="#5A4426"/><circle cx="188" cy="-62" r="8" fill="#3B2C18"/></g><g transform="translate(290 330) rotate(4) scale(0.92)"><path d="M-170 -10 C -110 150, 120 170, 190 -60 C 130 40, -70 70, -170 -10 Z" fill="#F2C230"/><path d="M-150 0 C -90 120, 100 135, 170 -40" stroke="#C99A12" strokeWidth="5" fill="none" opacity=".45"/><rect x="-186" y="-24" width="22" height="26" rx="6" transform="rotate(-18 -175 -10)" fill="#5A4426"/><circle cx="188" cy="-62" r="8" fill="#3B2C18"/></g><g transform="translate(270 130) rotate(-14) scale(0.85)"><path d="M-170 -10 C -110 150, 120 170, 190 -60 C 130 40, -70 70, -170 -10 Z" fill="#F2C230"/><path d="M-150 0 C -90 120, 100 135, 170 -40" stroke="#C99A12" strokeWidth="5" fill="none" opacity=".45"/><rect x="-186" y="-24" width="22" height="26" rx="6" transform="rotate(-18 -175 -10)" fill="#5A4426"/><circle cx="188" cy="-62" r="8" fill="#3B2C18"/></g></svg>
</>
) : null}
                {showSpoil ? (
<>
<svg viewBox="0 0 560 520" style={{ display: 'block', width: '100%', height: 'auto' }} role="img" aria-label="A bunch of three bananas with dark brown spoiled patches"><rect width="560" height="520" rx="28" fill="#DCE5E0"/><path d="M0 130H560M0 260H560M0 390H560" stroke="#CFDAD4" strokeWidth="2"/><g transform="translate(280 230) rotate(-6) scale(1)"><path d="M-170 -10 C -110 150, 120 170, 190 -60 C 130 40, -70 70, -170 -10 Z" fill="#8C6A2A"/><path d="M-150 0 C -90 120, 100 135, 170 -40" stroke="#4B3416" strokeWidth="5" fill="none" opacity=".45"/><rect x="-186" y="-24" width="22" height="26" rx="6" transform="rotate(-18 -175 -10)" fill="#5A4426"/><circle cx="188" cy="-62" r="8" fill="#3B2C18"/><circle cx="-20" cy="60" r="10" fill="#3B2C18" opacity=".85"/><circle cx="60" cy="85" r="14" fill="#3B2C18" opacity=".85"/><circle cx="120" cy="30" r="9" fill="#3B2C18" opacity=".85"/><circle cx="10" cy="95" r="8" fill="#3B2C18" opacity=".85"/></g><g transform="translate(290 330) rotate(4) scale(0.92)"><path d="M-170 -10 C -110 150, 120 170, 190 -60 C 130 40, -70 70, -170 -10 Z" fill="#8C6A2A"/><path d="M-150 0 C -90 120, 100 135, 170 -40" stroke="#4B3416" strokeWidth="5" fill="none" opacity=".45"/><rect x="-186" y="-24" width="22" height="26" rx="6" transform="rotate(-18 -175 -10)" fill="#5A4426"/><circle cx="188" cy="-62" r="8" fill="#3B2C18"/><circle cx="-20" cy="60" r="10" fill="#3B2C18" opacity=".85"/><circle cx="60" cy="85" r="14" fill="#3B2C18" opacity=".85"/><circle cx="120" cy="30" r="9" fill="#3B2C18" opacity=".85"/><circle cx="10" cy="95" r="8" fill="#3B2C18" opacity=".85"/></g><g transform="translate(270 130) rotate(-14) scale(0.85)"><path d="M-170 -10 C -110 150, 120 170, 190 -60 C 130 40, -70 70, -170 -10 Z" fill="#8C6A2A"/><path d="M-150 0 C -90 120, 100 135, 170 -40" stroke="#4B3416" strokeWidth="5" fill="none" opacity=".45"/><rect x="-186" y="-24" width="22" height="26" rx="6" transform="rotate(-18 -175 -10)" fill="#5A4426"/><circle cx="188" cy="-62" r="8" fill="#3B2C18"/><circle cx="-20" cy="60" r="10" fill="#3B2C18" opacity=".85"/><circle cx="60" cy="85" r="14" fill="#3B2C18" opacity=".85"/><circle cx="120" cy="30" r="9" fill="#3B2C18" opacity=".85"/><circle cx="10" cy="95" r="8" fill="#3B2C18" opacity=".85"/></g></svg>
</>
) : null}
                {showCuke ? (
<>
<svg viewBox="0 0 560 520" style={{ display: 'block', width: '100%', height: 'auto' }} role="img" aria-label="A blurry, overexposed photo of three bananas"><defs><filter id="sb" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.6"/></filter></defs><rect width="560" height="520" rx="28" fill="#DCE5E0"/><path d="M0 130H560M0 260H560M0 390H560" stroke="#CFDAD4" strokeWidth="2"/><g filter="url(#sb)"><g transform="translate(280 230) rotate(-6) scale(1)"><path d="M-170 -10 C -110 150, 120 170, 190 -60 C 130 40, -70 70, -170 -10 Z" fill="#E8C84A"/><path d="M-150 0 C -90 120, 100 135, 170 -40" stroke="#B9972A" strokeWidth="5" fill="none" opacity=".45"/><rect x="-186" y="-24" width="22" height="26" rx="6" transform="rotate(-18 -175 -10)" fill="#5A4426"/><circle cx="188" cy="-62" r="8" fill="#3B2C18"/></g><g transform="translate(290 330) rotate(4) scale(0.92)"><path d="M-170 -10 C -110 150, 120 170, 190 -60 C 130 40, -70 70, -170 -10 Z" fill="#E8C84A"/><path d="M-150 0 C -90 120, 100 135, 170 -40" stroke="#B9972A" strokeWidth="5" fill="none" opacity=".45"/><rect x="-186" y="-24" width="22" height="26" rx="6" transform="rotate(-18 -175 -10)" fill="#5A4426"/><circle cx="188" cy="-62" r="8" fill="#3B2C18"/></g><g transform="translate(270 130) rotate(-14) scale(0.85)"><path d="M-170 -10 C -110 150, 120 170, 190 -60 C 130 40, -70 70, -170 -10 Z" fill="#E8C84A"/><path d="M-150 0 C -90 120, 100 135, 170 -40" stroke="#B9972A" strokeWidth="5" fill="none" opacity=".45"/><rect x="-186" y="-24" width="22" height="26" rx="6" transform="rotate(-18 -175 -10)" fill="#5A4426"/><circle cx="188" cy="-62" r="8" fill="#3B2C18"/></g></g><ellipse cx="200" cy="200" rx="90" ry="40" transform="rotate(-20 200 200)" fill="#fff" opacity=".28"/></svg>
</>
) : null}
                <svg
                  viewBox="0 0 560 520"
                  style={{
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                  aria-hidden="true"
                >
                  <g
                    fill="none"
                    stroke="#2D4BE0"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M110 196V160H146" />
                    <path d="M314 160H350V196" />
                    <path d="M110 364V400H146" />
                    <path d="M314 400H350V364" />
                  </g>
                  <rect x="110" y="122" width="112" height="26" rx="13" fill="#2D4BE0" />
                  <text
                    x="166"
                    y="139.5"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="12.5"
                    fontWeight="600"
                    fontFamily="Instrument Sans, system-ui, sans-serif"
                  >
                    Checking item
                  </text>
                  <rect className="scan" x="110" y="160" width="240" height="3" rx="1.5" fill="#2D4BE0" />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    right: '-18px',
                    bottom: '-30px',
                    width: '292px',
                    maxWidth: '86%',
                    boxSizing: 'border-box',
                    background: '#fff',
                    borderRadius: '18px',
                    padding: '26px 22px 18px',
                    boxShadow: '0 1px 0 #DDE3DF,0 22px 44px -20px rgba(20,35,30,.4)',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '50%',
                      marginLeft: '-5px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#EEF1EF',
                      boxShadow: 'inset 0 0 0 1px #D3DBD7',
                    }}
                  ></span>
                  <div
                    className="d"
                    style={{ fontSize: '18px', fontWeight: '600', letterSpacing: '-0.02em' }}
                  >
                    {demo.product}
                  </div>
                  <div style={{ marginTop: '2px', fontSize: '13.5px', color: '#55645E' }}>{demo.batch}</div>
                  <div
                    style={{
                      marginTop: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {demo.isFresh ? (
                      <>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            padding: '5px 13px',
                            borderRadius: '999px',
                            background: '#E1F1E7',
                            color: '#17603D',
                            fontSize: '15px',
                            fontWeight: '600',
                          }}
                        >
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: '#2E8B5B',
                            }}
                          ></span>
                          Fresh
                        </span>
                      </>
                    ) : null}
                    {demo.isSpoiled ? (
                      <>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            padding: '5px 13px',
                            borderRadius: '999px',
                            background: '#F8DDE0',
                            color: '#8E2434',
                            fontSize: '15px',
                            fontWeight: '600',
                          }}
                        >
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: '#C2384D',
                            }}
                          ></span>
                          Spoiled
                        </span>
                      </>
                    ) : null}
                    {demo.isLow ? (
                      <>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '7px',
                            padding: '5px 13px',
                            borderRadius: '999px',
                            background: '#FBEFD0',
                            color: '#7A5200',
                            fontSize: '15px',
                            fontWeight: '600',
                          }}
                        >
                          <span
                            style={{
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              background: '#D9981E',
                            }}
                          ></span>
                          Requires review
                        </span>
                      </>
                    ) : null}
                    <span style={{ fontSize: '15px', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>
                      {demo.conf}%
                    </span>
                  </div>
                  <div
                    style={{ marginTop: '12px', height: '6px', borderRadius: '3px', background: '#E7ECE9' }}
                  >
                    <div
                      style={{
                        height: '6px',
                        borderRadius: '3px',
                        background: '#14231E',
                        width: demo.confWidth,
                      }}
                    ></div>
                  </div>
                  <p style={{ margin: '14px 0 0', fontSize: '14px', lineHeight: '1.45', color: '#2C3B35' }}>
                    {demo.note}
                  </p>
                  <p
                    style={{
                      margin: '14px 0 0',
                      paddingTop: '12px',
                      borderTop: '1px solid #E7ECE9',
                      fontSize: '12.5px',
                      lineHeight: '1.45',
                      color: '#55645E',
                    }}
                  >
                    Visual estimate only. A person decides what happens to the stock.
                  </p>
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                  maxWidth: '560px',
                  margin: '0 auto',
                }}
              >
                <span style={{ fontSize: '14px', color: '#55645E', marginRight: '4px' }}>
                  Try a sample photo
                </span>
                {tabs.map((t, _i) => (
                  <Fragment key={_i}>
                    <button className={t.cls} onClick={t.pick}>
                      {t.label}
                    </button>
                  </Fragment>
                ))}
              </div>
              <p style={{ maxWidth: '560px', margin: '14px auto 0', fontSize: '12.5px', color: '#55645E' }}>
                Sample photos are illustrations and the results are examples.
              </p>
            </div>
          </section>
          <section
            id="how"
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '96px 40px',
              boxSizing: 'border-box',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '72px',
              alignItems: 'center',
              borderTop: '1px solid #D3DBD7',
            }}
          >
            <div style={{ flex: '1 1 360px', minWidth: '0', maxWidth: '440px' }}>
              <h2
                className="d"
                style={{
                  margin: '0',
                  fontSize: 'clamp(34px,4vw,48px)',
                  lineHeight: '1.04',
                  fontWeight: '600',
                }}
              >
                Every batch, in order of expiry.
              </h2>
              <p style={{ margin: '24px 0 0', fontSize: '18px', lineHeight: '1.6', color: '#55645E' }}>
                Record stock-in with the batch number and expiry date. When you issue stock, SmartStock takes
                from the batch that expires first, so nothing gets left behind at the back.
              </p>
              <p style={{ margin: '16px 0 0', fontSize: '18px', lineHeight: '1.6', color: '#55645E' }}>
                Every movement is saved as a transaction. A mistake is fixed with an adjustment, never by
                editing history.
              </p>
            </div>
            <div style={{ flex: '1.3 1 520px', minWidth: '0' }}>
              <div style={{ background: '#fff', borderRadius: '22px', padding: '28px 32px 26px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <div
                    className="d"
                    style={{ fontSize: '22px', fontWeight: '600', letterSpacing: '-0.02em' }}
                  >
                    Papayas
                  </div>
                  <div style={{ fontSize: '14px', color: '#55645E' }}>46 kg on hand across 3 batches</div>
                </div>
                <div
                  style={{
                    marginTop: '22px',
                    display: 'grid',
                    gridTemplateColumns: '64px 64px 1fr 108px',
                    gap: '8px 18px',
                    alignItems: 'center',
                    fontSize: '15px',
                  }}
                >
                  <span style={{ fontWeight: '600' }}>P-118</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>18 kg</span>
                  <div style={{ height: '10px', borderRadius: '5px', background: '#E7ECE9' }}>
                    <div
                      style={{ width: '30%', height: '10px', borderRadius: '5px', background: '#D9981E' }}
                    ></div>
                  </div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontWeight: '600',
                      color: '#7A5200',
                    }}
                  >
                    3 days
                  </span>{' '}
                  <span style={{ fontWeight: '600' }}>P-121</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>20 kg</span>
                  <div style={{ height: '10px', borderRadius: '5px', background: '#E7ECE9' }}>
                    <div
                      style={{ width: '60%', height: '10px', borderRadius: '5px', background: '#2E8B5B' }}
                    ></div>
                  </div>
                  <span style={{ fontWeight: '600', color: '#17603D' }}>6 days</span>{' '}
                  <span style={{ fontWeight: '600' }}>P-125</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>8 kg</span>
                  <div style={{ height: '10px', borderRadius: '5px', background: '#E7ECE9' }}>
                    <div
                      style={{ width: '90%', height: '10px', borderRadius: '5px', background: '#2E8B5B' }}
                    ></div>
                  </div>
                  <span style={{ fontWeight: '600', color: '#17603D' }}>9 days</span>
                </div>
                <div
                  style={{
                    marginTop: '24px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: '#EEF1EF',
                    fontSize: '14.5px',
                    lineHeight: '1.5',
                    color: '#2C3B35',
                  }}
                >
                  Issue 25 kg and SmartStock proposes 18 kg from P-118, then 7 kg from P-121. You can pick
                  another batch.
                </div>
              </div>
            </div>
          </section>
          <section
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '96px 40px',
              boxSizing: 'border-box',
              display: 'flex',
              flexWrap: 'wrap-reverse',
              gap: '72px',
              alignItems: 'center',
              borderTop: '1px solid #D3DBD7',
            }}
          >
            <div style={{ flex: '1.3 1 520px', minWidth: '0' }}>
              <div style={{ background: '#fff', borderRadius: '22px', padding: '12px 32px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    padding: '20px 0',
                    borderBottom: '1px solid #E7ECE9',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      flex: '0 0 104px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '4px 11px',
                      borderRadius: '999px',
                      background: '#FBEFD0',
                      color: '#7A5200',
                      fontSize: '13px',
                      fontWeight: '600',
                      width: 'fit-content',
                    }}
                  >
                    <span
                      style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D9981E' }}
                    ></span>
                    Low stock
                  </span>
                  <div style={{ flex: '1 1 220px', minWidth: '0' }}>
                    <div style={{ fontSize: '15.5px', fontWeight: '600' }}>Oranges</div>
                    <div style={{ fontSize: '14px', color: '#55645E' }}>
                      6 kg left. Reorder level is 10 kg.
                    </div>
                  </div>
                  <span style={{ fontSize: '13px', color: '#55645E' }}>Today 08:00</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    padding: '20px 0',
                    borderBottom: '1px solid #E7ECE9',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      flex: '0 0 104px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '4px 11px',
                      borderRadius: '999px',
                      background: '#FBEFD0',
                      color: '#7A5200',
                      fontSize: '13px',
                      fontWeight: '600',
                      width: 'fit-content',
                    }}
                  >
                    <span
                      style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D9981E' }}
                    ></span>
                    Near expiry
                  </span>
                  <div style={{ flex: '1 1 220px', minWidth: '0' }}>
                    <div style={{ fontSize: '15.5px', fontWeight: '600' }}>Papayas, batch P-118</div>
                    <div style={{ fontSize: '14px', color: '#55645E' }}>18 kg expires in 3 days.</div>
                  </div>
                  <span style={{ fontSize: '13px', color: '#55645E' }}>Today 08:00</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    padding: '20px 0',
                    flexWrap: 'wrap',
                  }}
                >
                  <span
                    style={{
                      flex: '0 0 104px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '4px 11px',
                      borderRadius: '999px',
                      background: '#F8DDE0',
                      color: '#8E2434',
                      fontSize: '13px',
                      fontWeight: '600',
                      width: 'fit-content',
                    }}
                  >
                    <span
                      style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C2384D' }}
                    ></span>
                    Expired
                  </span>
                  <div style={{ flex: '1 1 220px', minWidth: '0' }}>
                    <div style={{ fontSize: '15.5px', fontWeight: '600' }}>Strawberries, batch S-044</div>
                    <div style={{ fontSize: '14px', color: '#55645E' }}>
                      2 kg expired yesterday and is still in stock.
                    </div>
                  </div>
                  <span style={{ fontSize: '13px', color: '#55645E' }}>Today 08:00</span>
                </div>
              </div>
            </div>
            <div style={{ flex: '1 1 360px', minWidth: '0', maxWidth: '440px' }}>
              <h2
                className="d"
                style={{
                  margin: '0',
                  fontSize: 'clamp(34px,4vw,48px)',
                  lineHeight: '1.04',
                  fontWeight: '600',
                }}
              >
                A warning before it becomes waste.
              </h2>
              <p style={{ margin: '24px 0 0', fontSize: '18px', lineHeight: '1.6', color: '#55645E' }}>
                Set a reorder level for each product and how many days ahead you want to hear about expiry.
                SmartStock checks every morning, and again after each stock movement.
              </p>
              <p style={{ margin: '16px 0 0', fontSize: '18px', lineHeight: '1.6', color: '#55645E' }}>
                Each problem shows up once, and clears itself when you fix it.
              </p>
            </div>
          </section>
          <section
            id="inspection"
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '96px 40px',
              boxSizing: 'border-box',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '72px',
              alignItems: 'center',
              borderTop: '1px solid #D3DBD7',
            }}
          >
            <div style={{ flex: '1 1 360px', minWidth: '0', maxWidth: '440px' }}>
              <h2
                className="d"
                style={{
                  margin: '0',
                  fontSize: 'clamp(34px,4vw,48px)',
                  lineHeight: '1.04',
                  fontWeight: '600',
                }}
              >
                Photograph it. Get a second opinion.
              </h2>
              <p style={{ margin: '24px 0 0', fontSize: '18px', lineHeight: '1.6', color: '#55645E' }}>
                Pick a batch, take a photo or upload one, and SmartStock tells you whether the produce looks
                fresh or spoiled, with a confidence score. When it is unsure, it says so and asks you to check
                by hand.
              </p>
              <p
                style={{
                  margin: '16px 0 0',
                  fontSize: '18px',
                  lineHeight: '1.6',
                  color: '#14231E',
                  fontWeight: '500',
                }}
              >
                It never changes your stock. The result is a visual estimate, not a food-safety check, and you
                decide what happens next.
              </p>
            </div>
            <div style={{ flex: '1.3 1 520px', minWidth: '0' }}>
              <div
                style={{
                  background: '#fff',
                  borderRadius: '22px',
                  padding: '24px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '28px',
                  alignItems: 'stretch',
                }}
              >
                <svg
                  viewBox="0 0 240 280"
                  style={{ flex: '0 0 220px', width: '220px', maxWidth: '100%', height: 'auto' }}
                  role="img"
                  aria-label="Two bananas with dark brown patches"
                >
                  <rect width="240" height="280" rx="16" fill="#DCE5E0" />
                  <g transform="translate(110 120) rotate(-8) scale(.55)"><path d="M-170 -10 C -110 150, 120 170, 190 -60 C 130 40, -70 70, -170 -10 Z" fill="#8C6A2A"/><circle cx="-20" cy="60" r="12" fill="#3B2C18"/><circle cx="70" cy="70" r="16" fill="#3B2C18"/></g><g transform="translate(120 190) rotate(4) scale(.5)"><path d="M-170 -10 C -110 150, 120 170, 190 -60 C 130 40, -70 70, -170 -10 Z" fill="#9A7630"/><circle cx="30" cy="85" r="14" fill="#3B2C18"/></g>
                  <g
                    fill="none"
                    stroke="#2D4BE0"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M34 70V44H60" />
                    <path d="M156 44H182V70" />
                    <path d="M34 222V248H60" />
                    <path d="M156 248H182V222" />
                  </g>
                </svg>
                <div style={{ flex: '1 1 220px', minWidth: '0', display: 'flex', flexDirection: 'column' }}>
                  <div
                    className="d"
                    style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '-0.02em' }}
                  >
                    Bananas
                  </div>
                  <div style={{ fontSize: '14px', color: '#55645E', marginTop: '2px' }}>
                    Batch N-079, checked by Daniel at 09:42
                  </div>
                  <div
                    style={{
                      marginTop: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '7px',
                        padding: '5px 13px',
                        borderRadius: '999px',
                        background: '#F8DDE0',
                        color: '#8E2434',
                        fontSize: '15px',
                        fontWeight: '600',
                      }}
                    >
                      <span
                        style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#C2384D' }}
                      ></span>
                      Spoiled
                    </span>{' '}
                    <span style={{ fontSize: '15px', fontWeight: '600' }}>88% confidence</span>
                  </div>
                  <div style={{ marginTop: '20px', fontSize: '13.5px', color: '#55645E' }}>Staff note</div>
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '12px 14px',
                      border: '1px solid #D3DBD7',
                      borderRadius: '10px',
                      fontSize: '14.5px',
                      lineHeight: '1.45',
                    }}
                  >
                    Moved 3 kg to waste and recorded it as waste.
                  </div>
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '18px',
                      fontSize: '12.5px',
                      lineHeight: '1.45',
                      color: '#55645E',
                    }}
                  >
                    Visual estimate only. Model freshness-v1.
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section
            id="more"
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '96px 40px 112px',
              boxSizing: 'border-box',
              borderTop: '1px solid #D3DBD7',
            }}
          >
            <h2
              className="d"
              style={{
                margin: '0',
                fontSize: 'clamp(34px,4vw,48px)',
                lineHeight: '1.04',
                fontWeight: '600',
                maxWidth: '640px',
                textWrap: 'balance',
              }}
            >
              The rest of the shop paperwork, handled.
            </h2>
            <div
              style={{
                marginTop: '56px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
                gap: '44px 56px',
              }}
            >
              <div style={{ borderTop: '1px solid #14231E', paddingTop: '18px' }}>
                <div className="d" style={{ fontSize: '21px', fontWeight: '600', letterSpacing: '-0.02em' }}>
                  Dashboard
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '16px', lineHeight: '1.55', color: '#55645E' }}>
                  Stock on hand, open alerts and today's inspections on one screen.
                </p>
              </div>
              <div style={{ borderTop: '1px solid #14231E', paddingTop: '18px' }}>
                <div className="d" style={{ fontSize: '21px', fontWeight: '600', letterSpacing: '-0.02em' }}>
                  Reports
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '16px', lineHeight: '1.55', color: '#55645E' }}>
                  Stock summary, movements, low stock, near expiry and inspections. Export to CSV or PDF.
                </p>
              </div>
              <div style={{ borderTop: '1px solid #14231E', paddingTop: '18px' }}>
                <div className="d" style={{ fontSize: '21px', fontWeight: '600', letterSpacing: '-0.02em' }}>
                  Adjustments with approval
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '16px', lineHeight: '1.55', color: '#55645E' }}>
                  Staff request a correction with a reason. A manager approves it before stock changes.
                </p>
              </div>
              <div style={{ borderTop: '1px solid #14231E', paddingTop: '18px' }}>
                <div className="d" style={{ fontSize: '21px', fontWeight: '600', letterSpacing: '-0.02em' }}>
                  Roles
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '16px', lineHeight: '1.55', color: '#55645E' }}>
                  Administrators, inventory managers and staff each see only what they need.
                </p>
              </div>
              <div style={{ borderTop: '1px solid #14231E', paddingTop: '18px' }}>
                <div className="d" style={{ fontSize: '21px', fontWeight: '600', letterSpacing: '-0.02em' }}>
                  Audit log
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '16px', lineHeight: '1.55', color: '#55645E' }}>
                  Logins, user changes and approvals are recorded with who did it and when.
                </p>
              </div>
              <div style={{ borderTop: '1px solid #14231E', paddingTop: '18px' }}>
                <div className="d" style={{ fontSize: '21px', fontWeight: '600', letterSpacing: '-0.02em' }}>
                  Works in any browser
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '16px', lineHeight: '1.55', color: '#55645E' }}>
                  Use it on the counter computer or on a phone by the shelf. Both read and write the same
                  records.
                </p>
              </div>
            </div>
          </section>
          <section
            style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px 72px', boxSizing: 'border-box' }}
          >
            <div
              style={{
                background: '#14231E',
                borderRadius: '28px',
                padding: '72px 56px',
                color: '#fff',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '32px',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ flex: '1 1 420px', minWidth: '0' }}>
                <h2
                  className="d"
                  style={{
                    margin: '0',
                    fontSize: 'clamp(34px,4.4vw,56px)',
                    lineHeight: '1.03',
                    fontWeight: '600',
                    maxWidth: '560px',
                  }}
                >
                  Step inside and look around.
                </h2>
                <p
                  style={{
                    margin: '20px 0 0',
                    fontSize: '18px',
                    lineHeight: '1.55',
                    color: '#BFCBC5',
                    maxWidth: '520px',
                  }}
                >
                  This prototype is clickable.
                </p>
              </div>
              <Link
                className="btn light"
                to="/login"
                style={{ height: '54px', padding: '0 32px', fontSize: '17px' }}
              >
                Open the app
              </Link>
            </div>
          </section>
          <footer
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 40px 56px',
              boxSizing: 'border-box',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px 32px',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#55645E',
            }}
          >
            <span>SmartStock Intelligence. K44 Workshop II project.</span>{' '}
            <span style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <Link to="/dashboard" style={{ color: '#55645E' }}>
                Dashboard
              </Link>
              <Link to="/products" style={{ color: '#55645E' }}>
                Products
              </Link>
              <Link to="/inspect" style={{ color: '#55645E' }}>
                Inspect
              </Link>
              <Link to="/reports" style={{ color: '#55645E' }}>
                Reports
              </Link>
            </span>
          </footer>
        </div>
      </div>
    );
  }
}
