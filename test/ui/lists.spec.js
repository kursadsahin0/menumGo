import { beforeEach, describe, expect, it, vi } from 'vitest'
import CategoriesPage from '@/pages/admin/CategoriesPage.vue'
import ProductsPage from '@/pages/admin/ProductsPage.vue'
import TablesPage from '@/pages/admin/TablesPage.vue'
import { getAllCategories, getCategories } from '@/services/categoryService'
import { getProducts } from '@/services/productService'
import { getTables } from '@/services/tableService'
import { mountPage } from './mount.js'

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

function page(items) {
  return { items, page: 1, pageSize: 20, total: items.length, hasMore: false }
}

describe('panel listeleri', () => {
  beforeEach(() => {
    getProducts.mockReset()
    getCategories.mockReset()
    getAllCategories.mockReset()
    getTables.mockReset()
    getAllCategories.mockResolvedValue([])
  })

  it('ürün adını ve durumunu gösterir', async () => {
    getProducts.mockResolvedValue(
      page([
        {
          id: 'beef',
          name: { tr: 'Et Döner', en: 'Beef doner' },
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

    expect(wrapper.text()).toContain('Et Döner')
    expect(wrapper.text()).toContain('Mevcut')
    expect(wrapper.text()).not.toContain('Ürün bulunamadı')
  })

  it('kategorinin yayında olduğunu gösterir', async () => {
    getCategories.mockResolvedValue(
      page([
        {
          id: 'mains',
          name: { tr: 'Ana Yemekler', en: 'Mains' },
          isActive: true,
          productCount: 2,
        },
      ]),
    )

    const { wrapper } = await mountPage(CategoriesPage, {
      path: '/admin/categories',
      name: 'admin-categories',
      layout: true,
    })

    expect(wrapper.text()).toContain('Ana Yemekler')
    expect(wrapper.text()).toContain('Yayında')
    expect(wrapper.text()).toContain('2 ürün')
    expect(wrapper.text()).not.toContain('Kategori yok')
  })

  it('masanın açık olduğunu ve numarasını gösterir', async () => {
    getTables.mockResolvedValue(
      page([
        {
          id: 'garden',
          name: 'Bahçe 1',
          tableNumber: '4',
          isActive: true,
          qrCode: '/menu/burger-house?table=garden',
        },
      ]),
    )

    const { wrapper } = await mountPage(TablesPage, {
      path: '/admin/tables',
      name: 'admin-tables',
      layout: true,
    })

    expect(wrapper.text()).toContain('Bahçe 1')
    expect(wrapper.text()).toContain('4')
    expect(wrapper.text()).toContain('Açık')
    expect(wrapper.text()).not.toContain('Henüz masa yok')
  })
})
