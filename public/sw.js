/* CraftNoteBox — page hors ligne, navigations toujours relues sur le réseau. */

const STATIC_CACHE = "cnb-static-v2";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

async function freshNavigation(request) {
  try {
    return await fetch(new Request(request, { cache: "no-store" }));
  } catch {
    const cached = await caches.match(OFFLINE_URL);
    return cached ?? Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.mode === "navigate") {
    event.respondWith(freshNavigation(request));
    return;
  }

  event.respondWith(fetch(request));
});
