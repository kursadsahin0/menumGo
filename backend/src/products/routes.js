import { prisma } from '../db.js'
import { fail } from '../http.js'
import { newId } from '../auth/users.js'
import { clampPage, pageResult, placeIds, readPage } from '../paging.js'
import { requireTenant, requireUser } from '../auth/session.js'
import { assertOwnedCategory } from '../categories/categories.js'
import { createNotification } from '../notifications/notifications.js'
import { allergenIdsMatching, assertDiscount, readProductInput, toPublicProduct } from './products.js'
import { removeImage, replaceImage, saveImage } from '../images/files.js'

function listWhere(tenantId, query) {
  const search = String(query.search || '').trim()
  const categoryId = String(query.categoryId || '').trim()
  const status = String(query.status || 'all')
  const where = { tenantId }

  if (categoryId) {
    where.categoryId = categoryId
  }

  if (status === 'available') {
    where.isAvailable = true
  } else if (status === 'unavailable') {
    where.isAvailable = false
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { nameEn: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { descriptionEn: { contains: search, mode: 'insensitive' } },
      { portion: { contains: search, mode: 'insensitive' } },
      { portionEn: { contains: search, mode: 'insensitive' } },
      { ingredients: { contains: search, mode: 'insensitive' } },
      { ingredientsEn: { contains: search, mode: 'insensitive' } },
    ]

    const allergenIds = allergenIdsMatching(search)

    if (allergenIds.length) {
      where.OR.push({ allergens: { hasSome: allergenIds } })
    }
  }

  return where
}

async function findOwnedProduct(tenantId, id) {
  const product = await prisma.product.findFirst({
    where: { id, tenantId },
  })

  if (!product) {
    throw fail(404, 'Ürün bulunamadı.')
  }

  return product
}

export async function productRoutes(app) {
  app.get('/api/products', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const requested = readPage(request.query)
    const where = listWhere(tenant.id, request.query || {})
    const total = await prisma.product.count({ where })
    const page = clampPage(requested.page, total, requested.pageSize)
    const products = await prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }, { id: 'asc' }],
      skip: (page - 1) * requested.pageSize,
      take: requested.pageSize,
    })

    return pageResult(products.map(toPublicProduct), total, page, requested.pageSize)
  })

  app.patch('/api/products/order', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const ids = Array.isArray(request.body?.ids) ? request.body.ids.map((id) => String(id)) : []
    const picked = ids.length
      ? await prisma.product.findMany({
          where: { tenantId: tenant.id, id: { in: ids } },
        })
      : []

    if (!picked.length) {
      throw fail(422, 'Sıralanacak ürün yok.')
    }

    const categoryId = picked[0].categoryId || null

    if (picked.some((product) => (product.categoryId || null) !== categoryId)) {
      throw fail(422, 'Ürünler aynı kategoride olmalı.')
    }

    const products = await prisma.product.findMany({
      where: { tenantId: tenant.id, categoryId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }, { id: 'asc' }],
    })
    const ordered = placeIds(products, ids)

    if (!ordered.length) {
      throw fail(422, 'Sıralanacak ürün yok.')
    }

    await prisma.$transaction(
      ordered.map((product, index) =>
        prisma.product.update({
          where: { id: product.id },
          data: { sortOrder: index + 1 },
        }),
      ),
    )

    const moved = new Set(ids)
    const updated = await prisma.product.findMany({
      where: {
        tenantId: tenant.id,
        categoryId,
        id: { in: [...moved] },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }, { id: 'asc' }],
    })

    return updated.map(toPublicProduct)
  })

  app.get('/api/products/:id', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const product = await findOwnedProduct(tenant.id, request.params.id)
    return toPublicProduct(product)
  })

  app.post('/api/products', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const data = readProductInput(request.body)
    data.image = await saveImage(data.image, 'Görsel')
    assertDiscount(data.price, data.discountedPrice)
    await assertOwnedCategory(tenant.id, data.categoryId)

    const product = await prisma.product.create({
      data: {
        id: newId('prd'),
        tenantId: tenant.id,
        ...data,
      },
    })

    await createNotification(tenant.id, 'Ürün eklendi', `${product.name} menüye eklendi.`)

    return toPublicProduct(product)
  })

  app.patch('/api/products/:id', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const current = await findOwnedProduct(tenant.id, request.params.id)
    const data = readProductInput(request.body, { partial: true })

    if (Object.prototype.hasOwnProperty.call(data, 'image')) {
      data.image = await saveImage(data.image, 'Görsel')
    }

    if (Object.prototype.hasOwnProperty.call(data, 'categoryId')) {
      await assertOwnedCategory(tenant.id, data.categoryId)
    }

    assertDiscount(
      data.price ?? current.price,
      Object.prototype.hasOwnProperty.call(data, 'discountedPrice')
        ? data.discountedPrice
        : current.discountedPrice,
    )

    const product = await prisma.product.update({
      where: { id: current.id },
      data,
    })

    if (Object.prototype.hasOwnProperty.call(data, 'image')) {
      await replaceImage(current.image, data.image)
    }
    const priceChanged =
      (data.price != null && Number(data.price) !== Number(current.price)) ||
      (Object.prototype.hasOwnProperty.call(data, 'discountedPrice') &&
        Number(data.discountedPrice) !== Number(current.discountedPrice))

    await createNotification(
      tenant.id,
      priceChanged ? 'Fiyat güncellendi' : 'Ürün güncellendi',
      priceChanged ? `${product.name} fiyatı kaydedildi.` : `${product.name} kaydedildi.`,
    )

    return toPublicProduct(product)
  })

  app.delete('/api/products/:id', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const current = await findOwnedProduct(tenant.id, request.params.id)

    await prisma.product.delete({ where: { id: current.id } })
    await removeImage(current.image)
    await createNotification(tenant.id, 'Ürün silindi', `${current.name} menüden kaldırıldı.`)
    return { ok: true }
  })
}
