/* Scene "fresh" – one file per page. Receives the shared engine API and returns its render functions. */
export default function freshScene(api) {
  const { S, L, sayHint, sh, rm0, esc } = api;

  function bananaSvg(bad){
   const f=bad?'#7A5A2B':'#F2C94C', s=bad?'#4C3516':'#B8901A';
   return `<svg viewBox="0 0 200 140" width="62%" aria-hidden="true"><path d="M22 60C40 112 118 126 180 52c-24 36-84 44-132-6z" fill="${f}" stroke="${s}" stroke-width="4" stroke-linejoin="round"/>${bad?'<circle cx="80" cy="92" r="6" fill="#3a2810"/><circle cx="116" cy="88" r="5" fill="#3a2810"/><circle cx="140" cy="74" r="4" fill="#3a2810"/>':''}<path d="M22 60l-8-10" stroke="${s}" stroke-width="6" stroke-linecap="round"/></svg>`;
  }

  function freshScene(){
   const F=S.fresh, r=F.res, c=2*Math.PI*30;
   const wt=S.waste.reduce((a,w)=>a+w.amt,0), mx=Math.max(...S.waste.map(w=>w.amt));
   const lbl=r?(r.bad?L('Spoiled','Rosak'):L('Fresh','Segar')):'';
   const res=r?`<div class="result"><svg width="76" height="76" viewBox="0 0 76 76" style="transform:rotate(-90deg)"><circle cx="38" cy="38" r="30" fill="none" stroke="var(--surface-2)" stroke-width="8"/><circle cx="38" cy="38" r="30" fill="none" stroke="${r.bad?'var(--bad)':'var(--ok)'}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(r.conf/100*c).toFixed(1)} ${c.toFixed(1)}"/></svg><div><b style="color:${r.bad?'var(--bad)':'var(--ok)'}">${lbl} ${r.conf}%</b><span class="say">${L('An indicator only, not a food-safety certification.','Indikator sahaja, bukan pengesahan keselamatan makanan.')}</span></div></div>
    ${r.bad?`<div class="p-chips"><button class="btn primary" data-say="${L('Waste 2 kg banana','Buang 2 kilo pisang')}">${L('Log 2 kg as waste','Rekod sisa 2 kg')}</button></div>`:''}`:`<p class="meta" style="margin-top:14px">${L('Place the banana in the frame, then scan.','Letak pisang dalam bingkai, tekan imbas.')}${sayHint(L('Scan banana','Imbas pisang'))}</p>`;
   return `${sh(L('Fresh','Segar'),L(`waste this week ${rm0(wt)}`,`sisa minggu ini ${rm0(wt)}`))}
   <div class="fresh"><div><div class="finder ${F.scanning?'scanning':''}"><i class="fc f1"></i><i class="fc f2"></i><i class="fc f3"></i><i class="fc f4"></i>${bananaSvg(r&&r.bad)}</div>
    <div class="row"><button class="btn primary big" data-scan="1" aria-label="${L('Scan','Imbas')}" ${F.scanning?'disabled':''}>${F.scanning?L('Scanning…','Mengimbas…'):L('Scan','Imbas')}</button></div></div>
    <div>${res}<h2 class="h2" style="margin-top:${r?22:6}px">${L('Waste by cost (RM)','Sisa ikut kos (RM)')}</h2>
    <div class="bubbles">${S.waste.map(w=>{const d=46+w.amt/mx*54;return `<span class="bub" style="width:${d}px;height:${d}px">${esc(w.n)}<br>${Math.round(w.amt)}</span>`}).join('')}</div></div></div>
   <p class="demo-note">${L('Demo mode. Production model: Google Teachable Machine (banana, fresh or spoiled).','Mod demo. Model sebenar: Google Teachable Machine (pisang, segar atau rosak).')}</p>`;
  }

  return { fresh:freshScene };
}
