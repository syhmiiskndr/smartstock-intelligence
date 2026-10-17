import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { DCLogic } from '../lib/DCLogic';
import Sidebar from '../components/Sidebar';
import './Products.css';

export const path = '/products';
export const title = 'Products';

export default class Products extends DCLogic {
  renderVals() {
    const f = (this.state && this.state.filter) || 'all';
    const OK = '#2E8B5B',
      WARN = '#D9981E',
      BAD = '#C2384D';
    const all = [
      {
        name: 'Papayas',
        sku: 'PAP-001',
        cat: 'Vegetables',
        onHand: '46 kg',
        reorder: '10 kg',
        expiry: '3 days',
        w: '21%',
        color: WARN,
        kind: 'near',
      },
      {
        name: 'Red grapes',
        sku: 'GRP-001',
        cat: 'Vegetables',
        onHand: '40 kg',
        reorder: '12 kg',
        expiry: '9 days',
        w: '64%',
        color: OK,
        kind: 'ok',
      },
      {
        name: 'Oranges',
        sku: 'ORG-001',
        cat: 'Vegetables',
        onHand: '6 kg',
        reorder: '10 kg',
        expiry: '6 days',
        w: '43%',
        color: OK,
        kind: 'low',
      },
      {
        name: 'Strawberries',
        sku: 'SPI-001',
        cat: 'Leafy greens',
        onHand: '2 kg',
        reorder: '5 kg',
        expiry: 'Expired',
        w: '6%',
        color: BAD,
        kind: 'expired',
      },
      {
        name: 'Strawberries',
        sku: 'STR-001',
        cat: 'Fruit',
        onHand: '5 kg',
        reorder: '8 kg',
        expiry: '1 day',
        w: '7%',
        color: WARN,
        kind: 'near',
      },
      {
        name: 'Bananas',
        sku: 'BAN-001',
        cat: 'Fruit',
        onHand: '25 kg',
        reorder: '15 kg',
        expiry: '5 days',
        w: '36%',
        color: OK,
        kind: 'ok',
      },
      {
        name: 'Gala apples',
        sku: 'APP-001',
        cat: 'Fruit',
        onHand: '32 kg',
        reorder: '20 kg',
        expiry: '12 days',
        w: '86%',
        color: OK,
        kind: 'ok',
      },
      {
        name: 'Carrots',
        sku: 'CAR-001',
        cat: 'Vegetables',
        onHand: '60 kg',
        reorder: '20 kg',
        expiry: '21 days',
        w: '100%',
        color: OK,
        kind: 'ok',
      },
      {
        name: 'Lettuce',
        sku: 'LET-001',
        cat: 'Leafy greens',
        onHand: '9 kg',
        reorder: '8 kg',
        expiry: '4 days',
        w: '29%',
        color: OK,
        kind: 'ok',
      },
      {
        name: 'Green chillies',
        sku: 'CHI-001',
        cat: 'Vegetables',
        onHand: '3 kg',
        reorder: '5 kg',
        expiry: '7 days',
        w: '50%',
        color: OK,
        kind: 'low',
      },
    ];
    const shown = f === 'all' ? all : all.filter((x) => x.kind === (f === 'near' ? 'near' : f));
    const rows = shown.map((x) => ({
      name: x.name,
      sku: x.sku,
      cat: x.cat,
      onHand: x.onHand,
      reorder: x.reorder,
      expiry: x.expiry,
      w: x.w,
      color: x.color,
      isOk: x.kind === 'ok',
      isLow: x.kind === 'low',
      isNear: x.kind === 'near',
      isExp: x.kind === 'expired',
    }));
    const defs = [
      ['all', 'All'],
      ['low', 'Low stock'],
      ['near', 'Near expiry'],
      ['expired', 'Expired'],
    ];
    return {
      rows,
      footer: f === 'all' ? 'Showing 10 of 128 products' : 'Showing ' + rows.length + ' matching products',
      tabs: defs.map((d) => ({
        label: d[1],
        cls: d[0] === f ? 'tab on' : 'tab',
        pick: () => this.setState({ filter: d[0] }),
      })),
    };
  }

