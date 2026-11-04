import { useState } from 'react';
import { S, L, useStore, enter, setLang } from '../store/store';
import { Icon } from '../lib/icons';

// Lock-screen style sign in. Shown whenever nobody is signed in.
export default function LoginScreen() {
  useStore();
  const [leaving, setLeaving] = useState(false);
  const d = new Date();
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const date = d.toLocaleDateString(S.lang === 'ms' ? 'ms-MY' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  const pick = (role) => {
    setLeaving(true);
    setTimeout(() => { setLeaving(false); enter(role); }, 600);
  };
  return (
    <div id="login" className={leaving ? 'leave' : ''} hidden={!!S.user && !leaving}>
      <div><h1 className="lg-time">{time}</h1><p className="lg-date">{date}</p></div>
      <div className="lg-users">
        <button className="lg-u" data-enter="admin" onClick={() => pick('admin')}><i style={{ background: 'linear-gradient(145deg,#5AC8FA,#007AFF)' }}>S</i><b>Syahmi</b><span>Admin</span></button>
        <button className="lg-u" data-enter="staff" onClick={() => pick('staff')}><i style={{ background: 'linear-gradient(145deg,#4CD964,#1FAE4B)' }}>F</i><b>Syafiq</b><span>{L('Staff', 'Staf')}</span></button>
      </div>
      <div className="lg-foot">
        <span>{L('Choose an account to sign in to Dapur Syahmi', 'Pilih akaun untuk log masuk ke Dapur Syahmi')}</span>
        <button className="tbtn" onClick={() => setLang(S.lang === 'ms' ? 'en' : 'ms')}><Icon name="mic" size={16} /><span>{S.lang === 'ms' ? 'Bahasa Melayu' : 'English'}</span></button>
      </div>
    </div>
  );
}
