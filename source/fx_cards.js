
/* =====================================================================
   FEATURES: overlays + flashcards (confidence-based, any subject)
   ===================================================================== */
function fxTypeset(el){if(window.MathJax&&MathJax.typesetPromise){try{MathJax.typesetClear([el]);}catch(e){}MathJax.typesetPromise([el]).catch(()=>{});}}
function fxOpenOverlay(kind,render,opts){
  opts=opts||{};let el=document.getElementById('fxov');
  if(!el){el=document.createElement('div');el.id='fxov';document.body.appendChild(el);}
  el.className='fxov k-'+kind;el.innerHTML=(opts.canvas?'<canvas class="fxbg"></canvas>':'')+'<div class="fxin">'+render()+'</div>';
  FXOVER={kind:kind,render:render,opts:opts};requestAnimationFrame(()=>el.classList.add('open'));fxTypeset(el);
  if(opts.onOpen)opts.onOpen(el);
}
function fxRerender(){if(!FXOVER)return;const el=document.getElementById('fxov'),i=el&&el.querySelector('.fxin');if(!i)return;const st=i.scrollTop;i.innerHTML=FXOVER.render();i.scrollTop=st;fxTypeset(i);}
function fxCloseOverlay(){const el=document.getElementById('fxov');if(!el)return;if(FXOVER&&FXOVER.opts.onClose)FXOVER.opts.onClose();FXOVER=null;el.classList.remove('open');setTimeout(()=>{if(!FXOVER)el.remove();},450);fxDirty();chrome();}
/* ---- cards: built from lessons, questions and official formula sheets; any future subject works the same way ---- */
let CARDS=null;
const CTYPES=[['q','Questions'],['word','Worded problems'],['def','Definitions and facts'],['key','Key ideas'],['ex','Worked examples'],['trap','Common traps'],['formula','Formulas'],['mine','My cards']];
function fxAllCards(){
  if(CARDS)return CARDS;const out=[];
  for(const s of S.subjects)for(const u of UNITS)chaptersOf(s,u).forEach(c=>{const ct=CT[c.id];if(!ct)return;
    (ct.quiz||[]).forEach((q,i)=>out.push({id:c.id+'|q'+i,s:s.id,u:u,ch:c.id,topic:q.topic||'Question',type:'q',f:q.q,b:'**'+(q.ad||q.a)+'**'+(q.sol?'\n\n'+q.sol:'')}));
    (ct.comets||[]).forEach((q,i)=>out.push({id:c.id+'|c'+i,s:s.id,u:u,ch:c.id,topic:(q.topic||'Extension').replace(/^Extension:\s*/,''),type:'q',f:q.q,b:'**'+(q.ad||q.a)+'**'+(q.sol?'\n\n'+q.sol:'')}));
    ct.sections.forEach((sec,si)=>sec.blocks.forEach((b,bi)=>{
      const tp=sec.code==='X'?'Exam toolkit':sec.code+' '+sec.title;
      if(b.t==='key')out.push({id:c.id+'|k'+si+'-'+bi,s:s.id,u:u,ch:c.id,topic:sec.title,type:'key',f:'Recall the key idea from **'+tp+'**',b:b.x});
      else if(b.t==='ex')out.push({id:c.id+'|e'+si+'-'+bi,s:s.id,u:u,ch:c.id,topic:sec.title,type:'ex',f:b.q,b:'**'+b.a+'**\n\n'+b.s.join('\n')});
      else if(b.t==='warn')out.push({id:c.id+'|w'+si+'-'+bi,s:s.id,u:u,ch:c.id,topic:sec.title,type:'trap',f:'What is the trap to avoid in **'+tp+'**?',b:b.x});
    }));
    (ct.cards||[]).forEach((x,i)=>out.push({id:c.id+'|n'+i,s:s.id,u:u,ch:c.id,topic:x.topic,type:x.type==='word'?'word':'def',f:x.f,b:x.b}));
  });
  Object.keys(FORMULAS).forEach(sid=>{if(!subj(sid))return;FORMULAS[sid].forEach((sec,si)=>sec[1].forEach((r,ri)=>out.push({id:'F|'+sid+'|'+si+'-'+ri,s:sid,u:'F',ch:'F|'+sid,topic:sec[0],type:'formula',f:'Formula · **'+r[0]+'**\n'+sec[0],b:'$$'+r[1]+'$$'})));});
  (S.cards||[]).forEach(c=>out.push(Object.assign({type:'mine'},c)));
  return CARDS=out;
}
const fxConf=id=>(S.fc[id]||{}).c||0;
function fxText(t){return'<div>'+inl(String(t)).replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>')+'</div>';}
let FC={phase:'setup',sc:{s:'all',u:'all',ch:'all',topic:'all',types:{q:1,word:1,def:1,key:1,ex:1,trap:1,formula:1,mine:1}},mode:'smart',size:20,q:[],i:0,flip:false,combo:0,best:0,n:0,sum:0,timed:0,start:0,rep:{},xpT:{},fx:[],lit0:0,stars:null};
function fxScope(sc){
  sc=sc||FC.sc;return fxAllCards().filter(c=>(sc.s==='all'||c.s===sc.s)&&(sc.u==='all'||c.u===sc.u||(sc.u==='F'&&c.type==='formula'))&&(sc.ch==='all'||c.ch===sc.ch)&&(sc.topic==='all'||c.topic===sc.topic)&&sc.types[c.type]&&(!subj(c.s)||!subj(c.s).hidden||sc.s===c.s));
}
function fxLit(list){if(!list.length)return 0;let s=0;list.forEach(c=>s+=fxConf(c.id));return s/(5*list.length);}
function fxShuffle(a,r){r=r||Math.random;for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function fxBuildQueue(){
  const now=Date.now(),all=fxScope(),N=FC.size;let q=[];
  const weakCh=new Set(S.mistakes.filter(m=>m.rights.length<2).map(m=>m.ch));
  if(FC.mode==='random'){q=fxShuffle(all.slice()).sort((a,b)=>(fxConf(a.id)>=5)-(fxConf(b.id)>=5)).slice(0,N);fxShuffle(q);}
  else if(FC.mode==='weak'){q=fxShuffle(all.slice()).sort((a,b)=>{const ca=fxConf(a.id)||2.5,cb=fxConf(b.id)||2.5;return ca-cb;}).slice(0,N);}
  else{
    const due=all.filter(c=>{const r=S.fc[c.id];return r&&r.due<=now;}).sort((a,b)=>fxConf(a.id)-fxConf(b.id)||(weakCh.has(b.ch)-weakCh.has(a.ch)));
    const fresh=fxShuffle(all.filter(c=>!S.fc[c.id])).sort((a,b)=>(weakCh.has(b.ch)-weakCh.has(a.ch)));
    const later=all.filter(c=>{const r=S.fc[c.id];return r&&r.due>now;}).sort((a,b)=>fxConf(a.id)-fxConf(b.id)||S.fc[a.id].due-S.fc[b.id].due);
    const nNew=Math.max(3,Math.ceil(N*.4));q=due.slice(0,N);q=q.concat(fresh.slice(0,Math.min(nNew,N-q.length)));if(q.length<N)q=q.concat(fresh.slice(nNew,nNew+N-q.length));if(q.length<N)q=q.concat(later.slice(0,N-q.length));
    q=fxShuffle(q.slice(0,N));
  }
  return q;
}
function fxStartCards(opts){
  opts=opts||{};if(opts.sc)FC.sc=Object.assign(FC.sc,opts.sc);
  if(opts.quick){FC.mode='smart';FC.size=80;FC.timed=Date.now()+15*60000;FC.quick=true;FC.sc.types={q:1,word:1,def:1,key:1,ex:1,trap:1,formula:1,mine:1};}else{FC.timed=0;FC.quick=false;}
  FC.q=fxBuildQueue();if(!FC.q.length){toast('No cards match those filters.');return false;}
  Object.assign(FC,{phase:'run',i:0,flip:false,combo:0,best:0,n:0,sum:0,start:Date.now(),rep:{},fx:[],lit0:fxLit(fxScope()),allHigh:true});
  FC.stars=null;fxRerender();return true;
}
function fxCards(opts){
  opts=opts||{};FC.phase='setup';if(opts.sc)FC.sc=Object.assign(FC.sc,opts.sc);FC.stars=null;
  fxOpenOverlay('fc',fxCardsHTML,{canvas:true,onOpen:fxGalaxyLoop});
  if(opts.quick)fxQuickSetup();
}
function fxQuickSetup(){FC.phase='quick';fxRerender();}
function fxSel(name,val,opts){return'<select data-fxi="'+name+'">'+opts.map(o=>'<option value="'+esc(o[0])+'"'+(String(o[0])===String(val)?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select>';}
function fxScopeControls(quick){
  const sc=FC.sc,subs=VS();
  const chs=sc.s==='all'?[]:UNITS.flatMap(u=>(sc.u==='all'||sc.u===u)?chaptersOf(subj(sc.s),u).filter(c=>CT[c.id]||fxAllCards().some(x=>x.ch===c.id)).map((c,i)=>[c.id,'Unit '+u+' · Ch '+numOf(c,i)+' · '+c.title]):[]);
  const topics=sc.ch==='all'?[]:[...new Set(fxAllCards().filter(c=>c.ch===sc.ch).map(c=>c.topic))];
  let h='<div class="fc-grid"><label>Subject'+fxSel('s',sc.s,[['all','All subjects']].concat(subs.map(s=>[s.id,s.name])))+'</label>'+
    '<label>Unit'+fxSel('u',sc.u,[['all','All units'],['3','Unit 3'],['4','Unit 4'],['F','Formula sheet only']])+'</label>'+
    (quick?'':'<label>Chapter'+fxSel('ch',sc.ch,[['all','All chapters']].concat(chs))+'</label>'+
    '<label>Topic'+fxSel('topic',sc.topic,[['all','All topics']].concat(topics.map(t=>[t,t])))+'</label>')+'</div>';
  if(!quick)h+='<div class="fc-types">'+CTYPES.map(t=>'<label class="chk"><input type="checkbox" data-fxi="type" value="'+t[0]+'"'+(sc.types[t[0]]?' checked':'')+'> '+t[1]+'</label>').join('')+'</div>';
  return h;
}
function fxConfBars(list){const b=[0,0,0,0,0,0];list.forEach(c=>b[fxConf(c.id)]++);const n=list.length||1;const lab=['New','1','2','3','4','5'];
  return'<div class="fc-bars">'+b.map((v,i)=>'<div class="c'+i+'"><i style="height:'+Math.max(2,Math.round(v/n*64))+'px"></i><b>'+v+'</b><span>'+lab[i]+'</span></div>').join('')+'</div>';}
function fxCardsHTML(){
  const head=(t,sub)=>'<div class="fx-head"><div><p class="eyebrow">'+sub+'</p><h2>'+t+'</h2></div><button class="x" data-fx="close" aria-label="Close">×</button></div>';
  if(FC.phase==='quick'){
    const list=fxScope();
    return'<div class="fc-panel">'+head('Study for 15 minutes','Quick mixed session')+'<p class="muted">A timed mix of due cards, cards from chapters with open mistakes, and new cards. Pick where to focus.</p>'+fxScopeControls(true)+
      '<p class="sub">'+list.length+' cards in range · galaxy '+Math.round(fxLit(list)*100)+'% lit</p><div class="row"><button class="btn" data-fx="quickgo">Start 15 minutes</button><button class="btn ghost" data-fx="fcsetup">Full flashcard options</button></div></div>';
  }
  if(FC.phase==='setup'){
    const list=fxScope(),due=list.filter(c=>{const r=S.fc[c.id];return r&&r.due<=Date.now();}).length,nw=list.filter(c=>!S.fc[c.id]).length;
    return'<div class="fc-panel">'+head('Flashcards','Confidence-based review')+fxScopeControls(false)+
      '<div class="fc-grid"><label>Order'+fxSel('mode',FC.mode,[['smart','Smart: due first, then new'],['weak','Weakest first'],['random','Random shuffle']])+'</label><label>Cards'+fxSel('size',FC.size,[[10,'10 cards'],[20,'20 cards'],[40,'40 cards'],[80,'80 cards']])+'</label></div>'+
      '<div class="fc-stat"><div><b>'+list.length+'</b><span>cards in range</span></div><div><b>'+due+'</b><span>due now</span></div><div><b>'+nw+'</b><span>never seen</span></div><div><b>'+Math.round(fxLit(list)*100)+'%</b><span>galaxy lit</span></div></div>'+
      fxConfBars(list)+'<p class="sub">Rate each card from 1 (no idea) to 5 (perfect). Low-rated cards come back within the session and again soon; cards you rate 5 drift further away each time.</p>'+
      '<div class="row"><button class="btn" data-fx="fcgo">Start</button><button class="btn ghost" data-fx="fcadd">Add my own card</button></div>'+(FC.adding?fxAddForm():'')+'</div>';
  }
  if(FC.phase==='run'){
    const c=FC.q[FC.i],r=S.fc[c.id],sj=subj(c.s),f=c.ch.indexOf('F|')===0?null:findCh(c.ch);
    const tl=FC.timed?Math.max(0,FC.timed-Date.now()):0;
    return'<div class="fc-run"><div class="fc-top"><button class="x" data-fx="fcend" aria-label="End session">×</button><span>Card '+(FC.i+1)+' of '+FC.q.length+'</span>'+(FC.timed?'<span class="fc-timer" id="fc-timer">'+fxMMSS(tl)+'</span>':'')+
      '<span class="fc-combo'+(FC.combo>=5?' hot':'')+(FC.combo>=10?' blaze':'')+'" id="fc-combo"><i></i><b>'+FC.combo+'</b> streak</span></div>'+
      '<div class="fc-card'+(FC.flip?' flip':'')+'" data-fx="flip"><div class="face front"><p class="eyebrow">'+esc((sj?sj.name:'')+(f?' · Ch '+numOf(f.ch,f.i):' · Formula sheet')+' · '+c.topic)+'</p><div class="fc-body">'+fxText(c.f)+'</div><span class="fc-hint">Click to reveal</span></div>'+
      '<div class="face back"><p class="eyebrow">Answer'+(r?' · last rated '+r.c:'')+'</p><div class="fc-body">'+fxText(c.b)+'</div></div></div>'+
      '<div class="fc-rate'+(FC.flip?' on':'')+'">'+[['1','No idea'],['2','Shaky'],['3','Okay'],['4','Good'],['5','Perfect']].map(x=>'<button class="r'+x[0]+'" data-fx="rate" data-v="'+x[0]+'"'+(FC.flip?'':' disabled')+'><b>'+x[0]+'</b><span>'+x[1]+'</span></button>').join('')+'</div></div>';
  }
  const list=fxScope(),lit=fxLit(list),mins=Math.max(1,Math.round((Date.now()-FC.start)/60000));
  return'<div class="fc-panel fc-done">'+head('Session complete','Flashcards')+'<div class="fc-stat"><div><b>'+FC.n+'</b><span>cards rated</span></div><div><b>'+(FC.n?(FC.sum/FC.n).toFixed(1):'—')+'</b><span>average confidence</span></div><div><b>'+FC.best+'</b><span>best streak</span></div><div><b>'+Math.round(lit*100)+'%</b><span>galaxy lit ('+(lit>=FC.lit0?'+':'')+Math.round((lit-FC.lit0)*100)+')</span></div></div>'+
    fxConfBars(list)+'<p class="sub">'+mins+' minute'+(mins>1?'s':'')+' of review.</p><div class="row"><button class="btn" data-fx="fcagain">Another round</button><button class="btn ghost" data-fx="fcsetup">Change filters</button><button class="btn ghost" data-fx="close">Close</button></div></div>';
}
function fxAddForm(){
  const opts=[];S.subjects.forEach(s=>UNITS.forEach(u=>chaptersOf(s,u).forEach((c,i)=>opts.push([c.id,s.name+' · U'+u+' · Ch '+numOf(c,i)+' · '+c.title]))));
  return'<div class="fc-add"><label>Chapter'+fxSel('addch',FC.addch||(opts[0]||[''])[0],opts)+'</label><label>Topic<input type="text" id="fc-at" placeholder="e.g. Contract law, Market structures"></label><label>Front<textarea id="fc-af" rows="2" placeholder="Question or term. Use $x^2$ for maths."></textarea></label><label>Back<textarea id="fc-ab" rows="3" placeholder="Answer or definition"></textarea></label><div class="row"><button class="btn" data-fx="fcsave">Save card</button><button class="btn link" data-fx="fcadd">Cancel</button></div><p class="sub">Your own cards work for any subject, including ones you add later.</p></div>';
}
function fxMMSS(ms){const s=Math.ceil(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
function fxRate(v){
  const c=FC.q[FC.i],now=Date.now(),r=S.fc[c.id]||{n:0,ok:0,s5:0};
  r.n++;r.c=v;r.last=now;if(v>=4)r.ok=(r.ok||0)+1;r.s5=v===5?(r.s5||0)+1:0;
  const ivl=v===1?60e3:v===2?10*60e3:v===3?DAY:v===4?3*DAY*(1+.3*Math.max(0,r.ok-1)):7*DAY*Math.pow(1.8,Math.min(r.s5-1,5));
  r.due=now+ivl;S.fc[c.id]=r;
  const d=fxDay();d.fc++;S.cnt.fcRev=(S.cnt.fcRev||0)+1;FC.n++;FC.sum+=v;if(v<4)FC.allHigh=false;
  if(!S.log.some(e=>e.k==='fc'&&dayKey(e.t)===fxToday()))S.log=S.log.concat([{t:now,k:'fc'}]).slice(-300);
  if(!FC.xpT[c.id]||now-FC.xpT[c.id]>10*60e3){FC.xpT[c.id]=now;fxGain(v>=4?2:1);}
  const prev=FC.combo;
  if(v>=4)FC.combo++;else if(v<=2)FC.combo=0;
  FC.best=Math.max(FC.best,FC.combo);d.combo=Math.max(d.combo||0,FC.combo);S.cnt.combo=Math.max(S.cnt.combo||0,FC.combo);
  if([5,10,25,50,100].includes(FC.combo)&&FC.combo>prev)fxComboBurst(FC.combo);
  const sp=FC.stars&&FC.stars.idx[c.id];if(sp!=null)FC.fx.push({i:sp,t0:performance.now(),v:v});
  if(v<=2&&(FC.rep[c.id]||0)<2){FC.rep[c.id]=(FC.rep[c.id]||0)+1;FC.q.splice(Math.min(FC.q.length,FC.i+3+Math.floor(Math.random()*3)),0,c);}
  FC.i++;FC.flip=false;
  if(FC.i>=FC.q.length||(FC.timed&&Date.now()>FC.timed))fxEndCards();else fxRerender();
  fxDirty();setTimeout(fxCheckAll,100);
}
function fxEndCards(){if(FC.quick&&FC.n>=10&&FC.allHigh)S.flags.calm=1;FC.phase='done';fxRerender();fxDirty();fxCheckAll();}
function fxComboBurst(n){
  const el=document.createElement('div');el.className='fc-burst';el.innerHTML='<b>'+n+'</b><span>streak</span>';const ov=document.getElementById('fxov');if(!ov)return;ov.appendChild(el);
  fxChime(n>=25?2:1);setTimeout(()=>el.remove(),1800);FC.fx.push({core:1,t0:performance.now()});
}
setInterval(()=>{if(FXOVER&&FXOVER.kind==='fc'&&FC.phase==='run'&&FC.timed){const el=document.getElementById('fc-timer'),tl=FC.timed-Date.now();if(el)el.textContent=fxMMSS(Math.max(0,tl));if(tl<=0&&!FC.flip)fxEndCards();}},1000);
/* galaxy that fills with confidence */
const FCCOL=['#6a7088','#c98585','#d6a372','#cdbf8c','#9fc0f0','#fff2d6'];
function fxGalaxyLoop(el){
  const cv2=el.querySelector('canvas.fxbg');if(!cv2)return;const c2=cv2.getContext('2d');
  function size(){const d=Math.min(devicePixelRatio||1,2);cv2.width=innerWidth*d;cv2.height=innerHeight*d;c2.setTransform(d,0,0,d,0,0);}
  size();addEventListener('resize',size);
  function loop(now){
    if(!FXOVER||FXOVER.kind!=='fc'){removeEventListener('resize',size);return;}
    const w=innerWidth,h=innerHeight;c2.clearRect(0,0,w,h);
    const list=fxScope();if(!FC.stars||FC.stars.n!==list.length){const idx={};const L=list.slice(0,900);L.forEach((c,i)=>idx[c.id]=i);FC.stars={n:list.length,L:L,idx:idx};}
    const L=FC.stars.L,n=L.length,cx=w*(FC.phase==='run'?.5:.72),cy=h*.5,R=Math.min(w,h)*(FC.phase==='run'?.46:.4),rot=REDUCE?0:now*.00002,lit=fxLit(L);
    const g=c2.createRadialGradient(cx,cy,0,cx,cy,R*.9);g.addColorStop(0,'rgba(255,240,210,'+(.05+.22*lit).toFixed(3)+')');g.addColorStop(.35,'rgba(200,190,255,'+(.03+.08*lit).toFixed(3)+')');g.addColorStop(1,'rgba(0,0,0,0)');c2.fillStyle=g;c2.fillRect(0,0,w,h);
    const cur=FC.phase==='run'&&FC.q[FC.i]?FC.stars.idx[FC.q[FC.i].id]:null;
    for(let i=0;i<n;i++){const t=Math.sqrt((i+.5)/n),arm=i%2,a=i*2.39996+t*4.2+arm*Math.PI+rot,rr=t*R,x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.62;
      const cf=fxConf(L[i].id),tw=REDUCE?1:.7+.3*Math.sin(now*.002+i);
      c2.globalAlpha=(cf?.55+.09*cf:.42)*tw;c2.fillStyle=FCCOL[cf];c2.beginPath();c2.arc(x,y,.9+cf*.45,0,6.283);c2.fill();
      if(cf===5){c2.globalAlpha=.25*tw;c2.fillRect(x-4,y-.3,8,.6);c2.fillRect(x-.3,y-4,.6,8);}
      if(i===cur){c2.globalAlpha=.9;c2.strokeStyle='#ffffff';c2.lineWidth=1;c2.beginPath();c2.arc(x,y,7+2*Math.sin(now*.005),0,6.283);c2.stroke();}
      L[i]._x=x;L[i]._y=y;}
    c2.globalAlpha=1;
    FC.fx=FC.fx.filter(f=>{const k=(now-f.t0)/1100;if(k>=1)return false;
      if(f.core){c2.strokeStyle='rgba(255,236,200,'+(1-k)*.6+')';c2.lineWidth=2;c2.beginPath();c2.arc(cx,cy,R*.1+k*R*.9,0,6.283);c2.stroke();return true;}
      const s=L[f.i];if(!s)return false;const col=FCCOL[f.v];c2.globalCompositeOperation='lighter';
      c2.strokeStyle=col;c2.globalAlpha=1-k;c2.lineWidth=1.5;c2.beginPath();c2.arc(s._x,s._y,3+k*26,0,6.283);c2.stroke();
      const gg=c2.createRadialGradient(s._x,s._y,0,s._x,s._y,14);gg.addColorStop(0,col);gg.addColorStop(1,'rgba(0,0,0,0)');c2.fillStyle=gg;c2.beginPath();c2.arc(s._x,s._y,14*(1-k*.5),0,6.283);c2.fill();
      c2.globalCompositeOperation='source-over';c2.globalAlpha=1;return true;});
    c2.font='500 11px Geist,system-ui,sans-serif';c2.fillStyle='rgba(200,200,210,.55)';c2.textAlign='center';if('letterSpacing' in c2)c2.letterSpacing='2px';
    c2.fillText(('GALAXY '+Math.round(lit*100)+'% LIT · '+n+' STARS'),cx,cy+R*.62+28);if('letterSpacing' in c2)c2.letterSpacing='0px';
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
