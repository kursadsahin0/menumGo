import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { env } from '../env.js'

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', env.jwtSecret).update(body).digest('base64url')
  return `${body}.${signature}`
}

export function createSessionToken(userId) {
  const week = 7 * 24 * 60 * 60 * 1000

  return sign({
    sub: userId,
    exp: Date.now() + week,
  })
}

export function readSessionToken(token) {
  const [body, signature] = String(token || '').split('.')

  if (!body || !signature) {
    return null
  }

  const expected = createHmac('sha256', env.jwtSecret).update(body).digest('base64url')
  const actual = Buffer.from(signature)
  const wanted = Buffer.from(expected)

  if (actual.length !== wanted.length || !timingSafeEqual(actual, wanted)) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))

    if (!payload?.sub || payload.exp < Date.now()) {
      return null
    }

    return payload.sub
  } catch {
    return null
  }
}

export function createResetToken() {
  return randomBytes(24).toString('base64url')
}

export function hashResetToken(token) {
  return createHmac('sha256', env.jwtSecret).update(token).digest('hex')
}
