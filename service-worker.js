const CACHE_NAME = 'faithwords-v13-board-levels-sync';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './enhancements.css',
  './progression-v3.css',
  './layout-v6.css',
  './audio-menu-v7.css',
  './hint-reward-v8.css',
  './hard-level-v9.css',
  './mix-animation-v11.css',
  './worlds-v12.css',
  './accessibility-v12.css',
  './interface-v13.css',
  './audio-settings-v12.js',
  './levels-v12.js',
  './levels-tuning-v13.js',
  './game-runtime-v3.js',
  './game-v3.js',
  './hint-reward-v8.js',
  './word-feedback-v10.js',
  './mix-animation-v11.js',
  './board-pan-v13.js',
  './account-sync-v13.js',
  './manifest.webmanifest',
  './icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
  );
});
