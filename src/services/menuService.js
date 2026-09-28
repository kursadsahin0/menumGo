import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'
import { mockListMenus } from '@/mocks/menus'

export function listMenus() {
  return request({
    method: 'get',
    url: endpoints.menus.list,
    mock: () => mockListMenus(),
  })
}

export function getPublicMenu(slug) {
  return request({
    method: 'get',
    url: endpoints.menus.public(slug),
  })
}
