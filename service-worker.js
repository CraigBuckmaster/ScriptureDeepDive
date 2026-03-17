const CACHE = 'scripture-v163';
const CORE = [
  '/',
  '/index.html',
  '/verses.js',
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
  '/genesis/Genesis_26.html',
  '/genesis/Genesis_27.html',
  '/genesis/Genesis_28.html',
  '/genesis/Genesis_29.html',
  '/genesis/Genesis_30.html',
  '/genesis/Genesis_31.html',
  '/genesis/Genesis_32.html',
  '/genesis/Genesis_33.html',
  '/genesis/Genesis_34.html',
  '/genesis/Genesis_35.html',
  '/genesis/Genesis_36.html',
  '/genesis/Genesis_37.html',
  '/genesis/Genesis_38.html',
  '/genesis/Genesis_39.html',
  '/genesis/Genesis_40.html',
  '/genesis/Genesis_41.html',
  '/genesis/Genesis_42.html',
  '/genesis/Genesis_43.html',
  '/genesis/Genesis_44.html',
  '/genesis/Genesis_45.html',
  '/genesis/Genesis_46.html',
  '/genesis/Genesis_47.html',
  '/genesis/Genesis_48.html',
  '/genesis/Genesis_49.html',
  '/genesis/Genesis_50.html',
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
