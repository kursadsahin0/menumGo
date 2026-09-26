import { createDefaultSubscription, plans } from '@/data/plans'
import { wait } from '@/mocks/config'
import { ApiError } from '@/utils/errors'

const DB_KEY = 'qr_menu.mock.subscription'

function loadSubscription() {
  try {
    const raw = localStorage.getItem(DB_KEY)

    if (!raw) {
      const subscription = createDefaultSubscription()
      saveSubscription(subscription)
      return subscription
    }

    return { ...createDefaultSubscription(), ...JSON.parse(raw) }
  } catch {
    return createDefaultSubscription()
  }
}

function saveSubscription(subscription) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(subscription))
  } catch {
    // Ignore storage failures in mock mode.
  }
}

function requirePlan(planId) {
  const plan = plans.find((entry) => entry.id === planId)

  if (!plan) {
    throw new ApiError('Plan bulunamadı.', { status: 404 })
  }

  return plan
}

export async function mockGetPlans() {
  await wait(80)
  return plans.map((plan) => ({ ...plan }))
}

export async function mockGetCurrentSubscription() {
  await wait(80)
  return loadSubscription()
}

export async function mockCreateCheckout(payload) {
  await wait()
  const plan = requirePlan(payload?.planId)
  const current = loadSubscription()
  const next = {
    ...current,
    planId: plan.id,
    status: 'active',
    provider: payload?.provider || null,
    cancelAtPeriodEnd: false,
  }

  saveSubscription(next)

  return {
    id: `chk_${Date.now()}`,
    provider: next.provider,
    planId: plan.id,
    status: 'mock',
    url: null,
    subscription: { ...next },
  }
}

export async function mockCancelSubscription() {
  await wait()
  const current = loadSubscription()

  if (current.cancelAtPeriodEnd) {
    return { ...current }
  }

  const next = {
    ...current,
    status: 'active',
    cancelAtPeriodEnd: true,
  }

  saveSubscription(next)
  return { ...next }
}
