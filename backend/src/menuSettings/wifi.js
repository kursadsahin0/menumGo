import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { env } from '../env.js'
import { fail } from '../http.js'

const sealedPattern = /^enc1:[A-Za-z0-9_-]+:[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$/

function key() {
  if (!env.wifiSecret) {
    throw fail(500, 'Wi-Fi şifresi okunamadı.')
  }

  return createHash('sha256').update(env.wifiSecret).digest()
}

export function isSealedWifiPassword(value) {
  return sealedPattern.test(String(value || ''))
}

export function sealWifiPassword(plain) {
  const text = String(plain || '')

  if (!text) {
    return ''
  }

  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return `enc1:${iv.toString('base64url')}:${tag.toString('base64url')}:${encrypted.toString('base64url')}`
}

export function openWifiPassword(stored) {
  const value = String(stored || '')

  if (!value || !isSealedWifiPassword(value)) {
    return value
  }

  const [, iv, tag, data] = value.split(':')

  try {
    const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64url'))
    decipher.setAuthTag(Buffer.from(tag, 'base64url'))
    return Buffer.concat([
      decipher.update(Buffer.from(data, 'base64url')),
      decipher.final(),
    ]).toString('utf8')
  } catch {
    throw fail(500, 'Wi-Fi şifresi okunamadı.')
  }
}
