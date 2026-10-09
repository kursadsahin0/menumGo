import { prisma } from '../db.js'
import { requireTenant, requireUser } from '../auth/session.js'
import { ensureMenuSettings, readMenuSettings, toPublicSettings } from './settings.js'
import { sealWifiPassword } from './wifi.js'

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
      data: {
        phone: data.phone,
        addressTr: data.addressTr,
        addressEn: data.addressEn,
        website: data.website,
        instagram: data.instagram,
        wifiName: data.wifiName,
        wifiPassword: sealWifiPassword(data.wifiPassword),
        hoursTr: data.hoursTr,
        hoursEn: data.hoursEn,
        theme: data.theme,
        primaryColor: data.primaryColor,
        secondaryColor: data.secondaryColor,
        font: data.font,
        cardStyle: data.cardStyle,
        logoPosition: data.logoPosition,
        showDescriptions: data.showDescriptions,
        showProductImages: data.showProductImages,
        showPrices: data.showPrices,
      },
    })

    return toPublicSettings(settings, { ...tenant, user })
  })
}
