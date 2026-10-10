import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import BillingPage from '@/pages/admin/BillingPage.vue'
import { getCurrentSubscription } from '@/services/subscriptionService'
import { persistSession } from '@/utils/storage'
import { ApiError } from '@/utils/errors'
import { mountPage } from './mount.js'

vi.mock('@/services/subscriptionService', () => ({
  getCurrentSubscription: vi.fn(),
}))

const user = {
  fullName: 'Demo Kullanıcı',
  email: 'demo@qrmenu.local',
  phone: '05551234567',
  emailVerified: true,
  tenant: { name: 'Demo Kafe', slug: 'burger-house' },
  subscription: { status: 'inactive' },
}

const routes = [
  { path: '/admin', name: 'admin-dashboard', component: { template: '<div>Panel</div>' } },
  { path: '/auth/login', name: 'login', component: { template: '<div>Giriş</div>' } },
]

async function openBilling(subscription = { status: 'inactive' }) {
  persistSession({ ...user, subscription }, true)
  return mountPage(BillingPage, {
    path: '/admin/billing',
    name: 'admin-billing',
    layout: true,
    routes,
  })
}

describe('iletişim ekranı', () => {
  let wrapper

  beforeEach(() => {
    getCurrentSubscription.mockReset()
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = undefined
  })

  it('kart formu yerine aranacak numarayı gösterir', async () => {
    getCurrentSubscription.mockResolvedValue({ status: 'inactive' })
    const mounted = await openBilling()
    wrapper = mounted.wrapper

    expect(wrapper.text()).toContain('Tek seferlik panel')
    expect(wrapper.text()).toContain('Deneme süreniz bitti')
    expect(wrapper.text()).toContain('Satın almak için arayın')
    expect(wrapper.text()).toContain('0555 123 45 67')
    expect(wrapper.text()).not.toContain('Kart numarası')
    expect(wrapper.find('input').exists()).toBe(false)
    expect(wrapper.get('a[href="tel:+905551234567"]').exists()).toBe(true)
    expect(mounted.router.currentRoute.value.name).toBe('admin-billing')
  })

  it('deneme sürerken panele dönmeyi bırakır', async () => {
    getCurrentSubscription.mockResolvedValue({
      status: 'trial',
      trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    })
    const mounted = await openBilling()
    wrapper = mounted.wrapper

    expect(wrapper.text()).toContain('Denemeniz sürüyor')
    expect(wrapper.text()).toContain('gün kaldı')
    expect(wrapper.text()).toContain('Panele dön')
    expect(mounted.router.currentRoute.value.name).toBe('admin-billing')
  })

  it('ödenmiş hesap iletişim ekranında kalır', async () => {
    getCurrentSubscription.mockResolvedValue({ status: 'active', plan: 'Tek seferlik panel' })
    const mounted = await openBilling({ status: 'active' })
    wrapper = mounted.wrapper

    expect(wrapper.text()).toContain('Paneliniz açık')
    expect(wrapper.text()).toContain('Bize ulaşın')
    expect(wrapper.text()).toContain('0555 123 45 67')
    expect(wrapper.text()).not.toContain('Deneme süreniz bitti')
    expect(mounted.router.currentRoute.value.name).toBe('admin-billing')
  })

  it('ödeme tamamlanınca panele geçer', async () => {
    getCurrentSubscription.mockResolvedValue({ status: 'active', plan: 'Tek seferlik panel' })
    const mounted = await openBilling()
    wrapper = mounted.wrapper

    expect(mounted.router.currentRoute.value.name).toBe('admin-dashboard')
  })

  it('oturum düşünce girişe döner', async () => {
    getCurrentSubscription.mockRejectedValue(new ApiError('Oturum yok', { status: 401 }))
    const mounted = await openBilling()
    wrapper = mounted.wrapper

    expect(mounted.router.currentRoute.value.name).toBe('login')
    expect(localStorage.getItem('qr_menu.token')).toBeNull()
  })
})
