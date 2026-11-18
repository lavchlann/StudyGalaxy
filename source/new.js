/* ---------- content, levels, badges ---------- */
const CT=JSON.parse(document.getElementById('content').textContent);
let UNSAVED=false,RESET=true;
const STRICT=()=>!!sess&&(sess.kind==='revise'||sess.kind==='exam');
const addXP=n=>{S.xp=(S.xp||0)+n;};
const levelOf=x=>Math.floor(Math.sqrt(x/40))+1;
function lvlInfo(){const x=S.xp||0,L=levelOf(x),lo=40*(L-1)*(L-1),hi=40*L*L;return{x:x,L:L,f:(x-lo)/(hi-lo),need:hi-x};}
function flushSave(){if(UNSAVED){UNSAVED=false;commit();}}
const cometsDone=()=>Object.keys(S.comets).length;
function badges(){
  const solid=VS().reduce((a,s)=>a+allChapters(s).filter(c=>effStatus(c.id)==='solid').length,0),sk=streakInfo().n;
  const fixed=S.mistakes.filter(m=>m.rights.length>=2).length,ex=Object.values(S.exams);
  const unit3=VS().some(s=>chaptersOf(s,'3').length&&chaptersOf(s,'3').every(c=>effStatus(c.id)==='solid'));
  const secs=Object.values(S.progress).reduce((a,p)=>a+Object.keys(p.secs||{}).length,0);
  return[
    ['First light','Get your first solid planet',solid>=1],
    ['Reader','Mark 10 lesson sections as understood',secs>=10],
    ['Three-day streak','Study on 3 days in a row',sk>=3],
    ['Week warrior','Study on 7 days in a row',sk>=7],
    ['Comet hunter','Catch 3 comets',cometsDone()>=3],
    ['Mistake fixer','Fix 5 mistakes for good',fixed>=5],
    ['Exam ready','Score 80% or more in a unit exam',ex.some(e=>e.best>=80)],
    ['Unit conqueror','Make every Unit 3 planet solid in a subject',unit3],
    ['Galaxy mapper','Reach level 5',lvlInfo().L>=5]
  ];
}
function trophiesHTML(){
  const li=lvlInfo(),b=badges();
  return'<h4 class="eyebrow" style="margin:18px 0 6px">Level and trophies</h4><div class="lvlbar"><b>Level '+li.L+'</b><span>'+li.x+' XP · '+li.need+' to level '+(li.L+1)+'</span><i style="width:'+Math.round(li.f*100)+'%"></i></div>'+
    '<div class="badges">'+b.map(x=>'<div class="badge'+(x[2]?' on':'')+'"><b>'+esc(x[0])+'</b><span>'+esc(x[1])+'</span></div>').join('')+'</div>'+
    '<p class="sub">XP: 5 per lesson section, 10 to 20 per practice, 20 to 50 per checkpoint, 25 per comet, up to 90 per unit exam.</p>';
}

/* ---------- local answer checking ---------- */
function cleanA(s){
  return String(s).toLowerCase().replace(/\$/g,'').replace(/\\(left|right|,|;|!)/g,'').replace(/\\(?:d|t)?frac\{([^{}]*)\}\{([^{}]*)\}/g,'($1)/($2)').replace(/\\(pi|theta|sqrt|ln|sin|cos|tan|cdot|times)/g,'$1').replace(/[{}]/g,'')
   .replace(/\s+/g,'').replace(/[·×]/g,'*').replace(/−/g,'-').replace(/π/g,'pi').replace(/√/g,'sqrt').replace(/²/g,'^2').replace(/³/g,'^3').replace(/θ/g,'theta').replace(/±/g,'+-')
   .replace(/°|degrees|units|square/g,'').replace(/and/g,',').replace(/\.$/,'');
}
function forms(s){
  const c=cleanA(s),out=new Set([c]);
  const m=c.match(/^[a-z]{1,3}(\([a-z0-9]+\))?=(.+)$/);if(m&&c.split('=').length===2)out.add(m[2]);
  if(c.indexOf(',')>0&&!/[()]/.test(c))out.add(c.split(',').sort().join(','));
  [...out].forEach(x=>{if(/^\(.*\)$/.test(x)&&x.indexOf('(',1)<0)out.add(x.slice(1,-1));});
  return out;
}
const numOfA=s=>{s=cleanA(s);let m=s.match(/^(-?\d*\.?\d+)$/);if(m)return{v:parseFloat(m[1]),dp:(m[1].split('.')[1]||'').length,frac:false};m=s.match(/^(-?\d+)\/(\d+)$/);if(m&&+m[2])return{v:+m[1]/+m[2],dp:0,frac:true};return null;};
function sameAns(key,given){
  const kn=numOfA(key),gn=numOfA(given);
  if(kn&&gn){const tol=kn.frac?.00051:kn.dp?0.5*Math.pow(10,-kn.dp)+1e-12:1e-9;return Math.abs(kn.v-gn.v)<=tol;}
  const sq=f=>{const o=new Set();f.forEach(x=>{o.add(x);o.add(x.replace(/\(([a-z0-9.]+)\)/g,'$1'));});return o;};
  const a=sq(forms(key)),b=sq(forms(given));for(const x of a)if(b.has(x))return true;return false;
}

