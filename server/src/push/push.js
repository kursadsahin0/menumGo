import webpush from 'web-push'
import { prisma } from '../db.js'
import { env } from '../env.js'

let configured = false

function canPush() {
  return Boolean(env.vapidPublicKey && env.vapidPrivateKey)
}

function configure() {
  if (configured || !canPush()) {
    return canPush()
  }

  webpush.setVapidDetails(env.vapidSubject, env.vapidPublicKey, env.vapidPrivateKey)
  configured = true
  return true
}

export function pushPublicKey() {
  return canPush() ? env.vapidPublicKey : ''
}

export async function pushWaiterCall(tenantId, title, body = '') {
  if (!configure() || !String(title).includes('Garson')) {
    return
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { userId: true },
    })

    if (!tenant) {
      return
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: tenant.userId },
    })
    const payload = JSON.stringify({
      title,
      body: body || 'Misafir garson istiyor.',
      url: `${env.appUrl}/admin`,
    })

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: { p256dh: subscription.p256dh, auth: subscription.auth },
            },
            payload,
            { TTL: 60, urgency: 'high' },
          )
        } catch (error) {
          const status = error?.statusCode

          if (status === 404 || status === 410) {
            await prisma.pushSubscription.delete({ where: { id: subscription.id } }).catch(() => {})
          }
        }
      }),
    )
  } catch {
    // The waiter call is already stored. A missed push can still show on the next panel open.
  }
}
