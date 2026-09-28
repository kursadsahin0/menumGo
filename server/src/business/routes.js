import { prisma } from '../db.js'
import { fail } from '../http.js'
import { requireTenant, requireUser } from '../auth/session.js'
import { readBusiness, toPublicBusiness } from './business.js'

async function loadTenant(request) {
  const sessionTenant = requireTenant(await requireUser(request))
  const tenant = await prisma.tenant.findUnique({ where: { id: sessionTenant.id } })

  if (!tenant) {
    throw fail(404, 'İşletme kaydı bulunamadı.')
  }

  return tenant
}

export async function businessRoutes(app) {
  app.get('/api/business', async (request) => {
    return toPublicBusiness(await loadTenant(request))
  })

  app.put('/api/business', async (request) => {
    const tenant = await loadTenant(request)
    const data = readBusiness(request.body)

    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data,
    })

    await prisma.menuSettings.updateMany({
      where: { tenantId: tenant.id },
      data: { name: data.name },
    })

    return toPublicBusiness(updated)
  })
}
