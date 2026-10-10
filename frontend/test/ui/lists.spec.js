import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProductList from '@/components/admin/ProductList.vue'
import CategoriesPage from '@/pages/admin/CategoriesPage.vue'
import ProductsPage from '@/pages/admin/ProductsPage.vue'
import TablesPage from '@/pages/admin/TablesPage.vue'
import { getAllCategories, getCategories, updateCategoryOrder } from '@/services/categoryService'
import { getProducts, updateProductOrder } from '@/services/productService'
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

  it('boş ürün listesinde arama metni göstermez', async () => {
    getProducts.mockResolvedValue(page([]))

    const { wrapper } = await mountPage(ProductsPage, {
      path: '/admin/products',
      name: 'admin-products',
      layout: true,
    })

    expect(wrapper.text()).toContain('Henüz ürün yok')
    expect(wrapper.text()).not.toContain('Aramayı değiştirin')
  })

  it('filtreli boş listede aramayı değiştirmeyi söyler', () => {
    const wrapper = mount(ProductList, {
      props: { products: [], categories: [], filtered: true },
    })

    expect(wrapper.text()).toContain('Aramayı değiştirin')
    expect(wrapper.text()).not.toContain('Henüz ürün yok')
  })

  it('aşağı düğmesi ürün sırasını değiştirir', async () => {
    getProducts.mockResolvedValue(
      page([
        {
          id: 'beef',
          name: { tr: 'Et Döner', en: '' },
          description: { tr: '', en: '' },
          price: 270,
          isAvailable: true,
          sortOrder: 1,
          categoryId: '',
        },
        {
          id: 'chicken',
          name: { tr: 'Tavuk Döner', en: '' },
          description: { tr: '', en: '' },
          price: 170,
          isAvailable: true,
          sortOrder: 2,
          categoryId: '',
        },
      ]),
    )
    updateProductOrder.mockResolvedValue([
      { id: 'chicken', sortOrder: 1 },
      { id: 'beef', sortOrder: 2 },
    ])

    const { wrapper } = await mountPage(ProductsPage, {
      path: '/admin/products',
      name: 'admin-products',
      layout: true,
    })

    const down = wrapper.findAll('[aria-label="Aşağı taşı"]')
    const up = wrapper.findAll('[aria-label="Yukarı taşı"]')
    expect(up[0].attributes('disabled')).toBeDefined()
    expect(down.at(-1).attributes('disabled')).toBeDefined()

    await down[0].trigger('click')
    await flushPromises()

    expect(updateProductOrder).toHaveBeenCalledWith(['chicken', 'beef'])
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

  it('aşağı düğmesi kategori sırasını değiştirir', async () => {
    getCategories.mockResolvedValue(
      page([
        { id: 'mains', name: { tr: 'Ana Yemekler', en: '' }, isActive: true, productCount: 1, sortOrder: 1 },
        { id: 'drinks', name: { tr: 'İçecekler', en: '' }, isActive: true, productCount: 0, sortOrder: 2 },
      ]),
    )
    updateCategoryOrder.mockResolvedValue([
      { id: 'drinks', name: { tr: 'İçecekler', en: '' }, isActive: true, productCount: 0, sortOrder: 1 },
      { id: 'mains', name: { tr: 'Ana Yemekler', en: '' }, isActive: true, productCount: 1, sortOrder: 2 },
    ])

    const { wrapper } = await mountPage(CategoriesPage, {
      path: '/admin/categories',
      name: 'admin-categories',
      layout: true,
    })

    const down = wrapper.findAll('[aria-label="Aşağı taşı"]')
    expect(down).toHaveLength(2)
    expect(down.at(-1).attributes('disabled')).toBeDefined()

    await down[0].trigger('click')
    await flushPromises()

    expect(updateCategoryOrder).toHaveBeenCalledWith(['drinks', 'mains'])
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
