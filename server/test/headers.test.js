import assert from 'node:assert/strict'
import { test } from 'node:test'
import { listenHost, securityHeaders } from '../src/headers.js'
import { clearSessionCookie, readSessionCookie, sessionCookie } from '../src/auth/cookie.js'

test('üretim dinleme adresi bu makineyle sınırlıdır', () => {
  assert.equal(listenHost({ production: true, configured: '' }), '127.0.0.1')
  assert.equal(listenHost({ production: false, configured: '' }), '0.0.0.0')
  assert.equal(listenHost({ production: true, configured: '0.0.0.0' }), '0.0.0.0')
})

test('api yanıtında güvenlik başlıkları vardır', () => {
  const local = securityHeaders(false)
  const production = securityHeaders(true)

  assert.equal(local['X-Content-Type-Options'], 'nosniff')
  assert.equal(local['X-Frame-Options'], 'DENY')
  assert.match(local['Content-Security-Policy'], /default-src 'none'/)
  assert.equal(local['Strict-Transport-Security'], undefined)
  assert.match(production['Strict-Transport-Security'], /max-age=/)
})

test('oturum çerezi tarayıcı betiğinden okunamaz', () => {
  const header = sessionCookie('oturum.anahtari', { secure: false, remember: true })

  assert.equal(header.includes('HttpOnly'), true)
  assert.equal(header.includes('SameSite=Lax'), true)
  assert.equal(header.includes('Secure'), false)
  assert.equal(readSessionCookie(header), 'oturum.anahtari')
  assert.equal(clearSessionCookie(true).includes('Max-Age=0'), true)
  assert.equal(clearSessionCookie(true).includes('Secure'), true)
})
