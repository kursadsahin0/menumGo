import { ensureTenantCategories } from '../categories/categories.js'
import { removeImage } from '../images/files.js'
import { sendPasswordResetEmail, sendVerificationEmail } from '../mail/mail.js'
import { ensureMenuSettings } from '../menuSettings/settings.js'
import { prisma } from '../db.js'
import { fail } from '../http.js'
import { limitVerificationSends } from '../rateLimit.js'
import { hashPassword, verifyPassword } from './password.js'
import { requireTenant, requireUser } from './session.js'
import { createResetToken, createSessionToken, hashResetToken } from './token.js'
import {
  assertAccount,
  assertAvailableSlug,
  assertPassword,
  findUserByEmail,
  findUserById,
  newId,
  normalizeEmail,
  toPublicUser,
  uniqueSlug,
} from './users.js'

const verifyWindow = 24 * 60 * 60 * 1000

async function issueEmailVerification(log, user) {
  const token = createResetToken()

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verifyTokenHash: hashResetToken(token),
      verifyTokenExpiresAt: new Date(Date.now() + verifyWindow),
    },
  })

  try {
    await sendVerificationEmail(log, { to: user.email, token })
  } catch (error) {
    log.error({ err: error }, 'Doğrulama e-postası gönderilemedi')
  }
}

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
              },
            },
          },
        },
      },
      include: {
        tenant: { include: { subscription: true } },
      },
    })

    await ensureTenantCategories(user.tenant.id)
    await ensureMenuSettings({ ...user.tenant, user })
    await issueEmailVerification(request.log, user)

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

  app.patch('/api/auth/me', async (request, reply) => {
    const current = await requireUser(request)
    const account = assertAccount(request.body)
    const taken = await findUserByEmail(account.email)

    if (taken && taken.id !== current.id) {
      throw fail(409, 'Bu e-posta ile kayıtlı bir hesap var.')
    }

    const emailChanged = account.email !== current.email

    if (emailChanged) {
      await limitVerificationSends(request, reply, current.id)
    }

    const user = await prisma.user.update({
      where: { id: current.id },
      data: {
        ...account,
        ...(emailChanged ? { emailVerifiedAt: null } : {}),
      },
      include: {
        tenant: { include: { subscription: true } },
      },
    })

    if (emailChanged) {
      await issueEmailVerification(request.log, user)
    }

    return toPublicUser(user)
  })

  app.post('/api/auth/verify-email', async (request) => {
    const token = String(request.body?.token || '')
    const user = await prisma.user.findFirst({
      where: {
        verifyTokenHash: hashResetToken(token),
        verifyTokenExpiresAt: { gt: new Date() },
      },
    })

    if (!user) {
      throw fail(400, 'Doğrulama bağlantısı geçersiz veya süresi dolmuş.')
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        verifyTokenHash: null,
        verifyTokenExpiresAt: null,
      },
    })

    return { ok: true, email: user.email }
  })

  app.post('/api/auth/verify-email/send', async (request, reply) => {
    const user = await requireUser(request)

    if (user.emailVerifiedAt) {
      return { ok: true }
    }

    await limitVerificationSends(request, reply, user.id)
    await issueEmailVerification(request.log, user)
    return { ok: true }
  })

  app.patch('/api/auth/slug', async (request) => {
    const user = await requireUser(request)
    const tenant = requireTenant(user)
    const slug = await assertAvailableSlug(request.body?.slug, tenant.id)
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { slug },
    })
    return toPublicUser(await findUserById(user.id))
  })

  app.delete('/api/auth/me', async (request) => {
    const user = await requireUser(request)
    const matches = await verifyPassword(request.body?.password ?? '', user.passwordHash)

    if (!matches) {
      throw fail(422, 'Şifre hatalı.')
    }

    const images = []

    if (user.tenant) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: user.tenant.id },
        include: {
          products: { select: { image: true } },
          categories: { select: { image: true } },
          menuSettings: { select: { logo: true } },
        },
      })

      if (tenant) {
        images.push(tenant.logo, tenant.coverImage, tenant.menuSettings?.logo)

        for (const product of tenant.products) {
          images.push(product.image)
        }

        for (const category of tenant.categories) {
          images.push(category.image)
        }
      }
    }

    await prisma.user.delete({ where: { id: user.id } })
    await Promise.all(images.map((image) => removeImage(image)))
    return { ok: true }
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
      return { ok: true }
    }

    const resetToken = createResetToken()
    const resetWindow = 2 * 60 * 1000

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: hashResetToken(resetToken),
        resetTokenExpiresAt: new Date(Date.now() + resetWindow),
      },
    })

    try {
      await sendPasswordResetEmail(request.log, { to: user.email, token: resetToken })
    } catch (error) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetTokenHash: null,
          resetTokenExpiresAt: null,
        },
      })
      request.log.error({ err: error }, 'Şifre sıfırlama e-postası gönderilemedi')
      throw fail(422, 'Sıfırlama e-postası gönderilemedi.')
    }

    return { ok: true }
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
