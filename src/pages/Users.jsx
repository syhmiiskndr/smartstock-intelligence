import { Fragment } from 'react';
import { DCLogic } from '../lib/DCLogic';
import Sidebar from '../components/Sidebar';
import './Users.css';

export const path = '/users';
export const title = 'Users';

export default class Users extends DCLogic {
  renderVals() {
    const off = (this.state && this.state.off) || {};
    const base = [
      {
        id: 'u1',
        name: 'Muhammad Syahmi Iskandar',
        email: 'syahmi1170@gmail.com',
        role: 'Inventory manager',
        initials: 'SI',
        last: 'Today, 07:58',
        admin: false,
        start: false,
      },
      {
        id: 'u2',
        name: 'Muhammad Haikal',
        email: 'haikal77@gmail.com',
        role: 'Administrator',
        initials: 'MH',
        last: 'Yesterday, 18:20',
        admin: true,
        start: false,
      },
      {
        id: 'u3',
        name: 'Nur Amin',
        email: 'amin123@gmail.com',
        role: 'Staff',
        initials: 'NA',
        last: 'Today, 07:51',
        admin: false,
        start: false,
      },
      {
        id: 'u4',
        name: 'Tanusha',
        email: 'tanusha321@gmail.com',
        role: 'Staff',
        initials: 'TK',
        last: 'Today, 08:02',
        admin: false,
        start: false,
      },
      {
        id: 'u5',
        name: 'Muhammad Alif',
        email: 'alif987@gmail.com',
        role: 'Staff',
        initials: 'MA',
        last: 'Today, 07:49',
        admin: false,
        start: false,
      },
      {
        id: 'u6',
        name: 'Syaza Irdini',
        email: 'syaza70@gmail.com',
        role: 'Staff',
        initials: 'SI',
        last: '2 Sep',
        admin: false,
        start: true,
      },
    ];
    const users = base.map((u) => {
      const isOff = u.id in off ? off[u.id] : u.start;
      return {
        name: u.name,
        email: u.email,
        role: u.role,
        initials: u.initials,
        last: u.last,
        active: !isOff,
        inactive: isOff,
        canDeactivate: !isOff && !u.admin,
        canReactivate: isOff,
        locked: u.admin && !isOff,
        deactivate: () => this.setState({ off: Object.assign({}, off, { [u.id]: true }) }),
        reactivate: () => this.setState({ off: Object.assign({}, off, { [u.id]: false }) }),
      };
    });
    const activeCount = users.filter((u) => u.active).length;
    return {
      users,
      summary: activeCount + ' active users and ' + (users.length - activeCount) + ' deactivated.',
    };
  }

