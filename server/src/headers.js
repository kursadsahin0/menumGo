export function listenHost({ production, configured }) {
  const host = String(configured || '').trim()

  if (host) {
    return host
  }

  return production ? '127.0.0.1' : '0.0.0.0'
}

export function securityHeaders(production) {
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }

  if (production) {
    headers['Strict-Transport-Security'] = 'max-age=15552000; includeSubDomains'
  }

  return headers
}
