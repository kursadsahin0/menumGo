import {
  mockCancelSubscription,
  mockCreateCheckout,
  mockGetCurrentSubscription,
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

export function createCheckout(payload) {
  return request({
    method: 'post',
    url: endpoints.subscription.checkout,
    data: {
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
