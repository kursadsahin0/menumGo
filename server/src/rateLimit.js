import { fail } from './http.js'

const windowMs = 60_000
const hits = new Map()

export async function limitViewWrites(request, reply) {
  return limitWrites(request, reply, hits, 30)
}

const waiterHits = new Map()

export async function limitWaiterCalls(request, reply) {
  return limitWrites(request, reply, waiterHits, 4)
}

async function limitWrites(request, reply, bucket, max) {
  const now = Date.now()
  const key = request.ip || 'unknown'
  const recent = (bucket.get(key) || []).filter((time) => now - time < windowMs)

  if (recent.length >= max) {
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000))
    reply.header('Retry-After', String(retryAfter))
    throw fail(429, 'Çok fazla istek. Biraz sonra yeniden deneyin.')
  }

  recent.push(now)
  bucket.set(key, recent)

  if (bucket.size > 5000) {
    for (const [id, times] of bucket) {
      if (times.every((time) => now - time >= windowMs)) {
        bucket.delete(id)
      }
    }
  }
}
