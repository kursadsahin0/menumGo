import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'
import {
  mockCreateProduct,
  mockDeleteProduct,
  mockGetProduct,
  mockGetProducts,
  mockUpdateProduct,
} from '@/mocks/products'

export function getProducts(params) {
  return request({
    method: 'get',
    url: endpoints.products.list,
    params,
    mock: () => mockGetProducts(params),
  })
}

export function getProduct(id) {
  return request({
    method: 'get',
    url: endpoints.products.detail(id),
    mock: () => mockGetProduct(id),
  })
}

export function createProduct(payload) {
  return request({
    method: 'post',
    url: endpoints.products.list,
    data: payload,
    mock: () => mockCreateProduct(payload),
  })
}

export function updateProduct(id, payload) {
  return request({
    method: 'patch',
    url: endpoints.products.detail(id),
    data: payload,
    mock: () => mockUpdateProduct(id, payload),
  })
}

export function deleteProduct(id) {
  return request({
    method: 'delete',
    url: endpoints.products.detail(id),
    mock: () => mockDeleteProduct(id),
  })
}
