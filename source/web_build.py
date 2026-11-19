"""Build the standalone website from the artifact build.
Usage: python3 web_build.py OUTDIR "short note about what changed"
Strips all personal progress, flags web mode, adds install manifest, icons,
service worker and version.json (which the app polls to show the Update button)."""
import re,json,sys,hashlib,os,datetime
from PIL import Image,ImageDraw,ImageFilter
OUT=sys.argv[1];NOTES=sys.argv[2] if len(sys.argv)>2 else ''
SRC='/home/claude/study-galaxy/index.html'
os.makedirs(OUT,exist_ok=True)
h=open(SRC,encoding='utf8').read()
# 1. strip personal state (the app fills defaults for anything missing)
m=re.search(r'(<script type="application/json" id="state">)(.*?)(</script>)',h,re.S)
st=json.loads(m.group(2))
for k,v in {'progress':{},'mistakes':[],'log':[],'flash':None,'time':{},'lessons':{},'practice':{},'bank':{},'comets':{},'exams':{},'xp':0}.items(): st[k]=v
for k in ['set','ach','cnt','daily','fc','cards','notes','bm','dates','visited','flags','recap','xpb','papers','boss','shield','drill','genex','savedAt']: st.pop(k,None)
h=h[:m.start(2)]+json.dumps(st,separators=(',',':')).replace('</','<\\/')+h[m.end(2):]
# 2. head additions
head=('<meta name="theme-color" content="#0a0a0c"><link rel="manifest" href="manifest.webmanifest">'
      '<link rel="icon" href="icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="icon-180.png">')
assert h.count('<meta charset="utf-8">')>=1
h=h.replace('<meta charset="utf-8">','<meta charset="utf-8">@@FLAGS@@'+head,1)
vid=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d')+'-'+hashlib.sha1(h.encode()).hexdigest()[:8]
h=h.replace('@@FLAGS@@','<script>window.SG_WEB=true;window.SG_BUILD="%s";</script>'%vid)
open(OUT+'/index.html','w',encoding='utf8').write(h)
json.dump({'v':vid,'built':datetime.datetime.now(datetime.timezone.utc).isoformat()+'Z','notes':NOTES},open(OUT+'/version.json','w'))
# 3. manifest + service worker
json.dump({'name':'Study Galaxy','short_name':'Study Galaxy','start_url':'./','scope':'./','display':'standalone','background_color':'#0a0a0c','theme_color':'#0a0a0c',
 'icons':[{'src':'icon-192.png','sizes':'192x192','type':'image/png'},{'src':'icon-512.png','sizes':'512x512','type':'image/png','purpose':'any maskable'}]},open(OUT+'/manifest.webmanifest','w'),indent=1)
open(OUT+'/sw.js','w').write('''const CACHE='sg-shell-1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.hostname==='api.anthropic.com')return;
  if(u.origin===location.origin){
    if(u.pathname.endsWith('version.json'))return;
    e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(k=>k.put(r,c));}return res;})
      .catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
  }else if(/jsdelivr|fonts\\.g/.test(u.hostname)){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(k=>k.put(r,c));return res;})));
  }
});
''')
# 4. icons
def icon(n):
    S=n*4;im=Image.new('RGB',(S,S),(10,10,12));d=ImageDraw.Draw(im)
    pts=[(.22,.68),(.38,.42),(.55,.56),(.70,.30),(.80,.62)]
    P=[(x*S,y*S) for x,y in pts]
    for a,b in zip(P,P[1:]): d.line([a,b],fill=(120,118,112),width=max(2,S//140))
    glow=Image.new('RGB',(S,S),(0,0,0));g=ImageDraw.Draw(glow)
    for x,y in P: g.ellipse([x-S*.06,y-S*.06,x+S*.06,y+S*.06],fill=(232,201,138))
    glow=glow.filter(ImageFilter.GaussianBlur(S*.035));im=Image.blend(im,Image.eval(Image.merge('RGB',[Image.eval(c,lambda v:min(255,v*2)) for c in glow.split()]),lambda v:v),0)
    from PIL import ImageChops
    im=ImageChops.add(im,glow);d=ImageDraw.Draw(im)
    for i,(x,y) in enumerate(P):
        r=S*(.028 if i!=3 else .04);d.ellipse([x-r,y-r,x+r,y+r],fill=(246,223,174))
    return im.resize((n,n),Image.LANCZOS)
for n,f in [(512,'icon-512.png'),(192,'icon-192.png'),(180,'icon-180.png')]: icon(n).save(OUT+'/'+f)
open(OUT+'/icon.svg','w').write('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0a0a0c"/><g stroke="#77766f" stroke-width="1"><path d="M14 44 24 27 35 36 45 19 51 40" fill="none"/></g><g fill="#f6dfae"><circle cx="14" cy="44" r="2"/><circle cx="24" cy="27" r="2"/><circle cx="35" cy="36" r="2"/><circle cx="45" cy="19" r="3"/><circle cx="51" cy="40" r="2"/></g></svg>')
open(OUT+'/.nojekyll','w').write('')
print('built',vid,os.path.getsize(OUT+'/index.html')//1024,'KB')
