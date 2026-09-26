import { ApiError } from '@/utils/errors'
import { wait } from '@/mocks/config'

const DB_KEY = 'qr_menu.mock.products'

const legacyCategoryIds = {
  cat_1: 'cat_kahve',
  cat_2: 'cat_tatli',
  cat_3: 'cat_soguk',
  cat_4: 'cat_baslangic',
}

const seedProducts = [
  {
    id: 'prd_1',
    name: 'Espresso',
    description: 'Kısa, yoğun kahve.',
    price: 90,
    discountedPrice: null,
    image: null,
    categoryId: 'cat_kahve',
    isAvailable: true,
    isFeatured: false,
    sortOrder: 1,
    createdAt: '2026-09-01T08:00:00.000Z',
    updatedAt: '2026-09-20T08:00:00.000Z',
  },
  {
    id: 'prd_2',
    name: 'Filtre Kahve',
    description: 'Günün çekirdeğiyle demlenir.',
    price: 110,
    discountedPrice: null,
    image: null,
    categoryId: 'cat_kahve',
    isAvailable: true,
    isFeatured: true,
    sortOrder: 2,
    createdAt: '2026-09-01T08:05:00.000Z',
    updatedAt: '2026-09-20T08:05:00.000Z',
  },
  {
    id: 'prd_3',
    name: 'Cheesecake',
    description: 'Frambuaz soslu.',
    price: 220,
    discountedPrice: 185,
    image: null,
    categoryId: 'cat_tatli',
    isAvailable: true,
    isFeatured: true,
    sortOrder: 3,
    createdAt: '2026-09-02T09:00:00.000Z',
    updatedAt: '2026-09-21T09:00:00.000Z',
  },
  {
    id: 'prd_4',
    name: 'Limonata',
    description: 'Taze nane ile.',
    price: 95,
    discountedPrice: null,
    image: null,
    categoryId: 'cat_soguk',
    isAvailable: false,
    isFeatured: false,
    sortOrder: 4,
    createdAt: '2026-09-03T10:00:00.000Z',
    updatedAt: '2026-09-22T10:00:00.000Z',
  },
  {
    id: 'prd_5',
    name: 'Brownie',
    description: 'Sıcak servis edilir.',
    price: 160,
    discountedPrice: 140,
    image: null,
    categoryId: 'cat_tatli',
    isAvailable: true,
    isFeatured: false,
    sortOrder: 5,
    createdAt: '2026-09-04T11:00:00.000Z',
    updatedAt: '2026-09-22T11:00:00.000Z',
  },
]

function loadProducts() {
  try {
    const raw = localStorage.getItem(DB_KEY)

    if (!raw) {
      saveProducts(seedProducts)
      return seedProducts.map((product) => ({ ...product }))
    }

    const parsed = JSON.parse(raw)
    const products = Array.isArray(parsed)
      ? parsed
      : seedProducts.map((product) => ({ ...product }))
    return migrateCategoryIds(products)
  } catch {
    return seedProducts.map((product) => ({ ...product }))
  }
}

function migrateCategoryIds(products) {
  let changed = false
  const next = products.map((product) => {
    const categoryId = legacyCategoryIds[product.categoryId]

    if (!categoryId) {
      return product
    }

    changed = true
    return { ...product, categoryId }
  })

  if (changed) {
    saveProducts(next)
  }

  return next
}

export function countProductsInCategory(categoryId) {
  return loadProducts().filter((product) => product.categoryId === categoryId).length
}

function saveProducts(products) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(products))
  } catch {
    // Ignore storage failures in mock mode.
  }
}

function sortProducts(products) {
  return [...products].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'tr'),
  )
}

export async function mockGetProducts(params = {}) {
  await wait()

  const search = String(params.search || '')
    .trim()
    .toLocaleLowerCase('tr')
  const categoryId = params.categoryId || ''
  const status = params.status || 'all'

  const products = loadProducts().filter((product) => {
    const matchesSearch =
      !search ||
      product.name.toLocaleLowerCase('tr').includes(search) ||
      product.description.toLocaleLowerCase('tr').includes(search)
    const matchesCategory = !categoryId || product.categoryId === categoryId
    const matchesStatus =
      status === 'all' ||
      (status === 'available' && product.isAvailable) ||
      (status === 'unavailable' && !product.isAvailable)

    return matchesSearch && matchesCategory && matchesStatus
  })

  return sortProducts(products)
}

export async function mockGetProduct(id) {
  await wait(80)

  const product = loadProducts().find((entry) => entry.id === id)

  if (!product) {
    throw new ApiError('Ürün bulunamadı.', { status: 404 })
  }

  return { ...product }
}

function normalizePayload(payload) {
  const price = Number(payload.price)
  const discounted =
    payload.discountedPrice === null || payload.discountedPrice === ''
      ? null
      : Number(payload.discountedPrice)

  return {
    name: String(payload.name || '').trim(),
    description: String(payload.description || '').trim(),
    price,
    discountedPrice: Number.isFinite(discounted) ? discounted : null,
    image: payload.image || null,
    categoryId: payload.categoryId,
    isAvailable: Boolean(payload.isAvailable),
    isFeatured: Boolean(payload.isFeatured),
    sortOrder: Number(payload.sortOrder) || 0,
  }
}

export async function mockCreateProduct(payload) {
  await wait()

  const now = new Date().toISOString()
  const product = {
    id: `prd_${Date.now()}`,
    ...normalizePayload(payload),
    createdAt: now,
    updatedAt: now,
  }
  const products = loadProducts()
  products.push(product)
  saveProducts(products)

  return { ...product }
}

export async function mockUpdateProduct(id, payload) {
  await wait()

  const products = loadProducts()
  const index = products.findIndex((entry) => entry.id === id)

  if (index === -1) {
    throw new ApiError('Ürün bulunamadı.', { status: 404 })
  }

  const current = products[index]
  const next = {
    ...current,
    ...normalizePayload({ ...current, ...payload }),
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
  }

  products[index] = next
  saveProducts(products)

  return { ...next }
}

export async function mockDeleteProduct(id) {
  await wait()

  const products = loadProducts()
  const next = products.filter((entry) => entry.id !== id)

  if (next.length === products.length) {
    throw new ApiError('Ürün bulunamadı.', { status: 404 })
  }

  saveProducts(next)
  return { ok: true }
}
