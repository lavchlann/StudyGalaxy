import re, json
t=open('template.html',encoding='utf8').read()
def rep(old,new,count=1,must=True):
    global t
    n=t.count(old)
    if must and n==0: raise Exception('missing: '+old[:80])
    if count==1 and n!=1 and must: raise Exception('ambiguous(%d): %s'%(n,old[:80]))
    t=t.replace(old,new)

MJ_CFG='{tex:{inlineMath:[["$","$"]],displayMath:[["$$","$$"]],processEscapes:true},svg:{fontCache:"global"},options:{enableMenu:false},startup:{typeset:false}}'
# head + HEAD var
rep('<style id="app-style">\n:root','<script>window.MathJax='+MJ_CFG+';</script>\n<script async src="https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js"></script>\n<style id="app-style">\n:root')
rep("var HEAD='<meta charset","var MJCFG='"+MJ_CFG+"';\nvar HEAD='<scr'+'ipt>window.MathJax='+MJCFG+';</scr'+'ipt><scr'+'ipt async src=\"https://cdn.jsdelivr.net/npm/mathjax@3.2.2/es5/tex-svg.js\"></scr'+'ipt><meta charset")
# content script
rep('<script type="application/json" id="state">__STATE__</script>','<script type="application/json" id="state">__STATE__</script>\n<script type="application/json" id="content">__CONTENT__</script>')
rep("""<script id="app-script">'+script+""","""<script type="application/json" id="content">'+document.getElementById('content').textContent+'</scr'+'ipt>\\n<script id="app-script">'+script+""")
# state defaults
rep("S.bank=S.bank||{};","S.bank=S.bank||{};S.comets=S.comets||{};S.exams=S.exams||{};S.xp=S.xp||0;")
rep("const V={view:'galaxy',subj:null,unit:'3',sel:null,add:false,insights:false,hover:null};","const V={view:'galaxy',subj:null,unit:'3',sel:null,add:false,insights:false,exam:false,hover:null};")
rep("length:260","length:430")
rep("panelOpen=()=>(V.insights||(V.view","panelOpen=()=>(V.insights||V.exam||(V.view")
rep("V.insights=false;","V.insights=false;V.exam=false;",count=0,must=True)
rep("V.add=false;V.insights=!V.insights;","V.add=false;V.exam=false;V.insights=!V.insights;")
rep("function closePanel(){endSess();","function closePanel(){flushSave();endSess();")
rep("function leave(){const id=V.subj;","function leave(){flushSave();const id=V.subj;")
rep("function openChapter(id){\n  endSess();","function openChapter(id){\n  flushSave();endSess();")
# shell html additions
rep('<span id="streak"></span>','<span id="streak"></span><span id="lvl"></span>')
rep('<li><span class="sw dash" style="--c:var(--risk)"></span>Confident but wrong</li>','<li><span class="sw dash" style="--c:var(--risk)"></span>Confident but wrong</li>\n      <li><span class="sw" style="--c:#e8edff;width:5px;height:5px"></span>Moon = section understood</li>\n      <li><span class="sw" style="--c:var(--gold);width:12px;height:4px;border-radius:2px"></span>Comet = extension caught</li>')
# chrome
rep("$('#insightsBtn').setAttribute(","const li0=lvlInfo();$('#lvl').innerHTML='Lv <b>'+li0.L+'</b> · '+li0.x+' XP';\n  $('#insightsBtn').setAttribute(")
rep("""+'<button class="chip add" role="listitem" data-add="1">+ Add chapters</button>';""","""+'<button class="chip" role="listitem" data-exam="1"><i class="dot" style="--c:#ffd98a"></i><span class="t">Unit exam station</span></button><button class="chip add" role="listitem" data-add="1">+ Add chapters</button>';""")
rep("const g=e.target.closest('[data-go]');","if(e.target.closest('[data-exam]')){openExam();return;}\n  const g=e.target.closest('[data-go]');")
rep("if(h.kind==='sun')enterSubject(h.id);else openChapter(h.id);","if(h.kind==='sun')enterSubject(h.id);else if(h.kind==='station')openExam();else openChapter(h.id);")
# drawing block
a=t.index('function drawStars(t){'); b=t.index('let FLASH0')
t=t[:a]+open('draw.js',encoding='utf8').read()+'\n'+t[b:]
rep("""  const bg=ctx.createRadialGradient(W/2,H*.55,0,W/2,H*.55,Math.max(W,H)*.75);
  bg.addColorStop(0,'#0e1830');bg.addColorStop(1,'#060a14');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  drawStars(now);""","  drawBackdrop(now);")
