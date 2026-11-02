(()=>{
'use strict';
const $=(s,el=document)=>el.querySelector(s);
const $$=(s,el=document)=>[...el.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const r2=n=>Math.round(n*100)/100;
const fq=n=>{n=r2(n);return Number.isInteger(n)?String(n):n.toFixed(1)};
const rm=n=>'RM '+n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const rm0=n=>'RM '+Math.round(n).toLocaleString('en-US');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

const IC={
 home:'M3 11l9-8 9 8M5 10v10h14V10',
 box:'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
 coin:'M12 3v18M16.500 7H10a3 3 0 000 6h4a3 3 0 010 6H7.500',
 leaf:'M5 19C5 10 11 4 20 4c0 9-6 15-15 15zM5 19l8-8',
 check:'M20 6L9 17l-5-5',
 users:'M16 20v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M9.500 10a3.500 3.500 0 100-7 3.500 3.500 0 000 7M21 20v-2a4 4 0 00-3-3.900M16 3.100a3.500 3.500 0 010 6.800',
 grid:'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
 kbd:'M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M7 14h10',
 mic:'M12 3a3 3 0 013 3v6a3 3 0 01-6 0V6a3 3 0 013-3zM5 11a7 7 0 0014 0M12 18v3',
 bell:'M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4',
 sliders:'M4 6h8M16 6h4M4 12h2M10 12h10M4 18h12M12 4v4M8 10v4M16 16v4',
 out:'M9 21H5V3h4M16 17l5-5-5-5M21 12H9',
 clock:'M12 7v5l3 2M21 12a9 9 0 11-3-6.700L21 8M21 3v5h-5',
 x:'M6 6l12 12M18 6L6 18',
 play:'M7 4l13 8-13 8z',
 stop:'M6 6h12v12H6z',
 spk:'M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 010 6',
 send:'M4 12l16-8-6 16-3-7z',
 down:'M12 4v13M6 12l6 6 6-6',
 up:'M12 20V7M6 12l6-6 6 6',
 alert:'M12 4l10 17H2zM12 10v5M12 18h.01',
 clockw:'M12 6v6l4 2M12 21a9 9 0 100-18 9 9 0 000 18z',
 trash:'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
 trend:'M3 17l6-6 4 4 8-8M15 7h6v6'
};
const ic=(n,s=20)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IC[n]}"/></svg>`;

/* ---- data (contoh / illustrative) ---- */
const P=[
 {id:'ayam',name:'Ayam',en:'Chicken',unit:'kg',qty:4.2,cap:40,reorder:10,cost:9.5,exp:2,avg:9,sup:'Segar Jaya'},
 {id:'tepung',name:'Tepung',en:'Flour',unit:'kg',qty:38,cap:50,reorder:15,cost:3.2,exp:120,avg:11,sup:'Mill Sentosa'},
 {id:'minyak',name:'Minyak',en:'Oil',unit:'L',qty:14,cap:25,reorder:8,cost:7.5,exp:200,avg:6,sup:'Mill Sentosa'},
 {id:'susu',name:'Susu',en:'Milk',unit:'L',qty:26,cap:40,reorder:10,cost:6.8,exp:3,avg:11,sup:'Ladang Hijau'},
 {id:'telur',name:'Telur',en:'Eggs',unit:'biji',qty:240,cap:360,reorder:100,cost:.55,exp:12,avg:85,sup:'Segar Jaya'},
 {id:'beras',name:'Beras',en:'Rice',unit:'kg',qty:70,cap:100,reorder:30,cost:3.8,exp:300,avg:15,sup:'Mill Sentosa'},
 {id:'pisang',name:'Pisang',en:'Banana',unit:'kg',qty:14,cap:20,reorder:6,cost:4.5,exp:2,avg:6,sup:'Ladang Hijau'},
 {id:'bawang',name:'Bawang',en:'Onion',unit:'kg',qty:9,cap:20,reorder:8,cost:5.2,exp:25,avg:4,sup:'Segar Jaya'}
];
const prod=id=>P.find(p=>p.id===id);
const L=(en,ms)=>S.lang==='ms'?ms:en;
const pn=p=>L(p.en,p.name);
const U=u=>u==='biji'?L('pcs','biji'):u;
const uw=u=>S.lang==='ms'?{kg:'kilo',L:'liter',biji:'biji'}[u]:{kg:'kg',L:'litres',biji:'pieces'}[u];
const S={
 role:'admin',scene:'home',filter:'all',lang:'en',draft:null,pulse:null,demo:false,micBlocked:false,
 use:{ayam:14,tepung:12,minyak:6,susu:12,telur:90,beras:15,pisang:6,bawang:4},
 series:[352,388,371,405,366,389],
 requests:[{id:1,kind:'writeoff',title:'',tkey:'wo',item:'susu',qty:3,amount:20.4,by:'Siti',reason:'',rkey:'exp',status:'pending'}],
 waste:[{n:'Susu',amt:13.6},{n:'Pisang',amt:9},{n:'Telur',amt:5.5},{n:'Bawang',amt:4.2}],
 tasks:[{id:'t1',en:'Check banana freshness',ms:'Semak kesegaran pisang',done:false,key:'fresh'},{id:'t2',en:'Receive 10 L milk',ms:'Terima 10 L susu',done:false,key:'receive:susu'},{id:'t3',en:'Log chicken usage',ms:'Rekod guna ayam',done:false,key:'usage:ayam'}],
 audit:[],fresh:{res:null,scanning:false,n:0},rid:2
};
S.notes=[];S.range=7;S.orders=[];S.user=null;S.drawer=null;
S.rules={lowAlert:true,expAlert:true,anomaly:true,confirm:true,limit:15};
S.moves=[{p:'ayam',type:'usage',q:3,t:'08:40',who:'Syafiq'},{p:'susu',type:'receive',q:20,t:'07:55',who:'Hakim'},{p:'ayam',type:'receive',q:20,t:'Yesterday',who:'Hakim'},{p:'telur',type:'usage',q:30,t:'09:10',who:'Syafiq'},{p:'ayam',type:'usage',q:4,t:'10:25',who:'Syafiq'}];
const costToday=()=>P.reduce((a,p)=>a+(S.use[p.id]||0)*p.cost,0);
const costAvg=()=>S.series.reduce((a,b)=>a+b,0)/S.series.length;
const stockValue=()=>P.reduce((a,p)=>a+p.qty*p.cost,0);
const pending=()=>S.requests.filter(r=>r.status==='pending');
const eta=p=>{const h=p.qty/p.avg*24;return h<1?L('under 1 hour','kurang 1 jam'):h<36?Math.round(h)+L(' hours',' jam'):(h/24).toFixed(1)+L(' days',' hari')};
const suggest=p=>Math.max(10,Math.round((p.avg*2.5-p.qty)/10)*10);
const EX={
 ms:{admin:['Buka stok produk','Tunjuk stok rendah','Kenapa kos naik?','Bila ayam habis?','Order 20 kilo ayam','Lulus','Imbas pisang'],
     staff:['Ayam dah guna 2 kilo','Terima 10 liter susu','Buang 1 kilo pisang','Imbas pisang','Buka stok']},
 en:{admin:['Open product stock','Show low stock','Why did costs rise?','When will chicken run out?','Order 20 kg chicken','Approve','Scan banana'],
     staff:['We used 2 kg chicken','Receive 10 litres milk','Waste 1 kg banana','Scan banana','Open stock']}
};
const examples=()=>EX[S.lang][S.role];

/* ---- scenes ---- */
const greet=()=>{const h=new Date().getHours();return h<11?L('Good morning','Selamat pagi'):h<15?L('Good afternoon','Selamat tengah hari'):h<19?L('Good evening','Selamat petang'):L('Good evening','Selamat malam')};
const sh=(t,m)=>`<div class="sh"><h1 class="h1">${t}</h1><p class="meta">${m}</p></div>`;
const sayHint=t=>`<span class="say">${L('or say','atau sebut')} <q>${esc(t)}</q></span>`;
const orderSay=p=>`Order ${suggest(p)} ${uw(p.unit)} ${pn(p).toLowerCase()}`;
const reqTitle=r=>{const p=prod(r.item),a=`${fq(r.qty)} ${U(p.unit)} ${pn(p)}`;return r.kind==='order'?`Order ${a}`:L(`Write off ${a}`,`Tulis-off ${a}`)};
const reqReason=r=>{const p=prod(r.item);return r.rkey==='exp'?L('Expired','Luput'):r.rkey==='rep'?L('Reported spoiled','Dilapor rosak'):L('Runs out in ','Habis dalam ')+eta(p)};
const byName=b=>b==='staff'?L('Staff','Staf'):b;

function homeAdmin(){
 const low=P.filter(p=>p.qty<=p.reorder), exp=P.filter(p=>p.exp<=3&&!low.includes(p)).sort((a,b)=>a.exp-b.exp);
 const cost=costToday(), pct=Math.round((cost/costAvg()-1)*100), pend=pending().length;
 const health=clamp(100-10*low.length-3*P.filter(p=>p.exp<=3).length-(pct>10?4:0)-pend,0,100);
 const c=2*Math.PI*54, waste=S.waste.reduce((a,w)=>a+w.amt,0);
 const tone=health>=80?'var(--ok)':health>=60?'var(--warn)':'var(--bad)';
 let cards='';
 low.forEach(p=>{cards+=`<div class="ins"><span class="ins-ic bad">${ic('alert',26)}</span><h3>${L(`${pn(p)} runs out in ${eta(p)}`,`${pn(p)} habis dalam ${eta(p)}`)}</h3><span class="big">${fq(p.qty)} ${U(p.unit)}</span><button class="btn primary" data-say="${esc(orderSay(p))}">Order ${suggest(p)} ${U(p.unit)}</button></div>`});
 if(exp[0]){const p=exp[0];cards+=`<div class="ins"><span class="ins-ic warn">${ic('leaf',26)}</span><h3>${L(`${pn(p)} expires in ${p.exp} days`,`${pn(p)} luput ${p.exp} hari`)}</h3><span class="big">${fq(p.qty)} ${U(p.unit)}</span><button class="btn" data-say="${L('Scan','Imbas')} ${pn(p).toLowerCase()}">${L('Scan freshness','Imbas segar')}</button></div>`}
 cards+=`<div class="ins"><span class="ins-ic ok">${ic('trend',26)}</span><h3>${L(`Cost today is ${pct>=0?'up':'down'} ${Math.abs(pct)}%`,`Kos hari ini ${pct>=0?'naik':'turun'} ${Math.abs(pct)}%`)}</h3><span class="big">${rm0(cost)}</span><button class="btn" data-say="${L('Why did costs rise','Kenapa kos naik')}">${L('Why?','Kenapa?')}</button></div>`;
 if(pend)cards+=`<div class="ins"><span class="ins-ic ok">${ic('check',26)}</span><h3>${L(`${pend} awaiting approval`,`${pend} menunggu kelulusan`)}</h3><span class="big">${rm0(pending().reduce((a,r)=>a+r.amount,0))}</span><button class="btn" data-go="ops">${L('Review','Semak')}</button></div>`;
 return `<div class="hello"><h1 class="h1">${greet()}, Syahmi</h1></div>
 <div class="home"><div class="health">
  <div class="ring"><svg width="176" height="176" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="none" stroke="var(--surface-2)" stroke-width="9"/><circle cx="60" cy="60" r="54" fill="none" stroke="${tone}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(health/100*c).toFixed(1)} ${c.toFixed(1)}" style="transition:stroke-dasharray 1s"/></svg><b>${health}</b><small>${L('business health','kesihatan bisnes')}</small></div>
  <div class="stats"><div><b>${rm0(stockValue())}</b><span>${L('stock value','nilai stok')}</span></div><div><b>${rm0(cost)}</b><span>${L('cost today','kos hari ini')}</span></div><div><b>${rm0(waste)}</b><span>${L('waste this week','sisa minggu ini')}</span></div></div>
  <button class="tbtn" data-speak="1" style="align-self:flex-start">${ic('spk',16)}<span>${L('Hear briefing','Dengar ringkasan')}</span></button>
 </div><div class="cards">${cards}</div></div>
 <p class="demo-note">${L('All figures are sample data for demonstration.','Semua nombor ialah data contoh untuk demo.')}</p>`;
}

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

function stockScene(){
 const f=S.filter, isLow=p=>p.qty<=p.reorder, isExp=p=>p.exp<=3;
 const ln=P.filter(isLow).length, en=P.filter(isExp).length;
 const jars=P.map(p=>{
  const pct=clamp(p.qty/p.cap*100,2,100), rp=p.reorder/p.cap*100, tone=isLow(p)?'bad':isExp(p)?'warn':'ok';
  const dim=f==='low'?!isLow(p):f==='exp'?!isExp(p):false;
  return `<button class="jar ${tone} ${dim?'dim':''} ${S.pulse===p.id?'pulse':''}" data-jar="${p.id}" style="--fill:${pct}%;--rp:${rp}%" aria-label="${pn(p)} ${fq(p.qty)} ${U(p.unit)}"><span class="vessel"><span class="liquid"></span><span class="mark"></span><span class="qty"><b>${fq(p.qty)}</b><small>${U(p.unit)}</small></span>${isExp(p)?`<span class="exp">${p.exp} ${L('days','hari')}</span>`:''}</span><span class="jname">${pn(p)}</span></button>`}).join('');
 S.pulse=null;
 const meta=S.role==='admin'?`${P.length} ${L('items','item')} · ${rm0(stockValue())}`:`${P.length} ${L('items','item')}`;
 return `${sh(L('Stock','Stok'),meta)}
 <div class="filters" role="group" aria-label="${L('Filter','Tapis')}">
  <button class="chip" data-filter="all" aria-pressed="${f==='all'}">${L('All','Semua')}</button>
  <button class="chip" data-filter="low" aria-pressed="${f==='low'}">${L('Low','Rendah')} ${ln}</button>
  <button class="chip" data-filter="exp" aria-pressed="${f==='exp'}">${L('Expiring soon','Hampir luput')} ${en}</button>
 </div><div class="jars">${jars}</div>
 <p class="demo-note">${L('The dashed line is the minimum level. Tap a jar for details.','Garisan putus-putus ialah paras minimum. Tekan balang untuk butiran.')}</p>`;
}

function costScene(){
 const cost=costToday(), avg=costAvg(), pct=Math.round((cost/avg-1)*100);
 const days=[...S.series,cost], W=560,H=170,bw=48,gap=(W-bw*7)/6, max=Math.max(...days)*1.2;
 const lab=i=>i===6?L('Today','Hari ini'):new Date(Date.now()-(6-i)*864e5).toLocaleDateString(S.lang==='ms'?'ms-MY':'en-GB',{weekday:'short'});
 const bars=days.map((v,i)=>{const h=v/max*H, x=i*(bw+gap);return `<rect x="${x}" y="${H-h}" width="${bw}" height="${h}" rx="10" fill="${i===6?'var(--accent)':'var(--accent-soft)'}"/><text x="${x+bw/2}" y="${H+18}" text-anchor="middle">${lab(i)}</text>${i===6?`<text x="${x+bw/2}" y="${H-h-8}" text-anchor="middle" style="fill:var(--ink);font-weight:600">${Math.round(v)}</text>`:''}`}).join('');
 const ay=H-avg/max*H;
 const vals=p=>S.use[p.id]*p.cost, top=[...P].sort((a,b)=>vals(b)-vals(a)).slice(0,4);
 const drv=top.map(p=>`<div class="drv"><span style="text-align:left;color:var(--ink)">${pn(p)}</span><i><u style="width:${(vals(p)/vals(top[0])*100).toFixed(0)}%"></u></i><span>${rm0(vals(p))}</span></div>`).join('');
 return `${sh(L('Cost','Kos'),L(`6-day average ${rm0(avg)}`,`purata 6 hari ${rm0(avg)}`))}
 <div class="bignum">${rm0(cost)}</div>
 <span class="pill ${pct>10?'warn':'ok'}">${pct>=0?'+':''}${pct}% ${L('vs average','dari purata')}</span>
 <svg class="chart" viewBox="0 0 ${W} ${H+26}" role="img" aria-label="${L('7-day cost','Kos 7 hari')}"><line x1="0" x2="${W}" y1="${ay}" y2="${ay}" stroke="var(--ink-2)" stroke-dasharray="4 5" opacity=".6"/><text x="${W}" y="${ay-6}" text-anchor="end">${L('average','purata')}</text>${bars}</svg>
 <h2 class="h2">${L('Biggest cost drivers','Paling banyak guna kos')}</h2><div class="drivers">${drv}</div>
 <span class="say" style="margin-top:14px">${L('ask','tanya')} <q>${L('Why did costs rise?','Kenapa kos naik?')}</q></span>`;
}

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

function opsScene(){
 const pend=pending(), t=pend[0];
 const auto=[L('Costs recalculated','Kos dikira semula'),L('Low-stock alert sent','Amaran stok rendah dihantar'),L('Daily report 10 pm','Laporan harian 10 malam')].map(x=>`<span class="pill ok">${ic('check',13)}${x}</span>`).join('');
 if(!t)return `${sh(L('Approve','Lulus'),L('nothing waiting','tiada menunggu'))}<div class="empty"><i>${ic('check',32)}</i><div><h2 class="h2" style="margin:0">${L('All clear','Semua selesai')}</h2><span class="say">${L('New recommendations will appear here.','Cadangan baru akan muncul di sini.')}</span></div></div><div class="auto">${auto}</div>`;
 const kind=t.kind==='order'?L('Suggested order','Cadangan order'):L('Stock write-off','Tulis-off stok');
 return `${sh(L('Approve','Lulus'),`${pend.length} ${L('waiting','menunggu')}`)}
 <div class="deck">${pend.length>2?'<div class="rcard back b2"></div>':''}${pend.length>1?'<div class="rcard back"></div>':''}
  <article class="rcard top" id="rtop"><span class="pill ${t.kind==='order'?'':'warn'}">${kind}</span><h3>${esc(reqTitle(t))}</h3><div class="amt">${rm0(t.amount)}</div>
  <div class="row"><span class="pill">${esc(byName(t.by))}</span>${t.supplier?`<span class="pill">${esc(t.supplier)}</span>`:''}<span class="pill ${t.kind==='order'?'bad':'warn'}">${esc(reqReason(t))}</span></div>
  <div class="row" style="margin-top:20px"><button class="btn big" data-decide="no">${L('Reject','Tolak')}</button><button class="btn ok big" data-decide="ok" style="flex:1">${L('Approve','Lulus')}</button></div></article></div>
 <span class="say">${L('Drag the card right, or say','Seret kad ke kanan, atau sebut')} <q>${L('approve','lulus')}</q></span><div class="auto">${auto}</div>`;
}

function peopleScene(){
 const team=[['Syahmi','Admin',1],['Syafiq',L('Staff','Staf'),1],['Siti',L('Staff','Staf'),0],['Hakim',L('Staff','Staf'),1]];
 const sups=[['Segar Jaya',['Ayam','Telur','Bawang']],['Mill Sentosa',['Tepung','Beras','Minyak']],['Ladang Hijau',['Susu','Pisang']]];
 const nm=n=>pn(P.find(p=>p.name===n));
 return `${sh(L('People','Orang'),L('3 online now','3 aktif sekarang'))}
 <h2 class="h2">${L('Team','Pasukan')}</h2><div class="cluster">${team.map(([n,r,o])=>`<div class="av"><i class="${o?'on':''}">${n[0]}</i>${n}<small>${r}</small></div>`).join('')}</div>
 <h2 class="h2">${L('Suppliers','Pembekal')}</h2><div class="cluster">${sups.map(([n,it])=>`<div class="sup"><b>${n}</b><div class="row" style="margin:0">${it.map(i=>`<span class="pill">${nm(i)}</span>`).join('')}</div></div>`).join('')}</div>`;
}

const SCENES={
 home:()=>S.role==='admin'?homeAdmin():homeStaff(),
 stock:stockScene,cost:costScene,fresh:freshScene,ops:opsScene,people:peopleScene
};

/* ---- shell: render, panel, dock ---- */
const stage=$('#stage'), panelEl=$('#panel'), cmdEl=$('#cmd');
let acts=[], panelTimer, hintTimer, hintI=0, typing=null;

function render(bloom){
 stage.innerHTML=SCENES[S.scene]();
 if(bloom){stage.classList.remove('bloom');void stage.offsetWidth;stage.classList.add('bloom');stage.scrollTop=0}
 if(S.scene==='ops')bindOps();
 renderPetals();
}
function go(scene){
 if(S.role==='staff'&&!['home','stock','fresh'].includes(scene))return deny();
 S.scene=scene;closeMenu();render(true);
}
function deny(){
 panel({state:L('No access','Tiada akses'),tone:'bad',title:L('This screen is for admins only.','Skrin ini untuk admin sahaja.'),chips:[{label:L('Open stock','Buka stok'),say:L('Open stock','Buka stok')}],ttl:5000});
}
function panel(o){
 clearTimeout(panelTimer);acts=[];
 const chips=(o.chips||[]).map(c=>{acts.push(c);return `<button class="chip" data-i="${acts.length-1}">${esc(c.label)}</button>`}).join('');
 const btns=(o.actions||[]).map(c=>{acts.push(c);return `<button class="btn ${c.kind||''} ${o.bigBtn?'big':''}" data-i="${acts.length-1}" style="${c.kind==='ok'?'flex:1':''}">${esc(c.label)}</button>`}).join('');
 const facts=o.facts?`<div class="facts">${o.facts.map(([a,b])=>`<div><b>${esc(b)}</b><span>${esc(a)}</span></div>`).join('')}</div>`:'';
 panelEl.className='panel show '+(o.tone||'');panelEl.hidden=false;
 panelEl.innerHTML=`<div class="p-top"><span class="p-state">${esc(o.state||'')}</span><button class="p-x" aria-label="${L('Close','Tutup')}" data-close="1">${ic('x',18)}</button></div>
 ${o.said?`<p class="p-say">“${esc(o.said)}”</p>`:''}${o.title?`<h3>${esc(o.title)}</h3>`:''}${o.big?`<div class="p-big">${esc(o.big)}</div>`:''}
 ${o.body?`<p class="p-body">${esc(o.body)}</p>`:''}${facts}${o.html||''}${btns?`<div class="p-actions">${btns}</div>`:''}${chips?`<div class="p-chips">${chips}</div>`:''}`;
 if(!o.persist)panelTimer=setTimeout(hidePanel,o.ttl||9000);
}
function hidePanel(){panelEl.classList.remove('show')}
panelEl.addEventListener('click',e=>{
 if(e.target.closest('[data-close]')){hidePanel();return}
 const b=e.target.closest('[data-i]');if(!b)return;
 const a=acts[+b.dataset.i];if(!a)return;
 if(a.say)speakSim(a.say);else if(a.fn)a.fn();
});

/* petals */
const NAV={admin:[['home','Home','Utama','home'],['stock','Stock','Stok','box'],['cost','Cost','Kos','coin'],['fresh','Fresh','Segar','leaf'],['ops','Approve','Lulus','check'],['people','People','Orang','users'],['rules','Rules','Tetapan','sliders']],
           staff:[['home','Home','Utama','home'],['stock','Stock','Stok','box'],['fresh','Fresh','Segar','leaf']]};
function renderPetals(){
 const items=NAV[S.role],n=items.length,span=n>=7?164:n>=5?140:80,R=Math.min(n>=7?130:118,innerWidth*.3);
 $('#petals').innerHTML=items.map(([id,en,ms,icon],i)=>{
  const label=L(en,ms), a=(n===1?90:90+span/2-span*i/(n-1))*Math.PI/180, badge=id==='ops'&&pending().length?`<u>${pending().length}</u>`:'';
  return `<button class="petal ${S.scene===id?'on':''}" data-nav="${id}" style="--x:${(Math.cos(a)*R).toFixed(0)}px;--y:${(-Math.sin(a)*R-(n>=7?(innerWidth<600?44:30):0)).toFixed(0)}px;--d:${i*35}ms" aria-label="${label}"><i>${ic(icon,22)}${badge}</i><span>${label}</span></button>`}).join('');
}
function openMenu(){closeCmd();$('#petals').classList.add('open');$('#scrim').hidden=false;$('#b-menu').setAttribute('aria-pressed','true')}
function closeMenu(){$('#petals').classList.remove('open');$('#scrim').hidden=true;$('#b-menu').setAttribute('aria-pressed','false')}
$('#b-menu').onclick=()=>$('#petals').classList.contains('open')?closeMenu():openMenu();
$('#scrim').onclick=closeMenu;
$('#petals').onclick=e=>{const b=e.target.closest('[data-nav]');if(b)go(b.dataset.nav)};

/* hint + orb */
function setHint(t,live){const h=$('#hint');h.textContent=t;h.classList.toggle('live',!!live)}
function rotateHint(){const ex=examples();setHint(`${L('Try saying','Cuba sebut')} “${ex[hintI++%ex.length]}”`)}
function setOrb(s){$('#orb').dataset.state=s}
function startHints(){clearInterval(hintTimer);rotateHint();hintTimer=setInterval(()=>{if($('#orb').dataset.state==='idle'&&cmdEl.hidden)rotateHint()},4200)}

/* command popover (typed fallback) */
const NOMIC=()=>L('Microphone is not available here. Type, or tap a phrase to simulate voice.','Mikrofon tidak aktif di sini. Taip atau tekan frasa untuk demo suara.');
function openCmd(note){
 closeMenu();hidePanel();cmdEl.hidden=false;void cmdEl.offsetWidth;cmdEl.classList.add('show');
 $('#cmd-note').textContent=note||L('Type a command, or tap a phrase.','Taip arahan atau tekan satu frasa.');
 $('#cmd-chips').innerHTML=examples().map(x=>`<button type="button" class="chip" data-say="${esc(x)}">${esc(x)}</button>`).join('');
 setTimeout(()=>$('#cmd-input').focus({preventScroll:true}),50);
}
function closeCmd(){cmdEl.classList.remove('show');setTimeout(()=>{if(!cmdEl.classList.contains('show'))cmdEl.hidden=true},250)}
$('#b-type').onclick=()=>cmdEl.classList.contains('show')?closeCmd():openCmd();
cmdEl.addEventListener('click',e=>{const b=e.target.closest('[data-say]');if(b){speakSim(b.dataset.say)}});
cmdEl.addEventListener('submit',async e=>{e.preventDefault();const v=$('#cmd-input').value.trim();if(!v)return;$('#cmd-input').value='';closeCmd();setOrb('processing');await sleep(350);setOrb('idle');run(v,'text')});

/* voice: simulated (works everywhere) and real (Web Speech API when the page may use the mic) */
function speakSim(text){
 return new Promise(res=>{
  closeCmd();closeMenu();hidePanel();clearInterval(typing);setOrb('listening');
  let i=0;const step=Math.max(18,Math.min(45,1300/text.length));
  typing=setInterval(()=>{i++;setHint('“'+text.slice(0,i)+'”',true);
   if(i>=text.length){clearInterval(typing);setOrb('processing');setTimeout(()=>{setOrb('idle');setHint('');run(text,'voice');startHints();res()},450)}},step);
 });
}
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let rec=null;
function listen(){
 if(!SR||S.micBlocked)return openCmd(S.micBlocked?NOMIC():L('This browser has no speech recognition. Type, or tap a phrase.','Pelayar ini tiada pengecaman suara. Taip atau tekan frasa.'));
 try{
  rec=new SR();rec.lang=S.lang==='ms'?'ms-MY':'en-US';rec.interimResults=true;rec.maxAlternatives=1;
  let final='',got=false;
  rec.onstart=()=>{setOrb('listening');setHint(L('Listening…','Mendengar…'),true);hidePanel()};
  rec.onresult=e=>{let t='';for(const r of e.results){t+=r[0].transcript;if(r.isFinal)final=t}setHint('“'+t+'”',true)};
  rec.onerror=e=>{got=true;setOrb('idle');startHints();
   if(['not-allowed','service-not-allowed','audio-capture'].includes(e.error)){S.micBlocked=true;openCmd(NOMIC())}
   else if(e.error==='no-speech')panel({state:L("Didn't catch that",'Tak dengar'),tone:'bad',title:L('No speech detected. Try again.','Tiada suara dikesan. Cuba lagi.'),ttl:4000});};
  rec.onend=()=>{if($('#orb').dataset.state==='listening'){setOrb('idle');startHints()}if(final&&!got){got=true;setOrb('processing');setTimeout(()=>{setOrb('idle');run(final,'voice');startHints()},300)}};
  rec.start();
 }catch(err){S.micBlocked=true;openCmd(NOMIC())}
}
$('#orb').onclick=()=>{
 const st=$('#orb').dataset.state;
 if(st==='listening'){try{rec&&rec.stop()}catch(e){}clearInterval(typing);setOrb('idle');startHints();return}
 if(st==='idle')listen();
};

/* ---- audit ---- */
function log(text,intent,status){S.audit.unshift({t:new Date(),who:S.role,text,intent,status});}
const hhmm=d=>d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
function showAudit(){
 const cls=s=>/Rejected|Not allowed|Not understood|Ditolak|Tidak/.test(s)?'bad':/Awaiting|Menunggu/.test(s)?'warn':'ok';
 const rows=S.audit.length?S.audit.slice(0,8).map(a=>`<div><time>${hhmm(a.t)}</time><span><b>${esc(a.text)}</b><br><span class="say" style="margin:0">${a.who==='admin'?'Admin':L('Staff','Staf')} · ${esc(a.intent)}</span></span><span class="pill ${cls(a.status)}">${esc(a.status)}</span></div>`).join(''):`<p class="p-body">${L('No commands yet. Every voice command is recorded here.','Belum ada arahan. Setiap arahan suara akan direkod di sini.')}</p>`;
 panel({state:L('Command trail','Jejak arahan'),title:L('Who said what, and what happened','Siapa cakap apa, dan apa jadi'),html:`<div class="log">${rows}</div>`,persist:true});
}

/* ---- language: parse Malay + English, always both ---- */
const norm=t=>t.toLowerCase().replace(/[.,!?'"“”]/g,' ').replace(/\s+/g,' ').trim();
const SYN=[['ayam','ayam'],['chicken','ayam'],['tepung','tepung'],['flour','tepung'],['susu','susu'],['milk','susu'],['telur','telur'],['eggs','telur'],['egg','telur'],['beras','beras'],['rice','beras'],['minyak','minyak'],['oil','minyak'],['pisang','pisang'],['banana','pisang'],['bawang','bawang'],['onions','bawang'],['onion','bawang']];
const findItem=t=>{for(const [w,id] of SYN)if(new RegExp('\\b'+w+'\\b').test(t))return id;return null};
const NW={setengah:.5,separuh:.5,half:.5,satu:1,one:1,dua:2,two:2,tiga:3,three:3,empat:4,four:4,lima:5,five:5,enam:6,six:6,tujuh:7,seven:7,lapan:8,eight:8,sembilan:9,nine:9,sepuluh:10,ten:10,'dua puluh':20,twenty:20,'tiga puluh':30,thirty:30,'lima puluh':50,fifty:50};
const UR='(kilogram|kilos|kilo|kg|grams|gram|g|millilitre|ml|litres|litre|liters|liter|l|biji|butir|pcs|pieces|piece|keping)';
const UM={kilogram:'kg',kilos:'kg',kilo:'kg',kg:'kg',grams:'g',gram:'g',g:'g',millilitre:'ml',ml:'ml',litres:'L',litre:'L',liters:'L',liter:'L',l:'L',biji:'biji',butir:'biji',pcs:'biji',pieces:'biji',piece:'biji',keping:'biji'};
function findQty(t){
 let n=null,u=null,m=t.match(new RegExp('(\\d+(?:[.,]\\d+)?)\\s*'+UR+'?(?![a-z])'));
 if(m){n=parseFloat(m[1].replace(',','.'));u=m[2]}
 else for(const k of Object.keys(NW).sort((a,b)=>b.length-a.length)){const mm=t.match(new RegExp('\\b'+k+'\\b\\s*'+UR+'?(?![a-z])'));if(mm){n=NW[k];u=mm[2];break}}
 if(n==null)return null;
 u=u?UM[u]:null;if(u==='g'){n/=1000;u='kg'}if(u==='ml'){n/=1000;u='L'}
 return {n,u};
}
const V={usage:/\b(guna|digunakan|used|use|potong|keluarkan)\b/,receive:/\b(terima|receive|received|receiving|masuk|tambah|restock)\b/,order:/\b(order|tempah|pesan|beli|purchase)\b/,waste:/\b(buang|waste|wasted|rosak|basi|spoiled)\b/};
const YES=/\b(ya|yes|betul|ok|okay|confirm|setuju|boleh|sahkan|correct)\b/, NO=/\b(tak|tidak|no|batal|cancel|salah|ulang)\b/;
const NAVR=[['home',/\b(utama|home|dashboard|balik|mula)\b/],['stock',/\b(stok|stock|produk|product|inventori|inventory|barang)\b/],['cost',/\b(kos|cost|kewangan|belanja)\b/],
 ['fresh',/\b(segar|fresh|freshness|kesegaran|imbas|scan|sisa|waste)\b/],['ops',/\b(lulus|kelulusan|approve|approval|approvals|tindakan|operasi|operations)\b/],['rules',/\b(rules|automation|settings|tetapan|automasi|peraturan)\b/],['people',/\b(pasukan|team|staf|staff|pembekal|supplier|suppliers|orang|people)\b/]];
const navName=id=>{const n=NAV.admin.find(x=>x[0]===id);return n?L(n[1],n[2]).toLowerCase():id};
const INTENT={order:['Order','Order'],usage:['Use stock','Guna stok'],receive:['Receive stock','Terima stok'],waste:['Report waste','Lapor sisa']};

function run(raw,src){
 const text=raw.trim();if(!text)return;const t=norm(text);
 const d=S.draft;
 if(d){
  if(d.awaiting==='confirm'){if(YES.test(t)){log(text,L('Confirm','Sahkan'),L('Done','Dilaksana'));return commit()}if(NO.test(t)){log(text,L('Cancel','Batal'),L('Cancelled','Dibatalkan'));return cancelDraft()}}
  else if(d.awaiting==='item'){const it=findItem(t);if(it){d.item=it;log(text,L('Pick item','Pilih item'),L('Accepted','Diterima'));return advance()}}
  else if(d.awaiting==='qty'){const q=findQty(t);if(q){d.qty=q.n;d.u=q.u;log(text,L('Pick quantity','Pilih kuantiti'),L('Accepted','Diterima'));return advance()}}
  S.draft=null;
 }
 const item=findItem(t), q=findQty(t), navVerb=/\b(buka|open|pergi|go|tunjuk|show)\b/.test(t);
 // transactions
 for(const k of ['order','usage','receive','waste']){
  if(V[k].test(t)&&(item||q||k==='order')){
   log(text,L(...INTENT[k]),L('Awaiting confirmation','Menunggu pengesahan'));
   return startDraft(k,item,q?q.n:null,q?q.u:null,text);
  }
 }
 // approvals
 if(!navVerb&&/\b(lulus|luluskan|approve|approved)\b/.test(t)&&pending().length||/\b(tolak|reject|decline)\b/.test(t)){
  const ok=!/\b(tolak|reject|decline)\b/.test(t);log(text,ok?L('Approve','Lulus'):L('Reject','Tolak'),S.role==='admin'?L('Done','Dilaksana'):L('Not allowed','Tidak dibenarkan'));return decide(ok,text);
 }
 // questions
 if(/\b(nilai|worth|value)\b/.test(t)&&/\b(stok|stock|inventori|inventory)\b/.test(t)){
  log(text,L('Stock value question','Soalan nilai stok'),L('Answered','Dijawab'));
  if(S.role!=='admin')return deny();
  return panel({state:L('Answer','Jawapan'),said:text,title:L('Stock value right now','Nilai stok sekarang'),big:rm0(stockValue()),facts:[[L('items','item'),String(P.length)],[L('method','kaedah'),L('balance × unit cost','baki × kos seunit')]],chips:[{label:L('Open stock','Buka stok'),say:L('Open stock','Buka stok')}]});
 }
 if(/\b(kenapa|mengapa|why)\b/.test(t)&&/\b(kos|cost|costs)\b/.test(t)){
  log(text,L('Cost question','Soalan kos'),L('Answered','Dijawab'));if(S.role!=='admin')return deny();
  const dr=P.map(p=>({p,x:(S.use[p.id]-p.avg)*p.cost})).sort((a,b)=>b.x-a.x)[0], pct=Math.round((costToday()/costAvg()-1)*100);
  return panel({state:L('Answer','Jawapan'),said:text,title:L(`${pn(dr.p)} pushes cost up the most`,`${pn(dr.p)} paling menaikkan kos`),big:'+'+rm0(dr.x),facts:[[L('used today','guna hari ini'),`${fq(S.use[dr.p.id])} ${U(dr.p.unit)}`],[L('usual','biasa'),`${dr.p.avg} ${U(dr.p.unit)}`],[L('total cost','jumlah kos'),`${pct>=0?'+':''}${pct}%`]],chips:[{label:L('Open cost','Buka kos'),say:L('Open cost','Buka kos')}],ttl:14000});
 }
 if(item&&!V.usage.test(t)&&/\b(bila|when|habis|run out|runs out|lama|how long)\b/.test(t)){
  const p=prod(item);log(text,L('Stock forecast','Ramalan stok'),L('Answered','Dijawab'));
  return panel({state:L('Estimate','Anggaran'),said:text,title:L(`${pn(p)} will last`,`${pn(p)} cukup untuk`),big:eta(p),facts:[[L('balance','baki'),`${fq(p.qty)} ${U(p.unit)}`],[L('average use','purata guna'),`${p.avg} ${U(p.unit)}/${L('day','hari')}`],[L('based on','asas'),L('14 days of sample data','14 hari data contoh')]],body:L('Estimated from average use, not guaranteed.','Anggaran dari purata guna, bukan jaminan.'),chips:S.role==='admin'?[{label:`Order ${suggest(p)} ${U(p.unit)}`,say:orderSay(p)}]:[],ttl:14000});
 }
 if(/\b(ringkasan|briefing|summary|brief)\b/.test(t)){log(text,L('Daily briefing','Ringkasan harian'),L('Answered','Dijawab'));go('home');return setTimeout(speakBrief,700)}
 // filters
 if(/\b(expire|expires|expiry|expiring|luput|tamat tempoh|hampir tamat)\b/.test(t)){log(text,L('Filter expiring','Tapis hampir luput'),L('Navigated','Navigasi'));S.filter='exp';return go('stock')}
 if(/\b(rendah|low|hampir habis|kurang|nak habis)\b/.test(t)){log(text,L('Filter low stock','Tapis stok rendah'),L('Navigated','Navigasi'));S.filter='low';return go('stock')}
 // navigation
 for(const [sc,re] of NAVR){
  if(re.test(t)){
   if(S.role==='staff'&&!['home','stock','fresh'].includes(sc)){log(text,L('Open ','Buka ')+navName(sc),L('Not allowed','Tidak dibenarkan'));return deny()}
   log(text,L('Open ','Buka ')+navName(sc),L('Navigated','Navigasi'));if(sc==='stock')S.filter='all';
   const auto=sc==='fresh'&&/\b(imbas|scan)\b/.test(t);
   go(sc);if(auto)setTimeout(scan,900);return;
  }
 }
 if(item){log(text,L('Item details','Butiran item'),L('Navigated','Navigasi'));S.filter='all';go('stock');return setTimeout(()=>openDetail(item),500)}
 log(text,L('Not understood','Tidak faham'),L('Not understood','Tidak difahami'));
 panel({state:L('Not sure','Saya tak pasti'),tone:'bad',said:text,title:L('Try one of these:','Cuba salah satu ini:'),chips:examples().slice(0,4).map(x=>({label:x,say:x})),ttl:12000});
}

/* ---- guided actions: ask only for what is missing, validate, confirm ---- */
const TITLES=()=>({usage:L('Use what?','Guna apa?'),receive:L('Receive what?','Terima apa?'),order:L('Order what?','Order apa?'),waste:L('Waste what?','Buang apa?')});
const QOPT=(t,p)=>p.unit==='biji'?[10,30,60]:t==='order'?[10,20,50]:[.5,1,2,5];
const VERB=()=>({usage:L('Use','Guna'),receive:L('Receive','Terima'),order:'Order',waste:L('Waste','Buang')});
function startDraft(type,item,qty,u,said){S.draft={type,item,qty,u,said};advance()}
function cancelDraft(){S.draft=null;panel({state:L('Cancelled','Dibatalkan'),title:L('No changes made.','Tiada perubahan dibuat.'),ttl:2500})}
function advance(){
 const d=S.draft;if(!d)return;
 if(!d.item){d.awaiting='item';return panel({state:L('Question','Tanya'),tone:'warn',said:d.said,title:TITLES()[d.type],chips:P.map(p=>({label:pn(p),fn:()=>{d.item=p.id;advance()}})),persist:true})}
 const p=prod(d.item);
 if(d.u&&d.u!==p.unit){S.draft=null;return panel({state:L('Unit mismatch','Unit tak sepadan'),tone:'bad',title:L(`${pn(p)} is measured in ${U(p.unit)}, not ${U(d.u)}.`,`${pn(p)} diukur dalam ${U(p.unit)}, bukan ${U(d.u)}.`),chips:[{label:L('Try again','Cuba lagi'),say:`${VERB()[d.type]} 2 ${uw(p.unit)} ${pn(p).toLowerCase()}`}],ttl:7000})}
 if(d.qty==null){d.awaiting='qty';return panel({state:L('Question','Tanya'),tone:'warn',said:d.said,title:L(`How many ${U(p.unit)} of ${pn(p).toLowerCase()}?`,`Berapa ${U(p.unit)} ${pn(p).toLowerCase()}?`),chips:QOPT(d.type,p).map(n=>({label:`${n} ${U(p.unit)}`,fn:()=>{d.qty=n;advance()}})),persist:true})}
 const q=d.qty;
 if(q<=0){S.draft=null;return panel({state:L('Invalid','Tidak sah'),tone:'bad',title:L('Quantity must be above zero.','Kuantiti mesti lebih daripada sifar.'),ttl:4000})}
 if((d.type==='usage'||d.type==='waste')&&q>p.qty){S.draft=null;log(d.said||'',VERB()[d.type],L('Rejected (not enough stock)','Ditolak (stok tak cukup)'));return panel({state:L('Checked by system','Disemak sistem'),tone:'bad',title:L(`Only ${fq(p.qty)} ${U(p.unit)} of ${pn(p).toLowerCase()} in stock.`,`Stok ${pn(p).toLowerCase()} cuma ${fq(p.qty)} ${U(p.unit)}.`),body:L('The system does not allow a negative balance.','Sistem tak benarkan baki jadi negatif.'),chips:[{label:`${fq(p.qty)} ${U(p.unit)}`,fn:()=>{startDraft(d.type,d.item,p.qty)}}],ttl:9000})}
 if(d.type==='receive'&&p.qty+q>p.cap){S.draft=null;return panel({state:L('Checked by system','Disemak sistem'),tone:'bad',title:L(`Exceeds ${pn(p).toLowerCase()} capacity (${p.cap} ${U(p.unit)}).`,`Melebihi kapasiti ${pn(p).toLowerCase()} (${p.cap} ${U(p.unit)}).`),ttl:7000})}
 d.awaiting='confirm';
 if(!S.rules.confirm&&(d.type==='usage'||d.type==='receive'))return commit();
 const amt=q*p.cost, sign=d.type==='receive'?'+':d.type==='order'?'':'−';
 const lvl=d.type==='order'?L('Needs admin approval','Perlu kelulusan admin'):d.type==='waste'&&amt>S.rules.limit?L(`Over RM ${S.rules.limit}, needs approval`,`Melebihi RM ${S.rules.limit}, perlu kelulusan`):'';
 const facts=d.type==='order'?[[L('estimate','anggaran'),rm(amt)],[L('supplier','pembekal'),p.sup]]:[[L('new balance','baki baru'),`${fq(d.type==='receive'?p.qty+q:p.qty-q)} ${U(p.unit)}`],...(S.role==='admin'?[[L('cost','kos'),rm(amt)]]:[])];
 panel({state:lvl||L('Confirm','Sahkan'),tone:lvl?'warn':'',said:d.said,title:VERB()[d.type]+' '+pn(p).toLowerCase(),big:`${sign}${fq(q)} ${U(p.unit)}`,facts,
  actions:[{label:L('Redo','Ulang'),fn:()=>{S.draft=null;hidePanel()}},{label:d.type==='order'&&S.role==='staff'?L('Send to admin','Hantar kepada admin'):L('Confirm','Betul'),kind:'ok',fn:commit}],bigBtn:true,persist:true,html:`<span class="say" style="margin-top:12px">${L('or say','atau sebut')} <q>${L('confirm','betul')}</q></span>`});
}
function tick(key){const t=S.tasks.find(x=>x.key===key&&!x.done);if(t)t.done=true}
function commit(){
 const d=S.draft;if(!d)return;S.draft=null;const p=prod(d.item),q=d.qty,amt=q*p.cost,before=p.qty,n=pn(p).toLowerCase();
 if(d.type==='usage'){
  p.qty=r2(p.qty-q);S.use[p.id]+=q;tick('usage:'+p.id);addMove(p,'usage',q);
  const crossed=before>p.reorder&&p.qty<=p.reorder&&S.rules.lowAlert;
  if(crossed)notify('bad',L('Low stock: '+pn(p),'Stok rendah: '+pn(p)),L(`${fq(p.qty)} ${U(p.unit)} left. Alert sent to admin.`,`Baki ${fq(p.qty)} ${U(p.unit)}. Amaran dihantar kepada admin.`));
  S.pulse=p.id;refresh();
  panel({state:L('Recorded','Direkod'),tone:'ok',title:L(`${pn(p)}: ${fq(p.qty)} ${U(p.unit)} left`,`${pn(p)}: baki ${fq(p.qty)} ${U(p.unit)}`),body:S.role==='admin'?L(`Cost today ${rm(costToday())}.`,`Kos hari ini ${rm(costToday())}.`):L('Thanks. Cost is calculated automatically.','Terima kasih. Kos dikira automatik.'),
   html:crossed?`<div class="row"><span class="pill bad">${ic('alert',13)}${L('Low-stock alert sent to admin','Amaran stok rendah dihantar kepada admin')}</span></div>`:'',chips:crossed&&S.role==='admin'?[{label:`Order ${suggest(p)} ${U(p.unit)}`,say:orderSay(p)}]:[],ttl:10000});
 }else if(d.type==='receive'){
  p.qty=r2(p.qty+q);tick('receive:'+p.id);addMove(p,'receive',q);receivePO(p);S.pulse=p.id;refresh();
  panel({state:L('Recorded','Direkod'),tone:'ok',title:L(`${pn(p)}: ${fq(p.qty)} ${U(p.unit)} now`,`${pn(p)}: baki ${fq(p.qty)} ${U(p.unit)}`),body:L('New batch added with an expiry date.','Kelompok baru ditambah dengan tarikh luput.'),ttl:7000});
 }else if(d.type==='waste'){
  if(amt>S.rules.limit){addReq({kind:'writeoff',item:p.id,qty:q,amount:amt,by:S.role==='admin'?'Syahmi':'staff',rkey:'rep'});
   panel({state:L('Awaiting approval','Menunggu kelulusan'),tone:'warn',title:L('Sent to admin.','Dihantar kepada admin.'),body:L(`${rm(amt)} is above the automatic write-off limit.`,`${rm(amt)} melebihi had tulis-off automatik.`),ttl:7000})}
  else{p.qty=r2(p.qty-q);addMove(p,'waste',q);S.waste.push({n:pn(p),amt});S.pulse=p.id;refresh();panel({state:L('Recorded','Direkod'),tone:'ok',title:L(`Waste logged: ${fq(q)} ${U(p.unit)} ${n}.`,`Sisa ${fq(q)} ${U(p.unit)} ${n} direkod.`),body:L(`Waste cost ${rm(amt)}.`,`Kos sisa ${rm(amt)}.`),ttl:7000})}
 }else if(d.type==='order'){
  const dup=pending().find(r=>r.kind==='order'&&r.item===p.id);
  if(!dup)addReq({kind:'order',item:p.id,qty:q,amount:amt,supplier:p.sup,by:S.role==='admin'?'Syahmi':'staff',rkey:'low'});
  if(S.role==='admin'){go('ops');setTimeout(()=>panel({state:dup?L('Already waiting','Sudah menunggu'):L('Awaiting approval','Menunggu kelulusan'),tone:'warn',title:L(`The ${n} order is on the top card.`,`Order ${n} ada di kad atas.`),ttl:5000}),900)}
  else panel({state:L('Sent','Dihantar'),tone:'ok',title:L('Order suggestion sent to admin.','Cadangan order dihantar kepada admin.'),ttl:6000});
 }
}
function addReq(r){r.id=S.rid++;r.status='pending';S.requests.unshift(r);refresh()}
function refresh(){render(false);if(S.drawer)drawDrawer()}

function decide(ok,said){
 if(S.role!=='admin')return panel({state:L('No access','Tiada akses'),tone:'bad',title:L('Only admins can approve.','Hanya admin boleh meluluskan.'),ttl:4000});
 const r=pending()[0];
 if(!r)return panel({state:L('None','Tiada'),title:L('Nothing is waiting for approval.','Tiada kelulusan menunggu.'),ttl:3000});
 r.status=ok?'approved':'rejected';
 if(ok&&r.kind==='order')newPO(r);
 if(ok&&r.kind==='writeoff'){const p=prod(r.item);p.qty=r2(Math.max(0,p.qty-r.qty));S.waste.push({n:pn(p),amt:r.amount})}
 S.scene==='ops'?refresh():go('ops');
 panel({state:ok?L('Approved','Dilulus'):L('Rejected','Ditolak'),tone:ok?'ok':'bad',said,title:ok?(r.kind==='order'?L(`Order sent to ${r.supplier}.`,`Order dihantar kepada ${r.supplier}.`):L('Stock written off and waste cost calculated.','Stok ditulis-off dan kos sisa dikira.')):L('Request rejected and recorded.','Permintaan ditolak dan direkod.'),body:L('The action is in the audit trail.','Tindakan masuk jejak audit.'),chips:[{label:L('View trail','Lihat jejak'),fn:showAudit}],ttl:8000});
}
function bindOps(){
 const el=$('#rtop');if(!el)return;let sx=null;
 el.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;sx=e.clientX;el.setPointerCapture(e.pointerId);el.style.transition='none'});
 el.addEventListener('pointermove',e=>{if(sx==null)return;const dx=e.clientX-sx;el.style.transform=`translateX(${dx}px) rotate(${dx/20}deg)`;el.dataset.dir=dx>50?'ok':dx<-50?'no':''});
 const end=e=>{if(sx==null)return;const dx=e.clientX-sx;sx=null;el.style.transition='';
  if(dx>110){log(L('(drag right)','(seret kanan)'),L('Approve','Lulus'),L('Done','Dilaksana'));decide(true)}else if(dx<-110){log(L('(drag left)','(seret kiri)'),L('Reject','Tolak'),L('Done','Dilaksana'));decide(false)}else{el.style.transform='';el.dataset.dir=''}};
 el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
}

/* freshness scan (demo) */
function scan(){
 if(S.scene!=='fresh'||S.fresh.scanning)return;
 S.fresh.scanning=true;S.fresh.res=null;refresh();
 setTimeout(()=>{const bad=S.fresh.n%2===1;S.fresh.n++;S.fresh.res={bad,conf:bad?88:94};S.fresh.scanning=false;tick('fresh');
  log(L('(scan)','(imbas)'),L('Freshness classification','Klasifikasi segar'),bad?L('Spoiled 88%','Rosak 88%'):L('Fresh 94%','Segar 94%'));refresh()},1600);
}

/* detail sheet for a jar */
function openDetail(id){
 const p=prod(id), low=p.qty<=p.reorder, n=pn(p).toLowerCase();
 panel({state:low?L('Low stock','Stok rendah'):p.exp<=3?L('Expiring soon','Hampir luput'):L('Stock is healthy','Stok baik'),tone:low?'bad':p.exp<=3?'warn':'ok',title:pn(p),big:`${fq(p.qty)} ${U(p.unit)}`,
  facts:[[L('lasts','cukup untuk'),eta(p)],[L('expires','luput'),p.exp>60?L('not soon','lama'):p.exp+' '+L('days','hari')],...(S.role==='admin'?[[L('value','nilai'),rm(p.qty*p.cost)]]:[])],
  chips:[{label:L(`Use 1 ${U(p.unit)}`,`Guna 1 ${U(p.unit)}`),say:`${L('Use','Guna')} 1 ${uw(p.unit)} ${n}`},{label:L(`Receive 10 ${U(p.unit)}`,`Terima 10 ${U(p.unit)}`),say:`${L('Receive','Terima')} 10 ${uw(p.unit)} ${n}`},...(S.role==='admin'?[{label:`Order ${suggest(p)} ${U(p.unit)}`,say:orderSay(p)}]:[])],ttl:14000});
}
function speakBrief(){
 const low=P.filter(p=>p.qty<=p.reorder);
 const txt=L(`${greet()}, Syahmi. ${low.length?low.map(p=>`${pn(p)} is almost out, about ${eta(p)} left.`).join(' '):'Stock levels are healthy.'} Cost today is ${Math.round(costToday())} ringgit.`,
  `${greet()}, Syahmi. ${low.length?low.map(p=>`${pn(p)} hampir habis, cukup ${eta(p)}.`).join(' '):'Stok semua baik.'} Kos hari ini ${Math.round(costToday())} ringgit.`);
 try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(txt);u.lang=S.lang==='ms'?'ms-MY':'en-US';speechSynthesis.speak(u)}catch(e){}
 panel({state:L('Daily briefing','Ringkasan harian'),title:txt,ttl:12000});
}

/* ---- roles, language, demo, events ---- */
function applyStatic(){
 document.documentElement.lang=S.lang==='ms'?'ms':'en';
 $('.seg [data-role=staff]').textContent=L('Staff','Staf');
 $('#t-log').innerHTML=ic('clock',16)+`<span class="lbl">${L('Trail','Jejak')}</span>`;
 $('#t-log').setAttribute('aria-label',L('Command trail','Jejak arahan'));
 $('#t-lang').innerHTML=ic('mic',16)+`<span>${S.lang==='ms'?'BM':'EN'}</span>`;
 $('#t-lang').title=L('Language for screen and microphone','Bahasa skrin dan mikrofon');
 $('#brand').setAttribute('aria-label',L('Home','Utama'));
 $('#orb').setAttribute('aria-label',L('Speak','Cakap'));$('#b-menu').setAttribute('aria-label','Menu');$('#b-type').setAttribute('aria-label',L('Type a command','Taip arahan'));
 $('#cmd-input').placeholder=L('e.g. open product stock','cth: buka stok produk');
 $('#cmd-input').setAttribute('aria-label',L('Command','Arahan'));
 $('#cmd button[type=submit]').textContent=L('Send','Hantar');
 demoBtn();
}
function setLang(l){
 if(S.lang===l)return;S.lang=l;S.draft=null;try{rec&&rec.abort()}catch(e){}
 applyStatic();hidePanel();closeCmd();render(false);startHints();
}
function setRole(r){
 if(S.role===r)return;S.role=r;S.draft=null;S.filter='all';S.scene='home';
 $$('.seg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.role===r));
 closeMenu();closeCmd();render(true);startHints();
 panel({state:r==='admin'?L('Admin view','Paparan admin'):L('Staff view','Paparan staf'),title:r==='admin'?L('Briefing, costs and approvals.','Ringkasan, kos dan kelulusan.'):L('A simple screen. Just say what you did.','Skrin ringkas. Cakap apa yang anda buat.'),ttl:2600});
}
const DEMO=[['admin','Open product stock','Buka stok produk'],[0,'Show low stock','Tunjuk stok rendah'],['staff','We used 2 kg chicken','Ayam dah guna 2 kilo'],[0,'Confirm','Betul'],['admin','When will chicken run out?','Bila ayam habis?'],[0,'Order 20 kg chicken','Order 20 kilo ayam'],[0,'Confirm','Betul'],[0,'Approve','Lulus'],[0,'Why did costs rise?','Kenapa kos naik?'],[0,'Scan banana','Imbas pisang']];
async function runDemo(){
 if(S.demo){S.demo=false;demoBtn();return}
 S.demo=true;demoBtn();
 for(const [r,en,ms] of DEMO){
  if(!S.demo)break;
  if(r){setRole(r);await sleep(1200)}
  await speakSim(S.lang==='ms'?ms:en);await sleep(r==='staff'||en==='Confirm'?1700:2600);
 }
 S.demo=false;demoBtn();
}
function demoBtn(){const b=$('#t-demo');b.setAttribute('aria-pressed',S.demo);b.innerHTML=`${ic(S.demo?'stop':'play',16)}<span class="lbl">${S.demo?L('Stop demo','Henti demo'):L('1-minute demo','Demo 1 minit')}</span>`}

document.addEventListener('click',e=>{
 const t=e.target;let b;
 if(b=t.closest('#stage [data-say]'))return speakSim(b.dataset.say);
 if(b=t.closest('#stage [data-go]'))return go(b.dataset.go);
 if(b=t.closest('#stage [data-filter]')){S.filter=b.dataset.filter;return refresh()}
 if(b=t.closest('#stage [data-jar]'))return openDetail(b.dataset.jar);
 if(b=t.closest('#stage [data-task]')){const k=S.tasks.find(x=>x.id===b.dataset.task);k.done=!k.done;return refresh()}
 if(b=t.closest('#stage [data-tile]'))return startDraft(b.dataset.tile,null,null,null,'');
 if(b=t.closest('#stage [data-scan]'))return scan();
 if(b=t.closest('#stage [data-decide]')){const ok=b.dataset.decide==='ok';log(L('(button)','(butang)'),ok?L('Approve','Lulus'):L('Reject','Tolak'),L('Done','Dilaksana'));return decide(ok)}
 if(b=t.closest('#stage [data-speak]'))return speakBrief();
});
$('#brand').onclick=()=>go('home');
$('#t-log').onclick=showAudit;
$('#t-demo').onclick=runDemo;
$('#t-lang').onclick=()=>setLang(S.lang==='ms'?'en':'ms');
$$('.seg button').forEach(b=>b.onclick=()=>setRole(b.dataset.role));
$('#b-menu').innerHTML=ic('grid',22);$('#b-type').innerHTML=ic('kbd',22);$('#orb').querySelector('.mic').innerHTML=ic('mic',30);
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){closeMenu();closeCmd();hidePanel()}
 if(/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;
 if(e.code==='Space'&&!e.target.closest('button')){e.preventDefault();$('#orb').click()}
 if(e.key==='/'){e.preventDefault();openCmd()}
});
addEventListener('resize',renderPetals);


