import assert from 'node:assert/strict'
import { test } from 'node:test'
import { allergenIdsMatching } from '../src/products/products.js'

test('alerjen araması kimliğe ve etikete bakar', () => {
  assert.deepEqual(allergenIdsMatching('süt'), ['milk'])
  assert.deepEqual(allergenIdsMatching('SÜT'), ['milk'])
  assert.deepEqual(allergenIdsMatching('milk'), ['milk'])
  assert.deepEqual(allergenIdsMatching('gluten'), ['gluten'])
  assert.deepEqual(allergenIdsMatching('susam'), ['sesame'])
  assert.deepEqual(allergenIdsMatching('sesame'), ['sesame'])
  assert.deepEqual(allergenIdsMatching('tree nuts'), ['nuts'])
  assert.deepEqual(allergenIdsMatching(''), [])
  assert.deepEqual(allergenIdsMatching('yokboyle'), [])
})
