import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { DCLogic } from '../lib/DCLogic';
import Sidebar from '../components/Sidebar';
import './History.css';

export const path = '/history';
export const title = 'Inspection history';

export default class History extends DCLogic {
  renderVals() {
    const st = this.state || {};
    const f = st.filter || 'all';
    const sid = st.sel === undefined ? 'i3' : st.sel;
    const T = ['#D5412B', '#CC3A26', '#DB4A33'];
    const A = ['#92392A', '#A04432', '#8A3626'];
    const C = ['#3F8D4D', '#438F50', '#3A8749'];
    const B = ['#E3B93C', '#D9AE30', '#E8C45A'];
    const S = ['#3E8E4D', '#4C9A5A', '#35803F'];
    const L = ['#7DB36A', '#6FA85D', '#8BBF77'];
    const all = [
      {
        id: 'i1',
        product: 'Papayas',
        batch: 'P-118',
        kind: 'fresh',
        conf: 94,
        when: 'Today, 10:30',
        by: 'Farid',
        note: 'No note.',
        c: T,
      },
      {
        id: 'i2',
        product: 'Oranges',
        batch: 'O-032',
        kind: 'low',
        conf: 61,
        when: 'Today, 11:05',
        by: 'Siti',
        note: 'No note yet. The photo was blurry, so this batch still needs a check by hand.',
        c: C,
      },
      {
        id: 'i3',
        product: 'Gala apples',
        batch: 'A-077',
        kind: 'spoiled',
        conf: 88,
        when: 'Today, 09:42',
        by: 'Daniel',
        note: 'Moved 3 kg to waste and recorded it as waste.',
        c: A,
      },
      {
        id: 'i4',
        product: 'Strawberries',
        batch: 'B-209',
        kind: 'fresh',
        conf: 91,
        when: 'Today, 08:20',
        by: 'Aina',
        note: 'No note.',
        c: ['#C8283C', '#D13247', '#BE2236'],
      },
      {
        id: 'i5',
        product: 'Red grapes',
        batch: 'G-126',
        kind: 'fresh',
        conf: 95,
        when: 'Today, 08:50',
        by: 'Farid',
        note: 'No note.',
        c: T,
      },
      {
        id: 'i6',
        product: 'Bananas',
        batch: 'N-079',
        kind: 'fresh',
        conf: 93,
        when: 'Today, 10:20',
        by: 'Farid',
        note: 'No note.',
        c: B,
      },
      {
        id: 'i7',
        product: 'Lettuce',
        batch: 'L-015',
        kind: 'fresh',
        conf: 89,
        when: 'Today, 07:45',
        by: 'Siti',
        note: 'No note.',
        c: L,
      },
      {
        id: 'i8',
        product: 'Papayas',
        batch: 'P-118',
        kind: 'fresh',
        conf: 97,
        when: '13 Oct, 09:15',
        by: 'Siti',
        note: 'No note.',
        c: T,
      },
      {
        id: 'i9',
        product: 'Bananas',
        batch: 'N-077',
        kind: 'spoiled',
        conf: 79,
        when: '13 Oct, 08:40',
        by: 'Farid',
        note: 'Two hands had black soft spots. Removed them and kept the rest.',
        c: B,
      },
    ];
    const shown = f === 'all' ? all : all.filter((x) => x.kind === f);
    const rows = shown.map((x) => ({
      product: x.product,
      batch: x.batch,
      conf: x.conf,
      when: x.when,
      by: x.by,
      color: x.c[0],
      cls: x.id === sid ? 'row sel' : 'row',
      isFresh: x.kind === 'fresh',
      isSpoiled: x.kind === 'spoiled',
      isLow: x.kind === 'low',
      open: () => this.setState({ sel: x.id }),
    }));
    const cur = all.find((x) => x.id === sid);
    const sel = cur
      ? {
          product: cur.product,
          batch: cur.batch,
          conf: cur.conf,
          when: cur.when,
          by: cur.by,
          note: cur.note,
          c1: cur.c[0],
          c2: cur.c[1],
          c3: cur.c[2],
          isFresh: cur.kind === 'fresh',
          isSpoiled: cur.kind === 'spoiled',
          isLow: cur.kind === 'low',
        }
      : {
          product: '',
          batch: '',
          conf: 0,
          when: '',
          by: '',
          note: '',
          c1: '#ccc',
          c2: '#ccc',
          c3: '#ccc',
          isFresh: false,
          isSpoiled: false,
          isLow: false,
        };
    const defs = [
      ['all', 'All results'],
      ['fresh', 'Fresh'],
      ['spoiled', 'Spoiled'],
      ['low', 'Low confidence'],
    ];
    return {
      rows,
      sel,
      hasSel: !!cur,
      noSel: !cur,
      footer:
        f === 'all' ? 'Showing 9 of 63 inspections' : 'Showing ' + rows.length + ' matching inspections',
      tabs: defs.map((d) => ({
        label: d[1],
        cls: d[0] === f ? 'tab on' : 'tab',
        pick: () => this.setState({ filter: d[0] }),
      })),
    };
  }