/* ================= v2: product layer ================= */
let live=[];
const later=(fn,ms)=>{const id=setTimeout(fn,ms);live.push(id);return id};
const clearLive=()=>{live.forEach(clearTimeout);live=[]};
const dateStr=off=>new Date(Date.now()+off*864e5).toLocaleDateString(S.lang==='ms'?'ms-MY':'en-GB',{day:'2-digit',month:'short'});

/* notifications + toasts */
function updateBell(){
 const n=S.notes.filter(x=>!x.read).length;
 $('#t-bell').innerHTML=ic('bell',16)+(n?`<u>${n}</u>`:'');
 $('#t-bell').setAttribute('aria-label',L('Notifications','Notifikasi'));
}
function notify(tone,title,body){
 S.notes.unshift({tone,title,body,t:new Date(),read:false});updateBell();
 const el=document.createElement('div');el.className='toast';
 el.innerHTML=`<i class="${tone}">${ic(tone==='ok'?'check':'alert',17)}</i><div><b>${esc(title)}</b><span>${esc(body)}</span></div>`;
 $('#toasts').appendChild(el);
 setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),320)},5200);
 while($('#toasts').children.length>3)$('#toasts').firstChild.remove();
}
function showNotes(){
 S.notes.forEach(n=>n.read=true);updateBell();
 const rows=S.notes.length?S.notes.slice(0,8).map(n=>`<div><i class="${n.tone}"></i><span><b>${esc(n.title)}</b>${esc(n.body)}</span><time>${hhmm(n.t)}</time></div>`).join(''):`<p class="p-body">${L('Nothing yet. SmartStock will alert you about low stock, expiry and orders.','Belum ada. SmartStock akan beri amaran stok rendah, luput dan order.')}</p>`;
 panel({state:L('Notifications','Notifikasi'),title:L('What needs your attention','Apa yang perlukan perhatian'),html:`<div class="nl">${rows}</div>`,persist:true});
}
$('#t-bell').onclick=showNotes;