# math style
rep("const MATHSTYLE='Write maths in plain text and Unicode only (x², √x, π, ∫, e^(2x), (a+b)/c, d/dx). Never use LaTeX or dollar signs.';","const MATHSTYLE='Write maths in LaTeX: $...$ for inline maths and $$...$$ for display maths (for example $\\\\frac{d}{dx}e^{2x}=2e^{2x}$).';")
# mistakes qid
rep("S.mistakes.push({id:'m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),ch:id,topic:q.topic,","S.mistakes.push({id:'m'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),ch:id,qid:q.qid,topic:q.topic,")
# insights trophies
rep("""'<p class="sub">A mistake counts as fixed after you answer a fresh version of it correctly on two separate days.</p>';""","""'<p class="sub">A mistake counts as fixed after you answer a fresh version of it correctly on two separate days.</p>'+trophiesHTML();""")
# renderPanel rename
rep("function renderPanel(){\n  const p=$('#panel');\n  if(V.insights)","function renderPanel0(){\n  const p=$('#panel');\n  if(V.insights)")
# overview
a=t.index('function overviewHTML(c,st){'); b=t.index('function addHTML(){')
OV='''function overviewHTML(c,st){
  const p=S.progress[c.ch.id]||{history:[]},h=p.history||[],last=h[h.length-1],best=h.reduce((a,x)=>Math.max(a,x.pct),0),ct=CT[c.ch.id];
  const om=openMistakes(c.ch.id),topics={};om.forEach(m=>{if(m.topic)topics[m.topic]=(topics[m.topic]||0)+1;});
  const tl=Object.keys(topics).slice(0,4).map(k=>esc(k)).join(', ');
  const nextText=st==='solid'?fmtDate(p.due):st==='due'?'Now':p.due&&st==='revise'?fmtDate(p.due):'—';
  const ns=ct?ct.sections.filter(s=>(p.secs||{})[s.id]).length:0;
  let h2='<div class="stats"><div><b>'+(last?last.pct+'%':'—')+'</b><span>Last checkpoint</span></div><div><b>'+(h.length?best+'%':'—')+'</b><span>Best checkpoint</span></div>'+(ct?'<div><b>'+ns+' / '+ct.sections.length+'</b><span>Lesson sections understood</span></div>':'<div><b>'+(p.attempts||0)+'</b><span>Checkpoints taken</span></div>')+'<div><b>'+nextText+'</b><span>Review by</span></div></div>'+
   (om.length?'<p class="sub"><strong>'+om.length+' open mistake'+(om.length>1?'s':'')+'</strong>'+(tl?': '+tl:'')+'. These come back in your next Revise checkpoint.</p>':'<p class="sub">No open mistakes on this chapter.</p>');
  if(ct)h2+='<p class="muted">'+inl(ct.summary)+'</p><div class="row"><button class="btn" data-act="read">'+(ns?'Continue lesson':'Open lesson')+'</button><button class="btn ghost" data-act="practice">Practise</button><button class="btn ghost" data-act="revise">Revise (checkpoint)</button></div>'+
   '<p class="sub"><strong>Lesson</strong> covers every textbook section with worked examples, videos and interactives. <strong>Practise</strong> is relaxed. <strong>Revise</strong> is strict: 8 questions, confidence first, hints cost marks, and 80% or more with at most one hint turns the planet green. Everything here runs on this page, so it uses none of your Claude usage.</p>';
  else h2+='<div class="row"><button class="btn" data-act="learn">Learn this chapter</button><button class="btn ghost" data-act="revise">Revise (checkpoint)</button></div><p class="sub">This chapter has no pre-built lesson yet, so Claude writes it when you open it (this uses some of your Claude usage, then it is remembered).</p>';
  return h2;
}
'''
t=t[:a]+OV+t[b:]
# sessHTML hooks
rep("function sessHTML(){\n","function sessHTML(){\n  if(sess.phase==='read')return readHTML();\n")
i=t.index("  if(sess.phase==='learndone')return'<p class=\"big\">Nice work</p>"); j=t.index('\n',i)
LD='''  if(sess.phase==='learndone'){const sm=summarize();
    if(sess.kind==='comet'){const d=sess.qs.filter(q=>q.st.done&&!q.st.revealed).length;return'<p class="big">'+d+' of '+sess.qs.length+'</p><p class="muted">Comets caught. Caught comets orbit their planet in gold.</p><div class="row"><button class="btn" data-act="savelearn">Save to map</button><button class="btn ghost" data-act="back">Discard</button></div>';}
    return'<p class="big">'+Math.round(sm.score*100)+'%</p><p class="muted">Practice done. The chapter is marked as learning. Take a Revise checkpoint when you feel ready: that is what turns the planet green.</p><div class="row"><button class="btn" data-act="savelearn">Save to map</button><button class="btn ghost" data-act="back">Discard</button></div>';}'''
