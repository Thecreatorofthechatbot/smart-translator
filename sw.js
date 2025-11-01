const CACHE_NAME = 'smart-translator-v5';
const urlsToCache = [
  './',
  './index.html',
  './main.js',
  './renderer.js', 
  './style.css',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  // Добавляем файлы для оффлайн перевода
  './node_modules/@echogarden/transformers-nodejs-wrapper/wasm/ort-wasm.wasm',
  './node_modules/@echogarden/transformers-nodejs-wrapper/wasm/ort-wasm-simd.wasm'
];

self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Caching files...');
        return cache.addAll(urlsToCache).catch(error => {
          console.log('Cache addAll error:', error);
        });
      })
      .then(function() {
        console.log('All files cached successfully');
        return self.skipWaiting();
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
  const url = new URL(event.request.url);
  
  // Кэшируем запросы к моделям
  if (url.pathname.includes('onnx') || url.pathname.includes('wasm') || url.pathname.includes('model')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(event.request).then(function(response) {
          return response || fetch(event.request).then(function(response) {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
    return;
  }

  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }
        
        return fetch(event.request)
          .then(function(response) {
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
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
          });
      })
  );
});