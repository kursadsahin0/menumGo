import { prisma } from '../db.js'
import { fail } from '../http.js'
import { newId } from '../auth/users.js'

const imageLimit = 4_000_000
const themes = new Set(['classic', 'modern', 'minimal', 'elegant'])
const fonts = new Set(['sans', 'serif'])
const cardStyles = new Set(['soft', 'outline', 'flat'])
const logoPositions = new Set(['center', 'left'])
const colorPattern = /^#[0-9a-fA-F]{6}$/

const classic = {
  theme: 'classic',
  primaryColor: '#1f3a34',
  secondaryColor: '#8d6a45',
  font: 'sans',
  cardStyle: 'soft',
  logoPosition: 'center',
}

export function toPublicSettings(settings, tenant) {
  const source = settings || defaultRecord(tenant)

  return {
    name: source.name,
    description: {
      tr: source.descriptionTr || '',
      en: source.descriptionEn || '',
    },
    phone: source.phone || '',
    address: {
      tr: source.addressTr || '',
      en: source.addressEn || '',
    },
    website: source.website || '',
    instagram: source.instagram || '',
    hours: {
      tr: source.hoursTr || '',
      en: source.hoursEn || '',
    },
    logo: source.logo || null,
    theme: source.theme,
    primaryColor: source.primaryColor,
    secondaryColor: source.secondaryColor,
    font: source.font,
    cardStyle: source.cardStyle,
    logoPosition: source.logoPosition,
    showDescriptions: source.showDescriptions !== false,
    showProductImages: source.showProductImages !== false,
    showPrices: source.showPrices !== false,
  }
}

function defaultRecord(tenant) {
  return {
    name: tenant?.name || '',
    descriptionTr: '',
    descriptionEn: '',
    phone: tenant?.user?.phone || '',
    addressTr: '',
    addressEn: '',
    website: '',
    instagram: '',
    hoursTr: '',
    hoursEn: '',
    logo: null,
    ...classic,
    showDescriptions: true,
    showProductImages: true,
    showPrices: true,
  }
}

function readText(value, label, { required = false, max = 500 } = {}) {
  const text = String(value || '').trim()

  if (!text && required) {
    throw fail(422, `${label} zorunlu.`)
  }

  if (text.length > max) {
    throw fail(422, `${label} çok uzun.`)
  }

  return text
}

function readLocale(value, label) {
  const source = value && typeof value === 'object' ? value : { tr: value || '', en: '' }

  return {
    tr: readText(source.tr, label, { max: 500 }),
    en: readText(source.en, label, { max: 500 }),
  }
}

function readChoice(value, allowed, label) {
  const choice = String(value || '').trim()

  if (!allowed.has(choice)) {
    throw fail(422, `${label} geçersiz.`)
  }

  return choice
}

function readColor(value, label) {
  const color = String(value || '').trim()

  if (!colorPattern.test(color)) {
    throw fail(422, `${label} geçersiz.`)
  }

  return color.toLowerCase()
}

export function readMenuSettings(body) {
  const source = body && typeof body === 'object' ? body : {}
  const description = readLocale(source.description, 'Açıklama')
  const address = readLocale(source.address, 'Adres')
  const hours = readLocale(source.hours, 'Çalışma saatleri')
  let logo = null

  if (source.logo != null && source.logo !== '') {
    if (typeof source.logo !== 'string' || source.logo.length > imageLimit) {
      throw fail(422, 'Logo çok büyük. Daha küçük bir dosya seçin.')
    }

    logo = source.logo
  }

  return {
    name: readText(source.name, 'Restoran adı', { required: true, max: 80 }),
    descriptionTr: description.tr,
    descriptionEn: description.en,
    phone: readText(source.phone, 'Telefon', { max: 30 }),
    addressTr: address.tr,
    addressEn: address.en,
    website: readText(source.website, 'Website', { max: 200 }),
    instagram: readText(source.instagram, 'Instagram', { max: 200 }),
    hoursTr: hours.tr,
    hoursEn: hours.en,
    logo,
    theme: readChoice(source.theme, themes, 'Tema'),
    primaryColor: readColor(source.primaryColor, 'Ana renk'),
    secondaryColor: readColor(source.secondaryColor, 'İkinci renk'),
    font: readChoice(source.font, fonts, 'Font'),
    cardStyle: readChoice(source.cardStyle, cardStyles, 'Kart stili'),
    logoPosition: readChoice(source.logoPosition, logoPositions, 'Logo konumu'),
    showDescriptions: source.showDescriptions !== false,
    showProductImages: source.showProductImages !== false,
    showPrices: source.showPrices !== false,
  }
}

export async function ensureMenuSettings(tenant) {
  const existing = await prisma.menuSettings.findUnique({ where: { tenantId: tenant.id } })

  if (existing) {
    return existing
  }

  const data = defaultRecord(tenant)

  return prisma.menuSettings.create({
    data: {
      id: newId('set'),
      tenantId: tenant.id,
      ...data,
    },
  })
}

export async function ensureAllMenuSettings() {
  const tenants = await prisma.tenant.findMany({
    include: { user: true },
  })

  for (const tenant of tenants) {
    await ensureMenuSettings(tenant)
  }
}
