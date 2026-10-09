import assert from 'node:assert/strict'
import { test } from 'node:test'

test('wifi şifresi düz metin olarak saklanmaz', async () => {
  process.env.DATABASE_URL ||= 'postgresql://localhost:5432/menumgo'
  process.env.JWT_SECRET ||= 'test-jwt-secret'
  process.env.WIFI_SECRET ||= 'test-wifi-secret-value'

  const { openWifiPassword, sealWifiPassword } = await import('../src/menuSettings/wifi.js')
  const plain = 'masa-sifresi'
  const sealed = sealWifiPassword(plain)

  assert.equal(sealed.startsWith('enc1:'), true)
  assert.equal(sealed.includes(plain), false)
  assert.equal(openWifiPassword(sealed), plain)
  assert.equal(sealWifiPassword(''), '')
  assert.equal(openWifiPassword(''), '')
})
