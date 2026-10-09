import { fail } from '../http.js'

export const panelPlan = {
  name: 'Tek seferlik panel',
  amount: 9900,
  provider: 'telefon',
}

export const trialDays = 7
const dayMs = 24 * 60 * 60 * 1000

export function trialDeadline(from = new Date()) {
  return new Date(from.getTime() + trialDays * dayMs)
}

export function subscriptionState(subscription, now = new Date()) {
  if (subscription?.status === 'active') {
    return { status: 'active', trialEndsAt: null }
  }

  const ends = subscription?.status === 'trial' ? subscription.currentPeriodEnd : null

  if (ends && ends.getTime() > now.getTime()) {
    return { status: 'trial', trialEndsAt: ends.toISOString() }
  }

  return { status: 'inactive', trialEndsAt: null }
}

export function opensPanel(subscription, now = new Date()) {
  const status = subscriptionState(subscription, now).status
  return status === 'active' || status === 'trial'
}

export function toPublicSubscription(subscription, now = new Date()) {
  const state = subscriptionState(subscription, now)

  if (!subscription) {
    return {
      id: null,
      status: 'inactive',
      plan: panelPlan.name,
      amount: null,
      paidAt: null,
      provider: null,
      trialEndsAt: null,
    }
  }

  return {
    id: subscription.id,
    status: state.status,
    plan: subscription.plan || panelPlan.name,
    amount: subscription.amount == null ? null : Number(subscription.amount),
    paidAt: subscription.paidAt ? subscription.paidAt.toISOString() : null,
    provider: subscription.provider || null,
    trialEndsAt: state.trialEndsAt,
  }
}

export function readPlan(value, fallback) {
  if (value == null || value === '') {
    return fallback
  }

  const plan = String(value).trim()

  if (!plan || plan.length > 40) {
    throw fail(422, 'Plan geçersiz.')
  }

  return plan
}

export function readAmount(value, fallback) {
  if (value == null || value === '') {
    return fallback
  }

  const amount = Number(value)

  if (!Number.isFinite(amount) || amount < 0 || amount > 1_000_000) {
    throw fail(422, 'Tutar geçersiz.')
  }

  return Math.round(amount * 100) / 100
}

export function readPaidAt(value, fallback) {
  if (value == null || value === '') {
    return fallback
  }

  const paidAt = new Date(value)

  if (Number.isNaN(paidAt.getTime())) {
    throw fail(422, 'Ödeme tarihi geçersiz.')
  }

  return paidAt
}

export function readProvider(value, fallback) {
  if (value == null || value === '') {
    return fallback
  }

  const provider = String(value).trim()

  if (!provider || provider.length > 40) {
    throw fail(422, 'Sağlayıcı geçersiz.')
  }

  return provider
}

export function moneyOr(value, fallback) {
  return value == null ? fallback : Number(value)
}
