import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { DCLogic } from '../lib/DCLogic';
import './Login.css';

export const path = '/login';
export const title = 'Log in to SmartStock';

export default class Login extends DCLogic {
  renderVals() {
    return {};
  }

  template(v) {
    return (
      <div className="pg-login">
        <div style={{ minHeight: '1000px', display: 'flex', flexWrap: 'wrap' }}>
          <div className="login-brand-panel"
            style={{
              flex: '1 1 520px',
              minWidth: '0',
              boxSizing: 'border-box',
              padding: '40px 56px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '760px',
            }}
          >
            <Link
              to="/"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: 'fit-content' }}
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
            <div
              className="login-art"
              style={{
                position: 'relative',
                width: '380px',
                maxWidth: '100%',
                height: '400px',
                margin: '40px auto',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '150px',
                  top: '40px',
                  width: '220px',
                  boxSizing: 'border-box',
                  background: '#fff',
                  borderRadius: '18px',
                  padding: '30px 20px 20px',
                  transform: 'rotate(6deg)',
                  boxShadow: '0 1px 0 #DDE3DF,0 22px 40px -22px rgba(20,35,30,.35)',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '-38px',
                    left: '50%',
                    width: '1.5px',
                    height: '48px',
                    background: '#9AA8A1',
                  }}
                ></span>{' '}
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
                <div className="d" style={{ fontSize: '18px', fontWeight: '600', letterSpacing: '-0.02em' }}>
                  Strawberries
                </div>
                <div style={{ fontSize: '13.5px', color: '#55645E' }}>Batch S-044</div>
                <div style={{ marginTop: '14px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '4px 11px',
                      borderRadius: '999px',
                      background: '#F8DDE0',
                      color: '#8E2434',
                      fontSize: '13.5px',
                      fontWeight: '600',
                    }}
                  >
                    <span
                      style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C2384D' }}
                    ></span>
                    Expired
                  </span>
                </div>
                <div
                  style={{ marginTop: '14px', height: '8px', borderRadius: '4px', background: '#C2384D' }}
                ></div>
                <div style={{ marginTop: '12px', fontSize: '14px', color: '#2C3B35' }}>
                  2 kg still in stock
                </div>
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: '0',
                  top: '84px',
                  width: '250px',
                  boxSizing: 'border-box',
                  background: '#fff',
                  borderRadius: '18px',
                  padding: '30px 22px 22px',
                  transform: 'rotate(-5deg)',
                  boxShadow: '0 1px 0 #DDE3DF,0 26px 48px -22px rgba(20,35,30,.4)',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: '-42px',
                    left: '50%',
                    width: '1.5px',
                    height: '52px',
                    background: '#9AA8A1',
                  }}
                ></span>{' '}
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
                <div className="d" style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '-0.02em' }}>
                  Papayas
                </div>
                <div style={{ fontSize: '13.5px', color: '#55645E' }}>Batch P-118</div>
                <div style={{ marginTop: '14px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '4px 11px',
                      borderRadius: '999px',
                      background: '#FBEFD0',
                      color: '#7A5200',
                      fontSize: '13.5px',
                      fontWeight: '600',
                    }}
                  >
                    <span
                      style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#D9981E' }}
                    ></span>
                    Expires in 3 days
                  </span>
                </div>
                <div style={{ marginTop: '14px', height: '8px', borderRadius: '4px', background: '#E7ECE9' }}>
                  <div
                    style={{ width: '30%', height: '8px', borderRadius: '4px', background: '#D9981E' }}
                  ></div>
                </div>
                <div style={{ marginTop: '12px', fontSize: '14px', color: '#2C3B35' }}>18 kg on hand</div>
              </div>
            </div>
            <p
              className="d"
              style={{
                margin: '0',
                fontSize: '28px',
                lineHeight: '1.15',
                fontWeight: '600',
                maxWidth: '380px',
              }}
            >
              Two batches need attention today.
            </p>
          </div>
          <div style={{ flex: '1 1 520px', minWidth: '0', boxSizing: 'border-box', padding: '16px' }}>
            <div
              style={{
                minHeight: '968px',
                boxSizing: 'border-box',
                background: '#fff',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '48px 24px',
              }}
            >
              <div style={{ width: '100%', maxWidth: '400px' }}>
                <h1
                  className="d"
                  style={{ margin: '0', fontSize: '36px', lineHeight: '1.05', fontWeight: '600' }}
                >
                  Log in to SmartStock
                </h1>
                <p style={{ margin: '14px 0 0', fontSize: '16px', lineHeight: '1.5', color: '#55645E' }}>
                  Use the email and password your administrator gave you.
                </p>
                <form
                  style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}
                  action="Dashboard.dc.html"
                >
                  <div>
                    <label
                      htmlFor="email"
                      style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}
                    >
                      Email
                    </label>{' '}
                    <input
                      id="email"
                      className="field"
                      type="email"
                      placeholder="aina@segarmart.example"
                      autoComplete="username"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}
                    >
                      Password
                    </label>{' '}
                    <input
                      id="password"
                      className="field"
                      type="password"
                      placeholder="At least 8 characters"
                      autoComplete="current-password"
                    />
                  </div>
                  <Link className="btn" to="/dashboard" style={{ marginTop: '8px' }}>
                    Log in
                  </Link>
                </form>
                <p style={{ margin: '28px 0 0', fontSize: '14px', lineHeight: '1.55', color: '#55645E' }}>
                  Too many wrong attempts are rate-limited by the sign-in service. Wait a few minutes and try
                  again.
                </p>
                <p
                  style={{
                    margin: '20px 0 0',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    background: '#EEF1EF',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    color: '#2C3B35',
                  }}
                >
                  This is a prototype. Press Log in to continue as an inventory manager.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
