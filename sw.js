const CACHE="lcc-raw-cooked-v12";
const ASSETS=["./","./index.html","./styles.css","./app.js","./logo.png","./icon-192.png","./icon-512.png","./manifest.webmanifest","./leon-cutout.png"];

self.addEventListener("install",e=>{
  // Take over immediately instead of waiting for every open tab to close —
  // without this, updates can sit "waiting" indefinitely and never show up.
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener("activate",e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

const CORE_FILES=["index.html","styles.css","app.js"];

self.addEventListener("fetch",e=>{
  // Network-first for the core files that change often, so edits show up on next
  // refresh instead of being stuck behind a stale cache. Falls back to cache if offline.
  const path=new URL(e.request.url).pathname;
  const isCoreFile = path.endsWith("/") || CORE_FILES.some(f=>path.endsWith("/"+f));
  if(isCoreFile){
    e.respondWith(
      fetch(e.request)
        .then(res=>{
          const copy=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,copy));
          return res;
        })
        .catch(()=>caches.match(e.request))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
