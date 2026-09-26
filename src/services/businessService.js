import { mockGetBusiness, mockUpdateBusiness } from '@/mocks/business'
import { endpoints } from '@/services/api/endpoints'
import { request } from '@/services/api/http'

export function getBusiness() {
  return request({
    method: 'get',
    url: endpoints.business.current,
    mock: () => mockGetBusiness(),
  })
}

export function updateBusiness(payload) {
  return request({
    method: 'put',
    url: endpoints.business.current,
    data: payload,
    mock: () => mockUpdateBusiness(payload),
  })
}
