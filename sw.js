/* ECI → eNodeB Finder v3.3 — Service Worker · Develop by napatm@ais.co.th */
const CACHE = 'eci-enodeb-v3.3-20261031115408';   // เปลี่ยนทุกครั้งที่สร้างไฟล์ใหม่ → เครื่องผู้ใช้ได้รับอัปเดตเสมอ
const FONT_CACHE = 'eci-enodeb-fonts';
const TILE_CACHE = 'eci-enodeb-tiles', TILE_MAX = 1500;
const TILE_HOSTS = /(^mt\d\.google\.com$)|(^tile\.openstreetmap\.org$)|(^server\.arcgisonline\.com$)|(\.tile\.opentopomap\.org$)/;
let tilePuts = 0;
function trimTiles(c) { c.keys().then(k => { if (k.length > TILE_MAX) k.slice(0, k.length - TILE_MAX).forEach(r => c.delete(r)); }); }
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png',
                './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE && k !== FONT_CACHE && k !== TILE_CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Google Fonts : cache-first (ใช้ Offline ได้หลังโหลดครั้งแรก)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONT_CACHE).then(c => c.match(req).then(hit => hit ||
      fetch(req).then(res => { c.put(req, res.clone()); return res; }).catch(() => hit))));
    return;
  }
  // ภาพแผนที่: cache-first + เก็บล่าสุด TILE_MAX ภาพ (ดูพื้นที่ที่เคยเปิดได้ตอน Offline)
  if (TILE_HOSTS.test(url.hostname)) {
    e.respondWith(caches.open(TILE_CACHE).then(c => c.match(req).then(hit => hit ||
      fetch(req).then(res => { if (res.ok || res.type === 'opaque') { c.put(req, res.clone()); if (++tilePuts % 100 === 0) trimTiles(c); } return res; })
        .catch(() => hit || Response.error()))));
    return;
  }
  if (url.origin !== location.origin) return;           // API ภายนอก (Elevation) → ปล่อยผ่าน
  // หน้าโปรแกรม: cache-first (เปิด Offline ได้ทันที) — อัปเดตผ่าน SW เวอร์ชันใหม่
  if (req.mode === 'navigate') {
    e.respondWith(caches.match('./index.html').then(hit => hit || fetch(req)).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return res;
  })));
});
