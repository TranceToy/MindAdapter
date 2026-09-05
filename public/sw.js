const CACHE = 'adapting-the-mind-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(dropSupersededCaches().then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(freshOrCached(request));
    return;
  }
  event.respondWith(cachedOrFetched(request));
});

async function dropSupersededCaches() {
  const names = await caches.keys();
  const superseded = names.filter((name) => name !== CACHE);
  await Promise.all(superseded.map((name) => caches.delete(name)));
}

async function cachedOrFetched(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  await store(request, response);
  return response;
}

async function freshOrCached(request) {
  try {
    const response = await fetch(request);
    await store(request, response);
    return response;
  } catch (offline) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw offline;
  }
}

async function store(request, response) {
  if (!response.ok) return;
  const cache = await caches.open(CACHE);
  await cache.put(request, response.clone());
}
