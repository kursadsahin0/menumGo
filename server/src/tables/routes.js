import { prisma } from '../db.js'
import { fail } from '../http.js'
import { requireTenant, requireUser } from '../auth/session.js'
import { createNotification } from '../notifications/notifications.js'
import { assertTableRoom, readTableInput, saveTable, sortTables, toPublicTable } from './tables.js'

async function ownedTable(tenantId, id) {
  const table = await prisma.diningTable.findFirst({
    where: { id: String(id || ''), tenantId },
  })

  if (!table) {
    throw fail(404, 'Masa bulunamadı.')
  }

  return table
}

async function listTables(tenant) {
  const tables = await prisma.diningTable.findMany({ where: { tenantId: tenant.id } })
  return sortTables(tables).map((table) => toPublicTable(table, tenant.slug))
}

export async function tableRoutes(app) {
  app.get('/api/tables', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    return listTables(tenant)
  })

  app.get('/api/tables/:id', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const table = await ownedTable(tenant.id, request.params.id)
    return toPublicTable(table, tenant.slug)
  })

  app.post('/api/tables', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    await assertTableRoom(tenant.id, tenant.subscription?.planId)
    const table = await saveTable(tenant.id, readTableInput(request.body))
    await createNotification(tenant.id, `${table.name} eklendi`)
    return toPublicTable(table, tenant.slug)
  })

  app.patch('/api/tables/:id', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const current = await ownedTable(tenant.id, request.params.id)
    const data = readTableInput(request.body, { partial: true })
    const table = await saveTable(tenant.id, data, current.id)

    await createNotification(tenant.id, `${table.name} güncellendi`)
    return toPublicTable(table, tenant.slug)
  })

  app.delete('/api/tables/:id', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const table = await ownedTable(tenant.id, request.params.id)
    await prisma.diningTable.delete({ where: { id: table.id } })
    await createNotification(tenant.id, `${table.name} silindi`)
    return { ok: true }
  })
}
