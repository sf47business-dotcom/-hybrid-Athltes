const CACHE_NAME = 'hybrid-blueprint-v2';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icons.js',
  './components/card.js',
  './components/progressbar.js',
  './components/modal.js',
  './components/nav.js',
  './pages/dashboard.js',
  './pages/nutrition.js',
  './pages/drinks.js',
  './pages/running.js',
  './pages/strength.js',
  './pages/progress.js',
  './pages/shopping.js',
  './pages/settings.js',
  './pages/onboarding.js',
  './data/nutrition/meal-plan-30day.json',
  './data/nutrition/shopping-list.json',
  './data/drinks/economical.json',
  './data/drinks/high-calorie.json',
  './data/running/beginner.json',
  './data/running/5k.json',
  './data/running/10k.json',
  './data/running/half-marathon.json',
  './data/strength/hybrid-athlete.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Cache-first strategy, falling back to network, then updating cache.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
