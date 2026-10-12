import { defineStore } from 'pinia'
import {
  addCheckItem,
  closeCheck,
  getChecks,
  openCheck,
  removeCheckItem,
  updateCheckItem,
} from '@/services/checkService'
import { getProducts } from '@/services/productService'
import { getTables } from '@/services/tableService'

async function collectPages(fetchPage) {
  const items = []

  for (let page = 1; page <= 50; page += 1) {
    const result = await fetchPage(page)
    items.push(...(result.items || []))

    if (!result.hasMore) {
      return items
    }
  }

  return items
}

export const useCheckStore = defineStore('check', {
  state: () => ({
    tables: [],
    products: [],
    openChecks: [],
    selectedTableId: null,
    activeCheck: null,
    status: 'idle',
    error: null,
    saving: false,
  }),

  getters: {
    openByTableId(state) {
      const map = new Map()
      for (const check of state.openChecks) {
        map.set(check.tableId, check)
      }
      return map
    },

    selectedTable(state) {
      return state.tables.find((table) => table.id === state.selectedTableId) || null
    },
  },

  actions: {
    async loadWorkspace() {
      this.status = 'loading'
      this.error = null

      try {
        const tablesResult = await collectPages((page) => getTables({ page, pageSize: 100 }))
        this.tables = tablesResult.filter((table) => table.isActive)

        const [productsResult, openChecksResult] = await Promise.allSettled([
          collectPages((page) => getProducts({ page, pageSize: 100, status: 'all' })),
          getChecks({ status: 'open' }),
        ])

        if (productsResult.status === 'fulfilled') {
          this.products = productsResult.value.filter((product) => product.isAvailable !== false)
        } else {
          this.products = []
          this.error = productsResult.reason
        }

        if (openChecksResult.status === 'fulfilled') {
          this.openChecks = openChecksResult.value
        } else {
          this.openChecks = []
          this.error = this.error || openChecksResult.reason
        }

        if (this.selectedTableId) {
          this.activeCheck = this.openByTableId.get(this.selectedTableId) || null
        }

        this.status = 'success'
      } catch (error) {
        this.status = 'error'
        this.error = error
      }
    },

    async selectTable(tableId) {
      this.selectedTableId = tableId
      this.error = null
      const existing = this.openByTableId.get(tableId)

      if (existing) {
        this.activeCheck = existing
        return existing
      }

      this.activeCheck = null
      return null
    },

    async ensureOpenCheck() {
      if (!this.selectedTableId) {
        throw new Error('Masa seçin.')
      }

      this.saving = true
      this.error = null

      try {
        const check = await openCheck(this.selectedTableId)
        this.upsertOpen(check)
        this.activeCheck = check
        return check
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.saving = false
      }
    },

    upsertOpen(check) {
      const index = this.openChecks.findIndex((row) => row.id === check.id)
      if (index >= 0) {
        this.openChecks[index] = check
      } else {
        this.openChecks = [check, ...this.openChecks.filter((row) => row.tableId !== check.tableId)]
      }
    },

    removeOpen(checkId) {
      this.openChecks = this.openChecks.filter((row) => row.id !== checkId)
    },

    async addProduct(productId, quantity = 1) {
      let check = this.activeCheck

      if (!check) {
        check = await this.ensureOpenCheck()
      }

      this.saving = true
      this.error = null

      try {
        const updated = await addCheckItem(check.id, { productId, quantity })
        this.upsertOpen(updated)
        this.activeCheck = updated
        return updated
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.saving = false
      }
    },

    async setItemQuantity(itemId, quantity) {
      if (!this.activeCheck) return

      this.saving = true
      this.error = null

      try {
        const updated = await updateCheckItem(this.activeCheck.id, itemId, { quantity })
        this.upsertOpen(updated)
        this.activeCheck = updated
        return updated
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.saving = false
      }
    },

    async removeItem(itemId) {
      if (!this.activeCheck) return

      this.saving = true
      this.error = null

      try {
        const updated = await removeCheckItem(this.activeCheck.id, itemId)
        this.upsertOpen(updated)
        this.activeCheck = updated
        return updated
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.saving = false
      }
    },

    async closeActive() {
      if (!this.activeCheck) return

      this.saving = true
      this.error = null

      try {
        const closed = await closeCheck(this.activeCheck.id)
        this.removeOpen(closed.id)
        this.activeCheck = null
        return closed
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.saving = false
      }
    },
  },
})