  template(v) {
    const { footer, rows, tabs } = v;
    return (
      <div className="pg-products">
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
                    Products
                  </h1>
                  <p style={{ margin: '8px 0 0', fontSize: '15.5px', color: '#55645E' }}>
                    128 active products in 6 categories.
                  </p>
                </div>
                <button className="btn">Add product</button>
              </div>
              <div
                style={{
                  marginTop: '28px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative' }}>
                    <label
                      htmlFor="q"
                      style={{
                        position: 'absolute',
                        width: '1px',
                        height: '1px',
                        overflow: 'hidden',
                        clip: 'rect(0 0 0 0)',
                      }}
                    >
                      Search products
                    </label>{' '}
                    <input
                      id="q"
                      className="field"
                      type="search"
                      placeholder="Search by name or SKU"
                      style={{ width: '280px', maxWidth: '100%' }}
                    />
                  </div>
                  <label
                    htmlFor="cat"
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
                  <select id="cat" className="field">
                    <option>All categories</option>
                    <option>Vegetables</option>
                    <option>Fruit</option>
                    <option>Leafy greens</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {tabs.map((t, _i) => (
                    <Fragment key={_i}>
                      <button className={t.cls} onClick={t.pick}>
                        {t.label}
                      </button>
                    </Fragment>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '20px', overflowX: 'auto' }}>
                <div style={{ minWidth: '900px' }}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(200px,2fr) 130px 90px 100px minmax(170px,1.4fr) 126px',
                      gap: '16px',
                      padding: '12px 12px',
                      borderBottom: '1px solid #14231E',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#55645E',
                    }}
                  >
                    <span>Product</span>
                    <span>Category</span>
                    <span style={{ textAlign: 'right' }}>On hand</span>
                    <span style={{ textAlign: 'right' }}>Reorder at</span>
                    <span>Next expiry</span>
                    <span>Status</span>
                  </div>
                  {rows.map((r, _i) => (
                    <Fragment key={_i}>
                      <Link
                        className="row"
                        to="/products/detail"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(200px,2fr) 130px 90px 100px minmax(170px,1.4fr) 126px',
                          gap: '16px',
                          alignItems: 'center',
                          padding: '14px 12px',
                          borderBottom: '1px solid #E7ECE9',
                          fontSize: '14.5px',
                          color: '#14231E',
                        }}
                      >
                        <span>
                          <span style={{ display: 'block', fontWeight: '600' }}>{r.name}</span>
                          <span style={{ display: 'block', fontSize: '13px', color: '#55645E' }}>
                            {r.sku}
                          </span>
                        </span>{' '}
                        <span style={{ color: '#2C3B35' }}>{r.cat}</span>{' '}
                        <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                          {r.onHand}
                        </span>{' '}
                        <span
                          style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#55645E' }}
                        >
                          {r.reorder}
                        </span>{' '}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span
                            style={{
                              flex: '1',
                              maxWidth: '96px',
                              height: '8px',
                              borderRadius: '4px',
                              background: '#E7ECE9',
                            }}
                          >
                            <span
                              style={{
                                display: 'block',
                                height: '8px',
                                borderRadius: '4px',
                                width: r.w,
                                background: r.color,
                              }}
                            ></span>
                          </span>
                          <span style={{ fontSize: '13.5px', color: '#2C3B35' }}>{r.expiry}</span>
                        </span>{' '}
                        <span>
                          {r.isOk ? (
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
                                In stock
                              </span>
                            </>
                          ) : null}
                          {r.isLow ? (
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
                          {r.isNear ? (
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
                          {r.isExp ? (
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
                        </span>
                      </Link>
                    </Fragment>
                  ))}
                </div>
              </div>
              <div
                style={{
                  marginTop: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  fontSize: '14px',
                  color: '#55645E',
                }}
              >
                <span>{footer}</span>{' '}
                <span style={{ display: 'flex', gap: '8px' }}>
                  <button className="tab" style={{ opacity: '.5', cursor: 'default' }}>
                    Previous
                  </button>
                  <button className="tab">Next</button>
                </span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
