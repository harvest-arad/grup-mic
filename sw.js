// Păstrează fișierele aplicației pe telefon; datele vin mereu de la server.
const CACHE = 'grup-mic-v5';
const FILES = ['./', 'index.html', 'logo-mark.svg', 'manifest.webmanifest',
               'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
const FONTURI = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;                       // API-ul (POST) nu trece prin cache
  if (u.origin !== location.origin && FONTURI.indexOf(u.hostname) < 0) return;

  // cache întâi (deschidere instant), apoi reîmprospătare în fundal
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => {
    const net = fetch(e.request).then(r => {
      if (r && (r.ok || r.type === 'opaque')) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); }
      return r;
    }).catch(() => hit);
    return hit || net;
  }));
});
