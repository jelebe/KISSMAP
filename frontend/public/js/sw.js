// frontend/public/js/sw.js

// Nombre de la caché actual
const CACHE_NAME = 'kissmap-v0.0.3'; // Actualiza la versión cuando cambies el contenido

// Recursos críticos que deben estar en caché
const ASSETS_TO_CACHE = [
    '/', // Raíz del proyecto (index.html)
    '/index.html',
    '/frontend/public/login.html',
    '/frontend/public/profile_setup.html',
    '/frontend/public/profile_page.html',
    '/frontend/public/css/styles.css',
    '/frontend/public/css/styles_profile_page.css',
    '/frontend/public/css/styles_profile_setup.css',
    '/frontend/public/js/firebaseConfig.js',
    '/frontend/public/js/register.js',
    '/frontend/public/js/profile_setup.js',
    '/frontend/public/js/login.js',
    '/frontend/public/js/profile_page.js',
    '/frontend/public/js/map.js',
    '/frontend/public/images/kissmap-logo_0.1.png',
    '/frontend/public/images/KISSMAP_BLANK.png',
    '/frontend/public/images/icon-192x192.png',
    '/frontend/public/images/icon-512x512.png',
    '/manifest.json',
    '/offline.html' // Página offline personalizada
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
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse; // No cachear respuestas fallidas o externas
                    }

                    // Guardar copia en caché para futuras solicitudes
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });

                    return networkResponse;
                }).catch(() => {
                    // Respuesta de fallback si falla la red
                    if (event.request.destination === 'document') {
                        return caches.match('/offline.html'); // Página offline personalizada
                    }
                });
            })
    );
});

// Notificaciones Push
self.addEventListener('push', (event) => {
    const data = event.data.json() || { title: 'Notificación', body: 'Sin datos' };
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body || 'No hay cuerpo disponible',
            icon: '/frontend/public/images/icon-192x192.png',
            badge: '/frontend/public/images/icon-192x192.png',
            requireInteraction: true, // Mantener la notificación visible hasta que el usuario interactúe
            vibrate: [100, 50, 100], // Vibración para dispositivos móviles
            tag: 'kissmap-notification', // Identificador único para la notificación
            renotify: true // Permitir renotificar si ya se mostró antes
        })
    );
});

// Gestionar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Cerrar la notificación al hacer clic
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            for (const client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus(); // Enfocar la ventana existente si está abierta
                }
            }
            if ('openWindow' in clients) {
                return clients.openWindow('/'); // Abrir la aplicación si no está abierta
            }
        })
    );
});

// Background Sync: Enviar datos al servidor cuando haya conexión
self.addEventListener('sync', (event) => {
    if (event.tag === 'send-data') {
        console.log('Iniciando sincronización de datos...');
        event.waitUntil(
            sendPendingDataToServer().catch(error => {
                console.error('Error durante la sincronización:', error);
            })
        );
    }
});

// Función simulada para enviar datos pendientes al servidor
async function sendPendingDataToServer() {
    const db = await openDB('pending-data', 1); // Usar IndexedDB para almacenar datos pendientes
    const tx = db.transaction('data', 'readonly');
    const store = tx.objectStore('data');
    const pendingData = await store.getAll();

    for (const data of pendingData) {
        try {
            const response = await fetch('https://tu-api.com/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                console.log('Datos enviados correctamente:', data);
                await deleteRecordFromDB(db, data.id); // Eliminar registro después de enviarlo
            } else {
                console.warn('Fallo al enviar datos, reintentando...', data);
            }
        } catch (error) {
            console.error('Error al enviar datos:', error);
        }
    }
}

// Función para eliminar registros de IndexedDB
async function deleteRecordFromDB(db, id) {
    const tx = db.transaction('data', 'readwrite');
    const store = tx.objectStore('data');
    await store.delete(id);
    await tx.done;
}

// IndexedDB: Almacenamiento de datos pendientes
self.addEventListener('beforeinstallprompt', (event) => {
    event.waitUntil(
        openDB('pending-data', 1, {
            upgrade(db) {
                db.createObjectStore('data', { keyPath: 'id', autoIncrement: true });
            }
        })
    );
});

// Escuchar eventos de fondo para guardar datos pendientes
self.addEventListener('backgroundfetch', (event) => {
    console.log('Guardando datos pendientes en IndexedDB...');
    event.waitUntil(
        saveDataToDB(event.data)
    );
});

// Función para guardar datos en IndexedDB
async function saveDataToDB(data) {
    const db = await openDB('pending-data', 1);
    const tx = db.transaction('data', 'readwrite');
    const store = tx.objectStore('data');
    await store.add(data);
    await tx.done;
    console.log('Datos guardados en IndexedDB:', data);
}