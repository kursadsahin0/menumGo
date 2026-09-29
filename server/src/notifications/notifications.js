import { prisma } from '../db.js'
import { newId } from '../auth/users.js'
import { relativeTime } from '../analytics/time.js'

export async function createNotification(tenantId, title) {
  const text = String(title || '').trim()

  if (!text) {
    return null
  }

  return prisma.notification.create({
    data: {
      id: newId('ntf'),
      tenantId,
      title: text.slice(0, 160),
    },
  })
}

export async function listNotifications(tenantId) {
  const rows = await prisma.notification.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    time: relativeTime(row.createdAt),
    unread: row.readAt == null,
  }))
}

export async function markNotificationsRead(tenantId) {
  await prisma.notification.updateMany({
    where: { tenantId, readAt: null },
    data: { readAt: new Date() },
  })

  return listNotifications(tenantId)
}
