import { requireTenant, requireUser } from '../auth/session.js'
import { listNotifications, markNotificationsRead } from './notifications.js'

export async function notificationRoutes(app) {
  app.get('/api/notifications', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    return listNotifications(tenant.id)
  })

  app.post('/api/notifications/read', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    return markNotificationsRead(tenant.id)
  })
}
