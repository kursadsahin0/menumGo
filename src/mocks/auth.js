import { ApiError } from '@/utils/errors'
import { wait } from '@/mocks/config'

const DB_KEY = 'qr_menu.mock.accounts'

const demoAccount = {
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
    status: 'active',
    planId: 'professional',
  },
  resetToken: null,
}

function slugify(value) {
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

function withSlug(account) {
  if (account.tenant?.slug) {
    return account
  }

  const slug = account.email === demoAccount.email ? 'burger-house' : slugify(account.tenant?.name)

  return {
    ...account,
    tenant: {
      ...account.tenant,
      slug,
    },
  }
}

function loadAccounts() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    const accounts = (Array.isArray(parsed) ? parsed : []).map(withSlug)

    if (!accounts.some((account) => account.email === demoAccount.email)) {
      accounts.unshift(demoAccount)
    }

    if (raw !== JSON.stringify(accounts)) {
      saveAccounts(accounts)
    }

    return accounts
  } catch {
    return [{ ...demoAccount }]
  }
}

function saveAccounts(accounts) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(accounts))
  } catch {
    // Ignore storage failures in mock mode.
  }
}

function publicSubscription(account) {
  const status = account.subscription?.status

  if (status === 'active' || status === 'inactive') {
    return {
      status,
      planId: account.subscription.planId || null,
    }
  }

  if (account.email === demoAccount.email) {
    return { status: 'active', planId: 'professional' }
  }

  return { status: 'inactive', planId: null }
}

function toPublicUser(account) {
  return {
    id: account.id,
    fullName: account.fullName,
    email: account.email,
    phone: account.phone,
    tenant: account.tenant,
    subscription: publicSubscription(account),
  }
}

function findByEmail(accounts, email) {
  const normalized = email.trim().toLowerCase()
  return accounts.find((account) => account.email.toLowerCase() === normalized)
}

export async function mockLogin(payload) {
  await wait()

  const email = payload?.email?.trim()
  const password = payload?.password ?? ''
  const account = findByEmail(loadAccounts(), email || '')

  if (!account || account.password !== password) {
    throw new ApiError('E-posta veya şifre hatalı.', { status: 401 })
  }

  return {
    token: `mock.${account.id}`,
    user: toPublicUser(account),
  }
}

export async function mockRegister(payload) {
  await wait()

  const fullName = payload?.fullName?.trim()
  const businessName = payload?.businessName?.trim()
  const email = payload?.email?.trim()
  const phone = payload?.phone?.trim()
  const password = payload?.password ?? ''

  if (!fullName || !businessName || !email || !phone || !password) {
    throw new ApiError('Kayıt bilgileri eksik.', { status: 422 })
  }

  const accounts = loadAccounts()

  if (findByEmail(accounts, email)) {
    throw new ApiError('Bu e-posta ile kayıtlı bir hesap var.', { status: 409 })
  }

  const account = {
    id: `usr_${Date.now()}`,
    fullName,
    email,
    phone,
    password,
    tenant: {
      id: `ten_${Date.now()}`,
      name: businessName,
      slug: slugify(businessName),
    },
    subscription: {
      status: 'inactive',
      planId: null,
    },
    resetToken: null,
  }

  accounts.push(account)
  saveAccounts(accounts)

  return {
    token: `mock.${account.id}`,
    user: toPublicUser(account),
  }
}

export async function mockFetchUser(token) {
  await wait(80)

  const id = String(token || '').replace(/^mock\./, '')
  const account = loadAccounts().find((entry) => entry.id === id)

  if (!account) {
    throw new ApiError('Oturum geçersiz.', { status: 401 })
  }

  return toPublicUser(account)
}

export async function mockForgotPassword(payload) {
  await wait()

  const email = payload?.email?.trim()
  const accounts = loadAccounts()
  const account = findByEmail(accounts, email || '')

  if (!account) {
    return { ok: true, resetToken: null }
  }

  account.resetToken = `rst_${account.id}`
  saveAccounts(accounts)

  return {
    ok: true,
    resetToken: account.resetToken,
  }
}

export async function mockResetPassword(payload) {
  await wait()

  const token = payload?.token
  const password = payload?.password ?? ''
  const accounts = loadAccounts()
  const account = accounts.find((entry) => entry.resetToken && entry.resetToken === token)

  if (!account) {
    throw new ApiError('Sıfırlama bağlantısı geçersiz veya süresi dolmuş.', { status: 400 })
  }

  account.password = password
  account.resetToken = null
  saveAccounts(accounts)

  return { ok: true }
}

function requireAccount(token) {
  const id = String(token || '').replace(/^mock\./, '')
  const accounts = loadAccounts()
  const account = accounts.find((entry) => entry.id === id)

  if (!account) {
    throw new ApiError('Oturum geçersiz.', { status: 401 })
  }

  return { accounts, account }
}

export async function mockUpdateAccount(token, payload) {
  await wait()

  const fullName = payload?.fullName?.trim()
  const email = payload?.email?.trim()
  const phone = payload?.phone?.trim()

  if (!fullName || !email || !phone) {
    throw new ApiError('Hesap bilgileri eksik.', { status: 422 })
  }

  const { accounts, account } = requireAccount(token)
  const existing = findByEmail(accounts, email)

  if (existing && existing.id !== account.id) {
    throw new ApiError('Bu e-posta ile kayıtlı bir hesap var.', { status: 409 })
  }

  account.fullName = fullName
  account.email = email
  account.phone = phone
  saveAccounts(accounts)

  return toPublicUser(account)
}

export async function mockChangePassword(token, payload) {
  await wait()

  const currentPassword = payload?.currentPassword ?? ''
  const password = payload?.password ?? ''
  const { accounts, account } = requireAccount(token)

  if (account.password !== currentPassword) {
    throw new ApiError('Mevcut şifre hatalı.', { status: 422 })
  }

  if (password.length < 8) {
    throw new ApiError('Şifre en az 8 karakter olmalı.', { status: 422 })
  }

  account.password = password
  saveAccounts(accounts)

  return { ok: true }
}

export async function mockLogout() {
  await wait(80)
  return { ok: true }
}
