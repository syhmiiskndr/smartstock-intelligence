/* Scene "stock" – one file per page. Receives the shared engine API and returns its render functions. */
export default function stockScene(api) {
  const { S, P, ringMetrics, itemTone, L, eta, clamp, esc, pn, fq, U, rm0, stockValue, sh } = api;

  function stockScene2(){
   const f=S.filter,isLow=p=>p.qty<=p.reorder,isExp=p=>p.exp<=3;
   const ln=P.filter(isLow).length,en=P.filter(isExp).length;
   const items=P.map((p,i)=>{
    const m=ringMetrics(p),tone=itemTone(p),dim=f==='low'?!isLow(p):f==='exp'?!isExp(p):false;
    const st=isLow(p)?L(`Low · ${eta(p)} left`,`Rendah · ${eta(p)}`):isExp(p)?L(`Expires in ${p.exp} days`,`Luput ${p.exp} hari`):L('Healthy','Baik');
    const tp=m.map(r=>`${r.label} ${r.val}`).join('  ·  ');
    const pct=clamp(p.qty/p.cap*100,3,100),mn=clamp(p.reorder/p.cap*100,0,100),fdot=p.exp<=3?'bad':p.exp<=7?'warn':'ok';
    return `<button class="rg ${dim?'dim':''} ${S.pulse===p.id?'pulse':''}" data-jar="${p.id}" data-tip="${esc(tp)}" aria-label="${pn(p)} ${fq(p.qty)} ${U(p.unit)}"><span class="rg-top"><span class="nm">${pn(p)}</span><span class="qv"><b>${fq(p.qty)}</b><small>${U(p.unit)}</small></span></span><span class="lvbar ${tone}"><i style="--w:${pct.toFixed(1)}%;animation-delay:${i*60}ms"></i><u style="left:${mn.toFixed(1)}%"></u></span><span class="rg-bot"><span class="st ${tone}">${st}</span><span class="fd ${fdot}" title="${L('Freshness','Kesegaran')}"><i></i>${p.exp>=14?L('Fresh','Segar'):p.exp+L('d','h')}</span></span></button>`}).join('');
   S.pulse=null;
   const meta=S.role==='admin'?`${P.length} ${L('items','item')} · ${rm0(stockValue())}`:`${P.length} ${L('items','item')}`;
   return `${sh(L('Stock','Stok'),meta)}
   <div class="row" style="align-items:center;justify-content:space-between;margin-top:18px"><div class="seg" role="group" aria-label="${L('Filter','Tapis')}">
    <button data-filter="all" aria-pressed="${f==='all'}">${L('All','Semua')}</button><button data-filter="low" aria-pressed="${f==='low'}">${L('Low','Rendah')} ${ln}</button><button data-filter="exp" aria-pressed="${f==='exp'}">${L('Expiring','Luput')} ${en}</button></div>
    <div class="legend" style="margin:0"><span><i style="background:var(--r-stock)"></i>${L('Healthy','Baik')}</span><span><i style="background:var(--r-cover)"></i>${L('Expiring','Hampir luput')}</span><span><i style="background:var(--r-crit)"></i>${L('Low stock','Stok rendah')}</span></div></div>
   <div class="rings" style="margin-top:18px">${items}</div>
   <p class="demo-note">${L('The bar shows stock level. The tick marks the minimum. Tap an item for details.','Bar tunjuk paras stok. Tanda ialah minimum. Tekan item untuk butiran.')}</p>`;
  }

  return { stock:stockScene2 };
}
