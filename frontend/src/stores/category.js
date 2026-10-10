import { defineStore } from 'pinia'
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
  updateCategoryOrder,
} from '@/services/categoryService'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    page: 1,
    pageSize: 20,
    total: 0,
    status: 'idle',
    error: null,
  }),

  actions: {
    async fetchCategories(page = this.page) {
      this.status = 'loading'
      this.error = null

      try {
        const result = await getCategories({ page })
        this.categories = result.items
        this.page = result.page
        this.pageSize = result.pageSize
        this.total = result.total
        this.status = 'success'
      } catch (error) {
        this.status = 'error'
        this.error = error
      }
    },

    async fetchCategory(id) {
      return getCategory(id)
    },

    async saveCategory(payload, id) {
      this.error = null

      try {
        const category = id ? await updateCategory(id, payload) : await createCategory(payload)
        await this.fetchCategories()
        return category
      } catch (error) {
        this.error = error
        throw error
      }
    },

    async removeCategory(id) {
      this.error = null

      try {
        await deleteCategory(id)
        await this.fetchCategories()
      } catch (error) {
        this.error = error
        throw error
      }
    },

    async patchCategory(id, payload) {
      this.error = null

      try {
        await updateCategory(id, payload)
        await this.fetchCategories()
      } catch (error) {
        this.error = error
        throw error
      }
    },

    async reorder(ids) {
      const previous = this.categories.map((category) => ({ ...category }))

      this.categories = ids.map((id, index) => {
        const category = previous.find((entry) => entry.id === id)
        return { ...category, sortOrder: index + 1 }
      })

      try {
        this.categories = await updateCategoryOrder(ids)
      } catch (error) {
        this.categories = previous
        this.error = error
      }
    },
  },
})