/* ---------- reader ---------- */
const plain=s=>String(s).replace(/\*\*/g,'');
const SRCN={B:'3Blue1Brown',J:'Joel Speranza',F:'Flipping Physics',K:'Khan Academy',V:'Veritasium'};
function vidHTML(v){return'<a class="vid" href="'+esc(v.url)+'" target="_blank" rel="noopener noreferrer"><span class="vi">'+(v.kind==='video'?'▶':'⌕')+'</span><span><b>'+esc(v.title)+'</b><em>'+SRCN[v.src]+'<i class="bd '+(v.kind==='video'?'direct':'srch')+'">'+(v.kind==='video'?'Direct video':'Search results')+'</i></em></span></a>';}
function blockHTML(b){
  if(b.t==='p')return'<p>'+inl(b.x)+'</p>';
  if(b.t==='key')return'<div class="key">'+inl(b.x)+'</div>';
  if(b.t==='warn')return'<div class="warn"><b>Watch out.</b> '+inl(b.x)+'</div>';
  if(b.t==='ex')return'<div class="ex"><b class="exh">Worked example · '+esc(b.title)+'</b><div class="exq">'+inl(b.q)+'</div><ol class="steps">'+b.s.map(x=>'<li>'+inl(x)+'</li>').join('')+'</ol><div class="exa"><b>Answer.</b> '+inl(b.a)+'</div></div>';
  if(b.t==='int')return widgetHTML(b.name,b.cap);
  if(b.t==='vid')return'<div class="watch"><b>Watch for this section</b>'+b.items.slice().sort((p,q)=>(q.kind==='video')-(p.kind==='video')).map(vidHTML).join('')+'</div>';
  if(b.t==='tb')return'<div class="tb"><b>Textbook · Exercise '+esc(b.code)+'</b><div class="tbl"><span>Recommended</span> '+esc(b.rec.replace(/,/g,', '))+'</div><div class="tbl"><span>Extension</span> '+esc(b.ext.replace(/,/g,', '))+'</div><p>'+inl(b.x)+'</p><p class="sub">Numbers come from your teacher’s Questions Checklist. Do them in your textbook.</p></div>';
  return'';
}
function readHTML(){
  const c=sess.ch,ct=CT[c.ch.id],tab=sess.tab||'lesson',p=S.progress[c.ch.id]||{},secs=p.secs||{};
  const tabs=[['lesson','Lesson'],['videos','Videos'],['practice','Practise'],['comets','Comets']];
  let h='<div class="tabs" role="tablist">'+tabs.map(t=>'<button role="tab" aria-selected="'+(tab===t[0])+'" data-act="tab" data-v="'+t[0]+'">'+t[1]+'</button>').join('')+'</div>';
  const done=ct.sections.filter(s=>secs[s.id]).length;
  if(tab==='lesson'){
    if(sess.sec==null){const f=ct.sections.findIndex(s=>!secs[s.id]);sess.sec=f<0?0:f;}
    const sec=ct.sections[sess.sec];
    h+='<div class="prog"><i style="width:'+Math.round(done/ct.sections.length*100)+'%"></i></div><p class="sub">'+done+' of '+ct.sections.length+' sections understood'+(ct.hours?' · about '+ct.hours+' h to master this chapter':'')+'</p>';
    if(sess.sec===0&&ct.summary)h+='<div class="sumbox">'+inl(ct.summary)+'</div>';
    h+='<div class="secnav">'+ct.sections.map((s,i)=>'<button class="sc'+(i===sess.sec?' cur':'')+(secs[s.id]?' ok':'')+'" data-act="sec" data-v="'+i+'" title="'+esc(s.title)+'">'+esc(s.code)+(secs[s.id]?' ✓':'')+'<em>'+esc(s.title.length>24?s.title.slice(0,23)+'…':s.title)+'</em></button>').join('')+'</div>';
    h+='<h3 class="sech">'+esc(sec.code)+' · '+esc(sec.title)+'</h3><div class="lesson">'+sec.blocks.map(blockHTML).join('')+'</div>';
    h+='<div class="row">'+(sess.sec>0?'<button class="btn ghost" data-act="sec" data-v="'+(sess.sec-1)+'">Previous</button>':'')+
      (secs[sec.id]?'<button class="btn ghost" disabled>Understood ✓</button>':'<button class="btn" data-act="selfcheck" data-v="'+sec.id+'">Check yourself (3 questions)</button><button class="btn link" data-act="secdone" data-v="'+sec.id+'">Mark understood without checking</button>')+
      (sess.sec<ct.sections.length-1?'<button class="btn ghost" data-act="sec" data-v="'+(sess.sec+1)+'">Next section</button>':'<button class="btn ghost" data-act="tab" data-v="practice">Go to practice</button>')+'</div>';
    h+='<div class="qa"><p class="sub"><b>Stuck on something?</b> Ask Claude (this uses a little of your Claude usage).</p>'+
      sess.qa.map(x=>'<p><strong>You:</strong> '+esc(x.q)+'</p><div class="lesson">'+(x.a?md(x.a):'<span class="spin"></span>')+'</div>').join('')+
      '<input type="text" id="askbox" placeholder="Ask a question about this chapter" '+(sess.askBusy?'disabled':'')+'><div class="row"><button class="btn ghost" data-act="ask"'+(sess.askBusy?' disabled':'')+'>Ask</button></div></div>';
  }else if(tab==='videos'){
    h+='<p class="sub">Videos to watch alongside each section. They open on YouTube in a new tab. “Direct video” opens the exact video. “Search results” opens a YouTube search for the topic, because I could not confirm a single exact video for it.</p>';
    ['B','J','F','K','V'].forEach(src=>{
      const l=ct.videos.filter(v=>v.src===src);if(!l.length)return;
      h+='<h4 class="eyebrow" style="margin:14px 0 6px">'+SRCN[src]+'</h4>'+l.slice().sort((p,q)=>(q.kind==='video')-(p.kind==='video')).map(vidHTML).join('');
    });
  }else if(tab==='practice'){
    h+='<p class="muted">Practice gives you free hints and shows the full worked solution. Checkpoint is strict: confidence rating first, hints cost marks, 8 questions, 80% or more with at most one hint turns the planet green.</p><div class="row"><button class="btn" data-act="practice">Practise (5 questions)</button><button class="btn ghost" data-act="revise">Revise checkpoint (8 questions)</button></div>'+
      '<p class="sub">'+ct.quiz.length+' questions in this chapter’s bank. Answers are checked on this page, so practice uses none of your Claude usage.</p>'+
      '<h4 class="eyebrow" style="margin:14px 0 6px">Textbook questions to do</h4>'+ct.sections.map(s=>s.blocks.filter(b=>b.t==='tb').map(b=>'<div class="tbrow"><b>Ex '+esc(b.code)+'</b><span>Rec: '+esc(b.rec.replace(/,/g,', '))+'</span><span>Ext: '+esc(b.ext.replace(/,/g,', '))+'</span></div>').join('')).join('');
  }else{
    const st=effStatus(c.ch.id),open=st==='solid'||st==='due',n=ct.comets.length,d=ct.comets.filter((q,k)=>S.comets[c.ch.id+'-c'+k]).length;
    h+='<p class="muted">Comets are extension challenges. They unlock when this planet is solid.</p>'+(open?'<p class="sub">'+d+' of '+n+' caught.</p><div class="row"><button class="btn" data-act="comet">Start comet challenges</button></div>':'<p class="fb">Locked. Make this planet solid with a Revise checkpoint first.</p>')+
      ct.comets.map((q,k)=>'<div class="tbrow"><b>'+esc(q.topic)+'</b><span>'+(S.comets[c.ch.id+'-c'+k]?'Caught ✓':open?'Waiting':'Locked')+'</span></div>').join('');
  }
  return h;
}

