/* Premi Fidelity CONAD + UNIEURO — demo: nessun premio reale viene spedito. */
(function(){
'use strict';
const PRIZES=[
{id:'s26fe',name:'Samsung Galaxy S26 FE 128GB',brand:'Samsung',price:819,icon:'📱'},
{id:'iphone17e',name:'Apple iPhone 17e',brand:'Apple',price:879,icon:'📱'},
{id:'s26',name:'Samsung Galaxy S26 256GB',brand:'Samsung',price:1129,icon:'📱'},
{id:'iphone17',name:'Apple iPhone 17 256GB',brand:'Apple',price:1129,icon:'📱'},
{id:'s26plus',name:'Samsung Galaxy S26+ 256GB',brand:'Samsung',price:1389,icon:'📱'},
{id:'iphoneair',name:'Apple iPhone Air',brand:'Apple',price:1339,icon:'📱'},
{id:'iphone17pro',name:'Apple iPhone 17 Pro 256GB',brand:'Apple',price:1339,icon:'📱'},
{id:'iphone17promax',name:'Apple iPhone 17 Pro Max 256GB',brand:'Apple',price:1489,icon:'📱'},
{id:'s26ultra',name:'Samsung Galaxy S26 Ultra 256GB',brand:'Samsung',price:1499,icon:'📱'},
{id:'iphone18pro',name:'Apple iPhone 18 Pro (prezzo da)',brand:'Apple',price:1489,icon:'📱'},
{id:'iphone17_512',name:'Apple iPhone 17 512GB',brand:'Apple',price:1379,icon:'📱'},
{id:'s26fe256',name:'Samsung Galaxy S26 FE 256GB',brand:'Samsung',price:919,icon:'📱'}
].map(p=>({...p,points:Math.max(1200,Math.ceil(p.price*1.2))}));
const PENDING_KEY='retail_pending_bulk_cloud_v1';
const $p=id=>document.getElementById(id);
const escP=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&#39;'}[c]));
const fmtP=n=>Number(n).toLocaleString('it-IT');
const moneyP=n=>Number(n).toLocaleString('it-IT',{style:'currency',currency:'EUR'});
let processing=false;
let selectedStore='unieuro';
let selectedReward=PRIZES[0].id;
let selectedCard='';
const style=document.createElement('style');
style.textContent='.landing-admin-row{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:10px}.landing-options-main{font-size:15px;padding:16px 25px;min-height:54px;box-shadow:0 6px 22px #104d951c}.landing-admin-small{font-size:11px;padding:8px 11px;opacity:.82}.prize-modal .prize-switch{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.prize-modal .prize-switch button.active{background:#075fc9;color:white}.prize-modal .prize-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(205px,1fr));gap:9px;max-height:330px;overflow:auto;padding:5px}.prize-modal .prize-tile{border:1px solid #d7e5f4;background:#fff;border-radius:13px;padding:12px;text-align:left;display:flex;flex-direction:column;gap:5px}.prize-modal .prize-tile.selected{border:2px solid #086fe7;background:#edf5ff}.prize-modal .prize-tile strong{font-size:13px}.prize-modal .prize-tile small{color:#5d7895}.prize-modal .prize-tile b{color:#075bb9;font-size:15px}.prize-modal .prize-redeem{background:#eef6ff;padding:13px;border-radius:13px;margin-top:14px}.prize-modal .prize-redeem select{width:100%;padding:11px;border:1px solid #c8d8ec;border-radius:10px;background:#fff}.prize-modal .prize-status{white-space:pre-wrap;font-size:12px;margin-top:9px}.prize-modal .prize-status.error{color:#b21d34}.prize-modal .prize-status.ok{color:#087552}.prize-modal .prize-history{max-height:160px;overflow:auto;font-size:12px}.prize-modal .prize-history div{padding:7px;border-bottom:1px solid #e6edf5}.admin-hub .admin-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:11px;margin:14px 0}.admin-hub .admin-card{display:block;text-align:left;background:#f3f8ff;border:1px solid #d4e5fa;border-radius:13px;padding:17px;min-height:104px}.admin-hub .admin-card b{display:block;margin-bottom:6px}.admin-hub .admin-card small{color:#57738f}';
document.head.appendChild(style);
function notifyP(msg,err=false){const el=$p('prizeStatus');if(el){el.textContent=msg;el.className='prize-status '+(err?'error':'ok')}else if(typeof toast==='function')toast(msg)}
function brand(){return typeof active!=='undefined'&&['conad','unieuro'].includes(active)?active:'unieuro'}
async function conadState(){
 const stored=localStorage.getItem('conad_rp_pro_v2');
 if(stored){try{const data=JSON.parse(stored);if(Array.isArray(data.cards)&&Array.isArray(data.products))return data}catch(e){}}
 const iframe=$p('conadIframe');
 if(!iframe)throw Error('Simulatore CONAD non disponibile');
 if(typeof conadLoaded!=='undefined'&&!conadLoaded){
  await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(Error('Caricamento CONAD troppo lento')),12000);
   iframe.addEventListener('load',()=>{clearTimeout(timeout);resolve()},{once:true});
   loadConad();
  });
 }
 try{const d=iframe.contentWindow.eval('JSON.parse(JSON.stringify(db))');if(!Array.isArray(d.cards))throw Error('Dati fidelity non trovati');return d}
 catch(e){throw Error('Apri prima CONAD e riprova: '+e.message)}
}
async function stateOf(store){
 if(store==='conad')return conadState();
 if(!db||!Array.isArray(db.cards))throw Error('Archivio UNIEURO non disponibile');
 return JSON.parse(JSON.stringify(db));
}
async function storeState(store,data){
 const key=store==='conad'?'conad_rp_pro_v2':'unieuro_dual_v1';
 localStorage.setItem(key,JSON.stringify(data));
 if(store==='unieuro'){db=data;save();renderAll()}
 else if(typeof conadLoaded!=='undefined'&&conadLoaded){
  try{const f=$p('conadIframe');f.contentWindow.eval('db=JSON.parse(localStorage.getItem("conad_rp_pro_v2"));render();')}catch(e){console.warn('Fidelity CONAD: aggiorna la schermata per vedere i nuovi punti',e)}
 }
}
function prizeList(){return PRIZES.map(p=>'<button type="button" class="prize-tile'+(p.id===selectedReward?' selected':'')+'" onclick="chooseFidelityPrize('+JSON.stringify(p.id)+')"><strong>'+p.icon+' '+escP(p.name)+'</strong><small>Prezzo di riferimento: '+moneyP(p.price)+'</small><b>⭐ '+fmtP(p.points)+' punti</b></button>').join('')}
function selectHtml(cards){
 if(!cards.length)return '<option value="">Nessuna tessera: crea prima una fidelity nel negozio</option>';
 return '<option value="">— Seleziona un cliente —</option>'+cards.map(c=>'<option value="'+escP(c.code)+'"'+(c.code===selectedCard?' selected':'')+'>'+escP(c.name)+' · '+fmtP(Math.max(0,Number(c.points)||0))+' punti · '+escP(c.code)+'</option>').join('');
}
async function redraw(){
 const store=selectedStore;
 const area=$p('prizeContent');if(!area)return;
 area.innerHTML='<p>Caricamento tessere fidelity…</p>';
 try{
  const data=await stateOf(store);if(store!==selectedStore||!$p('prizeContent'))return;
  const cards=(data.cards||[]).filter(c=>c&&typeof c.code==='string');
  if(!cards.some(c=>c.code===selectedCard))selectedCard='';
  const history=(data.rewardRedemptions||[]).slice(0,12);
  area.innerHTML='<div class="prize-grid">'+prizeList()+'</div><div class="prize-redeem"><label for="prizeCustomer">Cliente fidelity</label><select id="prizeCustomer" onchange="fidelityCustomerChanged(this.value)">'+selectHtml(cards)+'</select><div id="prizeDetails" style="padding:11px 0;font-size:13px"></div><button class="btn success" id="prizeRedeemButton" onclick="redeemFidelityPrize()">🎁 RISCATTA PREMIO · SCALA PUNTI</button><div id="prizeStatus" class="prize-status" role="status"></div></div><h3 class="section-title">Ultimi premi riscattati</h3><div class="prize-history">'+(history.length?history.map(h=>'<div>🎁 '+escP(h.prizeName)+' · '+escP(h.customerName)+' · −'+fmtP(h.points)+' punti · '+escP(new Date(h.date).toLocaleString('it-IT'))+'</div>').join(''):'<p class="hint">Nessun premio ancora riscattato.</p>')+'</div>';
  updateDetails(cards);
 }catch(e){if($p('prizeContent'))$p('prizeContent').innerHTML='<p style="color:#ae1e2e">'+escP(e.message)+'</p>'}
}
function updateDetails(cards){
 const prize=PRIZES.find(p=>p.id===selectedReward);
 const card=cards.find(c=>c.code===selectedCard);
 const el=$p('prizeDetails');const button=$p('prizeRedeemButton');
 if(!el||!button)return;
 const balance=card?Math.max(0,Number(card.points)||0):0;
 el.innerHTML='<b>'+escP(prize.name)+'</b> · costo <b>'+fmtP(prize.points)+' punti</b><br>Saldo cliente: <b>'+fmtP(balance)+' punti</b>'+(card?'<br>'+(balance>=prize.points?'✓ Punti sufficienti':'Mancano '+fmtP(prize.points-balance)+' punti'):'<br>Seleziona una tessera per procedere');
 button.disabled=!card||balance<prize.points||processing;
}
window.openAdminPanel=function(){
 showModal('<div class="admin-hub"><h2>🔐 PANNELLO ADMIN</h2><p class="hint">Gestione del simulatore, cataloghi, fidelity e backup privati. Per accedere al cloud usa il tuo account personale.</p><div class="admin-grid"><button class="admin-card" onclick="openCloudBackup()"><b>☁ Backup cloud · 7 copie</b><small>Accedi, salva e ripristina dati CONAD e UNIEURO</small></button><button class="admin-card" onclick="openBulkProducts()"><b>✍ Prodotti in blocco</b><small>Inserisci o aggiorna molti articoli con un solo salvataggio</small></button><button class="admin-card" onclick="openFidelityPrizes()"><b>🎁 Premi fidelity</b><small>Catalogo, saldo punti e riscatti simulati</small></button><button class="admin-card" onclick="openOptions()"><b>⚙ Impostazioni simulatore</b><small>Opzioni, backup JSON e configurazioni delle casse</small></button></div><p class="hint">Progetto dimostrativo non affiliato ai marchi. Nessun premio reale è distribuito.</p></div>');
};
window.openFidelityPrizes=function(){
 selectedStore=brand();selectedReward=PRIZES[0].id;selectedCard='';
 showModal('<div class="prize-modal"><h2>🎁 PREMI FIDELITY</h2><p class="hint">Premi dimostrativi per clienti fidelity. Prezzi di riferimento Apple/Samsung Italia; soglie simulate da <b>1.200 punti</b> in su, proporzionate al prezzo (1,2 punti per euro, minimo 1.200). Nessun prodotto fisico viene consegnato.</p><div class="prize-switch"><button id="prizeStoreConad" class="btn" onclick="switchFidelityStore(\'conad\')">🔴 CONAD</button><button id="prizeStoreUnieuro" class="btn" onclick="switchFidelityStore(\'unieuro\')">🔵 UNIEURO</button></div><div id="prizeContent"></div><p class="hint">Fonti prezzi: <a href="https://www.apple.com/it/shop/buy-iphone" target="_blank" rel="noopener noreferrer">Apple Italia</a> · <a href="https://www.samsung.com/it/smartphones/galaxy-s26/buy/" target="_blank" rel="noopener noreferrer">Samsung Italia</a>. I prezzi possono variare; i punti sono una regola della simulazione.</p></div>');
 switchFidelityStore(selectedStore);
};
window.switchFidelityStore=function(store){if(!['conad','unieuro'].includes(store))return;selectedStore=store;selectedCard='';$p('prizeStoreConad')?.classList.toggle('active',store==='conad');$p('prizeStoreUnieuro')?.classList.toggle('active',store==='unieuro');redraw()};
window.chooseFidelityPrize=function(id){if(!PRIZES.some(p=>p.id===id))return;selectedReward=id;redraw()};
window.fidelityCustomerChanged=function(code){selectedCard=code;redraw()};
window.redeemFidelityPrize=async function(){
 if(processing)return;
 const store=selectedStore,code=selectedCard,prize=PRIZES.find(p=>p.id===selectedReward);
 if(!prize||!code)return notifyP('Seleziona un cliente fidelity',true);
 processing=true;
 try{
  const data=await stateOf(store),card=data.cards.find(c=>c.code===code);
  if(!card)throw Error('Tessera non trovata. Nessun punto scalato.');
  const before=Number(card.points);
  if(!Number.isFinite(before)||before<prize.points)throw Error('Punti insufficienti. Nessun punto scalato.');
  if(!confirm('Riscattare '+prize.name+' per '+fmtP(prize.points)+' punti dalla tessera di '+card.name+'? Operazione dimostrativa.'))return;
  card.points=before-prize.points;
  if(!Array.isArray(data.rewardRedemptions))data.rewardRedemptions=[];
  const item={id:(globalThis.crypto?.randomUUID?.()||'PRIZE-'+Date.now()),date:new Date().toISOString(),cardCode:card.code,customerName:card.name,prizeId:prize.id,prizeName:prize.name,referencePrice:prize.price,points:prize.points};
  data.rewardRedemptions.unshift(item);
  await storeState(store,data);
  localStorage.setItem(PENDING_KEY,'1');
  let cloud={ok:false,reason:'Accedi al pannello ADMIN BACKUP per sincronizzare'};
  try{if(typeof window.cloudBackupAfterBatch==='function')cloud=await window.cloudBackupAfterBatch()}catch(e){cloud={ok:false,reason:e.message}}
  await redraw();
  notifyP('✓ Premio riscattato! −'+fmtP(prize.points)+' punti · saldo '+fmtP(card.points)+'.\n'+(cloud.ok?'☁ Backup cloud completato.':'⚠ Backup cloud in attesa: '+(cloud.reason||'accedi al pannello Admin')),false);
 }catch(e){notifyP('Errore: '+e.message,true)}
 finally{processing=false}
};
})();