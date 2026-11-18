
/* =====================================================================
   FEATURES: core (state, safe saving, XP and levels, achievements,
   challenges, celebrations, trophy room)
   ===================================================================== */
const FXDEF={set:{text:'m',width:'normal',motion:'full',accent:'gold',sound:true,vol:.25,quote:true,daily:1.5},
  ach:{},cnt:{correct:0,fcRev:0,combo:0,focus:0,dailyDone:0,weeklyDone:0,journeyMax:0,mins:0},daily:{},fc:{},cards:[],notes:{},bm:{},dates:{},visited:{},flags:{},recap:{},xpb:0};
for(const k in FXDEF){if(S[k]==null)S[k]=JSON.parse(JSON.stringify(FXDEF[k]));else if(k==='set'||k==='cnt')S[k]=Object.assign(JSON.parse(JSON.stringify(FXDEF[k])),S[k]);}
const USERKEYS=['progress','mistakes','log','flash','lessons','practice','bank','time','comets','exams','xp','set','ach','cnt','daily','fc','cards','notes','bm','dates','visited','flags','recap','xpb','savedAt'];
/* ---- never lose progress: local mirror + newest-wins restore ---- */
let FX_RESTORED=false;
(function(){try{const raw=localStorage.getItem('sg_state_v1');if(!raw)return;const L=JSON.parse(raw);
  if((L.savedAt||0)>(S.savedAt||0)){const keepXP=Math.max(S.xp||0,L.xp||0);USERKEYS.forEach(k=>{if(L[k]!==undefined)S[k]=L[k];});S.xp=keepXP;FX_RESTORED=true;}
  for(const k in FXDEF){if(S[k]==null)S[k]=JSON.parse(JSON.stringify(FXDEF[k]));}
}catch(e){}})();
function fxMirror(){S.savedAt=Date.now();try{const o={};USERKEYS.forEach(k=>o[k]=S[k]);localStorage.setItem('sg_state_v1',JSON.stringify(o));}catch(e){}}
function fxDirty(){UNSAVED=true;fxMirror();}
setInterval(()=>{if(UNSAVED||TIMEDIRTY)fxMirror();},15000);
setInterval(()=>{if(UNSAVED||TIMEDIRTY)flushSave();},90000);
document.addEventListener('visibilitychange',()=>{if(document.hidden){fxMirror();flushSave();}});
addEventListener('pagehide',()=>fxMirror());
const fxToday=()=>dayKey(Date.now());
function fxDay(k){k=k||fxToday();return S.daily[k]||(S.daily[k]={xp:0,q:0,fc:0,focus:0,combo:0,done:{}});}
function fxWeekKey(t){const d=new Date(t||Date.now());const wd=(d.getDay()+6)%7;d.setDate(d.getDate()-wd);return dayKey(d.getTime());}
function fxWeekDays(wk){const out=[],d=new Date(wk+'T00:00:00');for(let i=0;i<7;i++){out.push(dayKey(d.getTime()));d.setDate(d.getDate()+1);}return out;}
const fxMinutes=k=>Math.floor(((S.time||{})[k||fxToday()]||0)/60);
const fxHours=()=>Object.values(S.time||{}).reduce((a,b)=>a+b,0)/3600;
/* ---- XP: every point is bounded by real study time, so max level needs 100+ hours ---- */
const MAXL=100,XPMAX=30000;
function xpForL(L){return L<=1?0:Math.round(XPMAX*Math.pow((L-1)/(MAXL-1),1.55));}
function fxLevel(x){let L=1;while(L<MAXL&&x>=xpForL(L+1))L++;return L;}
function fxCap(k){return 40+4*fxMinutes(k);}
function fxGain(n,quiet){
  if(!(n>0))return 0;const d=fxDay(),L0=fxLevel(S.xp||0);
  const room=Math.max(0,fxCap()-d.xp),g=Math.min(n,room);
  S.xp=(S.xp||0)+g;d.xp+=g;S.xpb=(S.xpb||0)+(n-g);
  const L1=fxLevel(S.xp);if(L1>L0)fxLevelUp(L1);
  if(g>0)fxDirty();return g;
}
function fxRelease(){if(!(S.xpb>0))return;const d=fxDay(),room=Math.max(0,fxCap()-d.xp);if(room<=0)return;const g=Math.min(room,S.xpb);S.xpb-=g;const L0=fxLevel(S.xp||0);S.xp+=g;d.xp+=g;const L1=fxLevel(S.xp);if(L1>L0)fxLevelUp(L1);}
function fxLevelUp(L){
  if(L%10===0||L===5||L===MAXL)fxCelebrate({name:'Level '+L,desc:L===MAXL?'Maximum level. Every point of this was earned.':'You reached level '+L+'.',tier:L>=50?4:3,group:'Level'});
  else toast('Level up: you are now level '+L);
  fxChime(L%10===0?2:1);
}
/* ---- activity tick: time XP, flags, releases ---- */
let FXOVER=null;
function fxActive(){return !document.hidden&&Date.now()-LASTACT<120000;}
setInterval(()=>{
  if(!fxActive())return;
  const theirs=!!(sess||V.sel||V.exam||V.insights);
  if(!theirs&&(FXOVER||V.fx)){const k=fxToday();S.time[k]=(S.time[k]||0)+5;TIMEDIRTY=true;}
},5000);
setInterval(()=>{
  if(!fxActive())return;
  const studying=!!(sess||V.sel||V.exam||V.insights||FXOVER||V.fx);if(!studying)return;
  fxGain(1);S.cnt.mins=(S.cnt.mins||0)+1;fxRelease();
  const h=new Date().getHours();if(h<4)S.flags.night=1;else if(h<6)S.flags.early=1;
  fxCheckAll();
},60000);
(function(){const days=Object.keys(S.time||{}).filter(k=>S.time[k]>=120).sort();const last=days[days.length-1];if(last&&last!==fxToday()&&(Date.now()-new Date(last+'T12:00:00').getTime())>7*DAY)S.flags.returnPending=1;})();
/* hook: a question answered correctly */
function QOK(q,st){
  const d=fxDay();d.q++;S.cnt.correct=(S.cnt.correct||0)+1;
  if(S.flags.returnPending){S.flags.returned=1;delete S.flags.returnPending;}
  if(q&&q.retestOf&&st&&st.credit===1){const m=S.mistakes.find(m=>m.id===q.retestOf),ds=new Date().toDateString();if(m&&!m.rights.includes(ds)){m.rights.push(ds);if(m.rights.length===2)toast('Mistake fixed for good.');}}
  fxDirty();setTimeout(fxCheckAll,50);
}
/* ---- mastery titles ---- */
const NOUN={mm:'Calculus',ms:'Vector',ph:'Field',bu:'Market',le:'Justice',en:'Word'};
const RANKS=[[0,'Stargazer'],[.04,'Wayfinder'],[.12,'Navigator'],[.25,'Cartographer'],[.42,'Astronomer'],[.62,'Luminary'],[.82,'Sovereign'],[.97,'Grand Master']];
function fxMastery(s){
  const t=subjectTotals(s);if(!t.t)return 0;
  const cards=fxAllCards().filter(c=>c.s===s.id&&c.type!=='mine');let cs=0;cards.forEach(c=>{const r=S.fc[c.id];cs+=r?r.c:0;});
  const fcm=cards.length?cs/(5*cards.length):0;
  let secs=0,tot=0;allChapters(s).forEach(c=>{const ct=CT[c.id];if(!ct)return;tot+=ct.sections.length;secs+=Object.keys((S.progress[c.id]||{}).secs||{}).length;});
  return Math.min(1,.55*(t.d/t.t)+.25*fcm+.2*(tot?secs/tot:0));
}
function fxTitle(s){const m=fxMastery(s);let r=RANKS[0][1],i=0;RANKS.forEach((x,k)=>{if(m>=x[0]){r=x[1];i=k;}});return{t:(NOUN[s.id]||s.name.split(' ')[0])+' '+r,m:m,i:i};}
/* ---- challenges ---- */
const DCH=[['q','Answer {n} questions correctly',[8,12,16]],['fc','Review {n} flashcards',[20,30,40]],['sec','Mark {n} lesson sections understood',[2,3,4]],['min','Study for {n} minutes',[30,45,60]],['focus','Finish {n} focus session',[1]],['combo','Reach a flashcard streak of {n}',[8,12]]];
const WCH=[['days','Study on {n} different days',[4,5]],['fc','Review {n} flashcards',[120,180]],['solid','Turn {n} chapters solid',[1,2]],['hours','Study for {n} hours',[4,6]],['q','Answer {n} questions correctly',[50,80]]];
function fxSeed(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return()=>{h=Math.imul(h^(h>>>15),2246822507)>>>0;h=Math.imul(h^(h>>>13),3266489909)>>>0;h^=h>>>16;return(h>>>0)/4294967296;};}
function fxPick(list,n,key){const r=fxSeed(key),a=list.slice(),out=[];while(out.length<n&&a.length){const i=Math.floor(r()*a.length);const c=a.splice(i,1)[0];out.push({id:c[0],text:c[1],n:c[2][Math.floor(r()*c[2].length)]});}return out;}
function fxSecsOn(keys){let n=0;const set=new Set(keys);for(const id in S.progress){const s=(S.progress[id]||{}).secs||{};for(const k in s)if(set.has(dayKey(s[k])))n++;}return n;}
function fxDailyList(){const k=fxToday();return fxPick(DCH,3,'d'+k).map(c=>{const d=fxDay(k);const v={q:d.q,fc:d.fc,sec:fxSecsOn([k]),min:fxMinutes(k),focus:d.focus,combo:d.combo}[c.id]||0;return Object.assign(c,{v:Math.min(v,c.n),ok:v>=c.n,key:'d:'+c.id});});}
function fxWeeklyList(){const wk=fxWeekKey(),days=fxWeekDays(wk);return fxPick(WCH,2,'w'+wk).map(c=>{let v=0;
  if(c.id==='days')v=days.filter(k=>((S.time||{})[k]||0)>=300).length;
  else if(c.id==='fc')v=days.reduce((a,k)=>a+((S.daily[k]||{}).fc||0),0);
  else if(c.id==='q')v=days.reduce((a,k)=>a+((S.daily[k]||{}).q||0),0);
  else if(c.id==='hours')v=Math.floor(days.reduce((a,k)=>a+((S.time||{})[k]||0),0)/3600);
  else if(c.id==='solid'){const set=new Set(days);v=S.log.filter(e=>e.after==='solid'&&e.before!=='solid'&&set.has(dayKey(e.t))).length;}
  return Object.assign(c,{v:Math.min(v,c.n),ok:v>=c.n,key:'w:'+wk+':'+c.id});});}
