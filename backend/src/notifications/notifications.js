import { prisma } from '../db.js'
import { newId } from '../auth/users.js'
import { fail } from '../http.js'
import { relativeTime } from '../analytics/time.js'
import { pushWaiterCall } from '../push/push.js'

const pageSize = 20

export async function createNotification(tenantId, title, body = '') {
  const text = String(title || '').trim()
  const detail = String(body || '').trim()

  if (!text) {
    return null
  }

  const created = await prisma.notification.create({
    data: {
      id: newId('ntf'),
      tenantId,
      title: text.slice(0, 160),
      body: detail.slice(0, 240),
    },
  })

  if (created.title.includes('Garson')) {
    void pushWaiterCall(tenantId, created.title, created.body)
  }

  return created
}

export function readNotificationIds(body, { required = false } = {}) {
  const source = body && Array.isArray(body.ids) ? body.ids : []
  const ids = []
  const seen = new Set()

  for (const value of source) {
    const id = String(value || '').trim()

    if (!id || id.length > 40 || seen.has(id)) {
      continue
    }

    seen.add(id)
    ids.push(id)
  }

  if (required && !ids.length) {
    throw fail(422, 'Silinecek bildirim yok.')
  }

  if (ids.length > 500) {
    throw fail(422, 'Çok fazla bildirim seçildi.')
  }

  return ids
}

export async function listNotifications(tenantId, beforeId) {
  const cursor = beforeId
    ? await prisma.notification.findFirst({
        where: { id: String(beforeId), tenantId },
        select: { id: true, createdAt: true },
      })
    : null

  const where = { tenantId }

  if (beforeId && !cursor) {
    return { items: [], hasMore: false, unread: await unreadCount(tenantId) }
  }

  if (cursor) {
    where.OR = [
      { createdAt: { lt: cursor.createdAt } },
      { createdAt: cursor.createdAt, id: { lt: cursor.id } },
    ]
  }

  const [rows, unread] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: pageSize + 1,
    }),
    unreadCount(tenantId),
  ])
  const hasMore = rows.length > pageSize

  return {
    items: rows.slice(0, pageSize).map(toNotification),
    hasMore,
    unread,
  }
}

export async function clearNotifications(tenantId, ids) {
  await prisma.notification.deleteMany({
    where: { tenantId, id: { in: ids } },
  })

  return listNotifications(tenantId)
}

export async function markNotificationsRead(tenantId, ids) {
  if (ids.length) {
    await prisma.notification.updateMany({
      where: { tenantId, id: { in: ids }, readAt: null },
      data: { readAt: new Date() },
    })
  }

  return { unread: await unreadCount(tenantId) }
}

function unreadCount(tenantId) {
  return prisma.notification.count({
    where: { tenantId, readAt: null },
  })
}

function toNotification(row) {
  return {
    id: row.id,
    title: row.title,
    body: row.body || '',
    time: relativeTime(row.createdAt),
    unread: row.readAt == null,
  }
}
