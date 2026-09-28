import { prisma } from '../db.js'
import { fail } from '../http.js'
import { categoryFor } from './catalog.js'
import { toPublicProduct } from '../products/products.js'

function groupProducts(products) {
  const groups = new Map()

  products.forEach((product) => {
    const category = categoryFor(product.categoryId)
    const current = groups.get(category.id) || {
      id: category.id,
      name: category.name,
      sortOrder: category.sortOrder,
      products: [],
    }

    current.products.push(toPublicProduct(product))
    groups.set(category.id, current)
  })

  return [...groups.values()].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'tr'),
  )
}

export async function menuRoutes(app) {
  app.get('/api/public/menus/:slug', async (request) => {
    const slug = String(request.params.slug || '').trim()
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: {
        user: true,
        products: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    })

    if (!tenant) {
      throw fail(404, 'Menü bulunamadı.')
    }

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
      categories: groupProducts(tenant.products),
    }
  })
}
