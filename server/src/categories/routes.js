import { prisma } from '../db.js'
import { fail } from '../http.js'
import { newId } from '../auth/users.js'
import { requireTenant, requireUser } from '../auth/session.js'
import { readCategoryInput, toPublicCategory } from './categories.js'

async function listCategories(tenantId) {
  const categories = await prisma.category.findMany({
    where: { tenantId },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  return categories.map(toPublicCategory)
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
    return listCategories(tenant.id)
  })

  app.patch('/api/categories/order', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const ids = Array.isArray(request.body?.ids) ? request.body.ids.map((id) => String(id)) : []
    const categories = await prisma.category.findMany({ where: { tenantId: tenant.id } })
    const byId = new Map(categories.map((category) => [category.id, category]))
    const ordered = []
    const seen = new Set()

    ids.forEach((id) => {
      const category = byId.get(id)

      if (!category || seen.has(id)) {
        return
      }

      seen.add(id)
      ordered.push(category)
    })

    categories
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'tr'))
      .forEach((category) => {
        if (!seen.has(category.id)) {
          ordered.push(category)
        }
      })

    await prisma.$transaction(
      ordered.map((category, index) =>
        prisma.category.update({
          where: { id: category.id },
          data: { sortOrder: index + 1 },
        }),
      ),
    )

    return listCategories(tenant.id)
  })

  app.get('/api/categories/:id', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const category = await findOwnedCategory(tenant.id, request.params.id)
    return toPublicCategory(category)
  })

  app.post('/api/categories', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const data = readCategoryInput(request.body)
    const count = await prisma.category.count({ where: { tenantId: tenant.id } })

    const category = await prisma.category.create({
      data: {
        id: newId('cat'),
        tenantId: tenant.id,
        ...data,
        sortOrder: Object.prototype.hasOwnProperty.call(data, 'sortOrder') ? data.sortOrder : count + 1,
      },
    })

    return toPublicCategory(category)
  })

  app.patch('/api/categories/:id', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const current = await findOwnedCategory(tenant.id, request.params.id)
    const data = readCategoryInput(request.body, { partial: true })

    const category = await prisma.category.update({
      where: { id: current.id },
      data,
    })

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

    await prisma.category.delete({ where: { id: current.id } })
    return { ok: true }
  })
}
