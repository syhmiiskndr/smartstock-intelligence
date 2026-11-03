/* Scene "cost" – one file per page. Receives the shared engine API and returns its render functions. */
export default function costScene(api) {
  const { seriesN, S, L, dateStr, rm0, P, pn, sh } = api;

  function costScene2(){
   const days=seriesN(S.range),n=days.length,cost=days[n-1],prev=days.slice(0,-1),avg=prev.reduce((a,b)=>a+b,0)/prev.length,pct=Math.round((cost/avg-1)*100);
   const W=560,H=170,gap=n>7?4:12,bw=(W-gap*(n-1))/n,max=Math.max(...days)*1.2;
   const lab=i=>i===n-1?L('Today','Hari ini'):dateStr(i-(n-1));
   const bars=days.map((v,i)=>{const h=v/max*H,x=i*(bw+gap),d=Math.round((v/avg-1)*100);
    const showLab=n===7||i%5===0||i===n-1;
    return `<rect x="${x}" y="${H-h}" width="${bw}" height="${h}" rx="${Math.min(10,bw/3)}" fill="${i===n-1?'var(--accent)':'var(--accent-soft)'}" data-tip="${lab(i)}: ${rm0(v)} (${d>=0?'+':''}${d}% ${L('vs average','dari purata')})"/>${showLab?`<text x="${x+bw/2}" y="${H+18}" text-anchor="${i===n-1?'end':'middle'}">${n===7?(i===n-1?L('Today','Hari ini'):new Date(Date.now()-(n-1-i)*864e5).toLocaleDateString(S.lang==='ms'?'ms-MY':'en-GB',{weekday:'short'})):(i===n-1?L('Today','Hari ini'):dateStr(i-(n-1)))}</text>`:''}`}).join('');
   const ay=H-avg/max*H;
   const vals=p=>S.use[p.id]*p.cost,top=[...P].sort((a,b)=>vals(b)-vals(a)).slice(0,4);
   const drv=top.map(p=>`<div class="drv"><span style="text-align:left;color:var(--ink)">${pn(p)}</span><i><u style="width:${(vals(p)/vals(top[0])*100).toFixed(0)}%"></u></i><span>${rm0(vals(p))}</span></div>`).join('');
   return `${sh(L('Cost','Kos'),L(`${n-1}-day average ${rm0(avg)}`,`purata ${n-1} hari ${rm0(avg)}`))}
   <div class="bignum" id="bn">${rm0(cost)}</div>
   <span class="pill ${pct>10?'warn':'ok'}">${pct>=0?'+':''}${pct}% ${L('vs average','dari purata')}</span>
   <div class="cost-tools"><div class="seg"><button data-range="7" aria-pressed="${S.range===7}">7D</button><button data-range="30" aria-pressed="${S.range===30}">30D</button></div><span class="say" style="margin:0">${L('Hover a bar for details','Letak kursor pada bar untuk butiran')}</span></div>
   <svg class="chart" viewBox="0 0 ${W} ${H+26}" role="img" aria-label="${L('Daily cost','Kos harian')}"><line x1="0" x2="${W}" y1="${ay}" y2="${ay}" stroke="var(--ink-2)" stroke-dasharray="4 5" opacity=".6"/><text x="${W}" y="${ay-6}" text-anchor="end">${L('average','purata')}</text>${bars}</svg>
   <h2 class="h2">${L('Biggest cost drivers today','Pemacu kos terbesar hari ini')}</h2><div class="drivers">${drv}</div>
   <span class="say" style="margin-top:14px">${L('ask','tanya')} <q>${L('Why did costs rise?','Kenapa kos naik?')}</q></span>`;
  }

  return { cost:costScene2 };
}
