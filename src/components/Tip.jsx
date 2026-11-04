import { useEffect, useState } from 'react';

// Small tooltip that follows the pointer over any element with a data-tip attribute (charts, rings).
export default function Tip() {
  const [tip, setTip] = useState({ on: false, text: '', x: 0, y: 0 });
  useEffect(() => {
    const move = (e) => {
      const t = e.target.closest && e.target.closest('[data-tip]');
      if (!t) return setTip((s) => (s.on ? { ...s, on: false } : s));
      setTip({ on: true, text: t.dataset.tip, x: e.clientX + 12, y: Math.max(8, e.clientY - 38) });
    };
    const hide = () => setTip((s) => (s.on ? { ...s, on: false } : s));
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerdown', hide);
    return () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerdown', hide); };
  }, []);
  return <div className={'tip' + (tip.on ? ' on' : '')} id="tip" style={{ left: Math.min(tip.x, window.innerWidth - 240), top: tip.y }}>{tip.text}</div>;
}
