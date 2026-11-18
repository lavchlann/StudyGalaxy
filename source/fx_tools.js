
/* =====================================================================
   FEATURES: tools (bar, search, focus, settings, sound, planner,
   formula sheets, notes, recap, mistake nebula, sky events, camera)
   ===================================================================== */
const IC={
  star:'<svg viewBox="0 0 24 24"><path d="M12 2l1.8 6.6L20.5 10l-6.7 1.6L12 18l-1.8-6.4L3.5 10l6.7-1.4z"/><circle cx="18.5" cy="18.5" r="2.6" fill="none"/><path d="M20.4 20.4l2 2"/></svg>',
  timer:'<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9 2h6"/></svg>',
  cards:'<svg viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="15" rx="2"/><path d="M8 3h11a2 2 0 0 1 2 2v13"/></svg>',
  trophy:'<svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M9 17h6"/></svg>',
  cal:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  snd:'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
  mute:'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
  gear:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></svg>',
  bm:'<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  note:'<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>'};
/* ---- top bar ---- */
function fxBar(){
  if(document.getElementById('fxbar'))return;const d=document.createElement('div');d.id='fxbar';
  d.innerHTML='<button class="fxb star" data-fx="search" title="Search (Ctrl+K)" aria-label="Search">'+IC.star+'</button>'+
    '<button class="fxb wide" id="fx-ft" data-fx="focus" title="Focus timer">'+IC.timer+'<span>Focus</span></button>'+
    '<button class="fxb" data-fx="cards" title="Flashcards" aria-label="Flashcards">'+IC.cards+'</button>'+
    '<button class="fxb" data-fx="trophy" title="Trophies and challenges" aria-label="Trophies">'+IC.trophy+'</button>'+
    '<button class="fxb" data-fx="plan" title="Exam countdown and study plan" aria-label="Exam planner">'+IC.cal+'</button>'+
    '<button class="fxb" id="fx-snd" data-fx="sound" title="Ambient sound" aria-label="Ambient sound">'+(S.set.sound?IC.snd:IC.mute)+'</button>'+
    '<button class="fxb" data-fx="settings" title="Settings" aria-label="Settings">'+IC.gear+'</button>';
  const lb=document.getElementById('legBtn');lb.parentNode.insertBefore(d,lb);
}
/* ---- event wiring ---- */
let NOTEOPEN={},FT={ph:'idle'};
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-fx]');if(!b)return;
  if(b.closest('#fxov')||b.closest('#fxbar')||b.closest('#panel')||b.closest('#today')||b.closest('#chips')||b.closest('#fx-pop')||b.closest('#fx-search'))fxAct(b.dataset.fx,b.dataset.v,b,e);
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset.fxi){const k=t.dataset.fxi;
    if(k==='type')FC.sc.types[t.value]=t.checked?1:0;
    else if(k==='mode')FC.mode=t.value;else if(k==='size')FC.size=+t.value;else if(k==='addch')FC.addch=t.value;
    else{FC.sc[k]=t.value;if(k==='s'){FC.sc.ch='all';FC.sc.topic='all';}if(k==='u'){FC.sc.ch='all';FC.sc.topic='all';}if(k==='ch')FC.sc.topic='all';}
    FC.stars=null;fxRerender();return;}
  if(t.dataset.fxs){const k=t.dataset.fxs;let v=t.type==='checkbox'?t.checked:t.value;if(k==='vol')v=(+v)/100;if(k==='daily')v=Math.max(.25,Math.min(12,+v||1.5));S.set[k]=v;fxApplySettings();fxDirty();if(k!=='vol')renderPanel();return;}
  if(t.dataset.fxd){const sid=t.dataset.fxd,o=S.dates[sid]||(S.dates[sid]={});if(t.type==='checkbox')o.approx=t.checked;else o.date=t.value;if(!o.date&&!o.approx)delete S.dates[sid];fxDirty();renderPanel();chrome();setTimeout(fxCheckAll,50);return;}
});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.dataset&&t.dataset.fxnote){S.notes[t.dataset.fxnote]=t.value;clearTimeout(window.__nt);window.__nt=setTimeout(fxDirty,800);}
  if(t.id==='fx-q')fxSearchRender(t.value);
  if(t.dataset&&t.dataset.fxs==='vol'){S.set.vol=(+t.value)/100;fxSoundApply();}
});
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();fxSearch();return;}
  if(e.key==='Escape'){if(document.getElementById('fx-search')){fxSearchClose();return;}if(FXOVER){fxCloseOverlay();return;}const p=document.getElementById('fx-pop');if(p){p.remove();return;}}
  if(e.key==='Enter'&&document.getElementById('fx-search')){const f=document.querySelector('#fx-res [data-fx="res"]');if(f){e.preventDefault();f.click();}}
});
function fxAct(a,v,b,e){
  switch(a){
    case'close':if(FXOVER)fxCloseOverlay();break;
    case'search':fxSearch();break;
    case'res':{const r=(window.__res||[])[+v];fxSearchClose();if(r)setTimeout(r.go,30);break;}
    case'focus':fxFocusPop();break;
    case'focusgo':{const p=v.split('-').map(Number);fxFocusStart(p[0],p[1]);break;}
    case'focusstop':fxFocusStop();break;
    case'focusmode':document.body.classList.toggle('fx-focus');const fp=document.getElementById('fx-pop');if(fp)fp.remove();break;
    case'cards':fxCards();break;
    case'cards-here':fxCards({sc:{s:V.subj||'all',u:V.unit||'all',ch:'all',topic:'all'}});break;
    case'quick':fxCards({quick:1,sc:{s:V.view==='subject'?V.subj:'all',u:'all',ch:'all',topic:'all'}});break;
    case'quickgo':fxStartCards({quick:1});break;
    case'fcgo':case'fcagain':fxStartCards();break;
    case'fcsetup':FC.phase='setup';fxRerender();break;
    case'fcadd':FC.adding=!FC.adding;fxRerender();break;
    case'fcsave':{const f=document.getElementById('fc-af').value.trim(),bk=document.getElementById('fc-ab').value.trim(),tp=document.getElementById('fc-at').value.trim()||'My cards',ch=FC.addch||document.querySelector('[data-fxi="addch"]').value,fc=findCh(ch);
      if(!f||!bk){toast('Write both sides of the card.');return;}S.cards.push({id:'U|'+Date.now().toString(36),s:fc?fc.s.id:'',u:fc?fc.u:'3',ch:ch,topic:tp,f:f,b:bk});CARDS=null;FC.adding=false;FC.stars=null;fxDirty();toast('Card saved.');fxRerender();break;}
    case'flip':if(FC.phase==='run'){FC.flip=!FC.flip;const c=document.querySelector('.fc-card');if(c){c.classList.toggle('flip',FC.flip);document.querySelector('.fc-rate').classList.toggle('on',FC.flip);document.querySelectorAll('.fc-rate button').forEach(x=>x.disabled=!FC.flip);}}break;
    case'rate':if(FC.flip)fxRate(+v);break;
    case'fcend':fxEndCards();break;
    case'trophy':fxTrophies();break;
    case'ach':fxAchDetail(v);break;
    case'plan':fxPanel({k:'plan'});break;
    case'settings':fxPanel({k:'settings'});break;
    case'saved':fxPanel({k:'saved'});break;
    case'recap':fxPanel({k:'recap'});break;
    case'recapx':S.recap.shown=fxPrevWeek();fxDirty();chrome();break;
    case'formula':S.flags.formula=1;fxPanel({k:'formula',s:v||(V.view==='subject'?V.subj:(VS()[0]||{}).id)});setTimeout(fxCheckAll,50);break;
    case'print':window.print();break;
    case'fsheetcards':FC.sc={s:v,u:'F',ch:'all',topic:'all',types:{q:0,key:0,ex:0,trap:0,formula:1,mine:0}};fxCards();break;
    case'sound':S.set.sound=!S.set.sound;if(S.set.sound)fxSoundStart();else fxSoundApply();const sb=document.getElementById('fx-snd');if(sb)sb.innerHTML=S.set.sound?IC.snd:IC.mute;fxDirty();break;
    case'bm':if(S.bm[v])delete S.bm[v];else S.bm[v]=Date.now();fxDirty();renderPanel();break;
    case'note':NOTEOPEN[v]=!NOTEOPEN[v];renderPanel();setTimeout(()=>{const t=document.querySelector('[data-fxnote="'+v+'"]');if(t)t.focus();},60);break;
    case'opensec':{const p=v.split('|');fxOpenSection(p[0],+p[1]);break;}
    case'mg':fxMistakeGalaxy();break;
    case'mgsel':MG.sel=v;fxRerender();break;
    case'retry':{const m=S.mistakes.find(x=>x.id===v);if(m)fxRetry([m]);break;}
    case'retryall':fxRetry(S.mistakes.filter(m=>m.ch===v&&m.rights.length<2));break;
    default:fxWebAct(a,v,b,e);
  }
}
/* ---- panel views ---- */
function fxPanel(o){flushSave();endSess();V.sel=null;V.add=false;V.insights=false;V.exam=false;V.hidden=false;V.fx=o;RESET=true;renderPanel();chrome();}
function fxTop(eb,t){return'<div class="top"><div><p class="eyebrow">'+eb+'</p><h2>'+t+'</h2></div><span class="pbtns"><button class="x" data-act="wide" title="Wide reading view" aria-label="Wide reading view">⤢</button><button class="x" data-act="close" aria-label="Close">×</button></span></div>';}
function fxPanelHTML(){
  const o=V.fx;
  if(o.k==='formula')return fxFormulaHTML(o);
  if(o.k==='plan')return fxPlanHTML();
  if(o.k==='settings')return fxSettingsHTML();
  if(o.k==='saved')return fxSavedHTML();
  if(o.k==='recap')return fxRecapHTML();
  return'';
}
/* formula sheets */
const FBOOK={mm:'Mathematical Methods 2025 formula book',ms:'Specialist Mathematics 2025 formula book',ph:'Physics 2025 formula and data book'};
function fxFormulaHTML(o){
  const sids=Object.keys(FORMULAS).filter(k=>subj(k)&&!subj(k).hidden),sid=FORMULAS[o.s]?o.s:sids[0];if(!sid)return fxTop('Formula sheet','No sheet yet')+'<p class="muted">Formula sheets appear here once a subject has one.</p>';
  let h=fxTop('Official formula sheet',esc(subj(sid).name))+'<div class="tabs fx-ftabs">'+sids.map(k=>'<button role="tab" aria-selected="'+(k===sid)+'" data-fx="formula" data-v="'+k+'">'+esc(subj(k).name)+'</button>').join('')+'</div>';
  h+='<div class="row"><button class="btn ghost sm" data-fx="print">Print this sheet</button><button class="btn ghost sm" data-fx="fsheetcards" data-v="'+sid+'">Flashcards from this sheet</button></div><div class="fx-fsheet" id="fx-fsheet">';
  FORMULAS[sid].forEach((sec,si)=>{h+='<h4 class="eyebrow">'+esc(sec[0])+'</h4><table class="fx-ftab">'+sec[1].map((r,ri)=>'<tr id="fr-'+si+'-'+ri+'" class="'+(o.hl===si+'-'+ri?'hl':'')+'"><td>'+esc(r[0])+'</td><td>$$'+esc(r[1])+'$$</td></tr>').join('')+'</table>';});
  h+='</div><p class="sub fx-attr">Transcribed from the QCAA '+esc(FBOOK[sid]||'formula book')+'. © State of Queensland (QCAA) 2025, licensed under CC BY 4.0 (creativecommons.org/licenses/by/4.0). Check against your printed copy in the exam.'+(sid==='ph'?' The data book’s list of elements and periodic table are not reproduced here.':'')+'</p>';
  if(o.hl)setTimeout(()=>{const r=document.getElementById('fr-'+o.hl);if(r)r.scrollIntoView({block:'center'});},500);
  return h;
}
/* settings */
const ACC={gold:['#c9b38a','#e8c98a','#f6dfae'],silver:['#c8ccd6','#d7dbe4','#eef0f5'],ice:['#9fc0f0','#a9c8f2','#d6e6ff'],rose:['#d7a1a8','#e2b3b9','#f3d5d9'],mint:['#9fd0b8','#ade0c6','#d8f2e5']};
function fxAcc(){return ACC[S.set.accent]||ACC.gold;}
function fxApplySettings(){
  const r=document.documentElement;r.dataset.text=S.set.text;r.dataset.width=S.set.width;r.dataset.motion=S.set.motion;
  const a=fxAcc();r.style.setProperty('--gold',a[0]);r.style.setProperty('--goldhi',a[2]);fxSoundApply();
}
function fxSeg(k,val,opts){return'<div class="tabs fx-seg">'+opts.map(o=>'<label><input type="radio" name="fxs-'+k+'" data-fxs="'+k+'" value="'+o[0]+'"'+(String(val)===String(o[0])?' checked':'')+'><span>'+o[1]+'</span></label>').join('')+'</div>';}
function fxSettingsHTML(){
  const st=S.set;
  return fxTop('Make it yours','Settings')+'<div class="fx-set">'+
    '<div><b>Text size</b>'+fxSeg('text',st.text,[['s','Small'],['m','Medium'],['l','Large'],['xl','Extra large']])+'</div>'+
    '<div><b>Reading width</b><span class="muted">For the wide reading view.</span>'+fxSeg('width',st.width,[['narrow','Narrow'],['normal','Normal'],['wide','Wide']])+'</div>'+
    '<div><b>Motion</b><span class="muted">Calm turns off the drifting symbols and shooting stars. Minimal also stills the map (applies next time you open the page).</span>'+fxSeg('motion',st.motion,[['full','Full'],['calm','Calm'],['minimal','Minimal']])+'</div>'+
    '<div><b>Accent colour</b><div class="fx-sw">'+Object.keys(ACC).map(k=>'<label title="'+k+'"><input type="radio" name="fxs-acc" data-fxs="accent" value="'+k+'"'+(st.accent===k?' checked':'')+'><i style="--c:'+ACC[k][1]+'"></i></label>').join('')+'</div></div>'+
    '<div><b>Ambient sound</b><span class="muted">A soft generated space hum, plus gentle chimes for timers and achievements.</span><label class="chk"><input type="checkbox" data-fxs="sound"'+(st.sound?' checked':'')+'> Sound on</label><label class="fx-vol">Volume <input type="range" min="0" max="100" step="1" value="'+Math.round(st.vol*100)+'" data-fxs="vol"></label></div>'+
    '<div><b>Opening quote</b><label class="chk"><input type="checkbox" data-fxs="quote"'+(st.quote!==false?' checked':'')+'> Show a quote when the page opens</label></div>'+
    '<div><b>Daily study time</b><span class="muted">Used by the exam planner.</span><label class="fx-vol"><input type="number" min="0.25" max="12" step="0.25" value="'+st.daily+'" data-fxs="daily" style="width:90px"> hours a day</label></div>'+
    fxSafeHTML()+fxWebSettingsHTML()+'</div>';
}
/* ---- ambient sound ---- */
let AU=null;
function fxAudio(){
  if(AU)return AU;const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
  try{const ac=new C(),master=ac.createGain();master.gain.value=0;master.connect(ac.destination);
    const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=380;lp.connect(master);
    [55,82.41,110.6].forEach((f,i)=>{const o=ac.createOscillator();o.type=i===2?'triangle':'sine';o.frequency.value=f;o.detune.value=(i-1)*7;const g=ac.createGain();g.gain.value=i===2?.04:.16;
      const l=ac.createOscillator();l.frequency.value=.04+i*.027;const lg=ac.createGain();lg.gain.value=.05;l.connect(lg);lg.connect(g.gain);l.start();o.connect(g);g.connect(lp);o.start();});
    const buf=ac.createBuffer(1,ac.sampleRate*4,ac.sampleRate),d=buf.getChannelData(0);let last=0;for(let i=0;i<d.length;i++){last=(last+.02*(Math.random()*2-1))/1.02;d[i]=last*3.2;}
    const ns=ac.createBufferSource();ns.buffer=buf;ns.loop=true;const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=480;bp.Q.value=.6;const ng=ac.createGain();ng.gain.value=.22;
    const l2=ac.createOscillator();l2.frequency.value=.06;const l2g=ac.createGain();l2g.gain.value=220;l2.connect(l2g);l2g.connect(bp.frequency);l2.start();ns.connect(bp);bp.connect(ng);ng.connect(master);ns.start();
    const fxg=ac.createGain();fxg.gain.value=.3;fxg.connect(ac.destination);AU={ac:ac,master:master,fxg:fxg};}catch(e){AU=null;}
  return AU;
}
function fxSoundApply(){if(!AU)return;const v=S.set.sound?S.set.vol*.55:0;try{AU.master.gain.setTargetAtTime(v,AU.ac.currentTime,.9);AU.fxg.gain.value=S.set.vol*.7;}catch(e){}}
function fxSoundStart(){const a=fxAudio();if(!a)return;if(a.ac.state==='suspended')a.ac.resume();fxSoundApply();}
addEventListener('pointerdown',()=>{if(S.set.sound)fxSoundStart();},{once:true,capture:true});
function fxChime(level){
  if(!S.set.sound||!(S.set.vol>0))return;const a=fxAudio();if(!a||a.ac.state!=='running')return;const t=a.ac.currentTime;
  const notes=level>=3?[523.25,659.25,783.99,1046.5]:level===2?[659.25,987.77]:[880];
  notes.forEach((f,i)=>{const o=a.ac.createOscillator();o.type='sine';o.frequency.value=f;const g=a.ac.createGain();g.gain.setValueAtTime(0,t+i*.1);g.gain.linearRampToValueAtTime(.14,t+i*.1+.02);g.gain.exponentialRampToValueAtTime(.0001,t+i*.1+1.8);o.connect(g);g.connect(a.fxg);o.start(t+i*.1);o.stop(t+i*.1+1.9);});
}
/* ---- focus timer ---- */
function fxFocusPop(){
  const old=document.getElementById('fx-pop');if(old){old.remove();return;}
  const b=document.getElementById('fx-ft'),r=b.getBoundingClientRect(),p=document.createElement('div');p.id='fx-pop';p.style.left=Math.min(innerWidth-280,r.left)+'px';p.style.top=(r.bottom+8)+'px';
  p.innerHTML=FT.ph==='idle'?'<p class="eyebrow">Focus timer</p><button data-fx="focusgo" data-v="25-5">25 min focus · 5 break</button><button data-fx="focusgo" data-v="50-10">50 min focus · 10 break</button><button data-fx="focusgo" data-v="90-15">90 min focus · 15 break</button><label class="chk"><input type="checkbox" '+(document.body.classList.contains('fx-focus')?'checked':'')+' onchange="document.body.classList.toggle(\'fx-focus\',this.checked)"> Dim everything but the lesson</label>':
    '<p class="eyebrow">'+(FT.ph==='work'?'Focusing':'On a break')+'</p><button data-fx="focusstop">Stop timer</button><button data-fx="focusmode">'+(document.body.classList.contains('fx-focus')?'Turn off dim mode':'Dim everything but the lesson')+'</button>';
  document.body.appendChild(p);setTimeout(()=>addEventListener('pointerdown',function h(e){if(!p.contains(e.target)&&!e.target.closest('#fx-ft')){p.remove();removeEventListener('pointerdown',h);}}),10);
}
function fxFocusStart(w,br){const p=document.getElementById('fx-pop');if(p)p.remove();FT={ph:'work',end:Date.now()+w*60e3,dur:w*60e3,w:w,br:br};document.body.classList.add('fx-focus');fxFocusTick();toast('Focus started: '+w+' minutes. Everything but the lesson is dimmed.');}
function fxFocusStop(){const p=document.getElementById('fx-pop');if(p)p.remove();FT={ph:'idle'};document.body.classList.remove('fx-focus');fxFocusTick();}
function fxFocusTick(){
  const b=document.getElementById('fx-ft');if(!b)return;
  if(FT.ph==='idle'){b.classList.remove('run','brk');b.style.removeProperty('--p');b.querySelector('span').textContent='Focus';return;}
  const left=FT.end-Date.now();
  if(left<=0){if(FT.ph==='work'){S.cnt.focus=(S.cnt.focus||0)+1;fxDay().focus++;fxGain(10);fxDirty();fxChime(2);toast('Focus session done. Take a '+FT.br+' minute break.');FT={ph:'break',end:Date.now()+FT.br*60e3,dur:FT.br*60e3,w:FT.w,br:FT.br};document.body.classList.remove('fx-focus');fxCheckAll();}
    else{fxChime(1);toast('Break over. Ready for another round?');FT={ph:'idle'};}return fxFocusTick();}
  b.classList.toggle('run',FT.ph==='work');b.classList.toggle('brk',FT.ph==='break');b.style.setProperty('--p',Math.round((1-left/FT.dur)*100));b.querySelector('span').textContent=fxMMSS(left);
}
setInterval(fxFocusTick,1000);
/* ---- search ---- */
function fxIndex(){
  const out=[];
  VS().forEach(s=>UNITS.forEach(u=>chaptersOf(s,u).forEach((c,i)=>{
    out.push({k:'Chapter',t:c.title,sub:s.name+' · Unit '+u+' · Chapter '+numOf(c,i),go:()=>openChapter(c.id)});
    const ct=CT[c.id];if(ct)ct.sections.forEach((sec,si)=>out.push({k:'Section',t:(sec.code==='X'?'':sec.code+' ')+sec.title,sub:s.name+' · '+c.title,x:sec.blocks.map(b=>(b.x||'')+' '+(b.q||'')+' '+(b.title||'')).join(' ').slice(0,600),go:()=>fxOpenSection(c.id,si)}));
  })));
  Object.keys(FORMULAS).forEach(sid=>{const s=subj(sid);if(!s||s.hidden)return;FORMULAS[sid].forEach((sec,si)=>sec[1].forEach((r,ri)=>out.push({k:'Formula',t:r[0],sub:s.name+' formula sheet · '+sec[0],tex:r[1],go:()=>{S.flags.formula=1;fxPanel({k:'formula',s:sid,hl:si+'-'+ri});}})));});
  Object.keys(S.notes).forEach(key=>{const v=S.notes[key];if(!v||!v.trim())return;const p=key.split('|'),f=findCh(p[0]),ct=CT[p[0]];if(!f||!ct)return;const si=ct.sections.findIndex(x=>x.id===p[1]);out.push({k:'Note',t:v.slice(0,80),sub:f.ch.title+(si>=0?' · '+ct.sections[si].title:''),go:()=>fxOpenSection(p[0],Math.max(0,si))});});
  return out;
}
function fxSearch(){
  if(document.getElementById('fx-search'))return;const el=document.createElement('div');el.id='fx-search';
  el.innerHTML='<div class="fx-sbox"><div class="fx-sin">'+IC.star+'<input id="fx-q" type="text" placeholder="Search chapters, sections, formulas and notes" autocomplete="off"><kbd>Esc</kbd></div><div id="fx-res"></div></div>';
  el.addEventListener('pointerdown',e=>{if(e.target===el)fxSearchClose();});document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('open'));
  window.__idx=fxIndex();fxSearchRender('');setTimeout(()=>document.getElementById('fx-q').focus(),30);
}
function fxSearchClose(){const el=document.getElementById('fx-search');if(el){el.classList.remove('open');setTimeout(()=>el.remove(),250);}}
function fxSearchRender(q){
  const box=document.getElementById('fx-res');if(!box)return;q=q.trim().toLowerCase();
  if(!q){box.innerHTML='<p class="muted fx-sh">Try “chain rule”, “projectile”, “Coulomb” or “binomial”.</p>';window.__res=[];return;}
  const toks=q.split(/\s+/);const sc=window.__idx.map(r=>{const t=r.t.toLowerCase(),all=(t+' '+r.sub+' '+(r.x||'')).toLowerCase();if(!toks.every(k=>all.includes(k)))return null;let s=0;toks.forEach(k=>{if(t.includes(k))s+=3;if(t.startsWith(k))s+=2;});s+={Chapter:3,Section:2,Formula:2,Note:1}[r.k];return[s,r];}).filter(Boolean).sort((a,b)=>b[0]-a[0]).slice(0,30).map(x=>x[1]);
  window.__res=sc;
  box.innerHTML=sc.length?sc.map((r,i)=>'<button data-fx="res" data-v="'+i+'"><span class="k">'+r.k+'</span><span class="b"><b>'+esc(r.t)+'</b><small>'+esc(r.sub)+'</small>'+(r.tex?'<em>$'+esc(r.tex)+'$</em>':'')+'</span></button>').join(''):'<p class="muted fx-sh">Nothing matches that yet.</p>';
  fxTypeset(box);
}
function fxOpenSection(cid,si){if(FXOVER)fxCloseOverlay();openChapter(cid);const c=findCh(cid),ct=CT[cid];if(!c||!ct)return;sess={kind:'read',ch:c,phase:'read',tab:'lesson',sec:si,qa:[],text:'',abort:new AbortController()};RESET=true;renderPanel();}
/* ---- bookmarks and notes inside lessons ---- */
function fxSecTools(cid,sec){
  const k=cid+'|'+sec.id,on=!!S.bm[k],nt=S.notes[k],open=NOTEOPEN[k]||(nt&&nt.trim());
  return'<div class="fx-sectools"><button class="fxt'+(on?' on':'')+'" data-fx="bm" data-v="'+k+'" title="'+(on?'Remove bookmark':'Bookmark this section')+'">'+IC.bm+'</button><button class="fxt'+(open?' on':'')+'" data-fx="note" data-v="'+k+'" title="Your notes">'+IC.note+'</button>'+((Object.keys(S.bm).length||Object.values(S.notes).some(x=>x&&x.trim()))?'<button class="fxt txt" data-fx="saved">Saved</button>':'')+'</div>'+
    (open?'<textarea class="fx-note" data-fxnote="'+k+'" rows="3" placeholder="Your notes for this section. They save automatically.">'+esc(nt||'')+'</textarea>':'');
}
function fxSavedHTML(){
  const keys=[...new Set(Object.keys(S.bm).concat(Object.keys(S.notes).filter(k=>S.notes[k]&&S.notes[k].trim())))];
  const rows=keys.map(k=>{const p=k.split('|'),f=findCh(p[0]),ct=CT[p[0]];if(!f||!ct)return'';const si=ct.sections.findIndex(x=>x.id===p[1]);if(si<0)return'';const sec=ct.sections[si];
    return'<button class="wk" data-fx="opensec" data-v="'+p[0]+'|'+si+'"><div><b>'+(S.bm[k]?'★ ':'')+esc((sec.code==='X'?'':sec.code+' ')+sec.title)+'</b><span>'+esc(f.s.name+' · '+f.ch.title)+(S.notes[k]&&S.notes[k].trim()?' · “'+esc(S.notes[k].slice(0,90))+'”':'')+'</span></div></button>';}).join('');
  return fxTop('Bookmarks and notes','Saved')+(rows||'<p class="muted">Use the bookmark and pencil buttons at the top of any lesson section to save it here.</p>');
}
/* ---- exam countdown and planner ---- */
function fxDaysTo(sid){const o=S.dates[sid];if(!o||!o.date)return null;return Math.ceil((new Date(o.date+'T09:00:00').getTime()-Date.now())/DAY);}
function fxChDone(c){const st=effStatus(c.id);if(st==='solid')return 1;if(st==='revise'||st==='due')return .7;const ct=CT[c.id];if(!ct)return 0;const n=Object.keys((S.progress[c.id]||{}).secs||{}).length;return st==='learning'?.25+.45*n/ct.sections.length:.4*n/ct.sections.length;}
function fxPlan(){
  const subs=VS().filter(s=>fxDaysTo(s.id)!=null&&fxDaysTo(s.id)>0).sort((a,b)=>fxDaysTo(a.id)-fxDaysTo(b.id));
  const Q=subs.map(s=>{const D=fxDaysTo(s.id),rev=D>10?Math.max(2,Math.round(D*.15)):Math.min(2,Math.max(0,D-1));
    const tasks=allChapters(s).filter(c=>CT[c.id]).map(c=>({s:s,c:c,h:Math.max(0,(CT[c.id].hours||3)*(1-fxChDone(c)))})).filter(t=>t.h>.05);
    return{s:s,D:D,rev:rev,tasks:tasks,H:tasks.reduce((a,t)=>a+t.h,0)};});
  const days=[],B=S.set.daily||1.5;
  for(let k=0;k<14;k++){const day={k:k,items:[]};let budget=B;
    Q.forEach(q=>{if(k>=q.D)return;if(k>=q.D-q.rev&&budget>0){const h=Math.min(budget,Math.max(.5,B/Math.max(1,Q.filter(x=>k<x.D).length)));day.items.push({t:'Revision for '+q.s.name+': flashcards, weak spots and the unit exam station',h:h,s:q.s});budget-=h;}});
    for(const q of Q){if(budget<=.05)break;if(k>=q.D-q.rev)continue;while(budget>.05&&q.tasks.length){const t=q.tasks[0],h=Math.min(budget,t.h);day.items.push({t:t.c.title,h:h,s:q.s,c:t.c});t.h-=h;budget-=h;if(t.h<=.05)q.tasks.shift();}}
    days.push(day);}
  return{Q:Q,days:days,B:B};
}
function fxPlanHTML(){
  const subs=VS(),P=fxPlan();
  let h=fxTop('Exam countdown and study plan','Planner')+'<p class="muted">Set each exam date. If you are not sure yet, pick your best guess and tick “estimate”; you can change it any time.</p><div class="fx-dates">'+
    subs.map(s=>{const o=S.dates[s.id]||{},d=fxDaysTo(s.id);return'<div style="--c:'+s.hue+'"><b>'+esc(s.name)+'</b><input type="date" data-fxd="'+s.id+'" value="'+(o.date||'')+'"><label class="chk"><input type="checkbox" data-fxd="'+s.id+'"'+(o.approx?' checked':'')+'> estimate</label><span class="'+(d!=null&&d<=14?'near':'')+'">'+(d==null?'no date':d<=0?'done':d+' day'+(d===1?'':'s')+(o.approx?' (est.)':''))+'</span></div>';}).join('')+'</div>';
  if(!P.Q.length)return h+'<p class="sub">Once a date is set, a 14-day plan appears here, built from your unfinished chapters and about '+P.B+' hours of study a day (change it in Settings).</p>';
  const need=P.Q.map(q=>({q:q,per:q.H/Math.max(1,q.D-q.rev)}));const tot=need.reduce((a,x)=>a+x.per,0);
  h+='<div class="stats">'+need.map(x=>'<div><b>'+x.q.H.toFixed(1)+' h</b><span>'+esc(x.q.s.name)+' left · '+x.per.toFixed(1)+' h a day needed</span></div>').join('')+'<div><b>'+(tot<=P.B+.01?'On track':'Behind')+'</b><span>'+tot.toFixed(1)+' h a day needed vs '+P.B+' h planned</span></div></div>';
  h+='<h4 class="eyebrow">Next 14 days</h4><div class="fx-plan">'+P.days.map(d=>{const dt=new Date(Date.now()+d.k*DAY);return'<div><p>'+(d.k===0?'Today':d.k===1?'Tomorrow':dt.toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'}))+'</p>'+(d.items.length?d.items.map(it=>'<span style="--c:'+it.s.hue+'"'+(it.c?' data-today="'+it.s.id+'|'+it.c.id+'"':'')+'><i></i>'+esc(it.t)+' · '+it.h.toFixed(1)+' h</span>').join(''):'<span class="muted">Free day</span>')+'</div>';}).join('')+'</div>';
  return h;
}
/* the approaching exam: a dark body drifting toward its constellation */
function fxThreat(s,x,y,R,t){
  const d=fxDaysTo(s.id);if(d==null||d<0||d>90)return;
  const f=Math.max(0,Math.min(1,d/60)),ang=(hashS(s.id)%628)/100,dist=R*.9+f*Math.max(W,H)*.42,bx=x+Math.cos(ang)*dist,by=y+Math.sin(ang)*dist,sz=5+(1-f)*15;
  const near=d<=14,pulse=REDUCE?.5:.5+.5*Math.sin(t*(near?.004:.0015));
  ctx.save();
  const tr2=ctx.createLinearGradient(bx,by,bx+Math.cos(ang)*sz*9,by+Math.sin(ang)*sz*9);tr2.addColorStop(0,'rgba(150,90,90,'+(.12+.1*(1-f))+')');tr2.addColorStop(1,'rgba(150,90,90,0)');
  ctx.strokeStyle=tr2;ctx.lineWidth=sz*.9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+Math.cos(ang)*sz*9,by+Math.sin(ang)*sz*9);ctx.stroke();
  const rim=ctx.createRadialGradient(bx,by,sz*.6,bx,by,sz*(1.6+.5*pulse*(near?1:.3)));rim.addColorStop(0,'rgba(201,133,133,'+(.25+.45*(1-f))+')');rim.addColorStop(1,'rgba(201,133,133,0)');ctx.fillStyle=rim;ctx.beginPath();ctx.arc(bx,by,sz*2.2,0,6.283);ctx.fill();
  const body=ctx.createRadialGradient(bx-sz*.35,by-sz*.35,sz*.1,bx,by,sz);body.addColorStop(0,'#2a2224');body.addColorStop(1,'#060507');ctx.fillStyle=body;ctx.beginPath();ctx.arc(bx,by,sz,0,6.283);ctx.fill();
  if(d<=7){const hz=ctx.createRadialGradient(x,y,0,x,y,R*1.4);hz.addColorStop(0,'rgba(140,40,40,'+(.04+.05*pulse)+')');hz.addColorStop(1,'rgba(140,40,40,0)');ctx.fillStyle=hz;ctx.beginPath();ctx.arc(x,y,R*1.4,0,6.283);ctx.fill();}
  ctx.globalAlpha=.65;text((d===0?'EXAM TODAY':d+' DAY'+(d===1?'':'S')),bx,by+sz+16,'500 9.5px "Geist",system-ui,sans-serif',near?'rgba(220,150,150,.95)':'rgba(170,150,150,.8)','center','1.5px',true);
  ctx.restore();
}
/* ---- weekly recap ---- */
function fxPrevWeek(){return fxWeekKey(Date.now()-7*DAY);}
function fxWeekStats(wk){const days=fxWeekDays(wk),set=new Set(days);const sec=fxSecsOn(days);
  const st={hours:days.reduce((a,k)=>a+((S.time||{})[k]||0),0)/3600,days:days.filter(k=>((S.time||{})[k]||0)>=300).length,sec:sec,fc:days.reduce((a,k)=>a+((S.daily[k]||{}).fc||0),0),q:days.reduce((a,k)=>a+((S.daily[k]||{}).q||0),0),xp:days.reduce((a,k)=>a+((S.daily[k]||{}).xp||0),0),
    solid:S.log.filter(e=>e.after==='solid'&&e.before!=='solid'&&set.has(dayKey(e.t))).length};
  let best=null,bv=0;days.forEach(k=>{const v=(S.time||{})[k]||0;if(v>bv){bv=v;best=k;}});st.best=best;st.bestH=bv/3600;return st;}
function fxRecapDue(){const pw=fxPrevWeek();if(S.recap.shown===pw)return false;const st=fxWeekStats(pw);return st.hours>.2||st.fc>0||st.q>0;}
function fxRecapHTML(){const pw=fxPrevWeek(),st=fxWeekStats(pw),wt=weakTopics()[0];
  return fxTop('Your week in stars','Weekly recap')+'<p class="muted">Week starting '+new Date(pw+'T12:00:00').toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'})+'</p>'+
  '<div class="stats"><div><b>'+st.hours.toFixed(1)+' h</b><span>studied</span></div><div><b>'+st.days+' of 7</b><span>days studied</span></div><div><b>'+st.sec+'</b><span>sections understood</span></div><div><b>'+st.fc+'</b><span>flashcards reviewed</span></div><div><b>'+st.q+'</b><span>questions correct</span></div><div><b>'+st.solid+'</b><span>chapters turned solid</span></div></div>'+
  '<p class="sub">'+(st.best?'Your strongest day was '+new Date(st.best+'T12:00:00').toLocaleDateString('en-AU',{weekday:'long'})+' with '+st.bestH.toFixed(1)+' hours. ':'')+(wt?'Your weakest topic right now is '+esc(wt.topic)+'.':'No open weak topics.')+'</p>';}
/* ---- home: countdown, plan, quick study, challenges ---- */
function fxTodayExtra(){
  let h='<div class="tdc fx-tx">';
  const ds=VS().map(s=>[s,fxDaysTo(s.id)]).filter(x=>x[1]!=null&&x[1]>=0).sort((a,b)=>a[1]-b[1]);
  if(ds.length)h+='<div class="fx-cd">'+ds.map(x=>'<span class="'+(x[1]<=7?'red':x[1]<=21?'amber':'')+'"><b>'+x[1]+'</b><i>day'+(x[1]===1?'':'s')+'</i>'+esc(x[0].name)+'</span>').join('')+'</div>';
  else h+='<button class="btn link fx-setd" data-fx="plan">Set your exam dates for a countdown and study plan</button>';
  const P=ds.length?fxPlan():null,td=P&&P.days[0].items.filter(i=>i.c)[0];
  if(td)h+='<p class="fx-tp">Plan for today: <button class="btn link" data-today="'+td.s.id+'|'+td.c.id+'">'+esc(td.c.title)+'</button></p>';
  const dl=fxDailyList();h+='<button class="fx-dots" data-fx="trophy" title="'+esc(dl.map(c=>c.text.replace('{n}',c.n)+' ('+c.v+'/'+c.n+')').join(' · '))+'">'+dl.map(c=>'<i class="'+(c.ok?'ok':'')+'" style="--p:'+Math.round(c.v/c.n*100)+'%"></i>').join('')+'<span>Daily challenges '+dl.filter(c=>c.ok).length+'/3</span></button>';
  h+='<div class="row"><button class="btn sm" data-fx="quick">Study 15 min</button><button class="btn ghost sm" data-fx="cards">Flashcards</button><button class="btn ghost sm" data-fx="trophy">Trophies</button></div></div>';
  if(fxRecapDue()){const st=fxWeekStats(fxPrevWeek());h+='<div class="tdc fx-rc"><button class="x" data-fx="recapx" aria-label="Dismiss">×</button><p class="eyebrow">Last week</p><b>'+st.hours.toFixed(1)+' h · '+st.sec+' sections · '+st.fc+' cards</b><button class="btn link" data-fx="recap">See the recap</button></div>';}
  return h;
}
/* ---- mistake nebula: a separate galaxy for each unit ---- */
let MG={sel:null,stars:[]};
function fxMistakeGalaxy(){
  const s=V.view==='subject'?subj(V.subj):null,u=V.unit;MG={sel:null,stars:[],s:s?s.id:null,u:s?u:null};
  fxOpenOverlay('mg',fxMGHTML,{canvas:true,onOpen:fxMGLoop});
}
function fxMGList(){const ids=MG.s?new Set(chaptersOf(subj(MG.s),MG.u).map(c=>c.id)):null;return S.mistakes.filter(m=>(!ids||ids.has(m.ch))&&m.rights.length<2);}
function fxMGHTML(){
  const L=fxMGList(),title=MG.s?subj(MG.s).name+' · Unit '+MG.u:'All subjects';
  const byCh={};L.forEach(m=>{(byCh[m.ch]=byCh[m.ch]||[]).push(m);});
  let h='<div class="mg-side"><div class="fx-head"><div><p class="eyebrow">Mistake nebula · '+esc(title)+'</p><h2>'+L.length+' open mistake'+(L.length===1?'':'s')+'</h2></div><button class="x" data-fx="close" aria-label="Close">×</button></div>';
  if(!L.length)h+='<p class="muted">No open mistakes here. Each wrong answer in a checkpoint or exam becomes a red star in this nebula until you get it right on two different days.</p>';
  const m=L.find(x=>x.id===MG.sel);
  if(m){const f=findCh(m.ch);h+='<div class="mg-d"><p class="eyebrow">'+esc((f?f.ch.title:'')+' · '+(m.topic||''))+'</p><div class="mg-q">'+inl(m.q||'')+'</div><p><b>Answer:</b> '+inl(m.a||'')+'</p><p class="sub">'+esc(m.type||'method')+' error'+(m.conf===3?' · you were confident':'')+' · '+new Date(m.t).toLocaleDateString('en-AU',{day:'numeric',month:'short'})+(m.rights.length?' · right once, once more to fix':'')+'</p><div class="row"><button class="btn sm" data-fx="retry" data-v="'+m.id+'">Retry this</button></div></div>';}
  h+=Object.keys(byCh).map(cid=>{const f=findCh(cid);return'<div class="mg-ch"><div><b>'+esc(f?f.ch.title:cid)+'</b><button class="btn link" data-fx="retryall" data-v="'+cid+'">Retry all '+byCh[cid].length+'</button></div>'+byCh[cid].map(x=>'<button class="mg-it'+(x.id===MG.sel?' on':'')+(x.rights.length?' half':'')+'" data-fx="mgsel" data-v="'+x.id+'">'+esc(x.topic||'Question')+'</button>').join('')+'</div>';}).join('');
  return h+'</div>';
}
function fxMGLoop(el){
  const cv2=el.querySelector('canvas.fxbg'),c2=cv2.getContext('2d');
  function size(){const d=Math.min(devicePixelRatio||1,2);cv2.width=innerWidth*d;cv2.height=innerHeight*d;c2.setTransform(d,0,0,d,0,0);}size();addEventListener('resize',size);
  cv2.addEventListener('click',e=>{let best=null,bd=16;MG.stars.forEach(s=>{const d=Math.hypot(e.clientX-s.x,e.clientY-s.y);if(d<bd){bd=d;best=s;}});if(best){MG.sel=best.m.id;fxRerender();}});
  function loop(now){
    if(!FXOVER||FXOVER.kind!=='mg'){removeEventListener('resize',size);return;}
    const w=innerWidth,h=innerHeight,cx=(w-420)/2,cy=h/2,R=Math.min(w-420,h)*.38;c2.clearRect(0,0,w,h);
    const neb=c2.createRadialGradient(cx,cy,0,cx,cy,R*1.5);neb.addColorStop(0,'rgba(120,40,48,.22)');neb.addColorStop(.5,'rgba(70,24,40,.12)');neb.addColorStop(1,'rgba(0,0,0,0)');c2.fillStyle=neb;c2.fillRect(0,0,w,h);
    for(let i=0;i<5;i++){const a=now*.00003*(i%2?1:-1)+i*1.3,x=cx+Math.cos(a)*R*.4,y=cy+Math.sin(a)*R*.3,g=c2.createRadialGradient(x,y,0,x,y,R*.8);g.addColorStop(0,'rgba(150,60,70,.05)');g.addColorStop(1,'rgba(0,0,0,0)');c2.fillStyle=g;c2.fillRect(0,0,w,h);}
    const L=fxMGList(),chs=[...new Set(L.map(m=>m.ch))];MG.stars=[];
    chs.forEach((cid,ci)=>{const a=ci/Math.max(1,chs.length)*6.283-1.2,ax=cx+Math.cos(a)*R*(chs.length>1?.62:0),ay=cy+Math.sin(a)*R*(chs.length>1?.5:0),f=findCh(cid);
      c2.font='500 10.5px Geist,system-ui,sans-serif';c2.fillStyle='rgba(220,180,180,.55)';c2.textAlign='center';c2.fillText(f?('CH '+numOf(f.ch,f.i)+' · '+f.ch.title).toUpperCase().slice(0,40):'',ax,ay+R*.32+18);
      L.filter(m=>m.ch===cid).forEach((m,k)=>{const r0=hashS(m.id),ang=(r0%628)/100+now*.00004,dd=8+((r0>>3)%100)/100*R*.28,x=ax+Math.cos(ang)*dd,y=ay+Math.sin(ang)*dd*.8;
        MG.stars.push({x:x,y:y,m:m});const col=m.rights.length?'#e3bd78':'#e08a8a',sel=m.id===MG.sel,tw=REDUCE?1:.75+.25*Math.sin(now*.003+k);
        c2.globalCompositeOperation='lighter';const g=c2.createRadialGradient(x,y,0,x,y,sel?18:10);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c2.globalAlpha=tw*(sel?1:.7);c2.fillStyle=g;c2.beginPath();c2.arc(x,y,sel?18:10,0,6.283);c2.fill();
        c2.globalAlpha=1;c2.fillStyle='#fff';c2.beginPath();c2.arc(x,y,sel?2.2:1.4,0,6.283);c2.fill();c2.globalCompositeOperation='source-over';
        if(sel){c2.strokeStyle='rgba(255,255,255,.8)';c2.lineWidth=1;c2.beginPath();c2.arc(x,y,13+2*Math.sin(now*.006),0,6.283);c2.stroke();}});});
    requestAnimationFrame(loop);}
  requestAnimationFrame(loop);
}
function fxRetry(ms){
  const ok=ms.filter(m=>m.qid&&/-q\d+$/.test(m.qid)&&CT[m.ch]);
  if(!ok.length){toast('These came from AI-made questions. Open the chapter and take a checkpoint to retest them.');return;}
  const cid=ok[0].ch,ct=CT[cid];if(FXOVER)fxCloseOverlay();openChapter(cid);const c=findCh(cid);
  const qs=ok.filter(m=>m.ch===cid).slice(0,8).map(m=>{const src=ct.quiz[+m.qid.split('-q')[1]];return src?qObj(src,m.qid,cid,m.id):null;}).filter(Boolean);
  if(!qs.length)return;sess={kind:'learn',ch:c,phase:'q',qa:[],text:'',abort:new AbortController(),qs:qs,i:0,retry:()=>fxRetry(ms)};RESET=true;renderPanel();
}
/* ---- occasional interstellar traces themed by subject ---- */
let EV=[],EVNEXT=performance.now()+9000;
const GLY={math:['∫','Σ','π','∂','∞','√','dx','eˣ','θ','lim','dy/dx','≈','Δ'],spec:['i','∇','|z|','cis θ','[ ]','×','·','λ','ℝ','ℂ','n!','⊥'],phys:['F=ma','E=mc²','λ','Φ','B','ε₀','μ₀','v','ω','ħ','Δt','q'],gen:['§','¶','∴','⚖','%','$','≈','→']};
function fxFam(sid){return sid==='ph'?'phys':sid==='ms'?'spec':sid==='mm'?'math':sid?'gen':'math';}
function fxMakeEvent(sid){
  const fam=fxFam(sid),r=Math.random,x=W*(.12+r()*.76),y=H*(.15+r()*.7),sc=.8+r()*.6,dur=10000+r()*5000,dx=(r()-.5)*40,dy=(r()-.5)*24;
  const kinds={math:['curve','glyphs','tangent'],spec:['vectors','complex','glyphs'],phys:['field','orbit','wave','projectile','glyphs'],gen:['glyphs']}[fam];
  const k=kinds[Math.floor(r()*kinds.length)],g=GLY[fam],gl=Array.from({length:6},()=>({s:g[Math.floor(r()*g.length)],x:(r()-.5)*260,y:(r()-.5)*140,rot:(r()-.5)*.6,sz:14+r()*20,v:(r()-.5)*.3}));
  const fn=Math.floor(r()*3);
  return{t0:performance.now(),dur:dur,a:.11,draw:(kk,now)=>{
    const ox=x+dx*kk,oy=y+dy*kk;ctx.lineWidth=1.1*sc;ctx.lineCap='round';
    if(k==='glyphs'){gl.forEach(q=>{ctx.save();ctx.translate(ox+q.x,oy+q.y-kk*20);ctx.rotate(q.rot+q.v*kk);ctx.font='400 '+q.sz+'px Geist,system-ui,sans-serif';ctx.textAlign='center';ctx.fillText(q.s,0,0);ctx.restore();});return;}
    if(k==='curve'||k==='tangent'){const f=fn===0?(u=>Math.sin(u*2.2)*40):fn===1?(u=>-(u*u)*28+30):(u=>Math.exp(u*1.3)*8-30);const p=Math.min(1,kk*1.6),N=80;
      ctx.beginPath();for(let i=0;i<=N*p;i++){const u=-1.6+3.2*i/N,X=ox+u*90*sc,Y=oy-f(u)*sc;i?ctx.lineTo(X,Y):ctx.moveTo(X,Y);}ctx.stroke();
      ctx.globalAlpha*=.5;ctx.beginPath();ctx.moveTo(ox-160*sc,oy);ctx.lineTo(ox+160*sc,oy);ctx.moveTo(ox,oy-70*sc);ctx.lineTo(ox,oy+70*sc);ctx.stroke();
      if(k==='tangent'){const u=-1.2+2.4*kk,e=.001,m=(f(u+e)-f(u-e))/(2*e),X=ox+u*90*sc,Y=oy-f(u)*sc;ctx.globalAlpha*=1.8;ctx.beginPath();ctx.moveTo(X-60*sc,Y+m*60/90*sc);ctx.lineTo(X+60*sc,Y-m*60/90*sc);ctx.stroke();ctx.beginPath();ctx.arc(X,Y,2.5,0,6.283);ctx.fill();}
      return;}
    if(k==='vectors'){for(let i=0;i<3;i++){const a=i*2.1+kk*1.2,L=(60+i*18)*sc,ex=ox+Math.cos(a)*L,ey=oy+Math.sin(a)*L;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ex,ey);ctx.stroke();const ha=Math.atan2(ey-oy,ex-ox);ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex-8*Math.cos(ha-.4),ey-8*Math.sin(ha-.4));ctx.moveTo(ex,ey);ctx.lineTo(ex-8*Math.cos(ha+.4),ey-8*Math.sin(ha+.4));ctx.stroke();}return;}
    if(k==='complex'){const R2=70*sc,a=kk*6.283;ctx.beginPath();ctx.arc(ox,oy,R2,0,6.283);ctx.stroke();ctx.beginPath();ctx.moveTo(ox-R2*1.3,oy);ctx.lineTo(ox+R2*1.3,oy);ctx.moveTo(ox,oy-R2*1.3);ctx.lineTo(ox,oy+R2*1.3);ctx.stroke();
      ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+Math.cos(-a)*R2,oy+Math.sin(-a)*R2);ctx.stroke();ctx.beginPath();ctx.arc(ox+Math.cos(-a)*R2,oy+Math.sin(-a)*R2,3,0,6.283);ctx.fill();ctx.font='400 14px Geist,system-ui';ctx.fillText('i',ox+6,oy-R2-6);return;}
    if(k==='field'){const s1=ox-70*sc,s2=ox+70*sc;for(let i=-3;i<=3;i++){if(!i)continue;ctx.beginPath();ctx.moveTo(s1,oy);ctx.bezierCurveTo(s1+30*sc,oy-i*28*sc,s2-30*sc,oy-i*28*sc,s2,oy);ctx.stroke();}
      ctx.font='400 16px Geist,system-ui';ctx.textAlign='center';ctx.fillText('+',s1,oy+5);ctx.fillText('−',s2,oy+5);const pp=kk%1,X=s1+(s2-s1)*pp;ctx.beginPath();ctx.arc(X,oy-Math.sin(pp*Math.PI)*28*sc,2.4,0,6.283);ctx.fill();return;}
    if(k==='orbit'){ctx.beginPath();ctx.ellipse(ox,oy,90*sc,46*sc,.3,0,6.283);ctx.stroke();ctx.beginPath();ctx.arc(ox-20*sc,oy-4*sc,4,0,6.283);ctx.fill();const a=kk*6.283*1.3;ctx.beginPath();ctx.arc(ox+Math.cos(a)*90*sc*Math.cos(.3)-Math.sin(a)*46*sc*Math.sin(.3),oy+Math.cos(a)*90*sc*Math.sin(.3)+Math.sin(a)*46*sc*Math.cos(.3),2.6,0,6.283);ctx.fill();return;}
    if(k==='wave'){ctx.beginPath();for(let i=0;i<=120;i++){const u=i/120,X=ox-150*sc+u*300*sc,env=Math.exp(-Math.pow((u-kk)*4,2));const Y=oy-Math.sin(u*40-kk*30)*30*sc*env;i?ctx.lineTo(X,Y):ctx.moveTo(X,Y);}ctx.stroke();return;}
    if(k==='projectile'){ctx.setLineDash([3,6]);ctx.beginPath();for(let i=0;i<=60;i++){const u=i/60,X=ox-130*sc+u*260*sc,Y=oy+50*sc-(1-Math.pow(2*u-1,2))*100*sc;i?ctx.lineTo(X,Y):ctx.moveTo(X,Y);}ctx.stroke();ctx.setLineDash([]);
      const u=Math.min(1,kk*1.2),X=ox-130*sc+u*260*sc,Y=oy+50*sc-(1-Math.pow(2*u-1,2))*100*sc;ctx.beginPath();ctx.arc(X,Y,3,0,6.283);ctx.fill();ctx.beginPath();ctx.moveTo(X,Y);ctx.lineTo(X+26,Y);ctx.moveTo(X,Y);ctx.lineTo(X,Y-(1-2*u)*26);ctx.stroke();return;}
  }};
}
function fxEvents(t){
  if(REDUCE||S.set.motion!=='full'||document.body.classList.contains('fx-focus'))return;const now=performance.now();
  if(now>EVNEXT&&!EV.length&&!tr){EVNEXT=now+24000+Math.random()*32000;const vs=VS();const sid=V.view==='subject'?V.subj:(vs[Math.floor(Math.random()*vs.length)]||{}).id;EV.push(fxMakeEvent(sid));}
  EV=EV.filter(e=>{const k=(now-e.t0)/e.dur;if(k>=1)return false;ctx.save();ctx.globalAlpha=Math.sin(Math.PI*k)*e.a;ctx.strokeStyle='rgb(205,212,235)';ctx.fillStyle='rgb(205,212,235)';try{e.draw(k,now);}catch(err){}ctx.restore();return true;});
}
/* ---- camera: scroll to zoom, drag to pan, scroll out to return ---- */
const CAM={z:1,x:0,y:0,tz:1,tx:0,ty:0,out:0};let DRAG=null,DRAGGED=false;
function fxCamStep(){const k=REDUCE?1:.16;CAM.z+=(CAM.tz-CAM.z)*k;CAM.x+=(CAM.tx-CAM.x)*k;CAM.y+=(CAM.ty-CAM.y)*k;}
function fxCamReset(){CAM.tz=1;CAM.tx=0;CAM.ty=0;CAM.out=0;}
function fxClampCam(){const m=Math.max(W,H)*.45*CAM.tz;CAM.tx=Math.max(-m,Math.min(m,CAM.tx));CAM.ty=Math.max(-m,Math.min(m,CAM.ty));}
cv.addEventListener('wheel',e=>{
  e.preventDefault();if(tr)return;const b=cv.getBoundingClientRect(),mx=e.clientX-b.left,my=e.clientY-b.top,f=Math.exp(-e.deltaY*.0016);
  const lo=V.view==='subject'?.82:.75,hi=2.4;
  if(V.view==='subject'&&e.deltaY>0&&CAM.tz<=lo+.01){CAM.out+=e.deltaY;if(CAM.out>140){fxCamReset();leave();}return;}
  if(V.view==='galaxy'&&e.deltaY<0&&CAM.tz>=hi-.01){const h=hitAt(e);if(h&&h.kind==='sun'){fxCamReset();enterSubject(h.id);}return;}
  CAM.out=0;const nz=Math.max(lo,Math.min(hi,CAM.tz*f)),r=nz/CAM.tz;
  CAM.tx=mx-W/2-(mx-W/2-CAM.tx)*r;CAM.ty=my-H/2-(my-H/2-CAM.ty)*r;CAM.tz=nz;fxClampCam();
  if(V.view==='subject'&&!S.flags.camHint){S.flags.camHint=1;toast('Scroll out past the edge to fly back to all the constellations.');}
},{passive:false});
cv.addEventListener('pointerdown',e=>{if(e.button!==0)return;DRAG={x:e.clientX,y:e.clientY,tx:CAM.tx,ty:CAM.ty,m:false};DRAGGED=false;});
addEventListener('pointermove',e=>{if(!DRAG)return;const dx=e.clientX-DRAG.x,dy=e.clientY-DRAG.y;if(!DRAG.m&&Math.hypot(dx,dy)>5){DRAG.m=true;cv.style.cursor='grabbing';}if(DRAG.m){CAM.tx=DRAG.tx+dx;CAM.ty=DRAG.ty+dy;fxClampCam();}});
addEventListener('pointerup',()=>{if(DRAG&&DRAG.m){DRAGGED=true;cv.style.cursor='';setTimeout(()=>DRAGGED=false,60);}DRAG=null;});
addEventListener('click',e=>{if(DRAGGED&&e.target===cv){e.stopPropagation();e.preventDefault();}},true);
cv.addEventListener('dblclick',()=>fxCamReset());
/* ---- start-up ---- */
fxBar();fxApplySettings();
if(FX_RESTORED)UNSAVED=true;
setTimeout(fxCheckAll,3000);

/* colour key: sit below its button, close on outside click / Esc */
(function(){
  const lb=document.getElementById('legBtn'),lg=document.getElementById('legend');if(!lb||!lg)return;
  function place(){const r=lb.getBoundingClientRect();lg.style.position='fixed';lg.style.top=Math.round(r.bottom+10)+'px';lg.style.right=Math.max(12,Math.round(innerWidth-r.right))+'px';lg.style.zIndex=45;}
  function shut(){lg.classList.remove('open');lb.setAttribute('aria-expanded','false');}
  lb.addEventListener('click',()=>{if(lg.classList.contains('open'))place();});
  addEventListener('resize',()=>{if(lg.classList.contains('open'))place();});
  document.addEventListener('pointerdown',e=>{if(lg.classList.contains('open')&&!lg.contains(e.target)&&!lb.contains(e.target))shut();},true);
  lg.addEventListener('click',shut);
  addEventListener('keydown',e=>{if(e.key==='Escape')shut();});
})();
