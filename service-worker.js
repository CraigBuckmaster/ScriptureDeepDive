const CACHE = 'scripture-v4';
const CORE = [
  '/',
  '/index.html',
  '/genesis/Genesis_1.html',
  '/genesis/Genesis_2.html',
  '/genesis/Genesis_3.html',
  '/genesis/Genesis_4.html',
  '/genesis/Genesis_5.html',
  '/genesis/Genesis_6.html',
  '/genesis/Genesis_7.html',
  '/genesis/Genesis_8.html',
  '/genesis/Genesis_9.html',
  '/genesis/Genesis_10.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
