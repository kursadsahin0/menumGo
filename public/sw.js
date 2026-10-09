const version = 'menumgo-v1'
const shellCache = `${version}-shell`
const menuCache = `${version}-menu`
const imageCache = `${version}-images`
const currentCaches = new Set([shellCache, menuCache, imageCache])

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(shellCache)
      .then((cache) =>
        cache.addAll(['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png']),
      )
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !currentCaches.has(key)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  )
})

function offlineDocument() {
  return new Response(
    '<!doctype html><meta charset="utf-8"><title>Çevrimdışı</title><p>Bağlantı yok. Menüyü bir kez açtıktan sonra çevrimdışı da görülebilir.</p>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )
}

async function store(cache, request, response, limit) {
  if (!response || !response.ok || response.type !== 'basic' || response.redirected) {
    return
  }

  await cache.put(request, response.clone()).catch(() => {})
  const keys = await cache.keys()

  if (keys.length <= limit) {
    return
  }

  const spare = keys.filter((key) => {
    const path = new URL(key.url).pathname
    return path !== '/' && path !== '/manifest.webmanifest' && !path.startsWith('/icons/')
  })
  const overflow = keys.length - limit

  await Promise.all(spare.slice(0, overflow).map((key) => cache.delete(key)))
}

async function networkFirst(request, cacheName, limit) {
  const cache = await caches.open(cacheName)

  try {
    const response = await fetch(request)
    await store(cache, request, response, limit)
    return response
  } catch (error) {
    const cached = await cache.match(request)

    if (cached) {
      return cached
    }

    if (request.mode === 'navigate') {
      return (await cache.match('/')) || offlineDocument()
    }

    throw error
  }
}

async function menuFirst(request) {
  const cache = await caches.open(menuCache)

  try {
    const response = await fetch(request)

    if (response.ok) {
      await store(cache, request, response, 40)
      return response
    }

    if (response.status === 404) {
      return response
    }

    return (await cache.match(request)) || response
  } catch (error) {
    const cached = await cache.match(request)

    if (cached) {
      return cached
    }

    throw error
  }
}

async function imageFirst(request) {
  const cache = await caches.open(imageCache)
  const cached = await cache.match(request)

  if (cached) {
    fetch(request)
      .then((response) => store(cache, request, response, 80))
      .catch(() => {})
    return cached
  }

  const response = await fetch(request)
  await store(cache, request, response, 80)
  return response
}

self.addEventListener('fetch', (event) => {
  const request = event.request

  if (request.method !== 'GET') {
    return
  }

  const url = new URL(request.url)

  if (url.origin !== self.location.origin || url.pathname === '/sw.js') {
    return
  }

  if (url.pathname.startsWith('/api/public/menus/')) {
    event.respondWith(menuFirst(request))
    return
  }

  if (url.pathname.startsWith('/api/uploads/')) {
    event.respondWith(imageFirst(request))
    return
  }

  if (url.pathname.startsWith('/api/')) {
    return
  }

  event.respondWith(networkFirst(request, shellCache, 180))
})

self.addEventListener('push', (event) => {
  const payload = event.data ? event.data.json() : {}
  const title = payload.title || 'Garson çağrıldı'

  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body || 'Misafir garson istiyor.',
      silent: false,
      tag: 'waiter',
      renotify: true,
      data: { url: payload.url || '/admin' },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = event.notification.data?.url || '/admin'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const open = clients.find((client) => client.url.includes('/admin'))

      if (open) {
        return open.focus()
      }

      return self.clients.openWindow(target)
    }),
  )
})
