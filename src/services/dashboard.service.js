import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'
import { mockGetDashboard } from '@/mocks/dashboard'

export function getDashboard() {
  return request({
    method: 'get',
    url: endpoints.dashboard.overview,
    mock: () => mockGetDashboard(),
  })
}
