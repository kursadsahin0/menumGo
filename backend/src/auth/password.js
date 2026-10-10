import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const derived = await scryptAsync(password, salt, 64)
  return `scrypt$${salt}$${derived.toString('hex')}`
}

export async function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored || '').split('$')

  if (scheme !== 'scrypt' || !salt || !hash) {
    return false
  }

  const derived = await scryptAsync(password, salt, 64)
  const actual = Buffer.from(hash, 'hex')

  if (actual.length !== derived.length) {
    return false
  }

  return timingSafeEqual(actual, derived)
}
