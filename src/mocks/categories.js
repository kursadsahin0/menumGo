import { ApiError } from '@/utils/errors'
import { wait } from '@/mocks/config'
import { countProductsInCategory } from '@/mocks/products'

const DB_KEY = 'qr_menu.mock.categories'

const seedCategories = [
  {
    id: 'cat_kahvalti',
    name: 'Kahvaltı',
    description: 'Güne başlangıç tabakları.',
    image: null,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'cat_baslangic',
    name: 'Başlangıçlar',
    description: 'Paylaşımlık ve küçük porsiyonlar.',
    image: null,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'cat_ana',
    name: 'Ana Yemekler',
    description: 'Izgara, güveç ve ana tabaklar.',
    image: null,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'cat_burger',
    name: 'Burger',
    description: 'El yapımı burgerler.',
    image: null,
    isActive: true,
    sortOrder: 4,
  },
  {
    id: 'cat_pizza',
    name: 'Pizza',
    description: 'Taş fırın pizzalar.',
    image: null,
    isActive: true,
    sortOrder: 5,
  },
  {
    id: 'cat_makarna',
    name: 'Makarna',
    description: 'Taze makarnalar.',
    image: null,
    isActive: true,
    sortOrder: 6,
  },
  {
    id: 'cat_tatli',
    name: 'Tatlı',
    description: 'Günlük tatlılar.',
    image: null,
    isActive: true,
    sortOrder: 7,
  },
  {
    id: 'cat_kahve',
    name: 'Kahve',
    description: 'Espresso bazlı kahveler.',
    image: null,
    isActive: true,
    sortOrder: 8,
  },
  {
    id: 'cat_soguk',
    name: 'Soğuk İçecekler',
    description: 'Serinletici içecekler.',
    image: null,
    isActive: true,
    sortOrder: 9,
  },
  {
    id: 'cat_sicak',
    name: 'Sıcak İçecekler',
    description: 'Çay ve sıcak içecekler.',
    image: null,
    isActive: true,
    sortOrder: 10,
  },
]

function loadCategories() {
  try {
    const raw = localStorage.getItem(DB_KEY)

    if (!raw) {
      saveCategories(seedCategories)
      return seedCategories.map((category) => ({ ...category }))
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : seedCategories.map((category) => ({ ...category }))
  } catch {
    return seedCategories.map((category) => ({ ...category }))
  }
}

function saveCategories(categories) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(categories))
  } catch {
    // Ignore storage failures in mock mode.
  }
}

function sortCategories(categories) {
  return [...categories].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'tr'),
  )
}

function normalizePayload(payload) {
  return {
    name: String(payload.name || '').trim(),
    description: String(payload.description || '').trim(),
    image: payload.image || null,
    isActive: Boolean(payload.isActive),
    sortOrder: Number(payload.sortOrder) || 0,
  }
}

export async function mockGetCategories() {
  await wait(80)
  return sortCategories(loadCategories())
}

export async function mockGetCategory(id) {
  await wait(80)

  const category = loadCategories().find((entry) => entry.id === id)

  if (!category) {
    throw new ApiError('Kategori bulunamadı.', { status: 404 })
  }

  return { ...category }
}

export async function mockCreateCategory(payload) {
  await wait()

  const normalized = normalizePayload(payload)

  if (!normalized.name) {
    throw new ApiError('Kategori adı zorunlu.', { status: 422 })
  }

  const categories = loadCategories()
  const requestedOrder = Number(payload.sortOrder)
  const category = {
    id: `cat_${Date.now()}`,
    ...normalized,
    sortOrder: Number.isFinite(requestedOrder) ? requestedOrder : categories.length + 1,
  }

  categories.push(category)
  saveCategories(categories)

  return { ...category }
}

export async function mockUpdateCategory(id, payload) {
  await wait()

  const categories = loadCategories()
  const index = categories.findIndex((entry) => entry.id === id)

  if (index === -1) {
    throw new ApiError('Kategori bulunamadı.', { status: 404 })
  }

  const current = categories[index]
  const next = {
    ...current,
    ...normalizePayload({ ...current, ...payload }),
    id: current.id,
  }

  categories[index] = next
  saveCategories(categories)

  return { ...next }
}

export async function mockDeleteCategory(id) {
  await wait()

  const categories = loadCategories()
  const category = categories.find((entry) => entry.id === id)

  if (!category) {
    throw new ApiError('Kategori bulunamadı.', { status: 404 })
  }

  const productCount = countProductsInCategory(id)

  if (productCount > 0) {
    throw new ApiError(
      `${category.name} kategorisinde ${productCount} ürün var. Silmeden önce ürünleri başka bir kategoriye taşıyın.`,
      { status: 409, details: { productCount } },
    )
  }

  saveCategories(categories.filter((entry) => entry.id !== id))
  return { ok: true }
}

export async function mockUpdateCategoryOrder(ids = []) {
  await wait(80)

  const categories = loadCategories()
  const byId = new Map(categories.map((category) => [category.id, category]))
  const ordered = []
  const seen = new Set()

  ids.forEach((id) => {
    const category = byId.get(id)

    if (!category || seen.has(id)) {
      return
    }

    seen.add(id)
    ordered.push(category)
  })

  categories.forEach((category) => {
    if (!seen.has(category.id)) {
      ordered.push(category)
    }
  })

  ordered.forEach((category, index) => {
    category.sortOrder = index + 1
  })

  saveCategories(ordered)
  return sortCategories(ordered)
}
