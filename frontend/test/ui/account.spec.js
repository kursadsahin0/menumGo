import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { QLayout, QPageContainer } from 'quasar'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import SettingsPage from '@/pages/admin/SettingsPage.vue'
import {
  changePassword,
  deleteAccount,
  updateAccount,
  updateSlug,
} from '@/services/auth.service'
import { persistSession } from '@/utils/storage'
import { mountPage } from './mount.js'

vi.mock('@/services/auth.service', () => ({
  changePassword: vi.fn(),
  fetchCurrentUser: vi.fn(),
  forgotPassword: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  resetPassword: vi.fn(),
  sendVerification: vi.fn(),
  updateAccount: vi.fn(),
  updateSlug: vi.fn(),
  verifyEmail: vi.fn(),
  deleteAccount: vi.fn(),
}))

vi.mock('@/utils/waiterPush', () => ({
  disableWaiterPush: vi.fn(async () => {}),
}))

const user = {
  fullName: 'Demo Kullanıcı',
  email: 'demo@qrmenu.local',
  phone: '05551234567',
  emailVerified: true,
  tenant: { name: 'Demo Kafe', slug: 'burger-house' },
  subscription: { status: 'active' },
}

function savedUser(patch) {
  return {
    ...user,
    ...patch,
    tenant: { ...user.tenant, ...(patch.tenant || {}) },
  }
}

async function openAccount() {
  persistSession(user, true)
  return mountPage(SettingsPage, {
    path: '/admin/settings',
    name: 'admin-profile',
    layout: true,
    routes: [
      { path: '/auth/login', name: 'login', component: { template: '<div>Giriş</div>' } },
      { path: '/auth/verify', name: 'verify-pending', component: { template: '<div>Doğrula</div>' } },
    ],
  })
}

function button(wrapper, label) {
  return wrapper.findAll('button').find((node) => node.text().trim() === label)
}

describe('hesap akışı', () => {
  beforeEach(() => {
    updateAccount.mockReset()
    updateSlug.mockReset()
    changePassword.mockReset()
    deleteAccount.mockReset()
  })

  it('ad değişince hesabı kaydeder', async () => {
    updateAccount.mockImplementation(async (payload) => savedUser(payload))
    const { wrapper } = await openAccount()

    expect(wrapper.text()).toContain('Demo Kullanıcı')
    expect(wrapper.text()).toContain('demo@qrmenu.local')

    await wrapper.findAll('input')[0].setValue('Yeni Ad')
    await wrapper.findAll('form')[0].trigger('submit')
    await flushPromises()

    expect(updateAccount).toHaveBeenCalledWith({
      fullName: 'Yeni Ad',
      email: 'demo@qrmenu.local',
      phone: '05551234567',
    })
    expect(wrapper.text()).toContain('Yeni Ad')
    expect(document.body.textContent).toContain('Hesap kaydedildi.')
  })

  it('menü adresini kaydeder', async () => {
    updateSlug.mockImplementation(async ({ slug }) => savedUser({ tenant: { slug } }))
    const { wrapper } = await openAccount()

    await wrapper.findAll('input')[3].setValue('yeni-kafe')
    await wrapper.findAll('form')[1].trigger('submit')
    await flushPromises()

    expect(updateSlug).toHaveBeenCalledWith({ slug: 'yeni-kafe' })
    expect(document.body.textContent).toContain('Menü adresi kaydedildi.')
  })

  it('şifreyi günceller', async () => {
    changePassword.mockResolvedValue({ ok: true })
    const { wrapper } = await openAccount()
    const fields = wrapper.findAll('input')

    await fields[4].setValue('eski-sifre')
    await fields[5].setValue('yeni-sifre')
    await fields[6].setValue('yeni-sifre')
    await wrapper.findAll('form')[2].trigger('submit')
    await flushPromises()

    expect(changePassword).toHaveBeenCalledWith({
      currentPassword: 'eski-sifre',
      password: 'yeni-sifre',
    })
    expect(document.body.textContent).toContain('Şifre güncellendi.')
  })

  it('şifreyle hesabı siler ve girişe döner', async () => {
    deleteAccount.mockResolvedValue({ ok: true })
    const { wrapper, router } = await openAccount()

    await button(wrapper, 'Hesabı sil').trigger('click')
    await flushPromises()

    const password = document.querySelector('.account-delete input')
    password.value = 'demo1234'
    password.dispatchEvent(new Event('input', { bubbles: true }))
    await flushPromises()

    const confirm = [...document.querySelectorAll('.account-delete button')].find((node) =>
      node.textContent.includes('Hesabı sil'),
    )
    confirm.click()
    await flushPromises()

    expect(deleteAccount).toHaveBeenCalledWith({ password: 'demo1234' })
    expect(router.currentRoute.value.name).toBe('login')
    expect(localStorage.getItem('qr_menu.token')).toBeNull()
  })

  it('kaydedilmemiş profil yazısından çıkmayı sorar', async () => {
    persistSession(user, true)
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/admin/settings', name: 'admin-profile', component: SettingsPage },
        { path: '/admin', name: 'admin-dashboard', component: { template: '<div>Pano</div>' } },
      ],
    })
    const root = defineComponent({
      components: { QLayout, QPageContainer },
      template:
        '<q-layout view="hHh lpR fFf"><q-page-container><router-view /></q-page-container></q-layout>',
    })

    await router.push('/admin/settings')
    await router.isReady()

    const wrapper = mount(root, {
      attachTo: document.body,
      global: { plugins: [pinia, router] },
    })

    try {
      await wrapper.findAll('input')[0].setValue('Yeni Ad')
      const pending = router.push('/admin')
      await flushPromises()

      expect(document.body.textContent).toContain('Kaydedilmemiş değişiklik')
      expect(router.currentRoute.value.name).toBe('admin-profile')

      const stay = [...document.querySelectorAll('button')].find((node) =>
        node.textContent.includes('Vazgeç'),
      )
      stay.click()
      await pending.catch(() => {})
      await flushPromises()

      expect(router.currentRoute.value.name).toBe('admin-profile')
      expect(wrapper.findAll('input')[0].element.value).toBe('Yeni Ad')

      const leaving = router.push('/admin')
      await flushPromises()
      const leave = [...document.querySelectorAll('button')].find(
        (node) => node.textContent.trim() === 'Çık',
      )
      leave.click()
      await leaving
      await flushPromises()

      expect(router.currentRoute.value.name).toBe('admin-dashboard')
    } finally {
      wrapper.unmount()
    }
  })
})
