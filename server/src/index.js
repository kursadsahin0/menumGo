import cors from '@fastify/cors'
import Fastify from 'fastify'
import { authRoutes } from './auth/routes.js'
import { ensureDemoUser } from './auth/seed.js'
import { prisma } from './db.js'
import { env } from './env.js'

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/],
  allowedHeaders: ['Content-Type', 'Authorization'],
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

await ensureDemoUser()
await app.listen({ port: env.port, host: '0.0.0.0' })

async function shutdown() {
  await app.close()
  await prisma.$disconnect()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
