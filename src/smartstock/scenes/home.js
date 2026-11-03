/* Scene "home" – one file per page. Receives the shared engine API and returns its render functions. */
export default function homeScene(api) {
  const { S, L, sayHint, examples, ic, ringSet, P, costToday, costAvg, pending, clamp, seriesN, pn, eta, esc, orderSay, suggest, U, fq, greet, rm0 } = api;

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

  return { home:()=>S.role==='admin'?homeAdmin2():homeStaff() };
}
