import { defineStore } from 'pinia'
import { getStats } from '@/services/stats.service'

export const useStatsStore = defineStore('stats', {
  state: () => ({
    report: null,
    period: '7d',
    status: 'idle',
    error: null,
  }),

  actions: {
    async fetchReport(period = this.period) {
      this.period = period
      this.status = 'loading'
      this.error = null

      try {
        this.report = await getStats(period)
        this.status = 'success'
      } catch (error) {
        this.status = 'error'
        this.error = error
      }
    },
  },
})
