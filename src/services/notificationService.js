import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'

export function getNotifications() {
  return request({
    method: 'get',
    url: endpoints.notifications.list,
  })
}

export function clearNotifications() {
  return request({
    method: 'delete',
    url: endpoints.notifications.clear,
  })
}

export function markNotificationsRead() {
  return request({
    method: 'post',
    url: endpoints.notifications.read,
  })
}
