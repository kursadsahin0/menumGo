import { describe, expect, it } from 'vitest'
import ErrorNotFound from '@/pages/ErrorNotFound.vue'
import { mountPage } from './mount.js'

const publicRoutes = [
  { path: '/', name: 'public-home', component: { template: '<div />' } },
  { path: '/iletisim', name: 'contact', component: { template: '<div />' } },
  { path: '/auth/login', name: 'login', component: { template: '<div />' } },
  { path: '/auth/register', name: 'register', component: { template: '<div />' } },
  { path: '/kullanim-kosullari', name: 'terms', component: { template: '<div />' } },
  { path: '/gizlilik', name: 'privacy', component: { template: '<div />' } },
  { path: '/kvkk', name: 'kvkk', component: { template: '<div />' } },
]

describe('bulunamayan sayfa', () => {
  it('markayı ve ana sayfa bağlantısını gösterir', async () => {
    const { wrapper } = await mountPage(ErrorNotFound, {
      path: '/yok',
      name: 'not-found',
      routes: publicRoutes,
    })

    expect(wrapper.text()).toContain('menümGo')
    expect(wrapper.text()).toContain('Sayfa bulunamadı.')
    expect(wrapper.text()).toContain('Ana sayfa')
    expect(wrapper.find('.landing-page').exists()).toBe(true)
  })
})
