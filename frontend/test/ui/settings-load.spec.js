import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import BusinessSettingsPage from '@/pages/admin/BusinessSettingsPage.vue'
import MenuSettingsPage from '@/pages/admin/MenuSettingsPage.vue'
import { getBusiness } from '@/services/businessService'
import { getMenuSettings } from '@/services/menuSettingsService'
import { ApiError } from '@/utils/errors'
import { mountPage } from './mount.js'

vi.mock('@/services/businessService', () => ({
  getBusiness: vi.fn(),
  updateBusiness: vi.fn(),
}))

vi.mock('@/services/menuSettingsService', () => ({
  getMenuSettings: vi.fn(),
  updateMenuSettings: vi.fn(),
}))

vi.mock('@/services/menuService', () => ({
  getPublicMenu: vi.fn(async () => ({ categories: [] })),
  recordMenuView: vi.fn(),
  recordProductView: vi.fn(),
  requestWaiter: vi.fn(),
  getWifi: vi.fn(),
}))

const offline = new ApiError('Network Error', { status: 0 })

describe('ayar ekranları', () => {
  beforeEach(() => {
    getBusiness.mockReset()
    getMenuSettings.mockReset()
  })

  it('işletme bilgisi gelmezse iskelet yerine yeniden deneme gösterir', async () => {
    getBusiness.mockRejectedValueOnce(offline).mockResolvedValueOnce({
      name: 'Demo Kafe',
      businessType: 'cafe',
      description: '',
      descriptionEn: '',
    })

    const { wrapper } = await mountPage(BusinessSettingsPage, {
      path: '/admin/business',
      name: 'admin-business',
      layout: true,
    })

    expect(wrapper.text()).toContain('Bağlantı kurulamadı')
    expect(wrapper.text()).toContain('Yeniden dene')
    expect(wrapper.find('.admin-skeleton').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Kaydet')

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('İşletme bilgileri')
    expect(wrapper.text()).toContain('Kaydet')
    expect(wrapper.text()).not.toContain('Yeniden dene')
  })

  it('menü ayarları gelmezse iskelet yerine yeniden deneme gösterir', async () => {
    getBusiness.mockResolvedValue({ name: 'Demo Kafe' })
    getMenuSettings.mockRejectedValueOnce(offline).mockResolvedValueOnce({})

    const { wrapper } = await mountPage(MenuSettingsPage, {
      path: '/admin/menu-settings',
      name: 'admin-menu-settings',
      layout: true,
    })

    expect(wrapper.text()).toContain('Bağlantı kurulamadı')
    expect(wrapper.text()).toContain('Yeniden dene')
    expect(wrapper.find('.admin-skeleton').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Menü teması')

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Menü teması')
    expect(wrapper.text()).toContain('Kaydet')
    expect(wrapper.text()).not.toContain('Yeniden dene')
  })
})
