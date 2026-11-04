import { P, L, pn, useStore } from '../store/store';

export const path = '/people';
export const title = 'People · SmartStock';

const TEAM = [['Syahmi', 'Admin', 1], ['Syafiq', 'Staff', 1], ['Siti', 'Staff', 0], ['Hakim', 'Staff', 1]];
const SUPPLIERS = [['Segar Jaya', ['Ayam', 'Telur', 'Bawang']], ['Mill Sentosa', ['Tepung', 'Beras', 'Minyak']], ['Ladang Hijau', ['Susu', 'Pisang']]];

export default function People() {
  useStore();
  const role = (r) => (r === 'Staff' ? L('Staff', 'Staf') : r);
  const name = (n) => pn(P.find((p) => p.name === n));
  return (
    <>
      <div className="sh"><h1 className="h1">{L('People', 'Orang')}</h1><p className="meta">{L('3 online now', '3 aktif sekarang')}</p></div>
      <h2 className="h2">{L('Team', 'Pasukan')}</h2>
      <div className="cluster">
        {TEAM.map(([n, r, on]) => <div className="av" key={n}><i className={on ? 'on' : ''}>{n[0]}</i>{n}<small>{role(r)}</small></div>)}
      </div>
      <h2 className="h2">{L('Suppliers', 'Pembekal')}</h2>
      <div className="cluster">
        {SUPPLIERS.map(([n, items]) => (
          <div className="sup" key={n}><b>{n}</b><div className="row" style={{ margin: 0 }}>{items.map((i) => <span className="pill" key={i}>{name(i)}</span>)}</div></div>
        ))}
      </div>
    </>
  );
}
