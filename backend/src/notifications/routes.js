import { requireTenant, requireUser } from '../auth/session.js'
import {
  clearNotifications,
  listNotifications,
  markNotificationsRead,
  readNotificationIds,
} from './notifications.js'

export async function notificationRoutes(app) {
  app.get('/api/notifications', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const before = String(request.query?.before || '').trim()
    return listNotifications(tenant.id, before || null)
  })

  app.delete('/api/notifications', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    return clearNotifications(tenant.id, readNotificationIds(request.body, { required: true }))
  })

  app.post('/api/notifications/read', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    return markNotificationsRead(tenant.id, readNotificationIds(request.body))
  })
}
