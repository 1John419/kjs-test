let appPrefix = 'kjs-test';

let appCaches = [
  {
    name: 'kjs-test-core-20200115.01',
    urls: [
      './',
      './bundle.js',
      './favicon.png',
      './icons.svg',
      './index.html',
      './js/load.js',
      './manifest.json',
      './robots.txt',
      './sw.js'
    ]
  },
  {
    name: 'kjs-test-css-20200115.01',
    urls: [
      './css/kjs.css',
      './css/font.css'
    ]
  },
  {
    name: 'kjs-test-font-20200115.01',
    urls: [
      './font/lato-v15-latin-regular.woff2',
      './font/merriweather-v20-latin-regular.woff2',
      './font/open-sans-v16-latin-regular.woff2',
      './font/roboto-slab-v8-latin-regular.woff2',
      './font/roboto-v19-latin-regular.woff2',
      './font/slabo-27px-v5-latin-regular.woff2'
    ]
  },
  {
    name: 'kjs-test-help-20200115.01',
    urls: [
      './help/about.html',
      './help/bookmark.html',
      './help/help.html',
      './help/navigator.html',
      './help/overview.html',
      './help/read.html',
      './help/search.html',
      './help/setting.html',
      './help/strong.html',
      './help/thats-my-king.html'
    ]
  },
  {
    name: 'kjs-test-lzma-20200115.01',
    urls: [
      './lzma/strong.json.lzma',
      './lzma/tome.kjv.json.lzma'
    ]
  },
  {
    name: 'kjs-test-png-20200115.01',
    urls: [
      './favicon.png',
      './png/icon-032.png',
      './png/icon-192.png',
      './png/icon-512.png',
      './png/touch-icon-057.png',
      './png/touch-icon-152.png',
      './png/touch-icon-167.png',
      './png/touch-icon-180.png'
    ]
  }
];

let cacheNames = appCaches.map((cache) => cache.name);

self.addEventListener('install', function(event) {
  event.waitUntil(caches.keys().then(function(keys) {
    let appKeys = keys.filter(key => key.startsWith(appPrefix));
    return Promise.all(appCaches.map(function(appCache) {
      if (appKeys.indexOf(appCache.name) === -1) {
        return caches.open(appCache.name).then(function(cache) {
          console.log(`Caching: ${appCache.name}`);
          return cache.addAll(appCache.urls);
        });
      } else {
        console.log(`Found: ${appCache.name}`);
        return Promise.resolve(true);
      }
    }));
  }));
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      let appKeys = keys.filter(key => key.startsWith(appPrefix));
      return Promise.all(appKeys.map(function(key) {
        if (cacheNames.indexOf(key) === -1) {
          console.log(`Deleting: ${key}`);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response ||
        fetch(event.request).then(function(response) {
          return response;
        });
    }).catch(function(error) {
      console.log('Fetch failed:', error);
    })
  );
});
