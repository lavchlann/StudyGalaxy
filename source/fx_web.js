
/* =====================================================================
   WEB MODE (only active when the page sets window.SG_WEB = true) and
   backup / restore (works in both versions).
   - progress is saved in this browser only, no page reloads
   - Claude features use the person's own API key, stored in this browser
   - an "Update ready" button appears when a newer version is deployed
   ===================================================================== */
const WEB=!!window.SG_WEB,APIK='sg_api_key',MODELS=[['claude-sonnet-5-5','Sonnet 5.5 (balanced, recommended)'],['claude-haiku-5-5','Haiku 5.5 (fastest and cheapest)'],['claude-opus-5-5','Opus 5.5 (strongest, costs more)']];
function fxKey(){try{return localStorage.getItem(APIK)||'';}catch(e){return'';}}
function fxParseJSON(t){
  t=String(t||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
  try{return JSON.parse(t);}catch(e){}
  const a=Math.min(...['[','{'].map(c=>{const i=t.indexOf(c);return i<0?1e9:i;})),b=Math.max(t.lastIndexOf(']'),t.lastIndexOf('}'));
  if(a<1e9&&b>a){try{return JSON.parse(t.slice(a,b+1));}catch(e){}}
  throw{message:'Claude sent back something unreadable. Try again.'};
}
function fxWebSample(){
  const call=async(prompt,o,json)=>{
    o=o||{};const key=fxKey();if(!key)throw{code:'nokey'};
    const body={model:S.set.model||'claude-sonnet-5-5',max_tokens:o.max||(json?6000:8000),stream:!json,messages:[{role:'user',content:prompt}]};
    if(json)body.system='Reply with valid JSON only. No commentary and no code fences.';
    let res;
    try{res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',signal:o.signal,
      headers:{'content-type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify(body)});}
    catch(e){if(e&&e.name==='AbortError')throw e;throw{code:'network',message:'Could not reach Claude. Check your internet connection and try again.'};}
    if(!res.ok){let m='';try{const j=await res.json();m=(j.error&&j.error.message)||'';}catch(e){}
      if(res.status===401||res.status===403)throw{code:'badkey',message:'Anthropic did not accept your API key. Check it in Settings (the gear icon).'};
      if(res.status===429)throw{code:'rate_limited'};
      if(res.status===529||res.status>=500)throw{message:'Claude is busy right now. Try again in a moment.'};
      throw{message:m||'The request failed ('+res.status+').'};}
    if(json){const j=await res.json();return(j.content||[]).map(c=>c.text||'').join('');}
    const rd=res.body.getReader(),dec=new TextDecoder();let buf='',text='';
    for(;;){
      const r=await rd.read();if(r.done)break;buf+=dec.decode(r.value,{stream:true});
      let i;while((i=buf.indexOf('\n\n'))>=0){
        const ev=buf.slice(0,i);buf=buf.slice(i+2);
        const line=ev.split('\n').find(l=>l.startsWith('data:'));if(!line)continue;
        let d=null;try{d=JSON.parse(line.slice(5));}catch(e){}
        if(!d)continue;
        if(d.type==='content_block_delta'&&d.delta&&d.delta.text){text+=d.delta.text;if(o.onText)o.onText({text:text});}
        else if(d.type==='error')throw{message:(d.error&&d.error.message)||'Claude stopped partway. Try again.'};
      }
    }
    return text;
  };
  const s=async(prompt,o)=>({text:await call(prompt,o,false)});
  s.json=async(prompt,o)=>fxParseJSON(await call(prompt,o,true));
  s.test=async()=>call('Reply with the single word OK.',{max:16},false);
  return s;
}

/* ---- settings blocks ---- */
function fxSafeHTML(){
  const when=S.savedAt?' Last saved '+new Date(S.savedAt).toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'})+'.':'';
  return'<div><b>Your progress is safe</b><span class="muted">'+(WEB
    ?'Progress saves in this browser every few seconds and whenever you leave a chapter or switch tabs. Updates to the app never touch it. Download a backup now and then in case you ever clear your browser data.'
    :'Progress saves to this page every 90 seconds, whenever you leave a chapter, and when you switch away. A backup copy is also kept on this computer and restored automatically if a save is missed.')+when+'</span></div>';
}
function fxWebSettingsHTML(){
  let h='';
  if(WEB){
    const k=fxKey();
    h+='<div><b>Claude API key</b><span class="muted">Powers “Ask Claude”, written lessons and marking your answers. It is stored only in this browser and sent only to Anthropic. Create one at console.anthropic.com and set a monthly spending limit there.</span>'+
      '<input type="password" id="fx-key" class="fx-in" placeholder="'+(k?'Key saved (ends …'+esc(k.slice(-4))+'). Paste a new one to replace it':'Paste your key (starts with sk-ant-)')+'" autocomplete="off" spellcheck="false">'+
      '<div class="row"><button class="btn sm" data-fx="keysave">Save key</button><button class="btn ghost sm" data-fx="keytest">Test it</button>'+(k?'<button class="btn link sm" data-fx="keyclear">Remove key</button>':'')+'</div>'+
      '<span class="muted" id="fx-keymsg" role="status"></span></div>'+
      '<div><b>Claude model</b><span class="muted">Sonnet is a good balance. Haiku is the cheapest if you use it a lot.</span><select data-fxs="model" class="fx-in">'+
        MODELS.map(m=>'<option value="'+m[0]+'"'+((S.set.model||'claude-sonnet-5-5')===m[0]?' selected':'')+'>'+m[1]+'</option>').join('')+'</select></div>';
  }
  h+='<div><b>Backup and transfer</b><span class="muted">'+(WEB?'Your progress lives in this browser. ':'')+(WEB?'Download a backup, or copy':'Copy')+' the backup code below to move your progress to another version or browser.</span>'+
    '<div class="row">'+(WEB?'<button class="btn ghost sm" data-fx="bkdl">Download backup</button>':'')+'<button class="btn ghost sm" data-fx="bkshow">Show backup code</button>'+
    '<label class="btn ghost sm" style="cursor:pointer">Restore from file<input type="file" id="fx-bkf" accept=".json,application/json" hidden></label></div>'+
    '<div id="fx-bkbox"></div>'+
    '<textarea id="fx-bkp" class="fx-in" rows="3" placeholder="To restore, paste a backup code here" spellcheck="false"></textarea>'+
    '<div class="row"><button class="btn ghost sm" data-fx="bkrestore" id="fx-bkr">Restore from pasted code</button></div>'+
    '<span class="muted" id="fx-bkmsg" role="status"></span></div>';
  return h;
}
function fxBackupObj(){fxMirror();const o={sgBackup:1,at:Date.now()};USERKEYS.forEach(k=>o[k]=S[k]);return o;}
function fxRestoreFrom(txt){
  let o;try{o=JSON.parse(String(txt).trim());}catch(e){return'That does not look like a Study Galaxy backup.';}
  if(!o||typeof o!=='object'||!('xp' in o||'progress' in o||'time' in o))return'That does not look like a Study Galaxy backup.';
  const keepXP=Math.max(S.xp||0,+o.xp||0);
  USERKEYS.forEach(k=>{if(o[k]!==undefined&&k!=='savedAt')S[k]=o[k];});
  S.xp=keepXP;for(const k in FXDEF){if(S[k]==null)S[k]=JSON.parse(JSON.stringify(FXDEF[k]));}
  CARDS=null;fxMirror();UNSAVED=true;fxApplySettings();chrome();renderPanel();
  return'';
}
function fxSetMsg(id,t){const m=document.getElementById(id);if(m)m.textContent=t;}
function fxWebAct(a,v,b){
  switch(a){
    case'keysave':{const i=document.getElementById('fx-key'),k=i?i.value.trim():'';
      if(!/^sk-ant-/.test(k)){fxSetMsg('fx-keymsg','That does not look like an Anthropic key. It should start with sk-ant-.');return;}
      try{localStorage.setItem(APIK,k);}catch(e){fxSetMsg('fx-keymsg','This browser would not store the key.');return;}
      i.value='';fxSetMsg('fx-keymsg','Key saved. Press Test it to check that it works.');break;}
    case'keyclear':try{localStorage.removeItem(APIK);}catch(e){}renderPanel();setTimeout(()=>fxSetMsg('fx-keymsg','Key removed from this browser.'),30);break;
    case'keytest':{fxSetMsg('fx-keymsg','Testing…');fxWebSample().test().then(()=>fxSetMsg('fx-keymsg','Working. Claude answered.'),e=>fxSetMsg('fx-keymsg',e&&e.code==='nokey'?'Paste and save a key first.':errText(e)));break;}
    case'bkdl':{const blob=new Blob([JSON.stringify(fxBackupObj())],{type:'application/json'}),u=URL.createObjectURL(blob),a2=document.createElement('a');
      a2.href=u;a2.download='study-galaxy-backup-'+dayKey(Date.now())+'.json';document.body.appendChild(a2);a2.click();a2.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);
      fxSetMsg('fx-bkmsg','Backup downloaded. If nothing happened, use “Show backup code” instead.');break;}
    case'bkshow':{const box=document.getElementById('fx-bkbox');if(!box)break;
      box.innerHTML='<textarea id="fx-bkt" class="fx-in" rows="4" readonly></textarea><div class="row"><button class="btn ghost sm" data-fx="bkcopy">Copy code</button></div>';
      const t=document.getElementById('fx-bkt');t.value=JSON.stringify(fxBackupObj());t.focus();t.select();break;}
    case'bkcopy':{const t=document.getElementById('fx-bkt');if(!t)break;t.focus();t.select();
      let ok=false;try{ok=document.execCommand('copy');}catch(e){}
      if(!ok&&navigator.clipboard)navigator.clipboard.writeText(t.value).then(()=>fxSetMsg('fx-bkmsg','Copied.'),()=>{});
      fxSetMsg('fx-bkmsg',ok?'Copied.':'Select the code above and copy it.');break;}
    case'bkrestore':{const t=document.getElementById('fx-bkp'),txt=t?t.value:'';
      if(!txt.trim()){fxSetMsg('fx-bkmsg','Paste a backup code first.');return;}
      if(b&&!b.dataset.sure){b.dataset.sure='1';b.textContent='Press again to replace progress on this page';return;}
      const err=fxRestoreFrom(txt);setTimeout(()=>fxSetMsg('fx-bkmsg',err||'Progress restored.'),30);if(!err)toast('Progress restored.');break;}
    case'update':fxMirror();location.reload();break;
  }
}
document.addEventListener('change',e=>{
  const t=e.target;if(!t||t.id!=='fx-bkf'||!t.files||!t.files[0])return;
  const rd=new FileReader();rd.onload=()=>{if(!confirmRestore()){fxSetMsg('fx-bkmsg','Restore cancelled.');return;}const err=fxRestoreFrom(rd.result);setTimeout(()=>fxSetMsg('fx-bkmsg',err||'Progress restored from the file.'),30);if(!err)toast('Progress restored.');};
  rd.readAsText(t.files[0]);t.value='';
});
function confirmRestore(){try{return window.confirm('Replace the progress on this page with the progress in this file?');}catch(e){return true;}}

/* ---- web only: saving, updates, install ---- */
if(WEB){
  addEventListener('beforeunload',()=>fxMirror());
  try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){}
  const SGB=String(window.SG_BUILD||'dev');
  let updShown=false;
  function fxShowUpdate(j){
    if(updShown)return;updShown=true;
    const b=document.createElement('button');b.id='fx-upd';b.type='button';b.dataset.fx='update';
    b.innerHTML='<i></i>Update ready<span>Refresh</span>';b.title=(j&&j.notes)||'A newer version of Study Galaxy is available.';
    document.body.appendChild(b);requestAnimationFrame(()=>b.classList.add('on'));
    b.addEventListener('click',()=>fxWebAct('update'));
  }
  async function fxCheckUpdate(){
    try{const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const j=await r.json();if(j&&j.v&&j.v!==SGB)fxShowUpdate(j);}catch(e){}
  }
  setTimeout(fxCheckUpdate,6000);setInterval(fxCheckUpdate,5*60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)fxCheckUpdate();});
  if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){
    addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{});});
  }
}
