import { randomBytes } from 'node:crypto'
import { prisma } from '../db.js'
import { fail } from '../http.js'

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
    phone: user.phone,
    tenant: user.tenant
      ? {
          id: user.tenant.id,
          name: user.tenant.name,
          slug: user.tenant.slug,
        }
      : null,
    subscription: {
      status: user.tenant?.subscription?.status || 'inactive',
      planId: user.tenant?.subscription?.planId || null,
    },
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

export async function uniqueSlug(name) {
  const base = slugify(name)
  let slug = base
  let attempt = 2

  while (await prisma.tenant.findUnique({ where: { slug } })) {
    slug = `${base}-${attempt}`
    attempt += 1
  }

  return slug
}

export function newId(prefix) {
  return `${prefix}_${randomBytes(8).toString('hex')}`
}
