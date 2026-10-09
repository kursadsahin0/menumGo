import { randomBytes } from 'node:crypto'
import { prisma } from '../db.js'
import { fail } from '../http.js'
import { toPublicSubscription } from '../subscription/record.js'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function slugify(value) {
  return (
    String(value || '')
      .trim()
      .toLocaleLowerCase('tr')
      .replaceAll('ı', 'i')
      .replaceAll('ğ', 'g')
      .replaceAll('ü', 'u')
      .replaceAll('ş', 's')
      .replaceAll('ö', 'o')
      .replaceAll('ç', 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'restoran'
  )
}

export function toPublicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    emailVerified: Boolean(user.emailVerifiedAt),
    phone: user.phone,
    tenant: user.tenant
      ? {
          id: user.tenant.id,
          name: user.tenant.name,
          slug: user.tenant.slug,
        }
      : null,
    subscription: toPublicSubscription(user.tenant?.subscription),
  }
}

const userInclude = {
  tenant: {
    select: {
      id: true,
      name: true,
      slug: true,
      businessType: true,
      description: true,
      subscription: true,
    },
  },
}

export function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    include: userInclude,
  })
}

export function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
    include: userInclude,
  })
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

export function assertAccount(payload) {
  const fullName = String(payload?.fullName || '').trim()
  const email = normalizeEmail(payload?.email)
  const phone = String(payload?.phone || '').trim()
  const digits = phone.replace(/\D/g, '')

  if (!fullName || !email || !phone) {
    throw fail(422, 'Hesap bilgileri eksik.')
  }

  if (!emailPattern.test(email)) {
    throw fail(422, 'Geçerli bir e-posta girin.')
  }

  if (digits.length < 10 || digits.length > 15) {
    throw fail(422, 'Geçerli bir telefon girin.')
  }

  return { fullName, email, phone }
}

export function assertPassword(password, message = 'Şifre en az 8 karakter olmalı.') {
  if (typeof password !== 'string' || password.length < 8) {
    throw fail(422, message)
  }

  return password
}

const reservedSlugs = new Set(['admin', 'api', 'auth', 'assets', 'menu', 'uploads'])

export function assertSlug(value) {
  const raw = String(value || '').trim()

  if (!raw) {
    throw fail(422, 'Menü adresi zorunlu.')
  }

  const slug = slugify(raw)

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length < 3 || slug.length > 48) {
    throw fail(422, 'Menü adresi 3 ile 48 karakter arasında olmalı.')
  }

  if (reservedSlugs.has(slug)) {
    throw fail(422, 'Bu menü adresi kullanılamaz.')
  }

  return slug
}

export async function assertAvailableSlug(value, tenantId) {
  const slug = assertSlug(value)
  const taken = await prisma.tenant.findUnique({ where: { slug } })

  if (taken && taken.id !== tenantId) {
    throw fail(409, 'Bu menü adresi kullanılıyor.')
  }

  return slug
}

export async function uniqueSlug(name) {
  const base = slugify(name)
  let slug = reservedSlugs.has(base) ? `${base}-2` : base
  let attempt = reservedSlugs.has(base) ? 3 : 2

  while (await prisma.tenant.findUnique({ where: { slug } })) {
    slug = `${base}-${attempt}`
    attempt += 1
  }

  return slug
}

export function newId(prefix) {
  return `${prefix}_${randomBytes(8).toString('hex')}`
}
