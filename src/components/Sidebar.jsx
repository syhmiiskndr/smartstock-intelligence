import { Link } from 'react-router-dom';
import { DCLogic } from '../lib/DCLogic';
import './Sidebar.css';

// Each group is a heading plus its links. "adminOnly" links are for the Admin / Manager role.
const GROUPS = [
  { items: [{ key: 'dashboard', to: '/dashboard', label: 'Dashboard', icon: 'dashboard' }] },
  {
    heading: 'Inventory',
    items: [
      { key: 'products', to: '/products', label: 'Products', icon: 'box' },
      { key: 'stock', to: '/stock', label: 'Stock in and out', icon: 'swap' },
      { key: 'adjustments', to: '/adjustments', label: 'Adjustments', icon: 'sliders' },
      { key: 'waste', to: '/waste', label: 'Waste', icon: 'trash' },
      { key: 'alerts', to: '/alerts', label: 'Alerts', icon: 'bell', badge: '3' },
    ],
  },
  {
    heading: 'Inspection',
    items: [
      { key: 'inspect', to: '/inspect', label: 'Inspect', icon: 'scan' },
      { key: 'history', to: '/history', label: 'History', icon: 'clock' },
    ],
  },
  { heading: 'Insights', items: [{ key: 'reports', to: '/reports', label: 'Reports', icon: 'chart' }] },
  {
    heading: 'Administration',
    items: [
      { key: 'users', to: '/users', label: 'Users', icon: 'users' },
      { key: 'settings', to: '/settings', label: 'Settings', icon: 'gear' },
    ],
  },
];

const ICONS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  box: (
    <>
      <path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5z" />
      <path d="M3 7.5L12 12l9-4.5M12 12v9" />
    </>
  ),
  swap: <path d="M7 4v14M7 18l-3-3M7 18l3-3M17 20V6M17 6l-3 3M17 6l3 3" />,
  sliders: (
    <>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="8" cy="17" r="2" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M10 7V4.5h4V7M6.5 7l1 13h9l1-13" />
      <path d="M10 11v5M14 11v5" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
      <path d="M10 21h4" />
    </>
  ),
  scan: (
    <>
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V4M4 20h16" />
      <path d="M8 16v-4M12 16V8M16 16v-6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6M18 14.4c1.9.8 3 2.6 3 5.6" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
    </>
  ),
};

function Icon({ name }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

function Logo() {
  return (
    <>
      <svg width="24" height="24" viewBox="0 0 26 26" aria-hidden="true">
        <path
          d="M4 2h18a2 2 0 0 1 2 2v12.2a2 2 0 0 1-.7 1.5l-9.3 7.6a2 2 0 0 1-2.6 0L2.7 17.7A2 2 0 0 1 2 16.2V4a2 2 0 0 1 2-2z"
          fill="#14231E"
        />
        <circle cx="13" cy="8.5" r="2.6" fill="#EEF1EF" />
      </svg>
      <span className="sb-word">SmartStock</span>
    </>
  );
}

export default class Sidebar extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  setOpen(open) {
    this.setState({ open });
    // Stop the page behind the drawer from scrolling while it is open.
    document.body.style.overflow = open ? 'hidden' : '';
  }

  componentWillUnmount() {
    document.body.style.overflow = '';
  }

  template() {
    const active = this.props.active || 'dashboard';
    const open = this.state.open;
    return (
      <div className="pg-sidebar">
        <header className="sb-top">
          <Link to="/" className="sb-brand" aria-label="SmartStock home">
            <Logo />
          </Link>
          <button
            type="button"
            className="sb-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="sb-panel"
            onClick={() => this.setOpen(!open)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </header>
        <div className={'sb-overlay' + (open ? ' open' : '')} onClick={() => this.setOpen(false)} />
        <aside id="sb-panel" className={'sb-panel' + (open ? ' open' : '')}>
          <Link to="/" className="sb-brand sb-brand-desktop" aria-label="SmartStock home">
            <Logo />
          </Link>
          <nav className="sb-nav" aria-label="App">
            {GROUPS.map((g, gi) => (
              <div key={gi} className="sb-group">
                {g.heading ? <div className="sb-heading">{g.heading}</div> : null}
                {g.items.map((it) => (
                  <Link
                    key={it.key}
                    to={it.to}
                    className={'sb-link' + (it.key === active ? ' on' : '')}
                    aria-current={it.key === active ? 'page' : undefined}
                  >
                    <Icon name={it.icon} />
                    {it.label}
                    {it.badge ? <span className="sb-badge">{it.badge}</span> : null}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
          <div className="sb-user">
            <span className="sb-avatar">SI</span>
            <div className="sb-who">
              <div className="sb-name">Syahmi Iskandar</div>
              <div className="sb-role">Admin / Manager</div>
            </div>
            <Link to="/login" className="sb-out">
              Log out
            </Link>
          </div>
        </aside>
      </div>
    );
  }
}