  template(v) {
    const { summary, users } = v;
    return (
      <div className="pg-users">
        <div className="app-shell" style={{ minHeight: '1000px', display: 'flex', flexWrap: 'wrap', background: '#EEF1EF' }}>
          <div className="app-side" style={{ flex: '0 0 248px' }}>
            <Sidebar active="users" />
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
                    Users
                  </h1>
                  <p style={{ margin: '8px 0 0', fontSize: '15.5px', color: '#55645E' }}>{summary}</p>
                </div>
                <button className="btn">Add user</button>
              </div>
              <div
                style={{
                  marginTop: '28px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '40px',
                  alignItems: 'flex-start',
                }}
              >
                <section style={{ flex: '1.8 1 600px', minWidth: '0', overflowX: 'auto' }}>
                  <div style={{ minWidth: '640px' }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '44px minmax(180px,1.6fr) 140px 120px 130px 110px',
                        gap: '14px',
                        padding: '12px 0',
                        borderBottom: '1px solid #14231E',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#55645E',
                      }}
                    >
                      <span></span>
                      <span>Name</span>
                      <span>Role</span>
                      <span>Status</span>
                      <span>Last login</span>
                      <span></span>
                    </div>
                    {users.map((u, _i) => (
                      <Fragment key={_i}>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '44px minmax(180px,1.6fr) 140px 120px 130px 110px',
                            gap: '14px',
                            alignItems: 'center',
                            padding: '14px 0',
                            borderBottom: '1px solid #E7ECE9',
                            fontSize: '14.5px',
                          }}
                        >
                          <span
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: '#E3E8E5',
                              color: '#14231E',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '13px',
                              fontWeight: '600',
                            }}
                          >
                            {u.initials}
                          </span>{' '}
                          <span>
                            <span style={{ display: 'block', fontWeight: '600' }}>{u.name}</span>
                            <span style={{ display: 'block', fontSize: '13px', color: '#55645E' }}>
                              {u.email}
                            </span>
                          </span>{' '}
                          <span>
                            <span
                              style={{
                                display: 'inline-flex',
                                padding: '3px 10px',
                                borderRadius: '999px',
                                background: '#E7ECE9',
                                color: '#2C3B35',
                                fontSize: '12.5px',
                                fontWeight: '600',
                              }}
                            >
                              {u.role}
                            </span>
                          </span>{' '}
                          <span>
                            {u.active ? (
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
                                  Active
                                </span>
                              </>
                            ) : null}
                            {u.inactive ? (
                              <>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    padding: '3px 10px',
                                    borderRadius: '999px',
                                    background: '#E7ECE9',
                                    color: '#2C3B35',
                                    fontSize: '12.5px',
                                    fontWeight: '600',
                                  }}
                                >
                                  Deactivated
                                </span>
                              </>
                            ) : null}
                          </span>{' '}
                          <span style={{ color: '#55645E' }}>{u.last}</span>{' '}
                          <span>
                            {u.canDeactivate ? (
                              <>
                                <button className="link" onClick={u.deactivate}>
                                  Deactivate
                                </button>
                              </>
                            ) : null}
                            {u.canReactivate ? (
                              <>
                                <button className="link" onClick={u.reactivate}>
                                  Reactivate
                                </button>
                              </>
                            ) : null}
                            {u.locked ? (
                              <>
                                <span style={{ fontSize: '13px', color: '#55645E', lineHeight: '1.3' }}>
                                  Last administrator
                                </span>
                              </>
                            ) : null}
                          </span>
                        </div>
                      </Fragment>
                    ))}
                    <p
                      style={{
                        margin: '16px 0 0',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        color: '#55645E',
                        maxWidth: '560px',
                      }}
                    >
                      Deactivated users cannot log in, but their history stays. The last active administrator
                      cannot be deactivated.
                    </p>
                  </div>
                </section>
                <aside
                  style={{
                    flex: '1 1 320px',
                    maxWidth: '420px',
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
                    What each role can do
                  </h2>
                  <div style={{ marginTop: '14px', fontSize: '14.5px', lineHeight: '1.5' }}>
                    <div style={{ padding: '14px 0', borderTop: '1px solid #DDE3DF' }}>
                      <div style={{ fontWeight: '600' }}>Administrator</div>
                      <div style={{ color: '#55645E' }}>
                        Manages users, categories, suppliers and alert rules. Reads the audit log.
                      </div>
                    </div>
                    <div style={{ padding: '14px 0', borderTop: '1px solid #DDE3DF' }}>
                      <div style={{ fontWeight: '600' }}>Inventory manager</div>
                      <div style={{ color: '#55645E' }}>
                        Manages products and batches, approves adjustments, and sees every report and
                        inspection.
                      </div>
                    </div>
                    <div
                      style={{
                        padding: '14px 0',
                        borderTop: '1px solid #DDE3DF',
                        borderBottom: '1px solid #DDE3DF',
                      }}
                    >
                      <div style={{ fontWeight: '600' }}>Staff</div>
                      <div style={{ color: '#55645E' }}>
                        Records stock-in and stock-out, runs inspections, and sees their own inspection
                        history.
                      </div>
                    </div>
                  </div>
                  <p style={{ margin: '16px 0 0', fontSize: '13.5px', lineHeight: '1.5', color: '#55645E' }}>
                    New users get a temporary password and must change it the first time they log in.
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
