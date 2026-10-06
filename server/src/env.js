import { readFileSync, existsSync } from 'node:fs'
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
    const value = trimmed.slice(separator + 1).trim()

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
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
}

if (!env.databaseUrl || !env.jwtSecret) {
  throw new Error('server/.env içinde DATABASE_URL ve JWT_SECRET olmalı.')
}
