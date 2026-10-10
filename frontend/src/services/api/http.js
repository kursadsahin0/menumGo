import { apiClient } from '@/services/api/client'
import { toApiError } from '@/utils/errors'

export async function request({ method, url, data, params }) {
  try {
    const response = await apiClient.request({ method, url, data, params })
    return response.data
  } catch (error) {
    throw toApiError(error)
  }
}
