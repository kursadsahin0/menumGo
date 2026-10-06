import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'

export function getPublicMenu(slug, tableId) {
  return request({
    method: 'get',
    url: endpoints.menus.public(slug),
    params: tableId ? { table: tableId } : undefined,
  })
}

export function recordMenuView(slug, language, tableId) {
  return request({
    method: 'post',
    url: endpoints.menus.view(slug),
    data: {
      language: language === 'en' ? 'en' : 'tr',
      tableId: tableId || null,
    },
  }).catch(() => null)
}

export function requestWaiter(slug, tableId) {
  return request({
    method: 'post',
    url: endpoints.menus.waiter(slug),
    data: { tableId: tableId || null },
  })
}

export function recordProductView(slug, productId) {
  return request({
    method: 'post',
    url: endpoints.menus.productView(slug, productId),
  }).catch(() => null)
}
