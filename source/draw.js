/* ---------- star-chart engine: constellations, not orbits ---------- */
const hexA=a=>Math.round(clamp(a,0,1)*255).toString(16).padStart(2,'0');
const rgba=(c,a)=>{const h=hex(c.length===7?c:'#cccccc');return'rgba('+h[0]+','+h[1]+','+h[2]+','+clamp(a,0,1).toFixed(3)+')';};
const easeOut=x=>1-Math.pow(1-x,3);
const easeBack=x=>{const c=1.9;x=clamp(x,0,1);return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2);};
let PX=0,PY=0,PXt=0,PYt=0,galT0=performance.now();
addEventListener('pointermove',e=>{PXt=e.clientX/Math.max(1,innerWidth)-.5;PYt=e.clientY/Math.max(1,innerHeight)-.5;});
const DUST=Array.from({length:2600},()=>{const v=(rnd()+rnd()+rnd()+rnd()-2)/2;return{u:rnd(),v:v,r:rnd()*rnd()*1.1+.18,a:rnd()*.45+.08,c:rnd()};});
const CLOUD=Array.from({length:26},()=>({u:rnd(),v:(rnd()-.5)*.7,r:rnd()*.5+.25,c:rnd()}));
const SKY=Array.from({length:520},()=>({x:rnd(),y:rnd(),r:rnd()*rnd()*1.2+.2,a:rnd()*.5+.15,c:rnd()}));
let BG=null,BGk='';
function buildBG(){
  const d=qd(),bw=Math.round(W*1.08),bh=Math.round(H*1.08);
  BG=document.createElement('canvas');BG.width=Math.round(bw*d);BG.height=Math.round(bh*d);
  const g=BG.getContext('2d');g.scale(d,d);
  const base=g.createLinearGradient(0,0,bw,bh);base.addColorStop(0,'#000000');base.addColorStop(.55,'#020203');base.addColorStop(1,'#030304');
  g.fillStyle=base;g.fillRect(0,0,bw,bh);
  // milky way band along a diagonal
  const ang=-.42,cx=bw*.52,cy=bh*.5,L=Math.hypot(bw,bh)*1.1,BW=Math.min(bw,bh)*.22;
  g.save();g.translate(cx,cy);g.rotate(ang);
  CLOUD.forEach(c=>{const x=(c.u-.5)*L,y=c.v*BW,r=c.r*BW*1.6;const gr=g.createRadialGradient(x,y,0,x,y,r);
    const col=c.c>.72?'92,90,96':c.c>.4?'72,74,86':'60,62,72';gr.addColorStop(0,'rgba('+col+',.035)');gr.addColorStop(1,'rgba('+col+',0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);});
  // dark dust lane
  for(let i=0;i<14;i++){const x=(i/13-.5)*L,y=Math.sin(i*1.7)*BW*.12,r=BW*(.35+.2*Math.sin(i*2.3));const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(2,3,8,.32)');gr.addColorStop(1,'rgba(2,3,8,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);}
  DUST.forEach(p=>{const x=(p.u-.5)*L,y=p.v*BW;g.globalAlpha=.55*p.a*(1-Math.min(1,Math.abs(p.v)*.9));g.fillStyle=p.c>.85?'#ffe2bd':p.c<.3?'#b9c6ff':'#e2e8ff';g.fillRect(x,y,p.r,p.r);});
  g.restore();g.globalAlpha=1;
  SKY.forEach(s=>{g.globalAlpha=s.a;g.fillStyle=s.c>.85?'#ffe8c8':s.c<.3?'#bccaff':'#e6ecff';g.beginPath();g.arc(s.x*bw,s.y*bh,s.r,0,6.283);g.fill();});
  g.globalAlpha=1;
  // faint celestial grid (star-atlas feel)
  g.strokeStyle='rgba(200,200,210,.022)';g.lineWidth=1;
  const ox=bw*.5,oy=bh*1.9;
  for(let i=1;i<=9;i++){g.beginPath();g.arc(ox,oy,bh*(.75+i*.17),Math.PI*1.08,Math.PI*1.92);g.stroke();}
  for(let i=-6;i<=6;i++){const a=-Math.PI/2+i*.11;g.beginPath();g.moveTo(ox+Math.cos(a)*bh*.9,oy+Math.sin(a)*bh*.9);g.lineTo(ox+Math.cos(a)*bh*2.6,oy+Math.sin(a)*bh*2.6);g.stroke();}
  BGk=W+'x'+H+'@'+qd();
}
let SS={next:2500,t0:-1e9,x:0,y:0,dx:0,dy:0};
function drawBackdrop(t){
  if(!BG||BGk!==W+'x'+H+'@'+qd())buildBG();
  PX+=(PXt-PX)*.04;PY+=(PYt-PY)*.04;
  const ox=-W*.04-PX*W*.03-shiftX*.06,oy=-H*.04-PY*H*.03;
  ctx.drawImage(BG,ox,oy,W*1.08,H*1.08);
  drawStars(t);
  drawMist(t);
  if(tr&&!REDUCE)warp(t);
  if(!REDUCE){
    if(t>SS.next){SS={next:t+5000+Math.random()*8000,t0:t,x:Math.random()*W*.7+W*.1,y:Math.random()*H*.35,dx:300+Math.random()*220,dy:110+Math.random()*90};}
    const k=(t-SS.t0)/1000;
    if(k>=0&&k<1){const e=easeOut(k),x=SS.x+SS.dx*e,y=SS.y+SS.dy*e,tl=.22,g=ctx.createLinearGradient(x,y,x-SS.dx*tl,y-SS.dy*tl);
      g.addColorStop(0,'rgba(255,248,230,'+(1-k)*.9+')');g.addColorStop(1,'rgba(255,255,255,0)');ctx.strokeStyle=g;ctx.lineWidth=1.4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-SS.dx*tl,y-SS.dy*tl);ctx.stroke();
      ctx.fillStyle='rgba(255,250,235,'+(1-k)+')';ctx.beginPath();ctx.arc(x,y,1.4,0,6.283);ctx.fill();}
  }
}
function drawStars(t){
  for(const s of stars){
    if(s.d<.55)continue;
    const a=.25+.55*(.5+.5*Math.sin(t*s.s*1.4+s.p));
    const x=((s.x*W-PX*s.d*40-shiftX*s.d*.12)%W+W)%W,y=((s.y*H-PY*s.d*26)%H+H)%H;
    ctx.globalAlpha=a*(.4+s.d*.6);ctx.fillStyle=s.d>.9?'#fff1d8':s.d<.65?'#c3cfff':'#eef2ff';
    ctx.beginPath();ctx.arc(x,y,s.r*.9,0,6.283);ctx.fill();
    if(s.d>.96&&s.r>1){ctx.globalAlpha*=.5;ctx.fillRect(x-s.r*3,y-.3,s.r*6,.6);ctx.fillRect(x-.3,y-s.r*3,.6,s.r*6);}
  }
  ctx.globalAlpha=1;
}
/* a star glyph: halo, diffraction spikes, hot core */
function starGlyph(x,y,r,col,k,t,sd,o){
  o=o||{};const tw=REDUCE?1:.82+.18*Math.sin(t*.0026+sd*1.9)+.06*Math.sin(t*.011+sd*4.1);
  ctx.save();ctx.globalCompositeOperation='lighter';
  const hr=r*(5+4*k)*(o.boost||1);
  const g=ctx.createRadialGradient(x,y,0,x,y,hr);g.addColorStop(0,rgba(col,.5*k));g.addColorStop(.18,rgba(col,.2*k));g.addColorStop(.5,rgba(col,.05*k));g.addColorStop(1,rgba(col,0));
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,hr,0,6.283);ctx.fill();
  if(k>.3){
    const Ls=r*(3+7*k)*tw*(o.boost||1),rot=o.rot||0;
    const spike=(a,L,w)=>{const ex=x+Math.cos(a)*L,ey=y+Math.sin(a)*L,gr=ctx.createLinearGradient(x,y,ex,ey);gr.addColorStop(0,rgba('#ffffff',.85*k));gr.addColorStop(.25,rgba(col,.45*k));gr.addColorStop(1,rgba(col,0));
      ctx.strokeStyle=gr;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(ex,ey);ctx.stroke();};
    ctx.lineCap='round';
    for(let i=0;i<4;i++)spike(rot+i*Math.PI/2,Ls,Math.max(.8,r*.32));
    if(o.diag)for(let i=0;i<4;i++)spike(rot+Math.PI/4+i*Math.PI/2,Ls*.42,Math.max(.6,r*.2));
  }
  const c=ctx.createRadialGradient(x,y,0,x,y,r*1.25);c.addColorStop(0,'#ffffff');c.addColorStop(.45,rgba(col,1));c.addColorStop(1,rgba(col,0));
  ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r*1.25,0,6.283);ctx.fill();
  ctx.restore();
}
function text(t,x,y,font,color,align,ls,halo){ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align||'center';ctx.textBaseline='alphabetic';if('letterSpacing' in ctx)ctx.letterSpacing=ls||'0px';if(halo){ctx.save();ctx.strokeStyle='rgba(4,6,13,.9)';ctx.lineWidth=5;ctx.lineJoin='round';ctx.strokeText(t,x,y);ctx.restore();}ctx.fillText(t,x,y);if('letterSpacing' in ctx)ctx.letterSpacing='0px';}
function pill(){}
function allChapters(s){return UNITS.reduce((a,u)=>a.concat(chaptersOf(s,u)),[]);}
/* deterministic constellation shapes */
const LAY={};
function hashS(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return(Math.abs(h)%2147483646)+1;}
function layout(key,n){
  const kk=key+':'+n;if(LAY[kk])return LAY[kk];
  let sd=hashS(key);const R=()=>(sd=(sd*16807)%2147483647)/2147483647;
  let best=null;
  for(let at=0;at<60;at++){
    const pts=[[0,0]];let a=R()*6.283,ok=true;
    for(let i=1;i<n;i++){
      let placed=false;
      for(let tr2=0;tr2<40&&!placed;tr2++){
        const na=a+(R()-.5)*2.3,dd=.8+R()*.55,p=[pts[i-1][0]+Math.cos(na)*dd,pts[i-1][1]+Math.sin(na)*dd*.85];
        if(pts.every((q,j)=>Math.hypot(q[0]-p[0],q[1]-p[1])>(j===i-1?.6:.78))){
          let cross=false;for(let j=0;j<i-2;j++)if(segX(pts[j],pts[j+1],pts[i-1],p))cross=true;
          if(!cross){pts.push(p);a=na;placed=true;}
        }
      }
      if(!placed){ok=false;break;}
    }
    if(!ok)continue;
    const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),bw=Math.max(...xs)-Math.min(...xs)||1,bh=Math.max(...ys)-Math.min(...ys)||1;
    const sc=Math.abs(Math.log((bw/bh)/1.55));
    if(!best||sc<best.sc)best={pts,sc};
  }
  if(!best)best={pts:Array.from({length:n},(_,i)=>[i,(i%2)*.6])};
  const xs=best.pts.map(p=>p[0]),ys=best.pts.map(p=>p[1]),x0=Math.min(...xs),y0=Math.min(...ys),bw=(Math.max(...xs)-x0)||1,bh=(Math.max(...ys)-y0)||1;
  const P=best.pts.map(p=>[(p[0]-x0)/bw,(p[1]-y0)/bh]);
  const extra=[];
  if(n>=6){for(let i=0;i<n&&extra.length<1;i++)for(let j=i+3;j<n-1&&extra.length<1;j++){const d=Math.hypot(best.pts[i][0]-best.pts[j][0],best.pts[i][1]-best.pts[j][1]);
    if(d<1.25){let cross=false;for(let q=0;q<n-1;q++)if(q!==i&&q!==j&&q+1!==i&&q+1!==j&&segX(best.pts[q],best.pts[q+1],best.pts[i],best.pts[j]))cross=true;if(!cross)extra.push([i,j]);}}}
  return LAY[kk]={P,ar:bw/bh,extra};
}
function segX(a,b,c,d){const o=(p,q,r)=>Math.sign((q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]));return o(a,b,c)!==o(a,b,d)&&o(c,d,a)!==o(c,d,b);}
function fitPts(L,rx,ry,rw,rh){
  const s=Math.min(rw/L.ar,rh),w=s*L.ar,h=s;
  return L.P.map(p=>({x:rx+(rw-w)/2+p[0]*w,y:ry+(rh-h)/2+p[1]*h}));
}
const STAR={new:{c:'#aab6d6',k:.46,r:2.7},learning:{c:'#9fc0f0',k:.72,r:3.4},revise:{c:'#e3bd78',k:.72,r:3.5},due:{c:'#e3bd78',k:.8,r:3.7},solid:{c:'#fff0cf',k:1,r:4.3}};
function starStyle(id){const st=effStatus(id);return Object.assign({st:st},STAR[st]||STAR.new);}
function partial(a,b,f){return{x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f};}
function drawLines(pts,lit,fr,alpha,extra){
  ctx.save();ctx.lineCap='round';
  for(let i=0;i<pts.length-1;i++){
    const f=fr(i);if(f<=0)continue;const a=pts[i],b=partial(pts[i],pts[i+1],f),L=lit(i);
    if(L){ctx.globalCompositeOperation='lighter';ctx.strokeStyle=rgba('#e8c98a',.16*alpha);ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      ctx.strokeStyle=rgba('#f6dfae',.85*alpha);ctx.lineWidth=1.4;}
    else{ctx.globalCompositeOperation='source-over';const sh=REDUCE?1:.55+.45*Math.sin(performance.now()*.0009-i*.8);ctx.strokeStyle=rgba('#c4cff2',(.12+.2*sh)*alpha);ctx.lineWidth=1;}
    if(L===2)ctx.setLineDash([2,6]);
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);
  }
  (extra||[]).forEach(e=>{const f=Math.min(fr(e[0]),fr(e[1]-1));if(f<1)return;ctx.globalCompositeOperation='source-over';ctx.strokeStyle=rgba('#b9c6ee',.14*alpha);ctx.lineWidth=1;ctx.setLineDash([1,5]);ctx.beginPath();ctx.moveTo(pts[e[0]].x,pts[e[0]].y);ctx.lineTo(pts[e[1]].x,pts[e[1]].y);ctx.stroke();ctx.setLineDash([]);});
  ctx.restore();
}
/* light pulses travelling along lit stretches */
function drawFlow(pts,lit,t,alpha){
  if(REDUCE)return;ctx.save();ctx.globalCompositeOperation='lighter';
  for(let i=0;i<pts.length-1;i++){if(!lit(i)||lit(i)===2)continue;
    const a=pts[i],b=pts[i+1],len=Math.hypot(b.x-a.x,b.y-a.y),ph=((t*.00035+i*.37)%1);
    const p=partial(a,b,ph),g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,7);g.addColorStop(0,rgba('#fff6e0',.9*alpha*Math.sin(ph*Math.PI)));g.addColorStop(1,rgba('#fff6e0',0));
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,7,0,6.283);ctx.fill();if(len<0)break;}
  ctx.restore();
}
/* ---------- galaxy: every subject is a constellation ---------- */
function regionOf(i,n){
  const fw=freeW(),cx=cx0(),top=96,bot=H-80,hh=bot-top;
  if(n===1)return{x:cx-fw*.25,y:top+hh*.12,w:fw*.5,h:hh*.62};
  const bw=Math.min(fw*.3,440),bh=Math.min(hh*.3,230);
  const spots=n===2?[[-.24,.06],[.24,.3]]:n===3?[[.02,-.01],[-.25,.47],[.27,.45]]:[[-.25,0],[.25,0],[-.25,.5],[.25,.5]];
  const s=spots[i%spots.length];
  return{x:cx+s[0]*fw-bw/2,y:top+hh*.06+s[1]*hh,w:bw,h:bh};
}
function drawGalaxy(t,o){
  o=o||{};const A=o.alpha==null?1:o.alpha,list=VS();
  ctx.save();ctx.globalAlpha=A;
  let zc=null;
  list.forEach((s,i)=>{const R=regionOf(i,list.length);if(o.zoomOn===s.id)zc={x:R.x+R.w/2,y:R.y+R.h/2};});
  if(zc){ctx.translate(zc.x,zc.y);ctx.scale(o.z,o.z);ctx.translate(-zc.x,-zc.y);}
  const gk=REDUCE?1:clamp((performance.now()-galT0)/4200,0,1);
  list.forEach((s,i)=>{
    const R=regionOf(i,list.length),chs=allChapters(s),n=chs.length,hov=V.hover===s.id&&!o.zoomOn,tot=subjectTotals(s);
    const cxs=R.x+R.w/2,cys=R.y+R.h/2;
    const hk=hov?1:0;
    const neb=ctx.createRadialGradient(cxs,cys,0,cxs,cys,Math.max(R.w,R.h)*.75);neb.addColorStop(0,s.hue+hexA(.035+.06*hk));neb.addColorStop(1,s.hue+'00');ctx.fillStyle=neb;ctx.fillRect(R.x-R.w,R.y-R.h,R.w*3,R.h*3);
    if(!n){text(s.name,cxs,cys,'600 21px "Geist",system-ui,sans-serif','rgba(238,240,246,.5)');hits.push({kind:'sun',id:s.id,x:cxs,y:cys,r:80});return;}
    const L=layout(s.id+'|all',n),pts=fitPts(L,R.x,R.y,R.w,R.h);
    const local=clamp(gk*1.6-i*.22,0,1);
    const fr=k=>clamp(local*(n-1)-k,0,1);
    const lit=k=>{const st=effStatus(chs[k].id);return st==='solid'||st==='due'?1:0;};
    drawLines(pts,lit,fr,(.75+.25*hk),L.extra);
    drawFlow(pts,lit,t,1);
    chs.forEach((c,k)=>{const sp=clamp(local*(n-1)-k+1,0,1);if(sp<=0)return;const ss=starStyle(c.id),u4=!CT[c.id];
      const r=ss.r*1.15*(u4?.75:1)*(1+.18*hk)*(1+1.4*(1-easeOut(sp)));ctx.globalAlpha=A*easeOut(sp);
      starGlyph(pts[k].x,pts[k].y,r,ss.c,ss.k*(u4?.6:1)*(.85+.3*hk),t,k+i*7,{diag:ss.st==='solid'});ctx.globalAlpha=A;});
    const nb=Math.max(...pts.map(p=>p.y));
    ctx.globalAlpha=A*clamp(local*2,0,1);
    text(s.name,cxs,nb+40,'600 '+(hov?22:21)+'px "Geist",system-ui,sans-serif',hov?'#ffffff':'rgba(238,240,246,.92)');
    text((tot.d+' / '+tot.t+'  chapters solid').toUpperCase(),cxs,nb+60,'500 10px "Geist",system-ui,sans-serif',hov?s.hue:'rgba(142,152,174,.9)','center','1px');
    if(hov){ctx.strokeStyle=rgba(s.hue,.5);ctx.lineWidth=1;const w=ctx.measureText(s.name).width;ctx.beginPath();ctx.moveTo(cxs-40,nb+78);ctx.lineTo(cxs+40,nb+78);ctx.stroke();}
    ctx.globalAlpha=A;
    if(!o.zoomOn)hits.push({kind:'sun',id:s.id,x:cxs,y:cys+20,r:Math.max(R.w,R.h)*.55});
  });
  ctx.restore();
}
function cometAt(x,y,r,k,t,col,dim){
  const rx=r*5.2,ry=r*2.6,a0=t*.0011+k*2.3,tilt=-.5,ct=Math.cos(tilt),st=Math.sin(tilt);
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(let j=11;j>=0;j--){
    const a=a0-j*.07,px=Math.cos(a)*rx,py=Math.sin(a)*ry;
    ctx.globalAlpha=(dim?.3:.9)*(1-j/12);ctx.fillStyle=col;
    ctx.beginPath();ctx.arc(x+px*ct-py*st,y+px*st+py*ct,Math.max(.5,(j===0?1.9:1.5)*(1-j/14)),0,6.283);ctx.fill();
  }
  ctx.restore();
}
function compass(x,y,R,t,hov,best){
  ctx.save();ctx.translate(x,y);
  const g=ctx.createRadialGradient(0,0,0,0,0,R*3.4);g.addColorStop(0,'rgba(240,210,150,'+(hov?.32:.2)+')');g.addColorStop(1,'rgba(240,210,150,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,R*3.4,0,6.283);ctx.fill();
  ctx.rotate(REDUCE?0:t*.00012);
  ctx.strokeStyle='rgba(241,220,174,.45)';ctx.lineWidth=1;ctx.setLineDash([2,4]);ctx.beginPath();ctx.arc(0,0,R*1.9,0,6.283);ctx.stroke();ctx.setLineDash([]);
  for(let i=0;i<24;i++){const a=i*Math.PI/12,l=i%6===0?7:3;ctx.beginPath();ctx.moveTo(Math.cos(a)*R*2.25,Math.sin(a)*R*2.25);ctx.lineTo(Math.cos(a)*(R*2.25+l),Math.sin(a)*(R*2.25+l));ctx.stroke();}
  ctx.rotate(REDUCE?0:-t*.00024);
  const pts=[];for(let i=0;i<16;i++){const a=i*Math.PI/8-Math.PI/2,rr=i%4===0?R*1.6:i%2===0?R*.8:R*.38;pts.push([Math.cos(a)*rr,Math.sin(a)*rr]);}
  const fg=ctx.createLinearGradient(0,-R*1.6,0,R*1.6);fg.addColorStop(0,'#fff3d4');fg.addColorStop(1,'#c9a35e');
  ctx.fillStyle=fg;ctx.globalAlpha=hov?1:.92;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();
  ctx.fillStyle='#0a0e1a';ctx.beginPath();ctx.arc(0,0,R*.22,0,6.283);ctx.fill();
  ctx.restore();
  text('Unit exam',x,y+R*2.25+26,'600 15px "Geist",system-ui,sans-serif',hov?'#fff':'rgba(238,240,246,.9)');
  text((best==null?'NOT ATTEMPTED':'BEST '+best+'%'),x,y+R*2.25+42,'500 10.5px "Geist",system-ui,sans-serif','rgba(217,184,120,.85)','center','1px');
}
function wrapTitle(s,max){if(s.length<=max)return[s];const w=s.split(' ');let a='',b='';for(const x of w){if((a+' '+x).trim().length<=max&&!b)a=(a+' '+x).trim();else b=(b+' '+x).trim();}if(b.length>max+4)b=b.slice(0,max+2)+'…';return[a,b];}
/* ---------- subject: one constellation per unit ---------- */
function drawSubject(t,o){
  o=o||{};const s=subj(V.subj);if(!s)return;
  const list=chaptersOf(s,V.unit),n=list.length,fw=freeW(),cx=cx0(),A=o.alpha==null?1:o.alpha;
  const sc=o.scale==null?1:o.scale;
  ctx.save();ctx.globalAlpha=A;
  const top=124,bot=H-160,rx=cx-fw/2+150,rw=fw-300;
  ctx.translate(cx,(top+bot)/2);ctx.scale(sc,sc);ctx.translate(-cx,-(top+bot)/2);
  if(!n){text('No chapters here yet',cx,H/2-10,'600 24px "Geist",system-ui,sans-serif','rgba(238,240,246,.7)');text('ADD SOME FROM THE LIST BELOW',cx,H/2+16,'500 10px "Geist",system-ui,sans-serif','rgba(142,152,174,.9)','center','1px');ctx.restore();return;}
  const L=layout(s.id+'|u'+V.unit,n+1),pts=fitPts(L,rx,top,rw,bot-top);
  const z=Math.min(fw,H)/820,base=clamp(z,.8,1.35);
  const dur=REDUCE?1:900+n*420,ku=unitT0<0?1:clamp((performance.now()-unitT0)/dur,0,1);
  const fr=k=>clamp(ku*(n+.4)-k,0,1);
  const lit=k=>{if(k===n-1)return 2;const st=effStatus(list[k].id);return st==='solid'||st==='due'?1:0;};
  drawLines(pts,lit,fr,1,L.extra);
  drawFlow(pts,lit,t,A);
  const nxt=nextOf(list);
  const J=journeyStep(list,pts,ku);
  list.forEach((c,i)=>{
    const sp=REDUCE?1:clamp((ku*(n+.4)-i+.15)*1.6,0,1);if(sp<=0)return;
    const ss=starStyle(c.id),p=S.progress[c.id]||{},sel=V.sel===c.id,hov=V.hover===c.id,x=pts[i].x,y=pts[i].y,info=CT[c.id];
    const r=ss.r*base*1.25*(hov?1.22:1)*(1+1.2*(1-easeOut(sp)));ctx.globalAlpha=A*easeOut(sp);
    // section progress arc
    if(info&&info.sections.length){const f=Object.keys(p.secs||{}).length/info.sections.length,ar=r*3.4+6;
      ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,ar,0,6.283);ctx.stroke();
      if(f>0){ctx.strokeStyle=rgba(ss.st==='new'?'#9fbbe6':ss.c,.85);ctx.lineCap='round';ctx.beginPath();ctx.arc(x,y,ar,-Math.PI/2,-Math.PI/2+6.283*f);ctx.stroke();}}
    else{ctx.strokeStyle='rgba(185,198,238,.28)';ctx.lineWidth=1;ctx.setLineDash([2,3]);ctx.beginPath();ctx.arc(x,y,r*2.4,0,6.283);ctx.stroke();ctx.setLineDash([]);}
    const pf=JR&&JR.passed[i]?.7*Math.exp(-(performance.now()-JR.passed[i])/900):0;
    starGlyph(x,y,r*(1+.5*pf),pf>.05?'#ffffff':ss.c,Math.min(1,(info?ss.k:ss.k*.6)+pf),t,i+3,{diag:ss.st==='solid'||pf>.3,boost:(hov?1.15:1)+pf*.9});
    if(ss.st==='due'){const k=REDUCE?.5:(Math.sin(t*.004)+1)/2;ctx.strokeStyle=rgba('#e3bd78',.3+.5*k);ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(x,y,r*3.4+12+k*5,0,6.283);ctx.stroke();}
    if(p.risky){ctx.strokeStyle=rgba('#c98585',.8);ctx.lineWidth=1.4;ctx.setLineDash([3,4]);ctx.beginPath();ctx.arc(x,y,r*3.4+11,0,6.283);ctx.stroke();ctx.setLineDash([]);}
    if(nxt&&nxt.id===c.id&&!sel&&!REDUCE){for(let q=0;q<2;q++){const k=((t*.00045)+q*.5)%1;ctx.strokeStyle=rgba('#d9b878',(1-k)*.55);ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y,r*3.4+6+k*34,0,6.283);ctx.stroke();}}
    if(sel&&!(JR&&JR.id===c.id)){ctx.save();ctx.translate(x,y);ctx.rotate(REDUCE?0:t*.0006);const R2=r*3.4+14;ctx.strokeStyle='rgba(255,255,255,.85)';ctx.lineWidth=1.2;
      for(let q=0;q<4;q++){ctx.beginPath();ctx.arc(0,0,R2,q*Math.PI/2+.25,q*Math.PI/2+Math.PI/2-.25);ctx.stroke();ctx.beginPath();ctx.moveTo(R2+3,0);ctx.lineTo(R2+10,0);ctx.stroke();ctx.rotate(Math.PI/2);}ctx.restore();}
    const fl=S.flash;
    if(fl&&fl.id===c.id&&Date.now()-fl.t<120000&&performance.now()-FLASH0<6400){const k=((performance.now()-FLASH0)/1600)%1;
      ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=rgba(ss.c,1-k);ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r*2+k*70,0,6.283);ctx.stroke();ctx.restore();
      starGlyph(x,y,r,ss.c,1,t,i,{diag:true,boost:1+1.2*(1-k)});}
    if(info&&(ss.st==='solid'||ss.st==='due')){const done=info.comets.filter((q,k)=>S.comets[c.id+'-c'+k]).length;
      for(let k=0;k<done;k++)cometAt(x,y,r,k,t,'#e8c98a',false);if(done<info.comets.length)cometAt(x,y,r,done+1,t,'#9fb4ff',true);}
    // labels
    const la=(hov||sel?1:.78)*clamp(sp*1.4-.4,0,1),ly=y+r*3.4+(sel?40:22);
    ctx.globalAlpha=A*la;
    const isN=nxt&&nxt.id===c.id;
    text((String(numOf(c,i)).padStart(2,'0'))+(isN?'  ·  NEXT':''),x,ly,(hov?'600 11.5px':'500 10.5px')+' "Geist",system-ui,sans-serif',isN?'#d9b878':hov?'#ffffff':'rgba(142,152,174,.95)','center','1px',true);
    ctx.globalAlpha=A;
    if(sc>.95)hits.push({kind:'planet',id:c.id,x:x,y:y+10,r:Math.max(r*3.4+12,30)});
  });
  if(J)drawComet(J,pts,A);
  if(V.sel&&!J){const si=list.findIndex(c=>c.id===V.sel);if(si>=0)drawReveal(list[si],si,pts[si],base,A,fw,cx);}
  // exam: the guiding star at the end of the constellation
  const ep=pts[n],esp=REDUCE?1:clamp((ku*(n+.4)-n+.2)*1.5,0,1);
  if(esp>0){const ex=S.exams[s.id+V.unit],hov=V.hover==='station';
    ctx.globalAlpha=A*esp;compass(ep.x,ep.y,9*base*easeBack(esp),t,hov,ex?ex.best:null);ctx.globalAlpha=A;
    if(sc>.95)hits.push({kind:'station',id:'station',x:ep.x,y:ep.y+10,r:44});}
  ctx.restore();
}

