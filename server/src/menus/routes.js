import { recordMenuView, recordProductView } from '../analytics/report.js'
import { prisma } from '../db.js'
import { fail } from '../http.js'
import { toPublicProduct } from '../products/products.js'
import { ensureMenuSettings, toPublicSettings } from '../menuSettings/settings.js'

function groupProducts(categories, products) {
  const groups = new Map(
    categories
      .filter((category) => category.isActive)
      .map((category) => [
        category.id,
        {
          id: category.id,
          name: category.name,
          sortOrder: category.sortOrder,
          products: [],
        },
      ]),
  )
  const other = {
    id: 'uncategorized',
    name: 'Diğer',
    sortOrder: 999,
    products: [],
  }

  products.forEach((product) => {
    const group = groups.get(product.categoryId)

    if (group) {
      group.products.push(toPublicProduct(product))
      return
    }

    other.products.push(toPublicProduct(product))
  })

  const visible = [...groups.values()].filter((category) => category.products.length)

  if (other.products.length) {
    visible.push(other)
  }

  return visible.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'tr'))
}

async function publicTenant(slug) {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: String(slug || '').trim() },
    select: { id: true },
  })

  if (!tenant) {
    throw fail(404, 'Menü bulunamadı.')
  }

  return tenant
}

export async function menuRoutes(app) {
  app.post('/api/public/menus/:slug/views', async (request) => {
    const tenant = await publicTenant(request.params.slug)
    return recordMenuView(tenant.id, request.body?.language, request.body?.tableId)
  })

  app.post('/api/public/menus/:slug/products/:productId/views', async (request) => {
    const tenant = await publicTenant(request.params.slug)
    return recordProductView(tenant.id, request.params.productId)
  })

  app.get('/api/public/menus/:slug', async (request) => {
    const slug = String(request.params.slug || '').trim()
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: {
        user: true,
        menuSettings: true,
        categories: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
        products: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    })

    if (!tenant) {
      throw fail(404, 'Menü bulunamadı.')
    }

    const settings = tenant.menuSettings || (await ensureMenuSettings(tenant))
    const tableId = String(request.query?.table || '').trim()
    const table = tableId
      ? await prisma.diningTable.findFirst({
          where: { id: tableId, tenantId: tenant.id },
          select: { id: true, name: true, tableNumber: true },
        })
      : null

    return {
      restaurant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        logo: null,
        description: '',
        hours: '',
        phone: tenant.user?.phone || '',
        address: '',
        mapsUrl: '',
        socials: [],
      },
      settings: toPublicSettings(settings, tenant),
      table,
      categories: groupProducts(tenant.categories, tenant.products),
    }
  })
}
