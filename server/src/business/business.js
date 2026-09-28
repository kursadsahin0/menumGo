import { fail } from '../http.js'

const imageLimit = 4_000_000
const businessTypes = new Set(['cafe', 'restaurant', 'bar', 'bakery', 'fast-food', 'other'])

export function toPublicBusiness(tenant) {
  return {
    name: tenant.name,
    businessType: tenant.businessType || 'cafe',
    logo: tenant.logo || null,
    coverImage: tenant.coverImage || null,
    description: tenant.description || '',
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

function readImage(value, label) {
  if (value == null || value === '') {
    return null
  }

  if (typeof value !== 'string' || value.length > imageLimit) {
    throw fail(422, `${label} çok büyük. Daha küçük bir dosya seçin.`)
  }

  return value
}

export function readBusiness(body) {
  const source = body && typeof body === 'object' ? body : {}
  const businessType = String(source.businessType || '').trim()

  if (!businessTypes.has(businessType)) {
    throw fail(422, 'İşletme türü geçersiz.')
  }

  return {
    name: readText(source.name, 'Restoran adı', { required: true, max: 80 }),
    businessType,
    description: readText(source.description, 'Açıklama', { max: 500 }),
    logo: readImage(source.logo, 'Logo'),
    coverImage: readImage(source.coverImage, 'Kapak'),
  }
}
