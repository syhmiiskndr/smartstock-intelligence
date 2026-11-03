/* Scene "people" – one file per page. Receives the shared engine API and returns its render functions. */
export default function peopleScene(api) {
  const { L, pn, P, sh } = api;

  function peopleScene(){
   const team=[['Syahmi','Admin',1],['Syafiq',L('Staff','Staf'),1],['Siti',L('Staff','Staf'),0],['Hakim',L('Staff','Staf'),1]];
   const sups=[['Segar Jaya',['Ayam','Telur','Bawang']],['Mill Sentosa',['Tepung','Beras','Minyak']],['Ladang Hijau',['Susu','Pisang']]];
   const nm=n=>pn(P.find(p=>p.name===n));
   return `${sh(L('People','Orang'),L('3 online now','3 aktif sekarang'))}
   <h2 class="h2">${L('Team','Pasukan')}</h2><div class="cluster">${team.map(([n,r,o])=>`<div class="av"><i class="${o?'on':''}">${n[0]}</i>${n}<small>${r}</small></div>`).join('')}</div>
   <h2 class="h2">${L('Suppliers','Pembekal')}</h2><div class="cluster">${sups.map(([n,it])=>`<div class="sup"><b>${n}</b><div class="row" style="margin:0">${it.map(i=>`<span class="pill">${nm(i)}</span>`).join('')}</div></div>`).join('')}</div>`;
  }

  return { people:peopleScene };
}