/* ---------- interactive widgets ---------- */
const WG={};
const sv=(vb,b)=>({x:x=>(x-vb[0])/(vb[1]-vb[0])*300,y:y=>190-(y-vb[2])/(vb[3]-vb[2])*190});
function axes(m,vb){return'<line x1="0" x2="300" y1="'+m.y(0).toFixed(1)+'" y2="'+m.y(0).toFixed(1)+'" stroke="#5d6882" stroke-width="1"/><line y1="0" y2="190" x1="'+m.x(0).toFixed(1)+'" x2="'+m.x(0).toFixed(1)+'" stroke="#5d6882" stroke-width="1"/>';}
function curve(m,f,a,b,vb,col,w){
  let d='',pen=false;const N=160;
  for(let i=0;i<=N;i++){const x=a+(b-a)*i/N,y=f(x);if(!isFinite(y)||y<vb[2]-1||y>vb[3]+1){pen=false;continue;}d+=(pen?'L':'M')+m.x(x).toFixed(1)+' '+m.y(y).toFixed(1);pen=true;}
  return'<path d="'+d+'" fill="none" stroke="'+col+'" stroke-width="'+(w||2.2)+'"/>';
}
const dot=(m,x,y,c,r)=>'<circle cx="'+m.x(x).toFixed(1)+'" cy="'+m.y(y).toFixed(1)+'" r="'+(r||4.5)+'" fill="'+c+'"/>';
const seg=(m,x1,y1,x2,y2,c,w,dash)=>'<line x1="'+m.x(x1).toFixed(1)+'" y1="'+m.y(y1).toFixed(1)+'" x2="'+m.x(x2).toFixed(1)+'" y2="'+m.y(y2).toFixed(1)+'" stroke="'+c+'" stroke-width="'+(w||1.5)+'"'+(dash?' stroke-dasharray="4 4"':'')+'/>';
WG.expfun={t:'Explore $y=a^x$',c:[['a','Base a',1.2,4,.05,2]],draw:v=>{
  const vb=[-3,3,-.5,6],m=sv(vb),a=v.a,g=Math.log(a);
  return axes(m,vb)+curve(m,x=>Math.exp(x),-3,3,vb,'#5d6882',1.4)+curve(m,x=>Math.pow(a,x),-3,3,vb,'#d9b878')+dot(m,0,1,'#fff')+seg(m,-1.2,1-1.2*g,1.6,1+1.6*g,'#86bfa6',1.6,true)+
   '<text x="8" y="16" fill="#8d98b2" font-size="11">grey: y = eˣ · gold: y = aˣ · green: tangent at (0, 1)</text>';
},r:v=>{const g=Math.log(v.a);return'Gradient at x = 0 is ln a ≈ '+g.toFixed(3)+', the height there is 1. '+(Math.abs(v.a-Math.E)<.04?'Gradient ≈ height: this is e.':'Slide a towards 2.718 to make them equal.');}};
WG.logfun={t:'Inverses: $e^x$ and $\\ln x$',c:[['t','x-value',-2,1.5,.05,0]],draw:v=>{
  const vb=[-3,4.5,-3,4.5],m=sv(vb),t=v.t,y=Math.exp(t);
  return axes(m,vb)+seg(m,-3,-3,4.5,4.5,'#5d6882',1,true)+curve(m,x=>Math.exp(x),-3,4.5,vb,'#d9b878')+curve(m,x=>Math.log(x),.01,4.5,vb,'#8fa8c8')+dot(m,t,y,'#d9b878')+dot(m,y,t,'#8fa8c8')+seg(m,t,y,y,t,'#86bfa6',1,true)+
   '<text x="8" y="16" fill="#8d98b2" font-size="11">gold: eˣ · blue: ln x · dashed: y = x</text>';
},r:v=>'The point ('+v.t.toFixed(2)+', '+Math.exp(v.t).toFixed(2)+') on eˣ mirrors to ('+Math.exp(v.t).toFixed(2)+', '+v.t.toFixed(2)+') on ln x.'};
WG.trigfun={t:'Build $y=a\\sin(b(x-c))+d$',c:[['a','Amplitude a',.5,3,.1,1.5],['b','b',.5,3,.1,1],['c','Shift c',-3,3,.1,0],['d','Midline d',-2,2,.1,0]],draw:v=>{
  const vb=[-6.5,6.5,-5,5],m=sv(vb),f=x=>v.a*Math.sin(v.b*(x-v.c))+v.d;
  return axes(m,vb)+seg(m,-6.5,v.d,6.5,v.d,'#86bfa6',1,true)+curve(m,Math.sin,-6.5,6.5,vb,'#5d6882',1.2)+curve(m,f,-6.5,6.5,vb,'#d9b878');
},r:v=>'Amplitude '+v.a.toFixed(1)+', period 2π/b ≈ '+(2*Math.PI/v.b).toFixed(2)+', midline y = '+v.d.toFixed(1)+', range ['+(v.d-v.a).toFixed(1)+', '+(v.d+v.a).toFixed(1)+']. Grey is y = sin x.'};
WG.concavity={t:'Concavity of $f(x)=x^3-3x^2$',c:[['t','x',-1,3.4,.05,.5]],draw:v=>{
  const vb=[-1.5,3.7,-5,4],m=sv(vb),f=x=>x*x*x-3*x*x,t=v.t,d=3*t*t-6*t;
  return axes(m,vb)+curve(m,f,-1.5,3.7,vb,'#d9b878')+seg(m,t-.8,f(t)-.8*d,t+.8,f(t)+.8*d,'#86bfa6',1.8)+dot(m,t,f(t),'#fff')+dot(m,1,f(1),'#c98585',3.2);
},r:v=>{const d=3*v.t*v.t-6*v.t,s=6*v.t-6;return'f′ = '+d.toFixed(2)+' ('+(d>0?'rising':d<0?'falling':'stationary')+'), f″ = '+s.toFixed(2)+' → '+(s>0?'concave up':s<0?'concave down':'point of inflection')+'. The red dot at x = 1 is the inflection.';}};
const LF=[0];for(let i=1;i<=40;i++)LF[i]=LF[i-1]+Math.log(i);
WG.binom={t:'Binomial bars',c:[['n','n',1,30,1,10],['p','p',.05,.95,.05,.3]],draw:v=>{
  const n=Math.round(v.n),p=v.p,P=[];let mx=0;
  for(let k=0;k<=n;k++){const lp=LF[n]-LF[k]-LF[n-k]+k*Math.log(p)+(n-k)*Math.log(1-p);P.push(Math.exp(lp));mx=Math.max(mx,P[k]);}
  const w=280/(n+1);return P.map((q,k)=>'<rect x="'+(10+k*w).toFixed(1)+'" y="'+(175-q/mx*150).toFixed(1)+'" width="'+Math.max(1,w-2).toFixed(1)+'" height="'+(q/mx*150).toFixed(1)+'" fill="#8fa8c8" rx="1.5"/>').join('')+'<line x1="'+(10+(n*p+.5)*w).toFixed(1)+'" x2="'+(10+(n*p+.5)*w).toFixed(1)+'" y1="10" y2="175" stroke="#d9b878" stroke-dasharray="4 4"/>';
},r:v=>'Mean np = '+(Math.round(v.n)*v.p).toFixed(2)+', variance np(1−p) = '+(Math.round(v.n)*v.p*(1-v.p)).toFixed(2)+', σ ≈ '+Math.sqrt(Math.round(v.n)*v.p*(1-v.p)).toFixed(2)+'. The dashed line is the mean.'};
WG.complex={t:'Multiplying complex numbers',c:[['r1','|z₁|',.5,2.5,.1,1.5],['a1','arg z₁ (°)',0,180,5,40],['r2','|z₂|',.5,2.5,.1,1.2],['a2','arg z₂ (°)',0,180,5,60]],draw:v=>{
  const vb=[-4,4,-1,4.4],m=sv(vb),R=Math.PI/180,z1=[v.r1*Math.cos(v.a1*R),v.r1*Math.sin(v.a1*R)],z2=[v.r2*Math.cos(v.a2*R),v.r2*Math.sin(v.a2*R)],pr=v.r1*v.r2,pa=(v.a1+v.a2)*R,z3=[pr*Math.cos(pa),pr*Math.sin(pa)];
  let o=axes(m,vb);
  [[z1,'#d9b878'],[z2,'#8fa8c8'],[z3,'#86bfa6']].forEach(a=>{o+=seg(m,0,0,a[0][0],a[0][1],a[1],2)+dot(m,a[0][0],a[0][1],a[1],4);});
  return o+'<text x="8" y="16" fill="#8d98b2" font-size="11">gold z₁ · blue z₂ · green z₁z₂</text>';
},r:v=>'|z₁z₂| = '+(v.r1*v.r2).toFixed(2)+' (moduli multiply). arg(z₁z₂) = '+(v.a1+v.a2)+'° (arguments add).'};
WG.matrix={t:'A matrix transforms the unit square',c:[['a','a',-2,2,.1,1],['b','b',-2,2,.1,.5],['c','c',-2,2,.1,0],['d','d',-2,2,.1,1]],draw:v=>{
  const vb=[-4,4,-3,3.4],m=sv(vb),P=[[0,0],[1,0],[1,1],[0,1]].map(q=>[v.a*q[0]+v.b*q[1],v.c*q[0]+v.d*q[1]]);
  return axes(m,vb)+'<polygon points="'+[[0,0],[1,0],[1,1],[0,1]].map(q=>m.x(q[0]).toFixed(1)+','+m.y(q[1]).toFixed(1)).join(' ')+'" fill="none" stroke="#5d6882" stroke-dasharray="3 3"/><polygon points="'+P.map(q=>m.x(q[0]).toFixed(1)+','+m.y(q[1]).toFixed(1)).join(' ')+'" fill="#d9b87855" stroke="#d9b878" stroke-width="2"/>'+seg(m,0,0,v.a,v.c,'#8fa8c8',2.4)+seg(m,0,0,v.b,v.d,'#86bfa6',2.4);
},r:v=>{const dt=v.a*v.d-v.b*v.c;return'Matrix [[a, b], [c, d]]: columns are where î (blue) and ĵ (green) land. det = ad − bc = '+dt.toFixed(2)+(Math.abs(dt)<.05?' → squashed flat, no inverse.':dt<0?' → area scaled by '+Math.abs(dt).toFixed(2)+' and flipped.':' → area scaled by '+dt.toFixed(2)+'.');}};
WG.vec3d={t:'Dot product and projection (shown in 2D)',c:[['a','angle of a (°)',0,180,5,20],['b','angle of b (°)',0,180,5,70]],draw:v=>{
  const vb=[-4,4,-1,4.4],m=sv(vb),R=Math.PI/180,A=[3*Math.cos(v.a*R),3*Math.sin(v.a*R)],B=[2*Math.cos(v.b*R),2*Math.sin(v.b*R)],d=A[0]*B[0]+A[1]*B[1],k=d/4,pr=[B[0]*k,B[1]*k];
  return axes(m,vb)+seg(m,0,0,A[0],A[1],'#d9b878',2.6)+seg(m,0,0,B[0],B[1],'#8fa8c8',2.6)+seg(m,A[0],A[1],pr[0],pr[1],'#8d98b2',1,true)+seg(m,0,0,pr[0],pr[1],'#86bfa6',4)+'<text x="8" y="16" fill="#8d98b2" font-size="11">gold a (|a|=3) · blue b (|b|=2) · green: projection of a on b</text>';
},r:v=>{const R=Math.PI/180,th=Math.abs(v.a-v.b),d=6*Math.cos(th*R);return'Angle between them '+th+'°, a·b = |a||b|cos θ = '+d.toFixed(2)+(Math.abs(d)<.05?' → perpendicular.':d<0?' (negative: more than 90° apart).':'.')+' Scalar projection of a on b = '+(3*Math.cos(th*R)).toFixed(2)+'.';}};
WG.tangent={t:'Secant to tangent: the limit idea',c:[['t','Point x',-2,2,.05,.5],['h','Gap h',.02,1.5,.02,1]],draw:v=>{
  const vb=[-3,3,-3,3],m=sv(vb),f=x=>.25*x*x*x-x+.5,df=x=>.75*x*x-1,t=v.t,h=v.h,sl=(f(t+h)-f(t))/h;
  return axes(m,vb)+curve(m,f,-3,3,vb,'#d9b878')+seg(m,t-1.5,f(t)-1.5*sl,t+1.5,f(t)+1.5*sl,'#8fa8c8',1.6)+seg(m,t-1.5,f(t)-1.5*df(t),t+1.5,f(t)+1.5*df(t),'#86bfa6',1.6,true)+dot(m,t,f(t),'#fff')+dot(m,t+h,f(t+h),'#8fa8c8');
},r:v=>{const f=x=>.25*x*x*x-x+.5,sl=(f(v.t+v.h)-f(v.t))/v.h;return'Secant gradient = '+sl.toFixed(3)+' (blue). Tangent gradient f′(x) = '+(.75*v.t*v.t-1).toFixed(3)+' (green dashed). Shrink h and the blue line becomes the green one.';}};
WG.riemann={t:'Area as a sum of rectangles',c:[['n','Rectangles n',1,40,1,4]],draw:v=>{
  const vb=[-.3,2.4,-.5,4.6],m=sv(vb),n=Math.round(v.n),w=2/n;let o=axes(m,vb);
  for(let i=0;i<n;i++){const x=i*w,hh=x*x;o+='<rect x="'+m.x(x).toFixed(1)+'" y="'+m.y(hh).toFixed(1)+'" width="'+(m.x(x+w)-m.x(x)).toFixed(1)+'" height="'+Math.max(0,m.y(0)-m.y(hh)).toFixed(1)+'" fill="#8fa8c866" stroke="#8fa8c8"/>';}
  return o+curve(m,x=>x*x,0,2.2,vb,'#d9b878');
},r:v=>{const n=Math.round(v.n),w=2/n;let s=0;for(let i=0;i<n;i++)s+=(i*w)*(i*w)*w;return'Left-rectangle sum for y = x² on [0, 2] with n = '+n+': '+s.toFixed(3)+'. Exact area ∫₀² x² dx = 8/3 ≈ 2.667. More rectangles, better estimate.';}};

