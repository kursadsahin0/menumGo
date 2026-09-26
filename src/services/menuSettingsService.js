import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'
import { mockGetMenuSettings, mockUpdateMenuSettings } from '@/mocks/menuSettings'

export function getMenuSettings() {
  return request({
    method: 'get',
    url: endpoints.menuSettings.current,
    mock: () => mockGetMenuSettings(),
  })
}

export function updateMenuSettings(payload) {
  return request({
    method: 'put',
    url: endpoints.menuSettings.current,
    data: payload,
    mock: () => mockUpdateMenuSettings(payload),
  })
}
