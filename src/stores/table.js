import { defineStore } from 'pinia'
import { createTable, deleteTable, getTable, getTables, updateTable } from '@/services/tableService'

export const useTableStore = defineStore('table', {
  state: () => ({
    tables: [],
    status: 'idle',
    error: null,
  }),

  actions: {
    async fetchTables() {
      this.status = 'loading'
      this.error = null

      try {
        this.tables = await getTables()
        this.status = 'success'
      } catch (error) {
        this.status = 'error'
        this.error = error
      }
    },

    async fetchTable(id) {
      return getTable(id)
    },

    async saveTable(payload, id) {
      this.error = null

      try {
        const table = id ? await updateTable(id, payload) : await createTable(payload)
        await this.fetchTables()
        return table
      } catch (error) {
        this.error = error
        throw error
      }
    },

    async removeTable(id) {
      this.error = null

      try {
        await deleteTable(id)
        await this.fetchTables()
      } catch (error) {
        this.error = error
        throw error
      }
    },

    async patchTable(id, payload) {
      this.error = null

      try {
        await updateTable(id, payload)
        await this.fetchTables()
      } catch (error) {
        this.error = error
        throw error
      }
    },
  },
})
