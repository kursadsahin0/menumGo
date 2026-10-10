import assert from 'node:assert/strict'
import { test } from 'node:test'
import { clampPage, pageResult, placeIds, readPage } from '../src/paging.js'

test('sayfa numarası varsayılan ve sınırlıdır', () => {
  assert.deepEqual(readPage({}), { page: 1, pageSize: 20 })
  assert.deepEqual(readPage({ page: '2', pageSize: '500' }), { page: 2, pageSize: 100 })
  assert.equal(clampPage(9, 25, 20), 2)
  assert.equal(pageResult(['a'], 25, 2, 20).hasMore, false)
})

test('geçersiz sayfa reddedilir', () => {
  assert.throws(() => readPage({ page: '0' }), (error) => error.statusCode === 422)
})

test('sıralama yalnızca sayfadaki kayıtların yerini değiştirir', () => {
  const rows = [
    { id: 'a' },
    { id: 'b' },
    { id: 'c' },
    { id: 'd' },
  ]
  assert.deepEqual(
    placeIds(rows, ['c', 'a']).map((row) => row.id),
    ['c', 'b', 'a', 'd'],
  )
})
