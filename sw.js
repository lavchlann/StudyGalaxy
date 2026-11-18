const CACHE='sg-shell-1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.hostname==='api.anthropic.com')return;
  if(u.origin===location.origin){
    if(u.pathname.endsWith('version.json'))return;
    e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(k=>k.put(r,c));}return res;})
      .catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
  }else if(/jsdelivr|fonts\.g/.test(u.hostname)){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(k=>k.put(r,c));return res;})));
  }
});
