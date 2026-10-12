import { requireTenant, requireUser } from '../auth/session.js'
import {
  addCheckItem,
  closeCheck,
  findOwnedCheck,
  listChecks,
  openCheck,
  removeCheckItem,
  toPublicCheck,
  updateCheckItem,
} from './checks.js'

export async function checkRoutes(app) {
  app.get('/api/checks', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    const status = String(request.query?.status || '').trim() || undefined
    return listChecks(tenant.id, { status })
  })

  app.get('/api/checks/:id', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    return toPublicCheck(await findOwnedCheck(tenant.id, request.params.id))
  })

  app.post('/api/checks', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    return openCheck(tenant.id, request.body?.tableId)
  })

  app.post('/api/checks/:id/items', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    return addCheckItem(tenant.id, request.params.id, request.body)
  })

  app.patch('/api/checks/:id/items/:itemId', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    return updateCheckItem(tenant.id, request.params.id, request.params.itemId, request.body)
  })

  app.delete('/api/checks/:id/items/:itemId', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    return removeCheckItem(tenant.id, request.params.id, request.params.itemId)
  })

  app.post('/api/checks/:id/close', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    return closeCheck(tenant.id, request.params.id)
  })
}
