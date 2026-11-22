/* Scene "people" – one file per page. Receives the shared engine API and returns its render functions. */
export default function peopleScene(api) {
  const { L, pn, P, sh, S, esc, isMgr, isOwner, roleName } = api;

  // Sample data for the demo account
  function demoPeople(){
   const team=[['Syahmi',L('Owner','Pemilik'),1],['Aina','Admin',1],['Syafiq',L('Staff','Staf'),1],['Siti',L('Staff','Staf'),0],['Hakim',L('Staff','Staf'),1]];
   const sups=[['Segar Jaya',['Ayam','Telur','Bawang']],['Mill Sentosa',['Tepung','Beras','Minyak']],['Ladang Hijau',['Susu','Pisang']]];
   const nm=n=>{const p=P.find(x=>x.name===n);return p?pn(p):n};
   return `${sh(L('People','Orang'),L('3 online now','3 aktif sekarang'))}
   <h2 class="h2">${L('Team','Pasukan')}</h2><div class="cluster">${team.map(([n,r,o])=>`<div class="av"><i class="${o?'on':''}">${n[0]}</i>${n}<small>${r}</small></div>`).join('')}</div>
   <h2 class="h2">${L('Suppliers','Pembekal')}</h2><div class="cluster">${sups.map(([n,it])=>`<div class="sup"><b>${n}</b><div class="row" style="margin:0">${it.map(i=>`<span class="pill">${nm(i)}</span>`).join('')}</div></div>`).join('')}</div>`;
  }

  // Real team and suppliers of the signed-in company
  function livePeople(){
   const mgr=isMgr(), own=isOwner(), team=S.team||[], vend=S.vendors||[], me=S.me||{};
   const active=team.filter(m=>m.active).length;
   const member=m=>{
    const tap=own&&m.id!==me.id;
    return `<div class="av ${tap?'tap':''}" ${tap?`role="button" tabindex="0" data-pp="member:${esc(m.id)}"`:''}><i class="${m.active?'on':''}">${esc((m.name||'?')[0].toUpperCase())}</i>${esc(m.name)}<small>${roleName(m.role)}${m.active?'':' · '+L('inactive','tidak aktif')}</small></div>`;
   };
   const sup=v=>{
    const names=v.items.map(id=>P.find(p=>p.id===String(id))).filter(Boolean);
    return `<div class="sup"><div class="sup-h"><b>${esc(v.name)}</b>${mgr?`<span><button class="mng-x" data-pp="editsup:${v.id}" aria-label="${L('Edit','Edit')} ${esc(v.name)}">✎</button> <button class="mng-x" data-pp="delsup:${v.id}" aria-label="${L('Remove','Buang')} ${esc(v.name)}">✕</button></span>`:''}</div>
     <span class="meta" style="margin:0">${L('Delivers in','Penghantaran')} ${v.lead} ${L(v.lead===1?'day':'days','hari')}${v.contact?' · '+esc(v.contact):''}${v.phone?' · '+esc(v.phone):''}</span>
     <div class="row" style="margin:0">${names.length?names.map(p=>`<span class="pill">${esc(pn(p))}</span>`).join(''):`<span class="pill">${L('no stock yet','belum ada stok')}</span>`}</div></div>`;
   };
   const add=(k,t)=>mgr?`<button class="btn add-btn" data-pp="${k}">+ ${t}</button>`:'';
   return `${sh(L('People','Orang'),`${active} ${L('active members','ahli aktif')} · ${vend.length} ${vend.length===1?L("supplier","pembekal"):L("suppliers","pembekal")}`)}
   <div class="h2-row"><h2 class="h2">${L('Team','Pasukan')}</h2>${add('invite',L('Invite member','Jemput ahli'))}</div>
   <div class="cluster">${team.map(member).join('')}</div>
   ${own?`<p class="demo-note">${L('Tap a team member to change their role or deactivate them.','Tekan ahli pasukan untuk tukar peranan atau nyahaktifkan.')}</p>`:''}
   <div class="h2-row"><h2 class="h2">${L('Suppliers','Pembekal')}</h2>${add('addsup',L('Add supplier','Tambah pembekal'))}</div>
   <div class="cluster">${vend.length?vend.map(sup).join(''):`<p class="p-body">${L('No suppliers yet. Add the ones you buy from.','Belum ada pembekal. Tambah pembekal anda.')}</p>`}</div>`;
  }

  return { people:()=>S.live?livePeople():demoPeople() };
}
