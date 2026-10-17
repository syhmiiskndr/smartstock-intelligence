import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { DCLogic } from '../lib/DCLogic';
import Sidebar from '../components/Sidebar';
import './Inspect.css';

export const path = '/inspect';
export const title = 'Inspect freshness';

export default class Inspect extends DCLogic {
  renderVals() {
    const st = this.state || {};
    const s = typeof st.sample === 'number' ? st.sample : -1;
    const samples = [
      {
        label: 'Fresh banana',
        product: 'Bananas',
        batch: 'Batch N-079, checked just now by Aina',
        kind: 'fresh',
        conf: 94,
        note: 'No visible spoilage found. The peel looks evenly yellow.',
      },
      {
        label: 'Spoiled banana',
        product: 'Bananas',
        batch: 'Batch N-079, checked just now by Aina',
        kind: 'spoiled',
        conf: 88,
        note: 'Dark brown patches found across the peel.',
      },
      {
        label: 'Blurry photo',
        product: 'Bananas',
        batch: 'Batch N-079, checked just now by Aina',
        kind: 'low',
        conf: 61,
        note: 'The photo is blurry and overexposed, so the result is unreliable.',
      },
      {
        label: 'Not a banana',
        product: 'Unsupported image',
        batch: 'Batch N-079, checked just now by Aina',
        kind: 'unsupported',
        conf: 0,
        note: 'This looks like a different fruit. The model only supports Banana, so no prediction was made.',
      },
    ];
    const cur = samples[s < 0 ? 0 : s];
    return {
      isIdle: s < 0,
      isDone: s >= 0,
      showTomato: s === 0,
      showSpoil: s === 1,
      showCuke: s === 2,
      showApple: s === 3,
      demo: {
        product: cur.product,
        batch: cur.batch,
        conf: cur.conf,
        confWidth: cur.conf + '%',
        note: cur.note,
        isFresh: cur.kind === 'fresh',
        isSpoiled: cur.kind === 'spoiled',
        isLow: cur.kind === 'low',
        isUnsupported: cur.kind === 'unsupported',
      },
      checkNow: () => this.setState({ sample: s < 0 ? 0 : s }),
      reset: () => this.setState({ sample: -1 }),
      chips: samples.map((x, i) => ({
        label: x.label,
        cls: i === s ? 'chip on' : 'chip',
        pick: () => this.setState({ sample: i }),
      })),
    };
  }

