import { fail } from './http.js'

export const defaultPageSize = 20
export const maxPageSize = 100

export function readPage(query = {}) {
  return {
    page: readWhole(query.page, 1),
    pageSize: Math.min(readWhole(query.pageSize, defaultPageSize), maxPageSize),
  }
}

export function clampPage(page, total, pageSize) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return Math.min(page, pages)
}

export function pageResult(items, total, page, pageSize) {
  return {
    items,
    page,
    pageSize,
    total,
    hasMore: page * pageSize < total,
  }
}

export function placeIds(rows, ids) {
  const byId = new Map(rows.map((row) => [row.id, row]))
  const seen = new Set()
  const queue = []

  for (const id of ids) {
    if (!byId.has(id) || seen.has(id)) {
      continue
    }

    seen.add(id)
    queue.push(byId.get(id))
  }

  if (!queue.length) {
    return []
  }

  let next = 0

  return rows.map((row) => (seen.has(row.id) ? queue[next++] : row))
}

function readWhole(value, fallback) {
  if (value == null || value === '') {
    return fallback
  }

  const number = Number(value)

  if (!Number.isInteger(number) || number < 1 || number > 100_000) {
    throw fail(422, 'Sayfa geçersiz.')
  }

  return number
}
