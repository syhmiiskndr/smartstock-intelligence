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

  function homeOwner(){
   const low=P.filter(p=>p.qty<=p.reorder),pend=pending(),pa=pend.reduce((a,r)=>a+r.amount,0);
   const cost=costToday(),pct=Math.round((cost/costAvg()-1)*100);
   const health=clamp(100-10*low.length-3*P.filter(p=>p.exp<=3).length-(pct>10?4:0)-pend.length,0,100);
   const sH=Math.round((P.length-low.length)/P.length*100),fH=Math.round(P.filter(p=>p.exp>3).length/P.length*100),cH=clamp(100-Math.max(0,pct),0,100);
   const al=alerts(),waste=S.waste.reduce((a,w)=>a+w.amt,0);
   const risk=P.filter(p=>p.exp<=3).reduce((a,p)=>a+p.qty*p.cost,0);
   const ser=seriesN(S.range),mx=Math.max(...ser)*1.12,bw=Math.floor(640/ser.length),W=bw*ser.length;
   const bars=ser.map((v,i)=>{const h=v/mx*120;return `<rect x="${i*bw+3}" y="${140-h}" width="${bw-6}" height="${h}" rx="5" fill="${i===ser.length-1?'var(--accent)':'var(--accent-soft)'}" data-tip="${i===ser.length-1?L('Today','Hari ini'):api.dateStr(i-(ser.length-1))}: ${rm0(ser[i])}"/>`}).join('');
   const brief=[
    low.length?L(`${low.length} item${low.length>1?'s':''} will run out before the next delivery.`,`${low.length} item akan habis sebelum penghantaran seterusnya.`):L('Stock levels are healthy.','Paras stok baik.'),
    L(`Cost today is ${rm0(cost)}, ${Math.abs(pct)}% ${pct>=0?'above':'below'} your average.`,`Kos hari ini ${rm0(cost)}, ${Math.abs(pct)}% ${pct>=0?'melebihi':'bawah'} purata.`),
    pend.length?L(`${pend.length} approval${pend.length>1?'s':''} (${rm0(pa)}) waiting for you.`,`${pend.length} kelulusan (${rm0(pa)}) menunggu anda.`):L('No approvals waiting.','Tiada kelulusan menunggu.')];
   const kpi=(go,cap,val,sub,tone)=>`<button class="w w-m" data-go="${go}" style="grid-column:span 3;text-align:left;align-items:flex-start"><span class="cap">${cap}</span><span class="num">${val}</span><span class="pill ${tone||''}">${sub}</span></button>`;
   return `<div class="hello"><h1 class="h1">${greet()}, ${who()}</h1><span class="say">${L('Action Centre · what needs you today','Pusat Tindakan · apa yang perlukan anda hari ini')}</span></div>
   <div class="widgets">
    <div class="w w-health"><span class="cap">${L('Business health','Kesihatan bisnes')}</span><div class="health-body"><div class="hr">${ringSet([{k:'stock',v:clamp(health,3,100),crit:health<50}],160,18)}<div class="ctr"><b>${health}<span>%</span></b></div></div>
     <div class="hl"><div class="c1"><b>${sH}%</b>${L('Stock above minimum','Stok melebihi minimum')}</div><div class="c2"><b>${fH}%</b>${L('Items fresh','Item segar')}</div><div class="c3"><b>${cH}%</b>${L('Cost control','Kawalan kos')}</div></div></div>
     <button class="tbtn" data-speak="1">${ic('spk',16)}<span>${L('Hear briefing','Dengar ringkasan')}</span></button></div>
    <div class="w w-s"><span class="cap">${ic('mic',14)} ${L('Daily briefing','Ringkasan harian')}</span>
     <div class="nl">${brief.map(t=>`<div><i class="${/run out|habis/.test(t)?'bad':''}"></i><span><b style="font-weight:500">${t}</b></span></div>`).join('')}</div></div>
    <div class="w w-m" style="grid-column:span 7"><span class="cap">${L('Money at risk','Wang berisiko')}</span><span class="num">${rm0(risk)}</span>
     <span class="say" style="margin:0">${L('Estimate: stock that expires within 3 days if not used or promoted. Not a confirmed loss.','Anggaran: stok yang luput dalam 3 hari jika tidak digunakan atau dipromosi. Bukan kerugian sebenar.')}</span></div>
    ${kpi('stock',L('Stock value','Nilai stok'),rm0(api.stockValue()),L('actual','sebenar'))}
    ${kpi('cost',L('Cost today','Kos hari ini'),rm0(cost),`${pct>=0?'+':''}${pct}% ${L('vs avg','dari purata')}`,pct>10?'warn':'ok')}
    ${kpi('cost',L('Waste this week','Sisa minggu ini'),rm0(waste),L('actual','sebenar'),waste>30?'warn':'ok')}
    ${kpi('ops',L('Approvals','Kelulusan'),String(pend.length),pend.length?`${rm0(pa)} ${L('waiting','menunggu')}`:L('clear','kosong'),pend.length?'warn':'ok')}
    <div class="w" style="grid-column:1/-1"><span class="cap">${L('Cost activity','Aktiviti kos')} · <button class="btn" data-go="analytics" style="padding:2px 10px">${L('Explore analytics','Terokai analitik')}</button></span>
     <svg class="chart" viewBox="0 0 ${W} 150" role="img" aria-label="${L('Daily cost','Kos harian')}">${bars}</svg>
     <div class="legend"><span><i style="background:var(--accent)"></i>${L('Today','Hari ini')} · ${L('actual','sebenar')}</span><span><i style="background:var(--accent-soft)"></i>${L('Earlier days','Hari lalu')}</span></div></div>
    <div class="w" style="grid-column:1/-1"><span class="cap">${L('Needs attention','Perlu perhatian')} <span class="pill ${al.length?'warn':'ok'}">${al.length}</span></span>${alertHtml(al)}</div>
    <div class="w" style="grid-column:1/-1"><span class="cap">${L('Recent activity','Aktiviti terkini')}</span><div class="mv">${recent(5)}</div></div>
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
