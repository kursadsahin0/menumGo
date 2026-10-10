import { sessionTtlMs } from './token.js'

const cookieName = 'menumgo_session'

export function requestIsSecure(request) {
  const forwarded = String(request.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim()
    .toLowerCase()

  return forwarded === 'https' || request.protocol === 'https'
}

export function readSessionCookie(header) {
  for (const part of String(header || '').split(';')) {
    const piece = part.trim()
    const separator = piece.indexOf('=')

    if (separator === -1 || piece.slice(0, separator) !== cookieName) {
      continue
    }

    try {
      return decodeURIComponent(piece.slice(separator + 1))
    } catch {
      return ''
    }
  }

  return ''
}

export function sessionCookie(token, { secure, remember }) {
  const parts = [
    `${cookieName}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
  ]

  if (remember) {
    parts.push(`Max-Age=${Math.floor(sessionTtlMs / 1000)}`)
  }

  if (secure) {
    parts.push('Secure')
  }

  return parts.join('; ')
}

export function clearSessionCookie(secure) {
  const parts = [`${cookieName}=`, 'HttpOnly', 'SameSite=Lax', 'Path=/', 'Max-Age=0']

  if (secure) {
    parts.push('Secure')
  }

  return parts.join('; ')
}
