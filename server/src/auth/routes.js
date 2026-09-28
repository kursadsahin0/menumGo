import { prisma } from '../db.js'
import { fail } from '../http.js'
import { hashPassword, verifyPassword } from './password.js'
import { requireUser } from './session.js'
import { createResetToken, createSessionToken, hashResetToken } from './token.js'
import {
  assertAccount,
  assertPassword,
  findUserByEmail,
  newId,
  normalizeEmail,
  toPublicUser,
  uniqueSlug,
} from './users.js'

export async function authRoutes(app) {
  app.post('/api/auth/register', async (request) => {
    const businessName = String(request.body?.businessName || '').trim()
    const account = assertAccount(request.body)
    const password = assertPassword(request.body?.password)

    if (!businessName) {
      throw fail(422, 'Kayıt bilgileri eksik.')
    }

    if (request.body?.acceptedTerms !== true) {
      throw fail(422, 'Devam etmek için koşulları kabul edin.')
    }

    const existing = await findUserByEmail(account.email)

    if (existing) {
      throw fail(409, 'Bu e-posta ile kayıtlı bir hesap var.')
    }

    const user = await prisma.user.create({
      data: {
        id: newId('usr'),
        fullName: account.fullName,
        email: account.email,
        phone: account.phone,
        passwordHash: await hashPassword(password),
        tenant: {
          create: {
            id: newId('ten'),
            name: businessName,
            slug: await uniqueSlug(businessName),
            subscription: {
              create: {
                id: newId('sub'),
                status: 'inactive',
                planId: null,
              },
            },
          },
        },
      },
      include: {
        tenant: { include: { subscription: true } },
      },
    })

    return {
      token: createSessionToken(user.id),
      user: toPublicUser(user),
    }
  })

  app.post('/api/auth/login', async (request) => {
    const email = normalizeEmail(request.body?.email)
    const password = request.body?.password ?? ''
    const user = await findUserByEmail(email)

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw fail(401, 'E-posta veya şifre hatalı.')
    }

    return {
      token: createSessionToken(user.id),
      user: toPublicUser(user),
    }
  })

  app.post('/api/auth/logout', async () => ({ ok: true }))

  app.get('/api/auth/me', async (request) => {
    const user = await requireUser(request)
    return toPublicUser(user)
  })

  app.patch('/api/auth/me', async (request) => {
    const current = await requireUser(request)
    const account = assertAccount(request.body)
    const taken = await findUserByEmail(account.email)

    if (taken && taken.id !== current.id) {
      throw fail(409, 'Bu e-posta ile kayıtlı bir hesap var.')
    }

    const user = await prisma.user.update({
      where: { id: current.id },
      data: account,
      include: {
        tenant: { include: { subscription: true } },
      },
    })

    return toPublicUser(user)
  })

  app.post('/api/auth/password', async (request) => {
    const current = await requireUser(request)
    const nextPassword = assertPassword(request.body?.password)
    const matches = await verifyPassword(request.body?.currentPassword ?? '', current.passwordHash)

    if (!matches) {
      throw fail(422, 'Mevcut şifre hatalı.')
    }

    await prisma.user.update({
      where: { id: current.id },
      data: { passwordHash: await hashPassword(nextPassword) },
    })

    return { ok: true }
  })

  app.post('/api/auth/forgot-password', async (request) => {
    const user = await findUserByEmail(request.body?.email)

    if (!user) {
      return { ok: true, resetToken: null }
    }

    const resetToken = createResetToken()
    const hour = 60 * 60 * 1000

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: hashResetToken(resetToken),
        resetTokenExpiresAt: new Date(Date.now() + hour),
      },
    })

    return { ok: true, resetToken }
  })

  app.post('/api/auth/reset-password', async (request) => {
    const token = String(request.body?.token || '')
    const password = assertPassword(request.body?.password)
    const user = await prisma.user.findFirst({
      where: {
        resetTokenHash: hashResetToken(token),
        resetTokenExpiresAt: { gt: new Date() },
      },
    })

    if (!user) {
      throw fail(400, 'Sıfırlama bağlantısı geçersiz veya süresi dolmuş.')
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(password),
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      },
    })

    return { ok: true }
  })
}
