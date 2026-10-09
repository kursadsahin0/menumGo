import { describe, expect, it } from 'vitest'
import LegalPage from '@/pages/public/LegalPage.vue'
import { mountPage } from './mount.js'

const routes = [
  { path: '/', name: 'public-home', component: { template: '<div />' } },
  { path: '/auth/login', name: 'login', component: { template: '<div />' } },
  { path: '/auth/register', name: 'register', component: { template: '<div />' } },
  { path: '/admin', name: 'admin-dashboard', component: { template: '<div />' } },
  { path: '/kullanim-kosullari', name: 'terms', component: { template: '<div />' } },
  { path: '/gizlilik', name: 'privacy', component: { template: '<div />' } },
  { path: '/iletisim', name: 'contact', component: { template: '<div />' } },
]

describe('KVKK sayfası', () => {
  it('aydınlatma metnini ve başvuru hattını gösterir', async () => {
    const { wrapper } = await mountPage(LegalPage, {
      path: '/kvkk',
      name: 'kvkk',
      meta: { document: 'kvkk' },
      layout: true,
      routes,
    })

    expect(wrapper.text()).toContain('KVKK aydınlatma metni')
    expect(wrapper.text()).toContain('Veri sorumlusu')
    expect(wrapper.text()).toContain('İşlenen veriler ve amaç')
    expect(wrapper.text()).toContain('Hukuki sebep')
    expect(wrapper.text()).toContain('Haklar')
    expect(wrapper.text()).toContain('0555 123 45 67')
    expect(wrapper.text()).toContain('2026-10-09')
    expect(wrapper.get('a[href="tel:+905551234567"]').exists()).toBe(true)
    expect(wrapper.get('a[href="/kullanim-kosullari"]').text()).toBe('Kullanım koşulları')
    expect(wrapper.get('a[href="/gizlilik"]').text()).toBe('Gizlilik bildirimi')
    expect(wrapper.find('.notice').exists()).toBe(true)
    expect(wrapper.find('.terms-page').exists()).toBe(false)
    expect(wrapper.find('.privacy-page').exists()).toBe(false)
  })

  it('kullanım koşullarını sürüm ve deneme kartlarıyla gösterir', async () => {
    const { wrapper } = await mountPage(LegalPage, {
      path: '/kullanim-kosullari',
      name: 'terms',
      meta: { document: 'terms' },
      layout: true,
      routes: [
        ...routes.filter((item) => item.name !== 'terms'),
        { path: '/kvkk', name: 'kvkk', component: { template: '<div />' } },
      ],
    })

    expect(wrapper.text()).toContain('Kullanım koşulları')
    expect(wrapper.text()).toContain('7 gün')
    expect(wrapper.text()).toContain('2026-10-09')
    expect(wrapper.text()).toContain('Hizmet')
    expect(wrapper.text()).toContain('Hesap')
    expect(wrapper.text()).toContain('Menü içeriği')
    expect(wrapper.text()).toContain('Kabul')
    expect(wrapper.get('a[href="/gizlilik"]').text()).toContain('gizlilik bildirimini')
    expect(wrapper.get('a[href="/kvkk"]').text()).toContain('KVKK aydınlatma metnini')
    expect(wrapper.get('a[href="/auth/register"]').text()).toContain('Kayıt ol')
    expect(wrapper.find('.terms-page').exists()).toBe(true)
    expect(wrapper.find('.privacy-page').exists()).toBe(false)
    expect(wrapper.find('.notice').exists()).toBe(false)
  })

  it('gizlilik bildirimini misafir ve saklama kartlarıyla gösterir', async () => {
    const { wrapper } = await mountPage(LegalPage, {
      path: '/gizlilik',
      name: 'privacy',
      meta: { document: 'privacy' },
      layout: true,
      routes: [
        ...routes.filter((item) => item.name !== 'privacy'),
        { path: '/kvkk', name: 'kvkk', component: { template: '<div />' } },
      ],
    })

    expect(wrapper.text()).toContain('Gizlilik bildirimi')
    expect(wrapper.text()).toContain('Misafirden ad, telefon veya ödeme bilgisi alınmaz.')
    expect(wrapper.text()).toContain('90 gün')
    expect(wrapper.text()).toContain('Hesap verisi')
    expect(wrapper.text()).toContain('Menü ve görsel')
    expect(wrapper.text()).toContain('Misafir')
    expect(wrapper.text()).toContain('Saklama')
    expect(wrapper.get('a[href="/kullanim-kosullari"]').text()).toBe('Kullanım koşulları')
    expect(wrapper.get('a[href="/kvkk"]').text()).toBe('KVKK aydınlatma metni')
    expect(wrapper.find('.privacy-page').exists()).toBe(true)
    expect(wrapper.find('.terms-page').exists()).toBe(false)
    expect(wrapper.find('.notice').exists()).toBe(false)
  })
})
