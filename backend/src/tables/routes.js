import { prisma } from '../db.js'
import { fail } from '../http.js'
import { clampPage, pageResult, readPage } from '../paging.js'
import { requireTenant, requireUser } from '../auth/session.js'
import { createNotification } from '../notifications/notifications.js'
import { readTableInput, saveTable, toPublicTable } from './tables.js'

async function ownedTable(tenantId, id) {
  const table = await prisma.diningTable.findFirst({
    where: { id: String(id || ''), tenantId },
  })

  if (!table) {
    throw fail(404, 'Masa bulunamadı.')
  }

  return table
}

async function listTables(tenant, query) {
  const requested = readPage(query)
  const total = await prisma.diningTable.count({ where: { tenantId: tenant.id } })
  const page = clampPage(requested.page, total, requested.pageSize)
  const skip = (page - 1) * requested.pageSize
  const idRows = await prisma.$queryRaw`
    SELECT "id"
    FROM "DiningTable"
    WHERE "tenantId" = ${tenant.id}
    ORDER BY
      CASE WHEN "tableNumber" ~ '^[0-9]{1,15}$' THEN 0 ELSE 1 END,
      CASE WHEN "tableNumber" ~ '^[0-9]{1,15}$' THEN "tableNumber"::bigint ELSE NULL END,
      "tableNumber",
      "name",
      "id"
    OFFSET ${skip}
    LIMIT ${requested.pageSize}
  `
  const ids = idRows.map((row) => row.id)
  const tables = ids.length
    ? await prisma.diningTable.findMany({ where: { id: { in: ids } } })
    : []
  const order = new Map(ids.map((id, index) => [id, index]))
  tables.sort((left, right) => order.get(left.id) - order.get(right.id))

  return pageResult(
    tables.map((table) => toPublicTable(table, tenant.slug)),
    total,
    page,
    requested.pageSize,
  )
}

export async function tableRoutes(app) {
  app.get('/api/tables', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    return listTables(tenant, request.query)
  })

  app.get('/api/tables/:id', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const table = await ownedTable(tenant.id, request.params.id)
    return toPublicTable(table, tenant.slug)
  })

  app.post('/api/tables', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const table = await saveTable(tenant.id, readTableInput(request.body))
    await createNotification(tenant.id, 'Masa eklendi', `${table.name} eklendi.`)
    return toPublicTable(table, tenant.slug)
  })

  app.patch('/api/tables/:id', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const current = await ownedTable(tenant.id, request.params.id)
    const data = readTableInput(request.body, { partial: true })
    const table = await saveTable(tenant.id, data, current.id)

    await createNotification(tenant.id, 'Masa güncellendi', `${table.name} kaydedildi.`)
    return toPublicTable(table, tenant.slug)
  })

  app.delete('/api/tables/:id', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const table = await ownedTable(tenant.id, request.params.id)
    await prisma.diningTable.delete({ where: { id: table.id } })
    await createNotification(tenant.id, 'Masa silindi', `${table.name} kaldırıldı.`)
    return { ok: true }
  })
}
