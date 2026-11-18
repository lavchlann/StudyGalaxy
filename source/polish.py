import re
JS=r'''
/* opening quote */
(function(){
  const Q=[['The important thing is not to stop questioning.','Albert Einstein'],
  ['We are all in the gutter, but some of us are looking at the stars.','Oscar Wilde'],
  ['The cosmos is within us. We are made of star-stuff.','Carl Sagan'],
  ['Look up at the stars and not down at your feet.','Stephen Hawking'],
  ['Nothing in life is to be feared, it is only to be understood.','Marie Curie'],
  ['Per aspera ad astra. Through hardship, to the stars.','Latin proverb'],
  ['I have no special talents. I am only passionately curious.','Albert Einstein'],
  ['If I have seen further it is by standing on the shoulders of Giants.','Isaac Newton'],
  ['The universe is under no obligation to make sense to you.','Neil deGrasse Tyson'],
  ['Success is the sum of small efforts, repeated day in and day out.','Robert Collier'],
  ['Pure mathematics is, in its way, the poetry of logical ideas.','Albert Einstein'],
  ['It is always darkest just before the day dawneth.','Thomas Fuller'],
  ['Genius is one per cent inspiration, ninety-nine per cent perspiration.','Thomas Edison'],
  ['Equipped with his five senses, man explores the universe around him and calls the adventure Science.','Edwin Hubble']];
  let last=-1;try{last=+localStorage.getItem('sg_lastq');}catch(e){}
  let i=Math.floor(Math.random()*Q.length);if(i===last)i=(i+1+Math.floor(Math.random()*(Q.length-1)))%Q.length;
  try{localStorage.setItem('sg_lastq',i);}catch(e){}
  const q=Q[i],words=q[0].split(' '),el=document.createElement('div');el.id='intro';el.setAttribute('role','dialog');el.setAttribute('aria-label','Opening quote');
  const d0=600,step=170,end=d0+words.length*step;
  el.innerHTML='<div class="q"><p class="qt">'+words.map((w,k)=>'<span style="animation-delay:'+(d0+k*step)+'ms">'+esc(w)+'</span>').join(' ')+'</p><span class="qa" style="animation-delay:'+(end+500)+'ms">'+esc(q[1])+'</span></div><div class="qh" style="animation-delay:'+(end+1600)+'ms,'+(end+3600)+'ms">Click anywhere to enter</div>';
  document.body.appendChild(el);
  const td=document.getElementById('today');if(td)td.classList.add('out');
  galT0=performance.now()+1e9;
  let done=false;
  function go(){if(done)return;done=true;el.classList.add('gone');setTimeout(()=>el.classList.add('off'),700);galT0=performance.now()+500;
    setTimeout(()=>{if(td)td.classList.remove('out');},1400);setTimeout(()=>el.remove(),2700);
    removeEventListener('keydown',go);}
  el.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();go();});el.addEventListener('click',e=>e.stopPropagation());addEventListener('keydown',go);
  setTimeout(go,REDUCE?1500:end+4200);
})();
'''
P='/home/claude/study-galaxy/index.html'
h=open(P,encoding='utf8').read()
def rep(a,b,cnt=1):
    global h
    n=h.count(a)
    assert n>=1,('missing',a[:80])
    h=h.replace(a,b) if cnt=='all' else h.replace(a,b,cnt)
