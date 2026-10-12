import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'

export function getChecks(params) {
  return request({
    method: 'get',
    url: endpoints.checks.list,
    params,
  })
}

export function getCheck(id) {
  return request({
    method: 'get',
    url: endpoints.checks.detail(id),
  })
}

export function openCheck(tableId) {
  return request({
    method: 'post',
    url: endpoints.checks.list,
    data: { tableId },
  })
}

export function addCheckItem(checkId, payload) {
  return request({
    method: 'post',
    url: endpoints.checks.items(checkId),
    data: payload,
  })
}

export function updateCheckItem(checkId, itemId, payload) {
  return request({
    method: 'patch',
    url: endpoints.checks.item(checkId, itemId),
    data: payload,
  })
}

export function removeCheckItem(checkId, itemId) {
  return request({
    method: 'delete',
    url: endpoints.checks.item(checkId, itemId),
  })
}

export function closeCheck(checkId) {
  return request({
    method: 'post',
    url: endpoints.checks.close(checkId),
  })
}
