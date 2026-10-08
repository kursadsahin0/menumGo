import { timingSafeEqual } from 'node:crypto'
import { newId, normalizeEmail } from '../auth/users.js'
import { requireTenant, requireUser } from '../auth/session.js'
import { prisma } from '../db.js'
import { env } from '../env.js'
import { fail } from '../http.js'
import { limitActivationAttempts } from '../rateLimit.js'

function toPublicSubscription(subscription) {
  if (!subscription) {
    return { id: null, status: 'inactive' }
  }

  return {
    id: subscription.id,
    status: subscription.status === 'active' ? 'active' : 'inactive',
  }
}

async function writeStatus(tenantId, status) {
  return prisma.subscription.upsert({
    where: { tenantId },
    update: { status },
    create: {
      id: newId('sub'),
      tenantId,
      status,
    },
  })
}

function assertActivationKey(request) {
  const expected = env.activationKey

  if (!expected) {
    throw fail(503, 'Etkinleştirme kapalı.')
  }

  const provided = String(request.headers['x-activation-key'] || '')
  const actual = Buffer.from(provided)
  const wanted = Buffer.from(expected)

  if (actual.length !== wanted.length || !timingSafeEqual(actual, wanted)) {
    throw fail(401, 'Etkinleştirme anahtarı geçersiz.')
  }
}

function readStatus(value) {
  const status = value == null || value === '' ? 'active' : String(value).trim()

  if (status !== 'active' && status !== 'inactive') {
    throw fail(422, 'Durum geçersiz.')
  }

  return status
}

async function findTenant(body) {
  const email = normalizeEmail(body?.email)
  const slug = String(body?.slug || '').trim()

  if ((email && slug) || (!email && !slug)) {
    throw fail(422, 'E-posta veya menü adresinden birini gönderin.')
  }

  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    })

    if (!user?.tenant) {
      throw fail(404, 'Hesap bulunamadı.')
    }

    return user.tenant
  }

  const tenant = await prisma.tenant.findUnique({ where: { slug } })

  if (!tenant) {
    throw fail(404, 'Hesap bulunamadı.')
  }

  return tenant
}

export async function subscriptionRoutes(app) {
  app.get('/api/subscription', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId: tenant.id },
    })

    return toPublicSubscription(subscription)
  })

  app.post('/api/subscription/checkout', async () => {
    throw fail(422, 'Ödeme uygulama içinden alınmıyor. Satın alma telefonla tamamlanır.')
  })

  app.post('/api/subscription/cancel', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const subscription = await writeStatus(tenant.id, 'inactive')
    return toPublicSubscription(subscription)
  })

  app.post(
    '/api/subscription/activate',
    { preHandler: limitActivationAttempts },
    async (request) => {
      assertActivationKey(request)
      const tenant = await findTenant(request.body)
      const status = readStatus(request.body?.status)
      const subscription = await writeStatus(tenant.id, status)

      request.log.info({ tenantId: tenant.id, status }, 'Abonelik güncellendi')
      return toPublicSubscription(subscription)
    },
  )
}
