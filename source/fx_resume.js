
/* =====================================================================
   Saving without interruptions.
   Publishing a new version reloads the page, which used to throw away
   the lesson, scroll position or quiz in progress. Now:
   - progress is kept continuously in this computer's storage (fxMirror);
   - the page is only re-published when you are idle on the sky, or the
     tab is hidden and you are not mid-quiz;
   - before any publish, where you are is remembered and restored after
     the reload (chapter, lesson section, tab, scroll, panel).
   ===================================================================== */
function fxBusy(){return !!(sess&&sess.kind!=='read')||!!(FXOVER&&FXOVER.kind==='fc'&&typeof FC!=='undefined'&&FC.phase==='run');}
function fxIdle(){return !sess&&!FXOVER&&!V.fx&&!V.sel&&!V.exam&&!V.insights&&!V.add&&Date.now()-LASTACT>60000;}
function fxResumeData(){const p=document.getElementById('panel');
  return{view:V.view,subj:V.subj,unit:V.unit,sel:V.sel,insights:!!V.insights,fx:V.fx||null,
    read:sess&&sess.kind==='read'?{sec:sess.sec,tab:sess.tab}:null,scroll:p?p.scrollTop:0,t:Date.now()};}
function fxResumeSave(){try{sessionStorage.setItem('sg_resume',JSON.stringify(fxResumeData()));}catch(e){}}
const fxCommitNow=commit;
let FX_PUB=false;
commit=function(){fxMirror();if(window.SG_WEB){UNSAVED=false;return;}
  if(FX_PUB||(document.hidden&&!fxBusy())){fxResumeSave();return fxCommitNow();}
  UNSAVED=true;};                       /* kept safely; published later when idle */
flushSave=function(){
  if(window.SG_WEB){TIMEDIRTY=false;UNSAVED=false;fxMirror();return;}
  if(TIMEDIRTY){UNSAVED=true;TIMEDIRTY=false;}
  fxMirror();if(!UNSAVED)return;
  if((document.hidden&&!fxBusy())||fxIdle()){UNSAVED=false;FX_PUB=true;try{commit();}finally{FX_PUB=false;}}
};
function fxResumeRestore(d){
  let r=d&&d.resume||null;
  try{const raw=sessionStorage.getItem('sg_resume');if(raw){sessionStorage.removeItem('sg_resume');const x=JSON.parse(raw);if(!r||(x.t||0)>(r.t||0))r=x;}}catch(e){}
  if(!r||Date.now()-(r.t||0)>30*60000)return;
  try{
    if(r.view==='subject'&&subj(r.subj)){V.view='subject';V.subj=r.subj;V.unit=r.unit||'3';}
    if(r.sel&&findCh(r.sel)){V.sel=r.sel;
      if(r.read){const c=findCh(r.sel),ct=CT[c.ch.id];
        if(ct)sess={kind:'read',ch:c,phase:'read',tab:r.read.tab||'lesson',sec:r.read.sec,qa:[],
          text:ct.sections.map(s=>s.title+': '+s.blocks.map(x=>x.x||x.q||'').join(' ')).join('\n'),abort:new AbortController()};}}
    else if(r.fx&&r.fx.k)V.fx=r.fx;
    else if(r.insights)V.insights=true;
    RESET=false;chrome();renderPanel();
    const p=document.getElementById('panel'),y=r.scroll||0;
    if(p&&y){const put=()=>{p.scrollTop=y;};put();requestAnimationFrame(put);setTimeout(put,500);setTimeout(put,1500);}
  }catch(e){}
}
