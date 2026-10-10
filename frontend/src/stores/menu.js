import { defineStore } from 'pinia'
import { getPublicMenu } from '@/services/menuService'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    publicMenu: null,
    status: 'idle',
    error: null,
  }),

  actions: {
    async fetchPublicMenu(slug, tableId) {
      this.status = 'loading'
      this.error = null
      this.publicMenu = null

      try {
        this.publicMenu = await getPublicMenu(slug, tableId)
        this.status = 'success'
        return this.publicMenu
      } catch (error) {
        this.status = 'error'
        this.error = error
        throw error
      }
    },
  },
})
