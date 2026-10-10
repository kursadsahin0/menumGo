const dayMs = 24 * 60 * 60 * 1000

export function trialDaysRemaining(trialEndsAt, now = Date.now()) {
  const ends = new Date(trialEndsAt).getTime()

  if (!Number.isFinite(ends)) {
    return 0
  }

  const left = ends - now

  if (left <= 0) {
    return 0
  }

  return Math.ceil(left / dayMs)
}
