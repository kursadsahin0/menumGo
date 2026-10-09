import { describe, expect, it } from 'vitest'
import RegisterPage from '@/pages/auth/RegisterPage.vue'
import { mountPage } from './mount.js'

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
})
