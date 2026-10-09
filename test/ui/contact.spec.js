import { describe, expect, it } from 'vitest'
import ContactPage from '@/pages/public/ContactPage.vue'
import { mountPage } from './mount.js'

describe('iletişim sayfası', () => {
  it('numarayı ve kısa tanımı gösterir', async () => {
    const { wrapper } = await mountPage(ContactPage, {
      path: '/iletisim',
      name: 'contact',
      layout: true,
      routes: [
        { path: '/', name: 'public-home', component: { template: '<div />' } },
        { path: '/auth/login', name: 'login', component: { template: '<div />' } },
        { path: '/auth/register', name: 'register', component: { template: '<div />' } },
        { path: '/admin', name: 'admin-dashboard', component: { template: '<div />' } },
        { path: '/kullanim-kosullari', name: 'terms', component: { template: '<div />' } },
        { path: '/gizlilik', name: 'privacy', component: { template: '<div />' } },
        { path: '/kvkk', name: 'kvkk', component: { template: '<div />' } },
      ],
    })

    expect(wrapper.text()).toContain('Hakkımızda')
    expect(wrapper.text()).toContain('0555 123 45 67')
    expect(wrapper.get('a[href="tel:+905551234567"]').exists()).toBe(true)
  })
})