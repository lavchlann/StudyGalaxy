/* =====================================================================
   MORE FEATURES: study tools hub, due-today queue, black hole of doom,
   formula drills, CAS guides, past-paper tracker, printing (cheat sheets
   and paper exams, black and white), AI practice exams, photo marking,
   explain differently, Socratic mode, streak shields, growing planets,
   galaxy timelapse and the focus sound mixer.
   ===================================================================== */
var MS={qr:null,dr:{s:null,mode:'sheet',len:60},pp:{s:null,chs:{},n:10,ans:'1',space:'m',comets:false,kind:'paper'},
  ex:{s:null,chs:{},min:60,style:'mixed',diff:'mixed',view:'home',busy:false,err:'',cur:null},
  ph:{q:'',ch:'',imgs:[],busy:false,res:null,err:''},cas:{q:'',tag:'all'},pap:{s:null,name:'',date:'',score:'',out:''},tl:{play:true,p:0}};
if(!S.set.mix)S.set.mix={hum:.7,rain:0,brown:0,keys:0,drums:0,crackle:0};
if(S.set.bpm==null)S.set.bpm=72;
const fmH=(t,sub)=>'<div class="fx-head"><div><p class="eyebrow">'+sub+'</p><h2>'+t+'</h2></div><button class="x" data-fx="close" aria-label="Close">×</button></div>';
function fmSel(path,val,opts,rr){return'<select data-fxm="'+path+'"'+(rr===false?' data-rr="0"':'')+'>'+opts.map(o=>'<option value="'+esc(o[0])+'"'+(String(o[0])===String(val)?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select>';}
function fmSubj(){const v=VS();return v.length?v[0].id:null;}
function fmChList(sid){const s=subj(sid);if(!s)return[];const out=[];UNITS.forEach(u=>chaptersOf(s,u).forEach((c,i)=>{if(CT[c.id])out.push({c:c,u:u,n:numOf(c,i)});}));return out;}
function fmStudied(sid){return fmChList(sid).filter(x=>{const st=effStatus(x.c.id),p=S.progress[x.c.id]||{};return st!=='new'||Object.keys(p.secs||{}).length;});}
function fmChPick(path,sid,sel){
  const L=fmChList(sid);if(!L.length)return'<p class="muted">No chapters with lessons in this subject yet.</p>';
  return'<div class="fm-chs">'+L.map(x=>'<label class="chk"><input type="checkbox" data-fxm="'+path+'" value="'+x.c.id+'"'+(sel[x.c.id]?' checked':'')+'> U'+x.u+' · '+x.n+' · '+esc(x.c.title)+'</label>').join('')+'</div>'+
    '<div class="row fm-chq"><button class="btn link" data-fx="fmall" data-v="'+path+'|'+sid+'|all">All</button><button class="btn link" data-fx="fmall" data-v="'+path+'|'+sid+'|studied">Ones I have started</button><button class="btn link" data-fx="fmall" data-v="'+path+'|'+sid+'|none">None</button></div>';
}
function fmDefaultChs(sid){const st=fmStudied(sid),L=st.length?st:fmChList(sid).slice(0,3),o={};L.forEach(x=>o[x.c.id]=1);return o;}
function fmRoot(p){if(p==='set')return S.set;if(p==='mix')return S.set.mix;return MS[p];}
function fmSet(t){
  const p=t.dataset.fxm.split('.');let o=fmRoot(p[0]);if(!o)return;for(let i=1;i<p.length-1;i++)o=o[p[i]];const k=p[p.length-1];
  if(t.type==='checkbox'&&t.value&&t.value!=='on'){if(!o[k])o[k]={};if(t.checked)o[k][t.value]=1;else delete o[k][t.value];}
  else if(t.type==='checkbox')o[k]=t.checked;
  else if(t.type==='range'||(t.type==='number'&&k!=='score'&&k!=='out'))o[k]=+t.value;
  else o[k]=t.value;
  if(p[0]==='set'||p[0]==='mix')fxDirty();
  if(k==='sound'){if(S.set.sound){fxSoundStart();fxMixStart();}const sb=document.getElementById('fx-snd');if(sb)sb.innerHTML=S.set.sound?IC.snd:IC.mute;fxMixApply();}
  if(p[0]==='mix'||k==='bpm'||k==='mixFocus'){fxMixStart();fxMixApply();}
}
document.addEventListener('change',e=>{const t=e.target;if(!t.dataset)return;
  if(t.id==='ph-file'){fxPhotoFiles(t.files);return;}
  if(!t.dataset.fxm)return;fmSet(t);if(t.dataset.rr!=='0'&&t.type!=='text'&&t.tagName!=='TEXTAREA')fxRerender();});
document.addEventListener('input',e=>{const t=e.target;if(!t.dataset||!t.dataset.fxm)return;if(t.type!=='checkbox'&&t.tagName!=='SELECT')fmSet(t);
  if(t.dataset.fxm==='cas.q'){const b=document.getElementById('cas-list');if(b)b.innerHTML=fxCasList();}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='qr-in'){e.preventDefault();qrCheck();}});

/* =================== study tools hub =================== */
function fxHub(){fxOpenOverlay('hub',fxHubHTML);}
function fxHubHTML(){
  const due=fxDueItems().length,b=fxBossState(),pp=(S.papers||[]).length;
  const T=[['due','Due today',due?due+' item'+(due===1?'':'s')+' waiting':'All clear for now','Flashcards, mistakes and chapters due for review in one mixed queue.',''],
    ['boss','Black hole of doom',b.dormant?'Forms once you have studied more':b.beaten?'Defeated this week':'HP '+b.hp+' / '+b.max,'A weekly boss built from your hardest mistakes. Answer correctly to shrink it.','bh'],
    ['drill','Formula drills','60-second rounds','Quick-fire formula recognition, derivatives and integrals against the clock.',''],
    ['exam','Practice exam','Made by Claude','Pick chapters and a time limit. Get a fresh paper with a marking guide.','ai'],
    ['photo','Photo marking','Made by Claude','Snap your handwritten working and get it marked step by step.','ai'],
    ['printing','Print papers and cheat sheets','Black and white','Printable practice papers from the question bank, and one-page chapter summaries.',''],
    ['papers','Past-paper tracker',pp?pp+' paper'+(pp===1?'':'s')+' logged':'Log your first score','Record real and practice paper scores and watch the trend.',''],
    ['cas','CAS guides',S.set.cas==='cp'?'Casio ClassPad':'TI-Nspire CX II CAS','Keystrokes for solving, calculus, distributions, matrices and more.',''],
    ['tl','Galaxy timelapse','Replay your term','Watch your galaxy light up chapter by chapter.',''],
    ['mixer','Focus sounds','Rain, lo-fi, noise','Mix your own background sound for studying.','']];
  return'<div class="fm-wide">'+fmH('Study tools','Everything in one place')+'<div class="fm-hub">'+T.map(x=>'<button class="fm-tile '+x[4]+'" data-fx="'+x[0]+'"><b>'+x[1]+'</b><em>'+x[2]+'</em><span>'+x[3]+'</span></button>').join('')+'</div>'+
    '<p class="sub">'+fxShieldLine()+'</p></div>';
}

/* =================== shared question runner =================== */
function fxSched(id,v){const now=Date.now(),r=S.fc[id]||{n:0,ok:0,s5:0};r.n++;r.c=v;r.last=now;if(v>=4)r.ok=(r.ok||0)+1;r.s5=v===5?(r.s5||0)+1:0;
  r.due=now+(v===1?60e3:v===2?10*60e3:v===3?DAY:v===4?3*DAY*(1+.3*Math.max(0,r.ok-1)):7*DAY*Math.pow(1.8,Math.min(r.s5-1,5)));S.fc[id]=r;
  fxDay().fc++;S.cnt.fcRev=(S.cnt.fcRev||0)+1;
  if(!S.log.some(e=>e.k==='fc'&&dayKey(e.t)===fxToday()))S.log=S.log.concat([{t:now,k:'fc'}]).slice(-300);fxGain(v>=4?2:1);fxDirty();}
function qrStart(items,opts){MS.qr=Object.assign({items:items,i:0,text:'',res:null,flip:false,ok:0,n:0,shown:false},opts||{});}
function qrHTML(){
  const R=MS.qr;if(!R)return'';const it=R.items[R.i];if(!it)return'';
  if(it.k==='card'){const c=it.c,sj=subj(c.s),f=c.ch.indexOf('F|')===0?null:findCh(c.ch);
    return'<div class="qr"><p class="eyebrow">Flashcard · '+esc((sj?sj.name:'')+(f?' · Ch '+numOf(f.ch,f.i):'')+' · '+c.topic)+'</p><div class="qr-q">'+fxText(c.f)+'</div>'+
      (R.flip?'<div class="qr-a">'+fxText(c.b)+'</div><p class="sub">How well did you know it?</p><div class="qr-rate">'+[['1','No idea'],['2','Shaky'],['3','Okay'],['4','Good'],['5','Perfect']].map(x=>'<button class="btn ghost sm" data-fx="qrrate" data-v="'+x[0]+'"><b>'+x[0]+'</b> '+x[1]+'</button>').join('')+'</div>'
        :'<div class="row"><button class="btn" data-fx="qrflip">Show answer</button></div>')+'</div>';}
  const q=it.q,f=findCh(q.ch);
  let h='<div class="qr"><p class="eyebrow">'+(it.tag?esc(it.tag)+' · ':'')+esc((f?f.s.name+' · '+f.ch.title:'')+' · '+(q.topic||''))+'</p><div class="qr-q">'+fxText(q.q)+'</div>';
  if(!R.res)h+='<input type="text" id="qr-in" data-fxm="qr.text" data-rr="0" placeholder="Your answer (e.g. 3x^2, ln5, 2pi/3)" autocomplete="off" value="'+esc(R.text||'')+'"><div class="row"><button class="btn" data-fx="qrcheck">Check</button><button class="btn link" data-fx="qrreveal">I don’t know, show me</button></div>';
  else{h+='<p class="fb '+(R.res==='ok'?'ok':'no')+'">'+(R.res==='ok'?'Correct.':'Not quite. The answer is '+inl(q.answer)+'.')+'</p>';
    if(R.res!=='ok'||R.shown)h+='<div class="qr-a"><b>Worked solution</b>'+fxText(q.solution||'')+'</div>';
    h+='<div class="row"><button class="btn" data-fx="qrnext">Next</button>'+(R.res!=='ok'&&R.text?'<button class="btn link" data-fx="qrright">My answer was right, just written differently</button>':'')+'</div>';}
  return h+'</div>';
}
function qrCheck(){const R=MS.qr;if(!R||R.res)return;const el=document.getElementById('qr-in');const t=(el?el.value:R.text||'').trim();if(!t)return;R.text=t;const it=R.items[R.i];qrResult(it.q.keys.some(k=>sameAns(k,t)));}
function qrResult(ok){const R=MS.qr,it=R.items[R.i];R.res=ok?'ok':'no';R.n++;
  if(ok){R.ok++;it.q.st.credit=1;QOK(it.q,it.q.st);fxGain(3);fxChime(1);}
  if(R.onResult)R.onResult(ok,it);fxRerender();if(!ok)setTimeout(()=>{const b=document.querySelector('[data-fx="qrnext"]');if(b)b.focus();},60);}
function qrNext(){const R=MS.qr,it=R.items[R.i];
  if(it&&it.k==='q'&&R.res==='no'&&!it.q.retestOf&&!S.mistakes.some(m=>m.qid===it.q.qid&&m.rights.length<2)){const q=it.q;
    S.mistakes.push({id:'m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),ch:q.ch,qid:q.qid,topic:q.topic,q:q.q,a:q.answer,type:'method',conf:null,t:Date.now(),rights:[]});fxDirty();}
  R.i++;R.text='';R.res=null;R.flip=false;R.shown=false;if(R.onNext)R.onNext();fxRerender();setTimeout(()=>{const i=document.getElementById('qr-in');if(i)i.focus();},80);}

/* =================== due today =================== */
function fxBankQ(cid,i,tag,mid){const ct=CT[cid];const src=ct&&ct.quiz[i];return src?{k:'q',q:qObj(src,cid+'-q'+i,cid,mid||null),tag:tag}:null;}
function fxDueItems(){
  const now=Date.now(),today=new Date().toDateString();
  const cards=fxAllCards().filter(c=>{const r=S.fc[c.id];return r&&r.due<=now;}).sort((a,b)=>S.fc[a.id].due-S.fc[b.id].due).slice(0,12).map(c=>({k:'card',c:c}));
  const ms=S.mistakes.filter(m=>m.qid&&/-q\d+$/.test(m.qid)&&CT[m.ch]&&m.rights.length<2&&!m.rights.includes(today)).slice(0,6).map(m=>fxBankQ(m.ch,+m.qid.split('-q')[1],'Fix a mistake',m.id)).filter(Boolean);
  const rev=[];VS().forEach(s=>allChapters(s).forEach(c=>{const st=effStatus(c.id),ct=CT[c.id];if(!ct||!(st==='due'||st==='revise')||rev.length>=8)return;
    const seed=hashS(c.id+today);[0,1].forEach(k=>{const i=(seed+k*7)%ct.quiz.length;const q=fxBankQ(c.id,i,st==='due'?'Review due':'Needs revision');if(q&&!rev.some(x=>x.q.qid===q.q.qid))rev.push(q);});}));
  const out=[],L=[cards,ms,rev];while(L.some(l=>l.length))L.forEach(l=>{if(l.length)out.push(l.shift());});
  return out;
}
function fxDue(){const items=fxDueItems();qrStart(items,{mode:'due'});fxOpenOverlay('due',fxDueHTML,{canvas:false});}
function fxDueHTML(){
  const R=MS.qr;
  if(!R||!R.items.length)return'<div class="fm-panel">'+fmH('Nothing due','Due today')+'<p class="muted">No flashcards, mistakes or chapters are due right now. New items appear here as reviews come due, so check back tomorrow, or study something new.</p><div class="row"><button class="btn" data-fx="quick">Study 15 min instead</button><button class="btn ghost" data-fx="close">Close</button></div></div>';
  if(R.i>=R.items.length){if(!R.fin){R.fin=1;S.flags.dueClear=1;fxDirty();setTimeout(fxCheckAll,60);}
    return'<div class="fm-panel">'+fmH('All caught up','Due today')+'<div class="fc-stat"><div><b>'+R.items.length+'</b><span>items reviewed</span></div><div><b>'+R.ok+' / '+R.n+'</b><span>questions right</span></div></div><p class="sub">Wrong answers went to your mistake nebula and will come back here.</p><div class="row"><button class="btn" data-fx="close">Done</button></div></div>';}
  return'<div class="fm-panel">'+fmH('Due today','Item '+(R.i+1)+' of '+R.items.length)+'<div class="prog"><i style="width:'+Math.round(R.i/R.items.length*100)+'%"></i></div>'+qrHTML()+'</div>';
}

/* =================== black hole of doom =================== */
function fxBossBuild(){
  const today=new Date().toDateString();const items=[];
  S.mistakes.filter(m=>m.qid&&/-q\d+$/.test(m.qid)&&CT[m.ch]&&m.rights.length<2).sort((a,b)=>((b.conf===3)-(a.conf===3))||(a.t-b.t)).forEach(m=>{if(items.length<8)items.push({ch:m.ch,i:+m.qid.split('-q')[1],mid:m.id});});
  const studied=VS().flatMap(s=>allChapters(s)).filter(c=>CT[c.id]&&effStatus(c.id)!=='new');
  const topics=new Set(S.mistakes.map(m=>m.topic));let g=0;
  while(items.length<6&&studied.length&&g<60){const c=studied[g%studied.length],ct=CT[c.id];const cand=ct.quiz.map((q,i)=>i).filter(i=>!items.some(x=>x.ch===c.id&&x.i===i));
    const pref=cand.filter(i=>topics.has(ct.quiz[i].topic));const pool=pref.length?pref:cand;if(pool.length)items.push({ch:c.id,i:pool[(hashS(c.id+fxWeekKey())+g)%pool.length]});g++;}
  return items;
}
function fxBossState(){
  const wk=fxWeekKey();let b=S.boss||{};
  if(b.wk!==wk){const items=fxBossBuild();b={wk:wk,items:items,max:Math.min(8,items.length),hp:Math.min(8,items.length),done:[],miss:0,beaten:0};if(items.length>=3)S.boss=b;else return{dormant:true,hp:0,max:0};}
  return b;
}
var BH={fx:[],pull:0};
function fxBoss(){
  const b=fxBossState();
  if(b.dormant){toast('The black hole forms once you have studied a few chapters or collected some mistakes.');return;}
  BH={fx:[],pull:0};fxBossQueue();
  fxOpenOverlay('boss',fxBossHTML,{canvas:true,onOpen:fxBossLoop});
}
function fxBossQueue(){const b=S.boss;const left=b.items.filter(x=>!b.done.includes(x.ch+'-q'+x.i));
  const items=left.map(x=>fxBankQ(x.ch,x.i,x.mid?'Your mistake':'Hard question',x.mid)).filter(Boolean);
  qrStart(items,{mode:'boss',onResult:(ok,it)=>{const b=S.boss;
    if(ok){if(!b.done.includes(it.q.qid))b.done.push(it.q.qid);b.hp=Math.max(0,b.hp-1);BH.fx.push({t:performance.now(),k:'hit'});
      if(b.hp===0&&!b.beaten){b.beaten=Date.now();S.cnt.boss=(S.cnt.boss||0)+1;S.flags.bh=1;fxGain(60);setTimeout(()=>fxCelebrate({name:'Black hole destroyed',desc:'You collapsed this week’s black hole of doom. A new one forms next Monday.',tier:3,group:'Challenges'}),700);}}
    else{b.miss=(b.miss||0)+1;BH.fx.push({t:performance.now(),k:'miss'});if(!R2(it))MS.qr.items.push(Object.assign({},it,{q:Object.assign({},it.q,{st:Object.assign({},it.q.st,{credit:0})})}));}
    fxDirty();}});
  function R2(it){return MS.qr.items.filter(x=>x.q&&x.q.qid===it.q.qid).length>1;}
}
function fxBossHTML(){
  const b=S.boss,R=MS.qr;
  let h='<div class="bh-side">'+fmH('Black hole of doom','Weekly boss · HP '+b.hp+' / '+b.max)+'<div class="bh-hp"><i style="width:'+Math.round(b.hp/Math.max(1,b.max)*100)+'%"></i></div>';
  if(b.beaten)return h+'<p class="muted">Destroyed '+new Date(b.beaten).toLocaleDateString('en-AU',{weekday:'long'})+'. '+b.miss+' miss'+(b.miss===1?'':'es')+' along the way. The next black hole forms on Monday from whatever you get wrong between now and then.</p><div class="row"><button class="btn" data-fx="close">Close</button></div></div>';
  if(!R||R.i>=R.items.length)return h+'<p class="muted">It survived this round with '+b.hp+' HP left. Every correct answer still counts, so come back and finish it before Monday.</p><div class="row"><button class="btn" data-fx="bossagain">Fight again</button><button class="btn ghost" data-fx="close">Retreat</button></div></div>';
  return h+'<p class="sub">Built from your hardest mistakes and weakest topics. Each correct answer shrinks it. Each miss feeds it, and that question comes back.</p>'+qrHTML()+'</div>';
}
function fxBossLoop(el){
  const cv2=el.querySelector('canvas.fxbg'),c2=cv2.getContext('2d');let d=1;
  function size(){d=Math.min(devicePixelRatio||1,1.5);cv2.width=innerWidth*d;cv2.height=innerHeight*d;c2.setTransform(d,0,0,d,0,0);}size();addEventListener('resize',size);
  const parts=Array.from({length:REDUCE?0:260},(_,i)=>({a:Math.random()*6.283,r:.9+Math.random()*1.9,s:.5+Math.random(),z:Math.random()}));
  function loop(now){
    if(!FXOVER||FXOVER.kind!=='boss'){removeEventListener('resize',size);return;}
    const w=innerWidth,h=innerHeight,side=Math.min(480,w*.42),cx=(w-side)/2,cy=h/2,b=S.boss||{hp:0,max:1,miss:0};
    const life=b.beaten?Math.max(0,1-(Date.now()-b.beaten)/2500):1;
    let R=Math.min(w-side,h)*.14*(.5+.5*b.hp/Math.max(1,b.max))*(1+.05*Math.min(8,b.miss||0))*life;
    let shake=0,flash=0;BH.fx=BH.fx.filter(f=>now-f.t<1400);BH.fx.forEach(f=>{const k=(now-f.t)/1400;if(f.k==='hit'){flash=Math.max(flash,1-k);shake=Math.max(shake,(1-k)*8);}else R*=1+.25*Math.sin(Math.min(1,k*2)*Math.PI);});
    const ox=cx+(Math.random()-.5)*shake,oy=cy+(Math.random()-.5)*shake;
    c2.clearRect(0,0,w,h);
    const halo=c2.createRadialGradient(ox,oy,R*.8,ox,oy,R*5);halo.addColorStop(0,'rgba(255,160,90,'+(.22+.3*flash)+')');halo.addColorStop(.35,'rgba(150,70,160,.10)');halo.addColorStop(1,'rgba(0,0,0,0)');c2.fillStyle=halo;c2.fillRect(0,0,w,h);
    c2.save();c2.translate(ox,oy);c2.globalCompositeOperation='lighter';
    const rot=REDUCE?0:now*.00035;
    parts.forEach(p=>{const a=p.a+rot*p.s*(2.2/p.r),rr=R*p.r*1.45,x=Math.cos(a)*rr,y=Math.sin(a)*rr*.32,front=Math.sin(a)>0;if(life<1&&!front)return;
      const col=p.r<1.6?'255,190,120':'190,120,230';c2.fillStyle='rgba('+col+','+(.25+.5*(1-p.z))*life+')';c2.fillRect(x,y,1.6,1.6);});
    for(let k=0;k<3;k++){c2.strokeStyle='rgba(255,'+(170-k*30)+','+(100+k*40)+','+(.35-k*.09)*life+')';c2.lineWidth=R*(.12-k*.03);c2.beginPath();c2.ellipse(0,0,R*(1.55+k*.35),R*(1.55+k*.35)*.3,0,Math.PI,0,true);c2.stroke();}
    c2.globalCompositeOperation='source-over';c2.fillStyle='#000';c2.beginPath();c2.arc(0,0,R,0,6.283);c2.fill();
    {const lg=c2.createLinearGradient(0,-R*1.4,0,0);lg.addColorStop(0,'rgba(255,200,140,'+(.55*life)+')');lg.addColorStop(1,'rgba(190,120,230,0)');c2.strokeStyle=lg;c2.lineWidth=R*.14;c2.beginPath();c2.ellipse(0,0,R*1.32,R*1.18,0,Math.PI,0,false);c2.stroke();}
    c2.strokeStyle='rgba(255,210,150,'+(.55+.4*flash)*life+')';c2.lineWidth=2;c2.beginPath();c2.arc(0,0,R*1.04,0,6.283);c2.stroke();
    c2.globalCompositeOperation='lighter';
    for(let k=0;k<3;k++){c2.strokeStyle='rgba(255,'+(170-k*30)+','+(100+k*40)+','+(.5-k*.12)*life+')';c2.lineWidth=R*(.12-k*.03);c2.beginPath();c2.ellipse(0,0,R*(1.55+k*.35),R*(1.55+k*.35)*.3,0,0,Math.PI);c2.stroke();}
    BH.fx.forEach(f=>{const k=(now-f.t)/1400;if(f.k==='hit'){c2.strokeStyle='rgba(255,240,210,'+(1-k)+')';c2.lineWidth=3;c2.beginPath();c2.arc(0,0,R*(1+k*3),0,6.283);c2.stroke();}
      else{for(let i=0;i<14;i++){const a=i*.45,r1=R*(4-3*k),r2=r1-R*.6;c2.strokeStyle='rgba(200,140,255,'+(.5*(1-k))+')';c2.lineWidth=1.2;c2.beginPath();c2.moveTo(Math.cos(a)*r1,Math.sin(a)*r1);c2.lineTo(Math.cos(a+.15)*r2,Math.sin(a+.15)*r2);c2.stroke();}}});
    c2.restore();
    c2.font='600 12px Geist,system-ui,sans-serif';c2.textAlign='center';c2.fillStyle='rgba(255,220,180,.7)';c2.fillText(b.beaten?'COLLAPSED':'HP '+b.hp+' / '+b.max,cx,cy+R*2.2+30);
    requestAnimationFrame(loop);}
  requestAnimationFrame(loop);
}

/* =================== formula drills =================== */
const DRC=['2','3','4','5'];
function drFrac(a){return'\\frac{1}{'+a+'}';}
function drCalcQ(){
  const a=DRC[Math.floor(Math.random()*4)],n=3+Math.floor(Math.random()*5),b=1+Math.floor(Math.random()*5),r=Math.random,f=drFrac(a);
  const D=[
    ['e^{'+a+'x}',a+'e^{'+a+'x}',['e^{'+a+'x}',f+'e^{'+a+'x}',a+'xe^{'+a+'x-1}']],
    ['\\sin('+a+'x)',a+'\\cos('+a+'x)',['-'+a+'\\cos('+a+'x)','\\cos('+a+'x)',f+'\\cos('+a+'x)']],
    ['\\cos('+a+'x)','-'+a+'\\sin('+a+'x)',[a+'\\sin('+a+'x)','-\\sin('+a+'x)',f+'\\sin('+a+'x)']],
    ['\\ln('+a+'x)','\\frac{1}{x}',['\\frac{'+a+'}{x}','\\frac{1}{'+a+'x}',a+'\\ln x']],
    ['x^{'+n+'}',n+'x^{'+(n-1)+'}',['x^{'+(n-1)+'}',n+'x^{'+(n+1)+'}','\\frac{x^{'+(n+1)+'}}{'+(n+1)+'}']],
    ['\\tan('+a+'x)',a+'\\sec^2('+a+'x)',['\\sec^2('+a+'x)','-'+a+'\\sec^2('+a+'x)',f+'\\sec^2('+a+'x)']],
    ['\\ln('+a+'x+'+b+')','\\frac{'+a+'}{'+a+'x+'+b+'}',['\\frac{1}{'+a+'x+'+b+'}',f+'\\ln('+a+'x+'+b+')','\\frac{'+a+'x}{'+a+'x+'+b+'}']],
    ['('+a+'x+'+b+')^{'+n+'}',(n*+a)+'('+a+'x+'+b+')^{'+(n-1)+'}',[n+'('+a+'x+'+b+')^{'+(n-1)+'}',(n*+a)+'('+a+'x+'+b+')^{'+n+'}','\\frac{('+a+'x+'+b+')^{'+(n+1)+'}}{'+(n+1)+'}']]];
  const I=[
    ['e^{'+a+'x}',f+'e^{'+a+'x}+c',[a+'e^{'+a+'x}+c','e^{'+a+'x}+c',a+'xe^{'+a+'x}+c']],
    ['\\sin('+a+'x)','-'+f+'\\cos('+a+'x)+c',[f+'\\cos('+a+'x)+c','-'+a+'\\cos('+a+'x)+c',a+'\\cos('+a+'x)+c']],
    ['\\cos('+a+'x)',f+'\\sin('+a+'x)+c',['-'+f+'\\sin('+a+'x)+c',a+'\\sin('+a+'x)+c','-'+a+'\\sin('+a+'x)+c']],
    ['x^{'+n+'}','\\frac{x^{'+(n+1)+'}}{'+(n+1)+'}+c',[n+'x^{'+(n-1)+'}+c','\\frac{x^{'+n+'}}{'+n+'}+c','\\frac{x^{'+(n+1)+'}}{'+n+'}+c']],
    ['\\frac{1}{'+a+'x+'+b+'}',f+'\\ln|'+a+'x+'+b+'|+c',['\\ln|'+a+'x+'+b+'|+c',a+'\\ln|'+a+'x+'+b+'|+c','-\\frac{1}{('+a+'x+'+b+')^2}+c']],
    ['\\sec^2('+a+'x)',f+'\\tan('+a+'x)+c',[a+'\\tan('+a+'x)+c','\\tan('+a+'x)+c','-'+f+'\\tan('+a+'x)+c']]];
  const isD=r()<.55,t=isD?D[Math.floor(r()*D.length)]:I[Math.floor(r()*I.length)];
  return{q:isD?'\\dfrac{d}{dx}\\left['+t[0]+'\\right]':'\\displaystyle\\int '+t[0]+'\\,dx',a:t[1],o:fxShuffle([t[1]].concat(t[2])),lab:isD?'Differentiate':'Integrate'};
}
function drSheetQ(sid){
  const all=[];(FORMULAS[sid]||[]).forEach(sec=>sec[1].forEach(r=>all.push({n:r[0],t:r[1],s:sec[0]})));
  const pool=all.filter((x,i)=>all.findIndex(y=>y.t===x.t)===i&&x.t.length<90);if(pool.length<4)return null;
  const x=pool[Math.floor(Math.random()*pool.length)],same=fxShuffle(pool.filter(y=>y!==x&&y.s===x.s)),other=fxShuffle(pool.filter(y=>y!==x&&y.s!==x.s));
  const wrong=same.concat(other).slice(0,3);return{q:null,name:x.n,sec:x.s,a:x.t,o:fxShuffle([x.t].concat(wrong.map(w=>w.t))),lab:'Which formula is this?'};
}
var DRT=null;
function fxDrill(){const D=MS.dr;if(!D.s||!subj(D.s))D.s=fmSubj();D.phase='setup';fxOpenOverlay('drill',fxDrillHTML);}
function drKey(){const D=MS.dr;return D.mode==='calc'?'calc':D.s+'|'+D.mode;}
function drNew(){const D=MS.dr;D.cur=D.mode==='calc'?drCalcQ():drSheetQ(D.s);D.pick=null;}
function fxDrillHTML(){
  const D=MS.dr,subs=VS(),best=(S.drill||{})[drKey()]||0;
  if(D.phase==='setup'){const calcOk=['mm','ms'].includes(D.s);if(D.mode==='calc'&&!calcOk)D.mode='sheet';
    return'<div class="fm-panel">'+fmH('Formula drills','60-second rounds')+'<div class="fc-grid"><label>Subject'+fmSel('dr.s',D.s,subs.map(s=>[s.id,s.name]))+'</label><label>Drill'+fmSel('dr.mode',D.mode,[['sheet','Formula sheet: name to formula']].concat(calcOk?[['calc','Derivatives and integrals']]:[]))+'</label><label>Length'+fmSel('dr.len',D.len,[[30,'30 seconds'],[60,'60 seconds'],[120,'2 minutes']])+'</label></div>'+
      '<p class="sub">Pick the right option as fast as you can. Wrong picks cost two seconds. Best for this drill: <b>'+best+'</b>.</p><div class="row"><button class="btn" data-fx="drgo">Start</button></div></div>';}
  if(D.phase==='run'){const c=D.cur;if(!c)return'<div class="fm-panel">'+fmH('Not enough formulas','Formula drills')+'</div>';
    return'<div class="fm-panel dr">'+'<div class="dr-top"><button class="x" data-fx="drstop" aria-label="Stop">×</button><span id="dr-t">'+Math.max(0,Math.ceil((D.end-Date.now())/1000))+'s</span><span>Score <b>'+D.score+'</b></span><span>Streak <b>'+D.streak+'</b></span></div>'+
      '<p class="eyebrow">'+esc(c.lab)+(c.sec?' · '+esc(c.sec):'')+'</p><div class="dr-q">'+(c.q?'$$'+c.q+'$$':'<b>'+esc(c.name)+'</b>')+'</div><div class="dr-o">'+c.o.map((o,i)=>'<button class="'+(D.pick!=null?(o===c.a?'ok':i===D.pick?'no':''):'')+'" data-fx="drpick" data-v="'+i+'">$$'+o+'$$</button>').join('')+'</div></div>';}
  return'<div class="fm-panel">'+fmH(D.score+' correct','Round over')+'<div class="fc-stat"><div><b>'+D.score+'</b><span>score</span></div><div><b>'+D.bestStreak+'</b><span>best streak</span></div><div><b>'+best+'</b><span>personal best</span></div></div>'+(D.newBest?'<p class="fb ok">New personal best.</p>':'')+'<div class="row"><button class="btn" data-fx="drgo">Go again</button><button class="btn ghost" data-fx="drsetup">Change drill</button><button class="btn ghost" data-fx="close">Close</button></div></div>';
}
function drStart(){const D=MS.dr;Object.assign(D,{phase:'run',score:0,streak:0,bestStreak:0,end:Date.now()+D.len*1000,newBest:false});drNew();fxRerender();
  clearInterval(DRT);DRT=setInterval(()=>{if(!FXOVER||FXOVER.kind!=='drill'||D.phase!=='run'){clearInterval(DRT);return;}const left=D.end-Date.now(),el=document.getElementById('dr-t');if(el)el.textContent=Math.max(0,Math.ceil(left/1000))+'s';if(left<=0)drEnd();},250);}
function drEnd(){const D=MS.dr;clearInterval(DRT);D.phase='done';S.drill=S.drill||{};const k=drKey();if(D.score>(S.drill[k]||0)){S.drill[k]=D.score;D.newBest=D.score>0;}S.cnt.drillBest=Math.max(S.cnt.drillBest||0,D.score);fxGain(Math.min(20,D.score));fxDirty();fxRerender();setTimeout(fxCheckAll,60);}
function drPick(i){const D=MS.dr,c=D.cur;if(D.phase!=='run'||D.pick!=null)return;D.pick=i;const ok=c.o[i]===c.a;
  if(ok){D.score++;D.streak++;D.bestStreak=Math.max(D.bestStreak,D.streak);}else{D.streak=0;D.end-=2000;}
  fxRerender();setTimeout(()=>{if(D.phase!=='run')return;if(Date.now()>=D.end)return drEnd();drNew();fxRerender();},ok?280:900);}

/* =================== CAS guides =================== */
const CAS=[
 ['all','Set radians or degrees',['Press [on], choose Settings → Document Settings, set Angle to Radian (or Degree), then Make Default.','The status bar at the top of a page shows RAD or DEG.'],['Tap the angle mode in the status bar at the bottom of the screen to switch between Rad and Deg.','Or open Setup (the O menu) → Basic Format → Angle.']],
 ['all','Exact answer vs decimal',['Press [enter] for an exact answer (Auto mode).','Press [ctrl] + [enter] for a decimal approximation, or wrap the expression in approx( ).'],['Switch Standard or Decimal in the status bar.','To convert one answer, select it and tap the ⇔ (approximate) button on the Main toolbar.']],
 ['all','Solve an equation',['In a Calculator page: [menu] → Algebra → Solve.','Type solve(2·e^(3x)=14, x).','Restrict the domain with the | (with) operator: solve(sin(x)=0.5, x) | 0≤x≤2π.'],['In the Main app: Interactive → Advanced → solve, or type solve(2e^(3x)=14, x).','Restrict the domain with the | (with) operator from the soft keyboard: solve(sin(x)=0.5, x) | 0≤x≤2π.']],
 ['all','Define a function',['[menu] → Actions → Define, then type Define f(x)=x²·e^(−x).','Now f(2), f(x+1) and d/dx(f(x)) all work.'],['Interactive → Define, or type Define f(x)=x²e^(−x) in Main.','Use f(2) and diff(f(x),x) afterwards.']],
 ['mm ms','Differentiate',['[menu] → Calculus → Derivative, or use the d/dx template from the template key.','At a point: d/dx(f(x)) | x=1.','Second derivative: use the d²/dx² template or d/dx(d/dx(f(x))).'],['Interactive → Calculation → diff, or the d/dx template on the Math2 keyboard.','At a point: diff(f(x),x,1,1) or diff(f(x),x) | x=1.']],
 ['mm ms','Integrate',['[menu] → Calculus → Integral, or the ∫ template.','Definite: ∫(x²,x,0,2). Leave the limits empty for an antiderivative (no +c is shown, so add it yourself).'],['Interactive → Calculation → ∫. Choose Indefinite or Definite and fill in the limits.','The ∫ template is on the Math2 keyboard. Add +c yourself for indefinite integrals.']],
 ['mm ms','Stationary points and graph features',['Graphs page: type the function in f1(x).','[menu] → Analyze Graph → Minimum, Maximum, Intersection or Inflection, then drag the lower and upper bounds around the point.','Algebraically: solve(d/dx(f(x))=0, x).'],['Graph & Table app: enter y1, tap the graph icon.','Analysis → G-Solve → Max, Min, Intersect or Inflection.','Algebraically: solve(diff(f(x),x)=0, x).']],
 ['mm','Normal distribution probability',['[menu] → Probability → Distributions → Normal Cdf.','normCdf(lower, upper, μ, σ). For “less than 50” use −∞ (or −9E999) as the lower bound.'],['Interactive → Distribution/Inv.Dist → Continuous → normCDf.','The wizard labels each box (Lower, Upper, σ, μ), so check σ and μ go in the right places.']],
 ['mm','Inverse normal',['[menu] → Probability → Distributions → Inverse Normal.','invNorm(area to the left, μ, σ).'],['Interactive → Distribution/Inv.Dist → Inverse → invNormCDf.','Set Tail to Left for “area to the left”, then enter the area, σ and μ.']],
 ['mm','Binomial probabilities',['[menu] → Probability → Distributions → Binomial Pdf for P(X = x): binomPdf(n, p, x).','Binomial Cdf for a range: binomCdf(n, p, lower, upper).'],['Interactive → Distribution/Inv.Dist → Discrete → binomialPDf for P(X = x).','binomialCDf for a range (Lower, Upper, Numtrial, pos).']],
 ['mm','Confidence interval for a proportion',['[menu] → Statistics → Confidence Intervals → 1-Prop z Interval.','Enter the number of successes x, the sample size n and the confidence level (e.g. 0.95).'],['Statistics app → Calc → Interval → One-Prop Z Int.','Enter C-Level, x and n, then Next.']],
 ['ms','Complex numbers',['Settings → Real or Complex: choose Rectangular (or Polar).','i is on the [π▸] key. Use cSolve(z^3=8, z) and cFactor( ) for complex roots and factors.','Convert forms with ▸Polar and ▸Rect from [menu] → Number → Complex Number Tools.'],['Switch Real to Cplx in the status bar.','i is on the Math1 or Math2 keyboard. solve(z^3=8, z) gives complex roots in Cplx mode.','Interactive → Transformation → compToPol / compToRect converts forms.']],
 ['ms','Matrices',['[menu] → Matrix & Vector → Create → Matrix, or the matrix template.','Store with A:=[[1,2][3,4]]. Then det(A), A^-1, ref(A), rref(A).'],['Use the matrix template on the Math2 keyboard. Store with [[1,2][3,4]]⇒A.','Interactive → Matrix → Calculation for det, ref, rref. A^-1 works directly.']],
 ['ms','Vectors',['Enter vectors as [1,2,3].','[menu] → Matrix & Vector → Vector → Dot Product dotP( ), Cross Product crossP( ), Norm norm( ), Unit Vector unitV( ).'],['Enter vectors as [1,2,3].','Interactive → Vector → dotP, crossP, norm, unitV, angle.']],
 ['ms','Differential equations',['deSolve(y′=k·y and y(0)=5, x, y). The ′ symbol is in the punctuation menu (or press [?!▸]).','[menu] → Calculus → Differential Equation Solver also works.'],['Interactive → Advanced → dSolve.','dSolve(y′=k·y, x, y, 0, 5) solves with y(0)=5.']],
 ['ms','Numerical integration and volumes',['Volume of revolution: π·∫((f(x))², x, a, b).','Use [ctrl]+[enter] to get a decimal when the exact form is messy.'],['π∫(f(x)², x, a, b) using the ∫ template.','Toggle Decimal in the status bar for a numeric answer.']],
 ['ph','Scientific notation',['Use the [EE] key: 6.67E−11 for 6.67×10⁻¹¹.','Set Display Digits in Document Settings (e.g. Float 4) to control decimals.'],['Use the E key on the Number keyboard: 6.67E−11.','Setup → Basic Format → Number Format sets significant figures (Sci or Fix).']],
 ['ph','Rearrange a formula',['solve(F=G·m1·m2/r², r) solves for r. Use · or * between letters so they are not read as one variable.','Add a condition for positive answers: | r>0.'],['solve(F=G×m1×m2/r², r). Put × between variables.','Add | r>0 to keep the positive solution.']],
 ['ph','Graph data and find a gradient',['Lists & Spreadsheet: enter data in two columns and name them.','[menu] → Statistics → Stat Calculations → Linear Regression (mx+b) gives the gradient m.'],['Statistics app: enter data in list1 and list2.','Calc → Regression → Linear Reg gives a and b (y = ax + b).']],
];
function fxCas(){fxOpenOverlay('cas',fxCasHTML);}
function fxCasList(){const C=MS.cas,cp=S.set.cas==='cp',q=(C.q||'').toLowerCase().trim();
  const L=CAS.filter(x=>(C.tag==='all'||x[0]==='all'||x[0].split(' ').includes(C.tag))&&(!q||(x[1]+' '+x[2].join(' ')+' '+x[3].join(' ')).toLowerCase().includes(q)));
  return L.length?L.map(x=>'<details class="cas"><summary>'+esc(x[1])+'</summary><ol>'+(cp?x[3]:x[2]).map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol></details>').join(''):'<p class="muted">Nothing matches that.</p>';}
function fxCasHTML(){const C=MS.cas;
  return'<div class="fm-panel">'+fmH('CAS guides','Calculator keystrokes')+'<div class="fc-grid"><label>Calculator'+fmSel('set.cas',S.set.cas||'ti',[['ti','TI-Nspire CX II CAS'],['cp','Casio ClassPad II (fx-CP400)']])+'</label><label>Topic'+fmSel('cas.tag',C.tag,[['all','Everything'],['mm','Methods'],['ms','Specialist'],['ph','Physics']])+'</label><label>Search<input type="text" data-fxm="cas.q" data-rr="0" value="'+esc(C.q)+'" placeholder="e.g. normal, solve, matrix"></label></div>'+
    '<div id="cas-list">'+fxCasList()+'</div><p class="sub">Menus can differ slightly between operating system versions. If a step does not match, find the command by name in the catalog (the book key on the TI, the Catalog keyboard on the ClassPad).</p></div>';}

/* =================== past-paper tracker =================== */
function fxPapers(o){const P=MS.pap;if(!P.s||!subj(P.s))P.s=fmSubj();if(!P.date)P.date=fxToday();if(o){Object.assign(P,o);}fxOpenOverlay('papers',fxPapersHTML);}
function fxPapersChart(){
  const L=(S.papers||[]).slice().sort((a,b)=>a.date<b.date?-1:1);if(L.length<2)return'';
  const t0=new Date(L[0].date).getTime(),t1=Math.max(t0+DAY,new Date(L[L.length-1].date).getTime()),X=t=>30+(t-t0)/(t1-t0)*540,Y=p=>170-p*1.5;
  let g='<svg viewBox="0 0 600 190" class="pp-chart">'+[0,50,100].map(p=>'<line x1="30" x2="570" y1="'+Y(p)+'" y2="'+Y(p)+'"/><text x="4" y="'+(Y(p)+4)+'">'+p+'%</text>').join('');
  VS().forEach(s=>{const l=L.filter(x=>x.s===s.id);if(!l.length)return;const pts=l.map(x=>[X(new Date(x.date).getTime()),Y(x.score/x.out*100)]);
    g+='<polyline fill="none" stroke="'+s.hue+'" stroke-width="2" points="'+pts.map(p=>p.join(',')).join(' ')+'"/>'+pts.map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="3.5" fill="'+s.hue+'"/>').join('');});
  return g+'</svg><div class="pp-key">'+VS().filter(s=>L.some(x=>x.s===s.id)).map(s=>'<span style="--c:'+s.hue+'"><i></i>'+esc(s.name)+'</span>').join('')+'</div>';}
function fxPapersHTML(){
  const P=MS.pap,L=(S.papers||[]).slice().sort((a,b)=>a.date<b.date?1:-1);
  let h='<div class="fm-panel">'+fmH('Past-paper tracker','Scores over time')+'<div class="fc-grid pp-form"><label>Subject'+fmSel('pap.s',P.s,VS().map(s=>[s.id,s.name]),false)+'</label><label>Paper<input type="text" data-fxm="pap.name" data-rr="0" value="'+esc(P.name)+'" placeholder="e.g. 2023 Paper 1"></label><label>Date<input type="date" data-fxm="pap.date" data-rr="0" value="'+esc(P.date)+'"></label><label>Score<input type="number" min="0" step="0.5" data-fxm="pap.score" data-rr="0" value="'+esc(P.score)+'"></label><label>Out of<input type="number" min="1" step="1" data-fxm="pap.out" data-rr="0" value="'+esc(P.out)+'"></label></div><div class="row"><button class="btn" data-fx="papadd">Add score</button></div>';
  h+=fxPapersChart();
  VS().forEach(s=>{const l=L.filter(x=>x.s===s.id);if(!l.length)return;const pc=l.map(x=>x.score/x.out*100),avg=pc.reduce((a,b)=>a+b,0)/pc.length;
    h+='<h4 class="eyebrow">'+esc(s.name)+' · average '+Math.round(avg)+'% · best '+Math.round(Math.max(...pc))+'%</h4><div class="pp-list">'+l.map(x=>'<div><b>'+esc(x.name||'Paper')+'</b><span>'+new Date(x.date+'T12:00:00').toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'})+'</span><span>'+x.score+' / '+x.out+'</span><em>'+Math.round(x.score/x.out*100)+'%</em><button class="x" data-fx="papdel" data-v="'+x.id+'" aria-label="Delete">×</button></div>').join('')+'</div>';});
  if(!L.length)h+='<p class="muted">Log every past paper and practice exam here. Once you have two, a trend line appears for each subject.</p>';
  return h+'<div class="row"><button class="btn ghost sm" data-fx="printing">Print a practice paper</button></div></div>';
}
function fxPapAdd(){const P=MS.pap,sc=parseFloat(P.score),out=parseFloat(P.out);
  if(!P.s||!(out>0)||!(sc>=0)||sc>out){toast('Enter a score and what it was out of.');return;}
  S.papers=(S.papers||[]).concat([{id:'p'+Date.now().toString(36),s:P.s,name:P.name.trim()||'Paper',date:P.date||fxToday(),score:sc,out:out}]);P.name='';P.score='';fxGain(10);fxDirty();toast('Score logged.');fxRerender();setTimeout(fxCheckAll,60);}

/* =================== printing (black and white) =================== */
function fxPrint(html,title){
  let el=document.getElementById('fx-print');if(!el){el=document.createElement('div');el.id='fx-print';document.body.appendChild(el);}
  el.innerHTML=html;document.body.classList.add('fx-printing');
  const go=()=>{const old=document.title;document.title=title||old;setTimeout(()=>{try{window.print();}catch(e){toast('Printing is blocked here. Open the website version to print.');}document.title=old;setTimeout(()=>document.body.classList.remove('fx-printing'),400);},120);};
  if(window.MathJax&&MathJax.typesetPromise){try{MathJax.typesetClear([el]);}catch(e){}MathJax.typesetPromise([el]).then(go,go);}else go();
}
addEventListener('afterprint',()=>document.body.classList.remove('fx-printing'));
const ptx=t=>inl(String(t||'')).replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
function fxPrinting(){const P=MS.pp;if(!P.s||!subj(P.s)){P.s=V.view==='subject'&&subj(V.subj)?V.subj:fmSubj();P.chs=fmDefaultChs(P.s);}fxOpenOverlay('printing',fxPrintingHTML);}
function fxPrintingHTML(){
  const P=MS.pp,n=Object.keys(P.chs).length;
  let h='<div class="fm-panel">'+fmH('Print','Black and white, ready for paper')+'<div class="tabs">'+[['paper','Practice paper'],['sheet','Cheat sheet']].map(t=>'<button role="tab" aria-selected="'+(P.kind===t[0])+'" data-fx="ppkind" data-v="'+t[0]+'">'+t[1]+'</button>').join('')+'</div>';
  h+='<div class="fc-grid"><label>Subject'+fmSel('pp.s',P.s,VS().map(s=>[s.id,s.name]))+'</label>';
  if(P.kind==='paper')h+='<label>Questions'+fmSel('pp.n',P.n,[[5,'5 questions'],[10,'10 questions'],[15,'15 questions'],[20,'20 questions'],[30,'30 questions']])+'</label><label>Working space'+fmSel('pp.space',P.space,[['s','Small'],['m','Medium'],['l','Large']])+'</label><label>Answers'+fmSel('pp.ans',P.ans,[['1','Marking guide at the end'],['0','No answers']])+'</label>';
  h+='</div>'+fmChPick('pp.chs',P.s,P.chs);
  if(P.kind==='paper')h+='<label class="chk"><input type="checkbox" data-fxm="pp.comets"'+(P.comets?' checked':'')+'> Include harder extension (comet) questions</label>';
  h+='<p class="sub">'+(P.kind==='paper'?'Questions come from the chapter question banks, numbered with working space, a name line and a time allowance. The marking guide starts on a new page so you can tear it off.':'One or two pages per chapter: key ideas, common traps and a worked example from every section, set in two columns.')+' Everything prints in black and white.</p>';
  return h+'<div class="row"><button class="btn" data-fx="ppgo"'+(n?'':' disabled')+'>Print '+(P.kind==='paper'?'paper':'cheat sheet')+'</button></div></div>';
}
function fxPaperHTML(title,qs,minutes,guide,space){
  const tot=qs.reduce((a,q)=>a+(q.marks||0),0);
  let h='<div class="pr pr-paper"><div class="pr-head"><h1>'+esc(title)+'</h1><p>Name ____________________________ &nbsp; Date ______________ &nbsp; Time allowed: '+minutes+' minutes'+(tot?' &nbsp; Total: '+tot+' marks':'')+'</p></div>';
  h+=qs.map((q,i)=>'<div class="pq"><p class="pq-n"><b>Question '+(i+1)+'</b>'+(q.marks?' <span>['+q.marks+' mark'+(q.marks===1?'':'s')+']</span>':'')+(q.topic?' <em>'+esc(q.topic)+'</em>':'')+'</p><div class="pq-t">'+ptx(q.q)+'</div><div class="pq-w sp-'+(space||'m')+'"></div></div>').join('');
  if(guide){h+='<div class="pr-break"></div><div class="pr-head"><h1>Marking guide</h1><p>'+esc(title)+'</p></div>'+qs.map((q,i)=>'<div class="pg"><p><b>Question '+(i+1)+'.</b> Answer: '+ptx(q.answer)+'</p>'+(q.guide?'<div class="pg-g">'+ptx(q.guide)+'</div>':'')+(q.solution?'<div class="pg-s">'+ptx(q.solution)+'</div>':'')+'</div>').join('');}
  return h+'</div>';
}
function fxPrintGo(){
  const P=MS.pp,s=subj(P.s),ids=fmChList(P.s).map(x=>x.c.id).filter(id=>P.chs[id]);if(!ids.length)return;
  if(P.kind==='sheet'){
    let h='<div class="pr pr-sheet">';
    ids.forEach(id=>{const f=findCh(id),ct=CT[id];h+='<div class="cs"><h1>'+esc(s.name+' · Unit '+f.u+' · Chapter '+numOf(f.ch,f.i)+': '+f.ch.title)+'</h1>'+(ct.summary?'<p class="cs-sum">'+ptx(ct.summary)+'</p>':'');
      ct.sections.forEach(sec=>{const keys=sec.blocks.filter(b=>b.t==='key'),warns=sec.blocks.filter(b=>b.t==='warn'),ex=sec.blocks.find(b=>b.t==='ex');if(!keys.length&&!warns.length&&!ex)return;
        h+='<div class="cs-sec"><h2>'+esc((sec.code==='X'?'':sec.code+' ')+sec.title)+'</h2>'+keys.map(b=>'<div class="cs-key">'+ptx(b.x)+'</div>').join('')+warns.slice(0,2).map(b=>'<div class="cs-trap"><b>Trap:</b> '+ptx(b.x)+'</div>').join('')+
          (ex?'<div class="cs-ex"><b>Example:</b> '+ptx(ex.q)+'<br><b>Answer:</b> '+ptx(ex.a)+'</div>':'')+'</div>';});
      h+='</div>';});
    fxPrint(h+'</div>','Cheat sheet - '+s.name);S.flags.printed=1;fxDirty();return;}
  const pool=[];ids.forEach(id=>{const ct=CT[id];ct.quiz.forEach((q,i)=>pool.push({src:q,ch:id,c:false}));if(P.comets)(ct.comets||[]).forEach(q=>pool.push({src:q,ch:id,c:true}));});
  const per={};fxShuffle(pool);const pick=[];let round=0;
  while(pick.length<Math.min(P.n,pool.length)&&round<50){ids.forEach(id=>{if(pick.length>=P.n)return;const k=pool.findIndex(x=>x.ch===id&&!x.used);if(k>=0){pool[k].used=1;pick.push(pool[k]);}});round++;}
  pick.sort((a,b)=>(a.c-b.c)||ids.indexOf(a.ch)-ids.indexOf(b.ch));
  const qs=pick.map(x=>({q:x.src.q,answer:x.src.ad||x.src.a,solution:x.src.sol,topic:x.src.topic?x.src.topic.replace(/^Extension:\s*/,''):'',marks:x.c?4:((x.src.sol||'').length>140?3:(x.src.sol||'').length>60?2:1)}));
  const mins=qs.reduce((a,q)=>a+q.marks*2.5,0);
  fxPrint(fxPaperHTML(s.name+' practice paper',qs,Math.max(10,Math.round(mins/5)*5),P.ans==='1',P.space),s.name+' practice paper');S.flags.printed=1;fxDirty();
}

/* =================== AI practice exam =================== */
function fxExam(){const E=MS.ex;if(!E.s||!subj(E.s)){E.s=V.view==='subject'&&subj(V.subj)?V.subj:fmSubj();E.chs=fmDefaultChs(E.s);}E.view=(S.genex||[]).length&&E.view!=='take'?'home':E.view==='take'?'take':'setup';fxOpenOverlay('exam',fxExamHTML);}
var EXT=null;
function fxExamHTML(){
  const E=MS.ex,saved=S.genex||[];
  if(E.view==='take'&&E.cur){const x=saved.find(z=>z.id===E.cur);if(!x){E.view='home';return fxExamHTML();}
    const left=E.end?Math.max(0,E.end-Date.now()):x.min*60e3;
    return'<div class="fm-panel ex-take">'+fmH(esc(x.title),subj(x.s)?esc(subj(x.s).name)+' · '+x.min+' minutes':'')+'<div class="ex-bar"><span id="ex-t" class="'+(E.end&&left<5*60e3?'low':'')+'">'+fxMMSS(left)+'</span>'+(E.end?'<button class="btn ghost sm" data-fx="exstop">Stop timer</button>':'<button class="btn sm" data-fx="exstart">Start the timer</button>')+
      '<button class="btn ghost sm" data-fx="exprint" data-v="paper">Print paper</button><button class="btn ghost sm" data-fx="exprint" data-v="guide">Print with marking guide</button><button class="btn ghost sm" data-fx="exlog">Log my score</button><button class="btn link" data-fx="exhome">All exams</button></div>'+
      x.qs.map((q,i)=>'<div class="ex-q"><p class="eyebrow">Question '+(i+1)+' · '+(q.marks||1)+' mark'+(q.marks===1?'':'s')+(q.topic?' · '+esc(q.topic):'')+'</p><div class="qr-q">'+fxText(q.q)+'</div>'+
        (E.open&&E.open[i]?'<div class="qr-a"><p><b>Answer:</b> '+inl(q.answer||'')+'</p>'+(q.guide?'<p><b>Marking guide</b></p>'+fxText(q.guide):'')+(q.solution?'<p><b>Worked solution</b></p>'+fxText(q.solution):'')+'</div>':'')+
        '<div class="row"><button class="btn link" data-fx="exopen" data-v="'+i+'">'+(E.open&&E.open[i]?'Hide':'Show')+' marking guide</button><button class="btn link" data-fx="exphoto" data-v="'+i+'">Mark my working from a photo</button></div></div>').join('')+'</div>';}
  if(E.view==='home'&&saved.length&&!E.busy)return'<div class="fm-panel">'+fmH('Practice exams','Made by Claude')+'<div class="pp-list">'+saved.slice().reverse().map(x=>'<div><b>'+esc(x.title)+'</b><span>'+esc(subj(x.s)?subj(x.s).name:'')+' · '+x.qs.length+' questions · '+x.min+' min</span><span>'+new Date(x.t).toLocaleDateString('en-AU',{day:'numeric',month:'short'})+'</span><button class="btn sm" data-fx="extake" data-v="'+x.id+'">Open</button><button class="x" data-fx="exdel" data-v="'+x.id+'" aria-label="Delete">×</button></div>').join('')+'</div><div class="row"><button class="btn" data-fx="exnew">Make a new exam</button></div></div>';
  const n=Object.keys(E.chs).length;
  return'<div class="fm-panel">'+fmH('Make a practice exam','Made by Claude')+'<div class="fc-grid"><label>Subject'+fmSel('ex.s',E.s,VS().map(s=>[s.id,s.name]))+'</label><label>Time'+fmSel('ex.min',E.min,[[30,'30 minutes'],[60,'60 minutes'],[90,'90 minutes'],[120,'2 hours']])+'</label><label>Style'+fmSel('ex.style',E.style,[['mixed','Mixed short and extended response'],['short','Short response only'],['tf','Technology-free (no CAS)'],['ta','Technology-active (CAS allowed)']])+'</label><label>Difficulty'+fmSel('ex.diff',E.diff,[['mixed','Exam-like mix'],['hard','Harder (aiming for an A)'],['easy','Gentler (building confidence)']])+'</label></div>'+
    fmChPick('ex.chs',E.s,E.chs)+(E.err?'<p class="fb no">'+esc(E.err)+'</p>':'')+
    '<div class="row"><button class="btn" data-fx="exgen"'+(n&&!E.busy?'':' disabled')+'>'+(E.busy?'<span class="spin"></span> Writing your exam…':'Make the exam')+'</button>'+(saved.length?'<button class="btn link" data-fx="exhome">Saved exams</button>':'')+'</div><p class="sub">Claude writes new questions in QCAA style with marks and a marking guide. This takes about a minute and uses '+(WEB?'your API key':'some of your Claude usage')+'.</p></div>';
}
async function fxExamGen(){
  const E=MS.ex,s=subj(E.s),chs=fmChList(E.s).filter(x=>E.chs[x.c.id]);if(!chs.length||E.busy)return;E.busy=true;E.err='';fxRerender();
  const style={mixed:'a mix of short-response and multi-part extended-response questions',short:'short-response questions only',tf:'technology-free questions (no calculator), like QCAA Paper 1',ta:'technology-active questions where a CAS calculator is expected, like QCAA Paper 2'}[E.style];
  const diff={mixed:'a realistic exam spread of simple familiar, complex familiar and complex unfamiliar questions',hard:'mostly complex familiar and complex unfamiliar questions for a student aiming for an A',easy:'mostly simple familiar questions with a couple of complex familiar ones'}[E.diff];
  const syl=chs.map(x=>'- Unit '+x.u+' chapter '+x.n+': '+x.c.title+' (sections: '+CT[x.c.id].sections.filter(z=>z.code!=='X').map(z=>z.title).join('; ')+')').join('\n');
  const prompt='Write an original practice exam for a Year 12 Queensland QCE '+s.name+' student, in the style of QCAA external exam questions.\nTopics to cover:\n'+syl+'\nTime allowed: '+E.min+' minutes (about 1 mark per 1.2 minutes). Use '+style+', with '+diff+'. Spread questions across all listed topics. Multi-part questions put each part (a), (b), (c) on its own line with its own marks.\n'+
    'Return JSON: {"title":"short exam title","questions":[{"topic":"short topic","marks":3,"q":"question text","answer":"final answers only","guide":"marking guide: one line per mark saying exactly what earns it","solution":"full worked solution"}]}.\nWrite all maths in LaTeX inside $...$ (inline) or $$...$$ (display). Escape every backslash for JSON (write \\\\frac). Use \\n for line breaks. Never refer to a diagram unless you describe it fully in words.';
  try{const smp=await getSample();if(!smp)throw{code:WEB?'nokey':'unavailable'};
    const r=await smp.json(prompt,{modelTier:'complex',max:16000});
    const qs=(r&&r.questions||[]).filter(q=>q&&q.q).map(q=>({topic:String(q.topic||''),marks:Math.max(1,Math.min(20,+q.marks||1)),q:String(q.q),answer:String(q.answer||''),guide:String(q.guide||''),solution:String(q.solution||'')}));
    if(!qs.length)throw{message:'Claude did not return any questions. Try again.'};
    const x={id:'x'+Date.now().toString(36),t:Date.now(),s:s.id,title:String(r.title||s.name+' practice exam'),min:+E.min,qs:qs};
    S.genex=(S.genex||[]).concat([x]).slice(-8);S.flags.genex=1;fxDirty();E.cur=x.id;E.view='take';E.end=0;E.open={};
  }catch(e){E.err=errText(e);}
  E.busy=false;fxRerender();
}
function fxExamTick(){clearInterval(EXT);EXT=setInterval(()=>{const E=MS.ex;if(!E.end||!FXOVER||FXOVER.kind!=='exam'){return;}const left=E.end-Date.now(),el=document.getElementById('ex-t');if(el){el.textContent=fxMMSS(Math.max(0,left));el.classList.toggle('low',left<5*60e3);}if(left<=0){E.end=0;fxChime(2);toast('Time is up. Pens down.');fxRerender();}},500);}

/* =================== photo marking =================== */
function fxPhoto(o){const P=MS.ph;if(o)Object.assign(P,o,{res:null,err:''});fxOpenOverlay('photo',fxPhotoHTML);}
function fxImgFromFile(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onerror=()=>rej({message:'That file could not be read.'});fr.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,1568/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);
  const url=c.toDataURL('image/jpeg',.85);c.toBlob(b=>b?res({blob:b,url:url}):rej({message:'That image could not be prepared.'}),'image/jpeg',.85);};im.onerror=()=>rej({message:'That file is not an image this browser can read. Try a JPG or PNG.'});im.src=fr.result;};fr.readAsDataURL(file);});}
async function fxPhotoFiles(files){const P=MS.ph;P.err='';for(const f of Array.from(files||[]).slice(0,4-P.imgs.length)){try{P.imgs.push(await fxImgFromFile(f));}catch(e){P.err=e.message||'Could not read that image.';}}P.res=null;fxRerender();}
function fxPhotoHTML(){
  const P=MS.ph,opts=[['','Not sure / any chapter']];VS().forEach(s=>fmChList(s.id).forEach(x=>opts.push([x.c.id,s.name+' · U'+x.u+' · '+x.n+' · '+x.c.title])));
  let h='<div class="fm-panel">'+fmH('Photo marking','Made by Claude')+'<p class="muted">Take a clear photo of your handwritten working, in good light, one question per photo if you can. Claude reads it and marks it like a QCAA marker, line by line.</p>'+
    '<label class="fm-l">The question (optional if it is in the photo)<textarea rows="3" data-fxm="ph.q" data-rr="0" placeholder="Type or paste the question">'+esc(P.q)+'</textarea></label>'+
    '<label class="fm-l">Chapter'+fmSel('ph.ch',P.ch,opts,false)+'</label>'+
    '<div class="ph-imgs">'+P.imgs.map((m,i)=>'<div><img src="'+m.url+'" alt="Photo '+(i+1)+'"><button class="x" data-fx="phdel" data-v="'+i+'" aria-label="Remove">×</button></div>').join('')+(P.imgs.length<4?'<label class="ph-add"><input type="file" id="ph-file" accept="image/*" capture="environment" multiple><span>+ Add photo</span></label>':'')+'</div>'+
    (P.err?'<p class="fb no">'+esc(P.err)+'</p>':'')+
    '<div class="row"><button class="btn" data-fx="phgo"'+(P.imgs.length&&!P.busy?'':' disabled')+'>'+(P.busy?'<span class="spin"></span> Marking…':'Mark my working')+'</button>'+(P.imgs.length?'<button class="btn link" data-fx="phclear">Start over</button>':'')+'</div>';
  const r=P.res;
  if(r){h+='<div class="ph-res"><div class="ph-score"><b>'+(r.score!=null?r.score+' / '+r.outOf:'')+'</b><span>'+inl(r.verdict||'')+'</span></div>'+(r.question?'<p class="sub"><b>Question read as:</b> '+inl(r.question)+'</p>':'')+
    '<ol class="ph-steps">'+(r.steps||[]).map(s=>'<li class="'+(s.ok===false?'no':s.ok==='partial'?'part':'ok')+'"><span class="w">'+inl(s.work||'')+'</span><span class="c">'+inl(s.comment||'')+'</span></li>').join('')+'</ol>'+
    ((r.errors||[]).length?'<h4 class="eyebrow">What to fix</h4>'+(r.errors||[]).map(e=>'<p><b>'+esc(e.type||'Error')+(e.topic?' · '+esc(e.topic):'')+':</b> '+inl(e.fix||'')+'</p>').join(''):'')+
    (r.next?'<p class="sub"><b>Next time:</b> '+inl(r.next)+'</p>':'')+
    ((r.errors||[]).length?'<div class="row"><button class="btn ghost sm" data-fx="phsave"'+(P.ch?'':' disabled title="Pick a chapter first"')+'>'+(P.saved?'Saved to mistake nebula':'Add to my mistake nebula')+'</button></div>':'')+'</div>';}
  return h+'</div>';
}
async function fxPhotoGo(){
  const P=MS.ph;if(!P.imgs.length||P.busy)return;P.busy=true;P.err='';P.res=null;P.saved=false;fxRerender();
  const f=P.ch?findCh(P.ch):null;
  const prompt='You are an experienced QCAA marker for Year 12 Queensland QCE '+(f?f.s.name+' (chapter: '+f.ch.title+')':'mathematics or physics')+'. The image'+(P.imgs.length>1?'s show':' shows')+' a student\'s handwritten working.'+(P.q.trim()?'\nThe question is: '+P.q.trim():'\nThe question should be visible in the image; if not, infer it from the working.')+
    '\nMark it as you would in a real exam: award method and accuracy marks, follow through errors fairly, and be encouraging but honest. Transcribe each line of working you can read.\nReturn JSON: {"question":"the question as you understood it","score":number,"outOf":number,"verdict":"one or two sentence overall comment","steps":[{"work":"the student line, transcribed","ok":true or false or "partial","comment":"short reason"}],"errors":[{"type":"method, careless, concept, notation or communication","topic":"short topic","fix":"what to do differently"}],"next":"one specific tip"}.\nWrite maths in LaTeX inside $...$ and escape backslashes for JSON. If the image is unreadable, set score to null and explain in verdict.';
  try{const smp=await getSample();if(!smp)throw{code:WEB?'nokey':'unavailable'};
    P.res=await smp.json(prompt,{images:P.imgs.map(m=>m.blob),modelTier:'complex',max:4000});S.flags.photo=1;
    if(P.res&&P.res.score!=null&&P.res.outOf&&+P.res.score>=+P.res.outOf)S.flags.photoFull=1;fxGain(5);fxDirty();setTimeout(fxCheckAll,60);
  }catch(e){P.err=e&&e.code==='images'?'Photo marking is not available in this version. Use the website version with your API key.':errText(e);}
  P.busy=false;fxRerender();
}
function fxPhotoSave(){const P=MS.ph,r=P.res;if(!r||!P.ch||P.saved)return;
  (r.errors||[]).forEach(e=>S.mistakes.push({id:'m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),ch:P.ch,topic:e.topic||'Photo-marked work',q:r.question||P.q||'Photo-marked question',a:e.fix||'',type:/careless/i.test(e.type)?'careless':/concept/i.test(e.type)?'concept':'method',conf:null,t:Date.now(),rights:[]}));
  P.saved=true;fxDirty();toast('Added to your mistake nebula.');fxRerender();}

/* =================== explain it differently =================== */
var EXPL={};
function fxExplRow(cid,sec){const k=cid+'|'+sec.id,e=EXPL[k];
  return'<div class="fx-expl"><span>Explain it differently:</span>'+[['simple','Simpler'],['analogy','With an analogy'],['example','Another worked example']].map(m=>'<button class="fxt txt'+(e&&e.mode===m[0]?' on':'')+'" data-fx="expl" data-v="'+k+'|'+m[0]+'"'+(e&&e.busy?' disabled':'')+'>'+m[1]+'</button>').join('')+'</div>'+
    (e?'<div class="fx-explout lesson" id="expl-'+esc(k).replace(/[^a-z0-9]/gi,'_')+'">'+(e.text?md(e.text):'<span class="spin"></span>')+(e.busy?'':'<button class="btn link" data-fx="explx" data-v="'+k+'">Hide</button>')+'</div>':'');}
async function fxExpl(v){
  const p=v.split('|'),cid=p[0],sid=p[1],mode=p[2],k=cid+'|'+sid,f=findCh(cid),ct=CT[cid];if(!f||!ct)return;const sec=ct.sections.find(x=>x.id===sid);if(!sec)return;
  if(EXPL[k]&&EXPL[k].busy)return;const me={mode:mode,text:'',busy:true};EXPL[k]=me;renderPanel();
  const body=sec.blocks.map(b=>[b.title,b.x,b.q,(b.s||[]).join(' '),b.a].filter(Boolean).join(' ')).join('\n').slice(0,3500);
  const how={simple:'Re-explain it in simpler words with short sentences, for a student who found it confusing. Build up one idea at a time and finish with the one thing to remember.',
    analogy:'Explain it through one vivid everyday analogy or picture, then map the analogy back onto the actual maths or physics precisely, so nothing is left vague.',
    example:'Give one NEW fully worked example with different numbers from any in the section. Show every step and say briefly why each step is done.'}[mode];
  const prompt='You are a warm, clear tutor for a Year 12 student. '+ctxLine(f)+'\nSection '+sec.code+': '+sec.title+'\nWhat the student just read:\n'+body+'\n\n'+how+' Under 230 words. '+MATHSTYLE;
  const id='expl-'+k.replace(/[^a-z0-9]/gi,'_');
  try{const t=await askText(prompt,x=>{if(EXPL[k]!==me)return;me.text=x.text;const el=document.getElementById(id);if(el)el.innerHTML=md(me.text);},null);me.text=t;}
  catch(e){me.text=errText(e);}
  me.busy=false;if(EXPL[k]===me)renderPanel();
}

/* =================== streak shields =================== */
function fxStudyDays(){const d=new Set(S.log.map(e=>dayKey(e.t)));Object.keys(S.time||{}).forEach(k=>{if(S.time[k]>=600)d.add(k);});return d;}
function fxStreakDays(){const d=fxStudyDays();((S.shield||{}).used||[]).forEach(k=>d.add(k));return d;}
function fxShieldCheck(){
  const sh=S.shield||(S.shield={n:0,used:[],e:0,sid:''});const days=fxStreakDays(),d=new Date();d.setDate(d.getDate()-1);const gaps=[];
  for(let i=0;i<3;i++){const k=dayKey(d.getTime());if(days.has(k))break;gaps.push(k);d.setDate(d.getDate()-1);}
  if(gaps.length&&gaps.length<3&&gaps.length<=sh.n&&days.has(dayKey(d.getTime()))){gaps.forEach(k=>sh.used.push(k));sh.n-=gaps.length;sh.used=sh.used.slice(-30);fxDirty();setTimeout(()=>toast('A streak shield covered the day you missed, so your streak is safe.'),2500);}
  const sk=streakInfo();if(!sk.n)return;const st=new Date();if(!sk.today)st.setDate(st.getDate()-1);st.setDate(st.getDate()-sk.n+1);const sid=dayKey(st.getTime());
  if(sh.sid!==sid){sh.sid=sid;sh.e=0;}const wk=Math.floor(sk.n/7);
  if(wk>sh.e){const add=Math.min(wk-sh.e,3-sh.n);sh.e=wk;if(add>0){sh.n+=add;fxDirty();toast('You earned a streak shield for a '+(wk*7)+'-day streak. It covers one missed day automatically.');}}
}
var SHI='<svg viewBox="0 0 24 24" class="fx-shi"><path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6z"/></svg>';
function fxShieldTag(){const n=(S.shield||{}).n||0;return n?' <span class="fx-sh" title="'+n+' streak shield'+(n===1?'':'s')+'">'+SHI+n+'</span>':'';}
function fxShieldLine(){const n=(S.shield||{}).n||0;return'Streak shields: '+n+' of 3. You earn one for every 7 days in a row, and each covers one missed day automatically. Days with 10+ minutes of study count toward your streak.';}
setTimeout(()=>{try{fxShieldCheck();chrome();}catch(e){}},1500);setInterval(()=>{try{fxShieldCheck();}catch(e){}},5*60e3);

/* =================== growing planets =================== */
function fxGrow(c,x,y,r,t,ss,info){
  if(!info)return;const f=fxChDone(c),st=ss.st,solid=st==='solid'||st==='due';
  const cc=info.comets.length,caught=info.comets.filter((q,k)=>S.comets[c.id+'-c'+k]).length,best=((S.progress[c.id]||{}).best||0);
  if(f>.05){const R=r*(3+4.5*f);const g=ctx.createRadialGradient(x,y,r,x,y,R);g.addColorStop(0,rgba(ss.c,.16*f));g.addColorStop(1,rgba(ss.c,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,R,0,6.283);ctx.fill();}
  if(solid){ctx.save();ctx.translate(x,y);ctx.rotate(-.38);ctx.strokeStyle=rgba(ss.c,.5);ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(0,0,r*5.2,r*1.55,0,0,6.283);ctx.stroke();
    if(cc&&caught>=cc||best>=.95){ctx.strokeStyle=rgba('#f6dfae',.35);ctx.lineWidth=.9;ctx.beginPath();ctx.ellipse(0,0,r*6.3,r*1.9,0,0,6.283);ctx.stroke();}
    ctx.restore();}
  if(solid&&cc&&caught>=cc){const a=(REDUCE?.8:t*.0007)+hashS(c.id)%6,mx=x+Math.cos(a)*r*7,my=y+Math.sin(a)*r*2.6;ctx.fillStyle='rgba(235,235,245,.85)';ctx.beginPath();ctx.arc(mx,my,Math.max(1.4,r*.32),0,6.283);ctx.fill();}
}

/* =================== galaxy timelapse =================== */
function fxTimelapse(){MS.tl={play:true,p:0,t0:performance.now(),dur:16000,flash:{}};fxOpenOverlay('tl',()=>'<div class="tl-ui">'+fmH('Galaxy timelapse','Your term, replayed')+'<p class="muted" id="tl-msg"></p></div><div class="tl-ctl"><button class="btn sm" data-fx="tlplay">Pause</button><button class="btn ghost sm" data-fx="tlre">Replay</button></div>',{canvas:true,onOpen:fxTLLoop});}
function fxTLLoop(el){
  const cv2=el.querySelector('canvas.fxbg'),c2=cv2.getContext('2d');
  function size(){const d=Math.min(devicePixelRatio||1,1.5);cv2.width=innerWidth*d;cv2.height=innerHeight*d;c2.setTransform(d,0,0,d,0,0);}size();addEventListener('resize',size);
  const ev=S.log.filter(e=>e.ch&&e.after).sort((a,b)=>a.t-b.t);const tdays=Object.keys(S.time||{}).sort();
  const start=Math.min(ev.length?ev[0].t:Date.now(),tdays.length?new Date(tdays[0]+'T00:00:00').getTime():Date.now(),Date.now()-DAY),end=Date.now();
  const msg=document.getElementById('tl-msg');if(msg)msg.textContent=ev.length||tdays.length?'From '+new Date(start).toLocaleDateString('en-AU',{day:'numeric',month:'long'})+' to today.':'Nothing to replay yet. Study a few chapters and come back.';
  const subs=VS(),nd=Math.max(1,Math.ceil((end-start)/DAY));const daily=[];let mx=1;for(let i=0;i<nd;i++){const k=dayKey(start+i*DAY+DAY/2),v=(S.time||{})[k]||0;daily.push(v);mx=Math.max(mx,v);}
  const T=MS.tl;let last=performance.now();
  function loop(now){
    if(!FXOVER||FXOVER.kind!=='tl'){removeEventListener('resize',size);return;}
    if(T.play){T.p=Math.min(1,T.p+(now-last)/T.dur);if(T.p>=1)T.play=false;}last=now;
    const w=innerWidth,h=innerHeight,at=start+(end-start)*T.p;c2.clearRect(0,0,w,h);
    const st={};ev.forEach(e=>{if(e.t<=at){if(st[e.ch]!==e.after&&at-e.t<(end-start)*.03)T.flash[e.ch]=e.t;st[e.ch]=e.after;}});
    let hrs=0;Object.keys(S.time||{}).forEach(k=>{if(new Date(k+'T12:00:00').getTime()<=at)hrs+=S.time[k]/3600;});
    subs.forEach((s,si)=>{const cx=w*(si+1)/(subs.length+1),cy=h*.47,R=Math.min(w/(subs.length+1)*.42,h*.26);const L=allChapters(s);
      c2.font='600 13px Geist,system-ui,sans-serif';c2.textAlign='center';c2.fillStyle='rgba(238,240,246,.8)';c2.fillText(s.name,cx,cy+R+34);
      const lit=L.filter(c=>st[c.id]==='solid'||st[c.id]==='due').length;c2.font='500 10.5px Geist,system-ui,sans-serif';c2.fillStyle='rgba(160,168,186,.8)';c2.fillText(lit+' / '+L.length+' SOLID',cx,cy+R+52);
      let prev=null;L.forEach((c,j)=>{const a=j*2.39996,rr=R*Math.sqrt((j+.6)/L.length),x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.8,sv=st[c.id]||'new',col=sv==='new'?'#3a4052':COL[sv]||'#888';
        if(prev&&sv!=='new'&&prev.on){c2.strokeStyle=rgba(s.hue,.25);c2.lineWidth=1;c2.beginPath();c2.moveTo(prev.x,prev.y);c2.lineTo(x,y);c2.stroke();}
        if(sv!=='new'){c2.globalCompositeOperation='lighter';const g=c2.createRadialGradient(x,y,0,x,y,sv==='solid'||sv==='due'?16:10);g.addColorStop(0,rgba(col,.8));g.addColorStop(1,rgba(col,0));c2.fillStyle=g;c2.beginPath();c2.arc(x,y,16,0,6.283);c2.fill();c2.globalCompositeOperation='source-over';}
        c2.fillStyle=sv==='new'?'#6a7290':'#fff';c2.beginPath();c2.arc(x,y,sv==='new'?2:2.6,0,6.283);c2.fill();
        const fl=T.flash[c.id];if(fl!=null){const k=Math.min(1,(at-fl)/((end-start)*.03));if(k<1){c2.strokeStyle=rgba(col,1-k);c2.lineWidth=1.5;c2.beginPath();c2.arc(x,y,4+k*28,0,6.283);c2.stroke();}}
        prev={x:x,y:y,on:sv!=='new'};});});
    c2.textAlign='center';c2.font='600 30px Geist,system-ui,sans-serif';c2.fillStyle='#fff';c2.fillText(new Date(at).toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'long'}),w/2,h*.13+40);
    c2.font='500 12px Geist,system-ui,sans-serif';c2.fillStyle='rgba(200,205,220,.75)';c2.fillText(hrs.toFixed(1)+' HOURS STUDIED',w/2,h*.13+62);
    const bx=w*.12,bw=w*.76,by=h-150,bh=44,bwid=bw/nd;daily.forEach((v,i)=>{const x=bx+i*bwid,on=start+i*DAY<=at;c2.fillStyle=on?'rgba(232,201,138,.75)':'rgba(255,255,255,.1)';const hh=Math.max(1,v/mx*bh);c2.fillRect(x+bwid*.15,by+bh-hh,Math.max(1,bwid*.7),hh);});
    c2.fillStyle='#fff';c2.fillRect(bx+bw*T.p-1,by-6,2,bh+10);
    requestAnimationFrame(loop);}
  requestAnimationFrame(loop);
}

/* =================== focus sound mixer =================== */
var MIXL=[['hum','Space hum'],['rain','Rain'],['brown','Brown noise'],['keys','Lo-fi keys'],['drums','Lo-fi drums'],['crackle','Vinyl crackle']];
var MIXP={space:{hum:.7,rain:0,brown:0,keys:0,drums:0,crackle:0},rain:{hum:.15,rain:.75,brown:.15,keys:0,drums:0,crackle:0},lofi:{hum:0,rain:0,brown:0,keys:.6,drums:.45,crackle:.35},lofirain:{hum:0,rain:.5,brown:0,keys:.5,drums:.35,crackle:.25},deep:{hum:0,rain:0,brown:.7,keys:0,drums:0,crackle:0}};
var MX=null;
function fxMixOn(){return !!S.set.sound&&(!S.set.mixFocus||FT.ph==='work');}
function fxNoise(ac,secs,kind){const b=ac.createBuffer(1,ac.sampleRate*secs,ac.sampleRate),d=b.getChannelData(0);let l=0;
  for(let i=0;i<d.length;i++){const w=Math.random()*2-1;if(kind==='brown'){l=(l+.02*w)/1.02;d[i]=l*3.5;}else if(kind==='crackle'){d[i]=Math.random()<.0009?(Math.random()*2-1)*.9:w*.004;}else d[i]=w;}return b;}
function fxMixStart(){
  const a=fxAudio();if(!a)return null;if(a.ac.state==='suspended')a.ac.resume();if(MX)return MX;const ac=a.ac;
  const bus=ac.createGain();bus.gain.value=0;bus.connect(ac.destination);
  const lay={};const mk=k=>{const g=ac.createGain();g.gain.value=0;g.connect(bus);lay[k]=g;return g;};
  const loop=(buf,node)=>{const s=ac.createBufferSource();s.buffer=buf;s.loop=true;s.connect(node);s.start();return s;};
  const white=fxNoise(ac,3,'white');
  {const g=mk('rain'),hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=900;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=7500;const g1=ac.createGain();g1.gain.value=.22;hp.connect(lp);lp.connect(g1);g1.connect(g);loop(white,hp);
    const lp2=ac.createBiquadFilter();lp2.type='lowpass';lp2.frequency.value=700;const g2=ac.createGain();g2.gain.value=.5;lp2.connect(g2);g2.connect(g);loop(fxNoise(ac,4,'brown'),lp2);
    const l=ac.createOscillator();l.frequency.value=.09;const lg=ac.createGain();lg.gain.value=.12;l.connect(lg);lg.connect(g2.gain);l.start();}
  {const g=mk('brown'),lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=520;lp.connect(g);const g1=ac.createGain();g1.gain.value=1;loop(fxNoise(ac,5,'brown'),g1);g1.connect(lp);}
  {const g=mk('crackle'),hp=ac.createBiquadFilter();hp.type='highpass';hp.frequency.value=1200;hp.connect(g);loop(fxNoise(ac,4,'crackle'),hp);}
  const tape=ac.createBiquadFilter();tape.type='lowpass';tape.frequency.value=2600;tape.Q.value=.4;tape.connect(mk('keys'));
  const dbus=ac.createBiquadFilter();dbus.type='lowpass';dbus.frequency.value=5200;dbus.connect(mk('drums'));
  const wow=ac.createOscillator();wow.frequency.value=.33;const wg=ac.createGain();wg.gain.value=7;wow.connect(wg);wow.start();
  MX={ac:ac,bus:bus,lay:lay,tape:tape,dbus:dbus,wg:wg,white:white,next:0,step:0,bar:0,timer:null};
  MX.timer=setInterval(fxMixSched,40);return MX;
}
const LOFI=[[50,53,57,60,64],[43,53,57,59,62],[48,52,55,59,62],[45,52,55,60,64]];
function fxNote(t,midi,dur,vel){const ac=MX.ac,f=440*Math.pow(2,(midi-69)/12);
  [['triangle',1,1],['sine',2,.18]].forEach(o=>{const os=ac.createOscillator();os.type=o[0];os.frequency.value=f*o[1];MX.wg.connect(os.detune);const g=ac.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vel*o[2],t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);os.connect(g);g.connect(MX.tape);os.start(t);os.stop(t+dur+.05);});}
function fxHit(t,kind,vel){const ac=MX.ac;
  if(kind==='kick'){const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(42,t+.14);g.gain.setValueAtTime(vel,t);g.gain.exponentialRampToValueAtTime(.001,t+.32);o.connect(g);g.connect(MX.dbus);o.start(t);o.stop(t+.35);return;}
  const s=ac.createBufferSource();s.buffer=MX.white;const f=ac.createBiquadFilter(),g=ac.createGain();
  if(kind==='snare'){f.type='bandpass';f.frequency.value=1700;f.Q.value=.7;g.gain.setValueAtTime(vel,t);g.gain.exponentialRampToValueAtTime(.001,t+.2);}
  else{f.type='highpass';f.frequency.value=7000;g.gain.setValueAtTime(vel,t);g.gain.exponentialRampToValueAtTime(.001,t+.045);}
  s.connect(f);f.connect(g);g.connect(MX.dbus);s.start(t,Math.random()*2);s.stop(t+.25);}
function fxMixSched(){
  if(!MX)return;const m=S.set.mix,play=fxMixOn()&&S.set.vol>0&&((m.keys||0)>0||(m.drums||0)>0);const ac=MX.ac;
  if(!play){MX.next=0;return;}if(ac.state!=='running')return;
  const spb=60/Math.max(55,Math.min(100,S.set.bpm||72)),s16=spb/4;if(!MX.next||MX.next<ac.currentTime)MX.next=ac.currentTime+.08;
  while(MX.next<ac.currentTime+.25){const st=MX.step%16,t=MX.next+(st%2?s16*.18:0),ch=LOFI[MX.bar%4];
    if(st===0){ch.slice(1).forEach((n,i)=>fxNote(t+i*.014,n+12,spb*3.6,.07));fxNote(t,ch[0],spb*1.8,.16);}
    if(st===10){fxNote(t,ch[0],spb*1.2,.12);}
    if(st===6&&MX.bar%2){fxNote(t,ch[2+Math.floor(Math.random()*3)]+12,spb*1.5,.05);}
    if(st===0||st===7&&MX.bar%2||st===10)fxHit(t,'kick',.55);
    if(st===4||st===12)fxHit(t,'snare',.22);
    if(st%2===0)fxHit(t,'hat',.05+Math.random()*.05);
    MX.next+=s16;MX.step++;if(MX.step%16===0)MX.bar++;}
}
function fxMixApply(){fxSoundApply();}
function fxMixLayers(){
  if(!MX)return;const on=fxMixOn(),v=on?S.set.vol:0,m=S.set.mix,t=MX.ac.currentTime;
  try{MX.bus.gain.setTargetAtTime(v,t,.5);['rain','brown','keys','drums','crackle'].forEach(k=>MX.lay[k].gain.setTargetAtTime((m[k]||0)*({rain:1.2,brown:.9,keys:1.4,drums:1.1,crackle:1.6}[k]),t,.4));}catch(e){}
}
function fxMixer(){
  const old=document.getElementById('fx-pop');if(old){const was=old.dataset.k==='mix';old.remove();if(was)return;}
  const b=document.getElementById('fx-snd'),r=b.getBoundingClientRect(),p=document.createElement('div');p.id='fx-pop';p.dataset.k='mix';p.className='fm-mix';
  p.style.left=Math.max(8,Math.min(innerWidth-330,r.right-320))+'px';p.style.top=(r.bottom+8)+'px';p.innerHTML=fxMixerHTML();document.body.appendChild(p);
  setTimeout(()=>addEventListener('pointerdown',function h(e){if(!p.isConnected){removeEventListener('pointerdown',h);return;}if(!p.contains(e.target)&&!e.target.closest('#fx-snd')){p.remove();removeEventListener('pointerdown',h);}}),10);
  if(S.set.sound){fxSoundStart();fxMixStart();fxMixApply();}
}
function fxMixerHTML(){const m=S.set.mix;
  return'<div class="mx-top"><p class="eyebrow">Focus sounds</p><label class="chk"><input type="checkbox" data-fxm="set.sound" data-rr="0" id="mx-on"'+(S.set.sound?' checked':'')+'> On</label></div>'+
  '<div class="mx-pre">'+[['space','Space'],['rain','Rainy study'],['lofi','Lo-fi'],['lofirain','Lo-fi and rain'],['deep','Deep focus']].map(x=>'<button data-fx="mixpre" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'+
  MIXL.map(l=>'<label class="mx-row"><span>'+l[1]+'</span><input type="range" min="0" max="1" step="0.01" value="'+(m[l[0]]||0)+'" data-fxm="mix.'+l[0]+'" data-rr="0"></label>').join('')+
  '<label class="mx-row"><span>Lo-fi tempo</span><input type="range" min="58" max="96" step="1" value="'+(S.set.bpm||72)+'" data-fxm="set.bpm" data-rr="0"></label>'+
  '<label class="mx-row"><span>Volume</span><input type="range" min="0" max="100" step="1" value="'+Math.round(S.set.vol*100)+'" data-fxs="vol"></label>'+
  '<label class="chk"><input type="checkbox" data-fxm="set.mixFocus" data-rr="0"'+(S.set.mixFocus?' checked':'')+'> Only play during focus timer sessions</label>';}
setInterval(()=>{if(MX)fxMixApply();},2000);

/* =================== achievements =================== */
ACH.push(
 ['b1','Event horizon','Destroy a black hole of doom','Challenges',2,0,c=>(S.cnt.boss||0)>=1],
 ['b2','Singularity slayer','Destroy 4 black holes of doom','Challenges',3,0,c=>(S.cnt.boss||0)>=4],
 ['b3','Quick draw','Score 20 or more in a formula drill','Challenges',2,0,c=>(S.cnt.drillBest||0)>=20],
 ['b4','Inbox zero','Clear everything due today','Challenges',1,0,c=>c.f.dueClear],
 ['b5','Paper trail','Log 5 past-paper scores','Challenges',2,0,c=>(S.papers||[]).length>=5],
 ['b6','Picture perfect','Get full marks from photo marking','Challenges',2,0,c=>c.f.photoFull],
 ['b7','Mock exam','Make a practice exam with Claude','Challenges',1,0,c=>c.f.genex]);

/* =================== actions =================== */
function fxMoreAct(a,v,b,e){
  switch(a){
    case'hub':fxHub();return true;
    case'due':fxDue();return true;
    case'boss':fxBoss();return true;
    case'bossagain':fxBossQueue();fxRerender();return true;
    case'qrcheck':qrCheck();return true;
    case'qrreveal':{const R=MS.qr;R.text='';qrResult(false);return true;}
    case'qrright':{const R=MS.qr,it=R.items[R.i];if(R.mode==='boss'){R.items=R.items.filter((x,j)=>j<=R.i||!(x.q&&x.q.qid===it.q.qid));S.boss.miss=Math.max(0,(S.boss.miss||0)-1);}R.res=null;R.n--;R.shown=true;qrResult(true);return true;}
    case'qrnext':qrNext();return true;
    case'qrflip':MS.qr.flip=true;fxRerender();return true;
    case'qrrate':{const R=MS.qr,it=R.items[R.i];fxSched(it.c.id,+v);R.i++;R.flip=false;fxRerender();return true;}
    case'drill':fxDrill();return true;
    case'drgo':drStart();return true;
    case'drsetup':MS.dr.phase='setup';fxRerender();return true;
    case'drstop':drEnd();return true;
    case'drpick':drPick(+v);return true;
    case'cas':fxCas();return true;
    case'papers':fxPapers();return true;
    case'papadd':fxPapAdd();return true;
    case'papdel':S.papers=(S.papers||[]).filter(x=>x.id!==v);fxDirty();fxRerender();return true;
    case'printing':fxPrinting();return true;
    case'ppkind':MS.pp.kind=v;fxRerender();return true;
    case'ppgo':fxPrintGo();return true;
    case'fmall':{const p=v.split('|'),root=MS[p[0].split('.')[0]],o={};const L=p[2]==='all'?fmChList(p[1]):p[2]==='studied'?fmStudied(p[1]):[];L.forEach(x=>o[x.c.id]=1);root.chs=o;fxRerender();return true;}
    case'exam':fxExam();return true;
    case'exnew':MS.ex.view='setup';MS.ex.err='';fxRerender();return true;
    case'exhome':MS.ex.view='home';fxRerender();return true;
    case'exgen':fxExamGen();return true;
    case'extake':Object.assign(MS.ex,{cur:v,view:'take',end:0,open:{}});fxRerender();return true;
    case'exdel':S.genex=(S.genex||[]).filter(x=>x.id!==v);fxDirty();fxRerender();return true;
    case'exstart':{const x=(S.genex||[]).find(z=>z.id===MS.ex.cur);if(x){MS.ex.end=Date.now()+x.min*60e3;fxExamTick();fxRerender();}return true;}
    case'exstop':MS.ex.end=0;fxRerender();return true;
    case'exopen':MS.ex.open=MS.ex.open||{};MS.ex.open[v]=!MS.ex.open[v];fxRerender();return true;
    case'exprint':{const x=(S.genex||[]).find(z=>z.id===MS.ex.cur);if(x)fxPrint(fxPaperHTML(x.title,x.qs,x.min,v==='guide','l'),x.title);return true;}
    case'exlog':{const x=(S.genex||[]).find(z=>z.id===MS.ex.cur);if(x)fxPapers({s:x.s,name:x.title,date:fxToday(),score:'',out:String(x.qs.reduce((a,q)=>a+(q.marks||0),0))});return true;}
    case'exphoto':{const x=(S.genex||[]).find(z=>z.id===MS.ex.cur);if(x){const q=x.qs[+v];fxPhoto({q:q.q,ch:'',imgs:[]});}return true;}
    case'photo':fxPhoto();return true;
    case'phgo':fxPhotoGo();return true;
    case'phdel':MS.ph.imgs.splice(+v,1);fxRerender();return true;
    case'phclear':Object.assign(MS.ph,{imgs:[],res:null,err:'',saved:false});fxRerender();return true;
    case'phsave':fxPhotoSave();return true;
    case'expl':fxExpl(v);return true;
    case'explx':delete EXPL[v];renderPanel();return true;
    case'tl':fxTimelapse();return true;
    case'tlplay':MS.tl.play=!MS.tl.play;if(MS.tl.play&&MS.tl.p>=1)MS.tl.p=0;b.textContent=MS.tl.play?'Pause':'Play';return true;
    case'tlre':MS.tl.p=0;MS.tl.play=true;MS.tl.flash={};const pb=document.querySelector('[data-fx="tlplay"]');if(pb)pb.textContent='Pause';return true;
    case'mixer':if(FXOVER)fxCloseOverlay();setTimeout(fxMixer,FXOVER?0:0);return true;
    case'mixpre':Object.assign(S.set.mix,MIXP[v]);if(!S.set.sound){S.set.sound=true;}fxDirty();fxSoundStart();fxMixStart();fxMixApply();{const p=document.getElementById('fx-pop');if(p)p.innerHTML=fxMixerHTML();const sb=document.getElementById('fx-snd');if(sb)sb.innerHTML=IC.snd;}return true;
  }
  return fxUiAct(a,v,b,e);
}
addEventListener('pointerdown',()=>{const m=S.set.mix||{};if(S.set.sound&&['rain','brown','keys','drums','crackle'].some(k=>m[k]>0)){fxMixStart();fxMixApply();}},{once:true,capture:true});
