/* Scene "rules" – one file per page. Receives the shared engine API and returns its render functions. */
export default function rulesScene(api) {
  const { S, sh, L } = api;

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

  return { rules:rulesScene };
}
