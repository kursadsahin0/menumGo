import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CategoriesPage from '@/pages/admin/CategoriesPage.vue'
import DashboardPage from '@/pages/admin/DashboardPage.vue'
import ProductsPage from '@/pages/admin/ProductsPage.vue'
import StatsPage from '@/pages/admin/StatsPage.vue'
import TablesPage from '@/pages/admin/TablesPage.vue'
import { getCategories, getAllCategories } from '@/services/categoryService'
import { getDashboard } from '@/services/dashboard.service'
import { getProducts } from '@/services/productService'
import { getStats } from '@/services/stats.service'
import { useDashboardStore } from '@/stores/dashboard'
import { getTables } from '@/services/tableService'
import { ApiError } from '@/utils/errors'
import { mountPage } from './mount.js'

vi.mock('@/services/dashboard.service', () => ({ getDashboard: vi.fn() }))
vi.mock('@/services/stats.service', () => ({ getStats: vi.fn() }))
vi.mock('@/services/productService', () => ({
  getProducts: vi.fn(),
  getProduct: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
  updateProductOrder: vi.fn(),
}))
vi.mock('@/services/categoryService', () => ({
  getCategories: vi.fn(),
  getAllCategories: vi.fn(),
  getCategory: vi.fn(),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
  updateCategoryOrder: vi.fn(),
}))
vi.mock('@/services/tableService', () => ({
  getTables: vi.fn(),
  getTable: vi.fn(),
  createTable: vi.fn(),
  updateTable: vi.fn(),
  deleteTable: vi.fn(),
}))

const offline = new ApiError('Network Error', { status: 0 })

function page(items) {
  return { items, page: 1, pageSize: 20, total: items.length, hasMore: false }
}

async function retry(wrapper) {
  const button = wrapper.findAll('button').find((node) => node.text().includes('Yeniden dene'))
  expect(button).toBeTruthy()
  await button.trigger('click')
  await flushPromises()
}

