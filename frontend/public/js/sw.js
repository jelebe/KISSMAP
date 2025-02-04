// frontend/public/js/sw.js

// Nombre de la caché actual
const CACHE_NAME = 'kissmap-v0.0.2'; // Actualiza la versión cuando cambies el contenido

// Recursos críticos que deben estar en caché
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/login.html',
    '/profile_setup.html',
    '/profile_page.html',
    '/css/styles.css',
    '/css/styles_profile_page.css',
    '/css/styles_profile_setup.css',
    '/js/firebaseConfig.js',
    '/js/register.js',
    '/js/profile_setup.js',
    '/js/login.js',
    '/js/profile_page.js',
    '/js/map.js',
    '/images/kissmap-logo_0.1.png',
    '/images/KISSMAP_BLANK.png',
    '/images/icon-192x192.png',
    '/images/icon-512x512.png',
    '/manifest.json'
];

// Evento de instalación: Cachear recursos críticos
self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting()) // Asegura que el nuevo service worker se active inmediatamente
    );
});

// Evento de activación: Limpiar cachés antiguas
self.addEventListener('activate', (event) => {
    console.log('Service Worker activado');
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => key !== CACHE_NAME) // Filtrar cachés obsoletas
                .map(key => caches.delete(key))   // Eliminar cachés obsoletas
        )).then(() => self.clients.claim())       // Tomar control de todas las páginas abiertas
    );
});

// Evento de fetch: Manejar solicitudes de red
self.addEventListener('fetch', (event) => {
    console.log('Interceptando solicitud:', event.request.url);
    event.respondWith(
        caches.match(event.request) // Buscar en caché
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse; // Devolver respuesta desde caché si existe
                }

                // Si no está en caché, realizar la solicitud a la red
                return fetch(event.request).then(networkResponse => {
                    // Guardar copia en caché para futuras solicitudes
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                }).catch(() => {
                    // Respuesta de fallback si falla la red
                    if (event.request.destination === 'document') {
                        return caches.match('/offline.html'); // Página offline personalizada
                    }
                });
            })
    );
});

//para notificaciones push
self.addEventListener('push', (event) => {
  const data = event.data.json();
  event.waitUntil(
      self.registration.showNotification(data.title, {
          body: data.body,
          icon: '/images/icon-192x192.png',
          badge: '/images/icon-192x192.png'
      })
  );
});

//para enviar datos al servidor cuando no haya conexion, usamos la API de background Sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'send-data') {
      event.waitUntil(
          sendPendingDataToServer()
      );
  }
});