  template(v) {
    const { checkNow, chips, demo, isDone, isIdle, reset, showApple, showCuke, showSpoil, showTomato } = v;
    return (
      <div className="pg-inspect">
        <div className="app-shell" style={{ minHeight: '1000px', display: 'flex', flexWrap: 'wrap', background: '#EEF1EF' }}>
          <div className="app-side" style={{ flex: '0 0 248px' }}>
            <Sidebar active="inspect" />
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
                Inspect freshness
              </h1>
              <p style={{ margin: '8px 0 0', fontSize: '15.5px', color: '#55645E', maxWidth: '620px' }}>
                Photograph a batch and get a visual estimate of its condition. The result never changes your
                stock.
              </p>
              <div
                style={{
                  marginTop: '32px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '48px',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: '1 1 360px', maxWidth: '440px', minWidth: '0' }}>
                  <label className="lbl" htmlFor="batch">
                    Batch
                  </label>{' '}
                  <select id="batch" className="field">
                    <option>Bananas, N-079 (24 kg)</option>
                    <option>Bananas, N-081 (12 kg)</option>
                  </select>
                  <p style={{ margin: '8px 0 0', fontSize: '13.5px', lineHeight: '1.5', color: '#55645E' }}>
                    Only Banana batches appear here. The model does not support other fruit yet.
                  </p>
                  <div
                    style={{
                      marginTop: '28px',
                      border: '1.5px dashed #9AA8A1',
                      borderRadius: '16px',
                      padding: '32px 24px',
                      textAlign: 'center',
                      background: '#F9FAF9',
                    }}
                  >
                    <svg
                      width="34"
                      height="34"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#2D4BE0"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <div style={{ marginTop: '12px', fontSize: '16px', fontWeight: '600' }}>
                      Drop a photo here
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '13.5px', color: '#55645E' }}>
                      JPEG or PNG, up to 5 MB
                    </div>
                    <div
                      style={{
                        marginTop: '18px',
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      <button className="btn ghost">Choose photo</button>
                      <button className="btn ghost">Use camera</button>
                    </div>
                  </div>
                  <div style={{ marginTop: '24px' }}>
                    <div style={{ fontSize: '14px', color: '#55645E' }}>No photo to hand? Try a sample.</div>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {chips.map((c, _i) => (
                        <Fragment key={_i}>
                          <button className={c.cls} onClick={c.pick}>
                            {c.label}
                          </button>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginTop: '28px' }}>
                    <button className="btn" onClick={checkNow}>
                      Check freshness
                    </button>
                  </div>
                  <p style={{ margin: '16px 0 0', fontSize: '13px', color: '#55645E' }}>
                    Model freshness-v1. Sample photos are illustrations.
                  </p>
                </div>
                <div style={{ flex: '1.5 1 500px', minWidth: '0' }}>
                  {isIdle ? (
                    <>
                      <div
                        style={{
                          border: '1px solid #E1E7E3',
                          borderRadius: '20px',
                          padding: '36px 36px 40px',
                          background: '#F9FAF9',
                        }}
                      >
                        <h2
                          className="d"
                          style={{
                            margin: '0',
                            fontSize: '24px',
                            fontWeight: '600',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          Your result will appear here
                        </h2>
                        <p
                          style={{
                            margin: '10px 0 0',
                            fontSize: '15.5px',
                            lineHeight: '1.55',
                            color: '#55645E',
                            maxWidth: '440px',
                          }}
                        >
                          You will see the predicted class, a confidence score, and a warning when the model
                          is unsure.
                        </p>
                        <div style={{ marginTop: '24px', maxWidth: '440px' }}>
                          <p
                            style={{
                              margin: '0',
                              padding: '14px 0',
                              borderTop: '1px solid #DDE3DF',
                              fontSize: '15px',
                              lineHeight: '1.5',
                            }}
                          >
                            Use daylight or a bright light.
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
                            Show one batch, close enough to see the surface.
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
                            Hold the phone steady so the photo is sharp.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : null}
                  {isDone ? (
                    <>
                      <div
                        style={{
                          border: '1px solid #E1E7E3',
                          borderRadius: '20px',
                          padding: '28px',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '28px',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            flex: '1 1 260px',
                            maxWidth: '300px',
                            minWidth: '0',
                            position: 'relative',
                          }}
                        >
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
                          {showApple ? (
                            <>
                              <svg
                                viewBox="0 0 560 520"
                                style={{ display: 'block', width: '100%', height: 'auto' }}
                                role="img"
                                aria-label="A tray of three apples with dark soft patches"
                              >
                                <rect width="560" height="520" rx="28" fill="#DCE5E0" />
                                <path d="M0 130H560M0 260H560M0 390H560" stroke="#CFDAD4" strokeWidth="2" />
                                <ellipse cx="236" cy="392" rx="92" ry="12" fill="#14231E" opacity=".1" />
                                <circle cx="230" cy="280" r="100" fill="#92392A" />
                                <circle cx="200" cy="304" r="30" fill="#4A2B20" opacity=".85" />
                                <circle cx="266" cy="246" r="20" fill="#4A2B20" opacity=".8" />
                                <circle cx="236" cy="338" r="13" fill="#4A2B20" opacity=".8" />
                                <circle cx="184" cy="232" r="9" fill="#C8B89B" opacity=".9" />
                                <ellipse cx="230" cy="192" rx="24" ry="9" fill="#6D2A1E" />
                                <path
                                  d="M230 190q6-26 22-36"
                                  stroke="#4B3425"
                                  strokeWidth="8"
                                  fill="none"
                                  strokeLinecap="round"
                                />
                                <circle cx="410" cy="340" r="72" fill="#A04432" />
                                <circle cx="432" cy="362" r="22" fill="#4A2B20" opacity=".85" />
                                <circle cx="390" cy="316" r="11" fill="#4A2B20" opacity=".8" />
                                <ellipse cx="410" cy="274" rx="18" ry="7" fill="#6D2A1E" />
                                <path
                                  d="M410 272q4-20 16-28"
                                  stroke="#4B3425"
                                  strokeWidth="7"
                                  fill="none"
                                  strokeLinecap="round"
                                />
                                <circle cx="400" cy="170" r="58" fill="#8A3626" />
                                <circle cx="416" cy="190" r="17" fill="#4A2B20" opacity=".85" />
                                <ellipse cx="400" cy="124" rx="15" ry="6" fill="#6D2A1E" />
                                <path
                                  d="M400 122q3-17 13-24"
                                  stroke="#4B3425"
                                  strokeWidth="6"
                                  fill="none"
                                  strokeLinecap="round"
                                />
                              </svg>
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
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M110 196V160H146" />
                              <path d="M314 160H350V196" />
                              <path d="M110 364V400H146" />
                              <path d="M314 400H350V364" />
                            </g>
                          </svg>
                        </div>
                        <div style={{ flex: '1.3 1 280px', minWidth: '0' }}>
                          <div
                            className="d"
                            style={{ fontSize: '26px', fontWeight: '600', letterSpacing: '-0.02em' }}
                          >
                            {demo.product}
                          </div>
                          <div style={{ marginTop: '2px', fontSize: '14px', color: '#55645E' }}>
                            {demo.batch}
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
                            {demo.isFresh ? (
                              <>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 15px',
                                    borderRadius: '999px',
                                    background: '#E1F1E7',
                                    color: '#17603D',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '8px',
                                      height: '8px',
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
                                    gap: '8px',
                                    padding: '6px 15px',
                                    borderRadius: '999px',
                                    background: '#F8DDE0',
                                    color: '#8E2434',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '8px',
                                      height: '8px',
                                      borderRadius: '50%',
                                      background: '#C2384D',
                                    }}
                                  ></span>
                                  Spoiled
                                </span>
                              </>
                            ) : null}
                            {demo.isUnsupported ? (
                              <>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 15px',
                                    borderRadius: '999px',
                                    background: '#E7ECE9',
                                    color: '#34423C',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                  }}
                                >
                                  Unsupported image
                                </span>
                              </>
                            ) : null}
                            {demo.isLow ? (
                              <>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '6px 15px',
                                    borderRadius: '999px',
                                    background: '#FBEFD0',
                                    color: '#7A5200',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                  }}
                                >
                                  <span
                                    style={{
                                      width: '8px',
                                      height: '8px',
                                      borderRadius: '50%',
                                      background: '#D9981E',
                                    }}
                                  ></span>
                                  Requires review
                                </span>
                              </>
                            ) : null}
                            <span
                              style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {demo.isUnsupported ? 'No prediction' : demo.conf + '% confidence'}
                            </span>
                          </div>
                          <div
                            style={{
                              marginTop: '14px',
                              height: '8px',
                              borderRadius: '4px',
                              background: '#E7ECE9',
                            }}
                          >
                            <div
                              style={{
                                height: '8px',
                                borderRadius: '4px',
                                background: '#14231E',
                                width: demo.confWidth,
                              }}
                            ></div>
                          </div>
                          <p
                            style={{
                              margin: '16px 0 0',
                              fontSize: '15px',
                              lineHeight: '1.55',
                              color: '#2C3B35',
                            }}
                          >
                            {demo.note}
                          </p>
                          {demo.isLow ? (
                            <>
                              <p
                                style={{
                                  margin: '16px 0 0',
                                  padding: '12px 14px',
                                  borderRadius: '12px',
                                  background: '#FBEFD0',
                                  color: '#5C3E00',
                                  fontSize: '14px',
                                  lineHeight: '1.5',
                                }}
                              >
                                The model is not sure about this photo. Check the produce by hand, or take a
                                clearer photo.
                              </p>
                            </>
                          ) : null}
                          {demo.isSpoiled ? (
                            <>
                              <p style={{ margin: '16px 0 0', fontSize: '14.5px', lineHeight: '1.5' }}>
                                If you remove it,{' '}
                                <Link
                                  to="/stock"
                                  style={{
                                    fontWeight: '600',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '4px',
                                  }}
                                >
                                  record the stock-out as waste
                                </Link>{' '}
                                or{' '}
                                <Link
                                  to="/adjustments"
                                  style={{
                                    fontWeight: '600',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '4px',
                                  }}
                                >
                                  request an adjustment
                                </Link>
                                .
                              </p>
                            </>
                          ) : null}
                          <div style={{ marginTop: '22px' }}>
                            <label className="lbl" htmlFor="note">
                              Staff note (optional)
                            </label>
                            <textarea id="note" className="area" placeholder="What did you decide to do?" />
                          </div>
                          <div style={{ marginTop: '18px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <Link className="btn" to="/history">
                              Save inspection
                            </Link>{' '}
                            <button className="btn ghost" onClick={reset}>
                              Retake photo
                            </button>
                          </div>
                          <p
                            style={{
                              margin: '16px 0 0',
                              paddingTop: '14px',
                              borderTop: '1px solid #E7ECE9',
                              fontSize: '13px',
                              lineHeight: '1.5',
                              color: '#55645E',
                            }}
                          >
                            Visual estimate only. Not a food-safety check. Saving this inspection does not
                            change your stock.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
