let appPrefix = 'kjs';

let appCaches = [
  {
    name: 'kjs-root-20191110.03',
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
    name: 'kjs-css-20191110.03',
    urls: [
      './css/load.css',
      './css/kjs.css',
      './css/font.css'
    ]
  },
  {
    name: 'kjs-font-20191110.01',
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
    name: 'kjs-help-20191110.01',
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
    name: 'kjs-js-20191110.03',
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
    name: 'kjs-js-controller-20191110.03',
    urls: [
      './js/controller/BookmarkController.js',
      './js/controller/HelpController.js',
      './js/controller/NavigatorController.js',
      './js/controller/ReadController.js',
      './js/controller/SearchController.js',
      './js/controller/SettingController.js',
      './js/controller/StrongController.js'
    ]
  },
  {
    name: 'kjs-js-model-20191110.03',
    urls: [
      './js/model/BookmarkModel.js',
      './js/model/HelpModel.js',
      './js/model/NavigatorModel.js',
      './js/model/ReadModel.js',
      './js/model/SearchModel.js',
      './js/model/SettingModel.js',
      './js/model/StrongModel.js'
    ]
  },
  {
    name: 'kjs-js-tome-20191110.03',
    urls: [
      './js/tome/kjv.js',
      './js/tome/strong.js',
      './js/tome/tome.js'
    ]
  },
  {
    name: 'kjs-js-view-20191110.03',
    urls: [
      './js/view/BookmarkExportView.js',
      './js/view/BookmarkFolderAddView.js',
      './js/view/BookmarkFolderDeleteView.js',
      './js/view/BookmarkFolderRenameView.js',
      './js/view/BookmarkFolderView.js',
      './js/view/BookmarkImportView.js',
      './js/view/BookmarkListView.js',
      './js/view/BookmarkMoveCopyView.js',
      './js/view/HelpReadView.js',
      './js/view/HelpTopicView.js',
      './js/view/NavigatorBookView.js',
      './js/view/NavigatorChapterView.js',
      './js/view/ReadView.js',
      './js/view/SearchFilterView.js',
      './js/view/SearchHistoryView.js',
      './js/view/SearchLookupView.js',
      './js/view/SearchResultView.js',
      './js/view/SettingView.js',
      './js/view/StrongDefView.js',
      './js/view/StrongFilterView.js',
      './js/view/StrongHistoryView.js',
      './js/view/StrongLookupView.js',
      './js/view/StrongResultView.js',
      './js/view/StrongVerseView.js'
    ]
  },
  {
    name: 'kjs-png-20191110.01',
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
