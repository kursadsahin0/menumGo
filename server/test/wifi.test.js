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

test('wifi alanları masa yokken misafire kapanır', async () => {
  process.env.DATABASE_URL ||= 'postgresql://localhost:5432/menumgo'
  process.env.JWT_SECRET ||= 'test-jwt-secret'
  process.env.WIFI_SECRET ||= 'test-wifi-secret-value'

  const { toPublicSettings } = await import('../src/menuSettings/settings.js')
  const source = { wifiName: 'Kafe', wifiPassword: 'gizli' }
  const hidden = toPublicSettings(source, { name: 'Kafe' }, { includeWifiPassword: false, includeWifi: false })
  const atTable = toPublicSettings(source, { name: 'Kafe' }, { includeWifiPassword: false, includeWifi: true })

  assert.equal(hidden.wifiName, '')
  assert.equal(hidden.hasWifiPassword, false)
  assert.equal(hidden.wifiAtTable, true)
  assert.equal('wifiPassword' in hidden, false)
  assert.equal(atTable.wifiName, 'Kafe')
  assert.equal(atTable.hasWifiPassword, true)
  assert.equal(atTable.wifiAtTable, false)
  assert.equal('wifiPassword' in atTable, false)

  const none = toPublicSettings({}, { name: 'Kafe' }, { includeWifiPassword: false, includeWifi: false })
  assert.equal(none.wifiAtTable, false)
})
