// Service Worker for Heritage Tourism Planner PWA
const CACHE_NAME = "heritage-pwa-v1";
const ITINERARY_CACHE_NAME = "heritage-itineraries-v1";

const STATIC_ASSETS = ["/", "/index.html", "/manifest.json", "/icon.svg"];

// 1. Install Event: Pre-cache static shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()),
  );
});

// 2. Activate Event: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME && name !== ITINERARY_CACHE_NAME) {
              return caches.delete(name);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// 3. Fetch Event: Serve cached assets when offline
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Handle standard page & asset requests with Network-first, fallback to Cache
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful responses for static assets/pages
        if (
          networkResponse.status === 200 &&
          (url.origin === location.origin ||
            url.hostname.includes("googleapis.com") ||
            url.hostname.includes("gstatic.com"))
        ) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Network failed (offline) -> serve from cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If requesting an HTML navigation page while offline, return cached root index.html
        if (event.request.mode === "navigate") {
          return caches.match("/") || caches.match("/index.html");
        }

        return new Response("Offline content unavailable", {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({ "Content-Type": "text/plain" }),
        });
      }),
  );
});

// 4. Message Event: Cache itinerary JSON payloads directly to Cache Storage
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "CACHE_TRIP_DATA") {
    const { tripId, payload } = event.data;
    if (tripId && payload) {
      caches.open(ITINERARY_CACHE_NAME).then((cache) => {
        const response = new Response(JSON.stringify(payload), {
          headers: { "Content-Type": "application/json" },
        });
        cache.put(`/api/cached-trip/${tripId}`, response);
      });
    }
  }
});
