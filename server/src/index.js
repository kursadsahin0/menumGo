import cors from '@fastify/cors'
import Fastify from 'fastify'
import { fail } from './http.js'
import { authRoutes } from './auth/routes.js'
import { ensureDemoUser } from './auth/seed.js'
import { prisma } from './db.js'
import { env } from './env.js'
import { analyticsRoutes } from './analytics/routes.js'
import { businessRoutes } from './business/routes.js'
import { categoryRoutes } from './categories/routes.js'
import { ensureAllTenantCategories } from './categories/categories.js'
import { menuRoutes } from './menus/routes.js'
import { notificationRoutes } from './notifications/routes.js'

import { menuSettingsRoutes } from './menuSettings/routes.js'
import { ensureAllMenuSettings } from './menuSettings/settings.js'
import { productRoutes } from './products/routes.js'
import { tableRoutes } from './tables/routes.js'


const app = Fastify({
  logger: true,
  bodyLimit: 8 * 1024 * 1024,
})

await app.register(cors, {
  origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
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

app.get('/api/health', async () => ({ ok: true }))
await authRoutes(app)
await productRoutes(app)
await categoryRoutes(app)
await tableRoutes(app)
await businessRoutes(app)
await analyticsRoutes(app)
await menuRoutes(app)
await notificationRoutes(app)
await menuSettingsRoutes(app)

await ensureDemoUser()
await ensureAllTenantCategories()
await ensureAllMenuSettings()

await app.listen({ port: env.port, host: '0.0.0.0' })

async function shutdown() {
  await app.close()
  await prisma.$disconnect()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
