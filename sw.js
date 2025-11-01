const CACHE_NAME = 'smart-translator-v3';
const urlsToCache = [
  './',
  './index.html',
  './renderer.js',
  './main.js',
  './style.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Caching files:', urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('Service Worker installed');
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('Cache failed:', error);
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Если файл есть в кэше - возвращаем его
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }
        
        // Иначе загружаем из сети
        console.log('Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(function(response) {
            // Кэшируем только успешные ответы
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(function(error) {
            console.error('Fetch failed:', error);
            // Оффлайн заглушка для HTML
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
          });
      })
  );
});