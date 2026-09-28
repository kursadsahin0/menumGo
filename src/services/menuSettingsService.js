import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'

export function getMenuSettings() {
  return request({
    method: 'get',
    url: endpoints.menuSettings.current,
  })
}

export function updateMenuSettings(payload) {
  return request({
    method: 'put',
    url: endpoints.menuSettings.current,
    data: payload,
  })
}
