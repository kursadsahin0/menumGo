import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'
import { mockGetStats } from '@/mocks/stats'

export function getStats(period) {
  return request({
    method: 'get',
    url: endpoints.stats.report,
    params: { period },
    mock: () => mockGetStats({ period }),
  })
}
