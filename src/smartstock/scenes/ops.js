/* Scene "ops" – one file per page. Receives the shared engine API and returns its render functions. */
export default function opsScene(api) {
  const { S, P, pending, L, ic, sh, esc, reqTitle, rm0, byName, reqReason, orderTracking } = api;

  function opsScene(){
   const pend=pending(), t=pend[0];
   /* real signals only: when the forecast last ran, how many drafts it made, how many alerts are open */
   const fcAt=(P.map(p=>p.fc&&p.fc.at).filter(Boolean).sort().pop()),drafts=S.requests.filter(r=>r.rkey==='ai').length,al=(S.alerts||[]).length;
   const auto=[fcAt?L('Forecast updated '+new Date(fcAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}),'Ramalan dikemas kini '+new Date(fcAt).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})):L('Forecast waiting for data','Ramalan menunggu data'),L(`${drafts} order draft${drafts===1?'':'s'} from forecast`,`${drafts} draf order daripada ramalan`),L(`${al} open alert${al===1?'':'s'}`,`${al} amaran terbuka`)].map(x=>`<span class="pill ok">${ic('check',13)}${x}</span>`).join('');
   if(!t)return `${sh(L('Approve','Lulus'),L('nothing waiting','tiada menunggu'))}<div class="empty"><i>${ic('check',32)}</i><div><h2 class="h2" style="margin:0">${L('All clear','Semua selesai')}</h2><span class="say">${L('New recommendations will appear here.','Cadangan baru akan muncul di sini.')}</span></div></div><div class="auto">${auto}</div>`;
   const kind=t.kind==='order'?L('Suggested order','Cadangan order'):t.kind==='stockin'?L('Stock received','Stok diterima'):L('Stock write-off','Tulis-off stok');
   return `${sh(L('Approve','Lulus'),`${pend.length} ${L('waiting','menunggu')}`)}
   <div class="deck">${pend.length>2?'<div class="rcard back b2"></div>':''}${pend.length>1?'<div class="rcard back"></div>':''}
    <article class="rcard top" id="rtop"><span class="pill ${t.kind==='order'||t.kind==='stockin'?'':'warn'}">${kind}</span><h3>${esc(reqTitle(t))}</h3><div class="amt">${rm0(t.amount)}</div>
    <div class="row"><span class="pill">${esc(byName(t.by))}</span>${t.supplier?`<span class="pill">${esc(t.supplier)}</span>`:''}<span class="pill ${t.kind==='order'&&(t.rkey!=='ai'||t.urgent)?'bad':'warn'}">${esc(reqReason(t))}</span></div>
    <div class="row" style="margin-top:20px"><button class="btn big" data-decide="no">${L('Reject','Tolak')}</button><button class="btn ok big" data-decide="ok" style="flex:1">${L('Approve','Lulus')}</button></div></article></div>
   <span class="say">${L('Drag the card right, or say','Seret kad ke kanan, atau sebut')} <q>${L('approve','lulus')}</q></span><div class="auto">${auto}</div>`;
  }

  return { ops:()=>opsScene()+orderTracking() };
}
