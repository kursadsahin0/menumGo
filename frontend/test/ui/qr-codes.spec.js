import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import QrCodesPage from '@/pages/admin/QrCodesPage.vue'
import { getBusiness } from '@/services/businessService'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/utils/errors'
import { mountPage } from './mount.js'

vi.mock('@/services/businessService', () => ({
  getBusiness: vi.fn(),
  updateBusiness: vi.fn(),
}))

describe('QR ekranı', () => {
  beforeEach(() => {
    getBusiness.mockReset()
  })

  it('işletme bilgisi gelmezse hata ve yeniden deneme gösterir', async () => {
    getBusiness
      .mockRejectedValueOnce(new ApiError('Network Error', { status: 0 }))
      .mockResolvedValueOnce({ name: 'Demo Kafe' })

    const { wrapper, pinia } = await mountPage(QrCodesPage, {
      path: '/admin/qr-codes',
      name: 'admin-qr',
      layout: true,
      routes: [{ path: '/admin/tables', name: 'admin-tables', component: { template: '<div />' } }],
    })
    const auth = useAuthStore(pinia)
    auth.user = { tenant: { name: 'Eski ad', slug: 'burger-house' } }

    expect(wrapper.text()).toContain('Bağlantı kurulamadı')
    expect(wrapper.text()).toContain('Yeniden dene')
    expect(wrapper.text()).not.toContain('Kopyala')

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Demo Kafe')
    expect(wrapper.text()).toContain('Kopyala')
    expect(wrapper.text()).not.toContain('Eski ad')
  })
})
