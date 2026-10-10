import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'

export function getNotifications(before) {
  return request({
    method: 'get',
    url: endpoints.notifications.list,
    params: before ? { before } : undefined,
  })
}

export function clearNotifications(ids) {
  return request({
    method: 'delete',
    url: endpoints.notifications.clear,
    data: { ids },
  })
}

export function markNotificationsRead(ids) {
  return request({
    method: 'post',
    url: endpoints.notifications.read,
    data: { ids },
  })
}

export function getPushPublicKey() {
  return request({
    method: 'get',
    url: endpoints.push.publicKey,
  })
}

export function savePushSubscription(subscription) {
  return request({
    method: 'put',
    url: endpoints.push.subscription,
    data: subscription,
  })
}

export function removePushSubscription(endpoint) {
  return request({
    method: 'delete',
    url: endpoints.push.subscription,
    data: { endpoint },
  })
}
