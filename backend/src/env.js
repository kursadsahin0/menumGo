import { randomBytes } from 'node:crypto'
import { listenHost } from './headers.js'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { BlockList, isIP } from 'node:net'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = resolve(root, '.env')

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const separator = trimmed.indexOf('=')

    if (separator === -1) {
      continue
    }

    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    // Gmail uygulama şifreleri yapıştırılırken boşluk gelebiliyor
    if (key === 'SMTP_PASS') {
      value = value.replace(/\s+/g, '')
    }

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

if (!process.env.WIFI_SECRET) {
  const secret = randomBytes(32).toString('hex')
  process.env.WIFI_SECRET = secret

  if (existsSync(envPath)) {
    const text = readFileSync(envPath, 'utf8')
    const line = `WIFI_SECRET=${secret}`
    const next = /^WIFI_SECRET=.*$/m.test(text)
      ? text.replace(/^WIFI_SECRET=.*$/m, line)
      : `${text.endsWith('\n') || !text ? text : `${text}\n`}${line}\n`
    writeFileSync(envPath, next)
  }
}

const privatePeers = new BlockList()

for (const [address, prefix, family] of [
  ['127.0.0.0', 8, 'ipv4'],
  ['10.0.0.0', 8, 'ipv4'],
  ['172.16.0.0', 12, 'ipv4'],
  ['192.168.0.0', 16, 'ipv4'],
  ['::1', 128, 'ipv6'],
  ['fc00::', 7, 'ipv6'],
  ['fe80::', 10, 'ipv6'],
]) {
  privatePeers.addSubnet(address, prefix, family)
}

function isPrivatePeer(address) {
  const host = String(address || '').replace(/^::ffff:/i, '')
  const family = isIP(host)

  if (!family) {
    return false
  }

  return privatePeers.check(host, family === 6 ? 'ipv6' : 'ipv4')
}

function readTrustProxy(value) {
  const text = String(value || '').trim()
  const normalized = text.toLowerCase()

  if (!normalized) {
    return isPrivatePeer
  }

  if (normalized === 'false' || normalized === '0') {
    return false
  }

  if (normalized === 'true') {
    return true
  }

  if (/^\d+$/.test(normalized)) {
    return Number(normalized)
  }

  return text
}

function readOrigins(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap((item) => {
      try {
        const url = new URL(item)

        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          return []
        }

        return [url.origin]
      } catch {
        return []
      }
    })
}

export const env = {
  production: process.env.NODE_ENV === 'production',
  host: listenHost({
    production: process.env.NODE_ENV === 'production',
    configured: process.env.HOST,
  }),
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  appUrl: process.env.APP_URL || 'http://localhost:9000',
  corsOrigins: [
    ...new Set([
      ...readOrigins(process.env.APP_URL || 'http://localhost:9000'),
      ...readOrigins(process.env.CORS_ORIGINS),
    ]),
  ],
  mailFrom: process.env.MAIL_FROM || 'menümGo <noreply@menumgo.local>',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpSecure: process.env.SMTP_SECURE === 'true',
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
  vapidSubject: process.env.VAPID_SUBJECT || 'mailto:noreply@menumgo.local',
  activationKey: process.env.ACTIVATION_KEY || '',
  wifiSecret: process.env.WIFI_SECRET || '',
  trustProxy: readTrustProxy(process.env.TRUST_PROXY),
}

if (!env.databaseUrl || !env.jwtSecret) {
  throw new Error('backend/.env içinde DATABASE_URL ve JWT_SECRET olmalı.')
}
