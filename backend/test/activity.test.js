import assert from 'node:assert/strict'
import { test } from 'node:test'
import { recentActivityItems } from '../src/analytics/report.js'

function notice(id, title, body) {
  return {
    id,
    title,
    body,
    createdAt: new Date('2026-10-09T12:00:00.000Z'),
  }
}

test('silinen ürün aktivitede kalır', () => {
  const items = recentActivityItems([
    notice('ntf_del', 'Ürün silindi', 'Et Döner menüden kaldırıldı.'),
    notice('ntf_add', 'Ürün eklendi', 'Et Döner menüye eklendi.'),
  ])

  assert.deepEqual(
    items.map((item) => item.title),
    ['Et Döner silindi', 'Et Döner eklendi'],
  )
})

test('kategori, masa ve fiyat işlemleri yazılır', () => {
  const items = recentActivityItems([
    notice('ntf_price', 'Fiyat güncellendi', 'Sushi fiyatı kaydedildi.'),
    notice('ntf_cat', 'Kategori silindi', 'Kahve menüden kaldırıldı.'),
    notice('ntf_table', 'Masa eklendi', 'Bahçe 1 eklendi.'),
    notice('ntf_waiter', 'Garson çağrıldı', 'Bahçe 1 masasından garson istendi.'),
  ])

  assert.deepEqual(
    items.map((item) => item.title),
    ['Sushi fiyatı güncellendi', 'Kahve kategorisi silindi', 'Bahçe 1 masası eklendi'],
  )
})

test('hazır kategori bildirimi yoksa liste boş kalır', () => {
  assert.deepEqual(recentActivityItems([]), [])
})
