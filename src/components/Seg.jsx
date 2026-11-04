import { useLayoutEffect, useRef, useState } from 'react';

// iOS-style segmented control with a sliding thumb.
// options = [{ value, label }]
export default function Seg({ value, options, onChange, label }) {
  const ref = useRef(null);
  const [thumb, setThumb] = useState({ w: 0, x: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      const b = ref.current && ref.current.querySelector('[aria-pressed=true]');
      setThumb(b && b.offsetWidth ? { w: b.offsetWidth, x: b.offsetLeft - 2 } : { w: 0, x: 0 });
    };
    measure();
    window.addEventListener('resize', measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    return () => window.removeEventListener('resize', measure);
  }, [value, options.map((o) => o.label).join('|')]);

  return (
    <div className="seg" role="group" aria-label={label} ref={ref}>
      <i className="thumb" style={{ width: thumb.w, transform: `translateX(${thumb.x}px)` }} />
      {options.map((o) => (
        <button key={o.value} aria-pressed={o.value === value} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}
