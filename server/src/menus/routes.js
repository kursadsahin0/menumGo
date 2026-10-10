import { recordMenuView, recordProductView } from '../analytics/report.js'
import { limitMenuReads, limitViewWrites, limitWaiterCalls, limitWifiReads } from '../rateLimit.js'
import { prisma } from '../db.js'
import { fail } from '../http.js'
import { createNotification } from '../notifications/notifications.js'
import { toPublicProduct } from '../products/products.js'
import { ensureMenuSettings, toPublicSettings } from '../menuSettings/settings.js'
import { openWifiPassword } from '../menuSettings/wifi.js'
import { opensPanel } from '../subscription/record.js'
import { findActiveTable } from '../tables/tables.js'

function groupProducts(categories, products) {
  const groups = new Map(
    categories
      .filter((category) => category.isActive)
      .map((category) => [
        category.id,
        {
          id: category.id,
          name: { tr: category.name || '', en: category.nameEn || '' },
          description: { tr: category.description || '', en: category.descriptionEn || '' },
          image: category.image || null,
          sortOrder: category.sortOrder,
          products: [],
        },
      ]),
  )
  const other = {
    id: 'uncategorized',
    name: { tr: 'Diğer', en: 'Other' },
    description: { tr: '', en: '' },
    image: null,
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

  return visible.sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.tr.localeCompare(b.name.tr, 'tr'),
  )
}

function assertPublished(tenant) {
  if (!opensPanel(tenant?.subscription)) {
    throw fail(404, 'Menü bulunamadı.')
  }
}

async function publicTenant(slug) {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: String(slug || '').trim() },
    select: {
      id: true,
      subscription: { select: { status: true, currentPeriodEnd: true } },
    },
  })

  assertPublished(tenant)
  return tenant
}

export async function menuRoutes(app) {
  app.post(
    '/api/public/menus/:slug/wifi',
    { preHandler: limitWifiReads },
    async (request) => {
      const tenant = await publicTenant(request.params.slug)
      const table = await findActiveTable(tenant.id, request.body?.tableId, { id: true })

      if (!table) {
        throw fail(404, 'Menü bulunamadı.')
      }

      const settings = await prisma.menuSettings.findUnique({
        where: { tenantId: tenant.id },
        select: { wifiName: true, wifiPassword: true },
      })

      return {
        name: settings?.wifiName || '',
        password: openWifiPassword(settings?.wifiPassword || ''),
      }
    },
  )

  app.post(
    '/api/public/menus/:slug/views',
    { preHandler: limitViewWrites },
    async (request) => {
      const tenant = await publicTenant(request.params.slug)
      return recordMenuView(tenant.id, request.body?.language, request.body?.tableId)
    },
  )

  app.post(
    '/api/public/menus/:slug/waiter',
    { preHandler: limitWaiterCalls },
    async (request) => {
      const tenant = await publicTenant(request.params.slug)
      const tableId = String(request.body?.tableId || '').trim()
      const table = await findActiveTable(tenant.id, tableId, { name: true })

      if (tableId && !table) {
        throw fail(404, 'Menü bulunamadı.')
      }

      const title = 'Garson çağrıldı'
      const body = table?.name
        ? `${table.name} masasından garson istendi.`
        : 'Salondan garson istendi.'
      const recent = await prisma.notification.findFirst({
        where: {
          tenantId: tenant.id,
          title,
          body,
          createdAt: { gte: new Date(Date.now() - 45_000) },
        },
      })

      if (!recent) {
        await createNotification(tenant.id, title, body)
      }

      return { ok: true }
    },
  )

  app.post(
    '/api/public/menus/:slug/products/:productId/views',
    { preHandler: limitViewWrites },
    async (request) => {
      const tenant = await publicTenant(request.params.slug)
      return recordProductView(tenant.id, request.params.productId)
    },
  )

  app.get('/api/public/menus/:slug', { preHandler: limitMenuReads }, async (request) => {
    const slug = String(request.params.slug || '').trim()
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: {
        user: true,
        subscription: { select: { status: true, currentPeriodEnd: true } },
        menuSettings: true,
        categories: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
        products: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        },
      },
    })

    assertPublished(tenant)

    const settings = tenant.menuSettings || (await ensureMenuSettings(tenant))
    const tableId = String(request.query?.table || '').trim()
    const table = await findActiveTable(tenant.id, tableId, {
      id: true,
      name: true,
      tableNumber: true,
    })

    if (tableId && !table) {
      throw fail(404, 'Menü bulunamadı.')
    }

    return {
      restaurant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        logo: tenant.logo || null,
        coverImage: tenant.coverImage || null,
        description: {
          tr: tenant.description || settings.descriptionTr || '',
          en: settings.descriptionEn || '',
        },
        hours: '',
        phone: tenant.user?.phone || '',
        address: '',
        mapsUrl: '',
        socials: [],
      },
      settings: toPublicSettings(settings, tenant, {
        includeWifiPassword: false,
        includeWifi: Boolean(table),
      }),
      table,
      categories: groupProducts(tenant.categories, tenant.products),
    }
  })
}