CDN='https://cdn.jsdelivr.net/npm/'
F='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300..700&display=swap">'
G='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;700&family=Unbounded:wght@500;700&display=swap">'
# static head (may be split over lines)
h=re.sub(r'<link rel="preconnect" href="https://fonts.googleapis.com">\s*<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\s*<link rel="stylesheet" href="https://fonts.googleapis.com/css2\?[^"]*">',F,h)
assert 'Hanken' not in h.split('<style')[0], 'old font left'
css=open('/home/claude/galaxy-src/polish.css',encoding='utf8').read()
i=h.index('</style>');h=h[:i]+css+h[i:]
# canvas fonts handled in draw.js
h=h.replace('"Hanken Grotesk"','"Geist"')
# hero offset for galaxy view
rep("function cx0(){return W/2-shiftX;}","let heroX=0;function cx0(){return W/2-shiftX+heroX;}")
rep("function freeW(){return W-2*shiftX;}","function freeW(){return W-2*shiftX-2*heroX;}")
rep("shiftX+=(target-shiftX)*(REDUCE?1:.09);","shiftX+=(target-shiftX)*(REDUCE?1:.09);{const ht=(V.view==='galaxy'&&W>1100&&!panelOpen())?Math.min(200,W*.13):0;heroX+=(ht-heroX)*(REDUCE?1:.07);}")
# hero html
rep("function todayHTML(){\n  const pk=todayPick(),wt=weakTopics(),w=weekInfo();\n  if(!pk)return'';\n  return'<div class=\"tdc\">",
"""function heroHTML(){
  const d=new Date(),hr=d.getHours(),g=hr<5?'Still up':hr<12?'Good morning':hr<18?'Good afternoon':'Good evening';
  let t=0,s=0;VS().forEach(x=>{const o=subjectTotals(x);t+=o.t;s+=o.d;});
  const hrs=Object.values(S.time||{}).reduce((a,b)=>a+b,0)/3600,L=lvlInfo();
  return'<div class="hero"><p class="eyebrow">'+d.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'})+'</p><h2 class="heroT">'+g+'.<br><em>Where to tonight?</em></h2><div class="heroS"><span><b>'+s+'<small style="font-size:.5em;color:var(--mute)"> / '+t+'</small></b>Chapters solid</span><span><b>'+(hrs<10?hrs.toFixed(1):Math.round(hrs))+'h</b>Studied</span><span><b>'+L.L+'</b>Level</span></div></div>';
}
function todayHTML(){
  const pk=todayPick(),wt=weakTopics(),w=weekInfo();
  if(!pk)return heroHTML();
  return heroHTML()+'<div class="tdc">""")
h=h.replace("Where to tonight?</em>","'+(new Date().getHours()<17&&new Date().getHours()>=5?'Where to today?':'Where to tonight?')+'</em>",1)
# fresh animation trigger
rep("function renderPanel0(){\n  const p=$('#panel');","function renderPanel0(){\n  const p=$('#panel');{const k0=[V.insights,V.add,V.sel,V.exam].join('|');if(k0!==window.__pk){window.__pk=k0;p.classList.add('fresh');clearTimeout(window.__pt);window.__pt=setTimeout(()=>p.classList.remove('fresh'),900);}}")
rep("if(V.view!=='subject'){V.view='subject';V.subj=tr.subj;chrome();}","if(V.view!=='subject'){V.view='subject';V.subj=tr.subj;unitT0=performance.now();chrome();}")
rep("if(V.view!=='galaxy'){V.view='galaxy';chrome();}","if(V.view!=='galaxy'){V.view='galaxy';galT0=performance.now()-900;chrome();}")
rep("tr={kind:kind,subj:id,t0:performance.now(),dur:1100};","tr={kind:kind,subj:id,t0:performance.now(),dur:1300};{const td=$('#today');if(td){if(kind==='in')td.classList.add('out');else setTimeout(()=>td.classList.remove('out'),700);}}")
i=h.index('<script id="app-script">');j=h.index('</script>',i)
js=h[i:j]
for a,b in [('at most one hint turns the planet green','at most one hint lights the star up'),('They appear as new planets','They appear as new stars'),('Caught comets orbit their planet in gold','Caught comets circle their star in gold'),('Caught comets orbit the','Caught comets circle the'),('turns the planet green','lights the star up'),('This planet turns green','This star lights up'),('This planet turns amber','This star turns amber'),('this planet','this star'),('This planet','This star'),('the planet','the star'),('planets','stars'),('Pick a subject to enter its solar system','Pick a constellation to explore')]:
    js=js.replace(a,b)
h=h[:i]+js+h[j:]
h=h.replace('Moon = section understood','Arc = sections understood').replace('<li><span class="sw" style="--c:var(--gold);width:12px;height:4px;border-radius:2px"></span>Comet = extension caught</li>','<li><span class="sw" style="--c:var(--gold);width:12px;height:4px;border-radius:2px"></span>Comet = extension caught</li><li><span class="sw" style="--c:#f6dfae;width:14px;height:2px;border-radius:2px"></span>Bright line = chapter solid</li>')
rep("  V.sel=id;renderPanel();chrome();\n}","  const pv=V.sel;V.sel=id;startJourney(pv,id);renderPanel();chrome();\n}")
k=h.index("if(window.claude&&window.claude.hot&&window.claude.hot.ready)window.claude.hot.ready(start);")
h=h[:k]+JS+h[k:]
open(P,'w',encoding='utf8').write(h)
print('ok',len(h))
