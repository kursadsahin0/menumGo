import { prisma } from './db.js'
import { fail } from './http.js'
import { newId } from './auth/users.js'

const windowMs = 60_000

export async function limitViewWrites(request, reply) {
  return limitWrites(request, reply, 'view', 30)
}

export async function limitWaiterCalls(request, reply) {
  return limitWrites(request, reply, 'waiter', 4)
}

export async function limitWifiReads(request, reply) {
  return limitWrites(request, reply, 'wifi', 20)
}

export async function limitMenuReads(request, reply) {
  return limitWrites(request, reply, 'menu', 120)
}

export async function limitVerificationSends(request, reply, userId) {
  return limitWrites({ ip: `user:${userId}` }, reply, 'verify', 5)
}

export async function limitActivationAttempts(request, reply) {
  return limitWrites(request, reply, 'activate', 8)
}

export async function limitLoginAttempts(request, reply) {
  return limitWrites(request, reply, 'login', 10)
}

export async function limitRegistrations(request, reply) {
  return limitWrites(request, reply, 'register', 5)
}

export async function limitForgotPassword(request, reply) {
  return limitWrites(request, reply, 'forgot', 5)
}

export async function limitPasswordResets(request, reply) {
  return limitWrites(request, reply, 'reset', 8)
}

export async function limitPasswordChanges(request, reply, userId) {
  return limitWrites({ ip: `user:${userId}` }, reply, 'password', 8)
}

export async function limitAccountDeletes(request, reply, userId) {
  return limitWrites({ ip: `user:${userId}` }, reply, 'delete', 5)
}

async function limitWrites(request, reply, bucket, max) {
  const ip = String(request.ip || 'unknown').slice(0, 64)
  const now = Date.now()
  const since = new Date(now - windowMs)
  const lockKey = `${bucket}:${ip}`

  const retryAfter = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`
    await tx.rateHit.deleteMany({
      where: { createdAt: { lt: since } },
    })

    const hits = await tx.rateHit.findMany({
      where: { bucket, ip, createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    })

    if (hits.length >= max) {
      const oldest = hits[0].createdAt.getTime()
      return Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000))
    }

    await tx.rateHit.create({
      data: {
        id: newId('hit'),
        bucket,
        ip,
        createdAt: new Date(now),
      },
    })

    return 0
  })

  if (retryAfter > 0) {
    reply.header('Retry-After', String(retryAfter))
    throw fail(429, 'Çok fazla istek. Biraz sonra yeniden deneyin.')
  }
}