describe('liste yükleme hatası', () => {
  beforeEach(() => {
    getDashboard.mockReset()
    getStats.mockReset()
    getProducts.mockReset()
    getCategories.mockReset()
    getAllCategories.mockReset()
    getTables.mockReset()
    getAllCategories.mockResolvedValue([])
  })

  it('özet düşünce yeniden denemeyi gösterir', async () => {
    getDashboard.mockRejectedValueOnce(offline).mockResolvedValueOnce({
      stats: [{ key: 'views', label: 'Görüntüleme', value: 3, icon: 'visibility' }],
      views: { labels: ['Pzt'], values: [1] },
      popularCategories: [],
      popularProducts: [],
      activity: [],
    })

    const { wrapper } = await mountPage(DashboardPage, {
      path: '/admin',
      name: 'admin-dashboard',
      layout: true,
    })

    expect(wrapper.text()).toContain('Bağlantı kurulamadı')
    expect(wrapper.text()).toContain('Yeniden dene')
    expect(wrapper.text()).not.toContain('Menü görüntülenme')

    await retry(wrapper)

    expect(wrapper.text()).toContain('Menü görüntülenme')
    expect(wrapper.text()).toContain('Görüntüleme')
    expect(wrapper.text()).not.toContain('Yeniden dene')
  })

  it('istatistik düşünce yeniden denemeyi gösterir', async () => {
    getStats.mockRejectedValueOnce(offline).mockResolvedValueOnce({
      summary: [{ key: 'views', label: 'Açılış', value: 2, icon: 'visibility' }],
      views: { labels: [], values: [] },
      languages: [],
      hours: [],
      popularCategories: [],
      popularProducts: [],
    })

    const { wrapper } = await mountPage(StatsPage, {
      path: '/admin/stats',
      name: 'admin-stats',
      layout: true,
    })

    expect(wrapper.text()).toContain('Bağlantı kurulamadı')
    expect(wrapper.text()).toContain('Yeniden dene')
    expect(wrapper.text()).not.toContain('Açılış')

    await retry(wrapper)

    expect(wrapper.text()).toContain('Açılış')
    expect(wrapper.text()).not.toContain('Yeniden dene')
  })

  it('özet yenilenemezse eski verinin üstünde hata gösterir', async () => {
    getDashboard
      .mockResolvedValueOnce({
        stats: [{ key: 'views', label: 'Görüntüleme', value: 3, icon: 'visibility' }],
        views: { labels: ['Pzt'], values: [1] },
        popularCategories: [],
        popularProducts: [],
        activity: [],
      })
      .mockRejectedValueOnce(offline)

    const { wrapper, pinia } = await mountPage(DashboardPage, {
      path: '/admin',
      name: 'admin-dashboard',
      layout: true,
    })

    expect(wrapper.text()).toContain('Görüntüleme')
    expect(wrapper.text()).not.toContain('Bağlantı kurulamadı')

    await useDashboardStore(pinia).fetchOverview()
    await flushPromises()

    expect(wrapper.text()).toContain('Bağlantı kurulamadı')
    expect(wrapper.text()).toContain('Görüntüleme')
  })

  it('dönem değişemezse grafik eski aralıkta kalır', async () => {
    const week = {
      summary: [{ key: 'views', label: 'Yedi', value: 2, icon: 'visibility' }],
      views: { labels: [], values: [] },
      languages: [],
      hours: [],
      popularCategories: [],
      popularProducts: [],
    }
    const month = {
      ...week,
      summary: [{ key: 'views', label: 'Otuz', value: 9, icon: 'visibility' }],
    }

    getStats.mockResolvedValueOnce(week).mockRejectedValueOnce(offline).mockResolvedValueOnce(month)

    const { wrapper } = await mountPage(StatsPage, {
      path: '/admin/stats',
      name: 'admin-stats',
      layout: true,
    })

    expect(wrapper.text()).toContain('Yedi')
    expect(wrapper.text()).toContain('Son 7 gün')

    const monthButton = wrapper.findAll('button').find((node) => node.text().includes('30 gün'))
    expect(monthButton).toBeTruthy()
    await monthButton.trigger('click')
    await flushPromises()

    expect(getStats).toHaveBeenLastCalledWith('30d')
    expect(wrapper.text()).toContain('Bağlantı kurulamadı')
    expect(wrapper.text()).toContain('Yedi')
    expect(wrapper.text()).toContain('Son 7 gün')
    expect(wrapper.text()).not.toContain('Son 30 gün')

    await retry(wrapper)

    expect(wrapper.text()).toContain('Otuz')
    expect(wrapper.text()).toContain('Son 30 gün')
    expect(wrapper.text()).not.toContain('Bağlantı kurulamadı')
  })

  it('ürün listesi düşünce boş liste yerine yeniden deneme gösterir', async () => {
    getProducts.mockRejectedValueOnce(offline).mockResolvedValueOnce(
      page([
        {
          id: 'beef',
          name: { tr: 'Et Döner', en: '' },
          description: { tr: '', en: '' },
          price: 270,
          discountedPrice: null,
          isAvailable: true,
          sortOrder: 1,
          categoryId: '',
        },
      ]),
    )

    const { wrapper } = await mountPage(ProductsPage, {
      path: '/admin/products',
      name: 'admin-products',
      layout: true,
    })

    expect(wrapper.text()).toContain('Bağlantı kurulamadı')
    expect(wrapper.text()).toContain('Yeniden dene')
    expect(wrapper.text()).not.toContain('Ürün bulunamadı')

    await retry(wrapper)

    expect(wrapper.text()).toContain('Et Döner')
    expect(wrapper.text()).not.toContain('Yeniden dene')
  })

  it('kategoriler düşünce ürün listesini yine de açar', async () => {
    getAllCategories.mockReset()
    getAllCategories.mockRejectedValueOnce(offline).mockResolvedValueOnce([
      { id: 'mains', name: { tr: 'Ana Yemekler', en: '' } },
    ])
    getProducts.mockResolvedValue(
      page([
        {
          id: 'beef',
          name: { tr: 'Et Döner', en: '' },
          description: { tr: '', en: '' },
          price: 270,
          discountedPrice: null,
          isAvailable: true,
          sortOrder: 1,
          categoryId: 'mains',
        },
      ]),
    )

    const { wrapper } = await mountPage(ProductsPage, {
      path: '/admin/products',
      name: 'admin-products',
      layout: true,
    })

    expect(getProducts).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Et Döner')
    expect(wrapper.text()).toContain('Bağlantı kurulamadı')
    expect(wrapper.text()).not.toContain('Ürün bulunamadı')

    await retry(wrapper)

    expect(getAllCategories).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('Et Döner')
    expect(wrapper.text()).not.toContain('Bağlantı kurulamadı')
  })

  it('kategori listesi düşünce boş liste yerine yeniden deneme gösterir', async () => {
    getCategories.mockRejectedValueOnce(offline).mockResolvedValueOnce(
      page([{ id: 'breakfast', name: { tr: 'Kahvaltı', en: '' }, isActive: true, productCount: 0 }]),
    )

    const { wrapper } = await mountPage(CategoriesPage, {
      path: '/admin/categories',
      name: 'admin-categories',
      layout: true,
    })

    expect(wrapper.text()).toContain('Bağlantı kurulamadı')
    expect(wrapper.text()).toContain('Yeniden dene')
    expect(wrapper.text()).not.toContain('Kategori yok')

    await retry(wrapper)

    expect(wrapper.text()).toContain('Kahvaltı')
    expect(wrapper.text()).not.toContain('Yeniden dene')
  })

  it('masa listesi düşünce boş liste yerine yeniden deneme gösterir', async () => {
    getTables.mockRejectedValueOnce(offline).mockResolvedValueOnce(
      page([{ id: 'garden', name: 'Bahçe 1', tableNumber: '4', isActive: true, qrCode: '/menu/x?table=garden' }]),
    )

    const { wrapper } = await mountPage(TablesPage, {
      path: '/admin/tables',
      name: 'admin-tables',
      layout: true,
    })

    expect(wrapper.text()).toContain('Bağlantı kurulamadı')
    expect(wrapper.text()).toContain('Yeniden dene')
    expect(wrapper.text()).not.toContain('Henüz masa yok')

    await retry(wrapper)

    expect(wrapper.text()).toContain('Bahçe 1')
    expect(wrapper.text()).not.toContain('Yeniden dene')
  })
})
