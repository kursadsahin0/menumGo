import { prisma } from '../db.js'
import { hashPassword } from './password.js'

const demo = {
  id: 'usr_demo',
  fullName: 'Demo Kullanıcı',
  email: 'demo@qrmenu.local',
  phone: '05551234567',
  password: 'demo1234',
  tenant: {
    id: 'ten_demo',
    name: 'Demo Kafe',
    slug: 'burger-house',
  },
  subscription: {
    id: 'sub_demo',
    status: 'active',
  },
}

export async function ensureDemoUser() {
  const existing = await prisma.user.findUnique({ where: { email: demo.email } })

  if (existing) {
    if (!existing.emailVerifiedAt) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { emailVerifiedAt: new Date() },
      })
    }

    return existing
  }

  return prisma.user.create({
    data: {
      id: demo.id,
      fullName: demo.fullName,
      email: demo.email,
      phone: demo.phone,
      passwordHash: await hashPassword(demo.password),
      emailVerifiedAt: new Date(),
      tenant: {
        create: {
          id: demo.tenant.id,
          name: demo.tenant.name,
          slug: demo.tenant.slug,
          subscription: {
            create: demo.subscription,
          },
        },
      },
    },
  })
}
