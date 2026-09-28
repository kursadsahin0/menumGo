import { fail } from '../http.js'

const imageLimit = 4_000_000

function money(value) {
  if (value == null) {
    return null
  }

  return Number(value)
}

export function toPublicProduct(product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: money(product.price),
    discountedPrice: money(product.discountedPrice),
    image: product.image,
    categoryId: product.categoryId,
    isAvailable: product.isAvailable,
    isFeatured: product.isFeatured,
    sortOrder: product.sortOrder,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

function readMoney(value, label, { allowEmpty = false } = {}) {
  if (value === null || value === undefined || value === '') {
    if (allowEmpty) {
      return null
    }

    throw fail(422, `${label} zorunlu.`)
  }

  const amount = Number(value)

  if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000) {
    throw fail(422, `Geçerli bir ${label.toLocaleLowerCase('tr')} girin.`)
  }

  return Math.round(amount * 100) / 100
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

export function readProductInput(body, { partial = false } = {}) {
  const source = body && typeof body === 'object' ? body : {}
  const data = {}
  const has = (key) => Object.prototype.hasOwnProperty.call(source, key)

  if (!partial || has('name')) {
    data.name = readText(source.name, 'Ürün adı', { required: true, max: 80 })
  }

  if (!partial || has('description')) {
    data.description = readText(source.description, 'Açıklama', { max: 500 })
  }

  if (!partial || has('price')) {
    data.price = readMoney(source.price, 'Fiyat')
  }

  if (!partial || has('discountedPrice')) {
    data.discountedPrice = readMoney(source.discountedPrice, 'İndirimli fiyat', { allowEmpty: true })
  }

  if (!partial || has('categoryId')) {
    data.categoryId = readText(source.categoryId, 'Kategori', { required: true, max: 80 })
  }

  if (!partial || has('image')) {
    if (source.image == null || source.image === '') {
      data.image = null
    } else if (typeof source.image !== 'string' || source.image.length > imageLimit) {
      throw fail(422, 'Görsel çok büyük. Daha küçük bir dosya seçin.')
    } else {
      data.image = source.image
    }
  }

  if (!partial || has('isAvailable')) {
    data.isAvailable = Boolean(source.isAvailable)
  }

  if (!partial || has('isFeatured')) {
    data.isFeatured = Boolean(source.isFeatured)
  }

  if (!partial || has('sortOrder')) {
    const sortOrder = Number(source.sortOrder)

    if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 9999) {
      throw fail(422, 'Sıra 0 veya daha büyük bir tam sayı olmalı.')
    }

    data.sortOrder = sortOrder
  }

  return data
}

export function assertDiscount(price, discountedPrice) {
  if (discountedPrice != null && Number(discountedPrice) >= Number(price)) {
    throw fail(422, 'İndirimli fiyat, satış fiyatından düşük olmalı.')
  }
}
