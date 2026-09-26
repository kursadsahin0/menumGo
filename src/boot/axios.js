import { defineBoot } from '#q-app'
import { apiClient } from '@/services/api/client'
import { getToken } from '@/utils/storage'

export default defineBoot(({ app }) => {
  apiClient.interceptors.request.use((config) => {
    const token = getToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  app.config.globalProperties.$api = apiClient
})
