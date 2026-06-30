const SHELL_CACHE = 'pikachu-shell-v1'
const RUNTIME_CACHE = 'pikachu-runtime-v1'
const PIKACHU_ASSETS = Array.from({ length: 36 }, (_, index) => `/images/pikachu/pieces${index + 1}.png`)
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/pwa/icon-192.png',
  '/pwa/icon-512.png',
  '/pwa/apple-touch-icon.png',
  ...PIKACHU_ASSETS,
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

async function networkFirstPage(request) {
  const cache = await caches.open(SHELL_CACHE)

  try {
    const response = await fetch(request)

    if (response.ok) {
      void cache.put(request, response.clone())
      void cache.put('/index.html', response.clone())
    }

    return response
  } catch (error) {
    return (await cache.match(request)) || (await cache.match('/index.html')) || Response.error()
  }
}

async function cacheFirstAsset(request) {
  const cachedResponse = await caches.match(request)

  if (cachedResponse) {
    return cachedResponse
  }

  const response = await fetch(request)

  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE)
    void cache.put(request, response.clone())
  }

  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request))
    return
  }

  const shouldCacheAsset =
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/images/pikachu/') ||
    url.pathname.startsWith('/pwa/') ||
    url.pathname === '/manifest.webmanifest'

  if (shouldCacheAsset) {
    event.respondWith(cacheFirstAsset(request))
  }
})
