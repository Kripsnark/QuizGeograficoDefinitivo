const CACHE_NAME = 'geoquiz-v1.8.0';

// Quando installi l'app, salva subito i file base
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll([
                './index.html',
                './manifest.json',
                './icon.png'
            ]);
        })
    );
});

// Quando il gioco chiede una bandiera, la pesca dalla memoria se c'è, altrimenti la scarica e la salva per la prossima volta
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        })
    );
});