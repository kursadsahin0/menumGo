import { prisma } from '../db.js'
import { fail } from '../http.js'
import { requireTenant, requireUser } from '../auth/session.js'
import { readBusiness, toPublicBusiness } from './business.js'
import { ensureMenuSettings } from '../menuSettings/settings.js'
import { replaceImage, saveImage } from '../images/files.js'

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
    const tenant = await loadTenant(request)
    const settings = await ensureMenuSettings(tenant)
    return toPublicBusiness(tenant, settings)
  })

  app.put('/api/business', async (request) => {
    const tenant = await loadTenant(request)
    const menu = await ensureMenuSettings(tenant)
    const data = readBusiness(request.body)
    data.logo = await saveImage(data.logo, 'Logo')
    data.coverImage = await saveImage(data.coverImage, 'Kapak')

    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        name: data.name,
        businessType: data.businessType,
        description: data.description,
        logo: data.logo,
        coverImage: data.coverImage,
      },
    })

    await replaceImage(tenant.logo, data.logo)
    await replaceImage(tenant.coverImage, data.coverImage)

    const settings = await prisma.menuSettings.update({
      where: { id: menu.id },
      data: {
        name: data.name,
        descriptionTr: data.description,
        descriptionEn: data.descriptionEn,
        logo: data.logo,
      },
    })

    if (menu.logo && menu.logo !== tenant.logo) {
      await replaceImage(menu.logo, data.logo)
    }

    return toPublicBusiness(updated, settings)
  })
}
