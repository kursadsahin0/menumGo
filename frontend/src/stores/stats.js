import { defineStore } from 'pinia'
import { getStats } from '@/services/stats.service'

export const useStatsStore = defineStore('stats', {
  state: () => ({
    report: null,
    period: '7d',
    failedPeriod: null,
    status: 'idle',
    error: null,
  }),

  actions: {
    async fetchReport(period = this.failedPeriod || this.period) {
      this.status = 'loading'
      this.error = null

      try {
        this.report = await getStats(period)
        this.period = period
        this.failedPeriod = null
        this.status = 'success'
      } catch (error) {
        this.failedPeriod = period
        this.status = 'error'
        this.error = error
      }
    },
  },
})
