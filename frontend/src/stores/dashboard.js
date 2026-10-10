import { defineStore } from 'pinia'
import { getDashboard } from '@/services/dashboard.service'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    overview: null,
    status: 'idle',
    error: null,
  }),

  actions: {
    async fetchOverview() {
      this.status = 'loading'
      this.error = null

      try {
        this.overview = await getDashboard()
        this.status = 'success'
      } catch (error) {
        this.status = 'error'
        this.error = error
      }
    },
  },
})