WG.projectile={t:'Projectile launcher',c:[['v','Launch speed (m/s)',5,40,1,20],['th','Angle (°)',5,85,1,40],['h0','Launch height (m)',0,30,1,0]],draw:v=>{
  const g=9.8,R=Math.PI/180,vx=v.v*Math.cos(v.th*R),vy=v.v*Math.sin(v.th*R),T=(vy+Math.sqrt(vy*vy+2*g*v.h0))/g,Rg=vx*T,H=v.h0+vy*vy/(2*g);
  const xm=Math.max(Rg*1.1,5),ym=Math.max(H*1.25,3),vb=[-xm*.03,xm,-ym*.08,ym],m=sv(vb),pts=[];
  for(let i=0;i<=60;i++){const t=T*i/60;pts.push(m.x(vx*t).toFixed(1)+','+m.y(v.h0+vy*t-.5*g*t*t).toFixed(1));}
  return axes(m,vb)+'<polyline points="'+pts.join(' ')+'" fill="none" stroke="#d9b878" stroke-width="2"/>'+seg(m,vx*(vy/g),0,vx*(vy/g),H,'#86bfa6',1,true)+dot(m,0,v.h0,'#fff')+dot(m,Rg,0,'#8fa8c8')+dot(m,vx*(vy/g),H,'#86bfa6',3.5);
},r:v=>{const g=9.8,R=Math.PI/180,vx=v.v*Math.cos(v.th*R),vy=v.v*Math.sin(v.th*R),T=(vy+Math.sqrt(vy*vy+2*g*v.h0))/g;
  return'vₓ = '+vx.toFixed(1)+' m/s (constant), vᵧ at launch = '+vy.toFixed(1)+' m/s. Time of flight '+T.toFixed(2)+' s, range '+(vx*T).toFixed(1)+' m, maximum height '+(v.h0+vy*vy/(2*g)).toFixed(1)+' m, landing speed '+Math.sqrt(vx*vx+Math.pow(vy-g*T,2)).toFixed(1)+' m/s. The green dashed line marks the top of the flight.';}};
