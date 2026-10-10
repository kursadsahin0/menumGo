import { ensureDemoUser } from '../src/auth/seed.js'
import { prisma } from '../src/db.js'
import { env } from '../src/env.js'

if (!env.production) {
  await ensureDemoUser()
}

await prisma.$disconnect()
