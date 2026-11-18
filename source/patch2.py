# ---- design pass 2 (exec'd from patch.py; uses t and rep) ----
rep("--mute:#8d98b2; --line:#24345a;","--mute:#aab5cd; --line:#2e4170;")
rep("width:min(440px,calc(100% - 32px))","width:min(500px,calc(100% - 32px))")
rep("const target=panelOpen()?230:0;","const target=panelOpen()?255:0;")
rep("const panelOpen=()=>(V.insights||V.exam||(V.view==='subject'&&(V.sel||V.add)))&&W>=760;","const panelOpen=()=>(V.insights||V.exam||(V.view==='subject'&&(V.sel||V.add)))&&W>=760&&!V.hidden&&!V.wide;")
rep("S.bank=S.bank||{};S.comets=S.comets||{};","S.bank=S.bank||{};S.time=S.time||{};S.comets=S.comets||{};")
# shell html
a=t.index('    <ul id="legend" aria-label="Colour key">'); b=t.index('</ul>',a)+5
LEG=t[a:b].replace('<ul id="legend" aria-label="Colour key">','<ul id="legend" aria-label="Colour key">')
t=t[:a]+'<button id="legBtn" class="pillbtn" aria-expanded="false" aria-controls="legend" title="Colour key" aria-label="Colour key">?</button>\n'+LEG+t[b:]
rep('<aside id="panel" aria-live="polite"></aside>','<div id="chlist" hidden></div>\n  <div id="today"></div>\n  <button id="showpanel" class="pillbtn" hidden>Show lesson panel</button>\n  <aside id="panel" aria-live="polite"></aside>')
rep('Weak spots and this week</button>','Progress and weak spots</button>')
# panel header buttons
OLDX='<button class="x" data-act="close" aria-label="Close">×</button>'
NEWX='<span class="pbtns"><button class="x" data-act="wide" title="Wide reading view" aria-label="Wide reading view">⤢</button><button class="x" data-act="hidepanel" title="Hide panel to see the map" aria-label="Hide panel">–</button><button class="x" data-act="close" aria-label="Close">×</button></span>'
rep(OLDX,NEWX,count=0)
# stats pill + chapter list in chrome
rep("const sk=streakInfo();$('#streak').innerHTML=sk.n?'<b>'+sk.n+'</b> day streak'+(sk.today?'':' · study today to keep it'):'No streak yet';","const sk=streakInfo(),li0=lvlInfo();$('#streak').innerHTML='Lv <b>'+li0.L+'</b> · '+li0.x+' XP · '+(sk.n?'<b>'+sk.n+'</b> day streak':'no streak yet');$('#streak').setAttribute('data-insights','1');\n  if(V.view!=='subject'){V.chaps=false;$('#chlist').hidden=true;}\n  $('#today').innerHTML=V.view==='galaxy'?todayHTML():'';")
rep("\n  const li0=lvlInfo();$('#lvl').innerHTML='Lv <b>'+li0.L+'</b> · '+li0.x+' XP';","")
a=t.index("    ch.innerHTML=l.map((c,i)=>'<button class=\"chip\" role=\"listitem\" style=\"--c:'+COL[effStatus(c.id)]")
b=t.index("+'<button class=\"chip\" role=\"listitem\" data-exam=\"1\">")
t=t[:a]+"    renderChlist(l,nx);ch.innerHTML=chapBtn(l,nx)"+t[b:]
# click handlers
rep("  if(e.target.closest('[data-exam]')){openExam();return;}","  const td=e.target.closest('[data-today]');if(td){const pr=td.dataset.today.split('|');enterSubject(pr[0]);setTimeout(()=>openChapter(pr[1]),900);return;}\n  if(e.target.closest('[data-chaps]')){V.chaps=!V.chaps;chrome();return;}\n  if(e.target.closest('[data-exam]')){V.chaps=false;openExam();return;}")
rep("function openChapter(id){\n  flushSave();","function openChapter(id){\n  V.hidden=false;V.chaps=false;flushSave();")
rep("function openExam(){flushSave();","function openExam(){V.hidden=false;flushSave();")
rep("V.insights=!V.insights;renderPanel();chrome();return;}","V.hidden=false;V.insights=!V.insights;renderPanel();chrome();return;}")
rep("function flushSave(){if(UNSAVED){","function flushSave(){if(typeof TIMEDIRTY!=='undefined'&&TIMEDIRTY){UNSAVED=true;TIMEDIRTY=false;}if(UNSAVED){")
rep("p.scrollTop=RESET?0:top;RESET=false;afterRender();","p.scrollTop=RESET?0:top;RESET=false;panelState();afterRender();")
rep("RESET=!['secdone','hint','conf','submit','self','iwasright','keybad','giveup','claudecheck'].includes(a);","RESET=!['secdone','hint','conf','submit','self','iwasright','keybad','giveup','claudecheck','wgreset','wgpre','solnext','solall','wide','hidepanel'].includes(a);")
CASES2='''    case'wide':V.wide=!V.wide;break;
    case'hidepanel':V.hidden=true;break;
    case'wgreset':case'wgpre':{const w=b.closest('.wg');if(!w)return;if(a==='wgreset')w.querySelectorAll('input').forEach(i=>{i.value=i.defaultValue;});else{const o=JSON.parse(v);w.querySelectorAll('input').forEach(i=>{if(o[i.name]!=null)i.value=o[i.name];});}wgUpdate(w);return;}
    case'solnext':{const st=sess.qs[sess.i].st;st.sol=(st.sol||1)+1;break;}
    case'solall':{sess.qs[sess.i].st.sol=99;break;}
    case'selfcheck':{const par=sess,id=par.ch.ch.id,ct=CT[id],p=S.progress[id]||{},si=Math.max(0,ct.sections.findIndex(s=>s.id===v));
      const idx=rot(ct.quiz.length,0,(p.pc||0)+si*3+1).slice(0,3);
      sess={kind:'check',ch:par.ch,phase:'q',qa:[],text:'',abort:new AbortController(),qs:idx.map(i=>qObj(ct.quiz[i],id+'-q'+i,id)),i:0,parent:par,secid:v};break;}
    case'checkdone':{const par=sess.parent,sid=sess.secid;sess=par;markSec(par.ch.ch.id,sid);break;}
    case'checkback':sess=sess.parent;break;
'''
rep("    case'comet':startComet();return;",CASES2+"    case'comet':startComet();return;")
# session screens
rep("  if(sess.phase==='learndone'){const sm=summarize();","  if(sess.phase==='learndone'&&sess.kind==='check')return checkDoneHTML();\n  if(sess.phase==='learndone'){const sm=summarize();")
rep("(sess.kind==='exam'?'Exam':sess.kind==='comet'?'Comet':STRICT()?'Checkpoint':'Practice')","(sess.kind==='exam'?'Exam':sess.kind==='comet'?'Comet':sess.kind==='check'?'Check yourself':STRICT()?'Checkpoint':'Practice')") if "(sess.kind==='exam'?'Exam':sess.kind==='comet'?'Comet':STRICT()?'Checkpoint':'Practice')" in t else rep("(sess.kind==='exam'?'Exam':sess.kind==='comet'?'Comet':strict?'Checkpoint':'Practice')","(sess.kind==='exam'?'Exam':sess.kind==='comet'?'Comet':sess.kind==='check'?'Check yourself':strict?'Checkpoint':'Practice')")
rep("  let h='<div class=\"qhead\">","  let h=(sess.deadline?'<div id=\"clock\" class=\"clock\"></div>':'')+'<div class=\"qhead\">")
rep("h+='<div class=\"sol\"><b>Worked solution</b>\\n'+esc(q.solution)+'\\n\\n<b>Answer:</b> '+esc(q.answer)+'</div>';","h+=solHTML(q,st);")
rep("st.note='That does not match the answer key. Check the form (exact values, simplified, brackets). If yours is equivalent, tap “I was right”.';","st.note=errHint(q.keys[0],st.text);")
rep("""'<h4 class="eyebrow" style="margin:18px 0 6px">Most-missed topics (tap to open the chapter)</h4>'+rows+""","""studyHTML()+'<h4 class="eyebrow" style="margin:18px 0 6px">Weak-topic ranking (tap to open the chapter)</h4>'+rows+""")
# css
CSS2='''
/* design pass 2 */
.pillbtn{border:1px solid var(--line);background:rgba(13,21,38,.85);border-radius:999px;padding:5px 12px;cursor:pointer;font-weight:500;font-size:13px}
.pillbtn:hover{border-color:var(--gold)}
#legBtn{margin-left:auto;width:30px;height:30px;padding:0;font-weight:700}
#legend{display:none;position:absolute;top:56px;right:20px;flex-direction:column;gap:9px;margin:0;padding:14px 18px;background:rgba(13,21,38,.97);border:1px solid var(--line);border-radius:14px;z-index:8;font-size:13px;color:var(--ink)}
#legend.open{display:flex}
#lvl{display:none}
#streak{border:1px solid var(--line);background:rgba(13,21,38,.85);border-radius:999px;padding:5px 14px;cursor:pointer;color:var(--ink)}
#streak:hover{border-color:var(--gold)}
#showpanel{position:absolute;right:16px;top:70px;z-index:5}
#panel.hid{transform:translateX(112%);opacity:0;pointer-events:none}
#panel.wide{left:16px;right:16px;width:auto}
#panel.wide{padding-left:max(24px,calc((100% - 880px)/2));padding-right:max(24px,calc((100% - 880px)/2))}
#panel.wide .lesson{font-size:17.5px;line-height:1.7}
.lesson{font-size:16px;line-height:1.65}
.pbtns{display:flex;gap:6px;flex:none}
#chlist{position:absolute;top:58px;left:16px;width:min(380px,calc(100% - 32px));max-height:calc(100% - 150px);overflow:auto;background:rgba(13,21,38,.97);border:1px solid var(--line);border-radius:16px;padding:8px;z-index:7}
.chr,.cp{display:flex;gap:10px;align-items:flex-start;width:100%;text-align:left;background:none;border:0;border-radius:10px;padding:9px 10px;cursor:pointer}
.chr:hover,.chr[aria-current="true"],.cp:hover{background:var(--panel2)}
.chr b{display:block;font-size:14px}.chr small{display:block;color:var(--mute);font-size:12px;margin:2px 0 5px}
.chr .dot,.cp .dot{flex:none;width:9px;height:9px;border-radius:50%;background:var(--c);margin-top:6px}
.mini{display:block;height:5px;background:var(--panel2);border-radius:9px;overflow:hidden}.mini i{display:block;height:100%;background:var(--solid)}
.cp{align-items:center;padding:6px 8px}.cpn{flex:1;font-size:13px}.cp .mini{width:90px;flex:none}.cp b{font-size:12px;width:34px;text-align:right;color:var(--mute)}.cp .dot{margin-top:0}
#today{position:absolute;left:50%;bottom:74px;transform:translateX(-50%);z-index:4}
.tdc{display:flex;flex-direction:column;gap:4px;align-items:flex-start;min-width:290px;max-width:380px;background:rgba(13,21,38,.9);backdrop-filter:blur(8px);border:1px solid var(--line);border-radius:16px;padding:14px 18px}
.tdc b{font-size:15px}.tdc span{font-size:13px;color:var(--mute)}.tdc .btn{margin-top:8px;padding:8px 18px}
.secnav{position:sticky;top:-18px;z-index:3;background:rgba(13,21,38,.97);padding:8px 0;margin:6px 0}
.sc em{display:none;font-style:normal;margin-left:6px;color:var(--mute)}#panel.wide .sc em{display:inline}
.sc{padding:4px 10px}
.bd{font-style:normal;font-size:11px;font-weight:700;border-radius:999px;padding:1px 8px;margin-left:8px;border:1px solid var(--line)}
.bd.direct{color:var(--solid);border-color:var(--solid)}.bd.srch{color:var(--mute)}
.wg>svg{max-height:440px}
.pre{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 2px}.btn.sm{padding:4px 10px;font-size:12px;border-radius:9px}
.fb.ok::before{content:'✓';display:inline-block;margin-right:8px;font-weight:700;color:var(--solid)}
.fb.no::before{content:'✕';display:inline-block;margin-right:8px;font-weight:700;color:var(--risk)}
.clock{font:700 13px var(--display);color:var(--gold);margin-bottom:6px}.clock.low{color:var(--risk)}
.tmr{display:flex;gap:8px;align-items:flex-start;font-size:13px;color:var(--mute);margin:10px 0}.tmr input{margin-top:4px}
.heat{display:grid;grid-template-rows:repeat(7,11px);grid-auto-flow:column;gap:3px;overflow-x:auto;margin:6px 0;padding-bottom:4px}
.hc{width:11px;height:11px;border-radius:3px;background:#17223d;display:block}.hc.pad{background:none}.hc.l1{background:#2a4a47}.hc.l2{background:#3e7567}.hc.l3{background:#5aa38a}.hc.l4{background:#86bfa6}
#panel{counter-reset:wk}.wk::before{counter-increment:wk;content:counter(wk);flex:none;width:22px;height:22px;border-radius:50%;background:var(--panel2);display:inline-flex;align-items:center;justify-content:center;font-size:12px;margin-right:10px}
.wk{align-items:center}
@media (max-width:759px){#legBtn{display:none}}
'''
rep("</style>\n</head>",CSS2+"</style>\n</head>")

rep('<h2>Weak spots and this week</h2>','<h2>Progress and weak spots</h2>')
