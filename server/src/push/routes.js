import { newId } from '../auth/users.js'
import { requireUser } from '../auth/session.js'
import { prisma } from '../db.js'
import { fail } from '../http.js'
import { pushPublicKey } from './push.js'

function readSubscription(body) {
  const endpoint = String(body?.endpoint || '').trim()
  const p256dh = String(body?.p256dh || '').trim()
  const auth = String(body?.auth || '').trim()

  let url

  try {
    url = new URL(endpoint)
  } catch {
    throw fail(422, 'Bildirim kaydı geçersiz.')
  }

  if (
    url.protocol !== 'https:' ||
    endpoint.length > 2000 ||
    p256dh.length < 16 ||
    p256dh.length > 200 ||
    auth.length < 8 ||
    auth.length > 200
  ) {
    throw fail(422, 'Bildirim kaydı geçersiz.')
  }

  return { endpoint, p256dh, auth }
}

export async function pushRoutes(app) {
  app.get('/api/push/public-key', async (request) => {
    await requireUser(request)
    return { publicKey: pushPublicKey() }
  })

  app.put('/api/push/subscription', async (request) => {
    const user = await requireUser(request)
    const subscription = readSubscription(request.body)

    await prisma.pushSubscription.upsert({
      where: { endpoint: subscription.endpoint },
      update: {
        userId: user.id,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
      create: {
        id: newId('psh'),
        userId: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    })

    return { ok: true }
  })

  app.delete('/api/push/subscription', async (request) => {
    const user = await requireUser(request)
    const endpoint = String(request.body?.endpoint || '').trim()

    if (!endpoint) {
      return { ok: true }
    }

    await prisma.pushSubscription.deleteMany({
      where: { userId: user.id, endpoint },
    })

    return { ok: true }
  })
}
