const CACHE_NAME = "shelter-locator-v2";
const STATIC_ASSETS = [
  "index.html",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css",
  "https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.js",
  "https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.css",
  "https://unpkg.com/leaflet-control-geocoder/dist/Control.Geocoder.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)))
    )
  );
});

// Network-first for index.html & firebase, cache-first for assets
self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  if (url.includes("index.html") || url.includes("firebase")) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((res) => res || fetch(event.request))
    );
  }
});
