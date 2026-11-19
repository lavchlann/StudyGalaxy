import json,sys
sys.path.insert(0,'/home/claude/galaxy-src')
from formulas_mm import MM
from formulas_ms import MS
from formulas_ph import PH
P='/home/claude/study-galaxy/index.html'
h=open(P,encoding='utf8').read()
def rep(a,b):
    global h
    assert h.count(a)==1,('count',h.count(a),a[:90])
    h=h.replace(a,b)
css=open('/home/claude/galaxy-src/features.css',encoding='utf8').read()+open('/home/claude/galaxy-src/fx_more.css',encoding='utf8').read()
i=h.index('</style>');h=h[:i]+css+h[i:]
F=json.dumps({'mm':MM,'ms':MS,'ph':PH},ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
JS='\nconst FORMULAS='+F+';\n'+''.join(open('/home/claude/galaxy-src/'+f,encoding='utf8').read() for f in ['fx_core.js','fx_cards.js','fx_tools.js','fx_resume.js','fx_web.js','fx_more.js','fx_ui.js'])+'\n'
rep("/* opening quote */\n(function(){\n  const Q=[",JS+"/* opening quote */\n(function(){\n  if(S.set&&S.set.quote===false){galT0=performance.now();return;}\n  let seen=!!window.__sgIntro;window.__sgIntro=1;\n  try{if(sessionStorage.getItem('sg_intro'))seen=true;sessionStorage.setItem('sg_intro','1');}\n  catch(e){try{const t=+localStorage.getItem('sg_intro_t')||0;if(Date.now()-t<6*3600e3)seen=true;localStorage.setItem('sg_intro_t',Date.now());}catch(e2){}}\n  if(seen){galT0=performance.now();return;}\n  const Q=[")
R=[
("const addXP=n=>{S.xp=(S.xp||0)+n;};","const addXP=n=>fxGain(n);"),
("const levelOf=x=>Math.floor(Math.sqrt(x/40))+1;","const levelOf=x=>fxLevel(x);"),
("function lvlInfo(){const x=S.xp||0,L=levelOf(x),lo=40*(L-1)*(L-1),hi=40*L*L;return{x:x,L:L,f:(x-lo)/(hi-lo),need:hi-x};}",
 "function lvlInfo(){const x=S.xp||0,L=levelOf(x),lo=xpForL(L),hi=L>=MAXL?xpForL(MAXL)+1:xpForL(L+1);return{x:x,L:L,f:L>=MAXL?1:(x-lo)/(hi-lo),need:Math.max(0,hi-x)};}"),
("if(q.keys.some(k=>sameAns(k,st.text))){st.note='';st.errorType='none';st.wrong=false;st.err='';st.done=true;st.credit=(st.attempts===1&&st.hints===0)?1:(st.hints<3?.5:0);",
 "if(q.keys.some(k=>sameAns(k,st.text))){st.note='';st.errorType='none';st.wrong=false;st.err='';st.done=true;st.credit=(st.attempts===1&&st.hints===0)?1:(st.hints<3?.5:0);QOK(q,st);"),
("  if(V.insights){p.innerHTML=insightsHTML();p.classList.add('open');return;}",
 "  if(V.insights){p.innerHTML=insightsHTML();p.classList.add('open');return;}\n  if(V.fx){p.innerHTML=fxPanelHTML();p.classList.add('open');return;}"),
("const panelOpen=()=>(V.insights||V.exam||(V.view==='subject'&&(V.sel||V.add)))","const panelOpen=()=>(V.insights||V.exam||V.fx||(V.view==='subject'&&(V.sel||V.add)))"),
("function closePanel(){flushSave();endSess();V.sel=null;","function closePanel(){flushSave();endSess();V.fx=null;V.sel=null;"),
("function openChapter(id){\n  V.hidden=false;V.chaps=false;flushSave();endSess();","function openChapter(id){\n  V.hidden=false;V.chaps=false;V.fx=null;flushSave();endSess();"),
("function enterSubject(id){V.sel=null;","function enterSubject(id){V.fx=null;S.visited[id]=1;V.sel=null;"),
("V.insights=false;V.exam=true;renderPanel();chrome();}","V.insights=false;V.fx=null;V.exam=true;renderPanel();chrome();}"),
("V.hidden=false;V.insights=!V.insights;renderPanel();chrome();return;}","V.hidden=false;V.fx=null;V.insights=!V.insights;renderPanel();chrome();return;}"),
("$('#today').innerHTML=V.view==='galaxy'?todayHTML():'';","$('#today').innerHTML=V.view==='galaxy'?todayHTML()+fxTodayExtra():'';"),
("<button class=\"chip add\" role=\"listitem\" data-add=\"1\">+ Add chapters</button>'",
 "<button class=\"chip\" role=\"listitem\" data-fx=\"cards-here\"><span class=\"t\">Flashcards</span></button><button class=\"chip\" role=\"listitem\" data-fx=\"formula\"><span class=\"t\">Formula sheet</span></button><button class=\"chip\" role=\"listitem\" data-fx=\"mg\"><i class=\"dot\" style=\"--c:#e08a8a\"></i><span class=\"t\">Mistake nebula</span></button><button class=\"chip add\" role=\"listitem\" data-add=\"1\">+ Add chapters</button>'"),
("h+='<h3 class=\"sech\">'+esc(sec.code)+' · '+esc(sec.title)+'</h3><div class=\"lesson\">'","h+='<h3 class=\"sech\">'+esc(sec.code)+' · '+esc(sec.title)+'</h3>'+fxSecTools(c.ch.id,sec)+'<div class=\"lesson\">'"),
("  hits=[];\n  if(tr){","  hits=[];fxCamStep();ctx.save();ctx.translate(W/2+CAM.x,H/2+CAM.y);ctx.scale(CAM.z,CAM.z);ctx.translate(-W/2,-H/2);\n  if(tr){"),
("    if(k>=1)tr=null;\n    return;\n  }\n  if(V.view==='galaxy')drawGalaxy(now);else drawSubject(now);\n}","    if(k>=1)tr=null;\n    ctx.restore();return;\n  }\n  if(V.view==='galaxy')drawGalaxy(now);else drawSubject(now);\n  ctx.restore();\n}"),
("const b=cv.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;","const b=cv.getBoundingClientRect(),x=(e.clientX-b.left-W/2-CAM.x)/CAM.z+W/2,y=(e.clientY-b.top-H/2-CAM.y)/CAM.z+H/2;"),
("function go(kind,id){\n","function go(kind,id){fxCamReset();\n"),
("  drawMist(t);\n","  drawMist(t);fxEvents(t);\n"),
("  if(!REDUCE){\n    if(t>SS.next)","  if(!REDUCE&&S.set.motion==='full'){\n    if(t>SS.next)"),
("text((tot.d+' / '+tot.t+'  chapters solid').toUpperCase(),cxs,nb+60,'500 10px \"Geist\",system-ui,sans-serif',hov?s.hue:'rgba(142,152,174,.9)','center','1px');",
 "text((tot.d+' / '+tot.t+'  chapters solid').toUpperCase(),cxs,nb+60,'500 10px \"Geist\",system-ui,sans-serif',hov?s.hue:'rgba(142,152,174,.9)','center','1px');"),
("ctx.moveTo(cxs-40,nb+78);ctx.lineTo(cxs+40,nb+78)","ctx.moveTo(cxs-40,nb+90);ctx.lineTo(cxs+40,nb+90)"),
("    if(!o.zoomOn)hits.push({kind:'sun',id:s.id,x:cxs,y:cys+20,r:Math.max(R.w,R.h)*.55});","    if(!o.zoomOn)hits.push({kind:'sun',id:s.id,x:cxs,y:cys+20,r:Math.max(R.w,R.h)*.55});if(!o.zoomOn)fxThreat(s,cxs,cys,Math.max(R.w,R.h)*.55,t);"),
("    if(sc>.95)hits.push({kind:'station',id:'station',x:ep.x,y:ep.y+10,r:44});}","    if(sc>.95)hits.push({kind:'station',id:'station',x:ep.x,y:ep.y+10,r:44});fxThreat(s,ep.x,ep.y,60,t);}"),
("ctx.strokeStyle=rgba('#e8c98a',.16*alpha)","ctx.strokeStyle=rgba(fxAcc()[1],.16*alpha)"),
("ctx.strokeStyle=rgba('#f6dfae',.85*alpha)","ctx.strokeStyle=rgba(fxAcc()[2],.85*alpha)"),
("function buildDoc(){\n","function buildDoc(){fxMirror();\n"),
("REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;","REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches||((S.set||{}).motion==='minimal');"),
("  const m=Math.abs(ti-fi);\n","  const m=Math.abs(ti-fi);if(m>(S.cnt.journeyMax||0))S.cnt.journeyMax=m;\n"),
("function trophiesHTML(){","function trophiesHTML(){const li=lvlInfo();return'<h4 class=\"eyebrow\" style=\"margin:18px 0 6px\">Level and trophies</h4><div class=\"lvlbar\"><b>Level '+li.L+'</b><span>'+li.x+' XP · '+li.need+' to level '+(li.L+1)+'</span><i style=\"width:'+Math.round(li.f*100)+'%\"></i></div><div class=\"row\"><button class=\"btn ghost sm\" data-fx=\"trophy\">Trophy constellations</button><button class=\"btn ghost sm\" data-fx=\"recap\">Weekly recap</button><button class=\"btn ghost sm\" data-fx=\"saved\">Bookmarks and notes</button><button class=\"btn ghost sm\" data-fx=\"mg\">Mistake nebula</button></div>';\n}\nfunction trophiesHTML_old(){"),
]
for a,b in R: rep(a,b)
rep("  if(SAMPLE!==undefined)return SAMPLE;\n","  if(SAMPLE!==undefined)return SAMPLE;\n  if(window.SG_WEB){SAMPLE=fxWebSample();return SAMPLE;}\n")
rep("  if(e.code==='unavailable')return'Lessons and quizzes need this page to be open in Claude.';","  if(e.code==='nokey')return'Add your Claude API key in Settings (the gear icon) to use this.';\n  if(e.code==='badkey'||e.code==='network')return e.message;\n  if(e.code==='unavailable')return'Lessons and quizzes need this page to be open in Claude.';")
rep("async function commit(){\n","async function commit(){\n  if(window.SG_WEB){fxMirror();return;}\n")
rep("  requestAnimationFrame(frame);\n}","  requestAnimationFrame(frame);\n  fxResumeRestore(d);\n}")
rep("window.claude.hot.snapshot(()=>({view:V.view,subj:V.subj,unit:V.unit,sel:V.sel}))","window.claude.hot.snapshot(()=>({view:V.view,subj:V.subj,unit:V.unit,sel:V.sel,resume:fxResumeData()}))")

rep("""    return h+'<div class="row"><button class="btn" data-act="next">'+(sess.i+1<n?'Next question':'See results')+'</button></div>';
  }""","""    if(st.revealed&&!st.selfm)return h+'<div class="selfmark"><p><b>Compare with your working.</b> Did you get it right?</p><div class="row"><button class="btn" data-act="selfright">I got it right</button><button class="btn ghost" data-act="selfwrong">I got it wrong</button></div></div>';
    return h+'<div class="row"><button class="btn" data-act="next">'+(sess.i+1<n?'Next question':'See results')+'</button></div>';
  }""")
rep("""(st.revealed?(strict?'Solution shown. No marks for this one.':'Here is the full solution.'):""","""(st.selfm==='r'?'You marked this right.':st.selfm==='w'?'You marked this wrong. It goes to your mistakes so it comes back.':st.revealed?'Here is the full solution. Work it on paper, then compare.':""")
rep("""    case'giveup':q.st.done=true;q.st.credit=0;q.st.revealed=true;q.st.attempts++;if(q.st.attempts===1)q.st.firstWrong=true;break;""","""    case'giveup':q.st.done=true;q.st.credit=0;q.st.revealed=true;q.st.attempts++;if(q.st.attempts===1)q.st.firstWrong=true;q.st.sol=99;break;
    case'selfright':q.st.selfm='r';q.st.credit=(sess.kind==='revise'||sess.kind==='exam')&&q.st.hints>0?.5:1;q.st.firstWrong=false;q.st.note='';try{QOK(q,q.st);}catch(e){}break;
    case'selfwrong':q.st.selfm='w';q.st.credit=0;break;""")
rep("""      const idx=rot(ct.quiz.length,0,(p.pc||0)+si*3+1).slice(0,3);
      sess={kind:'check',ch:par.ch,phase:'q',qa:[],text:'',abort:new AbortController(),qs:idx.map(i=>qObj(ct.quiz[i],id+'-q'+i,id)),i:0,parent:par,secid:v};break;}""","""      const sc=(ct.sections[si].checks||[]);let qs;
      if(sc.length)qs=sc.slice(0,5).map((x,k)=>qObj(x,id+'-s'+si+'c'+k,id));
      else{const idx=rot(ct.quiz.length,0,(p.pc||0)+si*3+1).slice(0,5);qs=idx.map(i=>qObj(ct.quiz[i],id+'-q'+i,id));}
      sess={kind:'check',ch:par.ch,phase:'q',qa:[],text:'',abort:new AbortController(),qs:qs,i:0,parent:par,secid:v};break;}""")
rep("Check yourself (3 questions)","Check yourself (5 questions)")
rep("'solnext','solall','wide','hidepanel'].includes(a);","'solnext','solall','wide','hidepanel','selfright','selfwrong'].includes(a);")

rep("const days=new Set(S.log.map(e=>dayKey(e.t))),d=new Date(),today=days.has(dayKey(d));","const days=fxStreakDays(),d=new Date(),today=days.has(dayKey(d));")
rep("(sk.n?'<b>'+sk.n+'</b> day streak':'no streak yet')","(sk.n?'<b>'+sk.n+'</b> day streak':'no streak yet')+fxShieldTag()")
rep("'Student question: '+q+'\\nAnswer in under 200 words. '+MATHSTYLE","'Student question: '+q+'\\n'+(S.set.socratic?'Use the Socratic method. Do not give the final answer or the full solution. Ask one or two short guiding questions that lead the student to their next step, and add a small hint only if they seem stuck. If their message shows they have reached the right answer, confirm it and say briefly why it is right. Under 120 words. ':'Answer in under 200 words. ')+MATHSTYLE")
A='<input type="text" id="askbox" placeholder="Ask a question about this chapter" '
assert h.count(A)>=1,('askbox',h.count(A))
h=h.replace(A,'<label class="chk fx-soc"><input type="checkbox" data-fxm="set.socratic" data-rr="0"\'+(S.set.socratic?\' checked\':\'\')+\'> Socratic mode: guide me with questions instead of giving answers</label>'+A)
for a,b in [("'  chapters solid'","'  chapters mastered'"),('Unit exam station','Unit practice exam'),('>Chapters turned solid<','>Chapters mastered<'),('>chapters turned solid<','>chapters mastered<'),('Bright line = chapter solid','Bright line = chapter mastered'),('Make this star solid with a Revise checkpoint first','Master this chapter with a Revise checkpoint first'),('unit exam station','unit practice exam'),("'Turn {n} chapters solid'","'Master {n} chapters'"),("'Turn your first chapter solid'","'Master your first chapter'"),("'Turn 5 chapters solid'","'Master 5 chapters'"),("'Turn 15 chapters solid'","'Master 15 chapters'"),("'Get your first solid planet'","'Master your first chapter'"),("'Make every Unit 3 planet solid in a subject'","'Master every Unit 3 chapter in a subject'"),("'Make every Unit 3 chapter solid in a subject'","'Master every Unit 3 chapter in a subject'"),('></span>Solid</li>','></span>Mastered</li>'),('Pick a constellation to explore',''),("+l.length+' solid '+","+l.length+' mastered '+"),('<span class="t">Mistake nebula</span>','<span class="t">Mistakes</span>')]:
    assert a in h,('label',a);h=h.replace(a,b)
h=h.replace('Bright line = chapter mastered</li>','Bright line = chapter mastered</li><li><span class="sw ring" style="--c:var(--solid)"></span>Ring = mastered · two rings = everything done</li>',1)
open(P,'w',encoding='utf8').write(h)
print('features ok',len(h))
