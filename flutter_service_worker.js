'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "e45f7075a7eaec4ef9221419072e0b8d",
"index.html": "a4ee73bbe72555887fdb23a6ceadfe97",
"/": "a4ee73bbe72555887fdb23a6ceadfe97",
"main.dart.js": "9a23fe14769284b3609c189f50c634d5",
"flutter.js": "0816e65a103ba8ba51b174eeeeb2cb67",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"logo.png": "7fd9c56cb61ccb71fe149aa78dddc9b9",
"icons/android-chrome-192x192.png": "7fd9c56cb61ccb71fe149aa78dddc9b9",
"icons/apple-touch-icon.png": "8faec70125b04dfd52c95d28dfe8f594",
"icons/android-chrome-512x512.png": "e5bd3eff958ac238d12ca6a0a95c7483",
"manifest.json": "d83cecbce1dbb326dc1a124a17c4e3b3",
"assets/AssetManifest.json": "e85df3b16e1d1e0f4d101c8cb88afd22",
"assets/NOTICES": "b5a5dc71c2c5ff364440e3abbd5ad3eb",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/packages/fluttertoast/assets/toastify.js": "e7006a0a033d834ef9414d48db3be6fc",
"assets/packages/fluttertoast/assets/toastify.css": "a85675050054f179444bc5ad70ffc635",
"assets/fonts/MaterialIcons-Regular.otf": "95db9098c58fd6db106f1116bae85a0b",
"assets/assets/svg/shield.svg": "315b768edf9112db20b7dfa21b09f8bf",
"assets/assets/svg/wallet.svg": "e0102907d89e2f04c3c62778b376413e",
"assets/assets/svg/add.svg": "5b4079514da0c40f9bfafd5aab8cb8c3",
"assets/assets/svg/bar_graph.svg": "146eaad052495fcfab1530479d5b3a51",
"assets/assets/svg/right.svg": "458fc3f4ada67514793f4b339cc79822",
"assets/assets/svg/money_bag.svg": "230ce1ca67559d47bae604a3ad6bc8d4",
"assets/assets/svg/security.svg": "338a6e631d5ceb0b72428b8a85e464bd",
"assets/assets/svg/calendar.svg": "fe905a898fd217e46d9ba1db1afebdd3",
"assets/assets/svg/debit_card.svg": "b31cb0e673c38fb869ebc5028a830248",
"assets/assets/svg/operator.svg": "98d591705e3c72d82b389c44cb2bfd35",
"assets/assets/svg/timer.svg": "b3def9fbbe3db7d50e1c543167cbf6d1",
"assets/assets/images/banner_333.jpeg": "ab92f914ef4f7ade137f25637c610b17",
"assets/assets/images/auth_person.png": "53f19fdae934c1946d6a9e7c60c623f5",
"assets/assets/images/cskh.png": "cbe457b217eb1873f6f42409ea95f674",
"assets/assets/images/logo.png": "ba05680f0784a2908b9dd192f9d12b1c",
"assets/assets/images/card_logo.png": "c8cde07395242fe4869a452b6303f596",
"assets/assets/images/auth.gif": "408e5089df63b3c5e0fbf37dcfd7dc9d",
"assets/assets/images/banner_111.jpeg": "b24d10a7126b7d46bd963e4b6a777a2f",
"assets/assets/images/banner_222.jpeg": "be2b17c9b61f78e6ecc1f884a71ede21",
"assets/assets/images/bank.png": "68a24641a18825050b313ab8bd30d1f7",
"assets/assets/images/1.png": "6f42ce30fe43afe56d988ed1fac394a1",
"canvaskit/canvaskit.js": "c2b4e5f3d7a3d82aed024e7249a78487",
"canvaskit/profiling/canvaskit.js": "ae2949af4efc61d28a4a80fffa1db900",
"canvaskit/profiling/canvaskit.wasm": "95e736ab31147d1b2c7b25f11d4c32cd",
"canvaskit/canvaskit.wasm": "4b83d89d9fecbea8ca46f2f760c5a9ba"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
