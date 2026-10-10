import cors from '@fastify/cors'
import Fastify from 'fastify'
import { fail } from './http.js'
import { requireUser } from './auth/session.js'
import { authRoutes } from './auth/routes.js'
import { closeDemoAccount, ensureDemoUser } from './auth/seed.js'
import { prisma } from './db.js'
import { env } from './env.js'
import { securityHeaders } from './headers.js'
import { analyticsRoutes } from './analytics/routes.js'
import { pruneExpiredViews } from './analytics/retention.js'
import { businessRoutes } from './business/routes.js'
import { categoryRoutes } from './categories/routes.js'
import { ensureAllTenantCategories } from './categories/categories.js'
import { menuRoutes } from './menus/routes.js'
import { notificationRoutes } from './notifications/routes.js'
import { pushRoutes } from './push/routes.js'

import { menuSettingsRoutes } from './menuSettings/routes.js'
import { ensureAllMenuSettings, sealStoredWifiPasswords } from './menuSettings/settings.js'
import { productRoutes } from './products/routes.js'
import { opensPanel } from './subscription/record.js'
import { subscriptionRoutes } from './subscription/routes.js'
import { tableRoutes } from './tables/routes.js'
import { importDiskUploads, openUpload, relocateStoredImages } from './images/files.js'


const app = Fastify({
  logger: true,
  bodyLimit: 8 * 1024 * 1024,
  trustProxy: env.trustProxy,
})

const localOrigin = [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/]

app.addHook('onSend', async (_request, reply) => {
  for (const [name, value] of Object.entries(securityHeaders(env.production))) {
    reply.header(name, value)
  }
})

await app.register(cors, {
  credentials: true,
  origin(origin, callback) {
    if (
      !origin ||
      localOrigin.some((pattern) => pattern.test(origin)) ||
      env.corsOrigins.includes(origin)
    ) {
      callback(null, true)
      return
    }

    callback(null, false)
  },
  allowedHeaders: ['Content-Type', 'Authorization'],
})

app.removeContentTypeParser('application/json')
app.addContentTypeParser('application/json', { parseAs: 'string' }, (request, body, done) => {
  if (!body) {
    done(null, undefined)
    return
  }

  try {
    done(null, JSON.parse(body))
  } catch {
    done(fail(400, 'Geçersiz istek.'))
  }
})

app.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode || 500

  if (statusCode >= 500) {
    request.log.error(error)
  }

  reply.code(statusCode).send({
    message: statusCode >= 500 ? 'Sunucu şu an yanıt vermiyor. Biraz sonra yeniden deneyin.' : error.message,
  })
})

const operatorPaths = new Set(['/api/subscription/activate'])

const unpaidAllowed = new Set(['/api/subscription', '/api/subscription/cancel'])

const unverifiedAllowed = new Set([
  '/api/health',
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/auth/verify-email',
  '/api/auth/verify-email/send',
  '/api/auth/password',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
])

app.addHook('preHandler', async (request) => {
  const path = request.url.split('?')[0]

  if (!path.startsWith('/api/')) {
    return
  }

  if (
    path.startsWith('/api/public/') ||
    path.startsWith('/api/uploads/') ||
    unverifiedAllowed.has(path) ||
    operatorPaths.has(path)
  ) {
    return
  }

  const user = await requireUser(request)

  if (!user.emailVerifiedAt) {
    throw fail(403, 'Panele girmek için e-postanızı doğrulayın.')
  }

  if (!opensPanel(user.tenant?.subscription) && !unpaidAllowed.has(path)) {
    throw fail(403, 'Deneme süreniz bitti. Satın almak için arayın.')
  }
})

app.get('/api/health', async (request, reply) => {
  reply.header('Cache-Control', 'no-store')

  try {
    await prisma.$queryRaw`SELECT 1`
  } catch (error) {
    request.log.error(error)
    reply.code(503)
    return { ok: false }
  }

  return {
    ok: true,
    mail: { configured: Boolean(env.smtpHost && env.smtpPass) },
  }
})

app.get('/api/uploads/:name', async (request, reply) => {
  const file = await openUpload(request.params.name)

  if (!file) {
    throw fail(404, 'Görsel bulunamadı.')
  }

  reply.header('Cache-Control', 'public, max-age=31536000, immutable')
  reply.type(file.type)
  return file.body
})
await authRoutes(app)
await productRoutes(app)
await categoryRoutes(app)
await tableRoutes(app)
await businessRoutes(app)
await analyticsRoutes(app)
await menuRoutes(app)
await notificationRoutes(app)
await pushRoutes(app)
await menuSettingsRoutes(app)
await subscriptionRoutes(app)

await importDiskUploads()
await relocateStoredImages()
await pruneExpiredViews({ force: true })
if (env.production) {
  await closeDemoAccount()
} else {
  await ensureDemoUser()
}
await ensureAllTenantCategories()
await ensureAllMenuSettings()
await sealStoredWifiPasswords()

await app.listen({ port: env.port, host: env.host })

app.log.info(
  {
    mailConfigured: Boolean(env.smtpHost && env.smtpPass),
    smtpHost: env.smtpHost || null,
    appUrl: env.appUrl,
  },
  env.smtpHost && env.smtpPass
    ? 'SMTP hazır'
    : 'SMTP eksik — SMTP_HOST ve SMTP_PASS tanımlayın (backend/.env veya Render Environment)',
)

async function shutdown() {
  await app.close()
  await prisma.$disconnect()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
