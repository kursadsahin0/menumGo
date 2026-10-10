import { prisma } from '../db.js'
import { fail } from '../http.js'
import { newId } from '../auth/users.js'
import { defaultCategories } from './defaults.js'

const imageLimit = 4_000_000

export function toPublicCategory(category) {
  return {
    id: category.id,
    name: { tr: category.name || '', en: category.nameEn || '' },
    description: { tr: category.description || '', en: category.descriptionEn || '' },
    image: category.image,
    isActive: category.isActive,
    sortOrder: category.sortOrder,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
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

function readLocale(value, label, { required = false, max = 500 } = {}) {
  const source = value && typeof value === 'object' ? value : { tr: value || '', en: '' }

  return {
    tr: readText(source.tr, label, { required, max }),
    en: readText(source.en, `${label} (İngilizce)`, { max }),
  }
}

export function readCategoryInput(body, { partial = false } = {}) {
  const source = body && typeof body === 'object' ? body : {}
  const data = {}
  const has = (key) => Object.prototype.hasOwnProperty.call(source, key)

  if (!partial || has('name')) {
    const name = readLocale(source.name, 'Kategori adı', { required: true, max: 80 })
    data.name = name.tr
    data.nameEn = name.en
  }

  if (!partial || has('description')) {
    const description = readLocale(source.description, 'Açıklama', { max: 500 })
    data.description = description.tr
    data.descriptionEn = description.en
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

  if (!partial || has('isActive')) {
    data.isActive = source.isActive !== false
  }

  if (has('sortOrder')) {
    const sortOrder = Number(source.sortOrder)

    if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 9999) {
      throw fail(422, 'Sıra 0 veya daha büyük bir tam sayı olmalı.')
    }

    data.sortOrder = sortOrder
  }

  return data
}

export async function assertOwnedCategory(tenantId, categoryId) {
  const category = await prisma.category.findFirst({
    where: { id: String(categoryId || ''), tenantId },
  })

  if (!category) {
    throw fail(422, 'Kategori bulunamadı.')
  }

  return category
}

async function remapLegacyProducts(tenantId, categories) {
  const byName = new Map(categories.map((category) => [category.name, category.id]))

  for (const item of defaultCategories) {
    const categoryId = byName.get(item.name)

    if (!categoryId) {
      continue
    }

    await prisma.product.updateMany({
      where: { tenantId, categoryId: item.legacyId },
      data: { categoryId },
    })
  }
}

async function fillDefaultEnglish(categories) {
  for (const category of categories) {
    const item = defaultCategories.find((entry) => entry.name === category.name)

    if (!item || (category.nameEn && category.descriptionEn)) {
      continue
    }

    await prisma.category.update({
      where: { id: category.id },
      data: {
        nameEn: category.nameEn || item.nameEn,
        descriptionEn: category.descriptionEn || item.descriptionEn,
      },
    })
  }
}

export async function ensureTenantCategories(tenantId) {
  const existing = await prisma.category.findMany({ where: { tenantId } })

  if (existing.length > 0) {
    await fillDefaultEnglish(existing)
    await remapLegacyProducts(tenantId, existing)
    return existing
  }

  const created = []

  for (const item of defaultCategories) {
    const category = await prisma.category.create({
      data: {
        id: newId('cat'),
        tenantId,
        name: item.name,
        nameEn: item.nameEn,
        description: item.description,
        descriptionEn: item.descriptionEn,
        isActive: true,
        sortOrder: item.sortOrder,
      },
    })
    created.push(category)
  }

  await remapLegacyProducts(tenantId, created)
  return created
}

export async function ensureAllTenantCategories() {
  const tenants = await prisma.tenant.findMany({ select: { id: true } })

  for (const tenant of tenants) {
    await ensureTenantCategories(tenant.id)
  }
}