  template(v) {
    const { footer, hasSel, noSel, rows, sel, tabs } = v;
    return (
      <div className="pg-history">
        <div className="app-shell" style={{ minHeight: '1000px', display: 'flex', flexWrap: 'wrap', background: '#EEF1EF' }}>
          <div className="app-side" style={{ flex: '0 0 248px' }}>
            <Sidebar active="history" />
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
                    Inspection history
                  </h1>
                  <p style={{ margin: '8px 0 0', fontSize: '15.5px', color: '#55645E' }}>
                    Every photo check, with the model version and who ran it.
                  </p>
                </div>
                <Link className="btn" to="/inspect">
                  New inspection
                </Link>
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
                  marginTop: '20px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '36px',
                  alignItems: 'flex-start',
                }}
              >
                <section style={{ flex: '1.7 1 620px', minWidth: '0', overflowX: 'auto' }}>
                  <div style={{ minWidth: '620px' }}>
                    <div
                      className="row"
                      style={{
                        borderBottom: '1px solid #14231E',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#55645E',
                        paddingTop: '10px',
                        paddingBottom: '10px',
                      }}
                    >
                      <span></span>
                      <span>Product and batch</span>
                      <span>Result</span>
                      <span style={{ textAlign: 'right' }}>Score</span>
                      <span>Checked</span>
                      <span></span>
                    </div>
                    {rows.map((r, _i) => (
                      <Fragment key={_i}>
                        <div className={r.cls}>
                          <span
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: r.color,
                            }}
                          ></span>{' '}
                          <span>
                            <span style={{ display: 'block', fontWeight: '600' }}>{r.product}</span>
                            <span style={{ display: 'block', fontSize: '13px', color: '#55645E' }}>
                              Batch {r.batch}
                            </span>
                          </span>{' '}
                          <span>
                            {r.isFresh ? (
                              <>
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
                                  Fresh
                                </span>
                              </>
                            ) : null}
                            {r.isSpoiled ? (
                              <>
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
                                    style={{
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%',
                                      background: '#C2384D',
                                    }}
                                  ></span>
                                  Spoiled
                                </span>
                              </>
                            ) : null}
                            {r.isLow ? (
                              <>
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
                                    style={{
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%',
                                      background: '#D9981E',
                                    }}
                                  ></span>
                                  Low confidence
                                </span>
                              </>
                            ) : null}
                          </span>{' '}
                          <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                            {r.conf}%
                          </span>{' '}
                          <span>
                            <span style={{ display: 'block' }}>{r.when}</span>
                            <span style={{ display: 'block', fontSize: '13px', color: '#55645E' }}>
                              {r.by}
                            </span>
                          </span>{' '}
                          <button className="view" onClick={r.open}>
                            View
                          </button>
                        </div>
                      </Fragment>
                    ))}
                    <p style={{ margin: '16px 10px 0', fontSize: '14px', color: '#55645E' }}>{footer}</p>
                  </div>
                </section>
                <aside
                  style={{
                    flex: '1 1 320px',
                    maxWidth: '400px',
                    minWidth: '0',
                    background: '#F4F6F5',
                    borderRadius: '18px',
                    padding: '22px 24px 26px',
                  }}
                >
                  {hasSel ? (
                    <>
                      <svg
                        viewBox="0 0 300 190"
                        style={{ display: 'block', width: '100%', height: 'auto' }}
                        role="img"
                        aria-label="Preview of the inspected photo"
                      >
                        <rect width="300" height="190" rx="14" fill="#DCE5E0" />
                        <circle cx="96" cy="108" r="54" fill={sel.c1} />
                        <circle cx="190" cy="124" r="40" fill={sel.c2} />
                        <circle cx="222" cy="64" r="30" fill={sel.c3} />
                        <g
                          fill="none"
                          stroke="#2D4BE0"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M32 66V40H58" />
                          <path d="M146 40H172V66" />
                          <path d="M32 150V176H58" />
                          <path d="M146 176H172V150" />
                        </g>
                      </svg>
                      <div
                        className="d"
                        style={{
                          marginTop: '18px',
                          fontSize: '22px',
                          fontWeight: '600',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {sel.product}
                      </div>
                      <div style={{ fontSize: '14px', color: '#55645E' }}>Batch {sel.batch}</div>
                      <div
                        style={{
                          marginTop: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          flexWrap: 'wrap',
                        }}
                      >
                        {sel.isFresh ? (
                          <>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '7px',
                                padding: '4px 12px',
                                borderRadius: '999px',
                                background: '#E1F1E7',
                                color: '#17603D',
                                fontSize: '14px',
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
                        {sel.isSpoiled ? (
                          <>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '7px',
                                padding: '4px 12px',
                                borderRadius: '999px',
                                background: '#F8DDE0',
                                color: '#8E2434',
                                fontSize: '14px',
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
                        {sel.isLow ? (
                          <>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '7px',
                                padding: '4px 12px',
                                borderRadius: '999px',
                                background: '#FBEFD0',
                                color: '#7A5200',
                                fontSize: '14px',
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
                              Low confidence
                            </span>
                          </>
                        ) : null}
                        <span style={{ fontSize: '14px', fontWeight: '600' }}>{sel.conf}% confidence</span>
                      </div>
                      <dl
                        style={{
                          margin: '18px 0 0',
                          display: 'grid',
                          gridTemplateColumns: 'auto 1fr',
                          fontSize: '14px',
                        }}
                      >
                        <dt
                          style={{
                            padding: '10px 16px 10px 0',
                            borderTop: '1px solid #DDE3DF',
                            color: '#55645E',
                          }}
                        >
                          Checked by
                        </dt>
                        <dd
                          style={{
                            margin: '0',
                            padding: '10px 0',
                            borderTop: '1px solid #DDE3DF',
                            textAlign: 'right',
                            fontWeight: '600',
                          }}
                        >
                          {sel.by}
                        </dd>
                        <dt
                          style={{
                            padding: '10px 16px 10px 0',
                            borderTop: '1px solid #DDE3DF',
                            color: '#55645E',
                          }}
                        >
                          When
                        </dt>
                        <dd
                          style={{
                            margin: '0',
                            padding: '10px 0',
                            borderTop: '1px solid #DDE3DF',
                            textAlign: 'right',
                            fontWeight: '600',
                          }}
                        >
                          {sel.when}
                        </dd>
                        <dt
                          style={{
                            padding: '10px 16px 10px 0',
                            borderTop: '1px solid #DDE3DF',
                            borderBottom: '1px solid #DDE3DF',
                            color: '#55645E',
                          }}
                        >
                          Model
                        </dt>
                        <dd
                          style={{
                            margin: '0',
                            padding: '10px 0',
                            borderTop: '1px solid #DDE3DF',
                            borderBottom: '1px solid #DDE3DF',
                            textAlign: 'right',
                            fontWeight: '600',
                          }}
                        >
                          freshness-v1
                        </dd>
                      </dl>
                      <div style={{ marginTop: '16px', fontSize: '13.5px', color: '#55645E' }}>
                        Staff note
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '14.5px', lineHeight: '1.5' }}>{sel.note}</p>
                      <p
                        style={{
                          margin: '18px 0 0',
                          fontSize: '12.5px',
                          lineHeight: '1.5',
                          color: '#55645E',
                        }}
                      >
                        Visual estimate only. Not a food-safety check.
                      </p>
                      <p style={{ margin: '12px 0 0' }}>
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
                      </p>
                    </>
                  ) : null}
                  {noSel ? (
                    <>
                      <p style={{ margin: '0', fontSize: '15px', lineHeight: '1.55', color: '#55645E' }}>
                        Select an inspection to see its photo, score and notes.
                      </p>
                    </>
                  ) : null}
                </aside>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