t=t[:i]+LD+t[j:]
rep("function resHTML(){\n","function resHTML(){\n  if(sess.kind==='exam')return examResHTML();\n")
rep("(strict?'Checkpoint':'Practice')+' · '","(sess.kind==='exam'?'Exam':sess.kind==='comet'?'Comet':strict?'Checkpoint':'Practice')+' · '")
rep("""<button class="btn link" data-act="keybad">The answer key looks wrong</button></div>'""","""<button class="btn link" data-act="keybad">The answer key looks wrong</button><button class="btn link" data-act="claudecheck">Ask Claude to check</button></div>'""")
rep("sess.kind==='revise'","STRICT()",count=0)
# nextQ: STRICT replaced above; comet must finish in learndone -> ok
# quiz funcs rename
rep("async function startQuiz(strict,force){","async function startQuizAI(strict,force){")
rep("retry:()=>startQuiz(strict)};\n  me.practice","retry:()=>startQuizAI(strict)};\n  me.practice")
rep("async function submit(){\n  const q=sess.qs[sess.i],st=q.st,strict=STRICT();","async function submitAI(){\n  const q=sess.qs[sess.i],st=q.st,strict=STRICT();")
NEWSUB='''async function submit(){
  const q=sess.qs[sess.i],st=q.st;
  const box=$('#abox');if(box)st.text=box.value;
  if(!st.text.trim()){toast('Type an answer first.');return;}
  if(!q.keys)return submitAI();
  st.attempts++;
  if(q.keys.some(k=>sameAns(k,st.text))){st.note='';st.errorType='none';st.wrong=false;st.err='';st.done=true;st.credit=(st.attempts===1&&st.hints===0)?1:(st.hints<3?.5:0);}
  else{if(st.attempts===1)st.firstWrong=true;st.wrong=true;st.note='That does not match the answer key. Check the form (exact values, simplified, brackets). If yours is equivalent, tap “I was right”.';st.errorType='method';}
  renderPanel();
}
async function claudeCheck(){
  const q=sess.qs[sess.i],st=q.st,me=sess;
  st.busy=true;st.err='';renderPanel();
  try{
    const r=await askJSON(gradePrompt(sess.ch,q,st.text,STRICT()),me.abort.signal);
    if(sess!==me)return;
    st.busy=false;st.note=String(r.note||'');st.errorType=String(r.errorType||st.errorType||'');
    if(r.correct===true||r.correct==='true'){st.wrong=false;st.done=true;st.credit=(st.attempts<=1&&st.hints===0)?1:(st.hints<3?.5:0);}
  }catch(e){if(sess!==me)return;st.busy=false;st.err=errText(e)+' You can mark this one yourself.';}
  renderPanel();
}
async function submitAI(){'''
rep("async function submitAI(){",NEWSUB)
# click cases
rep("  const a=b.dataset.act,v=b.dataset.v;","  const a=b.dataset.act,v=b.dataset.v;\n  RESET=!['secdone','hint','conf','submit','self','iwasright','keybad','giveup','claudecheck'].includes(a);")
rep("    case'savelearn':applyLearn(sess.ch);endSess();chrome();renderPanel();commit();return;","    case'savelearn':if(sess.kind==='comet')applyComet(sess.ch);else applyPractice(sess.ch);endSess();chrome();renderPanel();commit();return;")
rep("    case'saverev':applyRevise(sess.ch,summarize());endSess();chrome();renderPanel();commit();return;","    case'saverev':if(sess.kind==='exam')applyExam();else{const sm=summarize();applyRevise(sess.ch,sm);const pp=S.progress[sess.ch.ch.id];pp.rc=(pp.rc||0)+1;addXP(20+(outcome(sm)==='solid'?30:0));}endSess();chrome();renderPanel();commit();return;")
CASES='''    case'read':{const c=findCh(V.sel),ct=CT[c.ch.id];sess={kind:'read',ch:c,phase:'read',tab:'lesson',sec:null,qa:[],text:ct.sections.map(s=>s.title+': '+s.blocks.map(x=>x.x||x.q||'').join(' ')).join('\\n'),abort:new AbortController()};break;}
    case'tab':sess.tab=v;break;
    case'sec':sess.sec=+v;break;
    case'secdone':{
      const id=sess.ch.ch.id,p=S.progress[id]||(S.progress[id]={status:'new',attempts:0,history:[],streak:0,due:0}),secs=p.secs||(p.secs={}),ct=CT[id];
      if(!secs[v]){secs[v]=Date.now();addXP(5);if(!p.status||p.status==='new')p.status='learning';
        S.log=S.log.concat([{t:Date.now(),k:'learn',ch:id,before:'new',after:effStatus(id)}]).slice(-300);
        if(ct.sections.every(s=>secs[s.id])){p.learned=Date.now();addXP(10);toast('Whole chapter read. Now try the practice questions.');}
        UNSAVED=true;chrome();}
      const i=ct.sections.findIndex(s=>s.id===v);if(i<ct.sections.length-1)sess.sec=i+1;RESET=true;break;}
    case'comet':startComet();return;
    case'startexam':startExam();return;
    case'claudecheck':claudeCheck();return;
'''
rep("    case'addch':{",CASES+"    case'addch':{")
# insert new js before boot
rep("/* ---------- boot ---------- */",open('new.js',encoding='utf8').read()+"\n/* ---------- boot ---------- */")
# css
rep('#panel{position:absolute;top:64px;','#panel{position:absolute;top:92px;')
CSS='''
#lvl{font-size:13px;color:var(--mute)}#lvl b{color:var(--gold)}
.tabs{display:flex;gap:6px;margin:14px 0 10px;flex-wrap:wrap}.tabs button{border:1px solid var(--line);background:none;border-radius:999px;padding:5px 14px;cursor:pointer;font-weight:500;font-size:13px}.tabs button[aria-selected="true"]{border-color:var(--gold);background:#2a1f0c}
.prog{height:6px;background:var(--panel2);border-radius:99px;overflow:hidden;margin:8px 0 2px}.prog i{display:block;height:100%;background:var(--solid)}
.sumbox{background:var(--panel2);border-radius:12px;padding:10px 14px;margin:10px 0;font-size:14px}
.secnav{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}.sc{border:1px solid var(--line);background:none;border-radius:8px;padding:3px 9px;font-size:12px;cursor:pointer}.sc.cur{border-color:var(--gold);color:var(--gold)}.sc.ok{border-color:var(--solid)}
.sech{font:700 15px/1.3 var(--display);margin:10px 0 4px}
.key{background:#241a08;border:1px solid #5a4116;border-radius:12px;padding:10px 14px;margin:10px 0;overflow-x:auto}
.warn{border-left:3px solid var(--risk);background:#2a1315;border-radius:0 10px 10px 0;padding:8px 12px;margin:10px 0;font-size:14px}
.ex{background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin:12px 0}.exh{color:var(--gold);font-size:13px}.exq{margin:6px 0}.steps{margin:6px 0 6px 1.1em;padding:0}.steps li{margin:.35em 0}.exa{border-top:1px dashed var(--line);margin-top:8px;padding-top:6px}
.tb{background:#0d2220;border:1px solid #1f5a4d;border-radius:12px;padding:10px 14px;margin:12px 0}.tb p{margin:.4em 0;font-size:14px}.tbl{font-size:14px;margin:3px 0}.tbl span{display:inline-block;min-width:96px;color:var(--solid);font-size:12px;text-transform:uppercase;letter-spacing:.06em}
.tbrow{display:flex;gap:12px;flex-wrap:wrap;align-items:baseline;background:var(--panel2);border-radius:10px;padding:7px 12px;margin:5px 0;font-size:13px}.tbrow b{min-width:64px}.tbrow span{color:var(--mute)}
.vid{display:flex;gap:12px;align-items:center;text-decoration:none;color:var(--ink);background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:9px 12px;margin:6px 0}.vid:hover{border-color:var(--gold)}.vid b{display:block;font-size:14px}.vid em{font-style:normal;font-size:12px;color:var(--mute)}.vi{flex:none;width:30px;height:30px;border-radius:50%;background:#2a1f0c;color:var(--gold);display:grid;place-items:center}
.wg{background:#0a1224;border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin:12px 0}.wgt{font-size:13px;color:var(--gold)}.wg>svg{width:100%;height:auto;background:#060c1a;border-radius:10px;display:block}.ctl{display:grid;gap:4px;margin:8px 0}.ctl label{display:grid;grid-template-columns:110px 1fr;align-items:center;gap:8px;font-size:12px;color:var(--mute)}.ctl input{width:100%;accent-color:#ffb454}.wgr{font-size:13px;margin:4px 0 0;min-height:2.6em}
.lvlbar{position:relative;background:var(--panel2);border-radius:12px;padding:10px 12px;overflow:hidden;display:flex;justify-content:space-between;gap:10px;font-size:13px}.lvlbar *{position:relative;z-index:1}.lvlbar i{position:absolute;left:0;top:0;bottom:0;background:#3b2a0a;z-index:0}
.badges{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}.badge{border:1px dashed var(--line);border-radius:12px;padding:8px 10px;opacity:.55}.badge.on{border:1px solid var(--gold);opacity:1;background:#241a08}.badge b{display:block;font-size:13px}.badge span{font-size:11px;color:var(--mute)}
mjx-container{color:inherit}mjx-container[display="true"]{overflow-x:auto;overflow-y:hidden;max-width:100%;margin:.6em 0!important}
'''
rep("</style>\n</head>",CSS+"</style>\n</head>")
exec(open('/home/claude/galaxy-src/patch2.py',encoding='utf8').read())
content=open('/tmp/work/content.json',encoding='utf8').read().replace('<','\\u003c')
state=json.load(open('state.json'))
s=json.dumps(state,separators=(',',':')).replace('<','\\u003c')
t=t.replace('__STATE__',s).replace('__CONTENT__',content)
open('template2.html','w',encoding='utf8').write(t)
import os
os.makedirs('/home/claude/study-galaxy',exist_ok=True)
open('/home/claude/study-galaxy/index.html','w',encoding='utf8').write(t)
print(len(t))
