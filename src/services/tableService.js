import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'
import {
  mockCreateTable,
  mockDeleteTable,
  mockGetTable,
  mockGetTables,
  mockUpdateTable,
} from '@/mocks/tables'

export function getTables() {
  return request({
    method: 'get',
    url: endpoints.tables.list,
    mock: () => mockGetTables(),
  })
}

export function getTable(id) {
  return request({
    method: 'get',
    url: endpoints.tables.detail(id),
    mock: () => mockGetTable(id),
  })
}

export function createTable(payload) {
  return request({
    method: 'post',
    url: endpoints.tables.list,
    data: payload,
    mock: () => mockCreateTable(payload),
  })
}

export function updateTable(id, payload) {
  return request({
    method: 'patch',
    url: endpoints.tables.detail(id),
    data: payload,
    mock: () => mockUpdateTable(id, payload),
  })
}

export function deleteTable(id) {
  return request({
    method: 'delete',
    url: endpoints.tables.detail(id),
    mock: () => mockDeleteTable(id),
  })
}
