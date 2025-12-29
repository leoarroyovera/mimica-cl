// Versión del caché - incrementar cuando haya cambios importantes
const CACHE_VERSION = 'v2';
const CACHE_NAME = `mimica-${CACHE_VERSION}`;
const urlsToCache = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/game.js',
  './js/navigation.js',
  './js/utils.js',
  './data/words.json',
  './manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  // Forzar actualización inmediata
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Error al cachear archivos:', error);
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  // Tomar control inmediatamente
  event.waitUntil(
    Promise.all([
      // Eliminar cachés antiguos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Eliminando caché antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control de todas las páginas
      self.clients.claim()
    ])
  );
});

// Interceptar peticiones - Estrategia Network First
self.addEventListener('fetch', (event) => {
  // Solo cachear peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Verificar que la respuesta sea válida
        if (!response || response.status !== 200 || response.type === 'error') {
          throw new Error('Respuesta inválida');
        }

        // Clonar la respuesta para cachearla
        const responseToCache = response.clone();

        // Actualizar el caché en segundo plano
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Si falla la red, intentar desde el caché
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Si no hay en caché, devolver error
          return new Response('Recurso no disponible offline', {
            status: 404,
            statusText: 'Not Found'
          });
        });
      })
  );
});

// Escuchar mensajes para forzar actualización
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
