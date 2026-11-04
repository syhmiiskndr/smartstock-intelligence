import { S, L, useStore, hidePanel, speakSim } from '../store/store';
import { Icon } from '../lib/icons';

// Floating answer card: questions, confirmations, results.
export default function Panel() {
  useStore();
  const o = S.ui.panel;
  const run = (a) => { if (a.say) speakSim(a.say); else if (a.fn) a.fn(); };
  return (
    <div id="panel" className={'panel ' + (o && o.show ? 'show ' : '') + ((o && o.tone) || '')} hidden={!o}>
      {o && (
        <>
          <div className="p-top">
            <span className="p-state">{o.state || ''}</span>
            <button className="p-x" aria-label={L('Close', 'Tutup')} onClick={hidePanel}><Icon name="x" size={18} /></button>
          </div>
          {o.said && <p className="p-say">“{o.said}”</p>}
          {o.title && <h3>{o.title}</h3>}
          {o.big && <div className="p-big">{o.big}</div>}
          {o.body && <p className="p-body">{o.body}</p>}
          {o.facts && <div className="facts">{o.facts.map(([a, b]) => <div key={a}><b>{b}</b><span>{a}</span></div>)}</div>}
          {o.node}
          {o.actions && o.actions.length > 0 && (
            <div className="p-actions">
              {o.actions.map((a, i) => <button key={i} className={`btn ${a.kind || ''} ${o.bigBtn ? 'big' : ''}`} style={a.kind === 'ok' ? { flex: 1 } : undefined} onClick={() => run(a)}>{a.label}</button>)}
            </div>
          )}
          {o.chips && o.chips.length > 0 && (
            <div className="p-chips">{o.chips.map((c, i) => <button key={i} className="chip" onClick={() => run(c)}>{c.label}</button>)}</div>
          )}
        </>
      )}
    </div>
  );
}
