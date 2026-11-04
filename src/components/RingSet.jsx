import { Fragment } from 'react';

// Concentric Activity-style rings. vals = [{ k: 'stock' | 'fresh' | 'cover', v: 0-100, crit: boolean }]
export default function RingSet({ vals, size, sw, delay = 0 }) {
  const c = size / 2;
  return (
    <svg className="ringsvg" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {vals.map((r, i) => {
        const rad = c - sw / 2 - 1 - i * (sw + 3);
        const cr = r.crit ? ' c-crit' : '';
        return (
          <Fragment key={i}>
            <circle className={`t c-${r.k}${cr}`} cx={c} cy={c} r={rad} strokeWidth={sw} pathLength="100" strokeDasharray="100 0" />
            <circle className={`p c-${r.k}${cr}`} cx={c} cy={c} r={rad} strokeWidth={sw} pathLength="100" strokeDasharray={`${r.v.toFixed(1)} 100`} style={{ animationDelay: `${delay + i * 130}ms` }} />
          </Fragment>
        );
      })}
    </svg>
  );
}
