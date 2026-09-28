import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'

export function getProducts(params) {
  return request({
    method: 'get',
    url: endpoints.products.list,
    params,
  })
}

export function getProduct(id) {
  return request({
    method: 'get',
    url: endpoints.products.detail(id),
  })
}

export function createProduct(payload) {
  return request({
    method: 'post',
    url: endpoints.products.list,
    data: payload,
  })
}

export function updateProduct(id, payload) {
  return request({
    method: 'patch',
    url: endpoints.products.detail(id),
    data: payload,
  })
}

export function deleteProduct(id) {
  return request({
    method: 'delete',
    url: endpoints.products.detail(id),
  })
}
