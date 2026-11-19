/* Scene "home" – one file per page. Receives the shared engine API and returns its render functions. */
export default function homeScene(api) {
  const { S, L, sayHint, examples, ic, ringSet, P, costToday, costAvg, pending, clamp, seriesN, pn, eta, esc, orderSay, suggest, U, fq, greet, rm0, canFin, isOwner, who } = api;

  function homeStaff(){
   const done=S.tasks.filter(t=>t.done).length;
   return `<div class="staff"><h1 class="h1">${L('Just say it.','Cakap je.')}</h1>
   <p class="meta" style="margin-top:10px">${L('Tap the orb and say what you did.','Tekan orb, sebut apa yang anda buat.')}${sayHint(examples()[0])}</p>
   <div class="tiles">
    <button class="tile" data-tile="usage"><span class="ico" style="background:linear-gradient(150deg,#FFB340,#FF7A00)">${ic('down',24)}</span>${L('Use stock','Guna stok')}</button>
    <button class="tile" data-tile="receive"><span class="ico" style="background:linear-gradient(150deg,#4CD964,#1FAE4B)">${ic('up',24)}</span>${L('Receive stock','Terima stok')}</button>
    <button class="tile" data-go="fresh"><span class="ico" style="background:linear-gradient(150deg,#64D2FF,#0A84FF)">${ic('leaf',24)}</span>${L('Check freshness','Semak segar')}</button>
    <button class="tile" data-tile="waste"><span class="ico" style="background:linear-gradient(150deg,#FF6B5E,#D70015)">${ic('trash',24)}</span>${L('Report waste','Lapor rosak')}</button>
   </div>
   <h2 class="h2">${L("Today's tasks",'Tugas hari ini')} <span class="pill ${done===3?'ok':''}" style="vertical-align:middle">${done}/3</span></h2>
   <div class="tasks">${S.tasks.map(t=>`<button class="task ${t.done?'done':''}" data-task="${t.id}"><i>${ic('check',14)}</i>${L(t.en,t.ms)}</button>`).join('')}</div></div>`;
  }

  function miniRing(v,k,crit,txt){return `<div class="mini">${ringSet([{k,v,crit}],72,10)}<span class="ctr">${txt}</span></div>`}

  function homeAdmin2(){
   const low=P.filter(p=>p.qty<=p.reorder),exp=P.filter(p=>p.exp<=3&&!low.includes(p)).sort((a,b)=>a.exp-b.exp);
   const cost=costToday(),pct=Math.round((cost/costAvg()-1)*100),pend=pending(),pa=pend.reduce((a,r)=>a+r.amount,0);
   const health=clamp(100-10*low.length-3*P.filter(p=>p.exp<=3).length-(pct>10?4:0)-pend.length,0,100);
   const sH=Math.round((P.length-low.length)/P.length*100),fH=Math.round(P.filter(p=>p.exp>3).length/P.length*100),cH=clamp(100-Math.max(0,pct),0,100);
   const ser=seriesN(7),mx=Math.max(...ser)*1.1;
   const spark=`<svg width="100%" viewBox="0 0 140 44" preserveAspectRatio="none" style="height:44px" aria-hidden="true">${ser.map((v,i)=>`<rect x="${i*20}" y="${44-v/mx*44}" width="14" height="${v/mx*44}" rx="5" fill="${i===6?'var(--accent)':'var(--accent-soft)'}"/>`).join('')}</svg>`;
   let ins='';
   low.forEach(p=>{const cv=p.qty/p.avg;ins+=`<div class="w w-s ins-w">${miniRing(clamp(cv/5*100,3,100),'cover',true,ic('alert',22))}<div class="tx"><h3>${L(`${pn(p)} runs out in ${eta(p)}`,`${pn(p)} habis dalam ${eta(p)}`)}</h3><button class="btn primary" data-say="${esc(orderSay(p))}">Order ${suggest(p)} ${U(p.unit)}</button></div><span class="num">${fq(p.qty)}<small style="font-size:14px;color:var(--ink-2);font-weight:500"> ${U(p.unit)}</small></span></div>`});
   if(exp[0]){const p=exp[0];ins+=`<div class="w w-s ins-w">${miniRing(clamp(p.exp/14*100,3,100),'fresh',true,ic('leaf',22))}<div class="tx"><h3>${L(`${pn(p)} expires in ${p.exp} days`,`${pn(p)} luput ${p.exp} hari`)}</h3><button class="btn" data-say="${L('Scan','Imbas')} ${pn(p).toLowerCase()}">${L('Scan freshness','Imbas segar')}</button></div><span class="num">${fq(p.qty)}<small style="font-size:14px;color:var(--ink-2);font-weight:500"> ${U(p.unit)}</small></span></div>`}
   if(!ins)ins=`<div class="w w-s ins-w">${miniRing(100,'fresh',false,ic('check',22))}<div class="tx"><h3>${L('Everything looks good','Semuanya nampak baik')}</h3></div></div>`;
   return `<div class="hello"><h1 class="h1">${greet()}, Syahmi</h1></div>
   <div class="widgets">
    <div class="w w-health"><span class="cap">${L('Business health','Kesihatan bisnes')}</span><div class="health-body"><div class="hr">${ringSet([{k:'stock',v:clamp(health,3,100),crit:health<50}],160,18)}<div class="ctr"><b>${health}<span>%</span></b></div></div>
     <div class="hl"><div class="c1"><b>${sH}%</b>${L('Stock above minimum','Stok melebihi minimum')}</div><div class="c2"><b>${fH}%</b>${L('Items fresh','Item segar')}</div><div class="c3"><b>${cH}%</b>${L('Cost control','Kawalan kos')}</div></div></div>
     <button class="tbtn" data-speak="1" >${ic('spk',16)}<span>${L('Hear briefing','Dengar ringkasan')}</span></button></div>
    ${ins}
    <div class="w w-m"><span class="cap">${L('Cost today','Kos hari ini')}</span><span class="num">${rm0(cost)}</span>${spark}<span class="pill ${pct>10?'warn':'ok'}" style="align-self:flex-start">${pct>=0?'+':''}${pct}% ${L('vs average','dari purata')}</span></div>
    <div class="w w-m"><span class="cap">${L('Approvals','Kelulusan')}</span><span class="num">${pend.length}</span><span class="say" style="margin:0">${pend.length?L(`${rm0(pa)} waiting for you`,`${rm0(pa)} menunggu anda`):L('Nothing waiting','Tiada menunggu')}</span><button class="btn" data-go="ops" style="align-self:flex-start;margin-top:auto">${L('Review','Semak')}</button></div>
    <div class="w w-m"><span class="cap">${ic('mic',14)} ${L('Try saying','Cuba sebut')}</span><div class="sug">${examples().slice(0,4).map(x=>`<button class="chip" data-say="${esc(x)}">${esc(x)}</button>`).join('')}</div></div>
   </div>
   <p class="demo-note">${L('All figures are sample data for demonstration.','Semua nombor ialah data contoh untuk demo.')}</p>`;
  }


  /* Supplier lead time in days (backend: suppliers.lead_time_days). Used to judge stockout risk. */
  const LEAD={'Segar Jaya':1,'Mill Sentosa':3,'Ladang Hijau':2};
  const byId=id=>P.find(p=>p.id===id);
  const mvVerb=t=>t==='usage'?L('used','guna'):t==='receive'?L('received','terima'):t==='waste'?L('wasted','rosak'):L('ordered','order');
  const recent=n=>S.moves.slice(0,n).map(m=>{const p=byId(m.p);if(!p)return '';const up=m.type==='receive';
   return `<div><i class="${up?'up':'dn'}">${ic(up?'up':'down',15)}</i><span><b>${m.who}</b> ${mvVerb(m.type)} ${fq(m.q)} ${U(p.unit)} ${pn(p).toLowerCase()}</span><small>${m.t}</small></div>`}).join('');
  const days=h=>h<1?L('under 1 hour','kurang 1 jam'):h<36?Math.round(h)+L(' hours',' jam'):(h/24).toFixed(1)+L(' days',' hari');

  /* Alerts with the reason (evidence) behind each, so the owner can trust them. */
  function alerts(){
   const out=[];
   P.filter(p=>p.qty<=p.reorder).forEach(p=>{
    const h=p.qty/p.avg*24,lead=LEAD[p.sup]||2,late=h<lead*24;
    out.push({tone:'bad',t:L(`${pn(p)} runs out in ${days(h)}`,`${pn(p)} habis dalam ${days(h)}`),
     why:L(`${fq(p.qty)} ${U(p.unit)} left, you use about ${fq(p.avg)} ${U(p.unit)} a day. ${p.sup} needs ${lead} day${lead>1?'s':''} to deliver${late?', so it runs out first.':'.'}`,
           `Baki ${fq(p.qty)} ${U(p.unit)}, guna kira-kira ${fq(p.avg)} ${U(p.unit)} sehari. ${p.sup} ambil ${lead} hari untuk hantar${late?', jadi stok habis dahulu.':'.'}`),
     act:{l:L(`Order ${suggest(p)} ${U(p.unit)}`,`Order ${suggest(p)} ${U(p.unit)}`),say:orderSay(p)}});
   });
   P.filter(p=>p.exp<=3&&p.qty>p.reorder).sort((a,b)=>a.exp-b.exp).forEach(p=>{
    out.push({tone:'warn',t:L(`${pn(p)} expires in ${p.exp} days`,`${pn(p)} luput ${p.exp} hari`),
     why:L(`${fq(p.qty)} ${U(p.unit)} worth ${rm0(p.qty*p.cost)} is at risk if it is not used or promoted.`,`${fq(p.qty)} ${U(p.unit)} bernilai ${rm0(p.qty*p.cost)} berisiko jika tidak digunakan atau dipromosi.`),
     act:{l:L('Scan freshness','Imbas segar'),say:`${L('Scan','Imbas')} ${pn(p).toLowerCase()}`}});
   });
   if(S.rules.anomaly){const a=byId('ayam');
    out.push({tone:'warn',t:L('Unusual chicken usage','Penggunaan ayam luar biasa'),
     why:L(`Used ${fq(S.use.ayam)} kg today against a normal ${fq(a.avg)} kg, about 56% above the usual rate. Check for waste or an unrecorded sale.`,`Guna ${fq(S.use.ayam)} kg hari ini berbanding biasa ${fq(a.avg)} kg, kira-kira 56% melebihi biasa. Semak sisa atau jualan tidak direkod.`),
     act:{l:L('See usage','Lihat guna'),say:L('Open product stock','Buka stok produk')}});}
   return out;
  }
  const alertHtml=list=>list.length?`<div class="nl">${list.map(a=>`<div><i class="${a.tone}"></i><span><b>${a.t}</b>${a.why}${a.act?`<br><button class="btn" style="margin-top:8px" data-say="${esc(a.act.say)}">${a.act.l}</button>`:''}</span></div>`).join('')}</div>`
   :`<p class="say" style="margin:0">${L('Nothing needs attention.','Tiada yang perlu perhatian.')}</p>`;

  const spark=(arr,tone)=>{const mx=Math.max(...arr),mn=Math.min(...arr),pts=arr.map((v,i)=>`${(i/(arr.length-1)*100).toFixed(1)},${(26-(v-mn)/(mx-mn||1)*22).toFixed(1)}`).join(' ');
   return `<svg viewBox="0 0 100 30" preserveAspectRatio="none" class="an-spark"><polyline points="${pts}" fill="none" stroke="${tone||'var(--accent)'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`};
  const wob=(seed,n,base)=>{let x=seed;return Array.from({length:n},(_,i)=>{x=(x*9301+49297)%233280;return base*(.96+.06*x/233280+(i/n)*.01)})};

  function homeOwner(){
   const low=P.filter(p=>p.qty<=p.reorder),exps=P.filter(p=>p.exp<=3),pend=pending(),pa=pend.reduce((a,r)=>a+r.amount,0);
   const cost=costToday(),pct=Math.round((cost/costAvg()-1)*100),waste=S.waste.reduce((a,w)=>a+w.amt,0);
   const lostStock=10*low.length,lostFresh=3*exps.length,lostCost=pct>10?4:0,lostOps=pend.length;
   const health=clamp(100-lostStock-lostFresh-lostCost-lostOps,0,100);
   const sH=Math.round((P.length-low.length)/P.length*100),fH=Math.round(P.filter(p=>p.exp>3).length/P.length*100),cH=clamp(100-Math.max(0,pct),0,100);
   const comps=[{k:'stock',n:L('Stock','Stok'),v:sH,lost:lostStock},{k:'fresh',n:L('Freshness','Kesegaran'),v:fH,lost:lostFresh},{k:'cover',n:L('Cost control','Kawalan kos'),v:cH,lost:lostCost}];
   const worst=comps.slice().sort((a,b)=>b.lost-a.lost)[0].k,foc=S.oh.focus&&comps.some(c=>c.k===S.oh.focus)?S.oh.focus:worst;
   const detail={
    stock:low.map(p=>({t:L(`${pn(p)} is below minimum (${fq(p.qty)} ${U(p.unit)})`,`${pn(p)} bawah minimum (${fq(p.qty)} ${U(p.unit)})`),pts:10,b:L(`Order ${suggest(p)} ${U(p.unit)}`,`Order ${suggest(p)} ${U(p.unit)}`),say:orderSay(p)})),
    fresh:exps.map(p=>({t:L(`${pn(p)} expires in ${p.exp} days`,`${pn(p)} luput ${p.exp} hari`),pts:3,b:L('Scan','Imbas'),say:`${L('Scan','Imbas')} ${pn(p).toLowerCase()}`})),
    cover:pct>10?[{t:L(`Cost is ${pct}% above your average`,`Kos ${pct}% melebihi purata`),pts:4,b:L('Why?','Kenapa?'),say:L('Why did costs rise?','Kenapa kos naik?')}]:[]
   }[foc];
   const gain=sum=>sum.reduce((a,x)=>a+x.pts,0);
   const al=alerts(),ser=seriesN(S.range),n=ser.length,mxs=Math.max(...ser)*1.15,W=720,H=230,pl=44,pr=12,pt=12,pb=28,cw=W-pl-pr,ph=H-pt-pb;
   const X=i=>pl+i*cw/(n-1),Y=v=>pt+(1-v/mxs)*ph;
   const curve=ser.map((v,i)=>{const x=X(i),y=Y(v);if(!i)return `M${x.toFixed(1)} ${y.toFixed(1)}`;const px=X(i-1),py=Y(ser[i-1]),c=(x-px)/2;return `C${(px+c).toFixed(1)} ${py.toFixed(1)} ${(x-c).toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`}).join('');
   const avg=ser.slice(0,-1).reduce((a,b)=>a+b,0)/(n-1),lab=i=>i===n-1?L('Today','Hari ini'):api.dateStr(i-(n-1));
   const grid=[0,.5,1].map(t=>{const v=mxs*t;return `<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="${pl-8}" y="${Y(v)+4}" text-anchor="end">${Math.round(v)}</text>`}).join('');
   const xt=n<=7?ser.map((_,i)=>i):[0,Math.round(n/3),Math.round(2*n/3),n-1];
   const chart=`<svg class="chart an-main" viewBox="0 0 ${W} ${H}" role="img" aria-label="${L('Daily cost','Kos harian')}" data-w="${W}" data-pl="${pl}" data-cw="${cw}" data-pt="${pt}" data-ph="${ph}" data-max="${mxs}" data-n="${n}" data-m="cost" data-vals="${ser.map(v=>v.toFixed(2)).join(',')}" data-prev="" data-labs="${ser.map((_,i)=>lab(i)).join('|')}">
    <defs><linearGradient id="ohg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".35"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>${grid}
    <line x1="${pl}" x2="${W-pr}" y1="${Y(avg)}" y2="${Y(avg)}" stroke="var(--ink-2)" stroke-dasharray="3 5" opacity=".55"/>
    <path d="${curve}L${X(n-1)} ${Y(0)}L${X(0)} ${Y(0)}Z" fill="url(#ohg)"/><path class="an-line" d="${curve}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" pathLength="1"/>
    <circle cx="${X(n-1)}" cy="${Y(ser[n-1])}" r="6" fill="var(--accent)" stroke="var(--surface)" stroke-width="3"/>
    ${xt.map(i=>`<text x="${X(i)}" y="${H-8}" text-anchor="${i===n-1?'end':i===0?'start':'middle'}">${n<=7?(i===n-1?L('Today','Hari ini'):api.dateStr(i-(n-1)).split(' ')[0]):lab(i)}</text>`).join('')}
    <line class="an-cx" x1="0" x2="0" y1="${pt}" y2="${pt+ph}" stroke="var(--ink)" stroke-width="1" opacity="0"/><circle class="an-cd" r="6" fill="var(--accent)" stroke="var(--surface)" stroke-width="3" opacity="0"/><rect class="an-hit" x="${pl}" y="${pt}" width="${cw}" height="${ph}" fill="transparent"/></svg>`;
   const kpi=(k,cap,val,sp,sub,tone)=>`<button class="w oh-kpi s3" data-an-go="${k}"><span class="cap">${cap}</span><span class="num">${val}</span>${sp}<span class="pill ${tone||''}">${sub}</span></button>`;
   const sv=api.stockValue(),head=pend.length+low.length?L(`${pend.length+low.length+(exps.length?1:0)} things need you today`,`${pend.length+low.length+(exps.length?1:0)} perkara perlukan anda hari ini`):L('Everything is on track today','Semuanya lancar hari ini');
   const dstr=new Date().toLocaleDateString(S.lang==='ms'?'ms-MY':'en-GB',{weekday:'long',day:'numeric',month:'long'});
   const sev=['bad','warn','ok'];
   const dq=[...pend.map(r=>{const p=byId(r.item);return `<div class="oh-dq"><i class="warn"></i><span><b>${r.kind==='order'?L('Approve order','Lulus order'):L('Approve write-off','Lulus tulis-off')} · ${fq(r.qty)} ${U(p.unit)} ${pn(p).toLowerCase()}</b>${L('Requested by','Diminta oleh')} ${r.by} · ${rm0(r.amount)}</span><div class="row" style="margin:0"><button class="btn primary" data-say="${L('Approve','Lulus')}">${L('Approve','Lulus')}</button><button class="btn" data-say="${L('Reject','Tolak')}">${L('Reject','Tolak')}</button></div></div>`}),
    ...al.slice(0,3).map(a=>`<div class="oh-dq"><i class="${a.tone}"></i><span><b>${a.t}</b>${a.why}</span>${a.act?`<button class="btn" data-say="${esc(a.act.say)}">${a.act.l}</button>`:''}</div>`)].join('')||`<p class="say" style="margin:0">${L('Nothing needs a decision.','Tiada keputusan diperlukan.')}</p>`;
   const rows=P.map(p=>({p,d:p.qty/p.avg,lead:LEAD[p.sup]||2})).sort((a,b)=>a.d-b.d).slice(0,6);
   const run=rows.map(r=>{const w=clamp(r.d/10*100,2,100),lp=clamp(r.lead/10*100,0,100),t=r.d<r.lead?'bad':r.d<r.lead+2?'warn':'ok';return `<div class="an-rrow" data-tip="${esc(pn(r.p))}: ${r.d.toFixed(1)} ${L('days left','hari lagi')} · ${r.p.sup} ${r.lead} ${L('day delivery','hari hantar')}"><span>${pn(r.p)}</span><i class="an-rbar"><u class="${t}" style="width:${w}%"></u><s style="left:${lp}%"></s></i><b class="${t}">${r.d.toFixed(1)}${L('d','h')}</b></div>`}).join('');
   const team=[['Aina','Admin',1],['Syafiq',L('Staff','Staf'),1],['Siti',L('Staff','Staf'),0],['Hakim',L('Staff','Staf'),1]].map(([nm,rl,on])=>{const m=S.moves.find(x=>x.who===nm),p=m&&byId(m.p);
    return `<div class="oh-tm"><i class="oh-av ${on?'on':''}">${nm[0]}</i><span><b>${nm}</b><small>${rl} · ${on?L('online','dalam talian'):L('off shift','tiada syif')}</small></span><em>${m&&p?`${mvVerb(m.type)} ${fq(m.q)} ${U(p.unit)} ${pn(p).toLowerCase()} · ${m.t}`:L('no activity yet','belum ada aktiviti')}</em></div>`}).join('');
   const tl=[...S.tasks.map((t,i)=>({h:['10:00','11:30','14:00'][i]||'16:00',t:L(t.en,t.ms),done:t.done,k:'tk'})),...S.orders.filter(o=>!o.done).map(o=>({h:o.step===3?L('Now','Sekarang'):'08:00',t:`PO #${o.no} · ${o.sup} ${o.step===3?L('delivered','tiba'):L('arriving','tiba esok')}`,done:false,k:'po'})),...exps.slice(0,2).map(p=>({h:L('Today','Hari ini'),t:L(`${pn(p)} expires in ${p.exp} days`,`${pn(p)} luput ${p.exp} hari`),done:false,k:'exp'}))];
   const tlh=tl.map(x=>`<div class="oh-tl ${x.done?'done':''}"><time>${x.h}</time><u class="tdot ${x.k}"></u><span>${x.t}</span></div>`).join('');
   const rg=ringSet(comps.map(c=>({k:c.k,v:clamp(c.v,3,100),crit:c.v<50})),210,16);
   return `<div class="oh-grid">
    <div class="w oh-hero s12"><div><span class="cap">${dstr}</span><h1 class="h1" style="font-size:clamp(28px,5vw,44px)">${greet()}, ${who()}</h1><p class="oh-head">${head}</p></div>
     <div class="row" style="margin:0"><button class="btn primary" data-speak="1">${ic('spk',15)} ${L('Hear briefing','Dengar ringkasan')}</button><button class="btn" data-go="ops">${L('Approvals','Kelulusan')} ${pend.length?`<span class="pill warn" style="margin-left:6px">${pend.length}</span>`:''}</button><button class="btn" data-go="analytics">${ic('trend',15)} ${L('Analytics','Analitik')}</button></div></div>
    <div class="w oh-health s5"><span class="cap">${L('Business health','Kesihatan bisnes')} <span class="pill ${health>=80?'ok':health>=60?'warn':'bad'}">${health>=80?L('Good','Baik'):health>=60?L('Fair','Sederhana'):L('At risk','Berisiko')}</span></span>
     <div class="oh-ringrow"><div class="hr oh-ring">${rg}<div class="ctr"><b>${health}<span>%</span></b><small>${L('tap a ring name','ketik nama gelang')}</small></div></div>
      <div class="oh-comps">${comps.map(c=>`<button class="oh-comp ${c.k===foc?'on':''}" data-oh-focus="${c.k}" aria-pressed="${c.k===foc}"><i class="c-${c.k}" style="background:currentColor"></i><span>${c.n}</span><b>${c.v}%</b></button>`).join('')}</div></div>
     <div class="oh-detail"><p class="say" style="margin:0 0 8px">${detail.length?L(`What is pulling ${comps.find(c=>c.k===foc).n.toLowerCase()} down. Fixing all gives back +${gain(detail)} points.`,`Apa yang menarik ${comps.find(c=>c.k===foc).n.toLowerCase()} turun. Selesaikan semua dapat +${gain(detail)} mata.`):L('Nothing is dragging this down.','Tiada yang menarik ini turun.')}</p>
      ${detail.map(d=>`<div class="oh-fix"><span>${d.t}</span><em>+${d.pts}</em><button class="btn" data-say="${esc(d.say)}">${d.b}</button></div>`).join('')}</div></div>
    <div class="w oh-queue s7"><span class="cap">${L('Decision queue','Barisan keputusan')} <span class="pill ${pend.length+al.length?'warn':'ok'}">${pend.length+Math.min(3,al.length)}</span></span>${dq}</div>
    ${kpi('cost',L('Cost today','Kos hari ini'),rm0(cost),spark(seriesN(7)),`${pct>=0?'+':''}${pct}% ${L('vs avg','dari purata')}`,pct>10?'warn':'ok')}
    ${kpi('stock',L('Stock value','Nilai stok'),rm0(sv),spark(wob(7,7,sv)),L('actual','sebenar'))}
    ${kpi('waste',L('Waste this week','Sisa minggu ini'),rm0(waste),spark(S.waste.map(w=>w.amt).reverse(),'var(--warn)'),L('actual','sebenar'),waste>30?'warn':'ok')}
    ${kpi('waste',L('Money at risk','Wang berisiko'),rm0(exps.reduce((a,p)=>a+p.qty*p.cost,0)),`<span class="say" style="margin:0">${L('Expires within 3 days','Luput dalam 3 hari')}: ${exps.map(p=>pn(p)).join(', ')||'-'}</span>`,L('estimate','anggaran'),'warn')}
    <div class="w oh-chart s8"><div class="an-tools"><span class="cap" style="margin-right:auto">${L('Cost activity','Aktiviti kos')}</span><div class="seg"><button data-range="7" aria-pressed="${S.range===7}">7D</button><button data-range="30" aria-pressed="${S.range===30}">30D</button></div></div>
     <div class="an-read" id="an-read"><b>${rm0(ser[n-1])}</b><span>${L('Today','Hari ini')} · ${L('drag across the chart','seret pada carta')}</span></div>${chart}</div>
    <div class="w oh-run s4"><span class="cap">${L('Stock runway','Landasan stok')} <span class="pill">${L('estimate','anggaran')}</span></span><div class="an-run">${run}</div><span class="say" style="margin:0">${L('Dark marker = supplier delivery time.','Penanda gelap = masa penghantaran pembekal.')}</span></div>
    <div class="w s6"><span class="cap">${L('Team pulse','Denyut pasukan')}</span><div class="oh-team">${team}</div></div>
    <div class="w s6"><span class="cap">${L("Today's timeline",'Garis masa hari ini')}</span><div class="oh-tls">${tlh}</div></div>
    <div class="w oh-ask s12"><span class="cap">${ic('mic',14)} ${L('Ask SmartStock','Tanya SmartStock')}</span><div class="sug">${examples().slice(0,6).map(x=>`<button class="chip" data-say="${esc(x)}">${esc(x)}</button>`).join('')}</div></div>
   </div>
   <p class="demo-note">${L('All figures are sample data for demonstration.','Semua nombor ialah data contoh untuk demo.')}</p>`;
  }

  function homeAdminOps(){
   const pend=pending(),done=S.tasks.filter(t=>t.done).length,al=alerts().filter(a=>a.tone==='bad'||/expires|luput/.test(a.t));
   const open=S.orders.filter(o=>!o.done);
   const stepTxt=o=>o.step===1?L('sent','dihantar'):o.step===2?L('confirmed, arriving tomorrow','disahkan, tiba esok'):L('delivered, needs receiving','tiba, perlu diterima');
   const fin=canFin()?`<div class="w w-m" style="grid-column:span 5"><span class="cap">${L('Cost today','Kos hari ini')}</span><span class="num">${rm0(costToday())}</span><button class="btn" data-go="cost" style="align-self:flex-start;margin-top:auto">${L('Details','Butiran')}</button></div>`:'';
   return `<div class="hello"><h1 class="h1">${greet()}, ${who()}</h1><span class="say">${L('Operations board · run the day','Papan operasi · uruskan hari ini')}</span></div>
   <div class="widgets">
    <div class="w w-s" style="grid-column:span 7"><span class="cap">${L('Approvals waiting','Kelulusan menunggu')} <span class="pill ${pend.length?'warn':'ok'}">${pend.length}</span></span>
     ${pend.length?`<div class="nl">${pend.map(r=>{const p=byId(r.item);return `<div><i class="warn"></i><span><b>${r.kind==='order'?L('Order','Order'):L('Write-off','Tulis-off')} · ${fq(r.qty)} ${U(p.unit)} ${pn(p).toLowerCase()}</b>${L('Requested by','Diminta oleh')} ${r.by} · ${rm0(r.amount)}</span></div>`}).join('')}</div><button class="btn primary" data-go="ops" style="align-self:flex-start">${L('Review','Semak')}</button>`:`<p class="say" style="margin:0">${L('Nothing waiting.','Tiada menunggu.')}</p>`}</div>
    <div class="w w-m" style="grid-column:span 5"><span class="cap">${L("Team tasks today",'Tugas pasukan hari ini')}</span><span class="num">${done}/${S.tasks.length}</span><span class="say" style="margin:0">${S.tasks.filter(t=>!t.done).map(t=>L(t.en,t.ms)).join(' · ')||L('All done.','Semua siap.')}</span></div>
    <div class="w w-s" style="grid-column:span ${canFin()?7:12}"><span class="cap">${L('Deliveries','Penghantaran')} <span class="pill">${open.length}</span></span>
     ${open.length?`<div class="nl">${open.map(o=>{const p=byId(o.item);return `<div><i class="${o.step===3?'warn':''}"></i><span><b>PO #${o.no} · ${fq(o.qty)} ${U(p.unit)} ${pn(p).toLowerCase()}</b>${o.sup} · ${stepTxt(o)}</span></div>`}).join('')}</div>`:`<p class="say" style="margin:0">${L('No open orders.','Tiada order terbuka.')}</p>`}</div>
    ${fin}
    <div class="w" style="grid-column:1/-1"><span class="cap">${L('Stock to act on','Stok untuk diambil tindakan')} <span class="pill ${al.length?'warn':'ok'}">${al.length}</span></span>${alertHtml(al)}</div>
    <div class="w" style="grid-column:1/-1"><span class="cap">${L('Staff activity','Aktiviti staf')}</span><div class="mv">${recent(5)}</div></div>
   </div>
   <p class="demo-note">${canFin()?'':L('Cost and value are hidden for your role. The owner can allow them in Rules.','Kos dan nilai disembunyikan untuk peranan anda. Pemilik boleh benarkan dalam Tetapan.')+' '}${L('All figures are sample data for demonstration.','Semua nombor ialah data contoh untuk demo.')}</p>`;
  }

  return { home:()=>S.role==='owner'?homeOwner():S.role==='admin'?homeAdminOps():homeStaff() };
}