function fxCheckChallenges(){
  const d=fxDay();let changed=false;
  const dl=fxDailyList();dl.forEach(c=>{if(c.ok&&!d.done[c.key]){d.done[c.key]=1;S.cnt.dailyDone++;fxGain(40);toast('Daily challenge complete: '+c.text.replace('{n}',c.n)+' (+40 XP)');changed=true;}});
  if(dl.every(c=>c.ok)&&!d.done.all){d.done.all=1;fxGain(60);toast('All three daily challenges done (+60 XP)');changed=true;}
  const wk=fxWeekKey(),wd=S.daily['w'+wk]||(S.daily['w'+wk]={done:{}});
  fxWeeklyList().forEach(c=>{if(c.ok&&!wd.done[c.key]){wd.done[c.key]=1;S.cnt.weeklyDone++;fxGain(150);fxCelebrate({name:'Weekly challenge',desc:c.text.replace('{n}',c.n)+' · +150 XP',tier:2,group:'Challenge'});changed=true;}});
  if(changed)fxDirty();
}
/* ---- achievements ---- */
function fxCtx(){
  const all=VS().flatMap(s=>allChapters(s));
  const solid=all.filter(c=>effStatus(c.id)==='solid').length;
  let secs=0,full=0;const unitFull=VS().some(s=>UNITS.some(u=>{const l=chaptersOf(s,u).filter(c=>CT[c.id]);return l.length&&l.every(c=>{const ct=CT[c.id],p=(S.progress[c.id]||{}).secs||{};return ct.sections.every(x=>p[x.id]);});}));
  all.forEach(c=>{const ct=CT[c.id];if(!ct)return;const p=(S.progress[c.id]||{}).secs||{};const n=Object.keys(p).length;secs+=n;if(ct.sections.every(x=>p[x.id]))full++;});
  const ex=Object.values(S.exams||{});const fixed=S.mistakes.filter(m=>m.rights.length>=2).length;
  const fcv=Object.values(S.fc);const c5=fcv.filter(r=>r.c===5).length;
  let deckFull=false;VS().forEach(s=>allChapters(s).forEach(c=>{const cs=fxAllCards().filter(x=>x.ch===c.id);if(cs.length>=8&&cs.every(x=>(S.fc[x.id]||{}).c>=4))deckFull=true;}));
  const maxDay=Math.max(0,...Object.values(S.time||{}))/3600;
  const unit3=VS().some(s=>chaptersOf(s,'3').length&&chaptersOf(s,'3').every(c=>effStatus(c.id)==='solid'));
  return{solid,secs,full,unitFull,comets:Object.keys(S.comets||{}).length,fixed,exBest:Math.max(0,...ex.map(e=>e.best||0)),sk:streakInfo().n,hours:fxHours(),maxDay,
    fcRev:S.cnt.fcRev||0,combo:S.cnt.combo||0,c5,deckFull,L:fxLevel(S.xp||0),dd:S.cnt.dailyDone||0,wd:S.cnt.weeklyDone||0,focus:S.cnt.focus||0,
    notes:Object.values(S.notes).filter(x=>x&&x.trim()).length,dates:Object.keys(S.dates).filter(k=>S.dates[k]&&S.dates[k].date).length,visited:Object.keys(S.visited).length,nsub:VS().length,correct:S.cnt.correct||0,unit3,f:S.flags,jm:S.cnt.journeyMax||0};
}
const ACH=[
 // Explorer
 ['e1','First steps','Mark your first lesson section as understood','Explorer',1,0,c=>c.secs>=1],
 ['e2','Stargazer','Visit every subject constellation','Explorer',1,0,c=>c.visited>=c.nsub],
 ['e3','Reading the sky','Open an official formula sheet','Explorer',1,0,c=>c.f.formula],
 ['e4','Surveyor','Mark 50 lesson sections as understood','Explorer',2,0,c=>c.secs>=50],
 ['e5','Deep reader','Read every section of 5 chapters','Explorer',2,0,c=>c.full>=5],
 ['e6','Full map','Read every lesson in a whole unit','Explorer',3,0,c=>c.unitFull],
 ['e7','Wanderer','Ride a comet across 6 or more stars','Explorer',2,0,c=>c.jm>=6],
 // Scholar
 ['s1','First light','Turn your first chapter solid','Scholar',1,0,c=>c.solid>=1],
 ['s2','Constellation','Turn 5 chapters solid','Scholar',2,0,c=>c.solid>=5],
 ['s3','Supercluster','Turn 15 chapters solid','Scholar',3,0,c=>c.solid>=15],
 ['s4','Comet hunter','Catch 3 extension comets','Scholar',1,0,c=>c.comets>=3],
 ['s5','Comet master','Catch 15 extension comets','Scholar',3,0,c=>c.comets>=15],
 ['s6','Sharp mind','Answer 100 questions correctly','Scholar',2,0,c=>c.correct>=100],
 ['s7','Relentless','Answer 500 questions correctly','Scholar',3,0,c=>c.correct>=500],
 ['s8','Exam ready','Score 80% or more in a unit exam','Scholar',2,0,c=>c.exBest>=80],
 ['s9','Flawless','Score 100% in a unit exam','Scholar',4,0,c=>c.exBest>=100],
 ['s10','Mistake fixer','Fix 5 mistakes for good','Scholar',1,0,c=>c.fixed>=5],
 ['s11','Error eraser','Fix 25 mistakes for good','Scholar',3,0,c=>c.fixed>=25],
 // Streaks and time
 ['k1','Three-day orbit','Study on 3 days in a row','Streaks',1,0,c=>c.sk>=3],
 ['k2','Week warrior','Study on 7 days in a row','Streaks',2,0,c=>c.sk>=7],
 ['k3','Fortnight flame','Study on 14 days in a row','Streaks',3,0,c=>c.sk>=14],
 ['k4','Unbroken','Study on 30 days in a row','Streaks',4,0,c=>c.sk>=30],
 ['k5','Focused','Finish a focus session','Streaks',1,0,c=>c.focus>=1],
 ['k6','Deep work','Finish 10 focus sessions','Streaks',2,0,c=>c.focus>=10],
 ['k7','Marathon','Study for 3 hours in one day','Streaks',3,0,c=>c.maxDay>=3],
 ['k8','Ten hours','Study for 10 hours in total','Streaks',2,0,c=>c.hours>=10],
 ['k9','Fifty hours','Study for 50 hours in total','Streaks',3,0,c=>c.hours>=50],
 ['k10','The long voyage','Study for 100 hours in total','Streaks',4,0,c=>c.hours>=100],
 // Flashcards
 ['f1','First flip','Review your first flashcard','Flashcards',1,0,c=>c.fcRev>=1],
 ['f2','Card sharp','Review 200 flashcards','Flashcards',2,0,c=>c.fcRev>=200],
 ['f3','Thousand suns','Review 1000 flashcards','Flashcards',3,0,c=>c.fcRev>=1000],
 ['f4','On a roll','Reach a flashcard streak of 10','Flashcards',1,0,c=>c.combo>=10],
 ['f5','Blazing','Reach a flashcard streak of 25','Flashcards',2,0,c=>c.combo>=25],
 ['f6','Supernova streak','Reach a flashcard streak of 50','Flashcards',4,0,c=>c.combo>=50],
 ['f7','Bright fifty','Rate 50 cards at full confidence','Flashcards',2,0,c=>c.c5>=50],
 ['f8','Lit galaxy','Get every card in a chapter to confidence 4 or 5','Flashcards',3,0,c=>c.deckFull],
 // Mastery
 ['m1','Unit conqueror','Make every Unit 3 chapter solid in a subject','Mastery',4,0,c=>c.unit3],
 ['m2','Level 10','Reach level 10','Mastery',1,0,c=>c.L>=10],
 ['m3','Level 25','Reach level 25','Mastery',2,0,c=>c.L>=25],
 ['m4','Level 50','Reach level 50','Mastery',3,0,c=>c.L>=50],
 ['m5','Level 100','Reach the maximum level','Mastery',4,0,c=>c.L>=100],
 ['m6','Challenge accepted','Complete a daily challenge','Mastery',1,0,c=>c.dd>=1],
 ['m7','Week by week','Complete a weekly challenge','Mastery',2,0,c=>c.wd>=1],
 ['m8','Habit of stars','Complete 30 daily challenges','Mastery',3,0,c=>c.dd>=30],
 // Secret
 ['x1','Night owl','Study between midnight and 4 am','Secret',2,1,c=>c.f.night],
 ['x2','Early bird','Study between 4 am and 6 am','Secret',2,1,c=>c.f.early],
 ['x3','Eyes on the horizon','Set an exam date','Secret',1,1,c=>c.dates>=1],
 ['x4','Archivist','Write 10 notes','Secret',2,1,c=>c.notes>=10],
 ['x5','Calm before the storm','Finish a 15-minute session rating every card 4 or 5','Secret',3,1,c=>c.f.calm],
 ['x6','Second wind','Come back after a week away and answer a question','Secret',2,1,c=>c.f.returned],
];
const TIERN=['','Bronze','Silver','Gold','Legendary'],TIERC=['','#c49a6c','#c8ccd6','#e8c98a','#e6d9ff'];
let FXQUEUE=[],FXCHECKING=false;
function fxCheckAll(){
  if(FXCHECKING)return;FXCHECKING=true;
  try{fxCheckChallenges();const c=fxCtx();let any=false;
    ACH.forEach(a=>{if(!S.ach[a[0]]&&a[6](c)){S.ach[a[0]]=Date.now();any=true;const ev={name:a[1],desc:a[2],tier:a[4],group:a[3],secret:a[5]};
      if(a[4]>=3||a[5])fxCelebrate(ev);else fxToastAch(ev);fxGain(a[4]*15);}});
    if(any)fxDirty();
  }catch(e){}FXCHECKING=false;
}
setInterval(fxCheckAll,6000);
/* ---- celebrations ---- */
function fxToastAch(ev){
  const el=document.createElement('div');el.className='fx-ach t'+ev.tier;
  el.innerHTML='<i class="fx-burst"></i><div><p>'+(ev.secret?'Secret achievement':TIERN[ev.tier]+' achievement')+'</p><b>'+esc(ev.name)+'</b><span>'+esc(ev.desc)+'</span></div>';
  document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('in'));fxChime(1);
  setTimeout(()=>{el.classList.remove('in');setTimeout(()=>el.remove(),700);},4600);
}
let FXCEL=[],FXCELON=false;
function fxCelebrate(ev){FXCEL.push(ev);if(!FXCELON)fxNextCel();}
function fxNextCel(){
  const ev=FXCEL.shift();if(!ev){FXCELON=false;return;}FXCELON=true;
  const el=document.createElement('div');el.className='fx-cel';el.innerHTML='<canvas></canvas><div class="fx-celt"><p>'+esc(ev.secret?'Secret achievement':(TIERN[ev.tier]||'')+' · '+ev.group)+'</p><h2>'+esc(ev.name)+'</h2><span>'+esc(ev.desc)+'</span></div>';
  document.body.appendChild(el);fxChime(ev.tier>=4?3:2);
  const cv2=el.querySelector('canvas'),c2=cv2.getContext('2d'),d=Math.min(devicePixelRatio||1,2);let w=innerWidth,h=innerHeight;cv2.width=w*d;cv2.height=h*d;c2.scale(d,d);
  const col=TIERC[ev.tier]||'#e8c98a',t0=performance.now(),N=REDUCE?0:220,P=Array.from({length:N},()=>{const a=Math.random()*6.283,s=Math.random()*Math.random()*9+1;return{a,s,r:Math.random()*1.6+.4,l:Math.random()*.5+.5};});
  let alive=true;
  function loop(now){if(!alive)return;const k=(now-t0)/1000;c2.clearRect(0,0,w,h);
    c2.fillStyle='rgba(0,0,0,'+Math.min(.82,k*1.6)+')';c2.fillRect(0,0,w,h);
    const cx=w/2,cy=h/2-40;
    if(k<.6){const s=1-k/.6,g=c2.createRadialGradient(cx,cy,0,cx,cy,60*s+4);g.addColorStop(0,'#fff');g.addColorStop(.3,col);g.addColorStop(1,'rgba(0,0,0,0)');c2.fillStyle=g;c2.beginPath();c2.arc(cx,cy,60*s+4,0,6.283);c2.fill();}
    else{const e=k-.6;c2.globalCompositeOperation='lighter';
      for(let q=0;q<3;q++){const kk=Math.max(0,e-q*.18);const R=kk*380;c2.strokeStyle=col;c2.globalAlpha=Math.max(0,.55-kk*.35);c2.lineWidth=2.2-q*.5;c2.beginPath();c2.arc(cx,cy,R,0,6.283);c2.stroke();}
      c2.globalAlpha=1;
      P.forEach(p=>{const dist=p.s*e*110*(1-Math.exp(-e*1.2)),x=cx+Math.cos(p.a)*dist,y=cy+Math.sin(p.a)*dist;c2.globalAlpha=Math.max(0,p.l-e*.22);c2.fillStyle=Math.random()<.1?'#fff':col;c2.beginPath();c2.arc(x,y,p.r,0,6.283);c2.fill();});
      const fl=Math.max(0,1-e*1.4);if(fl>0){const g=c2.createRadialGradient(cx,cy,0,cx,cy,260);g.addColorStop(0,'rgba(255,255,255,'+fl*.8+')');g.addColorStop(1,'rgba(255,255,255,0)');c2.fillStyle=g;c2.globalAlpha=1;c2.fillRect(0,0,w,h);}
      c2.globalCompositeOperation='source-over';c2.globalAlpha=1;}
    requestAnimationFrame(loop);}
  requestAnimationFrame(loop);
  setTimeout(()=>el.classList.add('in'),REDUCE?0:650);
  const close=()=>{if(!alive)return;alive=false;el.classList.add('out');setTimeout(()=>{el.remove();fxNextCel();},700);};
  el.addEventListener('pointerdown',close);setTimeout(close,5200);
}
/* ---- trophy room ---- */
function fxTrophies(){
  fxOpenOverlay('trophy',()=>{
    const c=fxCtx(),groups=['Explorer','Scholar','Streaks','Flashcards','Mastery','Secret'];
    const li=lvlInfo(),got=ACH.filter(a=>S.ach[a[0]]).length;
    let h='<div class="fx-head"><div><p class="eyebrow">Trophy constellations</p><h2>'+got+' of '+ACH.length+' achievements</h2></div><button class="x" data-fx="close" aria-label="Close">×</button></div>';
    h+='<div class="fx-lvl"><div class="ring" style="--p:'+Math.round(li.f*100)+'"><b>'+li.L+'</b><span>level</span></div><div><b>'+li.x.toLocaleString()+' XP</b><span>'+(li.L>=MAXL?'Maximum level reached':(li.need.toLocaleString()+' XP to level '+(li.L+1)+' · max level '+MAXL))+'</span>'+
      '<span class="muted">XP only grows as fast as real study time allows: about 4 XP per active minute plus a small daily allowance'+(S.xpb>0?'. '+S.xpb+' XP is waiting to be released as you keep studying today.':'.')+'</span></div></div>';
    h+='<div class="fx-titles">'+VS().map(s=>{const t=fxTitle(s);return'<div style="--c:'+s.hue+'"><span>'+esc(s.name)+'</span><b>'+esc(t.t)+'</b><i style="width:'+Math.round(t.m*100)+'%"></i></div>';}).join('')+'</div>';
    h+='<h4 class="eyebrow">Today</h4><div class="fx-chal">'+fxDailyList().map(x=>'<div class="'+(x.ok?'ok':'')+'"><span>'+esc(x.text.replace('{n}',x.n))+'</span><b>'+x.v+' / '+x.n+'</b><i style="width:'+Math.round(x.v/x.n*100)+'%"></i></div>').join('')+'</div>';
    h+='<h4 class="eyebrow">This week</h4><div class="fx-chal">'+fxWeeklyList().map(x=>'<div class="'+(x.ok?'ok':'')+'"><span>'+esc(x.text.replace('{n}',x.n))+'</span><b>'+x.v+' / '+x.n+'</b><i style="width:'+Math.round(x.v/x.n*100)+'%"></i></div>').join('')+'</div>';
    h+='<div class="fx-cons">'+groups.map(g=>{const l=ACH.filter(a=>a[3]===g);const W2=Math.max(360,l.length*64),pts=l.map((a,i)=>({x:30+i*((W2-60)/Math.max(1,l.length-1)),y:45+((i*37)%3-1)*24+((i%2)?-8:8)}));
      return'<div class="fx-con"><p class="eyebrow">'+g+'</p><svg viewBox="0 0 '+W2+' 100" style="width:100%;max-width:'+W2+'px">'+pts.slice(1).map((p,i)=>{const on=S.ach[l[i][0]]&&S.ach[l[i+1][0]];return'<line x1="'+pts[i].x+'" y1="'+pts[i].y+'" x2="'+p.x+'" y2="'+p.y+'" class="'+(on?'on':'')+'"/>';}).join('')+
      l.map((a,i)=>{const on=!!S.ach[a[0]],hid=a[5]&&!on;return'<g class="st t'+a[4]+(on?' on':'')+'" data-fx="ach" data-v="'+a[0]+'" tabindex="0"><circle cx="'+pts[i].x+'" cy="'+pts[i].y+'" r="'+(on?3.4+a[4]:2.6)+'"/><text x="'+pts[i].x+'" y="'+(pts[i].y+22)+'">'+esc(hid?'???':a[1])+'</text><title>'+esc(hid?'Secret achievement':a[1]+' · '+TIERN[a[4]]+' · '+a[2])+'</title></g>';}).join('')+'</svg></div>';}).join('')+'</div>';
    h+='<div id="fx-achd" class="fx-achd muted">Select a star to see the achievement.</div>';
    return h;
  });
}
function fxAchDetail(id){const a=ACH.find(x=>x[0]===id),el=document.getElementById('fx-achd');if(!a||!el)return;const on=S.ach[id],hid=a[5]&&!on;
  el.innerHTML='<b style="color:'+TIERC[a[4]]+'">'+(hid?'Secret achievement':esc(a[1]))+'</b> · '+(hid?'Keep exploring to discover this one.':TIERN[a[4]]+' · '+esc(a[2]))+(on?' · <span>earned '+new Date(on).toLocaleDateString('en-AU',{day:'numeric',month:'short'})+'</span>':'');}
