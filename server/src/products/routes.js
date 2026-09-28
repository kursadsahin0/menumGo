import { prisma } from '../db.js'
import { fail } from '../http.js'
import { newId } from '../auth/users.js'
import { requireTenant, requireUser } from '../auth/session.js'
import { assertDiscount, readProductInput, toPublicProduct } from './products.js'

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
      { description: { contains: search, mode: 'insensitive' } },
    ]
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
    const products = await prisma.product.findMany({
      where: listWhere(tenant.id, request.query || {}),
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })

    return products.map(toPublicProduct)
  })

  app.get('/api/products/:id', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const product = await findOwnedProduct(tenant.id, request.params.id)
    return toPublicProduct(product)
  })

  app.post('/api/products', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const data = readProductInput(request.body)
    assertDiscount(data.price, data.discountedPrice)

    const product = await prisma.product.create({
      data: {
        id: newId('prd'),
        tenantId: tenant.id,
        ...data,
      },
    })

    return toPublicProduct(product)
  })

  app.patch('/api/products/:id', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const current = await findOwnedProduct(tenant.id, request.params.id)
    const data = readProductInput(request.body, { partial: true })
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

    return toPublicProduct(product)
  })

  app.delete('/api/products/:id', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const current = await findOwnedProduct(tenant.id, request.params.id)

    await prisma.product.delete({ where: { id: current.id } })
    return { ok: true }
  })
}
