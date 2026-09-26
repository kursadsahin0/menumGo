import { apiClient } from '@/services/api/client'
import { isMockEnabled } from '@/mocks/config'
import { toApiError } from '@/utils/errors'

export async function request({ method, url, data, params, mock }) {
  if (isMockEnabled() && typeof mock === 'function') {
    return mock({ data, params, url })
  }

  try {
    const response = await apiClient.request({ method, url, data, params })
    return response.data
  } catch (error) {
    throw toApiError(error)
  }
}
