const CACHE_NAME = 'kissmap-v0.0.1';
const ASSETS_TO_CACHE = [
  '/',
  '/frontend/public/profile_page.html',
  '/frontend/public/css/styles.css',
  '/frontend/public/css/styles_profile_page.css',
  '/frontend/public/js/map.js',
  '/frontend/public/images/kissmap-logo_0.1.png',
  '/frontend/public/images/KISSMAP_BLANK.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});