// Service Worker - مكتب الدكتور محمد العوابدي
const CACHE_NAME = 'maktab-alawabdy-pwa-v1.2';
const STATIC_ASSETS = [
    './manifest.json',
    './assets/icon-128.png',
    './assets/icon-192.png',
    './assets/icon-256.png',
    './assets/icon-384.png',
    './assets/icon-512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;

    // صفحة HTML الرئيسية: دائماً نحاول جلب أحدث نسخة من الإنترنت أولاً (Network First)
    // حتى لا يظل التطبيق عالقاً على نسخة قديمة مخزّنة مؤقتاً
    if (request.mode === 'navigate' || request.destination === 'document') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // باقي الملفات (أيقونات، خطوط...): من الكاش أولاً وإلا من الإنترنت (Cache First)
    event.respondWith(
        caches.match(request).then(response => response || fetch(request))
    );
});
