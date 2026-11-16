const V='portail-v7',F='portail-fonts',CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V&&x!==F).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
const put=(c,q,r)=>{if(r&&(r.ok||r.type==='opaque'))c.put(q,r.clone());return r};
self.addEventListener('fetch',e=>{
  const q=e.request,u=new URL(q.url);
  if(q.method!=='GET'||!/^https?:$/.test(u.protocol))return;
  if(q.mode==='navigate'){ // network first (fresh data), cached copy when offline
    e.respondWith((async()=>{const c=await caches.open(V);
      try{const r=await Promise.race([fetch(q),new Promise((_,j)=>setTimeout(j,4000))]);put(c,'./index.html',r);return r}
      catch(_){return(await c.match(q,{ignoreSearch:true}))||(await c.match('./index.html'))||(await c.match('./'))||Response.error()}})());return}
  const font=/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if(u.origin!==location.origin&&!font)return;
  e.respondWith((async()=>{const c=await caches.open(font?F:V),hit=await c.match(q,{ignoreSearch:!font});
    const n=fetch(q).then(r=>put(c,q,r)).catch(()=>hit);return hit||n})())});
