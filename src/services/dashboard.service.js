import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'

export function getDashboard() {
  return request({
    method: 'get',
    url: endpoints.dashboard.overview,
  })
}
