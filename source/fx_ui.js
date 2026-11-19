/* =====================================================================
   DECLUTTER: one "Up next" card, a lean top bar, a grouped tools hub,
   one notification at a time, and plain-English labels.
   ===================================================================== */
if(S.set.quiet==null)S.set.quiet=false;
/* ---- home: greeting, honest stats, one main action, one quiet row ---- */
heroHTML=function(){
  const d=new Date(),hr=d.getHours(),g=hr<5?'Still up':hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';
  let t=0,s=0;VS().forEach(x=>{const o=subjectTotals(x);t+=o.t;s+=o.d;});
  const hrs=Object.values(S.time||{}).reduce((a,b)=>a+b,0)/3600,sk=streakInfo();
  const any=s>0||hrs>=.25||sk.n>0;
  return'<div class="hero"><p class="eyebrow">'+d.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'})+'</p><h2 class="heroT">'+g+'.<br><em>'+(hr>=5&&hr<17?'Where to today?':'Where to tonight?')+'</em></h2>'+
    (any?'<div class="heroS"><span><b>'+s+'<small style="font-size:.5em;color:var(--mute)"> / '+t+'</small></b>Chapters mastered</span><span><b>'+(hrs<10?hrs.toFixed(1):Math.round(hrs))+'h</b>Studied</span><span><b>'+sk.n+'</b>Day streak</span></div>'
      :'<p class="hero-new">Start with the card below. Your progress shows up here as you study.</p>')+'</div>';
};
function fxUpNext(){
  const pk=todayPick(),dn=fxDueItems().length;
  if(dn>=5||(!pk&&dn))return{k:'due',eb:'Up next · review',t:dn+' things to review',why:'Flashcards, mistakes and chapters that are due. About '+Math.max(5,Math.round(dn*1.2))+' minutes.',btn:'<button class="btn" data-fx="due">Start review</button>'};
  if(pk)return{k:'ch',eb:'Up next',t:pk.s.name+' · '+pk.c.title,why:pk.why,btn:'<button class="btn" data-today="'+pk.s.id+'|'+pk.c.id+'">Start</button>'};
  return null;
}
todayHTML=function(){
  const u=fxUpNext();
  return heroHTML()+(u?'<div class="tdc fx-up"><p class="eyebrow">'+u.eb+'</p><b>'+esc(u.t)+'</b><span>'+esc(u.why)+'</span>'+u.btn+'</div>':'');
};
fxTodayExtra=function(){
  const u=fxUpNext(),L=[];
  const ds=VS().map(s=>[s,fxDaysTo(s.id)]).filter(x=>x[1]!=null&&x[1]>=0).sort((a,b)=>a[1]-b[1]);
  if(ds.length)L.push('<button class="ql'+(ds[0][1]<=7?' red':'')+'" data-fx="plan"><b>'+ds[0][1]+'</b> days to '+esc(ds[0][0].name)+'</button>');
  const dn=fxDueItems().length;if(dn&&(!u||u.k!=='due'))L.push('<button class="ql" data-fx="due"><b>'+dn+'</b> due today</button>');
  const bs=fxBossState();if(!bs.dormant&&!bs.beaten)L.push('<button class="ql bh" data-fx="boss"><i></i>Black hole · '+bs.hp+'/'+bs.max+'</button>');
  const dl=fxDailyList(),dd=dl.filter(c=>c.ok).length;L.push('<button class="ql" data-fx="trophy" title="'+esc(dl.map(c=>c.text.replace('{n}',c.n)+' ('+c.v+'/'+c.n+')').join(' · '))+'"><b>'+dd+'/3</b> daily challenges</button>');
  if(fxRecapDue())L.push('<button class="ql" data-fx="recap">Last week’s recap</button>');
  if(!ds.length)L.push('<button class="ql dim" data-fx="plan">Add exam dates</button>');
  return'<div class="fx-quiet">'+L.join('')+'</div>';
};
/* ---- grouped tools hub ---- */
fxHubHTML=function(){
  const due=fxDueItems().length,b=fxBossState(),pp=(S.papers||[]).length,mg=S.mistakes.filter(m=>m.rights.length<2).length,li=lvlInfo(),sk=streakInfo();
  const G=[['Study',[['due','Due today',due?due+' waiting':'All clear'],['cards','Flashcards','Custom decks'],['quick','Study 15 minutes','Timed mixed set'],['formula','Formula sheets','Official QCAA'],['cas','CAS guides',S.set.cas==='cp'?'ClassPad':'TI-Nspire']]],
    ['Test yourself',[['boss','Black hole of doom',b.dormant?'Forms soon':b.beaten?'Destroyed this week':'HP '+b.hp+'/'+b.max,'bh'],['drill','Formula drills','60-second rounds'],['exam','Practice exam','Made by Claude','ai'],['photo','Photo marking','Made by Claude','ai'],['mg','Mistakes',mg?mg+' to fix':'None open']]],
    ['Plan and track',[['insights','Progress and weak spots','Level '+li.L+' · '+sk.n+'-day streak'],['plan','Exam planner','Dates and 14-day plan'],['papers','Past-paper tracker',pp?pp+' logged':'Log a score'],['trophy','Trophies','Achievements'],['tl','Timelapse','Replay your term']]],
    ['Extras',[['printing','Print','Papers and cheat sheets'],['mixer','Focus sounds','Rain, lo-fi, noise']]]];
  return'<div class="fm-wide">'+fmH('Study tools','Everything in one place')+G.map(g=>'<h4 class="eyebrow fm-gh">'+g[0]+'</h4><div class="fm-hub">'+g[1].map(x=>'<button class="fm-tile '+(x[3]||'')+'" data-fx="'+x[0]+'"><b>'+x[1]+'</b><em>'+x[2]+'</em></button>').join('')+'</div>').join('')+
    '<p class="sub">'+fxShieldLine()+'</p></div>';
};
/* ---- notifications: one at a time, out of the way, never over a question ---- */
let FXACHQ=[],FXACHON=false;
fxToastAch=function(ev){if(S.set.quiet)return;FXACHQ.push(ev);if(!FXACHON)fxAchNext();};
function fxAchNext(){
  const ev=FXACHQ.shift();if(!ev){FXACHON=false;return;}FXACHON=true;
  const el=document.createElement('div');el.className='fx-ach t'+ev.tier;
  el.innerHTML='<i class="fx-burst"></i><div><p>'+(ev.secret?'Secret achievement':TIERN[ev.tier]+' achievement')+'</p><b>'+esc(ev.name)+'</b><span>'+esc(ev.desc)+'</span></div>';
  document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('in'));fxChime(1);
  setTimeout(()=>{el.classList.remove('in');setTimeout(()=>{el.remove();fxAchNext();},600);},4200);
}
{const C0=fxCelebrate;fxCelebrate=function(ev){
  if(S.set.quiet){fxToastAch(Object.assign({},ev,{tier:Math.min(ev.tier||2,2)}));return;}
  const busy=()=>FXOVER||sess||V.sel||document.getElementById('fx-search');
  if(busy()){const w=setInterval(()=>{if(!busy()){clearInterval(w);setTimeout(()=>C0(ev),600);}},1500);return;}
  C0(ev);};}
{const T0=toast;toast=function(m){if(S.set.quiet&&/^Level up|achievement/i.test(m))return;T0(m);};}
/* ---- extra actions ---- */
function fxUiAct(a){
  if(a==='insights'){if(FXOVER)fxCloseOverlay();setTimeout(()=>{const b=document.getElementById('insightsBtn');endSess();V.sel=null;V.add=false;V.fx=null;V.hidden=false;V.insights=true;renderPanel();chrome();},FXOVER?300:0);return true;}
  return false;
}
/* ---- worked solutions as numbered steps ---- */
solHTML=function(q,st){
  const raw=String(q.solution||''),steps=(raw.indexOf('||')>=0?raw.split('||'):raw.split(/(?<=\.)\s+(?=[A-Z$\\(])/)).map(x=>x.trim()).filter(Boolean),n=steps.length;
  const k=st.revealed?Math.min(n,st.sol||1):n;
  return'<div class="sol2"><b>Worked solution</b><ol>'+steps.slice(0,k).map(x=>'<li>'+inl(x)+'</li>').join('')+'</ol>'+(k>=n?'<p class="ans"><b>Answer:</b> '+inl(q.answer)+'</p>':'')+'</div>'+
    (k<n?'<div class="row"><button class="btn ghost" data-act="solnext">Show next step</button><button class="btn link" data-act="solall">Show it all</button></div>':'');
};

/* ---- record mistakes as you go, not only when a session is saved ---- */
(function(){const rp=renderPanel;renderPanel=function(){try{fxSweepMiss(false);}catch(e){}return rp.apply(this,arguments);};
  const es=endSess;endSess=function(){try{fxSweepMiss(true);}catch(e){}return es.apply(this,arguments);};})();
