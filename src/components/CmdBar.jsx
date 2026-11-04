import { useEffect, useRef, useState } from 'react';
import { S, L, useStore, examples, submitCmd, speakSim } from '../store/store';

// Typed command bar (fallback when the microphone is not available).
export default function CmdBar() {
  useStore();
  const { open, mounted, note } = S.ui.cmd;
  const [text, setText] = useState('');
  const input = useRef(null);
  useEffect(() => {
    if (open) setTimeout(() => input.current && input.current.focus({ preventScroll: true }), 50);
  }, [open]);
  return (
    <form
      id="cmd"
      className={'cmd' + (open ? ' show' : '')}
      hidden={!mounted}
      onSubmit={(e) => {
        e.preventDefault();
        const v = text.trim();
        if (!v) return;
        setText('');
        submitCmd(v);
      }}
    >
      <p className="note" id="cmd-note">{note}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input id="cmd-input" ref={input} autoComplete="off" value={text} onChange={(e) => setText(e.target.value)} placeholder={L('e.g. open product stock', 'cth: buka stok produk')} aria-label={L('Command', 'Arahan')} />
        <button className="btn primary" type="submit">{L('Send', 'Hantar')}</button>
      </div>
      <div className="p-chips" id="cmd-chips" style={{ margin: 0 }}>
        {examples().map((x) => <button key={x} type="button" className="chip" onClick={() => speakSim(x)}>{x}</button>)}
      </div>
    </form>
  );
}
