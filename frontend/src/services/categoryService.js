import { request } from '@/services/api/http'
import { endpoints } from '@/services/api/endpoints'

export function getCategories(params) {
  return request({
    method: 'get',
    url: endpoints.categories.list,
    params,
  })
}

export async function getAllCategories() {
  const items = []

  for (let page = 1; page <= 50; page += 1) {
    const result = await getCategories({ page, pageSize: 100 })
    items.push(...result.items)

    if (!result.hasMore) {
      return items
    }
  }

  return items
}

export function getCategory(id) {
  return request({
    method: 'get',
    url: endpoints.categories.detail(id),
  })
}

export function createCategory(payload) {
  return request({
    method: 'post',
    url: endpoints.categories.list,
    data: payload,
  })
}

export function updateCategory(id, payload) {
  return request({
    method: 'patch',
    url: endpoints.categories.detail(id),
    data: payload,
  })
}

export function deleteCategory(id) {
  return request({
    method: 'delete',
    url: endpoints.categories.detail(id),
  })
}

export function updateCategoryOrder(ids) {
  return request({
    method: 'patch',
    url: endpoints.categories.order,
    data: { ids },
  })
}