/* hyperspace streaks while flying between views */
function warp(t){
  const k=clamp((t-tr.t0)/tr.dur,0,1),I=Math.sin(k*Math.PI);if(I<.02)return;
  const cx=W/2,cy=H/2,dir=tr.kind==='in'?1:-1;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  for(let i=0;i<stars.length;i+=2){const s=stars[i],x=s.x*W,y=s.y*H,dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy)||1,L=I*d*.18*(.4+s.d);
    ctx.strokeStyle='rgba(200,205,225,'+(I*.22*s.d).toFixed(3)+')';ctx.lineWidth=s.r*.7;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx/d*L*dir,y+dy/d*L*dir);ctx.stroke();}
  const g=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*.5);ctx.globalCompositeOperation='source-over';g.addColorStop(0,'rgba(0,0,0,'+(I*.3).toFixed(3)+')');g.addColorStop(1,'rgba(0,0,0,'+(I*.9).toFixed(3)+')');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.restore();
}

/* ---------- star-to-star journey + name reveal ---------- */
let JR=null,REV=null;
const easeIO=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
function startJourney(prevId,id){
  const s=subj(V.subj);if(!s)return;const list=chaptersOf(s,V.unit),ti=list.findIndex(c=>c.id===id);if(ti<0)return;
  if(REDUCE){JR=null;REV={id:id,t0:performance.now()-9000};return;}
  let fi=prevId?list.findIndex(c=>c.id===prevId):-1;
  if(fi<0)fi=0;
  if(fi===ti)fi=ti>0?ti-1:(list.length>1?1:ti);
  const m=Math.abs(ti-fi);
  JR={id:id,fi:fi,ti:ti,t0:performance.now(),dur:m?clamp(1000+m*520,1300,4200):500,passed:{}};REV=null;
}
function pathPt(J,pts,u){const sg=J.ti>=J.fi?1:-1,j=Math.min(Math.floor(u),Math.abs(J.ti-J.fi)-1),f=u-j,a=pts[J.fi+sg*j],b=pts[J.fi+sg*(j+1)];if(!b)return pts[J.ti];return partial(a,b,clamp(f,0,1));}
function journeyStep(list,pts,ku){
  if(!JR)return null;
  if(JR.id!==V.sel||!pts[JR.ti]||list[JR.ti].id!==JR.id){JR=null;return null;}
  if(ku<1){JR.t0=performance.now();}
  const now=performance.now(),k=clamp((now-JR.t0)/JR.dur,0,1),m=Math.abs(JR.ti-JR.fi),u=easeIO(k)*m,sg=JR.ti>=JR.fi?1:-1;
  for(let q=0;q<=m;q++){const idx=JR.fi+sg*q;if(u>=q-.02&&!JR.passed[idx])JR.passed[idx]=now;}
  if(k>=1){REV={id:JR.id,t0:now};const P=JR.passed;JR=null;JRP={passed:P};return null;}
  return{u:u,m:m,k:k,J:JR};
}
let JRP=null;
function drawComet(S0,pts,A){
  const J=S0.J,u=S0.u;
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  // the travelled path glows behind the comet
  const sg=J.ti>=J.fi?1:-1;
  for(let q=0;q<Math.ceil(u);q++){const a=pts[J.fi+sg*q],b=q+1<=u?pts[J.fi+sg*(q+1)]:pathPt(J,pts,u),age=(u-q-1);
    ctx.strokeStyle='rgba(255,255,255,'+(A*clamp(.55-age*.18,.12,.55)).toFixed(3)+')';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  // tail
  const N=26;let prev=null;
  for(let q=N;q>=0;q--){const uu=Math.max(0,u-q*.028),p=pathPt(J,pts,uu),f=1-q/N;
    if(prev){ctx.strokeStyle='rgba(205,215,240,'+(A*f*f*.7).toFixed(3)+')';ctx.lineWidth=.4+f*2.4;ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(p.x,p.y);ctx.stroke();}
    prev=p;}
  // sparks shed from the tail
  for(let q=0;q<8;q++){const uu=Math.max(0,u-q*.07-((performance.now()*.001+q*.37)%.07)),p=pathPt(J,pts,uu),o=Math.sin(q*12.9+u*7)*6;
    ctx.fillStyle='rgba(205,215,240,'+(A*(1-q/8)*.45).toFixed(3)+')';ctx.beginPath();ctx.arc(p.x+o*.6,p.y-o*.4,1.1,0,6.283);ctx.fill();}
  ctx.restore();
  const h=pathPt(J,pts,u);
  starGlyph(h.x,h.y,2.8,'#dfe6ff',.85,performance.now(),99,{diag:true,boost:1.1,rot:performance.now()*.0015});
}
function drawReveal(c,i,p,base,A,fw,cx){
  const now=performance.now(),e=REV&&REV.id===c.id?now-REV.t0:99999,x=p.x,y=p.y;
  ctx.save();
  // arrival shockwave + flare
  if(e<2000){const k=e/2000;ctx.globalCompositeOperation='lighter';
    for(let q=0;q<2;q++){const kk=clamp(k*1.4-q*.25,0,1);if(kk<=0||kk>=1)continue;ctx.strokeStyle='rgba(200,210,235,'+(A*(1-kk)*.4).toFixed(3)+')';ctx.lineWidth=1.2*(1-kk)+.4;ctx.beginPath();ctx.arc(x,y,12+easeOut(kk)*120,0,6.283);ctx.stroke();}
    if(k<.5)starGlyph(x,y,4*base,'#dfe6ff',.8,now,i,{diag:true,boost:1+1.2*(1-k/.5)});
    ctx.globalCompositeOperation='source-over';}
  // label side: away from the edge that has less room
  const lines=wrapTitle(c.title,24),F='600 24px "Geist",system-ui,sans-serif';ctx.font=F;
  const tw=Math.max(...lines.map(l=>ctx.measureText(l).width)),gap=40,right=cx+fw/2-24,left=cx-fw/2+24;
  let dir=x+gap+tw+30<right?1:-1;if(dir<0&&x-gap-tw-30<left)dir=1;
  const lk=easeOut(clamp((e-300)/900,0,1)),x0=x+dir*18,x1=x+dir*(gap*lk),yL=y-6;
  // leader line
  ctx.strokeStyle='rgba(255,255,255,'+(A*.55).toFixed(3)+')';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();
  if(lk>.98){ctx.fillStyle='rgba(255,255,255,.8)';ctx.fillRect(x1-(dir<0?2:0),y-1,2,2);}
  const tx=x+dir*(gap+10),al=dir>0?'left':'right';
  // eyebrow
  const ek=clamp((e-1700)/900,0,1);
  ctx.globalAlpha=A*ek;
  text('CHAPTER '+String(numOf(c,i)).padStart(2,'0')+'  ·  '+(LABEL[effStatus(c.id)]||'').toUpperCase(),tx,yL-14-(lines.length-1)*14,'500 10.5px "Geist",system-ui,sans-serif','rgba(160,160,170,.95)',al,'1.5px',true);
  // letters surface out of the dark in random order
  const startL=900;let idx=0;
  lines.forEach((ln,q)=>{ctx.font=F;const lw=ctx.measureText(ln).width;let cx2=dir>0?tx:tx-lw;const yy=yL+14+q*28-(lines.length-1)*14;
    for(let j=0;j<ln.length;j++){const ch=ln[j];ctx.font=F;const cw=ctx.measureText(ch).width;
      const sd=Math.sin((idx+1)*12.9898)*43758.5453,rr=sd-Math.floor(sd),ts=startL+rr*1100,k=clamp((e-ts)/700,0,1);idx++;
      if(k>0&&ch!==' '){const fl=k<1?(.55+.45*Math.abs(Math.sin(now*.03+j))):1;
        ctx.save();ctx.globalAlpha=A*easeOut(k)*fl;if('filter' in ctx)ctx.filter='blur('+((1-k)*6).toFixed(1)+'px)';
        text(ch,cx2,yy-(1-k)*4,F,k<1?'#cfd6ea':'#ffffff','left','0px',k>=1);ctx.restore();}
      cx2+=cw;}
  });
  // underline sweep
  const ud=startL+1900,uk=easeOut(clamp((e-ud)/500,0,1));
  if(uk>0){const ux=dir>0?tx:tx-tw,uy=yL+24+(lines.length-1)*14;const g=ctx.createLinearGradient(ux,0,ux+tw,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=g;ctx.globalAlpha=A;if(dir>0)ctx.fillRect(ux,uy,tw*uk,1);else ctx.fillRect(ux+tw*(1-uk),uy,tw*uk,1);}
  ctx.restore();
}

/* slow drifting mist and a breathing dark edge */
const MIST=Array.from({length:7},(_,i)=>({x:rnd(),y:rnd(),r:.35+rnd()*.4,s:.4+rnd()*.8,p:rnd()*6.28}));
/* Tint, mist and vignette are soft, nearly invisible and drift very slowly. Painting them
   full-screen every frame was the main cause of lag, so they are painted small a few times
   a second and stretched up in a single cheap copy. */
const LAYS={k:'',t:-1e9,a:null};
function layersPaint(t){
  const sc=.25,w=Math.max(8,Math.round(W*sc)),h=Math.max(8,Math.round(H*sc)),k=w+'x'+h;
  if(LAYS.k!==k){LAYS.k=k;LAYS.t=-1e9;{const c=document.createElement('canvas');c.width=w;c.height=h;LAYS.a=c;}}
  if(t>=LAYS.t&&t-LAYS.t<130)return;
  LAYS.t=t;
  const A=LAYS.a.getContext('2d');A.setTransform(sc,0,0,sc,0,0);A.clearRect(0,0,W,H);
  const sj=V.view==='subject'?subj(V.subj):null;
  const tint=[[.18,.22,.55,'#2a2c36',.04],[.86,.78,.6,'#24262e',.035]];
  if(sj)tint.push([.5,.5,.55,sj.hue,.03]);
  tint.forEach((b,i)=>{const x=W*b[0]+Math.sin(t*.00004+i*1.3)*40-PX*30,y=H*b[1]+Math.cos(t*.00003+i*2.1)*30-PY*20,r=Math.max(W,H)*b[2];
    const g=A.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,b[3]+hexA(b[4]));g.addColorStop(1,b[3]+'00');A.fillStyle=g;A.fillRect(0,0,W,H);});
  const B=A;
  const tt=REDUCE?0:t;
  MIST.forEach(m=>{const x=(((m.x+tt*.0000045*m.s)%1.4)-.2)*W,y=(m.y+.06*Math.sin(tt*.00007*m.s+m.p))*H,r=Math.max(W,H)*m.r;
    const g=B.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(120,125,145,.028)');g.addColorStop(.6,'rgba(90,95,115,.012)');g.addColorStop(1,'rgba(90,95,115,0)');B.fillStyle=g;B.fillRect(0,0,W,H);});
  const bb=REDUCE?.5:.5+.5*Math.sin(tt*.00045),g=B.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.78);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,'+(.45+.2*bb).toFixed(3)+')');B.fillStyle=g;B.fillRect(0,0,W,H);
}
function drawMist(t){layersPaint(t);ctx.drawImage(LAYS.a,0,0,W,H);}
