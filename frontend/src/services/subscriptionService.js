import { endpoints } from '@/services/api/endpoints'
import { request } from '@/services/api/http'

export function getCurrentSubscription() {
  return request({
    method: 'get',
    url: endpoints.subscription.current,
  })
}
