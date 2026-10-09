import { prisma } from '../db.js'

export const viewRetentionDays = 90
export const viewRetentionMs = viewRetentionDays * 24 * 60 * 60 * 1000

const pruneGapMs = 60 * 60 * 1000
let lastPrune = 0
let pending = null

export function viewCutoff(now = new Date()) {
  return new Date(now.getTime() - viewRetentionMs)
}

export function pruneExpiredViews({ force = false } = {}) {
  const now = Date.now()

  if (pending) {
    return pending
  }

  if (!force && now - lastPrune < pruneGapMs) {
    return Promise.resolve()
  }

  lastPrune = now
  const cutoff = viewCutoff(new Date(now))
  pending = Promise.all([
    prisma.menuView.deleteMany({ where: { createdAt: { lt: cutoff } } }),
    prisma.productView.deleteMany({ where: { createdAt: { lt: cutoff } } }),
  ]).finally(() => {
    pending = null
  })

  return pending
}
