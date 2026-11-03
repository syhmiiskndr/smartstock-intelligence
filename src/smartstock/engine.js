/* SmartStock Intelligence – voice-first engine (Apple-style prototype)
 * Shared by every /voice/* page. Scenes live in ./scenes/*.js (one file per page).
 * mountVoiceApp() builds the UI once; pages call show(scene) to switch. */
import './voice.css';
import MARKUP from './markup.js';

const sceneModules = import.meta.glob('./scenes/*.js', { eager: true });
const store = (globalThis.__smartstockVoice ||= {}); // keeps data and state while you move between pages

export function mountVoiceApp(host, opts = {}) {
  if (!document.getElementById('ss-font')) {
    const l = document.createElement('link');
    l.id = 'ss-font'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(l);
  }
  const root = document.createElement('div');
  root.id = 'ss-root';
  root.innerHTML = MARKUP;
  host.appendChild(root);
  const offs = [];
  const track = (t, e, f, o) => { t.addEventListener(e, f, o); offs.push(() => t.removeEventListener(e, f, o)); };

  const $=(s,el=root)=>el.querySelector(s);
  const $$=(s,el=root)=>[...el.querySelectorAll(s)];
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
  const P=store.P||(store.P=[
   {id:'ayam',name:'Ayam',en:'Chicken',unit:'kg',qty:4.2,cap:40,reorder:10,cost:9.5,exp:2,avg:9,sup:'Segar Jaya'},
   {id:'tepung',name:'Tepung',en:'Flour',unit:'kg',qty:38,cap:50,reorder:15,cost:3.2,exp:120,avg:11,sup:'Mill Sentosa'},
   {id:'minyak',name:'Minyak',en:'Oil',unit:'L',qty:14,cap:25,reorder:8,cost:7.5,exp:200,avg:6,sup:'Mill Sentosa'},
   {id:'susu',name:'Susu',en:'Milk',unit:'L',qty:26,cap:40,reorder:10,cost:6.8,exp:3,avg:11,sup:'Ladang Hijau'},
   {id:'telur',name:'Telur',en:'Eggs',unit:'biji',qty:240,cap:360,reorder:100,cost:.55,exp:12,avg:85,sup:'Segar Jaya'},
   {id:'beras',name:'Beras',en:'Rice',unit:'kg',qty:70,cap:100,reorder:30,cost:3.8,exp:300,avg:15,sup:'Mill Sentosa'},
   {id:'pisang',name:'Pisang',en:'Banana',unit:'kg',qty:14,cap:20,reorder:6,cost:4.5,exp:2,avg:6,sup:'Ladang Hijau'},
   {id:'bawang',name:'Bawang',en:'Onion',unit:'kg',qty:9,cap:20,reorder:8,cost:5.2,exp:25,avg:4,sup:'Segar Jaya'}
  ]);
  const prod=id=>P.find(p=>p.id===id);
  const L=(en,ms)=>S.lang==='ms'?ms:en;
  const pn=p=>L(p.en,p.name);
  const U=u=>u==='biji'?L('pcs','biji'):u;
  const uw=u=>S.lang==='ms'?{kg:'kilo',L:'liter',biji:'biji'}[u]:{kg:'kg',L:'litres',biji:'pieces'}[u];
  const S=store.S||(store.S=(()=>{const S={
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
  S.moves=[{p:'ayam',type:'usage',q:3,t:'08:40',who:'Syafiq'},{p:'susu',type:'receive',q:20,t:'07:55',who:'Hakim'},{p:'ayam',type:'receive',q:20,t:'Yesterday',who:'Hakim'},{p:'telur',type:'usage',q:30,t:'09:10',who:'Syafiq'},{p:'ayam',type:'usage',q:4,t:'10:25',who:'Syafiq'}];return S})());
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
















  const SCENES={};const missingScene=()=>`<div class="sh"><h1 class="h1">${L("Not available yet","Belum tersedia")}</h1><p class="meta">${L("This page has not been merged into the project yet.","Page ini belum digabungkan ke dalam projek.")}</p></div>`;

  /* ---- shell: render, panel, dock ---- */
  const stage=$('#stage'), panelEl=$('#panel'), cmdEl=$('#cmd');
  let acts=[], panelTimer, hintTimer, hintI=0, typing=null;

  function render(bloom){
   stage.innerHTML=(SCENES[S.scene]||missingScene)();
   if(bloom){stage.classList.remove('bloom');void stage.offsetWidth;stage.classList.add('bloom');stage.scrollTop=0}
   if(S.scene==='ops')bindOps();
   renderPetals();
  }
  function go(scene){
   if(S.role==='staff'&&!['home','stock','fresh'].includes(scene))return deny();
   S.scene=scene;closeMenu();render(true);if(opts.onNavigate)opts.onNavigate(scene);
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

  function openMenu(){closeCmd();$('#petals').classList.add('open');$('#scrim').hidden=false;$('#b-menu').setAttribute('aria-pressed','true')}
  function closeMenu(){$('#petals').classList.remove('open');$('#scrim').hidden=true;$('#b-menu').setAttribute('aria-pressed','false')}
  $('#b-menu').onclick=()=>$('#petals').classList.contains('open')?closeMenu():openMenu();
  $('#scrim').onclick=closeMenu;
  $('#petals').onclick=e=>{const b=e.target.closest('[data-nav]');if(b)go(b.dataset.nav)};

  /* hint + orb */
  function setHint(t,live){const h=$('#hint');h.textContent=t;h.classList.toggle('live',!!live)}
  function rotateHint(){const ex=examples();setHint(`${L('Try saying','Cuba sebut')} “${ex[hintI++%ex.length]}”`)}

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

  track(document,'click',e=>{
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
  track(document,'keydown',e=>{
   if(e.key==='Escape'){closeMenu();closeCmd();hidePanel()}
   if(/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;
   if(e.code==='Space'&&!e.target.closest('button')){e.preventDefault();$('#orb').click()}
   if(e.key==='/'){e.preventDefault();openCmd()}
  });
  track(window,'resize',renderPetals);


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

  function showNotes(){
   S.notes.forEach(n=>n.read=true);updateBell();
   const rows=S.notes.length?S.notes.slice(0,8).map(n=>`<div><i class="${n.tone}"></i><span><b>${esc(n.title)}</b>${esc(n.body)}</span><time>${hhmm(n.t)}</time></div>`).join(''):`<p class="p-body">${L('Nothing yet. SmartStock will alert you about low stock, expiry and orders.','Belum ada. SmartStock akan beri amaran stok rendah, luput dan order.')}</p>`;
   panel({state:L('Notifications','Notifikasi'),title:L('What needs your attention','Apa yang perlukan perhatian'),html:`<div class="nl">${rows}</div>`,persist:true});
  }
  $('#t-bell').onclick=showNotes;

  /* tooltip (charts, sparkline) */
  const tip=$('#tip');
  track(document,'pointermove',e=>{
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


  /* rules: these settings change how the system behaves */





  track(document,'click',e=>{
   let b;
   if(b=e.target.closest('#stage [data-range]')){S.range=+b.dataset.range;refresh()}
   if(b=e.target.closest('#stage [data-rule]')){const k=b.dataset.rule;S.rules[k]=!S.rules[k];b.setAttribute('aria-checked',S.rules[k])}
  });
  track(document,'input',e=>{if(e.target.id==='limit'){S.rules.limit=+e.target.value;$('#limit-v').textContent='RM '+S.rules.limit}});

  /* login, account, chrome */

  function enter(role){
   S.role=role;S.scene='home';if(opts.onNavigate)opts.onNavigate('home');S.filter='all';S.draft=null;S.user=role;$('#login').hidden=true;
   $$('.seg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.role===role));
   render(true);startHints();applyChrome();clearLive();
   if(role==='admin'){
    later(()=>{if(S.rules.expAlert)notify('warn',L('Milk batch B-MI-204 expires in 3 days','Kelompok susu B-MI-204 luput dalam 3 hari'),L('Use it first, or schedule a promotion.','Guna dahulu, atau jalankan promosi.'))},4500);
    later(()=>{if(S.rules.anomaly)notify('warn',L('Unusual chicken usage','Penggunaan ayam luar biasa'),L('Used 56% above the normal daily rate.','Digunakan 56% melebihi kadar harian biasa.'))},10000);
   }else later(()=>notify('ok',L('New task assigned','Tugas baru diberikan'),L('Check banana freshness before 10 am.','Semak kesegaran pisang sebelum 10 pagi.')),5000);
  }
  track(document,'click',e=>{
   let b;
   if(b=e.target.closest('[data-enter]'))enter(b.dataset.enter);
   if(b=e.target.closest('[data-llang]'))setLang(S.lang==='ms'?'en':'ms');
  });
  $('#t-user').onclick=()=>{clearLive();closeDrawer();hidePanel();S.demo=false;S.user=null;demoBtn();renderLogin();$('#login').hidden=false};
  function applyChrome(){
   $('#biz').textContent=L('Dapur Syahmi · Melaka outlet','Dapur Syahmi · Cawangan Melaka');
   $('#t-user').textContent=S.role==='admin'?'S':'F';$('#t-user').title=S.role==='admin'?'Syahmi · Admin':'Syafiq · '+L('Staff','Staf');
   $('#t-user').style.background=S.role==='admin'?'var(--accent)':'var(--ok)';
   updateBell();
  }
  const _applyStatic=applyStatic;applyStatic=()=>{_applyStatic();applyChrome()};
  const _setLang=setLang;setLang=l=>{_setLang(l);renderLogin();if(S.drawer)drawDrawer()};
  const _go=go;go=s=>{closeDrawer();_go(s)};
  track(document,'keydown',e=>{if(e.key==='Escape')closeDrawer()});


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


  /* home: widgets */





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
  new MutationObserver(()=>requestAnimationFrame(syncSegs)).observe(root,{subtree:true,attributes:true,attributeFilter:['aria-pressed'],childList:true});
  track(window,'resize',syncSegs);

  /* specular light, 3D tilt, cost scrubbing, haptics */
  track(document,'pointermove',e=>{
   const el=e.target.closest&&e.target.closest('.w,.rg,.tile,.rcard,.po,.sup');
   if(el){const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    el.style.setProperty('--mx',(x*100).toFixed(0)+'%');el.style.setProperty('--my',(y*100).toFixed(0)+'%');
    if(el.classList.contains('rg')){el.style.setProperty('--ry',((x-.5)*16).toFixed(1)+'deg');el.style.setProperty('--rx',((.5-y)*16).toFixed(1)+'deg')}}
   const bn=$('#bn');if(bn){if(!bn.dataset.orig)bn.dataset.orig=bn.textContent;
    const rc=e.target.closest&&e.target.closest('.chart rect[data-tip]');const m=rc&&rc.dataset.tip.match(/RM [\d,]+/);bn.textContent=m?m[0]:bn.dataset.orig}
  });
  track(document,'pointerout',e=>{const el=e.target.closest&&e.target.closest('.rg');if(el&&!el.contains(e.relatedTarget)){el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg')}});
  track(document,'click',e=>{if(e.target.closest('button')){try{navigator.vibrate&&navigator.vibrate(6)}catch(x){}}},true);

  /* sign-in: lock-screen style */
  function renderLogin(){
   const d=new Date(),t=d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}),ds=d.toLocaleDateString(S.lang==='ms'?'ms-MY':'en-GB',{weekday:'long',day:'numeric',month:'long'});
   $('#login').innerHTML=`<div><h1 class="lg-time">${t}</h1><p class="lg-date">${ds}</p></div>
    <div class="lg-users"><button class="lg-u" data-enter="admin"><i style="background:linear-gradient(145deg,#5AC8FA,#007AFF)">S</i><b>Syahmi</b><span>Admin</span></button><button class="lg-u" data-enter="staff"><i style="background:linear-gradient(145deg,#4CD964,#1FAE4B)">F</i><b>Syafiq</b><span>${L('Staff','Staf')}</span></button></div>
    <div class="lg-foot"><span>${L('Choose an account to sign in to Dapur Syahmi','Pilih akaun untuk log masuk ke Dapur Syahmi')}</span><button class="tbtn" data-llang="1">${ic('mic',16)}<span>${S.lang==='ms'?'Bahasa Melayu':'English'}</span></button></div>`;
  }
  const _enter=enter;enter=role=>{const l=$('#login');l.classList.add('leave');setTimeout(()=>{l.classList.remove('leave');_enter(role)},600)};




  /* ---- register scenes (src/smartstock/scenes/*.js) ---- */
  const api={
    get S(){return S},
    get L(){return L},
    get sayHint(){return sayHint},
    get examples(){return examples},
    get ic(){return ic},
    get ringSet(){return ringSet},
    get P(){return P},
    get costToday(){return costToday},
    get costAvg(){return costAvg},
    get pending(){return pending},
    get clamp(){return clamp},
    get seriesN(){return seriesN},
    get pn(){return pn},
    get eta(){return eta},
    get esc(){return esc},
    get orderSay(){return orderSay},
    get suggest(){return suggest},
    get U(){return U},
    get fq(){return fq},
    get greet(){return greet},
    get rm0(){return rm0},
    get ringMetrics(){return ringMetrics},
    get itemTone(){return itemTone},
    get stockValue(){return stockValue},
    get sh(){return sh},
    get dateStr(){return dateStr},
    get reqTitle(){return reqTitle},
    get byName(){return byName},
    get reqReason(){return reqReason},
    get orderTracking(){return orderTracking}
  };
  for(const m of Object.values(sceneModules))Object.assign(SCENES,m.default(api));

  /* ---- boot ---- */
  if(opts.scene&&opts.scene!=='login')S.scene=opts.scene;
  S.demo=false;
  renderLogin();$('#login').hidden=!!S.user;applyStatic();

  render(true);startHints();syncSegs();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(syncSegs);
  return {
    show(scene) {
      if (scene === 'login') { clearLive(); closeDrawer(); hidePanel(); S.user = null; renderLogin(); $('#login').hidden = false; return; }
      if (!S.user) return;
      if (S.scene !== scene) { go(scene); if (opts.onNavigate) opts.onNavigate(S.scene, true); }
    },
    destroy() {
      offs.forEach((f) => f());
      clearLive(); clearInterval(hintTimer);
      try { rec && rec.abort(); } catch (e) { /* mic not running */ }
      root.remove();
    },
  };
}
