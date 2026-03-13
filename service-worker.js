const CACHE = 'scripture-v22';
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
  '/genesis/Genesis_11.html',
  '/genesis/Genesis_12.html',
  '/genesis/Genesis_13.html',
  '/genesis/Genesis_14.html',
  '/genesis/Genesis_15.html',
  '/genesis/Genesis_16.html',
  '/genesis/Genesis_17.html',
  '/genesis/Genesis_18.html',
  '/genesis/Genesis_19.html',
  '/genesis/Genesis_20.html',
  '/genesis/Genesis_21.html',
  '/genesis/Genesis_22.html',
  '/genesis/Genesis_23.html',
  '/genesis/Genesis_24.html',
  '/genesis/Genesis_25.html',
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
