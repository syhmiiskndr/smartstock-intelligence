/* Scene "home" – one file per page. Receives the shared engine API and returns its render functions. */
export default function homeScene(api) {
  const { S, L, sayHint, examples, ic, ringSet, P, costToday, costAvg, pending, clamp, seriesN, pn, eta, esc, orderSay, suggest, U, fq, greet, rm0, canFin, isOwner, who, stockValue } = api;

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

  /* ---- Business Pulse: the shared home for owner and admin ----
     Stock room as live tiles, a health score with a "if you act" gain, a story per item,
     a time slider that shows what happens next, and real actions (orders go to Order tracking).
     Backend later: stock_movements, suppliers.lead_time_days, purchase_orders. */
  const LEAD={'Segar Jaya':1,'Mill Sentosa':3,'Ladang Hijau':2};
  const byId=id=>P.find(p=>p.id===id);
  const sum=a=>a.reduce((x,y)=>x+y,0);
  const mvVerb=t=>t==='usage'?L('used','guna'):t==='receive'?L('received','terima'):t==='waste'?L('wasted','rosak'):L('ordered','order');
  const nf=v=>Math.round(v*10)/10;
  const dtxt=x=>x<1?Math.max(1,Math.round(x*24))+L(' hours',' jam'):nf(x)+L(' days',' hari');
  const sparkPts=a=>{const mx=Math.max(...a),mn=Math.min(...a);return a.map((v,i)=>`${(i/(a.length-1)*100).toFixed(1)},${(24-(v-mn)/(mx-mn||1)*21).toFixed(1)}`).join(' ')};
  const wob=(seed,n,base)=>{let x=seed;return Array.from({length:n},(_,i)=>{x=(x*9301+49297)%233280;return base*(.94+.08*x/233280+(i/n)*.02)})};

  /* one product at day d: stock falls with use, open orders arrive after the supplier lead time */
  function rowFor(p,d,ord,used){
   const lead=LEAD[p.sup]||2,handled=!!used[p.id];
   let q;if(!ord||d<=lead)q=Math.max(0,p.qty-p.avg*d);else q=Math.min(p.cap,Math.max(0,p.qty-p.avg*lead)+ord-p.avg*(d-lead));
   const days0=p.qty/p.avg,daysNow=q/p.avg,expLeft=p.exp-d;
   const out=q<=.05,low=!out&&q<=p.reorder,soon=!out&&!low&&daysNow<lead+.5;
   const expiring=!handled&&p.exp<=3&&expLeft>0,expired=!handled&&p.exp<=3&&expLeft<=0;
   const needsOrder=(p.qty<=p.reorder||days0<lead+.5)&&!ord;
   let pen=0;if(out)pen+=12;else if(!ord){if(low)pen+=10;else if(soon)pen+=2}if(expired)pen+=4;else if(expiring)pen+=3;
   return {p,q,lead,out,low,soon,expiring,expired,daysNow,days0,ord,handled,pen,needsOrder,canUse:p.exp<=3&&!handled};
  }
  const openQty=id=>S.orders.filter(o=>o.item===id&&!o.done).reduce((a,o)=>a+o.qty,0);

  function homePulse(){
   const PL=S.pulse,d=PL.day,own=isOwner(),fin=canFin();
   const rows=P.map(p=>rowFor(p,d,openQty(p.id),PL.used));
   const score=clamp(Math.round(100-sum(rows.map(r=>r.pen))),0,100);
   const fixO=P.filter(p=>{const r=rowFor(p,0,openQty(p.id),PL.used);return r.needsOrder}).map(p=>p.id),fixU=P.filter(p=>p.exp<=3&&!PL.used[p.id]).map(p=>p.id);
   const bestO=Object.fromEntries(P.map(p=>[p.id,fixO.includes(p.id)?suggest(p):openQty(p.id)])),bestU=Object.fromEntries(P.map(p=>[p.id,PL.used[p.id]||fixU.includes(p.id)]));
   const best=Math.max(score,clamp(Math.round(100-sum(P.map(p=>rowFor(p,d,bestO[p.id],bestU).pen))),0,100)),gain=best-score;
   const need=new Set([...fixO,...fixU]).size,tone=score>=80?'good':score>=60?'fair':'bad';
   const verdict=own?{good:L('Good','Baik'),fair:L('Fair','Sederhana'),bad:L('At risk','Berisiko')}[tone]:{good:L('Ready','Sedia'),fair:L('Needs attention','Perlu perhatian'),bad:L('Not ready','Belum sedia')}[tone];
   const dayLabel=d===0?L('Now','Sekarang'):d<1?L('In ','Dalam ')+Math.round(d*24)+L(' hours',' jam'):L('In ','Dalam ')+nf(d)+L(' days',' hari');
   const lowN=rows.filter(r=>r.low||r.out).length,freshN=rows.filter(r=>!(r.expiring||r.expired)).length;
   const stockPct=Math.round((rows.length-lowN)/rows.length*100),freshPct=Math.round(freshN/rows.length*100);
   const doneT=S.tasks.filter(t=>t.done).length,pct=Math.round((costToday()/costAvg()-1)*100);
   const pillar=(k,name,val,col,pick)=>`<${pick?'button':'div'} class="pl-pillar ${PL.filter===k?'on':''}" style="--pc:${col}" ${pick?`data-pl="filter" data-id="${k}" aria-pressed="${PL.filter===k}"`:''}><span>${name}</span><b>${val}%</b><i><u style="width:${val}%"></u></i></${pick?'button':'div'}>`;
   const pillars=pillar('stock',L('Stock levels','Paras stok'),stockPct,'var(--r-stock)',1)+pillar('fresh',L('Freshness','Kesegaran'),freshPct,'var(--r-fresh)',1)+(own?pillar('cost',L('Cost control (see Analytics)','Kawalan kos (lihat Analitik)'),clamp(100-Math.max(0,pct),0,100),'var(--r-cover)',0):pillar('tasks',L(`Team tasks (${doneT} of ${S.tasks.length} done)`,`Tugas pasukan (${doneT} daripada ${S.tasks.length} siap)`),Math.round(doneT/S.tasks.length*100),'#AF52DE',0));
   const tiles=rows.map(r=>{const p=r.p,fill=clamp(r.q/p.cap*100,3,100),bad=r.out||r.low,warn=!bad&&(r.soon||r.expiring||r.expired),k=bad?'bad':warn?'warn':'ok';
    const dim=(PL.filter==='stock'&&!(bad||r.soon))||(PL.filter==='fresh'&&!(r.expiring||r.expired));
    const big=r.out?L('Out','Habis'):r.daysNow<1?Math.max(1,Math.round(r.daysNow*24))+L('h','j'):nf(r.daysNow)+L('d','h');
    const sm=`${nf(r.q)} ${U(p.unit)}`+(r.expiring?` · ${L('expires','luput')} ${p.exp-d<=1?L('soon','segera'):L('in ','dalam ')+Math.round(p.exp-d)+L('d','h')}`:r.expired?` · ${L('expired','luput')}`:'');
    return `<button class="pl-tile k-${k} ${PL.sel===p.id?'sel':''} ${bad&&d===0?'pulse':''}" data-pl="sel" data-id="${p.id}" aria-pressed="${PL.sel===p.id}" aria-label="${esc(pn(p))}, ${big}" style="opacity:${dim?.35:1}"><span class="pl-liquid" style="height:${fill}%"></span><span class="pl-wline" style="bottom:calc(${fill}% - 2px)"></span><span class="pl-tc"><span class="pl-th"><b>${pn(p)}</b><i></i></span><span class="pl-tb"><b>${big}</b><small>${sm}</small></span></span></button>`}).join('');
   const r=rows.find(x=>x.p.id===PL.sel)||rows[0],p=r.p,bad=r.out||r.low,gap=Math.max(0,r.lead*24-r.days0*24),sug=suggest(p),price=fin?` · ${rm0(sug*p.cost)}`:'';
   let story;
   if(r.ord)story=L(`You ordered ${fq(r.ord)} ${U(p.unit)}. ${p.sup} delivers in ${r.lead} day${r.lead>1?'s':''}.${gap>0?` Stock still runs out about ${Math.round(gap)} hours before it arrives, so order earlier next time.`:' It arrives before you run out.'}`,`Anda order ${fq(r.ord)} ${U(p.unit)}. ${p.sup} hantar dalam ${r.lead} hari.${gap>0?` Stok masih habis kira-kira ${Math.round(gap)} jam sebelum tiba, jadi order lebih awal lain kali.`:' Ia tiba sebelum stok habis.'}`);
   else if(r.needsOrder)story=L(`${pn(p)} runs out in ${dtxt(r.days0)}. You use about ${fq(p.avg)} ${U(p.unit)} a day and ${p.sup} needs ${r.lead} day${r.lead>1?'s':''} to deliver${gap>0?`, so you would be without it for about ${Math.round(gap)} hours.`:'.'}${fin?` A ${sug} ${U(p.unit)} order costs ${rm0(sug*p.cost)}.`:''}`,`${pn(p)} habis dalam ${dtxt(r.days0)}. Anda guna kira-kira ${fq(p.avg)} ${U(p.unit)} sehari dan ${p.sup} ambil ${r.lead} hari untuk hantar${gap>0?`, jadi anda tiada stok kira-kira ${Math.round(gap)} jam.`:'.'}${fin?` Order ${sug} ${U(p.unit)} berharga ${rm0(sug*p.cost)}.`:''}`);
   else if(r.canUse&&!r.handled)story=L(`${fq(p.qty)} ${U(p.unit)} of ${pn(p).toLowerCase()} expires in ${p.exp} days${fin?`, worth ${rm0(p.qty*p.cost)} at cost`:''}. Use it first or put it on special so it does not go to waste.`,`${fq(p.qty)} ${U(p.unit)} ${pn(p).toLowerCase()} luput dalam ${p.exp} hari${fin?`, bernilai ${rm0(p.qty*p.cost)} pada kos`:''}. Guna dahulu atau jadikan promosi supaya tidak terbuang.`);
   else if(r.handled)story=L(`${pn(p)} is marked to use first. The team sees it on their task list.`,`${pn(p)} ditanda guna dahulu. Pasukan nampak ia dalam senarai tugas.`);
   else story=L(`${pn(p)} is healthy: about ${dtxt(r.days0)} of stock. Nothing needs you here.`,`${pn(p)} sihat: kira-kira ${dtxt(r.days0)} stok. Tiada tindakan diperlukan.`);
   const chip=r.out?L('Out of stock','Stok habis'):bad?L('Act now','Bertindak'):(r.soon||r.expiring||r.expired)?L('Watch','Perhati'):L('Healthy','Sihat'),ck=r.out||bad?'bad':(r.soon||r.expiring||r.expired)?'warn':'ok';
   const healthy=!r.needsOrder&&!r.ord&&!r.canUse;
   const acts=`${r.needsOrder?`<button class="btn primary pl-act" data-pl="order" data-id="${p.id}">${L('Order','Order')} ${sug} ${U(p.unit)}${price}</button>`:''}${r.ord?`<span class="pl-done">${L(`Ordered. ${p.sup} delivers in ${r.lead} day${r.lead>1?'s':''}.`,`Dah order. ${p.sup} hantar dalam ${r.lead} hari.`)}</span>`:''}${r.canUse&&!r.handled?`<button class="btn pl-act pl-use" data-pl="use" data-id="${p.id}">${L('Use first or put on special','Guna dahulu atau jadikan promosi')}</button>`:''}${r.handled?`<span class="pl-done">${L('Marked to use first','Ditanda guna dahulu')}</span>`:''}${healthy?`<span class="pl-done">${L('Nothing to do here','Tiada tindakan di sini')}</span>`:''}`;
   const risk=rows.filter(x=>x.expiring||x.expired).reduce((a,x)=>a+x.p.qty*x.p.cost,0),waste=sum(S.waste.map(w=>w.amt)),open=S.orders.filter(o=>!o.done).length;
   const kp=(cap,val,sp,sub,tn,sc)=>`<div class="pl-kpi"><span>${cap}</span><b>${val}</b><svg viewBox="0 0 100 26" preserveAspectRatio="none" aria-hidden="true"><polyline points="${sparkPts(sp)}" fill="none" stroke="${sc||'var(--accent)'}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg><em class="${tn||''}">${sub}</em></div>`;
   const kpis=own?kp(L('Cost today','Kos hari ini'),rm0(costToday()),seriesN(7),`${pct>=0?'+':''}${pct}% ${L('vs your average','berbanding purata')}`,pct>10?'warn':'ok','var(--warn)')
     +kp(L('Waste this week','Sisa minggu ini'),rm0(waste),S.waste.map(w=>w.amt).reverse().concat(0).slice(0,7),L('Actual, this week','Sebenar, minggu ini'),waste>30?'warn':'ok','var(--ok)')
     +kp(L('Approvals waiting','Kelulusan menunggu'),String(pending().length),wob(2,7,pending().length+1),pending().length?L('Tap Approve to review','Ketik Lulus untuk semak'):L('All clear','Semua selesai'),pending().length?'warn':'ok','var(--warn)')
     +kp(L('Money at risk','Wang berisiko'),rm0(risk),wob(7,7,risk+1),L('Estimate: expires within 3 days','Anggaran: luput dalam 3 hari'),'',''):
     kp(L('Team tasks','Tugas pasukan'),`${doneT} ${L('of','daripada')} ${S.tasks.length}`,wob(3,7,doneT+1),S.tasks.find(t=>!t.done)?L(S.tasks.find(t=>!t.done).en,S.tasks.find(t=>!t.done).ms):L('All done','Semua siap'),'','#AF52DE')
     +kp(L('Deliveries open','Penghantaran terbuka'),String(open),wob(5,7,open+1),open?L('Orders on the way','Order dalam perjalanan'):L('No open orders','Tiada order terbuka'),'','var(--ok)')
     +kp(L('Approvals waiting','Kelulusan menunggu'),String(pending().length),wob(2,7,pending().length+1),pending().length?L('Waiting for the owner','Menunggu pemilik'):L('All clear','Semua selesai'),pending().length?'warn':'ok','var(--warn)')
     +kp(L('Items to reorder','Item untuk order semula'),String(fixO.length),wob(9,7,fixO.length+1),L('Tap a tile to order','Ketik ubin untuk order'),fixO.length?'warn':'ok','var(--bad)');
   const headline=gain===0?(d===0?L('Everything that needs you is handled. Nice work.','Semua yang perlukan anda sudah diurus. Syabas.'):L('With your actions in place, this is how the next days look.','Dengan tindakan anda, beginilah hari-hari seterusnya.'))
     :(own?L(`${d===0?'Right now':dayLabel} ${need} thing${need===1?'':'s'} need${need===1?'s':''} you. Fix ${need===1?'it':'them'} and the score climbs to ${best}.`,`${d===0?'Sekarang':dayLabel} ${need} perkara perlukan anda. Selesaikan dan skor naik ke ${best}.`):L(`${need} thing${need===1?'':'s'} to sort out. Doing ${need===1?'it':'them'} lifts readiness to ${best}.`,`${need} perkara untuk diselesaikan. Buat semuanya, kesediaan naik ke ${best}.`));
   const dstr=new Date().toLocaleDateString(S.lang==='ms'?'ms-MY':'en-GB',{weekday:'long',day:'numeric',month:'long'});
   return `<div class="pl t-${tone}">
   <section class="pl-hero" aria-label="${L('Business pulse','Denyut bisnes')}">
    <div class="pl-left">
     <div><div class="pl-date">${dstr}</div><h1 class="pl-h1">${greet()}, ${who()}</h1></div>
     <div class="pl-scorerow"><div class="pl-score" data-to="${score}">${PL.shown}</div><div class="pl-vd"><span class="pl-chip">${verdict}</span><span class="pl-when">${own?(d===0?L('Business health today','Kesihatan bisnes hari ini'):L('Projected, ','Unjuran, ')+dayLabel.toLowerCase()):(d===0?L('Operations readiness today','Kesediaan operasi hari ini'):L('Projected, ','Unjuran, ')+dayLabel.toLowerCase())}</span></div></div>
     <div><div class="pl-gauge"><i class="pl-gain" style="left:${score}%;width:${gain}%"></i><i class="pl-knob" style="left:calc(${score}% - 13px)"></i></div>
      <div class="pl-gl"><span>${L('At risk','Berisiko')}</span><span>${L('Fair','Sederhana')}</span><span>${L('Good','Baik')}</span></div>
      <p class="pl-head">${headline}</p></div>
     <div class="pl-btns"><button class="btn primary pl-fix ${gain===0?'done':''}" data-pl="fix" data-order="${fixO.join(',')}" data-use="${fixU.join(',')}">${gain===0?L('All fixed','Semua selesai'):L('Fix everything','Selesaikan semua')+' · +'+gain}</button><button class="btn pl-play" data-pl="play">${PL.playing?L('Pause','Jeda'):L('Play next 7 days','Main 7 hari akan datang')}</button>${S.demoMode?`<button class="btn" data-pl="reset">${L('Reset view','Set semula paparan')}</button>`:''}</div>
     <div class="pl-pillars">${pillars}</div>
    </div>
    <div class="pl-right">
     <div class="pl-rh"><div><div class="pl-h2">${L('Your stock room, live','Bilik stok anda, secara langsung')}</div><div class="pl-sub">${L('Fuller means more stock. Tap an item to see the story and fix it.','Lebih penuh bermakna lebih stok. Ketik item untuk lihat cerita dan selesaikan.')}</div></div>
      <div class="pl-legend"><span><i style="background:var(--bad)"></i>${L('Act now','Bertindak')}</span><span><i style="background:var(--warn)"></i>${L('Watch','Perhati')}</span><span><i style="background:var(--ok)"></i>${L('Healthy','Sihat')}</span></div></div>
     <div class="pl-tiles">${tiles}</div>
     <div class="pl-slider"><div class="pl-sl-h"><label for="pl-day">${L('Drag to see what happens next','Seret untuk lihat apa berlaku seterusnya')}</label><b>${dayLabel}</b></div>
      <input id="pl-day" type="range" min="0" max="7" step="0.1" value="${d}" aria-label="${L('Days from now','Hari dari sekarang')}"><div class="pl-sl-t"><span>${L('Now','Sekarang')}</span><span>+2 ${L('days','hari')}</span><span>+4 ${L('days','hari')}</span><span>+7 ${L('days','hari')}</span></div></div>
     <div class="pl-toast ${PL.toast?'on':''}" role="status">${esc(PL.toast)}</div>
    </div>
   </section>
   <div class="pl-low">
    <section class="pl-story" aria-label="${L('Item story','Cerita item')}">
     <div class="pl-sh"><div><div class="pl-kick">${L('The story','Ceritanya')}</div><h2>${pn(p)}</h2></div><span class="pl-chip k-${ck}">${chip}</span></div>
     <p class="pl-p">${story}</p>
     <div><div class="pl-rn"><span>${L('Stock runway, 0 to 10 days','Landasan stok, 0 hingga 10 hari')}</span><span>${dtxt(r.daysNow)} ${d===0?L('left now','berbaki sekarang'):L('left at this point','berbaki pada ketika ini')}</span></div>
      <div class="pl-run"><u class="k-${r.out||bad?'bad':r.soon?'warn':'ok'}" style="width:${clamp(r.daysNow/10*100,0,100)}%"></u><s style="left:${r.lead/10*100}%" title="${L('Supplier delivery time','Masa penghantaran pembekal')}"></s><em style="left:calc(${clamp(d/10*100,0,100)}% - 9px)"></em></div>
      <div class="pl-rl"><span><b class="mk"></b>${p.sup} ${L('delivery time','masa hantar')}</span><span><b class="dot"></b>${L('The day you are looking at','Hari yang anda lihat')}</span></div></div>
     <div class="pl-acts">${acts}</div>
    </section>
    <section class="pl-kpis" aria-label="${L('Today at a glance','Hari ini sekilas pandang')}">${kpis}</section>
   </div>
   <p class="demo-note">${fin?'':L('Costs and values are hidden for your role. The owner can allow them in Rules. ','Kos dan nilai disembunyikan untuk peranan anda. Pemilik boleh benarkan dalam Tetapan. ')}${L('All figures are sample data for demonstration.','Semua nombor ialah data contoh untuk demo.')}</p></div>`;
  }

  return { home:()=>S.role==='staff'?homeStaff():homePulse() };
}