/* tooltip (charts, sparkline) */
const tip=$('#tip');
document.addEventListener('pointermove',e=>{
 const t=e.target.closest&&e.target.closest('[data-tip]');
 if(!t){tip.classList.remove('on');return}
 tip.textContent=t.dataset.tip;tip.classList.add('on');
 tip.style.left=Math.min(innerWidth-tip.offsetWidth-8,e.clientX+12)+'px';tip.style.top=Math.max(8,e.clientY-38)+'px';
});

/* movements, history, batches (deterministic sample data) */
function addMove(p,type,q){S.moves.unshift({p:p.id,type,q,t:hhmm(new Date()),who:S.role==='admin'?'Syahmi':'Syafiq'})}
function hist(p){let s=[...p.id].reduce((a,c)=>a+c.charCodeAt(0),7);const out=[];for(let i=0;i<13;i++){s=(s*9301+49297)%233280;out.push(r2(p.avg*(.78+.44*s/233280)))}out.push(S.use[p.id]);return out}
function batches(p){const a=r2(p.qty*.4),b=r2(p.qty-a),k=p.id.slice(0,2).toUpperCase(),far=p.exp<=3?4:14;
 return [{id:`B-${k}-204`,rec:-3,exp:p.exp,qty:a},{id:`B-${k}-205`,rec:-1,exp:p.exp+far,qty:b}]}

