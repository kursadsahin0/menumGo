import { defineStore } from 'pinia'
import { getPublicMenu, listMenus } from '@/services/menuService'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menus: [],
    publicMenu: null,
    status: 'idle',
    error: null,
  }),

  actions: {
    async fetchMenus() {
      this.status = 'loading'
      this.error = null

      try {
        this.menus = await listMenus()
        this.status = 'success'
      } catch (error) {
        this.status = 'error'
        this.error = error
        throw error
      }
    },

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
