import { ensureDemoUser } from '../src/auth/seed.js'
import { prisma } from '../src/db.js'

await ensureDemoUser()
await prisma.$disconnect()