/* drawer */
function openDetail(id){S.drawer=id;drawDrawer();$('#drawer').classList.add('open');hidePanel()}
function closeDrawer(){S.drawer=null;$('#drawer').classList.remove('open')}
function drawDrawer(){
 const p=prod(S.drawer);if(!p)return;
 const low=p.qty<=p.reorder,tone=low?'bad':p.exp<=3?'warn':'ok',n=pn(p).toLowerCase();
 const h=hist(p),mx=Math.max(...h)*1.15,W=420,H=90,bw=22,gap=(W-bw*14)/13;
 const bars=h.map((v,i)=>{const bh=v/mx*H,x=i*(bw+gap);const d=i===13?L('Today','Hari ini'):dateStr(i-13);
  return `<rect x="${x}" y="${H-bh}" width="${bw}" height="${bh}" rx="6" fill="${i===13?'var(--accent)':'var(--accent-soft)'}" data-tip="${d}: ${fq(v)} ${U(p.unit)}"/>`}).join('');
 const ay=H-p.avg/mx*H;
 const bt=batches(p).map(b=>`<tr><td>${b.id}</td><td>${dateStr(b.rec)}</td><td><span class="pill ${b.exp<=3?'warn':''}">${dateStr(b.exp)}</span></td><td style="text-align:right">${fq(b.qty)} ${U(p.unit)}</td></tr>`).join('');
 const mv=S.moves.filter(m=>m.p===p.id).slice(0,5).map(m=>`<div><i class="${m.type==='receive'?'up':'dn'}">${ic(m.type==='receive'?'up':'down',15)}</i><span>${{usage:L('Used','Digunakan'),receive:L('Received','Diterima'),waste:L('Wasted','Dibuang')}[m.type]} ${fq(m.q)} ${U(p.unit)}<br><small>${esc(m.who)}</small></span><small>${esc(m.t)}</small></div>`).join('')||`<p class="p-body">${L('No movements yet.','Belum ada pergerakan.')}</p>`;
 const act=[{l:L(`Use 1 ${U(p.unit)}`,`Guna 1 ${U(p.unit)}`),s:`${L('Use','Guna')} 1 ${uw(p.unit)} ${n}`},{l:L(`Receive 10 ${U(p.unit)}`,`Terima 10 ${U(p.unit)}`),s:`${L('Receive','Terima')} 10 ${uw(p.unit)} ${n}`},...(S.role==='admin'?[{l:`Order ${suggest(p)} ${U(p.unit)}`,s:orderSay(p)}]:[])];
 $('#drawer').innerHTML=`<div class="dr-top"><div><span class="pill ${tone}">${low?L('Low stock','Stok rendah'):p.exp<=3?L('Expiring soon','Hampir luput'):L('Healthy','Baik')}</span><h2>${pn(p)}</h2></div><button class="p-x" data-dclose="1" aria-label="${L('Close','Tutup')}">${ic('x',22)}</button></div>
 <div class="dr-qty"><b>${fq(p.qty)}</b><span>${U(p.unit)} · ${L('lasts','cukup')} ${eta(p)}</span></div>
 <div class="meter"><u class="${tone}" style="width:${clamp(p.qty/p.cap*100,2,100)}%"></u><s style="left:${p.reorder/p.cap*100}%" data-tip="${L('Reorder level','Paras minimum')}: ${p.reorder} ${U(p.unit)}"></s></div>
 <div class="facts" style="margin-top:14px"><div><b>${p.cap} ${U(p.unit)}</b><span>${L('capacity','kapasiti')}</span></div><div><b>${p.sup}</b><span>${L('supplier','pembekal')}</span></div>${S.role==='admin'?`<div><b>${rm(p.qty*p.cost)}</b><span>${L('value','nilai')}</span></div><div><b>${rm(p.cost)}/${U(p.unit)}</b><span>${L('unit cost','kos seunit')}</span></div>`:''}</div>
 <div class="dr-h">${L('Usage, last 14 days','Penggunaan, 14 hari lalu')}</div>
 <svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="${L('Usage chart','Carta penggunaan')}"><line x1="0" x2="${W}" y1="${ay}" y2="${ay}" stroke="var(--ink-2)" stroke-dasharray="3 5" opacity=".6"/>${bars}</svg>
 <div class="dr-h">${L('Batches','Kelompok')}</div><div class="tblwrap"><table class="tbl"><thead><tr><th>${L('Batch','Kelompok')}</th><th>${L('Received','Diterima')}</th><th>${L('Expires','Luput')}</th><th style="text-align:right">${L('Qty','Kuantiti')}</th></tr></thead><tbody>${bt}</tbody></table></div>
 <div class="dr-h">${L('Recent movements','Pergerakan terkini')}</div><div class="mv">${mv}</div>
 <div class="dr-h">${L('Say or tap','Sebut atau tekan')}</div><div class="p-chips" style="margin-top:0">${act.map(a=>`<button class="chip" data-dsay="${esc(a.s)}">${esc(a.l)}</button>`).join('')}</div>`;
}
$('#drawer').addEventListener('click',e=>{
 if(e.target.closest('[data-dclose]'))return closeDrawer();
 const b=e.target.closest('[data-dsay]');if(b)speakSim(b.dataset.dsay);
});

