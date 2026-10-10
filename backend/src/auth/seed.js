import { randomBytes } from 'node:crypto'
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
    plan: 'Tek seferlik panel',
    amount: 5000,
    paidAt: new Date('2026-01-01T00:00:00.000Z'),
    provider: 'demo',
  },
}

export const demoAccountEmail = demo.email

export async function closeDemoAccount() {
  const existing = await prisma.user.findUnique({
    where: { email: demo.email },
    include: { tenant: { select: { subscription: { select: { id: true } } } } },
  })

  if (!existing) {
    return null
  }

  await prisma.session.deleteMany({ where: { userId: existing.id } })
  await prisma.user.update({
    where: { id: existing.id },
    data: {
      passwordHash: await hashPassword(randomBytes(32).toString('hex')),
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      verifyTokenHash: null,
      verifyTokenExpiresAt: null,
    },
  })

  if (existing.tenant?.subscription) {
    await prisma.subscription.update({
      where: { id: existing.tenant.subscription.id },
      data: { status: 'inactive', currentPeriodEnd: new Date() },
    })
  }

  return existing
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
