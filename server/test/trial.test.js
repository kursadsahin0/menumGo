import assert from 'node:assert/strict'
import { test } from 'node:test'
import { opensPanel, subscriptionState, trialDays, trialDeadline } from '../src/subscription/record.js'

test('deneme 7 gün sürer', () => {
  const start = new Date('2026-10-09T12:00:00.000Z')
  const end = trialDeadline(start)

  assert.equal(trialDays, 7)
  assert.equal(end.getTime() - start.getTime(), 7 * 24 * 60 * 60 * 1000)
})

test('süresi dolmamış deneme paneli açar', () => {
  const now = new Date('2026-10-09T12:00:00.000Z')
  const subscription = {
    status: 'trial',
    currentPeriodEnd: new Date('2026-10-16T12:00:00.000Z'),
  }
  const state = subscriptionState(subscription, now)

  assert.equal(state.status, 'trial')
  assert.equal(state.trialEndsAt, '2026-10-16T12:00:00.000Z')
  assert.equal(opensPanel(subscription, now), true)
})

test('süresi biten deneme kapanır', () => {
  const now = new Date('2026-10-16T12:00:00.000Z')
  const subscription = {
    status: 'trial',
    currentPeriodEnd: now,
  }

  assert.equal(subscriptionState(subscription, now).status, 'inactive')
  assert.equal(opensPanel(subscription, now), false)
})

test('ödenmiş hesap deneme bitse de açık kalır', () => {
  const now = new Date('2027-01-01T00:00:00.000Z')
  const subscription = {
    status: 'active',
    currentPeriodEnd: new Date('2026-10-16T12:00:00.000Z'),
  }
  const state = subscriptionState(subscription, now)

  assert.equal(state.status, 'active')
  assert.equal(state.trialEndsAt, null)
  assert.equal(opensPanel(subscription, now), true)
})

test('iptal edilmiş hesap kapalı kalır', () => {
  const now = new Date('2026-10-10T12:00:00.000Z')
  const subscription = {
    status: 'inactive',
    currentPeriodEnd: new Date('2026-10-16T12:00:00.000Z'),
  }

  assert.equal(opensPanel(subscription, now), false)
})
