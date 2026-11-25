/* Scene "rules" – one file per page. Receives the shared engine API and returns its render functions.
   Every control here is saved to the database through update_settings() (owner only). */
export default function rulesScene(api) {
  const { S, sh, L } = api;

  function rulesScene() {
    const R = S.rules;
    const sw = (k, on, dis) => `<button class="sw" role="switch" aria-checked="${on}" data-rule="${k}" ${dis ? 'disabled' : ''} aria-label="${k}"></button>`;
    const rule = (t, d, ctl) => `<div class="rule"><div><b>${t}</b><span class="d">${d}</span></div>${ctl}</div>`;
    const slider = (id, min, max, step, val, label) => `<div class="slide"><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}" aria-label="${label}"><b id="${id}-v">RM ${val}</b></div>`;

    const opt = (k, title, desc) => `<button class="au-opt" role="radio" aria-checked="${R.autonomy === k}" data-autonomy="${k}"><b>${title}</b><span>${desc}</span></button>`;
    const autoBox = R.autonomy === 'auto' ? `
      ${rule(L('Largest single order', 'Order tunggal terbesar'), L('SmartStock may place an order up to this amount by itself. Anything above waits for you.', 'SmartStock boleh buat order sehingga jumlah ini sendiri. Lebih daripada itu menunggu anda.'), slider('autolimit', 0, 1000, 10, R.autoLimit, L('Largest single order', 'Order tunggal terbesar')))}
      ${rule(L('Daily spending cap', 'Had belanja harian'), L('Total of all auto-placed orders in one day. Once reached, new drafts wait for approval.', 'Jumlah semua order auto dalam sehari. Bila dicapai, draf baharu menunggu kelulusan.'), slider('autocap', 0, 5000, 50, R.autoCap, L('Daily spending cap', 'Had belanja harian')))}` : '';

    return `${sh(L('Rules', 'Tetapan'), L('How much SmartStock may do on its own', 'Setakat mana SmartStock boleh bertindak sendiri'))}
   <div class="lvl"><div class="lvl-h"><span class="pill ok">${L('Purchasing', 'Pembelian')}</span><h3>${L('How should SmartStock reorder?', 'Bagaimana SmartStock susun semula stok?')}</h3></div>
    <div class="au-opts" role="radiogroup" aria-label="${L('Autonomy level', 'Tahap autonomi')}">
     ${opt('suggest', L('Suggest only', 'Cadang sahaja'), L('Shows forecasts and how much to order. You create every order yourself.', 'Papar ramalan dan kuantiti cadangan. Anda buat setiap order sendiri.'))}
     ${opt('draft', L('Draft orders', 'Draf order'), L('Prepares purchase orders and waits for an owner or admin to approve each one.', 'Sediakan pesanan pembelian dan tunggu pemilik atau admin lulus satu persatu.'))}
     ${opt('auto', L('Auto-order', 'Auto-order'), L('Places small orders itself, inside your limits. Bigger ones wait for approval.', 'Buat order kecil sendiri, dalam had anda. Yang besar menunggu kelulusan.'))}
    </div>${autoBox}
    <p class="au-note">${L('Every automatic order is recorded in Activity as SmartStock AI.', 'Setiap order automatik direkod dalam Aktiviti sebagai SmartStock AI.')}</p></div>

   <div class="lvl"><div class="lvl-h"><span class="pill warn">${L('Alerts', 'Amaran')}</span><h3>${L('What SmartStock tells you', 'Apa yang SmartStock beritahu')}</h3></div>
    ${rule(L('Low-stock alerts', 'Amaran stok rendah'), L('Notify when an item drops below its reorder level.', 'Maklumkan bila item bawah paras susun semula.'), sw('lowAlert', R.lowAlert))}
    ${rule(L('Expiry alerts', 'Amaran luput'), L('Notify when a batch is close to expiry.', 'Maklumkan bila kelompok hampir luput.'), sw('expAlert', R.expAlert))}
    ${rule(L('Expiry warning time', 'Tempoh amaran luput'), L('How many days before the date a batch counts as expiring soon.', 'Berapa hari sebelum tarikh sesuatu kelompok dianggap hampir luput.'),
      `<select id="expdays" class="fm-s" aria-label="${L('Days', 'Hari')}">${[1, 2, 3, 5, 7, 10, 14].map((d) => `<option value="${d}" ${R.expDays === d ? 'selected' : ''}>${d} ${L('days', 'hari')}</option>`).join('')}</select>`)}
    ${rule(L('Flag unusual usage', 'Tanda penggunaan luar biasa'), L('Warn when an item is used far above its normal rate.', 'Beri amaran bila penggunaan jauh melebihi kadar biasa.'), sw('anomaly', R.anomaly))}</div>

   <div class="lvl"><div class="lvl-h"><span class="pill bad">${L('Approvals', 'Kelulusan')}</span><h3>${L('What needs your approval', 'Apa yang perlu kelulusan anda')}</h3></div>
    ${rule(L('Write-off limit', 'Had tulis-off'), L('Waste above this amount waits for approval.', 'Sisa melebihi jumlah ini menunggu kelulusan.'), slider('limit', 0, 100, 5, R.limit, L('Write-off limit', 'Had tulis-off')))}
    ${rule(L('Confirm before recording', 'Sahkan sebelum rekod'), L('Ask "Confirm?" after a voice command to use or receive stock. Turn off for hands-free speed.', 'Tanya "Betul?" selepas arahan suara guna atau terima stok. Matikan untuk lebih pantas.'), sw('confirm', R.confirm))}</div>

   <div class="lvl"><div class="lvl-h"><span class="pill">${L('Access', 'Akses')}</span><h3>${L('What admins can see', 'Apa yang admin boleh lihat')}</h3></div>
    ${rule(L('Admins can see costs and stock value', 'Admin boleh lihat kos dan nilai stok'), L('Off by default. Turn on for a trusted manager. Rules always stay owner-only.', 'Mati secara lalai. Hidupkan untuk pengurus dipercayai. Tetapan sentiasa untuk pemilik sahaja.'), sw('adminFinance', R.adminFinance))}</div>
   ${S.me && S.me.isDemo && api.isOwner() ? `<div class="lvl"><div class="lvl-h"><span class="pill">Demo</span><h3>${L('Demo company', 'Syarikat demo')}</h3></div>${rule(L('Reset demo data', 'Reset data demo'), L('Deletes everything in this company and loads the sample fruit shop again.', 'Padam semua dalam syarikat ini dan muat semula kedai buah contoh.'), `<button class="btn" data-pp="resetdemo">${L('Reset', 'Reset')}</button>`)}</div>` : ''}`;
  }

  return { rules: rulesScene };
}
