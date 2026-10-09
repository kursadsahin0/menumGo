import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readTableInput } from '../src/tables/tables.js'

test('yeni masa açık kaydolur, kapalı da seçilebilir', () => {
  assert.equal(readTableInput({ name: 'Bahçe', tableNumber: '1' }).isActive, true)
  assert.equal(
    readTableInput({ name: 'Bahçe', tableNumber: '1', isActive: false }).isActive,
    false,
  )
})

test('kısmi kayıt yalnızca gönderilen durumu değiştirir', () => {
  assert.equal('isActive' in readTableInput({ name: 'Bahçe' }, { partial: true }), false)
  assert.equal(readTableInput({ isActive: false }, { partial: true }).isActive, false)
})

test('masa durumu yalnızca açık veya kapalı olabilir', () => {
  assert.throws(() => readTableInput({ isActive: 'false' }, { partial: true }), (error) => error.statusCode === 422)
})