WG.incline={t:'Block on a slope',c:[['th','Slope angle (°)',0,60,1,30],['mu','Friction coefficient μ',0,1,.05,.3]],draw:v=>{
  const R=Math.PI/180,L=250,x0=25,y0=172,c=Math.cos(v.th*R),s=Math.sin(v.th*R),ux=c,uy=-s,nx=uy,ny=-ux,B=.55*L,bx=x0+B*c,by=y0-B*s,sz=26;
  const P=(x,y)=>x.toFixed(1)+','+y.toFixed(1),c1=[bx-ux*sz/2,by-uy*sz/2],c2=[bx+ux*sz/2,by+uy*sz/2],c3=[c2[0]+nx*sz,c2[1]+ny*sz],c4=[c1[0]+nx*sz,c1[1]+ny*sz],cx=bx+nx*sz/2,cy=by+ny*sz/2;
  const ar=(dx,dy,col)=>'<line x1="'+cx.toFixed(1)+'" y1="'+cy.toFixed(1)+'" x2="'+(cx+dx).toFixed(1)+'" y2="'+(cy+dy).toFixed(1)+'" stroke="'+col+'" stroke-width="2.4"/><circle cx="'+(cx+dx).toFixed(1)+'" cy="'+(cy+dy).toFixed(1)+'" r="3.4" fill="'+col+'"/>';
  const W=5*9.8,N=W*c,pa=W*s,fm=v.mu*N,f=Math.min(fm,pa),k=.8;
  return'<polygon points="'+P(x0,y0)+' '+P(x0+L*c,y0)+' '+P(x0+L*c,y0-L*s)+'" fill="#17223d" stroke="#5d6882"/><polygon points="'+P(...c1)+' '+P(...c2)+' '+P(...c3)+' '+P(...c4)+'" fill="#d9b878" opacity=".85"/>'+ar(0,W*k,'#c98585')+ar(nx*N*k,ny*N*k,'#8fa8c8')+(f>0.5?ar(ux*f*k,uy*f*k,'#86bfa6'):'');
},r:v=>{const R=Math.PI/180,g=9.8,th=v.th*R,N=5*g*Math.cos(th),pa=5*g*Math.sin(th),fm=v.mu*N,a=g*(Math.sin(th)-v.mu*Math.cos(th));
  return'Mass 5.0 kg. Weight along the slope mg sinθ = '+pa.toFixed(1)+' N. Normal force N = mg cosθ = '+N.toFixed(1)+' N. Maximum friction μN = '+fm.toFixed(1)+' N. '+(a>0.0001?'The block slides down with a = '+a.toFixed(2)+' m/s².':'Friction is enough to hold it, so it stays at rest.')+' Red: weight, blue: normal, green: friction.';}};
WG.orbit={t:'Satellite orbit around Earth',c:[['r','Orbital radius (× Earth radius)',1.05,7,.05,1.06]],draw:v=>{
  const sc=12,cx=150,cy=95,a=Date.now()/1000*0.0,rr=v.r*sc;
  return'<circle cx="'+cx+'" cy="'+cy+'" r="'+sc+'" fill="#4d6f93"/><circle cx="'+cx+'" cy="'+cy+'" r="'+rr.toFixed(1)+'" fill="none" stroke="#5d6882" stroke-dasharray="4 4"/><circle cx="'+(cx+rr).toFixed(1)+'" cy="'+cy+'" r="4.5" fill="#d9b878"/>';
},r:v=>{const G=6.67e-11,M=5.97e24,Re=6.37e6,r=v.r*Re,g=G*M/(r*r),vv=Math.sqrt(G*M/r),T=2*Math.PI*r/vv;
  return'r = '+v.r.toFixed(2)+' R⊕ = '+(r/1e6).toFixed(2)+'×10⁶ m (height '+((r-Re)/1000).toFixed(0)+' km). g = '+g.toFixed(2)+' N/kg, orbital speed '+(vv/1000).toFixed(2)+' km/s, period '+(T/60).toFixed(1)+' min ('+(T/3600).toFixed(2)+' h). The geostationary orbit is at about 6.6 R⊕ with a 24 hour period.';}};
WG.lorentz={t:'Charged particle in a magnetic field',c:[['v','Speed (10⁶ m/s)',.5,5,.1,1.5],['B','Field B (mT)',20,500,10,100]],draw:v=>{
  const m=1.67e-27,q=1.60e-19,r=m*v.v*1e6/(q*v.B*1e-3),px=Math.max(8,Math.min(80,r*100*6)),cx=150,cy=95;
  let o='';for(let i=0;i<6;i++)for(let j=0;j<4;j++){const x=30+i*48,y=24+j*46;o+='<circle cx="'+x+'" cy="'+y+'" r="3.2" fill="none" stroke="#5d6882"/><circle cx="'+x+'" cy="'+y+'" r="1" fill="#5d6882"/>';}
  return o+'<circle cx="'+cx+'" cy="'+cy+'" r="'+px.toFixed(1)+'" fill="none" stroke="#d9b878" stroke-width="2"/><circle cx="'+(cx+px).toFixed(1)+'" cy="'+cy+'" r="4.5" fill="#fff"/>';
},r:v=>{const m=1.67e-27,q=1.60e-19,r=m*v.v*1e6/(q*v.B*1e-3),T=2*Math.PI*m/(q*v.B*1e-3);
  return'Proton in a field pointing out of the page. r = mv/(qB) = '+(r*100).toFixed(1)+' cm. Period T = 2πm/(qB) = '+(T*1e9).toFixed(1)+' ns, which does not depend on the speed. Doubling the speed doubles the radius.';}};
WG.transformer={t:'Ideal transformer',c:[['Np','Primary turns',50,1000,10,500],['Ns','Secondary turns',10,1000,10,100],['P','Load power (W)',10,1000,10,100]],draw:v=>{
  const Vp=240,Vs=Vp*v.Ns/v.Np,Ip=v.P/Vp,Is=v.P/Vs,mx=Math.max(Vp,Vs),sc=130/mx;
  const bar=(x,h,col,l)=>'<rect x="'+x+'" y="'+(170-h).toFixed(1)+'" width="52" height="'+h.toFixed(1)+'" fill="'+col+'" rx="3"/><text x="'+(x+26)+'" y="186" fill="#aab5cd" font-size="11" text-anchor="middle">'+l+'</text>';
  return bar(60,Vp*sc,'#8fa8c8','Vp '+Vp+' V')+bar(190,Vs*sc,'#d9b878','Vs '+Vs.toFixed(0)+' V');
},r:v=>{const Vp=240,Vs=Vp*v.Ns/v.Np,Ip=v.P/Vp,Is=v.P/Vs;
  return(v.Ns>v.Np?'Step-up':(v.Ns<v.Np?'Step-down':'1:1'))+' transformer. Vs = Vp·Ns/Np = '+Vs.toFixed(1)+' V. For an ideal transformer VpIp = VsIs = '+v.P+' W, so Ip = '+Ip.toFixed(3)+' A and Is = '+Is.toFixed(3)+' A. Higher voltage means lower current.';}};
