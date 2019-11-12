let appPrefix = 'kjs-test';

let appCaches = [
  {
    name: 'kjs-test-root-20191112.02',
    urls: [
      './',
      './index.html',
      './load.js',
      './manifest.json',
      './sw.js',
      './icons.svg',
    ]
  },
  {
    name: 'kjs-test-css-20191112.02',
    urls: [
      './css/load.css',
      './css/kjs.css',
      './css/font.css'
    ]
  },
  {
    name: 'kjs-test-font-20191112.02',
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
    name: 'kjs-test-help-20191112.02',
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
    name: 'kjs-test-js-20191112.02',
    urls: [
      './js/app.js',
      './js/EventBus.js',
      './js/SearchEngine.js',
      './js/template.js',
      './js/tomeIdx.js',
      './js/util.js'
    ]
  },
  {
    name: 'kjs-test-js-controller-20191112.02',
    urls: [
      './js/Controller/BookmarkController.js',
      './js/Controller/HelpController.js',
      './js/Controller/NavigatorController.js',
      './js/Controller/ReadController.js',
      './js/Controller/SearchController.js',
      './js/Controller/SettingController.js',
      './js/Controller/StrongController.js'
    ]
  },
  {
    name: 'kjs-test-js-model-20191112.02',
    urls: [
      './js/Model/BookmarkModel.js',
      './js/Model/HelpModel.js',
      './js/Model/NavigatorModel.js',
      './js/Model/ReadModel.js',
      './js/Model/SearchModel.js',
      './js/Model/SettingModel.js',
      './js/Model/StrongModel.js'
    ]
  },
  {
    name: 'kjs-test-js-tome-20191112.02',
    urls: [
      './js/tome/kjv.js',
      './js/tome/strong.js',
      './js/tome/tome.js'
    ]
  },
  {
    name: 'kjs-js-view-20191112.02',
    urls: [
      './js/View/BookmarkExportView.js',
      './js/View/BookmarkFolderAddView.js',
      './js/View/BookmarkFolderDeleteView.js',
      './js/View/BookmarkFolderRenameView.js',
      './js/View/BookmarkFolderView.js',
      './js/View/BookmarkImportView.js',
      './js/View/BookmarkListView.js',
      './js/View/BookmarkMoveCopyView.js',
      './js/View/HelpReadView.js',
      './js/View/HelpTopicView.js',
      './js/View/NavigatorBookView.js',
      './js/View/NavigatorChapterView.js',
      './js/View/ReadView.js',
      './js/View/SearchFilterView.js',
      './js/View/SearchHistoryView.js',
      './js/View/SearchLookupView.js',
      './js/View/SearchResultView.js',
      './js/View/SettingView.js',
      './js/View/StrongDefView.js',
      './js/View/StrongFilterView.js',
      './js/View/StrongHistoryView.js',
      './js/View/StrongLookupView.js',
      './js/View/StrongResultView.js',
      './js/View/StrongVerseView.js'
    ]
  },
  {
    name: 'kjs-png-20191112.02',
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
  },
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
