import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'

export function getStats(period) {
  return request({
    method: 'get',
    url: endpoints.stats.report,
    params: { period },
  })
}
