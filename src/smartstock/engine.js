/* SmartStock Intelligence – voice-first engine (Apple-style prototype)
 * Shared by every /voice/* page. Scenes live in ./scenes/*.js (one file per page).
 * mountVoiceApp() builds the UI once; pages call show(scene) to switch. */
import './voice.css';
import MARKUP from './markup.js';
import * as DB from './data.js';

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
   trend:'M3 17l6-6 4 4 8-8M15 7h6v6',
   back:'M15 5l-7 7 7 7'
  };
  const ic=(n,s=20)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IC[n]}"/></svg>`;

  /* ---- data: everything comes from Supabase (see data.js). Nothing is hardcoded here. ---- */
  const P=store.P||(store.P=[]);
  const prod=id=>P.find(p=>p.id===id);
  const L=(en,ms)=>S.lang==='ms'?ms:en;
  const pn=p=>L(p.en,p.name);
  const U=u=>u==='biji'?L('pcs','biji'):u;
  const uw=u=>S.lang==='ms'?{kg:'kilo',L:'liter',biji:'biji'}[u]:{kg:'kg',L:'litres',biji:'pieces'}[u];
  const S=store.S||(store.S=(()=>{const S={
   role:'staff',scene:'home',filter:'all',lang:'en',draft:null,pulse:null,micBlocked:false,
   use:{},series:[],requests:[],waste:[],tasks:[],moves:[],
   audit:[],fresh:{res:null,scanning:false,n:0},rid:1
  };
  S.notes=[];S.range=7;S.orders=[];S.user=null;S.drawer=null;S.live=false;S.me=null;S.team=null;S.vendors=null;S.expired=null;
  S.rules={lowAlert:true,expAlert:true,anomaly:true,confirm:true,limit:15,adminFinance:false};
  return S})());
  if(!S.an)S.an={metric:'cost',range:30,cmp:true,fc:true,cat:null};
  if(!S.pl)S.pl={sel:null,day:0,used:{},filter:null,playing:false,shown:0,toast:''};
  /* clear everything that belongs to the signed-in company (used on sign-out) */
  function clearData(){
   P.length=0;Object.assign(S,{daily:null,use:{},series:[],requests:[],waste:[],tasks:[],moves:[],orders:[],live:false,me:null,team:null,vendors:null,expired:null,authMode:null});
   S.notes=[];S.rules.adminFinance=false;S.pl.sel=null;S.pl.used={};
  }
  function alertNote(a){
   const p=prod(a.pid);if(!p)return null;const n=pn(p),t=new Date(a.t);
   const m={low_stock:['warn',L('Low stock: '+n,'Stok rendah: '+n),L(`${fq(p.qty)} ${U(p.unit)} left.`,`Baki ${fq(p.qty)} ${U(p.unit)}.`)],
    out_of_stock:['bad',L('Out of stock: '+n,'Stok habis: '+n),L('Order or receive stock.','Buat order atau terima stok.')],
    expiring_soon:['warn',L('Expiring soon: '+n,'Hampir luput: '+n),L(`Expires in ${p.exp} days. Use it first.`,`Luput dalam ${p.exp} hari. Guna dahulu.`)],
    expired:['bad',L('Expired: '+n,'Luput: '+n),L('Write off the expired stock.','Tulis-off stok yang luput.')]}[a.type];
   return m?{tone:m[0],title:m[1],body:m[2],t,read:false,db:true,aid:a.id}:null;
  }
  function applyData(d){
   P.length=0;P.push(...d.products);
   Object.assign(S,{daily:d.daily,use:d.use,series:d.series,moves:d.moves,waste:d.waste,requests:d.requests,orders:d.orders,tasks:[],live:true,me:d.me,team:d.team,vendors:d.vendors,expired:d.expired});
   S.rules.adminFinance=d.rules.adminFinance;S.rules.limit=d.rules.limit;
   if(!P.some(p=>p.id===S.pl.sel)){S.pl.sel=P[0]?P[0].id:null;S.pl.used={}}
   S.alerts=d.alerts;S.notes=S.notes.filter(n=>!n.db).concat(d.alerts.map(alertNote).filter(Boolean));updateBell();
  }
  const rehydrate=()=>DB.loadAll().then(d=>{applyData(d);if(S.user)refresh()});
  /* run a database write, then reload the real numbers; on error show it and reload so the screen never lies */
  function dbw(fn){
   if(!S.live)return;
   fn().then(rehydrate).catch(e=>{notify('bad',L('Not saved','Tidak disimpan'),String(e&&e.message||e));rehydrate().catch(()=>{})});
  }

  /* ---- company setup and management forms (live accounts only) ---- */
  const FM=(id,label,type,ph,val)=>`<label class="fm-f"><span>${label}</span><input id="fm-${id}" type="${type||'text'}" placeholder="${esc(ph||'')}" value="${esc(val||'')}" autocomplete="off" ${type==='number'?'inputmode="decimal" step="any"':''}></label>`;
  const FMS=(id,label,opts,sel)=>`<label class="fm-f"><span>${label}</span><select id="fm-${id}">${opts.map(([v,t])=>`<option value="${esc(v)}" ${String(v)===String(sel)?'selected':''}>${esc(t)}</option>`).join('')}</select></label>`;
  const fmErr=m=>{const e=$('#fm-err');if(e)e.textContent=m};
  function fmPanel(o){
   panel({state:o.state||'',title:o.title,body:o.body,persist:true,
    html:`<div class="fm">${o.html}<p class="lg-err fm-err" id="fm-err" role="alert"></p></div>`,
    actions:[{label:L('Cancel','Batal'),fn:hidePanel},{label:o.cta,kind:'ok',fn:()=>{
     const v={};$$('#panel [id^="fm-"]').forEach(el=>{if(el.id!=='fm-err')v[el.id.slice(3)]=el.value.trim()});
     const bad=o.check&&o.check(v);if(bad){fmErr(bad);return}
     fmErr('');ppDone(o.run(v),o.done)}}]});
   const f=$('#panel input');if(f)f.focus({preventScroll:true});
  }
  function ppDone(pr,msg){
   return Promise.resolve(pr).then(rehydrate).then(()=>{hidePanel();notify('ok',msg,'')}).catch(e=>{
    const m=String(e&&e.message||e);if($('#fm-err'))fmErr(m);else notify('bad',L('Not saved','Tidak disimpan'),m)});
  }
  function ppAct(a){
   if(!S.live)return;
   const [k,arg]=a.split(':'),own=isOwner(),mgr=isMgr();
   if(k==='seed'&&mgr){
    ppDone(DB.seedSample(),L('Sample data loaded','Data contoh dimuat'));
   }else if(k==='resetdemo'&&own){
    panel({state:L('Reset','Reset'),tone:'warn',title:L('Reset demo data?','Reset data demo?'),body:L('All stock, orders and history in this demo company are deleted and the sample data is loaded again.','Semua stok, order dan sejarah dalam syarikat demo ini dipadam dan data contoh dimuat semula.'),persist:true,
     actions:[{label:L('Cancel','Batal'),fn:hidePanel},{label:L('Reset','Reset'),kind:'ok',fn:()=>ppDone(DB.resetDemo(),L('Demo data reset','Data demo di-reset'))}]});
   }else if(k==='invite'&&mgr){
    const mk=role=>DB.createInvite(role).then(code=>panel({state:L('Invite','Jemputan'),title:L('Invite code','Kod jemputan'),big:code,
      body:L('Share this code. It works once and expires in 7 days. They register on the login page, choose "Join with code" and enter it.','Kongsi kod ini. Ia sah sekali sahaja dan tamat dalam 7 hari. Mereka daftar di halaman log masuk, pilih "Sertai dengan kod" dan masukkan kod ini.'),
      persist:true,actions:[{label:L('Done','Selesai'),kind:'ok',fn:hidePanel}]})).catch(e=>notify('bad',L('Not created','Tidak dicipta'),String(e.message||e)));
    panel({state:L('Invite','Jemputan'),title:L('Invite a team member','Jemput ahli pasukan'),body:L('Pick the role they will have.','Pilih peranan mereka.'),persist:true,
     actions:[{label:L('Staff','Staf'),kind:'ok',fn:()=>mk('staff')},...(own?[{label:'Admin',fn:()=>mk('admin')}]:[])]});
   }else if(k==='member'&&own){
    const m=(S.team||[]).find(x=>x.id===arg);if(!m||m.id===S.me.id)return;
    panel({state:roleName(m.role),title:m.name,body:m.email||'',persist:true,actions:[
     ...(m.role!=='admin'?[{label:L('Make admin','Jadikan admin'),fn:()=>ppDone(DB.setMember(m.id,'admin',m.active),L('Role updated','Peranan dikemas kini'))}]:[]),
     ...(m.role!=='staff'?[{label:L('Make staff','Jadikan staf'),fn:()=>ppDone(DB.setMember(m.id,'staff',m.active),L('Role updated','Peranan dikemas kini'))}]:[]),
     {label:m.active?L('Deactivate','Nyahaktif'):L('Reactivate','Aktifkan semula'),fn:()=>ppDone(DB.setMember(m.id,m.role,!m.active),L('Updated','Dikemas kini'))}]});
   }else if(k==='addsup'&&mgr){
    fmPanel({state:L('New supplier','Pembekal baru'),title:L('Add a supplier','Tambah pembekal'),cta:L('Add','Tambah'),done:L('Supplier added','Pembekal ditambah'),
     html:FM('name',L('Supplier name','Nama pembekal'),'text','Segar Jaya')+FM('contact',L('Contact person','Orang untuk dihubungi'))+FM('phone',L('Phone','Telefon'),'tel')+FM('lead',L('Delivery time (days)','Masa penghantaran (hari)'),'number','2','2'),
     check:v=>v.name?'':L('Enter the supplier name.','Masukkan nama pembekal.'),run:v=>DB.addVendor(v)});
   }else if(k==='delsup'&&mgr){
    const v=(S.vendors||[]).find(x=>String(x.id)===arg);if(!v)return;
    panel({state:L('Remove','Buang'),tone:'warn',title:L(`Remove ${v.name}?`,`Buang ${v.name}?`),body:L('Past stock and orders keep their history.','Stok dan order lepas kekal dalam sejarah.'),persist:true,
     actions:[{label:L('Cancel','Batal'),fn:hidePanel},{label:L('Remove','Buang'),kind:'ok',fn:()=>ppDone(DB.removeVendor(v.id),L('Supplier removed','Pembekal dibuang'))}]});
   }else if(k==='addprod'&&mgr){
    fmPanel({state:L('New item','Item baru'),title:L('Add an item','Tambah item'),cta:L('Add','Tambah'),done:L('Item added','Item ditambah'),
     html:FM('name',L('Item name','Nama item'),'text','Epal Fuji')+FMS('unit',L('Unit','Unit'),[['kg','kg'],['g','g'],['pcs',L('pieces','biji')]])
      +FM('reorder',L('Reorder level (alert below this)','Paras susun semula (amaran di bawah ini)'),'number','10')+FM('shelf',L('Shelf life (days)','Hayat simpanan (hari)'),'number','7')
      +FM('price',L('Selling price (RM)','Harga jualan (RM)'),'number','')+FM('stock',L('Opening stock (optional)','Stok permulaan (pilihan)'),'number','')+FM('cost',L('Cost per unit, RM (optional)','Kos seunit, RM (pilihan)'),'number','')
      +FMS('vendor',L('Supplier (optional)','Pembekal (pilihan)'),[['','-'],...(S.vendors||[]).map(v=>[v.id,v.name])]),
     check:v=>!v.name?L('Enter the item name.','Masukkan nama item.'):(Number(v.shelf)<0||Number(v.stock)<0?L('Numbers cannot be negative.','Nombor tidak boleh negatif.'):''),run:v=>DB.addProduct(v)});
   }else if(k==='manage'&&mgr){
    panel({state:L('Items','Item'),title:L('Manage items','Urus item'),body:L('Tap ✎ to edit an item or ✕ to remove it. History stays.','Tekan ✎ untuk edit atau ✕ untuk buang. Sejarah kekal.'),persist:true,
     html:`<div class="mng">${P.map(p=>`<div><span>${esc(pn(p))}</span><span><button class="mng-x" data-pp="editprod:${p.id}" aria-label="${L('Edit','Edit')} ${esc(pn(p))}">✎</button> <button class="mng-x" data-pp="delprod:${p.id}" aria-label="${L('Remove','Buang')} ${esc(pn(p))}">✕</button></span></div>`).join('')}</div>`,
     actions:[{label:L('Done','Selesai'),kind:'ok',fn:hidePanel}]});
   }else if(k==='delprod'&&mgr){
    const p=prod(arg);if(!p)return;
    panel({state:L('Remove','Buang'),tone:'warn',title:L(`Remove ${pn(p)}?`,`Buang ${pn(p)}?`),body:L(`${fq(p.qty)} ${U(p.unit)} is in stock. The item leaves the list; history stays.`,`${fq(p.qty)} ${U(p.unit)} dalam stok. Item keluar dari senarai; sejarah kekal.`),persist:true,
     actions:[{label:L('Cancel','Batal'),fn:hidePanel},{label:L('Remove','Buang'),kind:'ok',fn:()=>ppDone(DB.removeProduct(p.dbId),L('Item removed','Item dibuang'))}]});
   }else if(k==='recv'){
    const p0=prod(arg)||P[0];if(!p0)return;
    const t=isMgr(),fin=canFin();
    fmPanel({state:L('Receive stock','Terima stok'),title:t?L('Receive stock','Terima stok'):L('Report a delivery','Lapor penghantaran'),
     body:t?'':L('An admin approves it before stock is added.','Admin lulus dahulu sebelum stok ditambah.'),cta:t?L('Receive','Terima'):L('Send to admin','Hantar kepada admin'),
     done:t?L('Stock received','Stok diterima'):L('Sent to admin','Dihantar kepada admin'),
     html:FMS('item',L('Item','Item'),P.map(x=>[x.id,pn(x)]),p0.id)+FM('qty',L('Quantity received','Kuantiti diterima'),'number','0')
      +FMS('vendor',L('Supplier','Pembekal'),[['','-'],...(S.vendors||[]).map(v=>[v.id,v.name])],p0.supId||'')
      +(fin||t?FM('cost',L('Cost per unit (RM)','Kos seunit (RM)'),'number','',p0.cost?String(Math.round(p0.cost*100)/100):''):'')
      +FM('expiry',L('Expiry date (leave empty to use shelf life)','Tarikh luput (kosongkan untuk guna hayat simpanan)'),'date','',''),
     check:v=>!(Number(v.qty)>0)?L('Enter the quantity received.','Masukkan kuantiti diterima.'):(v.expiry&&v.expiry<new Date().toISOString().slice(0,10)?L('Expiry date is in the past.','Tarikh luput telah lepas.'):''),
     run:v=>{const x=prod(v.item),o={vendorId:v.vendor?Number(v.vendor):null,cost:v.cost===''||v.cost==null?null:Number(v.cost),expiry:v.expiry||null};
      return t?DB.receive(x,Number(v.qty),o):DB.requestStockIn(x,Number(v.qty),o)}});
   }else if(k==='count'&&mgr){
    fmPanel({state:L('Stock count','Kiraan stok'),title:L('Count your stock','Kira stok anda'),body:L('Fill in only the items you counted. The difference is recorded.','Isi item yang dikira sahaja. Perbezaan direkod.'),
     cta:L('Save count','Simpan kiraan'),done:L('Stock count saved','Kiraan stok disimpan'),
     html:P.map(x=>FM('c-'+x.dbId,`${esc(pn(x))} (${L('system','sistem')}: ${fq(x.qty)} ${U(x.unit)})`,'number','')).join('')
      +FMS('why',L('Reason','Sebab'),[['stock count',L('Regular count','Kiraan biasa')],['damaged',L('Damaged or lost','Rosak atau hilang')],['found',L('Found extra','Jumpa lebihan')],['other',L('Other','Lain-lain')]]),
     check:v=>P.some(x=>v['c-'+x.dbId]!==''&&Number(v['c-'+x.dbId])>=0)?'':L('Enter at least one counted quantity.','Masukkan sekurang-kurangnya satu kuantiti.'),
     run:v=>P.filter(x=>v['c-'+x.dbId]!==''&&Number(v['c-'+x.dbId])>=0).reduce((pr,x)=>pr.then(()=>DB.adjust(x,Number(v['c-'+x.dbId]),v.why)),Promise.resolve())});
   }else if(k==='wexp'&&mgr){
    const e=S.expired||{n:0,value:0};if(!e.n)return;
    panel({state:L('Expired','Luput'),tone:'warn',title:L(`Write off ${e.n} expired batch${e.n>1?'es':''}?`,`Tulis-off ${e.n} kelompok luput?`),
     body:(canFin()?L(`Worth about ${rm0(e.value)}. `,`Bernilai kira-kira ${rm0(e.value)}. `):'')+L('The loss is recorded as waste.','Kerugian direkod sebagai sisa.'),persist:true,
     actions:[{label:L('Cancel','Batal'),fn:hidePanel},{label:L('Write off','Tulis-off'),kind:'ok',fn:()=>ppDone(DB.writeOffExpired(),L('Expired stock written off','Stok luput ditulis-off'))}]});
   }else if(k==='editprod'&&mgr){
    const p=prod(arg);if(!p)return;
    fmPanel({state:L('Edit item','Edit item'),title:pn(p),cta:L('Save','Simpan'),done:L('Item updated','Item dikemas kini'),
     html:FM('name',L('Item name','Nama item'),'text','',p.name)+FMS('unit',L('Unit','Unit'),[['kg','kg'],['g','g'],['pcs',L('pieces','biji')]],p.unit==='biji'?'pcs':'kg')
      +FM('reorder',L('Reorder level','Paras susun semula'),'number','',String(p.reorder))+FM('shelf',L('Shelf life (days)','Hayat simpanan (hari)'),'number','',p.shelf?String(p.shelf):''),
     check:v=>v.name?'':L('Enter the item name.','Masukkan nama item.'),run:v=>DB.updateProduct(p.dbId,v)});
   }else if(k==='editsup'&&mgr){
    const v0=(S.vendors||[]).find(x=>String(x.id)===arg);if(!v0)return;
    fmPanel({state:L('Edit supplier','Edit pembekal'),title:v0.name,cta:L('Save','Simpan'),done:L('Supplier updated','Pembekal dikemas kini'),
     html:FM('name',L('Supplier name','Nama pembekal'),'text','',v0.name)+FM('contact',L('Contact person','Orang untuk dihubungi'),'text','',v0.contact)+FM('phone',L('Phone','Telefon'),'tel','',v0.phone)+FM('lead',L('Delivery time (days)','Masa penghantaran (hari)'),'number','',String(v0.lead)),
     check:v=>v.name?'':L('Enter the supplier name.','Masukkan nama pembekal.'),run:v=>DB.updateVendor(v0.id,v)});
   }else if(k==='recvpo'&&mgr){
    ppDone(DB.receivePO(Number(arg)),L('Order received. Stock updated.','Order diterima. Stok dikemas kini.'));
   }else if(k==='cancelpo'&&mgr){
    panel({state:L('Cancel','Batal'),tone:'warn',title:L('Cancel this order?','Batalkan order ini?'),persist:true,
     actions:[{label:L('Keep','Kekal'),fn:hidePanel},{label:L('Cancel order','Batal order'),kind:'ok',fn:()=>ppDone(DB.cancelPO(Number(arg)),L('Order cancelled','Order dibatalkan'))}]});
   }
  }
  track(document,'click',e=>{const b=e.target.closest('[data-pp]');if(b)ppAct(b.dataset.pp)});
  const costToday=()=>S.daily?series('cost',1)[0]:P.reduce((a,p)=>a+(S.use[p.id]||0)*p.cost,0);
  const costAvg=()=>S.series.length?S.series.reduce((a,b)=>a+b,0)/S.series.length:0;
  const stockValue=()=>P.reduce((a,p)=>a+p.qty*p.cost,0);
  const pending=()=>S.requests.filter(r=>r.status==='pending');
  /* Roles: owner (Intelligence layer: finance, rules, everything), admin (Operational layer: runs the day, finance only if the owner allows), staff (records stock). Client-side only; real enforcement is Supabase RLS. */
  const isOwner=()=>S.role==='owner';
  const isMgr=()=>S.role==='owner'||S.role==='admin';
  const canFin=()=>S.role==='owner'||(S.role==='admin'&&!!S.rules.adminFinance);
  const ALLOW={owner:['home','analytics','stock','cost','fresh','ops','people','rules'],admin:['home','stock','fresh','ops','people'],staff:['home','stock','fresh']};
  const allowed=sc=>(ALLOW[S.role]||[]).includes(sc)||(sc==='cost'&&canFin());
  const who=()=>S.me?S.me.name:'';
  const roleName=r=>r==='owner'?L('Owner','Pemilik'):r==='admin'?'Admin':L('Staff','Staf');
  /* days of stock left: the forecast (day by day, weekday-aware) once there is usage history, else balance / average use */
  const runDays=p=>p.fc&&p.fc.method!=='rules'?(p.fc.days==null?31:p.fc.days):p.qty/p.avg;
  const eta=p=>{const d=runDays(p),h=d*24;return d>30?L('over 30 days','lebih 30 hari'):h<1?L('under 1 hour','kurang 1 jam'):h<36?Math.round(h)+L(' hours',' jam'):(h/24).toFixed(1)+L(' days',' hari')};
  /* what the forecast is based on, shown next to every prediction so people know how much to trust it */
  const aiTag=p=>{const f=p.fc;if(!f)return '';
   if(f.method==='rules')return L('AI learning: no usage yet, using your reorder level','AI belajar: belum ada penggunaan, guna paras susun semula anda');
   if(f.dataDays<14)return L(`AI learning: ${f.dataDays} of 14 days of usage`,`AI belajar: ${f.dataDays} daripada 14 hari penggunaan`);
   return L(`AI forecast: weekday pattern, ${Math.round(f.conf*100)}% confident`,`Ramalan AI: corak hari minggu, yakin ${Math.round(f.conf*100)}%`)};
  const suggest=p=>p.fc&&p.fc.need&&p.fc.qty>0?p.fc.qty:Math.max(10,Math.round((p.avg*2.5-p.qty)/10)*10);
  /* voice hints use the company's own first two items ({a}, {b}); generic wording when there are none yet */
  const EX={
   ms:{admin:['Buka stok produk','Tunjuk stok rendah','Kenapa kos naik?','Bila {a} habis?','Order 20 kilo {a}','Lulus'],
       staff:['{a} dah guna 2 kilo','Terima 10 kilo {b}','Buang 1 kilo {b}','Buka stok']},
   en:{admin:['Open product stock','Show low stock','Why did costs rise?','When will {a} run out?','Order 20 kg {a}','Approve'],
       staff:['We used 2 kg {a}','Receive 10 kg {b}','Waste 1 kg {b}','Open stock']}
  };
  EX.ms.owner=EX.ms.admin;EX.en.owner=EX.en.admin;
  const liveHint=x=>{const a=P[0]?pn(P[0]).toLowerCase():L('stock','stok'),b=P[1]?pn(P[1]).toLowerCase():a;return x.replace(/\{a\}/g,a).replace(/\{b\}/g,b)};
  const examples=()=>EX[S.lang][S.role].filter(x=>canFin()||!/kos|cost/i.test(x)).map(liveHint);

  /* ---- scenes ---- */
  const greet=()=>{const h=new Date().getHours();return h<11?L('Good morning','Selamat pagi'):h<15?L('Good afternoon','Selamat tengah hari'):h<19?L('Good evening','Selamat petang'):L('Good evening','Selamat malam')};
  const sh=(t,m)=>`<div class="sh"><h1 class="h1">${t}</h1><p class="meta">${m}</p></div>`;
  const sayHint=t=>`<span class="say">${L('or say','atau sebut')} <q>${esc(t)}</q></span>`;
  const orderSay=p=>`Order ${suggest(p)} ${uw(p.unit)} ${pn(p).toLowerCase()}`;
  const reqTitle=r=>{const p=prod(r.item),a=`${fq(r.qty)} ${U(p.unit)} ${pn(p)}`;return r.kind==='order'?`Order ${a}`:r.kind==='stockin'?L(`Receive ${a}`,`Terima ${a}`):L(`Write off ${a}`,`Tulis-off ${a}`)};
  const reqReason=r=>{const p=prod(r.item);return r.rkey==='in'?L('Staff delivery','Penghantaran staf'):r.rkey==='ai'?(p.fc&&runDays(p)>(p.fc.lead||3)+2?(p.fc.atRisk>0.05?L('Forecast: part of the stock will spoil','Ramalan: sebahagian stok akan rosak'):L('Forecast: stock getting low','Ramalan: stok semakin rendah')):L('Forecast: runs out in ','Ramalan: habis dalam ')+eta(p)):r.rkey==='exp'?L('Expired','Luput'):r.rkey==='rep'?L('Reported spoiled','Dilapor rosak'):L('Runs out in ','Habis dalam ')+eta(p)};
  const byName=b=>b==='staff'?L('Staff','Staf'):b;

  const SCENES={};const missingScene=()=>`<div class="sh"><h1 class="h1">${L("Not available yet","Belum tersedia")}</h1><p class="meta">${L("This page has not been merged into the project yet.","Page ini belum digabungkan ke dalam projek.")}</p></div>`;

  /* ---- shell: render, panel, dock ---- */
  const stage=$('#stage'), panelEl=$('#panel'), cmdEl=$('#cmd');
  let acts=[], panelTimer, hintTimer, hintI=0, typing=null;

  /* a brand-new company has no data yet: show a short setup checklist instead of empty charts */
  const EMPTY_OK=['home','analytics','stock','cost','fresh'];
  function emptyScene(){
   const mgr=isMgr(),own=isOwner();
   const st=(n,t,d,act)=>`<div class="rcard"><b>${n}. ${t}</b><p class="meta">${d}</p>${act&&mgr?`<div class="row"><button class="btn primary" data-pp="${act}">${t}</button></div>`:''}</div>`;
   return `${sh(L('Welcome','Selamat datang'),S.me&&S.me.company?esc(S.me.company):'')}
    <p class="meta">${mgr?L('Your company has no items yet. Set it up in a few steps.','Syarikat anda belum ada item. Sediakan dalam beberapa langkah.'):L('No items yet. Ask your admin to set up the stock list.','Belum ada item. Minta admin sediakan senarai stok.')}</p>
    ${mgr?st(1,L('Add a supplier','Tambah pembekal'),L('Who you buy from, and how many days delivery takes.','Daripada siapa anda beli, dan berapa hari penghantaran.'),'addsup')
     +st(2,L('Add an item','Tambah item'),L('Name, unit, reorder level and shelf life.','Nama, unit, paras susun semula dan hayat simpanan.'),'addprod')
     +st(3,L('Invite your team','Jemput pasukan'),L('Create a code for admin or staff to join.','Cipta kod untuk admin atau staf menyertai.'),'invite')
     +(own?`<div class="rcard"><b>${L('Just exploring?','Sekadar mencuba?')}</b><p class="meta">${L('Load a sample fruit shop (10 items, 3 suppliers, 14 days of usage). You can reset it later in Rules.','Muat kedai buah contoh (10 item, 3 pembekal, 14 hari penggunaan). Boleh reset kemudian di Rules.')}</p><div class="row"><button class="btn" data-pp="seed">${L('Load sample data','Muat data contoh')}</button></div></div>`:''):''}`;
  }
  function render(bloom){
   stage.innerHTML=(S.live&&!P.length&&EMPTY_OK.includes(S.scene)?emptyScene:SCENES[S.scene]||missingScene)();
   if(bloom){stage.classList.remove('bloom');void stage.offsetWidth;stage.classList.add('bloom');stage.scrollTop=0}
   if(S.scene==='ops')bindOps();
   if(S.scene==='home'&&S.role!=='staff'){if(bloom)S.pl.shown=0;plCount()}
   renderPetals();
  }

  /* ---- Business Pulse (home for owner and admin): patch the page in place so tiles, gauge and bars animate ---- */
  let plRaf=0,plTm=0,plTt=0;
  function morph(a,b){
   if(a.nodeType!==b.nodeType||a.nodeName!==b.nodeName){a.replaceWith(b.cloneNode(true));return}
   if(a.nodeType===3){if(a.nodeValue!==b.nodeValue)a.nodeValue=b.nodeValue;return}
   if(a.nodeType!==1)return;
   [...a.attributes].forEach(t=>{if(!b.hasAttribute(t.name))a.removeAttribute(t.name)});
   [...b.attributes].forEach(t=>{if(a.getAttribute(t.name)!==t.value)a.setAttribute(t.name,t.value)});
   if(a.id==='pl-day'){a.value=b.getAttribute('value');return}
   const ac=[...a.childNodes],bc=[...b.childNodes];
   bc.forEach((n,i)=>ac[i]?morph(ac[i],n):a.appendChild(n.cloneNode(true)));
   ac.slice(bc.length).forEach(n=>n.remove());
  }
  function plPatch(){
   const root=stage.querySelector('.pl');if(!root||!SCENES[S.scene])return;
   const t=document.createElement('div');t.innerHTML=SCENES[S.scene]();const nr=t.querySelector('.pl');
   if(nr){morph(root,nr);plCount()}
  }
  function plCount(){
   const el=stage.querySelector('.pl-score');if(!el)return;
   const to=+el.dataset.to,from=S.pl.shown;if(from===to){el.textContent=to;return}
   cancelAnimationFrame(plRaf);const t0=performance.now();
   const step=now=>{const k=Math.min(1,(now-t0)/800),v=Math.round(from+(to-from)*(1-Math.pow(1-k,3))),e=stage.querySelector('.pl-score');S.pl.shown=v;if(e)e.textContent=v;if(k<1)plRaf=requestAnimationFrame(step)};
   plRaf=requestAnimationFrame(step);
  }
  function plToast(msg){S.pl.toast=msg;clearTimeout(plTt);plTt=setTimeout(()=>{S.pl.toast='';plPatch()},2600)}
  function pulseOrder(id){const p=prod(id);if(!p||S.orders.some(o=>o.item===id&&!o.done))return false;newPO({item:id,qty:suggest(p)});log(orderSay(p),L('Order','Order'),L('Done','Dilaksana'));return true}
  function pulseUse(id){const p=prod(id);if(!p||S.pl.used[id])return false;S.pl.used[id]=true;S.tasks.unshift({id:'use-'+id,en:`Use ${p.en||p.name} first`,ms:`Guna ${p.name} dahulu`,done:false,key:'use:'+id});log(`Use ${p.en||p.name} first`,L('Use first','Guna dahulu'),L('Done','Dilaksana'));return true}
  function plAct(k,id,el){
   const PL=S.pl;
   if(k==='sel')PL.sel=id;
   else if(k==='filter')PL.filter=PL.filter===id?null:id;
   else if(k==='order'){if(pulseOrder(id))plToast(L(`${pn(prod(id))} ordered`,`${pn(prod(id))} diorder`))}
   else if(k==='use'){if(pulseUse(id))plToast(L(`${pn(prod(id))} marked to use first`,`${pn(prod(id))} ditanda guna dahulu`))}
   else if(k==='fix'){const o=(el.dataset.order||'').split(',').filter(Boolean),u=(el.dataset.use||'').split(',').filter(Boolean);o.forEach(pulseOrder);u.forEach(pulseUse);if(o.length+u.length)plToast(L('Everything handled','Semua telah diurus'))}
   else if(k==='play'){
    clearInterval(plTm);
    if(PL.playing){PL.playing=false}
    else{PL.playing=true;if(PL.day>=7)PL.day=0;plTm=setInterval(()=>{const nd=Math.round((S.pl.day+.1)*10)/10;if(nd>7||!stage.querySelector('.pl')){clearInterval(plTm);S.pl.playing=false}else S.pl.day=nd;plPatch()},110)}
   }
   else if(k==='reset'){clearInterval(plTm);Object.assign(PL,{day:0,used:{},filter:null,playing:false,sel:P[0]?P[0].id:null,toast:''})}
   plPatch();
  }
  function go(scene){
   if(!allowed(scene))return deny();
   S.scene=scene;closeMenu();render(true);if(opts.onNavigate)opts.onNavigate(scene);
  }
  function deny(){
   panel({state:L('No access','Tiada akses'),tone:'bad',title:(S.role==='staff'?L('This screen is for admins only.','Skrin ini untuk admin sahaja.'):L('This screen needs the owner or a finance permission.','Skrin ini perlukan pemilik atau kebenaran kewangan.')),chips:[{label:L('Open stock','Buka stok'),say:L('Open stock','Buka stok')}],ttl:5000});
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
  const NAVALL=[['home','Home','Utama','home'],['analytics','Analytics','Analitik','trend'],['stock','Stock','Stok','box'],['cost','Cost','Kos','coin'],['fresh','Fresh','Segar','leaf'],['ops','Approve','Lulus','check'],['people','People','Orang','users'],['rules','Rules','Tetapan','sliders']];
  const navList=()=>NAVALL.filter(n=>allowed(n[0]));

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
   const rows=S.audit.length?S.audit.slice(0,8).map(a=>`<div><time>${hhmm(a.t)}</time><span><b>${esc(a.text)}</b><br><span class="say" style="margin:0">${roleName(a.who)} · ${esc(a.intent)}</span></span><span class="pill ${cls(a.status)}">${esc(a.status)}</span></div>`).join(''):`<p class="p-body">${L('No commands yet. Every voice command is recorded here.','Belum ada arahan. Setiap arahan suara akan direkod di sini.')}</p>`;
   panel({state:L('Command trail','Jejak arahan'),title:L('Who said what, and what happened','Siapa cakap apa, dan apa jadi'),html:`<div class="log">${rows}</div>`,persist:true});
  }

  /* ---- language: parse Malay + English, always both ---- */
  const norm=t=>t.toLowerCase().replace(/[.,!?'"“”]/g,' ').replace(/\s+/g,' ').trim();
  const FSYN=[['apple','epal'],['orange','oren'],['banana','pisang'],['watermelon','tembikai'],['papaya','betik'],['mango','mangga'],['grapes','anggur'],['grape','anggur'],['strawberry','strawberi'],['strawberries','strawberi'],['pineapple','nanas'],['guava','jambu']];
  const findItem=t=>{
   for(const [w,key] of FSYN)if(new RegExp('\\b'+w+'\\b').test(t)){const p=P.find(x=>norm(x.name).split(' ').includes(key));if(p)return p.id}
   for(const p of P){const e=p.en?norm(p.en).split(' ')[0]:'';if(e.length>2&&new RegExp('\\b'+e+'\\b').test(t))return p.id}
   for(const p of P){const w=norm(p.name).split(' ')[0];if(w.length>2&&new RegExp('\\b'+w+'\\b').test(t))return p.id}
   return null};
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
  const NAVR=[['analytics',/\b(analytics|analitik|analisis|analysis|trend|graf|chart|ramalan|forecast)\b/],['home',/\b(utama|home|dashboard|balik|mula)\b/],['stock',/\b(stok|stock|produk|product|inventori|inventory|barang)\b/],['cost',/\b(kos|cost|kewangan|belanja)\b/],
   ['fresh',/\b(segar|fresh|freshness|kesegaran|imbas|scan|sisa|waste)\b/],['ops',/\b(lulus|kelulusan|approve|approval|approvals|tindakan|operasi|operations)\b/],['rules',/\b(rules|automation|settings|tetapan|automasi|peraturan)\b/],['people',/\b(pasukan|team|staf|staff|pembekal|supplier|suppliers|orang|people)\b/]];
  const navName=id=>{const n=NAVALL.find(x=>x[0]===id);return n?L(n[1],n[2]).toLowerCase():id};
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
    const ok=!/\b(tolak|reject|decline)\b/.test(t);log(text,ok?L('Approve','Lulus'):L('Reject','Tolak'),isMgr()?L('Done','Dilaksana'):L('Not allowed','Tidak dibenarkan'));return decide(ok,text);
   }
   // questions
   if(/\b(nilai|worth|value)\b/.test(t)&&/\b(stok|stock|inventori|inventory)\b/.test(t)){
    log(text,L('Stock value question','Soalan nilai stok'),L('Answered','Dijawab'));
    if(!canFin())return deny();
    return panel({state:L('Answer','Jawapan'),said:text,title:L('Stock value right now','Nilai stok sekarang'),big:rm0(stockValue()),facts:[[L('items','item'),String(P.length)],[L('method','kaedah'),L('balance × unit cost','baki × kos seunit')]],chips:[{label:L('Open stock','Buka stok'),say:L('Open stock','Buka stok')}]});
   }
   if(/\b(kenapa|mengapa|why)\b/.test(t)&&/\b(kos|cost|costs)\b/.test(t)){
    log(text,L('Cost question','Soalan kos'),L('Answered','Dijawab'));if(!canFin())return deny();
    const dr=P.map(p=>({p,x:((S.use[p.id]||0)-p.avg)*p.cost})).sort((a,b)=>b.x-a.x)[0], pct=costAvg()>0?Math.round((costToday()/costAvg()-1)*100):0;
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
     if(!allowed(sc)){log(text,L('Open ','Buka ')+navName(sc),L('Not allowed','Tidak dibenarkan'));return deny()}
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
   const facts=d.type==='order'?[[L('estimate','anggaran'),rm(amt)],[L('supplier','pembekal'),p.sup]]:[[L('new balance','baki baru'),`${fq(d.type==='receive'?p.qty+q:p.qty-q)} ${U(p.unit)}`],...(canFin()?[[L('cost','kos'),rm(amt)]]:[])];
   panel({state:lvl||L('Confirm','Sahkan'),tone:lvl?'warn':'',said:d.said,title:VERB()[d.type]+' '+pn(p).toLowerCase(),big:`${sign}${fq(q)} ${U(p.unit)}`,facts,
    actions:[{label:L('Redo','Ulang'),fn:()=>{S.draft=null;hidePanel()}},{label:d.type==='order'&&S.role==='staff'?L('Send to admin','Hantar kepada admin'):L('Confirm','Betul'),kind:'ok',fn:commit}],bigBtn:true,persist:true,html:`<span class="say" style="margin-top:12px">${L('or say','atau sebut')} <q>${L('confirm','betul')}</q></span>`});
  }
  function tick(key){const t=S.tasks.find(x=>x.key===key&&!x.done);if(t)t.done=true}
  function commit(){
   const d=S.draft;if(!d)return;S.draft=null;const p=prod(d.item),q=d.qty,amt=q*p.cost,before=p.qty,n=pn(p).toLowerCase();
   if(d.type==='usage'){
    p.qty=r2(p.qty-q);S.use[p.id]+=q;tick('usage:'+p.id);addMove(p,'usage',q);dbw(()=>DB.usage(p,q));
    const crossed=before>p.reorder&&p.qty<=p.reorder&&S.rules.lowAlert;
    if(crossed)notify('bad',L('Low stock: '+pn(p),'Stok rendah: '+pn(p)),L(`${fq(p.qty)} ${U(p.unit)} left. Alert sent to admin.`,`Baki ${fq(p.qty)} ${U(p.unit)}. Amaran dihantar kepada admin.`));
    S.pulse=p.id;refresh();
    panel({state:L('Recorded','Direkod'),tone:'ok',title:L(`${pn(p)}: ${fq(p.qty)} ${U(p.unit)} left`,`${pn(p)}: baki ${fq(p.qty)} ${U(p.unit)}`),body:canFin()?L(`Cost today ${rm(costToday())}.`,`Kos hari ini ${rm(costToday())}.`):L('Thanks. Cost is calculated automatically.','Terima kasih. Kos dikira automatik.'),
     html:crossed?`<div class="row"><span class="pill bad">${ic('alert',13)}${L('Low-stock alert sent to admin','Amaran stok rendah dihantar kepada admin')}</span></div>`:'',chips:crossed&&isMgr()?[{label:`Order ${suggest(p)} ${U(p.unit)}`,say:orderSay(p)}]:[],ttl:10000});
   }else if(d.type==='receive'){
    if(S.live&&!isMgr()){dbw(()=>DB.requestStockIn(p,q));panel({state:L('Awaiting approval','Menunggu kelulusan'),tone:'warn',title:L('Sent to admin.','Dihantar kepada admin.'),body:L(`${fq(q)} ${U(p.unit)} ${pn(p).toLowerCase()} is added after an admin approves.`,`${fq(q)} ${U(p.unit)} ${pn(p).toLowerCase()} ditambah selepas admin lulus.`),ttl:7000});return}
    if(S.live)dbw(()=>DB.receive(p,q));
    p.qty=r2(p.qty+q);tick('receive:'+p.id);addMove(p,'receive',q);receivePO(p);S.pulse=p.id;refresh();
    panel({state:L('Recorded','Direkod'),tone:'ok',title:L(`${pn(p)}: ${fq(p.qty)} ${U(p.unit)} now`,`${pn(p)}: baki ${fq(p.qty)} ${U(p.unit)}`),body:L('New batch added with an expiry date.','Kelompok baru ditambah dengan tarikh luput.'),ttl:7000});
   }else if(d.type==='waste'){
    if(amt>S.rules.limit){if(S.live)dbw(()=>DB.requestWaste(p,q));else addReq({kind:'writeoff',item:p.id,qty:q,amount:amt,by:isMgr()?who():'staff',rkey:'rep'});
     panel({state:L('Awaiting approval','Menunggu kelulusan'),tone:'warn',title:L('Sent to admin.','Dihantar kepada admin.'),body:L(`${rm(amt)} is above the automatic write-off limit.`,`${rm(amt)} melebihi had tulis-off automatik.`),ttl:7000})}
    else{p.qty=r2(p.qty-q);addMove(p,'waste',q);dbw(()=>DB.waste(p,q));S.waste.push({n:pn(p),amt});S.pulse=p.id;refresh();panel({state:L('Recorded','Direkod'),tone:'ok',title:L(`Waste logged: ${fq(q)} ${U(p.unit)} ${n}.`,`Sisa ${fq(q)} ${U(p.unit)} ${n} direkod.`),body:L(`Waste cost ${rm(amt)}.`,`Kos sisa ${rm(amt)}.`),ttl:7000})}
   }else if(d.type==='order'){
    const dup=pending().find(r=>r.kind==='order'&&r.item===p.id);
    if(!dup){if(S.live)dbw(()=>DB.requestPO(p,q));else addReq({kind:'order',item:p.id,qty:q,amount:amt,supplier:p.sup,by:isMgr()?who():'staff',rkey:'low'})}
    if(isMgr()){go('ops');setTimeout(()=>panel({state:dup?L('Already waiting','Sudah menunggu'):L('Awaiting approval','Menunggu kelulusan'),tone:'warn',title:L(`The ${n} order is on the top card.`,`Order ${n} ada di kad atas.`),ttl:5000}),900)}
    else panel({state:L('Sent','Dihantar'),tone:'ok',title:L('Order suggestion sent to admin.','Cadangan order dihantar kepada admin.'),ttl:6000});
   }
  }
  function addReq(r){r.id=S.rid++;r.status='pending';S.requests.unshift(r);refresh()}
  function refresh(){render(false);if(S.drawer)drawDrawer()}

  function decide(ok,said){
   if(!isMgr())return panel({state:L('No access','Tiada akses'),tone:'bad',title:L('Only admins can approve.','Hanya admin boleh meluluskan.'),ttl:4000});
   const r=pending()[0];
   if(!r)return panel({state:L('None','Tiada'),title:L('Nothing is waiting for approval.','Tiada kelulusan menunggu.'),ttl:3000});
   if(S.live){
    const q=r.db;if(!q)return;
    (q.t==='stockin'?DB.reviewStockIn(q.id,ok,ok?null:'Rejected'):DB.decideApproval(q.id,ok,ok?null:'Rejected')).then(rehydrate).then(()=>{
     S.scene==='ops'?refresh():go('ops');
     panel({state:ok?L('Approved','Dilulus'):L('Rejected','Ditolak'),tone:ok?'ok':'bad',said,
      title:ok?(r.kind==='order'?L(`Order sent to ${r.supplier}.`,`Order dihantar kepada ${r.supplier}.`):r.kind==='stockin'?L('Stock received and batch recorded.','Stok diterima dan kelompok direkod.'):L('Stock written off and waste cost calculated.','Stok ditulis-off dan kos sisa dikira.')):L('Request rejected and recorded.','Permintaan ditolak dan direkod.'),
      body:L('The action is in the audit trail.','Tindakan masuk jejak audit.'),ttl:6000})
    }).catch(e=>notify('bad',L('Not saved','Tidak disimpan'),String(e&&e.message||e)));
    return;
   }
   r.status=ok?'approved':'rejected';
   if(ok&&r.kind==='order')newPO(r);
   if(ok&&r.kind==='writeoff'){const p=prod(r.item);dbw(()=>DB.waste(p,r.qty));p.qty=r2(Math.max(0,p.qty-r.qty));S.waste.push({n:pn(p),amt:r.amount})}
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

  /* freshness scan (placeholder until the YOLOv4 service is connected) */
  function scan(){
   panel({state:L('Coming soon','Akan datang'),tone:'warn',title:L('Freshness model not connected yet.','Model kesegaran belum disambung.'),body:L('The YOLOv4 service will be plugged in here.','Perkhidmatan YOLOv4 akan disambung di sini.')});
  }

  /* detail sheet for a jar */

  function speakBrief(){
   const low=P.filter(p=>p.qty<=p.reorder);
   const txt=L(`${greet()}, ${who()}. ${low.length?low.map(p=>`${pn(p)} is almost out, about ${eta(p)} left.`).join(' '):'Stock levels are healthy.'} Cost today is ${Math.round(costToday())} ringgit.`,
    `${greet()}, ${who()}. ${low.length?low.map(p=>`${pn(p)} hampir habis, cukup ${eta(p)}.`).join(' '):'Stok semua baik.'} Kos hari ini ${Math.round(costToday())} ringgit.`);
   try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(txt);u.lang=S.lang==='ms'?'ms-MY':'en-US';speechSynthesis.speak(u)}catch(e){}
   panel({state:L('Daily briefing','Ringkasan harian'),title:txt,ttl:12000});
  }

  /* ---- language, events ---- */
  function applyStatic(){
   document.documentElement.lang=S.lang==='ms'?'ms':'en';
   $('#t-log').innerHTML=ic('clock',16)+`<span class="lbl">${L('Trail','Jejak')}</span>`;
   $('#t-log').setAttribute('aria-label',L('Command trail','Jejak arahan'));
   $('#t-lang').innerHTML=ic('mic',16)+`<span>${S.lang==='ms'?'BM':'EN'}</span>`;
   $('#t-lang').title=L('Language for screen and microphone','Bahasa skrin dan mikrofon');
   $('#brand').setAttribute('aria-label',L('Home','Utama'));
   $('#orb').setAttribute('aria-label',L('Speak','Cakap'));$('#b-menu').setAttribute('aria-label','Menu');$('#b-type').setAttribute('aria-label',L('Type a command','Taip arahan'));
   $('#cmd-input').placeholder=L('e.g. open product stock','cth: buka stok produk');
   $('#cmd-input').setAttribute('aria-label',L('Command','Arahan'));
   $('#cmd button[type=submit]').textContent=L('Send','Hantar');
  }
  function setLang(l){
   if(S.lang===l)return;S.lang=l;S.draft=null;try{rec&&rec.abort()}catch(e){}
   applyStatic();hidePanel();closeCmd();render(false);startHints();
  }
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
  $('#t-lang').onclick=()=>setLang(S.lang==='ms'?'en':'ms');
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
   if(S.live){const ids=S.notes.filter(n=>n.aid&&!n.read).map(n=>n.aid);if(ids.length)DB.ackAlerts(ids).catch(()=>{})}
   S.notes.forEach(n=>n.read=true);updateBell();
   const rows=S.notes.length?S.notes.slice(0,8).map(n=>`<div><i class="${n.tone}"></i><span><b>${esc(n.title)}</b>${esc(n.body)}</span><time>${hhmm(n.t)}</time></div>`).join(''):`<p class="p-body">${L('Nothing yet. SmartStock will alert you about low stock, expiry and orders.','Belum ada. SmartStock akan beri amaran stok rendah, luput dan order.')}</p>`;
   panel({state:L('Notifications','Notifikasi'),title:L('What needs your attention','Apa yang perlukan perhatian'),html:`<div class="nl">${rows}</div>`,persist:true});
  }
  $('#t-bell').onclick=showNotes;

  /* tooltip (charts, sparkline) */
  const tip=$('#tip');
  let tipT;
  const moveTip=e=>{
   const t=e.target.closest&&e.target.closest('[data-tip]');
   if(!t){tip.classList.remove('on');return}
   tip.textContent=t.dataset.tip;tip.classList.add('on');
   tip.style.left=Math.max(8,Math.min(innerWidth-tip.offsetWidth-8,e.clientX+12))+'px';tip.style.top=Math.max(8,e.clientY-38)+'px';
  };
  track(document,'pointermove',moveTip);
  /* analytics chart: crosshair and readout follow the pointer (mouse or finger) without redrawing */
  const anScrub=e=>{
   const svg=e.target.closest&&e.target.closest('#stage .an-main');if(!svg)return;
   const d=svg.dataset,W=+d.w,pl=+d.pl,cw=+d.cw,pt=+d.pt,ph=+d.ph,mx=+d.max,n=+d.n,m=d.m;
   const vals=d.vals.split(',').map(Number),prev=d.prev?d.prev.split(',').map(Number):null,labs=d.labs.split('|');
   const r=svg.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*W;
   const i=clamp(Math.round((x-pl)/cw*(vals.length-1)),0,vals.length-1),px=pl+i*cw/(vals.length-1),py=pt+(1-vals[i]/mx)*ph;
   const cx=svg.querySelector('.an-cx'),cd=svg.querySelector('.an-cd');cx.setAttribute('x1',px);cx.setAttribute('x2',px);cx.setAttribute('opacity',.5);cd.setAttribute('cx',px);cd.setAttribute('cy',py);cd.setAttribute('opacity',1);
   const f=v=>m==='usage'?Math.round(v)+' '+L('units','unit'):rm0(v),fc=i>=n,avg=vals.slice(0,n).reduce((a,b)=>a+b,0)/n,dv=Math.round((vals[i]/avg-1)*100);
   $('#an-read').innerHTML=`<b>${f(vals[i])}</b><span>${labs[i]}${fc?' · '+L('forecast, an estimate','ramalan, anggaran'):''}</span><span class="pill ${dv>10?'warn':''}">${dv>=0?'+':''}${dv}% ${L('vs average','dari purata')}</span>${prev&&i<n?`<span class="pill">${L('previous','sebelum')} ${f(prev[i])}</span>`:''}`;
  };
  track(document,'input',e=>{const r=e.target.closest&&e.target.closest('#pl-day');if(r){clearInterval(plTm);S.pl.playing=false;S.pl.day=+r.value;plPatch()}});
  track(document,'pointermove',anScrub);track(document,'pointerdown',anScrub);
  track(document,'pointerdown',e=>{if(e.pointerType!=='touch')return;moveTip(e);clearTimeout(tipT);tipT=setTimeout(()=>tip.classList.remove('on'),2600)}); // no hover on a phone, so a tap shows it

  /* movements, history, batches (deterministic sample data) */
  function addMove(p,type,q){S.moves.unshift({p:p.id,type,q,t:hhmm(new Date()),who:who()})}
  const hist=p=>series('usage',14,{cat:p.id});
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
   if(S.live){const q=prod(r.item);dbw(()=>DB.createPO(q,r.qty));notify('ok',L('Order placed','Order dibuat'),L(`${fq(r.qty)} ${U(q.unit)} ${pn(q).toLowerCase()} to ${r.supplier||q.sup}.`,`${fq(r.qty)} ${U(q.unit)} ${pn(q).toLowerCase()} kepada ${r.supplier||q.sup}.`));return}
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
    ${S.live?(!o.done&&isMgr()?`<div class="row"><button class="btn primary" data-pp="recvpo:${o.poId}">${L('Receive stock','Terima stok')}</button><button class="btn" data-pp="cancelpo:${o.poId}">${L('Cancel order','Batal order')}</button></div>`:''):o.step===3&&!o.done?`<div class="row"><button class="btn primary" data-say="${L('Receive','Terima')} ${fq(o.qty)} ${uw(p.unit)} ${pn(p).toLowerCase()}">${L('Receive stock','Terima stok')}</button></div>`:''}</div>`}).join('');
  }


  /* real daily numbers (database function daily_metrics): metric = cost | usage | waste | stock,
     n days ending today, shift = days further back (for the 'previous period' line), cat = one product id */
  function series(metric,n,o={}){
   const dl=S.daily,today=dl?dl.today:new Date().toLocaleDateString('en-CA'),by={};
   for(const r of (dl?dl.rows:[])){if(o.cat&&r.p!==o.cat)continue;const a=by[r.d]||(by[r.d]={uq:0,uc:0,wc:0,nc:0});a.uq+=r.uq;a.uc+=r.uc;a.wc+=r.wc;a.nc+=r.nc}
   const shift=o.shift||0,val={};
   if(metric==='stock'){/* stock value at the end of each day, rolled back from the value now */
    let v=o.cat?(prod(o.cat)?prod(o.cat).qty*prod(o.cat).cost:0):stockValue();
    for(let k=0;k<n+shift+1;k++){const key=DB.addDays(today,-k);val[key]=v;v-=by[key]?by[key].nc:0}
   }
   const out=[];
   for(let i=n-1;i>=0;i--){const key=DB.addDays(today,-(i+shift)),a=by[key]||{uq:0,uc:0,wc:0};
    out.push(metric==='stock'?Math.max(0,val[key]):metric==='cost'?a.uc:metric==='usage'?a.uq:a.wc)}
   return out;
  }
  const seriesN=n=>series('cost',n);


  /* rules: these settings change how the system behaves */





  track(document,'click',e=>{
   let b;
   if(b=e.target.closest('#stage [data-range]')){S.range=+b.dataset.range;refresh()}
   if(b=e.target.closest('#stage [data-pl]')){plAct(b.dataset.pl,b.dataset.id,b)}
   if(b=e.target.closest('#stage [data-an-go]')){S.an.metric=b.dataset.anGo;go('analytics')}
   if(b=e.target.closest('#stage [data-an-metric]')){S.an.metric=b.dataset.anMetric;refresh()}
   if(b=e.target.closest('#stage [data-an-range]')){S.an.range=+b.dataset.anRange;refresh()}
   if(b=e.target.closest('#stage [data-an-toggle]')){const k=b.dataset.anToggle;S.an[k]=!S.an[k];refresh()}
   if(b=e.target.closest('#stage [data-an-cat]')){const c=b.dataset.anCat;S.an.cat=S.an.cat===c?null:c;refresh()}
   if(b=e.target.closest('#stage [data-rule]')){const k=b.dataset.rule;S.rules[k]=!S.rules[k];b.setAttribute('aria-checked',S.rules[k])}
  });
  track(document,'input',e=>{if(e.target.id==='limit'){S.rules.limit=+e.target.value;$('#limit-v').textContent='RM '+S.rules.limit}});

  /* login, account, chrome */

  function enter(role){
   S.role=role;S.scene='home';if(opts.onNavigate)opts.onNavigate('home');S.filter='all';S.draft=null;S.user=role;$('#login').hidden=true;
   render(true);startHints();applyChrome();clearLive();
  }
  track(document,'click',e=>{
   let b;
   if(b=e.target.closest('[data-enter]'))enter(b.dataset.enter);
   if(b=e.target.closest('[data-llang]'))setLang(S.lang==='ms'?'en':'ms');
  });
  $('#t-user').onclick=()=>{clearLive();closeDrawer();hidePanel();closeCmd();closeMenu();S.user=null;DB.signOut();clearData();renderLogin();$('#login').hidden=false;if(opts.onNavigate)opts.onNavigate('login')};
  function applyChrome(){
   $('#biz').textContent=S.me&&S.me.company?S.me.company:'SmartStock';
   $('#t-user').textContent=who()[0];$('#t-user').title=who()+' · '+roleName(S.role);
   $('#t-user').style.background=S.role==='owner'?'var(--accent)':S.role==='admin'?'#AF52DE':'var(--ok)';
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
   const h=hist(p),mx=Math.max(...h,.01)*1.15,W=420,H=90,bw=22,gap=(W-bw*14)/13;
   const bars=h.map((v,i)=>{const bh=v/mx*H,x=i*(bw+gap),d=i===13?L('Today','Hari ini'):dateStr(i-13);return `<rect x="${x}" y="${H-bh}" width="${bw}" height="${bh}" rx="7" fill="${i===13?'var(--accent)':'var(--accent-soft)'}" data-tip="${d}: ${fq(v)} ${U(p.unit)}"/>`}).join('');
   const ay=H-p.avg/mx*H;
   const bt=batches(p).map(b=>`<tr><td>${b.id}</td><td>${dateStr(b.rec)}</td><td><span class="pill ${b.exp<=3?'warn':''}">${dateStr(b.exp)}</span></td><td style="text-align:right">${fq(b.qty)} ${U(p.unit)}</td></tr>`).join('');
   const mv=S.moves.filter(x=>x.p===p.id).slice(0,5).map(x=>`<div><i class="${x.type==='receive'?'up':'dn'}">${ic(x.type==='receive'?'up':'down',15)}</i><span>${{usage:L('Used','Digunakan'),receive:L('Received','Diterima'),waste:L('Wasted','Dibuang')}[x.type]} ${fq(x.q)} ${U(p.unit)}<br><small>${esc(x.who)}</small></span><small>${esc(x.t)}</small></div>`).join('')||`<p class="p-body">${L('No movements yet.','Belum ada pergerakan.')}</p>`;
   const act=[{l:L(`Use 1 ${U(p.unit)}`,`Guna 1 ${U(p.unit)}`),s:`${L('Use','Guna')} 1 ${uw(p.unit)} ${n}`},{l:L(`Receive 10 ${U(p.unit)}`,`Terima 10 ${U(p.unit)}`),s:`${L('Receive','Terima')} 10 ${uw(p.unit)} ${n}`},...(S.role==='admin'?[{l:`Order ${suggest(p)} ${U(p.unit)}`,s:orderSay(p)}]:[])];
   $('#drawer').innerHTML=`<div class="dr-top"><div><span class="pill ${tone}">${low?L('Low stock','Stok rendah'):p.exp<=3?L('Expiring soon','Hampir luput'):L('Healthy','Baik')}</span><h2>${pn(p)}</h2></div><button class="p-x" data-dclose="1" aria-label="${L('Close','Tutup')}">${ic('x',16)}</button></div>
   <div class="dr-hero"><div class="dr-big"><b>${fq(p.qty)}</b><small>${U(p.unit)} ${L('of','daripada')} ${p.cap}</small></div><span class="lvbar lg ${tone}"><i style="--w:${clamp(p.qty/p.cap*100,3,100).toFixed(1)}%"></i><u style="left:${clamp(p.reorder/p.cap*100,0,100).toFixed(1)}%"></u></span>
    <div class="dr-leg">${m.slice(1).map(r=>`<div><b${r.crit?' style="color:var(--r-crit)"':''}>${r.val}</b>${r.label}</div>`).join('')}</div></div>
   <div class="facts" style="margin-top:16px"><div><b>${p.sup}</b><span>${L('supplier','pembekal')}</span></div>${canFin()?`<div><b>${rm(p.qty*p.cost)}</b><span>${L('value','nilai')}</span></div><div><b>${rm(p.cost)}/${U(p.unit)}</b><span>${L('unit cost','kos seunit')}</span></div>`:''}</div>
   <div class="dr-h">${L('Usage, last 14 days','Penggunaan, 14 hari lalu')}</div>
   <svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="${L('Usage chart','Carta penggunaan')}"><line x1="0" x2="${W}" y1="${ay}" y2="${ay}" stroke="var(--ink-2)" stroke-dasharray="3 5" opacity=".6"/>${bars}</svg>
   <div class="dr-h">${L('Batches','Kelompok')}</div><div class="tblwrap"><table class="tbl"><thead><tr><th>${L('Batch','Kelompok')}</th><th>${L('Received','Diterima')}</th><th>${L('Expires','Luput')}</th><th style="text-align:right">${L('Qty','Kuantiti')}</th></tr></thead><tbody>${bt}</tbody></table></div>
   <div class="dr-h">${L('Recent movements','Pergerakan terkini')}</div><div class="mv">${mv}</div>
   <div class="dr-h">${L('Say or tap','Sebut atau tekan')}</div><div class="p-chips" style="margin-top:0">${act.map(a=>`<button class="chip" data-dsay="${esc(a.s)}">${esc(a.l)}</button>`).join('')}</div>`;
  }

  /* dock (replaces the sidebar) with macOS-style magnification */
  const DKG={home:['#5AC8FA','#007AFF'],analytics:['#FF8AD8','#E5359B'],stock:['#FFB340','#FF7A00'],cost:['#4CD964','#1FAE4B'],fresh:['#5EE0D0','#14A7B8'],ops:['#FF6B5E','#E5243B'],people:['#C98BF5','#8B3FD1'],rules:['#A8A8B0','#6B6B73']};
  function renderPetals(){
   const di=$('#dockitems'),keep=di.scrollLeft;
   di.innerHTML=navList().map(([id,en,ms,icon])=>{const g=DKG[id],b=id==='ops'&&pending().length?`<u>${pending().length}</u>`:'';
    return `<button class="dk ${S.scene===id?'on':''}" data-nav="${id}" data-label="${L(en,ms)}" aria-label="${L(en,ms)}" style="background:linear-gradient(160deg,${g[0]},${g[1]})">${ic(icon,26)}${b}</button>`}).join('');
   di.scrollLeft=keep;
   const on=di.querySelector('.on');
   if(on&&di.scrollWidth>di.clientWidth){const dr=di.getBoundingClientRect(),or=on.getBoundingClientRect();if(or.left<dr.left+8||or.right>dr.right-8)di.scrollLeft+=or.left-dr.left-(dr.width-or.width)/2}
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
   if(el&&e.pointerType!=='touch'){const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    el.style.setProperty('--mx',(x*100).toFixed(0)+'%');el.style.setProperty('--my',(y*100).toFixed(0)+'%');
    if(el.classList.contains('rg')){el.style.setProperty('--ry',((x-.5)*16).toFixed(1)+'deg');el.style.setProperty('--rx',((.5-y)*16).toFixed(1)+'deg')}}
   const bn=$('#bn');if(bn){if(!bn.dataset.orig)bn.dataset.orig=bn.textContent;
    const rc=e.target.closest&&e.target.closest('.chart rect[data-tip]');const m=rc&&rc.dataset.tip.match(/RM [\d,]+/);bn.textContent=m?m[0]:bn.dataset.orig}
  });
  track(document,'pointerout',e=>{const el=e.target.closest&&e.target.closest('.rg');if(el&&!el.contains(e.relatedTarget)){el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg')}});
  track(document,'click',e=>{if(e.target.closest('button')){try{navigator.vibrate&&navigator.vibrate(6)}catch(x){}}},true);

  /* sign-in: one lock-screen style form. The role comes from the account that signs in (Supabase Auth). */
  function renderLogin(){
   if(S.authMode==='register'||S.authMode==='setup')return renderAuthAlt();
   const keep=$('#lg-user')?{u:$('#lg-user').value,p:$('#lg-pass').value,f:document.activeElement&&document.activeElement.id}:null;
   $('#login').innerHTML=`<form class="lg-card" id="lg-form" novalidate>
     <i class="lg-av"><svg width="44" height="44" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11" fill="none" stroke="#0A84FF" stroke-width="3" stroke-dasharray="52 100" stroke-linecap="round" transform="rotate(-90 14 14)"/><circle cx="14" cy="14" r="6" fill="none" stroke="#34C759" stroke-width="3" stroke-dasharray="26 100" stroke-linecap="round" transform="rotate(-90 14 14)"/></svg></i>
     <h2 class="lg-title">${L('Sign in to SmartStock','Log masuk ke SmartStock')}</h2>
     <p class="lg-sub">SmartStock Intelligence</p>
     <label class="lg-f"><span>${L('Username or email','Nama pengguna atau e-mel')}</span><input id="lg-user" name="username" autocomplete="username" enterkeyhint="next" autocapitalize="none" spellcheck="false"></label>
     <label class="lg-f"><span>${L('Password','Kata laluan')}</span><div class="lg-pw"><input id="lg-pass" name="password" type="password" autocomplete="current-password" enterkeyhint="go"><button type="button" class="lg-eye" data-lpw="1" aria-pressed="false">${L('Show','Tunjuk')}</button></div></label>
     <p class="lg-err" id="lg-err" role="alert"></p>
     <button class="lg-go" type="submit">${L('Sign in','Log masuk')}</button>
     ${DB.dataReady?`<button class="lg-link" type="button" data-auth="register">${L('New company? Create an account','Syarikat baru? Cipta akaun')}</button>`:`<p class="lg-err" role="alert">${L('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then rebuild.','Supabase belum dikonfigurasi. Tetapkan VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY, kemudian bina semula.')}</p>`}
     ${S.authMsg?`<p class="lg-hint" role="status">${esc(S.authMsg)}</p>`:''}
    </form>
    <div class="lg-foot"><button class="tbtn" data-llang="1">${ic('mic',16)}<span>${S.lang==='ms'?'Bahasa Melayu':'English'}</span></button></div>`;
   if(keep){$('#lg-user').value=keep.u;$('#lg-pass').value=keep.p}
   const f=keep&&keep.f&&$('#'+keep.f);
   if(f)f.focus({preventScroll:true});
   else if(!$('#login').hidden)setTimeout(()=>{const i=$('#lg-user');if(i)i.focus({preventScroll:true})},60);
  }
  track(document,'click',e=>{
   const b=e.target.closest('#login [data-lpw]');if(!b)return;
   const i=$('#lg-pass'),on=i.type==='password';i.type=on?'text':'password';b.setAttribute('aria-pressed',on);b.textContent=on?L('Hide','Sembunyi'):L('Show','Tunjuk');
  });
  track(document,'submit',e=>{
   const form=e.target;if(!form||form.id!=='lg-form')return;
   e.preventDefault();
   const u=$('#lg-user').value.trim().toLowerCase(),p=$('#lg-pass').value,err=$('#lg-err');
   const fail=msg=>{err.textContent=msg;form.classList.remove('shake');void form.offsetWidth;form.classList.add('shake');const i=$('#lg-pass');i.value='';i.focus()};
   if(!u||!p){fail(L('Enter your username and password.','Masukkan nama pengguna dan kata laluan.'));return}
   if(!DB.dataReady){fail(L('Supabase is not configured.','Supabase belum dikonfigurasi.'));return}
   err.textContent='';
   const btn=form.querySelector('.lg-go');btn.disabled=true;btn.textContent=L('Signing in…','Log masuk…');
   DB.signIn(u,p).then(()=>DB.loadAll()).then(d=>{applyData(d);enter(d.me.role);setTimeout(renderLogin,1000)})
    .catch(e=>{if(e&&e.code==='NO_COMPANY'){S.authMode='setup';S.setupTab='create';renderLogin();return}
     DB.signOut();const m=String(e&&e.message||'');btn.disabled=false;btn.textContent=L('Sign in','Log masuk');
     fail(/no company/i.test(m)?L('This account has no company yet.','Akaun ini belum ada syarikat.'):/invalid login/i.test(m)?L('Wrong username or password.','Nama pengguna atau kata laluan salah.'):L('Could not sign in: ','Gagal log masuk: ')+m)});
  });


  /* register (step 1) and company setup (step 2: create a company or join with an invite code) */
  function renderAuthAlt(){
   const setup=S.authMode==='setup',tab=S.setupTab||'create';
   const f=(id,label,type,ph)=>`<label class="lg-f"><span>${label}</span><input id="${id}" type="${type||'text'}" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="${esc(ph||'')}"></label>`;
   const body=!setup?`<h2 class="lg-title">${L('Create your account','Cipta akaun anda')}</h2><p class="lg-sub">${L('Step 1 of 2: your login','Langkah 1 daripada 2: log masuk anda')}</p>`
      +f('rg-email',L('Email','E-mel'),'email','you@company.com')+f('rg-pass',L('Password (6 or more characters)','Kata laluan (6 aksara atau lebih)'),'password')
     :`<h2 class="lg-title">${L('Set up your company','Sediakan syarikat anda')}</h2><p class="lg-sub">${L('Step 2 of 2','Langkah 2 daripada 2')}</p>
      <div class="lg-tabs"><button type="button" class="lg-tab" data-stab="create" aria-pressed="${tab==='create'}">${L('New company','Syarikat baru')}</button><button type="button" class="lg-tab" data-stab="join" aria-pressed="${tab==='join'}">${L('Join with code','Sertai dengan kod')}</button></div>`
      +(tab==='create'?f('su-company',L('Company name','Nama syarikat'),'text','Kedai Buah Segar')+f('su-reg',L('Registration number (optional)','No. pendaftaran (pilihan)'),'text','')
        :f('su-code',L('Invite code','Kod jemputan'),'text','A1B2C3D4'))+f('su-name',L('Your name','Nama anda'),'text','');
   $('#login').innerHTML=`<form class="lg-card" id="${setup?'su-form':'rg-form'}" novalidate>${body}<p class="lg-err" id="lg-err" role="alert"></p>
     <button class="lg-go" type="submit">${setup?(tab==='create'?L('Create company','Cipta syarikat'):L('Join company','Sertai syarikat')):L('Continue','Teruskan')}</button>
     <button class="lg-link" type="button" data-auth="${setup?'out':'login'}">${setup?L('Sign out','Log keluar'):L('Back to sign in','Kembali ke log masuk')}</button></form>
    <div class="lg-foot"><button class="tbtn" data-llang="1">${ic('mic',16)}<span>${S.lang==='ms'?'Bahasa Melayu':'English'}</span></button></div>`;
   setTimeout(()=>{const i=$('#login input');if(i)i.focus({preventScroll:true})},60);
  }
  const finishLogin=()=>DB.loadAll().then(d=>{applyData(d);S.authMode=null;S.authMsg='';enter(d.me.role);setTimeout(renderLogin,1000)});
  track(document,'click',e=>{
   let b;
   if(b=e.target.closest('#login [data-auth]')){const a=b.dataset.auth;S.authMsg='';
    if(a==='out'){DB.signOut();S.authMode=null}else S.authMode=a==='register'?'register':null;renderLogin()}
   if(b=e.target.closest('#login [data-stab]')){S.setupTab=b.dataset.stab;renderLogin()}
  });
  track(document,'submit',e=>{
   const form=e.target;if(!form||(form.id!=='rg-form'&&form.id!=='su-form'))return;e.preventDefault();
   const err=$('#lg-err'),btn=form.querySelector('.lg-go'),label=btn.textContent,v=id=>($('#'+id)?$('#'+id).value.trim():'');
   const fail=m=>{err.textContent=m;btn.disabled=false;btn.textContent=label};
   const busy=()=>{err.textContent='';btn.disabled=true;btn.textContent='…'};
   if(form.id==='rg-form'){
    const em=v('rg-email'),pw=$('#rg-pass').value;
    if(!/^\S+@\S+\.\S+$/.test(em))return fail(L('Enter a valid email.','Masukkan e-mel yang sah.'));
    if(pw.length<6)return fail(L('Password needs 6 or more characters.','Kata laluan perlu 6 aksara atau lebih.'));
    busy();
    DB.signUp(em,pw).then(d=>{
     if(d.session){S.authMode='setup';S.setupTab='create'}
     else{S.authMode=null;S.authMsg=L('Account created. Open the email we sent to confirm it, then sign in.','Akaun dicipta. Buka e-mel pengesahan, kemudian log masuk.')}
     renderLogin()}).catch(x=>fail(String(x&&x.message||x)));
    return;
   }
   const tab=S.setupTab||'create',nm=v('su-name');
   if(tab==='create'&&!v('su-company'))return fail(L('Enter your company name.','Masukkan nama syarikat.'));
   if(tab==='join'&&!v('su-code'))return fail(L('Enter the invite code.','Masukkan kod jemputan.'));
   if(!nm)return fail(L('Enter your name.','Masukkan nama anda.'));
   busy();
   (tab==='create'?DB.createCompany(v('su-company'),v('su-reg'),nm):DB.joinCompany(v('su-code'),nm)).then(finishLogin).catch(x=>fail(String(x&&x.message||x)));
  });

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
    get isOwner(){return isOwner},get isMgr(){return isMgr},get canFin(){return canFin},get who(){return who},get roleName(){return roleName},
    get clamp(){return clamp},
    get seriesN(){return seriesN},
    get series(){return series},
    get pn(){return pn},
    get eta(){return eta},
    get esc(){return esc},
    get orderSay(){return orderSay},
    get suggest(){return suggest},
    get runDays(){return runDays},
    get aiTag(){return aiTag},
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

  /* ---- device size and on-screen keyboard ----
   * data-device on #ss-root is phone (up to 640px), tablet (up to 1024px) or desktop. The layout itself is CSS media queries
   * in voice.css; this attribute just names the current mode (handy when testing). --kb is the height the phone keyboard covers. */
  const mqPhone=matchMedia('(max-width:640px)'),mqTablet=matchMedia('(max-width:1024px)');
  const setDevice=()=>{root.dataset.device=mqPhone.matches?'phone':mqTablet.matches?'tablet':'desktop'};
  setDevice();track(mqPhone,'change',setDevice);track(mqTablet,'change',setDevice);
  const vv=window.visualViewport;
  function syncKeyboard(){const kb=vv?Math.max(0,Math.round(innerHeight-vv.height-vv.offsetTop)):0;root.style.setProperty('--kb',kb+'px');root.classList.toggle('kb-open',kb>120)}
  if(vv){track(vv,'resize',syncKeyboard);track(vv,'scroll',syncKeyboard)}

  /* ---- boot ---- */
  if(opts.scene&&opts.scene!=='login')S.scene=opts.scene;
  renderLogin();$('#login').hidden=!!S.user;applyStatic();
  if(DB.dataReady&&!S.user)DB.currentUser().then(u=>u&&!S.user?DB.loadAll().then(d=>{if(S.user)return;applyData(d);enter(d.me.role)}):0).catch(e=>{if(e&&e.code==='NO_COMPANY'&&!S.user){S.authMode='setup';S.setupTab='create';renderLogin()}});

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
