self.addEventListener('push', function(event) {
  if (!event.data) return
  try {
    var data = event.data.json()
    var options = {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/badge-64.png',
      data: { url: data.url }
    }
    event.waitUntil(
      self.registration.showNotification(data.title || 'GitHub AI Explorer', options)
    )
  } catch(e) {
    console.error('Push error:', e)
  }
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url))
  }
})
