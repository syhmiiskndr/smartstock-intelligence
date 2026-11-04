import { useRef, useState } from 'react';
import { S, L, NAV_ITEMS, pending, go, orbClick, useStore } from '../store/store';
import { DOCK_COLORS } from '../store/data';
import { Icon } from '../lib/icons';

// macOS-style dock (replaces the sidebar) with magnification, plus the voice orb.
export default function Dock() {
  useStore();
  const dock = useRef(null);
  const [bounce, setBounce] = useState(null);
  const pend = pending().length;

  const magnify = (e) => {
    if (e.pointerType === 'touch') return;
    dock.current.querySelectorAll('.dk,#orb').forEach((el) => {
      const r = el.getBoundingClientRect();
      const d = e.clientX - (r.left + r.width / 2);
      const s = 1 + 0.66 * Math.exp(-(d * d) / (2 * 58 * 58));
      el.style.scale = s.toFixed(3);
      el.style.translate = `0 ${(-(s - 1) * 8).toFixed(1)}px`;
    });
  };
  const reset = () => dock.current.querySelectorAll('.dk,#orb').forEach((el) => { el.style.scale = ''; el.style.translate = ''; });

  return (
    <nav className="dock" aria-label="Main" ref={dock} onPointerMove={magnify} onPointerLeave={reset}>
      <div id="dockitems">
        {NAV_ITEMS().map(([id, en, ms, icon]) => {
          const g = DOCK_COLORS[id];
          return (
            <button
              key={id}
              className={'dk ' + (S.scene === id ? 'on ' : '') + (bounce === id ? 'bounce' : '')}
              data-nav={id}
              data-label={L(en, ms)}
              aria-label={L(en, ms)}
              style={{ background: `linear-gradient(160deg,${g[0]},${g[1]})` }}
              onAnimationEnd={() => setBounce(null)}
              onClick={() => { setBounce(id); go(id); }}
            >
              <Icon name={icon} size={26} />
              {id === 'ops' && pend ? <u>{pend}</u> : null}
            </button>
          );
        })}
      </div>
      <i className="dsep" />
      <button id="orb" data-state={S.ui.orb} aria-label={L('Speak', 'Cakap')} onClick={orbClick}>
        <span className="mic"><Icon name="mic" size={30} /></span><span className="wave" /><span className="spin" />
      </button>
    </nav>
  );
}