WG.projectile.pre=[['Best range (45°)',{th:45}],['Horizontal launch',{th:5,h0:20}],['High launch',{th:75}]];
WG.incline.pre=[['Frictionless',{mu:0}],['Almost sliding',{th:31,mu:.6}],['Steep and rough',{th:45,mu:.5}]];
WG.orbit.pre=[['Low Earth orbit',{r:1.06}],['Moon-distance scale (7 R⊕ max)',{r:7}],['Geostationary (6.6 R⊕)',{r:6.6}]];
WG.lorentz.pre=[['Fast and weak field',{v:5,B:20}],['Slow and strong field',{v:.5,B:500}]];
WG.transformer.pre=[['Step-down 10:1',{Np:500,Ns:50}],['Step-up',{Np:100,Ns:500}]];
WG.expfun.pre=[['a = 2',{a:2}],['a = e (the special one)',{a:2.718}],['a = 4',{a:4}]];
WG.tangent.pre=[['Big gap h = 1',{h:1}],['Tiny gap',{h:.02}]];
WG.binom.pre=[['Fair coin: n 10, p 0.5',{n:10,p:.5}],['Rare event: n 30, p 0.05',{n:30,p:.05}]];
WG.riemann.pre=[['n = 4',{n:4}],['n = 40',{n:40}]];
WG.trigfun.pre=[['Plain sin x',{a:1,b:1,c:0,d:0}],['Double speed',{a:1,b:2,c:0,d:0}]];
WG.complex.pre=[['Same direction',{a1:30,a2:30}],['Right angle between',{a1:20,a2:110}]];
WG.matrix.pre=[['Identity',{a:1,b:0,c:0,d:1}],['Shear',{a:1,b:1,c:0,d:1}],['Singular',{a:1,b:2,c:.5,d:1}]];
WG.vec3d.pre=[['Perpendicular',{a:20,b:110}],['Parallel',{a:40,b:40}]];
function widgetHTML(name,cap){
  const w=WG[name];if(!w)return'';
  return'<div class="wg" data-w="'+name+'"><b class="wgt">'+inl(w.t)+'</b><p class="sub">'+inl(cap)+'</p><svg class="chart" viewBox="0 0 300 190" role="img" aria-label="'+esc(plain(w.t))+'"></svg><div class="ctl">'+w.c.map(c=>'<label>'+esc(c[1])+'<input type="range" name="'+c[0]+'" min="'+c[2]+'" max="'+c[3]+'" step="'+c[4]+'" value="'+c[5]+'"></label>').join('')+'</div><div class="pre"><button class="btn ghost sm" data-act="wgreset">Reset</button>'+(w.pre||[]).map(p=>'<button class="btn ghost sm" data-act="wgpre" data-v="'+esc(JSON.stringify(p[1]))+'">'+esc(p[0])+'</button>').join('')+'</div><p class="wgr"></p></div>';
}
function wgUpdate(root){
  const w=WG[root.dataset.w];if(!w)return;const v={};
  root.querySelectorAll('input').forEach(i=>{v[i.name]=parseFloat(i.value);});
  root.querySelector('svg.chart').innerHTML=w.draw(v);root.querySelector('.wgr').textContent=w.r(v);
}
function afterRender(tries){
  const p=$('#panel');updateClock();p.querySelectorAll('.wg').forEach(wgUpdate);
  if(window.MathJax&&MathJax.typesetPromise){try{MathJax.typesetClear([p]);}catch(e){}MathJax.typesetPromise([p]).catch(()=>{});}
  else if((tries||0)<40)setTimeout(()=>afterRender((tries||0)+1),250);
}
$('#panel').addEventListener('input',e=>{const w=e.target.closest&&e.target.closest('.wg');if(w)wgUpdate(w);});

