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

export async function menuRoutes(app) {
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
      categories: groupProducts(tenant.categories, tenant.products),
    }
  })
}
