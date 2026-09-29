import { requireTenant, requireUser } from '../auth/session.js'
import { dashboardOverview, readPeriod, statsReport } from './report.js'

export async function analyticsRoutes(app) {
  app.get('/api/dashboard', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    return dashboardOverview(tenant.id)
  })

  app.get('/api/stats', async (request) => {
    const tenant = requireTenant(await requireUser(request))
    return statsReport(tenant.id, readPeriod(request.query?.period))
  })
}
