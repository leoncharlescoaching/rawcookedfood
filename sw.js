const CACHE="lcc-raw-cooked-v13";
const ASSETS=["./","./index.html","./styles.css","./app.js","./logo.png","./icon-192.png","./icon-512.png","./manifest.webmanifest","./leon-cutout.png"];

self.addEventListener("install",e=>{
  // Take over immediately instead of waiting for every open tab to close.
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

// Network-first for everything, every time. Anyone with a connection always gets the
// latest version of every file — the cache is only ever used as a fallback if the
// network request fails (e.g. genuinely offline), so the tool still works with no signal.
self.addEventListener("fetch",e=>{
  e.respondWith(
    fetch(e.request)
      .then(res=>{
        const copy=res.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy));
        return res;
      })
      .catch(()=>caches.match(e.request))
  );
});