/* purchase order tracking */
const STEPS=()=>[L('Approved','Dilulus'),L('Sent','Dihantar'),L('Confirmed','Disahkan'),L('Delivered','Tiba')];
function newPO(r){
 const p=prod(r.item),po={no:1042+S.orders.length,item:p.id,qty:r.qty,sup:r.supplier||p.sup,step:1,done:false};S.orders.unshift(po);
 notify('ok',L(`PO #${po.no} sent`,`PO #${po.no} dihantar`),L(`${fq(po.qty)} ${U(p.unit)} ${pn(p).toLowerCase()} to ${po.sup}.`,`${fq(po.qty)} ${U(p.unit)} ${pn(p).toLowerCase()} kepada ${po.sup}.`));
 later(()=>{po.step=2;notify('ok',L(`${po.sup} confirmed`,`${po.sup} sahkan`),L('Delivery tomorrow, 8 am.','Penghantaran esok, 8 pagi.'));if(S.scene==='ops')refresh()},7000);
 later(()=>{po.step=3;notify('warn',L(`PO #${po.no} delivered`,`PO #${po.no} tiba`),L(`Say "${L('Receive','Terima')} ${fq(po.qty)} ${uw(p.unit)} ${pn(p).toLowerCase()}".`,`Sebut "${L('Receive','Terima')} ${fq(po.qty)} ${uw(p.unit)} ${pn(p).toLowerCase()}".`));if(S.scene==='ops')refresh()},16000);
}
function receivePO(p){const po=S.orders.find(o=>o.item===p.id&&o.step===3&&!o.done);if(po){po.done=true;notify('ok',L(`PO #${po.no} received`,`PO #${po.no} diterima`),L('Stock updated and batch recorded.','Stok dikemas kini dan kelompok direkod.'))}}
function orderTracking(){
 if(!S.orders.length)return '';
 return `<h2 class="h2">${L('Order tracking','Penjejakan order')}</h2>`+S.orders.map(o=>{const p=prod(o.item),st=STEPS();
  return `<div class="po"><div class="po-h"><b>PO #${o.no} · ${fq(o.qty)} ${U(p.unit)} ${pn(p)}</b><span class="pill ${o.done?'ok':''}">${o.done?L('Received','Diterima'):o.sup}</span></div>
  <div class="steps">${st.map((s,i)=>`<div class="st ${i<=o.step||o.done?'on':''}"><i></i>${s}</div>`).join('')}</div>
  ${o.step===3&&!o.done?`<div class="row"><button class="btn primary" data-say="${L('Receive','Terima')} ${fq(o.qty)} ${uw(p.unit)} ${pn(p).toLowerCase()}">${L('Receive stock','Terima stok')}</button></div>`:''}</div>`}).join('');
}


