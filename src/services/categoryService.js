import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'
import {
  mockCreateCategory,
  mockDeleteCategory,
  mockGetCategories,
  mockGetCategory,
  mockUpdateCategory,
  mockUpdateCategoryOrder,
} from '@/mocks/categories'

export function getCategories() {
  return request({
    method: 'get',
    url: endpoints.categories.list,
    mock: () => mockGetCategories(),
  })
}

export function getCategory(id) {
  return request({
    method: 'get',
    url: endpoints.categories.detail(id),
    mock: () => mockGetCategory(id),
  })
}

export function createCategory(payload) {
  return request({
    method: 'post',
    url: endpoints.categories.list,
    data: payload,
    mock: () => mockCreateCategory(payload),
  })
}

export function updateCategory(id, payload) {
  return request({
    method: 'patch',
    url: endpoints.categories.detail(id),
    data: payload,
    mock: () => mockUpdateCategory(id, payload),
  })
}

export function deleteCategory(id) {
  return request({
    method: 'delete',
    url: endpoints.categories.detail(id),
    mock: () => mockDeleteCategory(id),
  })
}

export function updateCategoryOrder(ids) {
  return request({
    method: 'patch',
    url: endpoints.categories.order,
    data: { ids },
    mock: () => mockUpdateCategoryOrder(ids),
  })
}
