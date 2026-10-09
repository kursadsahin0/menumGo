import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'

export function getTables(params) {
  return request({
    method: 'get',
    url: endpoints.tables.list,
    params,
  })
}

export function getTable(id) {
  return request({
    method: 'get',
    url: endpoints.tables.detail(id),
  })
}

export function createTable(payload) {
  return request({
    method: 'post',
    url: endpoints.tables.list,
    data: payload,
  })
}

export function updateTable(id, payload) {
  return request({
    method: 'patch',
    url: endpoints.tables.detail(id),
    data: payload,
  })
}

export function deleteTable(id) {
  return request({
    method: 'delete',
    url: endpoints.tables.detail(id),
  })
}
