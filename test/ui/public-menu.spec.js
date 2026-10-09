import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PublicMenuPage from '@/pages/public/PublicMenuPage.vue'
import { getPublicMenu } from '@/services/menuService'
import { ApiError } from '@/utils/errors'
import { mountPage } from './mount.js'

vi.mock('@/services/menuService', () => ({
  getPublicMenu: vi.fn(),
  recordMenuView: vi.fn(async () => null),
  recordProductView: vi.fn(async () => null),
  requestWaiter: vi.fn(async () => null),
  getWifi: vi.fn(async () => null),
}))

const menu = {
  restaurant: {
    name: 'Demo Kafe',
    description: { tr: '', en: '' },
    socials: [],
  },
  settings: {
    font: 'sans',
    cardStyle: 'plain',
    logoPosition: 'center',
    theme: 'light',
    primaryColor: '#1f3a34',
    secondaryColor: '#c4a574',
    showDescriptions: true,
    showProductImages: true,
    showPrices: true,
  },
  categories: [
    {
      id: 'cat-mains',
      name: { tr: 'Ana Yemekler', en: 'Mains' },
      description: { tr: '', en: '' },
      products: [
        {
          id: 'beef',
          name: { tr: 'Et Döner', en: 'Beef doner' },
          description: { tr: '100 gr', en: '100 g' },
          ingredients: { tr: 'Dana eti, lavaş, soğan', en: 'Beef, flatbread, onion' },
          allergens: ['gluten', 'sesame'],
          price: 270,
          discountedPrice: null,
          isAvailable: true,
          isFeatured: false,
        },
        {
          id: 'chicken',
          name: { tr: 'Tavuk Döner', en: 'Chicken doner' },
          description: { tr: '', en: '' },
          ingredients: { tr: '', en: '' },
          allergens: [],
          price: 170,
          discountedPrice: null,
          isAvailable: true,
          isFeatured: false,
        },
      ],
    },
  ],
}

async function openMenu() {
  return mountPage(PublicMenuPage, {
    path: '/menu/:restaurantSlug',
    name: 'public-menu',
    start: '/menu/burger-house',
    layout: true,
  })
}

describe('misafir menüsü', () => {
  beforeEach(() => {
    getPublicMenu.mockReset()
  })

  it('olmayan menüyü bulunamadı olarak gösterir', async () => {
    getPublicMenu.mockRejectedValue(new ApiError('kayıt yok', { status: 404 }))
    const { wrapper } = await openMenu()

    expect(wrapper.text()).toContain('Menü bulunamadı')
    expect(wrapper.text()).not.toContain('Yeniden dene')
    expect(wrapper.text()).toContain('Ana sayfa')
  })

  it('ağ hatasında yeniden deneme sunar', async () => {
    getPublicMenu
      .mockRejectedValueOnce(new ApiError('Network Error', { status: 0 }))
      .mockResolvedValueOnce(menu)
    const { wrapper } = await openMenu()

    expect(wrapper.text()).toContain('Menü yüklenemedi')
    expect(wrapper.text()).not.toContain('Menü bulunamadı')

    await wrapper.get('button').trigger('click')
    await flushPromises()

    expect(getPublicMenu).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('Et Döner')
  })

  it('çok fazla istekte yeniden denemeyi açık tutar', async () => {
    getPublicMenu.mockRejectedValue(new ApiError('Çok fazla istek.', { status: 429 }))
    const { wrapper } = await openMenu()

    expect(wrapper.text()).toContain('Çok fazla istek')
    expect(wrapper.text()).toContain('Yeniden dene')
    expect(wrapper.text()).not.toContain('Menü bulunamadı')
    expect(wrapper.text()).not.toContain('Bağlantı kurulamadı')
  })

  it('aramada içerik ve alerjen adına da bakar', async () => {
    getPublicMenu.mockResolvedValue(menu)
    const { wrapper } = await openMenu()
    const search = wrapper.get('input')

    await search.setValue('soğan')
    expect(wrapper.text()).toContain('Et Döner')
    expect(wrapper.text()).not.toContain('Tavuk Döner')

    await search.setValue('susam')
    expect(wrapper.text()).toContain('Et Döner')
    expect(wrapper.text()).not.toContain('Tavuk Döner')

    await search.setValue('yokboyle')
    expect(wrapper.text()).toContain('Eşleşen ürün yok')
  })
})
