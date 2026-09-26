import { ApiError } from '@/utils/errors'
import { wait } from '@/mocks/config'
import { getStoredUser } from '@/utils/storage'

const DB_KEY = 'qr_menu.mock.tables'
const DEFAULT_SLUG = 'burger-house'

const seedTables = [
  { id: '1', name: 'Masa 1', tableNumber: '1', isActive: true },
  { id: '2', name: 'Masa 2', tableNumber: '2', isActive: true },
  { id: '3', name: 'Masa 3', tableNumber: '3', isActive: true },
  { id: '4', name: 'Bahçe 1', tableNumber: '4', isActive: true },
  { id: '5', name: 'Bahçe 2', tableNumber: '5', isActive: true },
  { id: '6', name: 'VIP 1', tableNumber: '6', isActive: true },
].map((table) => ({ ...table, restaurantSlug: DEFAULT_SLUG }))

function currentSlug() {
  return getStoredUser()?.tenant?.slug || DEFAULT_SLUG
}

function loadTables() {
  try {
    const raw = localStorage.getItem(DB_KEY)

    if (!raw) {
      saveTables(seedTables)
      return seedTables.map((table) => ({ ...table }))
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : seedTables.map((table) => ({ ...table }))
  } catch {
    return seedTables.map((table) => ({ ...table }))
  }
}

function saveTables(tables) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(tables))
  } catch {
    // Ignore storage failures in mock mode.
  }
}

function withQrCode(table) {
  return {
    id: table.id,
    name: table.name,
    tableNumber: table.tableNumber,
    isActive: table.isActive,
    qrCode: `/menu/${table.restaurantSlug}?table=${table.id}`,
  }
}

function sortTables(tables) {
  return [...tables].sort((a, b) => {
    const left = Number(a.tableNumber)
    const right = Number(b.tableNumber)
    const byNumber =
      Number.isFinite(left) && Number.isFinite(right)
        ? left - right
        : String(a.tableNumber).localeCompare(String(b.tableNumber), 'tr')

    return byNumber || a.name.localeCompare(b.name, 'tr')
  })
}

function normalizePayload(payload) {
  return {
    name: String(payload.name || '').trim(),
    tableNumber: String(payload.tableNumber ?? '').trim(),
    isActive: Boolean(payload.isActive),
  }
}

export async function mockGetTables() {
  await wait(80)

  const slug = currentSlug()
  return sortTables(loadTables().filter((table) => table.restaurantSlug === slug)).map(withQrCode)
}

export async function mockGetTable(id) {
  await wait(80)

  const table = loadTables().find(
    (entry) => entry.id === id && entry.restaurantSlug === currentSlug(),
  )

  if (!table) {
    throw new ApiError('Masa bulunamadı.', { status: 404 })
  }

  return withQrCode(table)
}

export async function mockCreateTable(payload) {
  await wait()

  const normalized = normalizePayload(payload)

  if (!normalized.name || !normalized.tableNumber) {
    throw new ApiError('Masa adı ve numarası zorunlu.', { status: 422 })
  }

  const tables = loadTables()
  const table = {
    id: String(Date.now()),
    ...normalized,
    restaurantSlug: currentSlug(),
  }

  tables.push(table)
  saveTables(tables)

  return withQrCode(table)
}

export async function mockUpdateTable(id, payload) {
  await wait()

  const tables = loadTables()
  const index = tables.findIndex(
    (entry) => entry.id === id && entry.restaurantSlug === currentSlug(),
  )

  if (index === -1) {
    throw new ApiError('Masa bulunamadı.', { status: 404 })
  }

  const current = tables[index]
  const next = {
    ...current,
    ...normalizePayload({ ...current, ...payload }),
    id: current.id,
    restaurantSlug: current.restaurantSlug,
  }

  tables[index] = next
  saveTables(tables)

  return withQrCode(next)
}

export async function mockDeleteTable(id) {
  await wait()

  const tables = loadTables()
  const next = tables.filter(
    (entry) => !(entry.id === id && entry.restaurantSlug === currentSlug()),
  )

  if (next.length === tables.length) {
    throw new ApiError('Masa bulunamadı.', { status: 404 })
  }

  saveTables(next)
  return { ok: true }
}