/* cost scene: 7D / 30D, hover tooltips */
function seriesN(n){
 if(n===7)return [...S.series,costToday()];
 let s=11;const out=[];for(let i=0;i<n-1;i++){s=(s*9301+49297)%233280;out.push(Math.round(345+70*Math.sin(i/3.2)+50*s/233280))}
 out.push(costToday());return out;
}
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

/* rules: these settings change how the system behaves */
function rulesScene(){
 const R=S.rules,sw=(k,on,dis)=>`<button class="sw" role="switch" aria-checked="${on}" data-rule="${k}" ${dis?'disabled':''} aria-label="${k}"></button>`;
 const rule=(t,d,ctl)=>`<div class="rule"><div><b>${t}</b><span class="d">${d}</span></div>${ctl}</div>`;
 return `${sh(L('Rules','Tetapan'),L('How much SmartStock may do on its own','Setakat mana SmartStock boleh bertindak sendiri'))}
 <div class="lvl"><div class="lvl-h"><span class="pill ok">${L('Level 1','Tahap 1')}</span><h3>${L('Runs automatically','Berjalan automatik')}</h3></div>
  ${rule(L('Recalculate costs','Kira semula kos'),L('Every recorded transaction updates cost and stock value.','Setiap transaksi mengemas kini kos dan nilai stok.'),sw('cost',true,true))}
  ${rule(L('Low-stock alerts','Amaran stok rendah'),L('Notify admin when an item drops below its minimum.','Maklumkan admin bila item bawah paras minimum.'),sw('lowAlert',R.lowAlert))}
  ${rule(L('Expiry alerts','Amaran luput'),L('Notify when a batch is close to expiry.','Maklumkan bila kelompok hampir luput.'),sw('expAlert',R.expAlert))}
  ${rule(L('Confirm before recording','Sahkan sebelum rekod'),L('Ask "Confirm?" after a voice command to use or receive stock. Turn off for hands-free speed.','Tanya "Betul?" selepas arahan suara guna atau terima stok. Matikan untuk lebih pantas.'),sw('confirm',R.confirm))}</div>
 <div class="lvl"><div class="lvl-h"><span class="pill warn">${L('Level 2','Tahap 2')}</span><h3>${L('Suggests, you decide','Cadang, anda putuskan')}</h3></div>
  ${rule(L('Flag unusual usage','Tanda penggunaan luar biasa'),L('Warn when an item is used far above its normal rate.','Beri amaran bila penggunaan jauh melebihi kadar biasa.'),sw('anomaly',R.anomaly))}
  ${rule(L('Reorder suggestions','Cadangan order semula'),L('Suggest quantities based on average daily use.','Cadang kuantiti berdasarkan purata guna harian.'),sw('suggest',true,true))}</div>
 <div class="lvl"><div class="lvl-h"><span class="pill bad">${L('Level 3','Tahap 3')}</span><h3>${L('Needs your approval','Perlu kelulusan anda')}</h3></div>
  ${rule(L('Purchase orders','Pesanan pembelian'),L('Always require admin approval before sending to a supplier.','Sentiasa perlu kelulusan admin sebelum dihantar kepada pembekal.'),sw('po',true,true))}
  ${rule(L('Write-off limit','Had tulis-off'),L('Waste above this amount waits for approval.','Sisa melebihi jumlah ini menunggu kelulusan.'),`<div class="slide"><input type="range" id="limit" min="0" max="100" step="5" value="${R.limit}" aria-label="${L('Write-off limit','Had tulis-off')}"><b id="limit-v">RM ${R.limit}</b></div>`)}</div>
 <p class="demo-note">${L('Try it: set the limit to RM 5, then say "Waste 1 kg banana".','Cuba: tetapkan had RM 5, kemudian sebut "Buang 1 kilo pisang".')}</p>`;
}
SCENES.cost=costScene2;
SCENES.rules=rulesScene;
SCENES.ops=()=>opsScene()+orderTracking();

