import { defineBoot } from '#q-app'
import { apiClient } from '@/services/api/client'

export default defineBoot(({ app }) => {
  app.config.globalProperties.$api = apiClient
})
