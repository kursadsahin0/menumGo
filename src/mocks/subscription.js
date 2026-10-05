import { wait } from '@/mocks/config'

const DB_KEY = 'qr_menu.mock.subscription'

function blankSubscription() {
  return {
    id: 'sub_demo',
    status: 'active',
  }
}

function loadSubscription() {
  try {
    const raw = localStorage.getItem(DB_KEY)

    if (!raw) {
      const subscription = blankSubscription()
      saveSubscription(subscription)
      return subscription
    }

    const saved = JSON.parse(raw)

    return {
      id: saved.id || 'sub_demo',
      status: saved.status === 'inactive' ? 'inactive' : 'active',
    }
  } catch {
    return blankSubscription()
  }
}

function saveSubscription(subscription) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(subscription))
  } catch {
    // Ignore storage failures in mock mode.
  }
}

export async function mockGetCurrentSubscription() {
  await wait(80)
  return loadSubscription()
}

export async function mockCreateCheckout(payload) {
  await wait()
  const next = {
    ...loadSubscription(),
    status: 'active',
    provider: payload?.provider || null,
  }

  saveSubscription(next)

  return {
    id: `chk_${Date.now()}`,
    provider: next.provider,
    status: 'mock',
    url: null,
    subscription: { id: next.id, status: next.status },
  }
}

export async function mockCancelSubscription() {
  await wait()
  const next = {
    ...loadSubscription(),
    status: 'inactive',
  }

  saveSubscription(next)
  return { id: next.id, status: next.status }
}