document.addEventListener('click',e=>{
 let b;
 if(b=e.target.closest('#stage [data-range]')){S.range=+b.dataset.range;refresh()}
 if(b=e.target.closest('#stage [data-rule]')){const k=b.dataset.rule;S.rules[k]=!S.rules[k];b.setAttribute('aria-checked',S.rules[k])}
});
document.addEventListener('input',e=>{if(e.target.id==='limit'){S.rules.limit=+e.target.value;$('#limit-v').textContent='RM '+S.rules.limit}});

/* login, account, chrome */
function renderLogin(){
 $('#login').innerHTML=`<div class="lg-art"><div class="lg-jars" aria-hidden="true"><i style="--h:70%;height:120px"></i><i style="--h:40%;height:90px"></i><i style="--h:85%;height:150px"></i><i style="--h:55%;height:104px"></i></div>
  <div><h1>${L('Say it. It is done.','Cakap. Siap.')}</h1><p style="margin-top:16px">${L('Inventory, cost and approvals for small businesses, run by voice.','Inventori, kos dan kelulusan untuk perniagaan kecil, dikawal dengan suara.')}</p></div><span style="opacity:.8;font-size:13px">SmartStock Intelligence</span></div>
  <div class="lg-form"><div><h2>${L('Sign in to Dapur Syahmi','Log masuk ke Dapur Syahmi')}</h2><p class="meta" style="padding:8px 0 0">${L('Choose a demo account.','Pilih akaun demo.')}</p></div>
  <button class="rolecard" data-enter="admin"><span class="avatar">S</span><span><b>Syahmi · Admin</b><span>${L('Briefing, costs, approvals and rules','Ringkasan, kos, kelulusan dan tetapan')}</span></span></button>
  <button class="rolecard" data-enter="staff"><span class="avatar" style="background:var(--ok)">F</span><span><b>Syafiq · ${L('Staff','Staf')}</b><span>${L('Simple screen. Voice for daily tasks.','Skrin ringkas. Suara untuk tugas harian.')}</span></span></button>
  <div class="row" style="margin:0;align-items:center"><button class="tbtn" data-llang="1">${ic('mic',16)}<span>${S.lang==='ms'?'Bahasa Melayu':'English'}</span></button><span class="lg-foot">${L('Demo environment with sample data.','Persekitaran demo dengan data contoh.')}</span></div></div>`;
}
function enter(role){
 S.role=role;S.scene='home';S.filter='all';S.draft=null;S.user=role;$('#login').hidden=true;
 $$('.seg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.role===role));
 render(true);startHints();applyChrome();clearLive();
 if(role==='admin'){
  later(()=>{if(S.rules.expAlert)notify('warn',L('Milk batch B-MI-204 expires in 3 days','Kelompok susu B-MI-204 luput dalam 3 hari'),L('Use it first, or schedule a promotion.','Guna dahulu, atau jalankan promosi.'))},4500);
  later(()=>{if(S.rules.anomaly)notify('warn',L('Unusual chicken usage','Penggunaan ayam luar biasa'),L('Used 56% above the normal daily rate.','Digunakan 56% melebihi kadar harian biasa.'))},10000);
 }else later(()=>notify('ok',L('New task assigned','Tugas baru diberikan'),L('Check banana freshness before 10 am.','Semak kesegaran pisang sebelum 10 pagi.')),5000);
}
document.addEventListener('click',e=>{
 let b;
 if(b=e.target.closest('[data-enter]'))enter(b.dataset.enter);
 if(b=e.target.closest('[data-llang]'))setLang(S.lang==='ms'?'en':'ms');
});
$('#t-user').onclick=()=>{clearLive();closeDrawer();hidePanel();S.demo=false;demoBtn();renderLogin();$('#login').hidden=false};
function applyChrome(){
 $('#biz').textContent=L('Dapur Syahmi · Melaka outlet','Dapur Syahmi · Cawangan Melaka');
 $('#t-user').textContent=S.role==='admin'?'S':'F';$('#t-user').title=S.role==='admin'?'Syahmi · Admin':'Syafiq · '+L('Staff','Staf');
 $('#t-user').style.background=S.role==='admin'?'var(--accent)':'var(--ok)';
 updateBell();
}
const _applyStatic=applyStatic;applyStatic=()=>{_applyStatic();applyChrome()};
const _setLang=setLang;setLang=l=>{_setLang(l);renderLogin();if(S.drawer)drawDrawer()};
const _go=go;go=s=>{closeDrawer();_go(s)};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});


/* ================= Apple ecosystem layer ================= */
const ringMetrics=p=>{const cover=p.qty/p.avg;return [
 {k:'stock',v:clamp(p.qty/p.cap*100,3,100),crit:p.qty<=p.reorder,label:L('Stock','Stok'),val:`${fq(p.qty)} / ${p.cap} ${U(p.unit)}`},
 {k:'fresh',v:p.exp>=14?100:clamp(p.exp/14*100,3,100),crit:p.exp<=3,label:L('Freshness','Kesegaran'),val:p.exp>=14?L('Good','Baik'):`${p.exp} ${L('days','hari')}`},
 {k:'cover',v:clamp(cover/5*100,3,100),crit:cover<1,label:L('Cover','Tempoh'),val:eta(p)}]};
function ringSet(vals,s,sw,delay=0){
 const c=s/2;
 return `<svg class="ringsvg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" aria-hidden="true">`+vals.map((r,i)=>{
  const rad=c-sw/2-1-i*(sw+3),cr=r.crit?' c-crit':'';
  return `<circle class="t c-${r.k}${cr}" cx="${c}" cy="${c}" r="${rad}" stroke-width="${sw}" pathLength="100" stroke-dasharray="100 0"/><circle class="p c-${r.k}${cr}" cx="${c}" cy="${c}" r="${rad}" stroke-width="${sw}" pathLength="100" stroke-dasharray="${r.v.toFixed(1)} 100" style="animation-delay:${delay+i*130}ms"/>`}).join('')+'</svg>';
}
const itemTone=p=>p.qty<=p.reorder?'bad':p.exp<=3?'warn':'ok';

