self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  const payload = event.data ? event.data.json() : {}
  const title = payload.title || 'Garson çağrıldı'

  event.waitUntil(
    self.registration.showNotification(title, {
      body: 'Misafir garson istiyor.',
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
