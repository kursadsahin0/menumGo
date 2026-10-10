import { prisma } from '../db.js'
import { fail } from '../http.js'
import { readSessionCookie } from './cookie.js'
import { createSessionToken, readSessionToken, sessionTtlMs } from './token.js'
import { findUserById, newId } from './users.js'

function requestToken(request) {
  const header = request.headers.authorization || ''
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : ''

  return readSessionCookie(request.headers.cookie) || bearer
}

export async function openSession(userId) {
  const now = Date.now()
  const expiresAt = new Date(now + sessionTtlMs)

  await prisma.session.deleteMany({
    where: { userId, expiresAt: { lt: new Date(now) } },
  })

  const session = await prisma.session.create({
    data: {
      id: newId('ses'),
      userId,
      expiresAt,
    },
  })

  return createSessionToken(userId, session.id, expiresAt.getTime())
}

export async function revokeRequestSession(request) {
  const payload = readSessionToken(requestToken(request))

  if (!payload) {
    return
  }

  await prisma.session.deleteMany({
    where: { id: payload.sessionId, userId: payload.userId },
  })
}

export async function revokeOtherSessions(userId, request) {
  const payload = readSessionToken(requestToken(request))

  await prisma.session.deleteMany({
    where: {
      userId,
      ...(payload?.sessionId ? { id: { not: payload.sessionId } } : {}),
    },
  })
}

export async function revokeAllSessions(userId) {
  await prisma.session.deleteMany({ where: { userId } })
}

export async function requireUser(request) {
  const payload = readSessionToken(requestToken(request))

  if (!payload) {
    throw fail(401, 'Oturumunuz sona erdi.')
  }

  const session = await prisma.session.findFirst({
    where: {
      id: payload.sessionId,
      userId: payload.userId,
      expiresAt: { gt: new Date() },
    },
  })

  if (!session) {
    throw fail(401, 'Oturumunuz sona erdi.')
  }

  const user = await findUserById(payload.userId)

  if (!user) {
    throw fail(401, 'Oturumunuz sona erdi.')
  }

  return user
}

export function requireTenant(user) {
  if (!user.tenant) {
    throw fail(403, 'Bu hesap için işletme kaydı yok.')
  }

  return user.tenant
}