/* stock: one Activity-style ring set per item */
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

/* home: widgets */
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
SCENES.stock=stockScene2;
SCENES.home=()=>S.role==='admin'?homeAdmin2():homeStaff();

/* inspector sheet with big rings */
function drawDrawer(){
 const p=prod(S.drawer);if(!p)return;
 const low=p.qty<=p.reorder,tone=itemTone(p),n=pn(p).toLowerCase(),m=ringMetrics(p);
 const h=hist(p),mx=Math.max(...h)*1.15,W=420,H=90,bw=22,gap=(W-bw*14)/13;
 const bars=h.map((v,i)=>{const bh=v/mx*H,x=i*(bw+gap),d=i===13?L('Today','Hari ini'):dateStr(i-13);return `<rect x="${x}" y="${H-bh}" width="${bw}" height="${bh}" rx="7" fill="${i===13?'var(--accent)':'var(--accent-soft)'}" data-tip="${d}: ${fq(v)} ${U(p.unit)}"/>`}).join('');
 const ay=H-p.avg/mx*H;
 const bt=batches(p).map(b=>`<tr><td>${b.id}</td><td>${dateStr(b.rec)}</td><td><span class="pill ${b.exp<=3?'warn':''}">${dateStr(b.exp)}</span></td><td style="text-align:right">${fq(b.qty)} ${U(p.unit)}</td></tr>`).join('');
 const mv=S.moves.filter(x=>x.p===p.id).slice(0,5).map(x=>`<div><i class="${x.type==='receive'?'up':'dn'}">${ic(x.type==='receive'?'up':'down',15)}</i><span>${{usage:L('Used','Digunakan'),receive:L('Received','Diterima'),waste:L('Wasted','Dibuang')}[x.type]} ${fq(x.q)} ${U(p.unit)}<br><small>${esc(x.who)}</small></span><small>${esc(x.t)}</small></div>`).join('')||`<p class="p-body">${L('No movements yet.','Belum ada pergerakan.')}</p>`;
 const act=[{l:L(`Use 1 ${U(p.unit)}`,`Guna 1 ${U(p.unit)}`),s:`${L('Use','Guna')} 1 ${uw(p.unit)} ${n}`},{l:L(`Receive 10 ${U(p.unit)}`,`Terima 10 ${U(p.unit)}`),s:`${L('Receive','Terima')} 10 ${uw(p.unit)} ${n}`},...(S.role==='admin'?[{l:`Order ${suggest(p)} ${U(p.unit)}`,s:orderSay(p)}]:[])];
 $('#drawer').innerHTML=`<div class="dr-top"><div><span class="pill ${tone}">${low?L('Low stock','Stok rendah'):p.exp<=3?L('Expiring soon','Hampir luput'):L('Healthy','Baik')}</span><h2>${pn(p)}</h2></div><button class="p-x" data-dclose="1" aria-label="${L('Close','Tutup')}">${ic('x',16)}</button></div>
 <div class="dr-hero"><div class="dr-big"><b>${fq(p.qty)}</b><small>${U(p.unit)} ${L('of','daripada')} ${p.cap}</small></div><span class="lvbar lg ${tone}"><i style="--w:${clamp(p.qty/p.cap*100,3,100).toFixed(1)}%"></i><u style="left:${clamp(p.reorder/p.cap*100,0,100).toFixed(1)}%"></u></span>
  <div class="dr-leg">${m.slice(1).map(r=>`<div><b${r.crit?' style="color:var(--r-crit)"':''}>${r.val}</b>${r.label}</div>`).join('')}</div></div>
 <div class="facts" style="margin-top:16px"><div><b>${p.sup}</b><span>${L('supplier','pembekal')}</span></div>${S.role==='admin'?`<div><b>${rm(p.qty*p.cost)}</b><span>${L('value','nilai')}</span></div><div><b>${rm(p.cost)}/${U(p.unit)}</b><span>${L('unit cost','kos seunit')}</span></div>`:''}</div>
 <div class="dr-h">${L('Usage, last 14 days','Penggunaan, 14 hari lalu')}</div>
 <svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="${L('Usage chart','Carta penggunaan')}"><line x1="0" x2="${W}" y1="${ay}" y2="${ay}" stroke="var(--ink-2)" stroke-dasharray="3 5" opacity=".6"/>${bars}</svg>
 <div class="dr-h">${L('Batches','Kelompok')}</div><div class="tblwrap"><table class="tbl"><thead><tr><th>${L('Batch','Kelompok')}</th><th>${L('Received','Diterima')}</th><th>${L('Expires','Luput')}</th><th style="text-align:right">${L('Qty','Kuantiti')}</th></tr></thead><tbody>${bt}</tbody></table></div>
 <div class="dr-h">${L('Recent movements','Pergerakan terkini')}</div><div class="mv">${mv}</div>
 <div class="dr-h">${L('Say or tap','Sebut atau tekan')}</div><div class="p-chips" style="margin-top:0">${act.map(a=>`<button class="chip" data-dsay="${esc(a.s)}">${esc(a.l)}</button>`).join('')}</div>`;
}

/* dock (replaces the sidebar) with macOS-style magnification */
const DKG={home:['#5AC8FA','#007AFF'],stock:['#FFB340','#FF7A00'],cost:['#4CD964','#1FAE4B'],fresh:['#5EE0D0','#14A7B8'],ops:['#FF6B5E','#E5243B'],people:['#C98BF5','#8B3FD1'],rules:['#A8A8B0','#6B6B73']};
function renderPetals(){
 $('#dockitems').innerHTML=NAV[S.role].map(([id,en,ms,icon])=>{const g=DKG[id],b=id==='ops'&&pending().length?`<u>${pending().length}</u>`:'';
  return `<button class="dk ${S.scene===id?'on':''}" data-nav="${id}" data-label="${L(en,ms)}" aria-label="${L(en,ms)}" style="background:linear-gradient(160deg,${g[0]},${g[1]})">${ic(icon,26)}${b}</button>`}).join('');
}
$('#dockitems').addEventListener('click',e=>{const b=e.target.closest('[data-nav]');if(!b)return;b.classList.remove('bounce');void b.offsetWidth;b.classList.add('bounce');go(b.dataset.nav)});
const dockEl=$('.dock'),dockBtns=()=>$$('.dk,#orb',dockEl);
dockEl.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;
 dockBtns().forEach(el=>{const r=el.getBoundingClientRect(),d=e.clientX-(r.left+r.width/2),s=1+.66*Math.exp(-(d*d)/(2*58*58));el.style.scale=s.toFixed(3);el.style.translate=`0 ${(-(s-1)*8).toFixed(1)}px`})});
dockEl.addEventListener('pointerleave',()=>dockBtns().forEach(el=>{el.style.scale='';el.style.translate=''}));

/* dynamic island: voice states + live alerts */
function setOrb(s){$('#orb').dataset.state=s;const i=$('#island');i.dataset.state=s;if(s!=='idle')i.dataset.mode=''}
const islQ=[];let islBusy=false;
function pumpIsland(){
 if(islBusy||!islQ.length)return;
 const i=$('#island');if(i.dataset.state!=='idle'){setTimeout(pumpIsland,900);return}
 islBusy=true;const n=islQ.shift();
 $('#isl-ic').className=n.tone;$('#isl-ic').innerHTML=ic(n.tone==='ok'?'check':'alert',16);$('#isl-t').textContent=n.title;$('#isl-b').textContent=n.body;
 i.dataset.mode='note';
 setTimeout(()=>{if(i.dataset.mode==='note')i.dataset.mode='';islBusy=false;setTimeout(pumpIsland,450)},4800);
}
function notify(tone,title,body){S.notes.unshift({tone,title,body,t:new Date(),read:false});updateBell();islQ.push({tone,title,body});pumpIsland()}
$('#island').onclick=()=>{if($('#island').dataset.state==='idle')cmdEl.classList.contains('show')?closeCmd():openCmd()};

/* segmented controls: sliding thumb */
function syncSegs(){
 $$('.seg').forEach(sg=>{let th=sg.querySelector('.thumb');if(!th){th=document.createElement('i');th.className='thumb';sg.prepend(th)}
  const b=sg.querySelector('[aria-pressed=true]');if(!b||!b.offsetWidth){th.style.width='0px';return}
  th.style.width=b.offsetWidth+'px';th.style.transform=`translateX(${b.offsetLeft-2}px)`});
}
new MutationObserver(()=>requestAnimationFrame(syncSegs)).observe(document.body,{subtree:true,attributes:true,attributeFilter:['aria-pressed'],childList:true});
addEventListener('resize',syncSegs);

/* specular light, 3D tilt, cost scrubbing, haptics */
document.addEventListener('pointermove',e=>{
 const el=e.target.closest&&e.target.closest('.w,.rg,.tile,.rcard,.po,.sup');
 if(el){const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  el.style.setProperty('--mx',(x*100).toFixed(0)+'%');el.style.setProperty('--my',(y*100).toFixed(0)+'%');
  if(el.classList.contains('rg')){el.style.setProperty('--ry',((x-.5)*16).toFixed(1)+'deg');el.style.setProperty('--rx',((.5-y)*16).toFixed(1)+'deg')}}
 const bn=$('#bn');if(bn){if(!bn.dataset.orig)bn.dataset.orig=bn.textContent;
  const rc=e.target.closest&&e.target.closest('.chart rect[data-tip]');const m=rc&&rc.dataset.tip.match(/RM [\d,]+/);bn.textContent=m?m[0]:bn.dataset.orig}
});
document.addEventListener('pointerout',e=>{const el=e.target.closest&&e.target.closest('.rg');if(el&&!el.contains(e.relatedTarget)){el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg')}});
document.addEventListener('click',e=>{if(e.target.closest('button')){try{navigator.vibrate&&navigator.vibrate(6)}catch(x){}}},true);

/* sign-in: lock-screen style */
function renderLogin(){
 const d=new Date(),t=d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}),ds=d.toLocaleDateString(S.lang==='ms'?'ms-MY':'en-GB',{weekday:'long',day:'numeric',month:'long'});
 $('#login').innerHTML=`<div><h1 class="lg-time">${t}</h1><p class="lg-date">${ds}</p></div>
  <div class="lg-users"><button class="lg-u" data-enter="admin"><i style="background:linear-gradient(145deg,#5AC8FA,#007AFF)">S</i><b>Syahmi</b><span>Admin</span></button><button class="lg-u" data-enter="staff"><i style="background:linear-gradient(145deg,#4CD964,#1FAE4B)">F</i><b>Syafiq</b><span>${L('Staff','Staf')}</span></button></div>
  <div class="lg-foot"><span>${L('Choose an account to sign in to Dapur Syahmi','Pilih akaun untuk log masuk ke Dapur Syahmi')}</span><button class="tbtn" data-llang="1">${ic('mic',16)}<span>${S.lang==='ms'?'Bahasa Melayu':'English'}</span></button></div>`;
}
const _enter=enter;enter=role=>{const l=$('#login');l.classList.add('leave');setTimeout(()=>{l.classList.remove('leave');_enter(role)},600)};

renderLogin();$('#login').hidden=false;
applyStatic();render(true);startHints();syncSegs();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(syncSegs);
})();

