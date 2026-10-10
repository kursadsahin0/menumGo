import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import AdminTopbar from '@/components/admin/AdminTopbar.vue'
import { getNotifications } from '@/services/notificationService'
import { ApiError } from '@/utils/errors'

vi.mock('@/services/notificationService', () => ({
  getNotifications: vi.fn(),
  clearNotifications: vi.fn(),
  markNotificationsRead: vi.fn(),
}))

vi.mock('@/utils/waiterPush', () => ({
  enableWaiterPush: vi.fn(async () => {}),
}))

vi.mock('@/utils/notificationSound', () => ({
  playWaiterChime: vi.fn(),
  showWaiterNotice: vi.fn(),
  unlockNotificationSound: vi.fn(),
}))

const offline = new ApiError('Network Error', { status: 0 })

const first = {
  items: [{ id: 'n1', title: 'Ürün eklendi', body: 'Et Döner', time: 'şimdi', unread: false }],
  hasMore: true,
  unread: 0,
}

const older = {
  items: [{ id: 'n0', title: 'Masa eklendi', body: 'Bahçe', time: 'dün', unread: false }],
  hasMore: false,
  unread: 0,
}

async function openBell() {
  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/admin/profile', name: 'admin-profile', component: { template: '<div />' } },
      { path: '/auth/login', name: 'login', component: { template: '<div />' } },
    ],
  })

  await router.push('/')
  await router.isReady()

  const wrapper = mount(AdminTopbar, {
    global: { plugins: [pinia, router] },
  })

  await flushPromises()
  return wrapper
}

function button(wrapper, label) {
  return wrapper.findAll('button').find((node) => node.text().trim() === label)
}

describe('bildirim listesi', () => {
  let wrapper

  beforeEach(() => {
    getNotifications.mockReset()
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  it('ilk yükleme düşünce boş liste yerine yeniden deneme gösterir', async () => {
    getNotifications.mockRejectedValueOnce(offline).mockResolvedValueOnce(first)
    wrapper = await openBell()

    expect(wrapper.text()).toContain('Bağlantı kurulamadı')
    expect(wrapper.text()).toContain('Yeniden dene')
    expect(wrapper.text()).not.toContain('Henüz bildirim yok')

    await button(wrapper, 'Yeniden dene').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Ürün eklendi')
    expect(wrapper.text()).not.toContain('Bağlantı kurulamadı')
    expect(wrapper.text()).not.toContain('Henüz bildirim yok')
  })

  it('eski bildirimler düşünce listeyi tutup yeniden deneme gösterir', async () => {
    getNotifications.mockResolvedValueOnce(first).mockRejectedValueOnce(offline).mockResolvedValueOnce(older)
    wrapper = await openBell()

    expect(wrapper.text()).toContain('Ürün eklendi')
    expect(wrapper.text()).not.toContain('Bağlantı kurulamadı')

    await button(wrapper, 'Daha eski').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Bağlantı kurulamadı')
    expect(wrapper.text()).toContain('Ürün eklendi')
    expect(getNotifications).toHaveBeenLastCalledWith('n1')

    await button(wrapper, 'Yeniden dene').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Masa eklendi')
    expect(wrapper.text()).toContain('Ürün eklendi')
    expect(wrapper.text()).not.toContain('Bağlantı kurulamadı')
  })
})
