import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage.vue'
import RegisterPage from '@/pages/auth/RegisterPage.vue'
import { register } from '@/services/auth.service'
import { mountPage } from './mount.js'

const push = vi.fn()

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({ push }),
  }
})

vi.mock('@/services/auth.service', () => ({
  register: vi.fn(async () => ({
    user: {
      id: 'usr_1',
      email: 'ada@example.com',
      emailVerified: true,
      subscription: { status: 'trial', trialEndsAt: new Date(Date.now() + 86400000).toISOString() },
    },
  })),
  fetchCurrentUser: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  verifyEmail: vi.fn(),
  sendVerification: vi.fn(),
  updateAccount: vi.fn(),
  updateSlug: vi.fn(),
  deleteAccount: vi.fn(),
  changePassword: vi.fn(),
}))

describe('kayıt onayı', () => {
  it('koşul, gizlilik ve KVKK metinlerine bağlanır', async () => {
    const { wrapper } = await mountPage(RegisterPage, {
      path: '/auth/register',
      name: 'register',
      routes: [
        { path: '/kullanim-kosullari', name: 'terms', component: { template: '<div />' } },
        { path: '/gizlilik', name: 'privacy', component: { template: '<div />' } },
        { path: '/kvkk', name: 'kvkk', component: { template: '<div />' } },
        { path: '/auth/login', name: 'login', component: { template: '<div />' } },
      ],
    })

    expect(wrapper.get('a[href="/kullanim-kosullari"]').text()).toBe('Kullanım koşullarını')
    expect(wrapper.get('a[href="/gizlilik"]').text()).toBe('gizlilik bildirimini')
    expect(wrapper.get('a[href="/kvkk"]').text()).toBe('KVKK aydınlatma metnini')
    expect(wrapper.text()).toContain('okudum, kabul ediyorum')
    expect(wrapper.text()).toContain('7 gün')
  })

  it('kayıttan sonra panele yönlendirir', async () => {
    push.mockClear()

    const { wrapper } = await mountPage(RegisterPage, {
      path: '/auth/register',
      name: 'register',
      routes: [
        { path: '/kullanim-kosullari', name: 'terms', component: { template: '<div />' } },
        { path: '/gizlilik', name: 'privacy', component: { template: '<div />' } },
        { path: '/kvkk', name: 'kvkk', component: { template: '<div />' } },
        { path: '/auth/login', name: 'login', component: { template: '<div />' } },
        { path: '/admin', name: 'admin-dashboard', component: { template: '<div />' } },
      ],
    })

    const fields = wrapper.findAll('input')
    await fields[0].setValue('Ada Deniz')
    await fields[1].setValue('Deniz Kafe')
    await fields[2].setValue('ada@example.com')
    await fields[3].setValue('05551234567')
    await fields[4].setValue('guvenli-sifre')
    await fields[5].setValue('guvenli-sifre')
    await wrapper.findComponent({ name: 'QCheckbox' }).setValue(true)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(register).toHaveBeenCalled()
    expect(push).toHaveBeenCalledWith({ name: 'admin-dashboard' })
    expect(wrapper.text()).not.toContain('Hesap oluşturuldu')
  })

  it('şifre sıfırlama onayında istenmeyen klasörünü söyler', async () => {
    const { wrapper } = await mountPage(ForgotPasswordPage, {
      path: '/auth/forgot-password',
      name: 'forgot-password',
      routes: [{ path: '/auth/login', name: 'login', component: { template: '<div />' } }],
    })

    await wrapper.find('input').setValue('ada@example.com')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Bu e-posta kayıtlıysa sıfırlama bağlantısını gönderdik')
    expect(wrapper.text()).toContain('istenmeyen klasörünü')
  })
})
