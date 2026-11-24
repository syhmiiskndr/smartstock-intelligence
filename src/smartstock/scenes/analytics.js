/* Scene "analytics" – owner only (Intelligence layer). Interactive: metric tabs, 7/30/90 range,
   previous-period overlay, 7-day forecast, hover/touch crosshair, product focus, stockout runway,
   usage heatmap, supplier scorecard. Click and hover handlers live in engine.js (data-an-*).
   Numbers come from the database (stock_transactions); the shape of the trend lines is computed here. */
export default function analyticsScene(api) {
  const { S, L, P, pn, rm0, fq, U, esc, ic, sh, dateStr, costToday, costAvg, stockValue, clamp, eta, runDays, aiTag, series } = api;

  const leadOf=n=>{const v=(S.vendors||[]).find(x=>x.name===n);return v?v.lead:2};
  const COL=['#0A84FF','#34C759','#FF9F0A','#AF52DE','#FF375F','#5AC8FA','#FFD60A','#8E8E93'];
  const sum=a=>a.reduce((x,y)=>x+y,0);
  const chg=(a,b)=>b>0?Math.round((a/b-1)*100):0; // % change, 0 when there is nothing to compare with
  const dayOf=off=>{const d=new Date();d.setDate(d.getDate()+off);return d.getDay()};

  const base={
   cost:{en:'Cost',ms:'Kos',unit:'RM',good:'down'},
   usage:{en:'Usage',ms:'Guna',unit:'',good:''},
   waste:{en:'Waste',ms:'Sisa',unit:'RM',good:'down'},
   stock:{en:'Stock value',ms:'Nilai stok',unit:'RM',good:''}
  };
  const fmt=(m,v)=>base[m].unit==='RM'?rm0(v):Math.round(v).toLocaleString('en-US')+' '+L('units','unit');
  /* every series is real: it comes from the database through api.series */
  const seriesFor=(m,n,cat,prev)=>series(m,n,{cat,shift:prev?n:0});
  /* weekday pattern learned from the series itself (needs 14+ days; shrunk toward 1 when samples are few) */
  function dowF(vals){
   const n=vals.length,m=sum(vals)/n,f=Array(7).fill(1);if(n<14||m<=0)return f;
   const s=Array(7).fill(0),c=Array(7).fill(0);vals.forEach((v,i)=>{const d=dayOf(i-(n-1));s[d]+=v;c[d]++});
   for(let d=0;d<7;d++)if(c[d])f[d]=clamp((c[d]*(s[d]/c[d]/m)+2)/(c[d]+2),.5,1.8);
   const a=sum(f)/7;return f.map(x=>x/a);
  }
  /* 7-day forecast: recent level x weekday pattern x gentle trend (an estimate, not a promise) */
  function forecast(vals){
   const F=dowF(vals),l7=vals.slice(-7),avg=sum(l7)/l7.length,prev=vals.slice(-14,-7),slope=prev.length?(avg-sum(prev)/prev.length)/Math.max(avg,1e-9):0;
   return Array.from({length:7},(_,i)=>Math.round(avg*F[dayOf(i+1)]*(1+clamp(slope,-.08,.08)*(i+1)/7)*100)/100);
  }
  const lab=(i,n)=>i===n-1?L('Today','Hari ini'):i>=n?dateStr(i-(n-1)):dateStr(i-(n-1));

  function mainChart(m,n,cat){
   const cur=seriesFor(m,n,cat),prv=S.an.cmp?seriesFor(m,n,cat,true):null,fc=S.an.fc?forecast(cur):[];
   const total=n+fc.length,W=720,H=280,pl=46,pr=14,pt=14,pb=30,cw=W-pl-pr,ph=H-pt-pb;
   const all=[...cur,...(prv||[]),...fc.map(v=>v*1.1)],mx=Math.max(...all,.01)*1.12,mn=0;
   const X=i=>pl+i*cw/(total-1),Y=v=>pt+(1-(v-mn)/(mx-mn))*ph;
   const line=(a,off=0)=>a.map((v,i)=>`${i?'L':'M'}${X(i+off).toFixed(1)} ${Y(v).toFixed(1)}`).join('');
   const smooth=(a,off=0)=>a.map((v,i)=>{const x=X(i+off),y=Y(v);if(!i)return `M${x.toFixed(1)} ${y.toFixed(1)}`;const px=X(i-1+off),py=Y(a[i-1]),c=(x-px)/2;return `C${(px+c).toFixed(1)} ${py.toFixed(1)} ${(x-c).toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`}).join('');
   const grid=[0,.25,.5,.75,1].map(t=>{const v=mn+(mx-mn)*t,y=Y(v);const s=base[m].unit==='RM'?(v>=1000?(v/1000).toFixed(1)+'k':Math.round(v)):Math.round(v);return `<line x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${pl-8}" y="${y+4}" text-anchor="end">${s}</text>`}).join('');
   const ticks=n<=7?cur.map((_,i)=>i):[0,Math.round(n/4),Math.round(n/2),Math.round(3*n/4),n-1];
   const xl=ticks.map(i=>`<text x="${X(i)}" y="${H-8}" text-anchor="${i===0?'start':i===n-1?'middle':'middle'}">${n<=7?(i===n-1?L('Today','Hari ini'):dateStr(i-(n-1)).split(' ')[0]):lab(i,n)}</text>`).join('');
   const avg=sum(cur)/n,ay=Y(avg);
   let pk=0,lo=0;cur.forEach((v,i)=>{if(v>cur[pk])pk=i;if(v<cur[lo])lo=i});
   const mk=(i,txt,up)=>`<circle cx="${X(i)}" cy="${Y(cur[i])}" r="4.5" fill="var(--surface)" stroke="var(--accent)" stroke-width="2"/><text x="${clamp(X(i),pl+30,W-pr-30)}" y="${Y(cur[i])+(up?-11:20)}" text-anchor="middle" style="font-weight:600;fill:var(--ink)">${txt}</text>`;
   const band=fc.length?`<path d="${fc.map((v,i)=>`${i?'L':'M'}${X(n+i)} ${Y(v*1.1)}`).join('')}${fc.slice().reverse().map((v,i)=>`L${X(total-1-i)} ${Y(v*.9)}`).join('')}Z" fill="var(--accent)" opacity=".12"/>`:'';
   const vals=[...cur,...fc].map(v=>+v.toFixed(2)).join(','),labs=Array.from({length:total},(_,i)=>lab(i,n)).join('|');
   return `<svg class="chart an-main" viewBox="0 0 ${W} ${H}" role="img" aria-label="${L(base[m].en,base[m].ms)}" data-w="${W}" data-pl="${pl}" data-cw="${cw}" data-pt="${pt}" data-ph="${ph}" data-max="${mx}" data-n="${n}" data-m="${m}" data-vals="${vals}" data-prev="${prv?prv.join(','):''}" data-labs="${labs}">
    <defs><linearGradient id="ang" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".35"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
    ${grid}<line x1="${pl}" x2="${X(n-1)}" y1="${ay}" y2="${ay}" stroke="var(--ink-2)" stroke-dasharray="3 5" opacity=".55"/><text x="${pl+4}" y="${ay-6}" style="font-size:11px">${L('average','purata')}</text>
    ${band}${prv?`<path d="${smooth(prv)}" fill="none" stroke="var(--ink-2)" stroke-width="1.8" stroke-dasharray="5 5" opacity=".65"/>`:''}
    <path d="${smooth(cur)}L${X(n-1)} ${Y(0)}L${X(0)} ${Y(0)}Z" fill="url(#ang)"/>
    <path class="an-line" d="${smooth(cur)}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" pathLength="1"/>
    ${fc.length?`<path d="M${X(n-1)} ${Y(cur[n-1])}${fc.map((v,i)=>`L${X(n+i)} ${Y(v)}`).join('')}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-dasharray="2 6" stroke-linecap="round"/>`:''}
    ${mk(pk,fmt(m,cur[pk]),true)}${lo!==pk&&n>7?mk(lo,fmt(m,cur[lo]),false):''}
    <circle cx="${X(n-1)}" cy="${Y(cur[n-1])}" r="6" fill="var(--accent)" stroke="var(--surface)" stroke-width="3"/>
    ${xl}<line class="an-cx" x1="0" x2="0" y1="${pt}" y2="${pt+ph}" stroke="var(--ink)" stroke-width="1" opacity="0"/><circle class="an-cd" r="6" fill="var(--accent)" stroke="var(--surface)" stroke-width="3" opacity="0"/>
    <rect class="an-hit" x="${pl}" y="${pt}" width="${cw}" height="${ph}" fill="transparent"/></svg>`;
  }

  function donut(cat){
   const vals=P.map(p=>({p,v:sum(series('cost',S.an.range,{cat:p.id}))})).sort((a,b)=>b.v-a.v),tot=sum(vals.map(x=>x.v)),R=54,C=2*Math.PI*R;let acc=0;
   if(!tot)return `<p class="meta">${L('No usage recorded in this period yet.','Belum ada penggunaan direkod dalam tempoh ini.')}</p>`;
   const arcs=vals.map((x,i)=>{const f=x.v/tot,len=Math.max(0,f*C-2),off=-acc*C;acc+=f;const on=cat===x.p.id,dim=cat&&!on;
    return `<circle class="an-arc" cx="70" cy="70" r="${R}" fill="none" stroke="${COL[i%COL.length]}" stroke-width="${on?24:18}" stroke-dasharray="${len} ${C-len}" stroke-dashoffset="${off}" transform="rotate(-90 70 70)" opacity="${dim?.25:1}" data-an-cat="${x.p.id}" data-tip="${esc(pn(x.p))}: ${rm0(x.v)} (${Math.round(f*100)}%)"/>`}).join('');
   const sel=cat&&vals.find(x=>x.p.id===cat);
   const legend=vals.map((x,i)=>`<button class="an-leg ${cat===x.p.id?'on':''}" data-an-cat="${x.p.id}" aria-pressed="${cat===x.p.id}"><i style="background:${COL[i%COL.length]}"></i><span>${pn(x.p)}</span><b>${rm0(x.v)}</b><small>${Math.round(x.v/tot*100)}%</small></button>`).join('');
   return `<div class="an-donut"><svg viewBox="0 0 140 140" width="168" height="168" role="img" aria-label="${L('Cost by product','Kos mengikut produk')}">${arcs}<text x="70" y="66" text-anchor="middle" style="font:700 17px var(--font);fill:var(--ink)">${rm0(sel?sel.v:tot)}</text><text x="70" y="84" text-anchor="middle" style="font:500 10px var(--font);fill:var(--ink-2)">${sel?pn(sel.p):L("today",'hari ini')}</text></svg><div class="an-legs">${legend}</div></div>`;
  }

  function runway(){
   const rows=P.map(p=>({p,d:runDays(p),lead:leadOf(p.sup)})).sort((a,b)=>a.d-b.d),MAXD=10;
   return `<div class="an-run">${rows.map(r=>{const w=clamp(r.d/MAXD*100,2,100),lp=clamp(r.lead/MAXD*100,0,100),tone=r.d<r.lead?'bad':r.d<r.lead+2?'warn':'ok';
    return `<div class="an-rrow" data-tip="${esc(pn(r.p))}: ${r.d>30?'30+':r.d.toFixed(1)} ${L('days left','hari lagi')} · ${r.p.sup} ${r.lead} ${L('day delivery','hari hantar')}${aiTag(r.p)?' · '+esc(aiTag(r.p)):''}"><span>${pn(r.p)}</span><i class="an-rbar"><u class="${tone}" style="width:${w}%"></u><s style="left:${lp}%"></s></i><b class="${tone}">${r.d.toFixed(1)}${L('d','h')}</b></div>`}).join('')}
   <p class="say" style="margin:10px 0 0">${L('The dark marker is the supplier delivery time. A bar that ends before it means stock runs out before the order can arrive.','Penanda gelap ialah masa penghantaran pembekal. Bar yang berakhir sebelum garisan bermakna stok habis sebelum order tiba.')}</p></div>`;
  }

  /* real: units used per weekday and time of day, averaged over the last 4 weeks (from usage timestamps) */
  function heat(){
   const days=[L('Mon','Isn'),L('Tue','Sel'),L('Wed','Rab'),L('Thu','Kha'),L('Fri','Jum'),L('Sat','Sab'),L('Sun','Ahd')],dows=[1,2,3,4,5,6,0],slots=[L('Morning','Pagi'),L('Lunch','Tengah hari'),L('Afternoon','Petang'),L('Evening','Malam')];
   const hm=(S.daily&&S.daily.heat)||[],q=(dw,sl)=>sum(hm.filter(h=>h.dow===dw&&h.slot===sl).map(h=>h.qty))/4,mx=Math.max(0,...dows.flatMap(dw=>slots.map((_,sl)=>q(dw,sl))));
   if(!mx)return `<p class="meta">${L('Record some usage and the busy times will show here.','Rekod sedikit penggunaan dan waktu sibuk akan dipaparkan di sini.')}</p>`;
   let best={v:0};
   const rows=days.map((d,di)=>`<div class="an-hr"><span>${d}</span>${slots.map((s,si)=>{const u=q(dows[di],si),v=u/mx;if(v>best.v)best={v,d,s};return `<i style="--a:${(.12+v*.88).toFixed(2)}" data-tip="${d} ${s.toLowerCase()}: ~${Math.round(u*10)/10} ${L('units used','unit digunakan')}"></i>`}).join('')}</div>`).join('');
   return `<div class="an-heat"><div class="an-hx"><span></span>${slots.map(s=>`<span>${s}</span>`).join('')}</div>${rows}</div><p class="say" style="margin:10px 0 0">${L(`Busiest: ${best.d} ${best.s.toLowerCase()}. Stock the fast movers before then.`,`Paling sibuk: ${best.d} ${best.s.toLowerCase()}. Sediakan stok sebelum itu.`)}</p>`;
  }

  function suppliers(){
   const names=(S.vendors||[]).map(v=>v.name),spend=Object.fromEntries(names.map(n=>[n,sum(P.filter(p=>p.sup===n).map(p=>(S.use[p.id]||0)*p.cost))])),tot=sum(Object.values(spend))||1;
   if(!names.length)return `<p class="meta">${L('Add suppliers to see them here.','Tambah pembekal untuk lihat di sini.')}</p>`;
   return `<div class="an-sup">${names.map(n=>{const ld=leadOf(n);return `<div class="an-srow"><b>${esc(n)}</b><span class="pill">${ld} ${L('day','hari')}${ld>1&&S.lang!=='ms'?'s':''}</span><i class="an-sbar"><u style="width:${(spend[n]/tot*100).toFixed(0)}%"></u></i><small>${Math.round(spend[n]/tot*100)}% ${L('of spend','perbelanjaan')}</small></div>`}).join('')}</div>`;
  }

  function insights(m,n,cat,cur,prv){
   const out=[],cs=sum(cur),ps=sum(prv),pct=chg(cs,ps),bm=base[m];
   const dr=P.map(p=>({p,x:((S.use[p.id]||0)-p.avg)*p.cost})).sort((a,b)=>b.x-a.x)[0];
   const good=bm.good==='down'?pct<=0:bm.good==='up'?pct>=0:null;
   out.push({t:good===false?'warn':'ok',h:L(`${L(bm.en,bm.ms)} is ${Math.abs(pct)}% ${pct>=0?'higher':'lower'} than the previous ${n} days`,`${bm.ms} ${Math.abs(pct)}% ${pct>=0?'lebih tinggi':'lebih rendah'} berbanding ${n} hari sebelum ini`),d:`${fmt(m,cs)} ${L('vs','berbanding')} ${fmt(m,ps)}.`+(m==='cost'&&dr.x>0?' '+L(`${pn(dr.p)} is the biggest driver today (+${rm0(dr.x)} over normal).`,`${pn(dr.p)} pemacu terbesar hari ini (+${rm0(dr.x)} melebihi biasa).`):'')});
   const risk=P.map(p=>({p,d:runDays(p),lead:leadOf(p.sup)})).filter(x=>x.d<x.lead).sort((a,b)=>a.d-b.d)[0];
   if(risk)out.push({t:'bad',h:L(`${pn(risk.p)} will run out before ${risk.p.sup} can deliver`,`${pn(risk.p)} akan habis sebelum ${risk.p.sup} sempat hantar`),d:L(`${risk.d.toFixed(1)} days of stock, delivery takes ${risk.lead}. Order now.`,`Stok ${risk.d.toFixed(1)} hari, penghantaran ${risk.lead} hari. Order sekarang.`),say:L(`Order ${P.length?20:0} kg ${risk.p.en.toLowerCase()}`,`Order 20 kilo ${risk.p.name.toLowerCase()}`)});
   const w=sum(S.waste.map(x=>x.amt)),tw=S.waste[0];
   out.push({t:'warn',h:L(`${rm0(w)} lost to waste this week`,`${rm0(w)} hilang kepada sisa minggu ini`),d:L(`${tw.n} is the largest item (${rm0(tw.amt)}). Earlier ordering of perishables would cut this.`,`${tw.n} paling besar (${rm0(tw.amt)}). Order barang cepat rosak lebih awal boleh kurangkan ini.`)});
   return `<div class="nl">${out.map(o=>`<div><i class="${o.t==='ok'?'':o.t}"></i><span><b>${o.h}</b>${o.d}${o.say?`<br><button class="btn" style="margin-top:8px" data-say="${esc(o.say)}">${L('Order now','Order sekarang')}</button>`:''}</span></div>`).join('')}</div>`;
  }

  function analyticsScene(){
   const A=S.an,m=A.metric,n=A.range,cat=A.cat,b=base[m];
   const cur=seriesFor(m,n,cat),prv=seriesFor(m,n,cat,true),cs=sum(cur),ps=sum(prv),pct=chg(cs,ps);
   const tone=p=>b.good==='down'?(p<=0?'ok':'warn'):b.good==='up'?(p>=0?'ok':'warn'):'';
   const kpis=Object.keys(base).map(k=>{const c=seriesFor(k,n,cat),p=seriesFor(k,n,cat,true),d=chg(sum(c),sum(p)),mx=Math.max(...c),mn=Math.min(...c),pts=c.map((v,i)=>`${(i/(c.length-1)*100).toFixed(1)},${(26-(v-mn)/(mx-mn||1)*22).toFixed(1)}`).join(' ');
    const t=base[k].good==='down'?(d<=0?'ok':'warn'):base[k].good==='up'?(d>=0?'ok':'warn'):'';
    return `<button class="w an-kpi ${k===m?'on':''}" data-an-metric="${k}" aria-pressed="${k===m}"><span class="cap">${L(base[k].en,base[k].ms)}</span><span class="num">${k==='usage'?Math.round(c[c.length-1]):rm0(c[c.length-1])}${k==='usage'?`<small style="font-size:13px;color:var(--ink-2)"> ${L('units','unit')}</small>`:''}</span><svg viewBox="0 0 100 30" preserveAspectRatio="none" class="an-spark"><polyline points="${pts}" fill="none" stroke="${k===m?'var(--accent)':'var(--ink-2)'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg><span class="pill ${t}">${d>=0?'+':''}${d}% ${L('vs previous','vs sebelum')}</span></button>`}).join('');
   const sel=cat&&P.find(p=>p.id===cat);
   return `${sh(L('Analytics','Analitik'),L('Explore your numbers. Tap a card, drag across the chart, pick a product.','Terokai nombor anda. Ketik kad, seret pada carta, pilih produk.'))}
   <div class="an-grid">
    <div class="an-kpis">${kpis}</div>
    <div class="w an-chartcard">
     <div class="an-tools"><div class="seg" role="group" aria-label="${L('Range','Julat')}">${[7,30,60].map(r=>`<button data-an-range="${r}" aria-pressed="${n===r}">${r}D</button>`).join('')}</div>
      <button class="tbtn" data-an-toggle="cmp" aria-pressed="${A.cmp}">${L('Compare previous','Banding sebelum')}</button>
      <button class="tbtn" data-an-toggle="fc" aria-pressed="${A.fc}">${ic('trend',15)}<span>${L('Forecast','Ramalan')}</span></button>
      ${sel?`<button class="tbtn" data-an-cat="${sel.id}" aria-pressed="true">${pn(sel)} ${ic('x',13)}</button>`:''}</div>
     <div class="an-read" id="an-read" aria-live="polite"><b>${fmt(m,cur[n-1])}</b><span>${L('Today','Hari ini')} · ${pct>=0?'+':''}${pct}% ${L(`vs previous ${n} days`,`vs ${n} hari sebelum`)}</span><span class="pill ${tone(pct)}">${L('Total','Jumlah')} ${fmt(m,cs)}</span></div>
     ${mainChart(m,n,cat)}
     <div class="legend"><span><i style="background:var(--accent)"></i>${L('Actual','Sebenar')}</span>${A.cmp?`<span><i style="background:var(--ink-2);opacity:.6"></i>${L('Previous period','Tempoh sebelum')}</span>`:''}${A.fc?`<span><i style="background:var(--accent);opacity:.35"></i>${L('Forecast, an estimate','Ramalan, anggaran')}</span>`:''}</div></div>
    <div class="w an-half"><span class="cap">${L('Where the money goes','Ke mana wang pergi')}</span>${donut(cat)}<span class="say" style="margin:0">${L('Tap a slice or name to focus the chart on one product.','Ketik kepingan atau nama untuk fokus carta pada satu produk.')}</span></div>
    <div class="w an-half"><span class="cap">${L('Stock runway','Landasan stok')} <span class="pill">${L('estimate','anggaran')}</span></span>${runway()}</div>
    <div class="w an-half"><span class="cap">${L('When stock is used','Bila stok digunakan')}</span>${heat()}</div>
    <div class="w an-half"><span class="cap">${L('Supplier scorecard','Kad skor pembekal')}</span>${suppliers()}</div>
    <div class="w an-full"><span class="cap">${ic('mic',14)} ${L('What changed and why','Apa yang berubah dan sebabnya')}</span>${insights(m,n,cat,cur,prv)}</div>
   </div>
   <p class="demo-note">${L('All numbers come from your own stock records. Forecast and runway are estimates from recent use, not guarantees.','Semua nombor datang daripada rekod stok anda. Ramalan dan landasan ialah anggaran berdasarkan penggunaan terkini, bukan jaminan.')}</p>`;
  }

  return { analytics:analyticsScene };
}
