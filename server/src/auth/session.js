import { fail } from '../http.js'
import { readSessionToken } from './token.js'
import { findUserById } from './users.js'

export async function requireUser(request) {
  const header = request.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  const userId = readSessionToken(token)

  if (!userId) {
    throw fail(401, 'Oturumunuz sona erdi.')
  }

  const user = await findUserById(userId)

  if (!user) {
    throw fail(401, 'Oturumunuz sona erdi.')
  }

  return user
}

export function requireTenant(user) {
  if (!user.tenant) {
    throw fail(403, 'Bu hesap için işletme kaydı yok.')
  }

  return user.tenant
}
