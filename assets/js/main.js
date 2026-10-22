/* Informations du cabinet : à remplacer ici uniquement (laisser telHref vide tant que le vrai numéro n'est pas connu, format 33612345678) */
const CFG={marque:'AlloRémy',nom:'Rémy Leroi',raison:'Ziassur SAS',forme:'SAS au capital de 1 000 €, RCS Paris 990 524 423',adresse:'60 rue François 1er, 75008 Paris',orias:'25008309',email:'contact@ziassur.fr',tel:'07 57 13 03 66',telHref:'33757130366',gtmId:'',avisUrl:'',leadEmail:'elasmarrayan11@gmail.com',mediateur:"La Médiation de l'Assurance, TSA 50110, 75441 Paris Cedex 09 (www.mediation-assurance.org)",horaires:'Lun-Ven, 9h-19h'};
/* AVIS CLIENTS : pour ajouter un avis, copiez une ligne ci-dessous, retirez les // et remplacez le texte.
   Ne publiez que des avis réels, authentiques et que le client a autorisés. verifie:true seulement si l'avis est contrôlé.
   {nom:'Prénom N.', note:5, texte:'Texte exact de l\'avis', date:'2026-10-01', verifie:true}, */
const REVIEWS=[
];
document.querySelectorAll('[data-b]').forEach(el=>{
  const v=CFG[el.dataset.b];el.textContent=v;
  if(v.startsWith('['))el.classList.add('todo');
});
const isMobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
function showToast(t){
  const d=document.createElement('div');d.className='toast';d.setAttribute('role','status');d.textContent=t;document.body.appendChild(d);
  setTimeout(()=>d.remove(),4500);
}
/* Boutons d'appel : sur téléphone, le numéro se compose directement ; sur ordinateur, on affiche et copie le numéro */
document.querySelectorAll('[data-call]').forEach(a=>{
  if(!CFG.telHref)return;
  a.href='tel:+'+CFG.telHref;
  a.setAttribute('aria-label','Appeler le '+CFG.tel);
  if(!isMobile)a.addEventListener('click',e=>{e.preventDefault();showToast('Appelez-nous au '+CFG.tel+' depuis votre téléphone');try{navigator.clipboard.writeText(CFG.tel);}catch(err){}});
});
const labels={auto:'Auto',vtc:'VTC',neg:'Négoce auto'};
const panel=document.getElementById('fields');
const MOTIFS={
  auto:["Malus","Résilié par mon assureur","Résilié pour non-paiement","Plusieurs refus d'assurance","Permis annulé ou suspendu","Autre situation"],
  vtc:["Malus (activité VTC)","Contrat VTC résilié","Résilié pour non-paiement","Refus de plusieurs assureurs","Permis annulé ou suspendu","Autre situation"],
  neg:["Première assurance W garage","Contrat professionnel résilié","Résilié pour non-paiement","Refus de plusieurs assureurs","Malus ou permis annulé ou suspendu","Autre situation"]
};
function fillMotifs(k){
  document.getElementById('motif').innerHTML='<option value="">Choisir…</option>'+MOTIFS[k].map(o=>'<option>'+o+'</option>').join('');
}
let cur='auto';
function select(k){
  cur=k;
  document.querySelectorAll('[role=tab]').forEach(t=>{
    const on=t.dataset.k===k;
    t.setAttribute('aria-selected',on);
    t.tabIndex=on?0:-1;
  });
  panel.setAttribute('aria-labelledby','t-'+k);
  document.querySelector('.screen').dataset.k=k;
  fillMotifs(k);
  if(typeof setHeadline==='function')setHeadline(k);
}
document.querySelectorAll('[role=tab]').forEach(t=>{
  t.addEventListener('click',()=>select(t.dataset.k));
  t.addEventListener('keydown',e=>{
    const tabs=[...document.querySelectorAll('[role=tab]')];
    let i=tabs.indexOf(t);
    if(e.key==='ArrowRight')i=(i+1)%tabs.length;
    else if(e.key==='ArrowLeft')i=(i-1+tabs.length)%tabs.length;
    else return;
    tabs[i].focus();select(tabs[i].dataset.k);
  });
});
document.getElementById('f').addEventListener('submit',e=>{
  e.preventDefault();
  const v=id=>document.getElementById(id).value.trim();
  const msg=document.getElementById('msg');
  msg.className='err';
  if(!v('prenom')||!v('nom')){msg.textContent='Indiquez votre prénom et votre nom.';return;}
  if(!/^\S+@\S+\.\S+$/.test(v('mail'))){msg.textContent='Indiquez une adresse e-mail valide.';return;}
  if(v('tel').replace(/\D/g,'').length<8){msg.textContent='Indiquez un numéro de téléphone valide.';return;}
  if(!v('motif')){msg.textContent='Choisissez le motif de votre demande.';return;}
  if(!document.getElementById('rappel').checked){msg.textContent="Cochez la case pour accepter d'être rappelé(e).";return;}
  if(document.getElementById('hp').value)return;
  const data={prenom:v('prenom'),nom:v('nom'),email:v('mail'),telephone:v('tel'),motif:v('motif'),assurance:labels[cur],consentement_rappel:'oui',page:location.href.split('#')[0],date:new Date().toISOString()};
  const viaMail=()=>{
    if(CFG.email.startsWith('[')){msg.className='err';msg.textContent="Test : le formulaire n'est pas encore relié à l'e-mail du cabinet.";return;}
    const body=['Demande de rappel : '+labels[cur],'','Prénom : '+data.prenom,'Nom : '+data.nom,'E-mail : '+data.email,'Téléphone : '+data.telephone,'Motif : '+data.motif,"Accepte d'être rappelé(e) : oui"].join('\n');
    location.href='mailto:'+(CFG.leadEmail||CFG.email)+'?subject='+encodeURIComponent('Demande de rappel '+labels[cur])+'&body='+encodeURIComponent(body);
    msg.className='';msg.textContent="Votre messagerie s'ouvre : envoyez le message pour finaliser votre demande.";
  };
  if(!CFG.leadEmail){viaMail();return;}
  const btn=e.target.querySelector('button[type=submit]');btn.disabled=true;msg.className='';msg.textContent='Envoi en cours…';
  fetch('https://formsubmit.co/ajax/'+encodeURIComponent(CFG.leadEmail),{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(Object.assign({_subject:'Nouvelle demande de rappel : '+labels[cur],_template:'table',_captcha:'false',_replyto:data.email},data))})
    .then(r=>r.ok?r.json():Promise.reject(new Error('http '+r.status)))
    .then(j=>{if(j&&(j.success===true||j.success==='true')){showThanks(data.prenom,data.telephone);track('lead_form_submit',{form_type:labels[cur]});}else throw new Error('refus');})
    .catch(()=>{btn.disabled=false;viaMail();});
});
/* Suivi : les événements sont préparés ; rien n'est envoyé tant que gtmId (ex. 'GTM-XXXXXXX') est vide et que le visiteur n'a pas accepté les cookies */
window.dataLayer=window.dataLayer||[];
function track(ev,data){window.dataLayer.push(Object.assign({event:ev},data||{}));}
document.addEventListener('click',e=>{if(CFG.telHref&&isMobile&&e.target.closest('a[data-call]'))track('phone_click');});
function loadGTM(){
  if(!CFG.gtmId||window.__gtm)return;window.__gtm=1;
  window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'});
  const j=document.createElement('script');j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+encodeURIComponent(CFG.gtmId);document.head.appendChild(j);
}
const cb=document.getElementById('cb');
function getC(){try{return localStorage.getItem('cookies')}catch(e){return null}}
function setC(v){try{localStorage.setItem('cookies',v)}catch(e){}cb.hidden=true;if(v==='oui')loadGTM();}
document.getElementById('cby').onclick=()=>setC('oui');
document.getElementById('cbn').onclick=()=>setC('non');
if(CFG.gtmId){
  const l=document.getElementById('cookieLink');l.hidden=false;
  l.onclick=e=>{e.preventDefault();cb.hidden=false;};
  if(getC()==='oui')loadGTM();else if(!getC())cb.hidden=false;
}
document.documentElement.classList.add('js');
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);}}),{threshold:.12});
  document.querySelectorAll('.offer,.why-grid>div,.steps li,.guides article,.faq details,.proof>div').forEach((el,i)=>{el.classList.add('rv');el.style.transitionDelay=(i%4)*70+'ms';io.observe(el);});
  
}
/* « En savoir plus » : ouvre les mentions légales, la confidentialité et les cookies en bas de page */
document.querySelectorAll('a[href="#legal"]').forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();
  document.querySelectorAll('.legalbar details').forEach(d=>{d.open=true;});
  document.querySelector('.legalbar').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
}));
const tb=document.getElementById('topbar'),nv=document.querySelector('nav');
if(tb&&nv&&'IntersectionObserver' in window)new IntersectionObserver(([e])=>tb.classList.toggle('on',!e.isIntersecting)).observe(nv);
/* Assistante virtuelle : réponses simples préparées à l'avance (elles fonctionnent partout, même dans le fichier HTML), puis redirection vers le formulaire. Si l'IA est disponible (aperçu), elle répond aux questions hors liste. */
(async()=>{
  let sample=null;
  try{sample=window.claude?await window.claude.use('sample'):null;}catch(e){}
  const $=id=>document.getElementById(id),root=$('chat'),fab=$('chatFab'),panel=$('chatPanel'),log=$('chatLog'),form=$('chatForm'),inp=$('chatInput'),chips=$('chatChips');
  root.hidden=false;
  const hist=[];let busy=false;
  const telOk=!!CFG.telHref;
  const RAPPEL="Un conseiller vous rappelle sous 12 à 24 h après votre demande. Une fois le dossier accepté et le contrat signé, l'attestation d'assurance est remise en 20 à 25 minutes environ.";
  const DEFAULT_ANSWER="Je n'ai pas toutes les réponses. Un conseiller peut étudier votre situation : complétez le formulaire et vous serez rappelé(e) sous 12 à 24 h.";
  const INTRO="Bonjour, je suis Léa, l'assistante virtuelle (IA) de "+CFG.nom+". Je réponds aux questions simples sur l'assurance auto, VTC et négociant automobile, puis je vous oriente vers le formulaire. Je ne remplace pas un conseiller.";
  const RULES=[
    {re:/document|piece|papier|justificatif|carte grise|kbis|releve/,tab:'auto',t:"Voici les documents utiles :\n- Particuliers (auto) : relevé d'information, carte grise, permis de conduire (recto verso).\n- Professionnels VTC : Kbis, carte professionnelle VTC, permis de conduire (recto verso), relevé d'information, carte grise, pièce d'identité (recto verso).\n- Négociants automobiles : Kbis, pièce d'identité (recto verso), certificat W garage si vous en avez un, relevé d'information.\nAucun document n'est à envoyer pour la demande de rappel."},
    {re:/rappel|delai|combien de temps/,tab:'auto',t:RAPPEL},
    {re:/attestation/,tab:'auto',t:RAPPEL},
    {re:/vtc|chauffeur|taxi/,tab:'vtc',t:"Le transport de personnes à titre onéreux exige une garantie spécifique : une assurance auto classique ne suffit pas. Nous étudions votre dossier, y compris en cas de malus ou de résiliation, pour rechercher un contrat adapté à votre activité."},
    {re:/w ?garage|negoc|achat|revente|garagiste|marchand/,tab:'neg',t:"Le certificat W garage est une immatriculation provisoire réservée aux professionnels de l'automobile (essais, présentation à un acheteur). Il ne remplace jamais l'assurance : une responsabilité civile reste obligatoire. Nous étudions l'assurance adaptée à votre activité."},
    {re:/permis|suspen|annul/,tab:'auto',motif:'Permis annulé',t:"Pendant une suspension ou après une annulation, vous ne pouvez pas conduire. Votre assureur doit être informé de la situation. À la reprise de la conduite, beaucoup d'assureurs étudient le dossier avec prudence : nous recherchons ceux qui acceptent ces profils."},
    {re:/impay|non.?paiement|cotisation/,tab:'auto',motif:'Résilié pour non-paiement',t:"Si une cotisation reste impayée, l'assureur doit vous envoyer une mise en demeure. Sans paiement, les garanties sont suspendues, puis le contrat peut être résilié. Pour vous réassurer, demandez votre relevé d'information à l'ancien assureur : il doit vous le remettre sous 15 jours."},
    {re:/refus|bct|bureau central/,tab:'auto',motif:'Plusieurs refus',t:"Si un assureur refuse de vous couvrir, vous pouvez saisir le Bureau central de tarification (BCT), qui peut imposer la garantie de responsabilité civile obligatoire. Elle ne couvre pas les dommages à votre propre véhicule. Un conseiller peut vous expliquer la démarche."},
    {re:/resili/,tab:'auto',motif:'Résilié par mon assureur',t:"Après un sinistre, l'assureur peut résilier votre contrat dans les cas prévus par le Code des assurances. Vous devez ensuite vous réassurer : un conseiller étudie votre situation et recherche une nouvelle compagnie avec vous."},
    {re:/malus|bonus|coefficient|sinistre|accident/,tab:'auto',motif:'Malus',t:"Un malus apparaît après un accident dont vous êtes responsable : votre coefficient augmente de 25 %, dans la limite de 3,50. Après deux ans sans sinistre responsable, il redescend à 1,00. Nous étudions votre dossier pour rechercher une compagnie adaptée."},
    {re:/telephon|appeler|numero|joindre|contact|horaire/,tab:'auto',t:()=>telOk?"Vous pouvez nous appeler au "+CFG.tel+(CFG.horaires.startsWith('[')?'':' ('+CFG.horaires+')')+". Vous pouvez aussi compléter le formulaire pour être rappelé(e).":"Le numéro de téléphone figure en haut de la page. Vous pouvez aussi compléter le formulaire pour être rappelé(e)."},
    {re:/prix|tarif|cout|combien|cher|gratuit|devis/,tab:'auto',t:"Nous établissons le devis après étude de votre situation : le prix dépend de votre profil, du véhicule et de la compagnie. Pour démarrer, complétez le formulaire : quelques secondes suffisent."},
    {re:/robot|humain|vraie personne|intelligence/,tab:'auto',t:"Je suis une assistante virtuelle (IA), pas une conseillère. Je donne des informations générales ; pour une étude personnalisée de votre dossier, un conseiller vous rappelle après votre demande."},
    {re:/donnee|rgpd|confidential|cookie/,tab:'auto',t:"Vos données servent uniquement à traiter votre demande. Le détail figure dans « Politique de confidentialité », en bas de la page."},
    {re:/merci|parfait|super/,tab:'auto',t:"Avec plaisir. Si vous le souhaitez, complétez le formulaire : un conseiller vous rappellera."},
    {re:/bonjour|bonsoir|salut|coucou|hello/,tab:'auto',t:"Bonjour ! Posez-moi votre question, par exemple sur le malus, la résiliation, le permis ou les documents à préparer."}
  ];
  const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  function answerFor(text){const n=norm(text);return RULES.find(r=>r.re.test(n))||null;}
  const SYS=["Tu es Léa, assistante virtuelle (IA) du site de "+CFG.nom+", conseiller du cabinet "+CFG.raison+", courtier en assurance.",
  "Réponds en français, très simplement, en 4 phrases maximum, sur un ton poli et rassurant.",
  "Tu donnes seulement des informations générales sur l'assurance auto (malus, résiliation, relevé d'information, Bureau central de tarification, permis annulé ou suspendu), l'assurance VTC et l'assurance des négociants en véhicules (achat-revente, plaque W garage : le certificat W garage ne remplace jamais l'assurance, une responsabilité civile reste obligatoire).",
  "Documents à préparer : particuliers (auto) = relevé d'information, carte grise, permis recto verso ; professionnels VTC = Kbis, carte professionnelle VTC, permis recto verso, relevé d'information, carte grise, pièce d'identité recto verso ; négociant automobile = Kbis, pièce d'identité recto verso, certificat W garage si vous en avez un, relevé d'information.",
  "Un conseiller rappelle sous 12 à 24 h après le formulaire du site ; le téléphone est le "+CFG.tel+".",
  "Une fois le dossier accepté par la compagnie et le contrat signé, l'attestation d'assurance est remise en 20 à 25 minutes environ ; tous les profils (malussés ou non) sont étudiés mais l'acceptation reste décidée par la compagnie.",
  "Règles : ne donne jamais de prix ; ne promets jamais qu'un assureur acceptera un dossier ni qu'un contrat couvre un sinistre ; ne donne pas de conseil juridique personnalisé ; ne demande aucune donnée personnelle (nom, numéro, plaque, infractions) ; n'invente rien : si tu n'es pas sûre ou si la question sort du sujet, dis-le et propose le rappel d'un conseiller.",
  "Tu n'as pas accès à Internet dans cette version. Tu es une IA : dis-le si on te le demande. Ne cite aucune autre société d'assurance ni comparateur."].join("\n");
  function add(who,text){const d=document.createElement('div');d.className='msg '+who;d.textContent=text;log.appendChild(d);log.scrollTop=log.scrollHeight;return d;}
  function goForm(tab,motif){
    toggle(false);
    select(tab||'auto');
    const m=document.getElementById('motif');
    if(m&&motif){[...m.options].forEach(o=>{if(o.text.startsWith(motif))m.value=o.value;});}
    track('chat_to_form');
    document.getElementById('devis').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
    setTimeout(()=>{const f=document.getElementById('prenom');if(f)f.focus({preventScroll:true});},600);
  }
  function addActions(tab,motif){
    const row=document.createElement('div');row.className='chat-actions';
    const f=document.createElement('button');f.type='button';f.className='btn';f.textContent='Remplir le formulaire';f.onclick=()=>goForm(tab,motif);row.appendChild(f);
    if(telOk){
      const c=document.createElement('a');c.className='btn ghost2';c.textContent='Appeler';c.href='tel:+'+CFG.telHref;
      if(!isMobile)c.onclick=e=>{e.preventDefault();showToast('Appelez-nous au '+CFG.tel+' depuis votre téléphone');};
      row.appendChild(c);
    }
    log.appendChild(row);log.scrollTop=log.scrollHeight;
  }
  function toggle(o){
    panel.hidden=!o;fab.setAttribute('aria-expanded',String(o));
    if(!o)return;
    if(!log.children.length){
      add('bot',INTRO);
      ['Je suis malussé(e)',"Mon assurance m'a résilié(e)",'Quels documents préparer ?','Comment être rappelé(e) ?'].forEach(t=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>ask(t);chips.appendChild(b);});
    }
    track('chat_open');inp.focus();
  }
  async function ask(text){
    text=(text||'').trim();if(!text||busy)return;
    chips.hidden=true;busy=true;inp.value='';add('me',text);hist.push({r:'Client',t:text});
    const out=add('bot','…');
    const rule=answerFor(text);
    if(rule){
      await new Promise(r=>setTimeout(r,450));
      const ans=typeof rule.t==='function'?rule.t():rule.t;
      out.textContent=ans;hist.push({r:'Léa',t:ans});addActions(rule.tab,rule.motif);busy=false;return;
    }
    if(sample){
      const prompt=SYS+"\n\nConversation :\n"+hist.slice(-8).map(m=>m.r+' : '+m.t).join("\n")+"\nLéa :";
      try{
        const r=await sample(prompt,{cache:false,modelTier:'quick',onText:({text})=>{out.textContent=text;log.scrollTop=log.scrollHeight;}});
        const ans=((r&&r.text)||'').trim()||DEFAULT_ANSWER;
        out.textContent=ans;hist.push({r:'Léa',t:ans});
      }catch(e){
        out.textContent=DEFAULT_ANSWER;
      }
    }else{
      await new Promise(r=>setTimeout(r,450));
      out.textContent=DEFAULT_ANSWER;
    }
    addActions('auto');busy=false;
  }
  fab.onclick=()=>toggle(panel.hidden);
  $('chatClose').onclick=()=>toggle(false);
  $('chatCall').onclick=()=>toggle(false);
  form.addEventListener('submit',e=>{e.preventDefault();ask(inp.value);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)toggle(false);});
})();
/* Titre d'accueil qui change : plusieurs formulations des mêmes situations, selon l'onglet choisi sur le téléphone */
const HEADS={
  auto:[["Malussé, résilié ou permis annulé ?","Trouvons ensemble une assurance auto."],
    ["Votre assureur a résilié votre contrat ?","Nous recherchons avec vous une nouvelle compagnie."],
    ["Un malus pèse sur votre prime ?","Nous étudions votre dossier pour identifier la solution la plus adaptée."],
    ["Permis annulé ou suspendu ?","Nous vous accompagnons pour retrouver une couverture."],
    ["Refus de plusieurs assureurs ?","Parlons-en : nous recherchons une solution avec vous."],
    ["Une demande de devis en quelques secondes.","Complétez le formulaire, nous prenons le relais."],
    ["Besoin rapide d'une attestation d'assurance ?","Une fois votre dossier accepté, comptez 20 à 25 minutes environ."]],
  vtc:[["Chauffeur VTC malussé ou résilié ?","Nous recherchons une couverture adaptée à votre activité."],
    ["Contrat VTC résilié ?","Étudions ensemble une solution pour reprendre la route."]],
  neg:[["Négociant automobile sous plaque W garage ?","Nous étudions l'assurance adaptée à votre activité."],
    ["Achat-revente de véhicules : contrat résilié ou refusé ?","Recherchons ensemble une solution."]]
};
const hl=document.getElementById('headline'),redMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let hk='auto',hi=0,hTimer=null,hPaused=false;
function paintHead(){const v=HEADS[hk][hi];hl.querySelector('.h-a').textContent=v[0];hl.querySelector('.h-b').textContent=v[1];}
function swapHead(){
  if(redMotion){paintHead();return;}
  hl.classList.add('out');
  setTimeout(()=>{paintHead();hl.classList.remove('out');hl.classList.add('in');void hl.offsetWidth;hl.classList.remove('in');},400);
}
function sizeHead(k){
  const keep=hl.innerHTML;hl.style.minHeight='';let max=0;
  HEADS[k].forEach(v=>{hl.querySelector('.h-a').textContent=v[0];hl.querySelector('.h-b').textContent=v[1];max=Math.max(max,hl.offsetHeight);});
  hl.innerHTML=keep;hl.style.minHeight=max+'px';
}
function restartHead(){clearInterval(hTimer);if(!redMotion)hTimer=setInterval(()=>{if(hPaused||document.hidden)return;hi=(hi+1)%HEADS[hk].length;swapHead();},6500);}
function setHeadline(k){
  if(!hl||!HEADS[k])return;
  if(!hl.dataset.ready){hl.dataset.ready='1';hk=k;sizeHead(k);restartHead();return;}
  if(k===hk)return;
  hk=k;hi=0;sizeHead(k);swapHead();restartHead();
}
if(hl){
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>sizeHead(hk));
  addEventListener('resize',()=>{clearTimeout(window.__hrz);window.__hrz=setTimeout(()=>sizeHead(hk),200);});
  if(matchMedia('(hover: hover)').matches){const hb=hl.parentElement;hb.addEventListener('mouseenter',()=>{hPaused=true;});hb.addEventListener('mouseleave',()=>{hPaused=false;});}
}
/* Affichage des avis clients : si aucun avis, on invite à en déposer un ; aucun faux avis n'est jamais affiché */
(function(){
  const box=document.getElementById('avisBox');if(!box)return;
  const ok=REVIEWS.filter(r=>r&&r.texte&&r.nom);
  if(!ok.length){
    const p=document.createElement('p');p.className='intro';
    p.textContent="Votre avis compte. Partagez votre expérience avec "+CFG.nom+" : il aide d'autres conducteurs à choisir en confiance.";
    box.appendChild(p);
    const href=CFG.avisUrl||(CFG.email.startsWith('[')?'':'mailto:'+CFG.email+'?subject='+encodeURIComponent('Mon avis'));
    if(href){const a=document.createElement('a');a.className='btn';a.textContent='Laisser un avis';a.href=href;if(CFG.avisUrl){a.target='_blank';a.rel='noopener';}box.appendChild(a);}
    return;
  }
  const avg=ok.reduce((t,r)=>t+(+r.note||0),0)/ok.length;
  const sum=document.createElement('p');sum.className='intro';
  sum.textContent='Note moyenne : '+avg.toFixed(1).replace('.',',')+' sur 5, sur '+ok.length+' avis.';
  const grid=document.createElement('div');grid.className='avis-grid';
  ok.forEach(r=>{
    const c=document.createElement('article');c.className='avis';
    const n=Math.max(0,Math.min(5,Math.round(+r.note||0)));
    const st=document.createElement('div');st.className='stars';st.textContent='★'.repeat(n)+'☆'.repeat(5-n);st.setAttribute('role','img');st.setAttribute('aria-label','Note : '+n+' sur 5');
    const t=document.createElement('p');t.textContent=r.texte;
    const m=document.createElement('small');
    const d=r.date?new Date(r.date):null;
    m.textContent=r.nom+(d&&!isNaN(d)?' – '+d.toLocaleDateString('fr-FR',{month:'long',year:'numeric'}):'')+(r.verifie?' – Avis vérifié':'');
    c.append(st,t,m);grid.appendChild(c);
  });
  const note=document.createElement('p');note.className='fine';
  const todo=document.createElement('span');todo.className='todo';todo.textContent="[À COMPLÉTER : avis vérifiés ou non, date de l'expérience, absence de contrepartie]";
  note.append('Informations sur les avis : ',todo);
  box.append(sum,grid,note);
})();
function showThanks(prenom,tel){
  document.getElementById('thName').textContent=prenom;document.getElementById('thTel').textContent=tel;
  document.getElementById('f').hidden=true;document.getElementById('thanks').hidden=false;
}
document.getElementById('thAgain').addEventListener('click',()=>{
  const f=document.getElementById('f');f.reset();f.hidden=false;document.getElementById('thanks').hidden=true;
  const b=f.querySelector('button[type=submit]');b.disabled=false;document.getElementById('msg').textContent='';
});
select('auto');
