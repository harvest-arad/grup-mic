// Păstrează fișierele aplicației pe telefon; datele vin mereu de la server (POST, nu trece pe aici).
// Pagina: rețeaua are ultimul cuvânt, memoria e doar plasă fără semnal. Restul: memorie întâi, reîmprospătat în fundal.
const CACHE = 'tr3i-seba-v1';
const FILES = ['./', 'index.html', 'logo-mark.svg', 'manifest.webmanifest',
               'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
const FONTURI = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(new Request(f, { cache: 'reload' })).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.indexOf('tr3i-seba') === 0 && k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== 'GET') return;
  if (u.origin !== location.origin && FONTURI.indexOf(u.hostname) < 0) return;
  const pagina = req.mode === 'navigate' || /\/(index\.html)?$/.test(u.pathname);

  if (pagina) {
    e.respondWith(fetch(req, { cache: 'no-cache' }).then(r => {
      if (r && r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put('index.html', c)); }
      return r;
    }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => {
    const net = fetch(req).then(r => {
      if (r && (r.ok || r.type === 'opaque')) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); }
      return r;
    }).catch(() => hit);
    return hit || net;
  }));
});
