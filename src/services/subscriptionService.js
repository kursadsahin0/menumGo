import {
  mockCancelSubscription,
  mockCreateCheckout,
  mockGetCurrentSubscription,
  mockGetPlans,
} from '@/mocks/subscription'
import { endpoints } from '@/services/api/endpoints'
import { request } from '@/services/api/http'

export function getCurrentSubscription() {
  return request({
    method: 'get',
    url: endpoints.subscription.current,
    mock: () => mockGetCurrentSubscription(),
  })
}

export function getPlans() {
  return request({
    method: 'get',
    url: endpoints.subscription.plans,
    mock: () => mockGetPlans(),
  })
}

export function createCheckout(payload) {
  return request({
    method: 'post',
    url: endpoints.subscription.checkout,
    data: {
      planId: payload?.planId,
      provider: payload?.provider || null,
    },
    mock: ({ data }) => mockCreateCheckout(data),
  })
}

export function cancelSubscription() {
  return request({
    method: 'post',
    url: endpoints.subscription.cancel,
    mock: () => mockCancelSubscription(),
  })
}
