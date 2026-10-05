import { fail } from './http.js'

const windowMs = 60_000
const max = 30
const hits = new Map()

export async function limitViewWrites(request, reply) {
  const now = Date.now()
  const key = request.ip || 'unknown'
  const recent = (hits.get(key) || []).filter((time) => now - time < windowMs)

  if (recent.length >= max) {
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000))
    reply.header('Retry-After', String(retryAfter))
    throw fail(429, 'Çok fazla istek. Biraz sonra yeniden deneyin.')
  }

  recent.push(now)
  hits.set(key, recent)

  if (hits.size > 5000) {
    for (const [id, times] of hits) {
      if (times.every((time) => now - time >= windowMs)) {
        hits.delete(id)
      }
    }
  }
}
