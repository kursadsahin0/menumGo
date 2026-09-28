import { prisma } from '../db.js'
import { requireTenant, requireUser } from '../auth/session.js'
import { ensureMenuSettings, readMenuSettings, toPublicSettings } from './settings.js'

export async function menuSettingsRoutes(app) {
  app.get('/api/menu-settings', async (request) => {
    const user = await requireUser(request)
    const tenant = requireTenant(user)
    const settings = await ensureMenuSettings({ ...tenant, user })
    return toPublicSettings(settings, { ...tenant, user })
  })

  app.put('/api/menu-settings', async (request) => {
    const user = await requireUser(request)
    const tenant = requireTenant(user)
    const current = await ensureMenuSettings({ ...tenant, user })
    const data = readMenuSettings(request.body)

    const settings = await prisma.menuSettings.update({
      where: { id: current.id },
      data,
    })

    return toPublicSettings(settings, { ...tenant, user })
  })
}