function errHint(key,given){
  const k=numOfA(key),g=numOfA(given),base='That does not match the answer key. Check the form (exact values, simplified, brackets); if yours is equivalent, tap “I was right”.';
  if(k&&g){
    if(k.v!==0&&Math.abs(g.v+k.v)<1e-9)return'Sign error: your answer is the negative of the key. Recheck the sign on each step.';
    if(k.v!==0&&Math.abs(g.v/k.v-1)<.02)return'Very close: this looks like a rounding difference. Keep full decimals until the last step.';
    if(k.v!==0&&g.v!==0){const r=g.v/k.v;if((Math.abs(r)>=2&&Math.abs(r-Math.round(r))<1e-6)||(Math.abs(1/r)>=2&&Math.abs(1/r-Math.round(1/r))<1e-6))return'Factor error: your answer is a whole-number multiple or fraction of the key. Look for a missed chain-rule factor or a missed division.';}
    return'Wrong value. Redo the working line by line and compare with the worked example in the lesson.';
  }
  const ck=cleanA(key),cg=cleanA(given);
  if(/\+c$/.test(ck)&&!/\+c$/.test(cg)&&sameAns(ck.replace(/\+c$/,''),cg))return'Missing + c: an indefinite integral needs the constant of integration.';
  if(cg==='-'+ck||'-'+cg===ck)return'Sign error: your expression is the negative of the key. Recheck the signs.';
  return base;
}
function solHTML(q,st){
  const steps=String(q.solution||'').split(/(?<=\.)\s+(?=[A-Z$\\(])/).filter(Boolean),n=steps.length;
  if(!st.revealed||n<2)return'<div class="sol"><b>Worked solution</b>\n'+esc(q.solution)+'\n\n<b>Answer:</b> '+esc(q.answer)+'</div>';
  const k=Math.min(n,st.sol||1);
  return'<div class="sol"><b>Worked solution</b> <span class="sub">(step '+k+' of '+n+')</span>\n'+esc(steps.slice(0,k).join(' '))+(k>=n?'\n\n<b>Answer:</b> '+esc(q.answer):'')+'</div>'+(k<n?'<div class="row"><button class="btn ghost" data-act="solnext">Show next step</button><button class="btn link" data-act="solall">Show it all</button></div>':'');
}
/* ---------- prebuilt question sets ---------- */
function qObj(src,qid,ch,retestOf){
  return{q:src.q,answer:src.ad||src.a,keys:[src.a].concat(src.alt||[]),solution:src.sol,topic:src.topic,hints:src.h.slice(0,3),qid:qid,ch:ch,retestOf:retestOf||null,
    st:{conf:null,text:'',attempts:0,hints:0,credit:0,done:false,void:false,note:'',errorType:'',firstWrong:false,wrong:false,busy:false,err:'',revealed:false}};
}
const rot=(n,k,seed)=>Array.from({length:n},(_,i)=>i).sort((a,b)=>((a*7+seed*3)%n)-((b*7+seed*3)%n)||a-b);
function pickPractice(cid){
  const ct=CT[cid],p=S.progress[cid]||{},o=rot(ct.quiz.length,0,p.pc||0).slice(0,5).sort((a,b)=>a-b);
  return o.map(i=>qObj(ct.quiz[i],cid+'-q'+i,cid));
}
function pickCheckpoint(cid){
  const ct=CT[cid],p=S.progress[cid]||{},out=[],used=new Set();
  openMistakes(cid).filter(m=>m.qid&&/-q\d+$/.test(m.qid)).slice(0,3).forEach(m=>{const i=+m.qid.split('-q')[1];if(ct.quiz[i]&&!used.has(i)){used.add(i);out.push(qObj(ct.quiz[i],m.qid,cid,m.id));}});
  rot(ct.quiz.length,0,(p.rc||0)+1).forEach(i=>{if(out.length<8&&!used.has(i)){used.add(i);out.push(qObj(ct.quiz[i],cid+'-q'+i,cid));}});
  return out;
}
function startQuiz(strict){
  const c=findCh(V.sel),cid=c.ch.id;
  if(!CT[cid])return startQuizAI(strict);
  sess={kind:strict?'revise':'learn',ch:c,phase:'q',qa:[],text:'',abort:new AbortController(),qs:strict?pickCheckpoint(cid):pickPractice(cid),i:0,retry:()=>startQuiz(strict)};
  renderPanel();
}
function startComet(){
  const c=findCh(V.sel),cid=c.ch.id,ct=CT[cid];
  sess={kind:'comet',ch:c,phase:'q',qa:[],text:'',abort:new AbortController(),qs:ct.comets.map((q,k)=>qObj(q,cid+'-c'+k,cid)),i:0};renderPanel();
}
function examPool(){
  const s=subj(V.subj),l=chaptersOf(s,V.unit).filter(c=>CT[c.id]),k=(S.exams[s.id+V.unit]||{}).n||0,out=[];
  l.forEach(c=>{const ct=CT[c.id];rot(ct.quiz.length,0,k+1).slice(0,2).forEach(i=>out.push(qObj(ct.quiz[i],c.id+'-q'+i,c.id)));});
  return out;
}
function startExam(){
  const qs=examPool();if(!qs.length)return;
  const s=subj(V.subj);
  const tb=document.getElementById('timedbox'),timed=!!(tb&&tb.checked);
  sess={kind:'exam',ch:{s:s,u:V.unit,ch:{id:'exam',title:'Unit exam'},i:0},phase:'q',qa:[],text:'',abort:new AbortController(),qs:qs,i:0};
  if(timed)sess.deadline=Date.now()+qs.length*120000;renderPanel();
}
function openExam(){flushSave();endSess();V.sel=null;V.add=false;V.insights=false;V.exam=true;renderPanel();chrome();}
function examHTML(){
  const s=subj(V.subj),key=s.id+V.unit,ex=S.exams[key],l=chaptersOf(s,V.unit),have=l.filter(c=>CT[c.id]),n=examPool().length;
  let h='<div class="top"><div><p class="eyebrow">'+esc(s.name)+' · Unit '+V.unit+'</p><h2>Unit exam station</h2></div><button class="x" data-act="close" aria-label="Close">×</button></div>';
  if(!have.length)return h+'<p class="muted">Lessons and question banks for this unit have not been built yet, so there is no exam here.</p>';
  h+='<p class="muted">A mixed, strict exam across every chapter in this unit: '+n+' questions, 2 from each chapter. Confidence rating first, hints cost marks. Questions you miss go into your weak-spot list.</p>'+
   '<div class="stats"><div><b>'+(ex?ex.best+'%':'—')+'</b><span>Best score</span></div><div><b>'+(ex?ex.n:0)+'</b><span>Attempts</span></div></div>'+
   (ex&&ex.hist?'<p class="sub">Recent: '+ex.hist.slice(-5).map(x=>x.pct+'%').join(' · ')+'</p>':'')+
   '<label class="tmr"><input type="checkbox" id="timedbox"> Timed mode: '+(n*2)+' minutes ('+n+' questions, 2 minutes each). When time runs out, unanswered questions score zero.</label><div class="row"><button class="btn" data-act="startexam">Start exam</button></div>';
  return h;
}
function applyExam(){
  const s=subj(V.subj),key=s.id+V.unit,sum=summarize(),pct=Math.round(sum.score*100),ex=S.exams[key]||(S.exams[key]={n:0,best:0,hist:[]});
  ex.n++;ex.best=Math.max(ex.best,pct);ex.hist=(ex.hist||[]).concat([{t:Date.now(),pct:pct}]).slice(-10);
  for(const q of sess.qs){if(q.st.void||q.st.credit>=1)continue;
    if(q.retestOf)continue;
    S.mistakes.push({id:'m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),ch:q.ch,qid:q.qid,topic:q.topic,q:q.q,a:q.answer,type:q.st.errorType||'method',conf:q.st.conf,t:Date.now(),rights:[]});}
  S.mistakes=S.mistakes.slice(-200);
  addXP(40+Math.round(pct/2));
  S.log=S.log.concat([{t:Date.now(),k:'exam',pct:pct}]).slice(-300);
}
function applyPractice(c){
  const sm=summarize(),id=c.ch.id,p=S.progress[id]||(S.progress[id]={status:'new',attempts:0,history:[],streak:0,due:0});
  applyLearn(c);p.pc=(p.pc||0)+1;addXP(10+Math.round(sm.score*10));
}
function applyComet(c){
  let n=0;for(const q of sess.qs){if(q.st.done&&!q.st.revealed&&!q.st.void&&!S.comets[q.qid]){S.comets[q.qid]=Date.now();n++;}}
  addXP(25*n);S.log=S.log.concat([{t:Date.now(),k:'learn',ch:c.ch.id,after:effStatus(c.ch.id)}]).slice(-300);
}
function examResHTML(){
  const sum=summarize(),pct=Math.round(sum.score*100),by={};
  sess.qs.forEach(q=>{if(q.st.void)return;const b=by[q.ch]||(by[q.ch]={n:0,s:0});b.n++;b.s+=q.st.credit;});
  return'<p class="big">'+pct+'%</p><p class="muted">'+(pct>=80?'Strong. You are ready for this unit.':pct>=50?'A solid base with some gaps. The chapters below with low scores are the ones to revisit.':'Plenty to work on. Go back to the weakest chapters below.')+'</p><div class="res">'+
   Object.keys(by).map(id=>{const f=findCh(id);return'<div><span>Ch '+(f?numOf(f.ch,f.i):'')+' · '+esc(f?f.ch.title:id)+'</span><b>'+by[id].s+' / '+by[id].n+'</b></div>';}).join('')+'</div>'+
   '<p class="sub">Hints used: '+sum.hints+'. Confident-but-wrong answers: '+sum.cw+'.</p><div class="row"><button class="btn" data-act="saverev">Save result</button><button class="btn ghost" data-act="back">Discard</button></div>';
}
function renderPanel(){
  const p=$('#panel'),top=p.scrollTop;
  if(V.exam&&!V.insights&&!V.add&&!V.sel){p.innerHTML=(sess&&sess.kind==='exam')?'<div class="top"><div><p class="eyebrow">Unit exam</p><h2>'+esc(subj(V.subj).name)+' · Unit '+V.unit+'</h2></div><button class="x" data-act="close" aria-label="Close">×</button></div>'+sessHTML():examHTML();p.classList.add('open');}
  else renderPanel0();
  p.scrollTop=RESET?0:top;RESET=false;afterRender();
}

/* ---------- design pass 2 ---------- */
let LASTACT=Date.now(),TIMEDIRTY=false;
['pointerdown','keydown','wheel','input','touchstart'].forEach(ev=>addEventListener(ev,()=>{LASTACT=Date.now();},{passive:true}));
function updateClock(){const el=document.getElementById('clock');if(!el||!sess||!sess.deadline)return;const s=Math.max(0,Math.round((sess.deadline-Date.now())/1000));el.textContent='Time left '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0');el.classList.toggle('low',s<120);}
setInterval(()=>{
  if(sess&&sess.deadline&&sess.kind==='exam'&&sess.phase!=='results'){
    updateClock();
    if(Date.now()>=sess.deadline){sess.qs.forEach(q=>{if(!q.st.done){q.st.done=true;q.st.credit=0;q.st.note='Time ran out.';}});sess.phase='results';toast('Time is up.');renderPanel();}
  }
  if(!document.hidden&&Date.now()-LASTACT<120000&&(sess||V.sel||V.exam||V.insights)){const k=dayKey(Date.now());S.time=S.time||{};S.time[k]=(S.time[k]||0)+5;TIMEDIRTY=true;}
},5000);
function markSec(id,sid){
  const p=S.progress[id]||(S.progress[id]={status:'new',attempts:0,history:[],streak:0,due:0}),secs=p.secs||(p.secs={}),ct=CT[id];
  if(!secs[sid]){secs[sid]=Date.now();addXP(5);if(!p.status||p.status==='new')p.status='learning';
    S.log=S.log.concat([{t:Date.now(),k:'learn',ch:id,before:'new',after:effStatus(id)}]).slice(-300);
    if(ct.sections.every(s=>secs[s.id])){p.learned=Date.now();addXP(10);toast('Whole chapter read. Now try the practice questions.');}
    UNSAVED=true;chrome();}
  const i=ct.sections.findIndex(s=>s.id===sid);if(i<ct.sections.length-1)sess.sec=i+1;
}
function checkDoneHTML(){
  const ok=sess.qs.filter(q=>q.st.done&&!q.st.revealed&&q.st.credit>0).length,n=sess.qs.length,pass=ok>=2;
  return'<p class="big">'+ok+' of '+n+'</p><p class="muted">'+(pass?'Nice. You can mark this section as understood.':'Not solid yet. Re-read the worked examples, then try again, or move on and come back.')+'</p><div class="row">'+(pass?'<button class="btn" data-act="checkdone">Mark section understood</button><button class="btn ghost" data-act="checkback">Back to lesson</button>':'<button class="btn" data-act="checkback">Back to lesson</button><button class="btn link" data-act="checkdone">Mark understood anyway</button>')+'</div>';
}
function panelState(){
  const p=$('#panel'),open=p.classList.contains('open');
  if(!open)V.hidden=false;
  p.classList.toggle('hid',open&&!!V.hidden);p.classList.toggle('wide',open&&!!V.wide);
  $('#showpanel').hidden=!(open&&V.hidden);
  const w=$('#panel .top .x[data-act="wide"]');if(w)w.textContent=V.wide?'⤡':'⤢';
}
$('#showpanel').addEventListener('click',()=>{V.hidden=false;panelState();});
$('#legBtn').addEventListener('click',()=>{const l=$('#legend'),o=!l.classList.contains('open');l.classList.toggle('open',o);$('#legBtn').setAttribute('aria-expanded',String(o));});
function chapBtn(l,nx){
  const st=nx?effStatus(nx.id):'solid';
  return'<button class="chip" role="listitem" data-chaps="1" aria-expanded="'+(!!V.chaps)+'"><i class="dot" style="--c:'+COL[st]+'"></i><span class="t">Chapters · '+solidCount(l)+'/'+l.length+' solid '+(V.chaps?'▴':'▾')+'</span></button>';
}
function renderChlist(l,nx){
  const el=$('#chlist');el.hidden=!V.chaps;
  if(!V.chaps){el.innerHTML='';return;}
  el.innerHTML=l.map((c,i)=>{
    const st=effStatus(c.id),ct=CT[c.id],p=S.progress[c.id]||{},d=Object.keys(p.secs||{}).length,tot=ct?ct.sections.length:0;
    return'<button class="chr" data-ch="'+c.id+'" aria-current="'+(V.sel===c.id)+'"><i class="dot" style="--c:'+COL[st]+'"></i><span style="flex:1"><b>'+numOf(c,i)+' · '+esc(c.title)+(nx&&nx.id===c.id?' (next)':'')+'</b><small>'+LABEL[st]+(tot?' · '+d+'/'+tot+' sections':' · no lesson yet')+(ct&&ct.hours?' · about '+ct.hours+' h':'')+'</small><span class="mini"><i style="width:'+(tot?Math.round(d/tot*100):0)+'%"></i></span></span></button>';
  }).join('');
}
function todayPick(){
  let due=null,rev=null,nxt=null;
  for(const s of VS())for(const u of UNITS){for(const c of chaptersOf(s,u)){
    const st=effStatus(c.id);
    if(st==='due'&&!due)due={s:s,c:c,why:'Due for review: bring it back before it fades'};
    if(st==='revise'&&!rev)rev={s:s,c:c,why:'Needs revision: you had most of it, close the gaps'};
    if((st==='new'||st==='learning')&&CT[c.id]&&!nxt)nxt={s:s,c:c,why:st==='new'?'Next chapter to start':'Keep going where you left off'};
  }}
  return due||rev||nxt;
}
function todayHTML(){
  const pk=todayPick(),wt=weakTopics(),w=weekInfo();
  if(!pk)return'';
  return'<div class="tdc"><p class="eyebrow">Today</p><b>'+esc(pk.s.name)+' · '+esc(pk.c.title)+'</b><span>'+esc(pk.why)+'</span>'+(wt.length?'<span>'+wt.length+' weak topic'+(wt.length>1?'s':'')+' open</span>':'')+'<button class="btn" data-today="'+pk.s.id+'|'+pk.c.id+'">Start</button></div>';
}
function studyHTML(){
  const T=S.time||{},now=Date.now(),days=[];
  for(let i=83;i>=0;i--)days.push(dayKey(now-i*DAY));
  const ld={};(S.log||[]).forEach(l=>{const k=dayKey(l.t);ld[k]=(ld[k]||0)+300;});
  const mins=d=>Math.round((T[d]?T[d]:(ld[d]||0))/60);
  const total=Object.values(T).reduce((a,b)=>a+b,0)/3600,wk=days.slice(-7).reduce((a,d)=>a+(T[d]||0),0)/3600;
  const plan=Object.values(CT).reduce((a,c)=>a+(c.hours||0),0);
  let cells='';const first=new Date(now-83*DAY).getDay();for(let i=0;i<first;i++)cells+='<i class="hc pad"></i>';
  days.forEach(d=>{const m=mins(d),lv=m===0?0:m<15?1:m<45?2:m<90?3:4;cells+='<i class="hc l'+lv+'" title="'+d+': '+m+' min"></i>';});
  let rows='';
  VS().forEach(s=>{const l=allChapters(s).filter(c=>CT[c.id]);if(!l.length)return;
    rows+='<h4 class="eyebrow" style="margin:12px 0 4px">'+esc(s.name)+'</h4>'+l.map(c=>{const ct=CT[c.id],p=S.progress[c.id]||{},d=Object.keys(p.secs||{}).length,st=effStatus(c.id),f=findCh(c.id);
      return'<button class="cp" data-ch="'+c.id+'"><i class="dot" style="--c:'+COL[st]+'"></i><span class="cpn">'+(f?numOf(f.ch,f.i):'')+' · '+esc(c.title)+'</span><span class="mini"><i style="width:'+Math.round(d/ct.sections.length*100)+'%"></i></span><b>'+d+'/'+ct.sections.length+'</b></button>';}).join('');});
  return'<h4 class="eyebrow" style="margin:18px 0 6px">Study time</h4><div class="stats"><div><b>'+total.toFixed(1)+' h</b><span>Tracked on this page (of about '+plan+' h planned)</span></div><div><b>'+wk.toFixed(1)+' h</b><span>Last 7 days</span></div></div>'+
   '<div class="prog"><i style="width:'+Math.min(100,Math.round(total/Math.max(plan,1)*100))+'%"></i></div><p class="sub">Time counts only while this page is open and you are active.</p>'+
   '<h4 class="eyebrow" style="margin:14px 0 6px">Last 12 weeks</h4><div class="heat" aria-label="Study heat map">'+cells+'</div>'+
   '<h4 class="eyebrow" style="margin:14px 0 4px">Chapter progress (sections understood)</h4>'+rows;
}
