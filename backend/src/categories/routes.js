import { prisma } from '../db.js'
import { fail } from '../http.js'
import { newId } from '../auth/users.js'
import { clampPage, pageResult, placeIds, readPage } from '../paging.js'
import { requireTenant, requireUser } from '../auth/session.js'
import { createNotification } from '../notifications/notifications.js'
import { readCategoryInput, toPublicCategory } from './categories.js'
import { removeImage, replaceImage, saveImage } from '../images/files.js'

const categoryOrder = [{ sortOrder: 'asc' }, { name: 'asc' }, { id: 'asc' }]

function toListCategory(category) {
  return {
    ...toPublicCategory(category),
    productCount: category._count?.products || 0,
  }
}

async function listCategories(tenantId, query) {
  const requested = readPage(query)
  const where = { tenantId }
  const total = await prisma.category.count({ where })
  const page = clampPage(requested.page, total, requested.pageSize)
  const categories = await prisma.category.findMany({
    where,
    orderBy: categoryOrder,
    skip: (page - 1) * requested.pageSize,
    take: requested.pageSize,
    include: { _count: { select: { products: true } } },
  })

  return pageResult(categories.map(toListCategory), total, page, requested.pageSize)
}

async function findOwnedCategory(tenantId, id) {
  const category = await prisma.category.findFirst({
    where: { id, tenantId },
  })

  if (!category) {
    throw fail(404, 'Kategori bulunamadı.')
  }

  return category
}

export async function categoryRoutes(app) {
  app.get('/api/categories', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    return listCategories(tenant.id, request.query)
  })

  app.patch('/api/categories/order', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const ids = Array.isArray(request.body?.ids) ? request.body.ids.map((id) => String(id)) : []
    const categories = await prisma.category.findMany({
      where: { tenantId: tenant.id },
      orderBy: categoryOrder,
    })
    const ordered = placeIds(categories, ids)

    if (!ordered.length) {
      throw fail(422, 'Sıralanacak kategori yok.')
    }

    await prisma.$transaction(
      ordered.map((category, index) =>
        prisma.category.update({
          where: { id: category.id },
          data: { sortOrder: index + 1 },
        }),
      ),
    )

    const moved = await prisma.category.findMany({
      where: { tenantId: tenant.id, id: { in: ids } },
      orderBy: categoryOrder,
      include: { _count: { select: { products: true } } },
    })

    return moved.map(toListCategory)
  })

  app.get('/api/categories/:id', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const category = await findOwnedCategory(tenant.id, request.params.id)
    return toPublicCategory(category)
  })

  app.post('/api/categories', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const data = readCategoryInput(request.body)
    data.image = await saveImage(data.image, 'Görsel')
    const count = await prisma.category.count({ where: { tenantId: tenant.id } })

    const category = await prisma.category.create({
      data: {
        id: newId('cat'),
        tenantId: tenant.id,
        ...data,
        sortOrder: Object.prototype.hasOwnProperty.call(data, 'sortOrder') ? data.sortOrder : count + 1,
      },
    })

    await createNotification(tenant.id, 'Kategori eklendi', `${category.name} menüye eklendi.`)

    return toPublicCategory(category)
  })

  app.patch('/api/categories/:id', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const current = await findOwnedCategory(tenant.id, request.params.id)
    const data = readCategoryInput(request.body, { partial: true })

    if (Object.prototype.hasOwnProperty.call(data, 'image')) {
      data.image = await saveImage(data.image, 'Görsel')
    }

    const category = await prisma.category.update({
      where: { id: current.id },
      data,
    })

    if (Object.prototype.hasOwnProperty.call(data, 'image')) {
      await replaceImage(current.image, data.image)
    }

    await createNotification(tenant.id, 'Kategori güncellendi', `${category.name} kaydedildi.`)

    return toPublicCategory(category)
  })

  app.delete('/api/categories/:id', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const current = await findOwnedCategory(tenant.id, request.params.id)
    const productCount = await prisma.product.count({
      where: { tenantId: tenant.id, categoryId: current.id },
    })

    if (productCount > 0) {
      throw fail(
        409,
        `${current.name} kategorisinde ${productCount} ürün var. Silmeden önce ürünleri başka bir kategoriye taşıyın.`,
      )
    }

    try {
      await prisma.category.delete({ where: { id: current.id } })
    } catch (error) {
      if (error.code === 'P2003') {
        throw fail(
          409,
          `${current.name} kategorisinde ürün var. Silmeden önce ürünleri başka bir kategoriye taşıyın.`,
        )
      }

      throw error
    }
    await removeImage(current.image)
    await createNotification(tenant.id, 'Kategori silindi', `${current.name} menüden kaldırıldı.`)
    return { ok: true }
  })
}
