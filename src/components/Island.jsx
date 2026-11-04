import { S, L, useStore, openCmd, closeCmd } from '../store/store';
import { Icon } from '../lib/icons';

// Dynamic Island: shows listening and processing states, rotating hints and live alerts.
export default function Island() {
  useStore();
  const { orb, hint, hintLive, island, cmd } = S.ui;
  const n = island.note;
  return (
    <div
      id="island"
      data-state={orb}
      data-mode={island.mode}
      role="status"
      aria-live="polite"
      title={L('Tap to type a command', 'Tekan untuk taip arahan')}
      onClick={() => { if (orb === 'idle') (cmd.open ? closeCmd() : openCmd()); }}
    >
      <span className="dot" />
      <span className="isl-wave" aria-hidden="true"><i /><i /><i /><i /><i /></span>
      <span className={'hint' + (hintLive ? ' live' : '')} id="hint">{hint}</span>
      <div id="isl-note">
        <i id="isl-ic" className={n ? n.tone : ''}>{n && <Icon name={n.tone === 'ok' ? 'check' : 'alert'} size={16} />}</i>
        <div style={{ minWidth: 0 }}><b id="isl-t">{n ? n.title : ''}</b><span id="isl-b">{n ? n.body : ''}</span></div>
      </div>
    </div>
  );
}
