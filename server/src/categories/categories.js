import { prisma } from '../db.js'
import { fail } from '../http.js'
import { newId } from '../auth/users.js'
import { defaultCategories } from './defaults.js'

const imageLimit = 4_000_000

export function toPublicCategory(category) {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
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

export function readCategoryInput(body, { partial = false } = {}) {
  const source = body && typeof body === 'object' ? body : {}
  const data = {}
  const has = (key) => Object.prototype.hasOwnProperty.call(source, key)

  if (!partial || has('name')) {
    data.name = readText(source.name, 'Kategori adı', { required: true, max: 80 })
  }

  if (!partial || has('description')) {
    data.description = readText(source.description, 'Açıklama', { max: 500 })
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

export async function ensureTenantCategories(tenantId) {
  const existing = await prisma.category.findMany({ where: { tenantId } })

  if (existing.length > 0) {
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
        description: item.description,
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
