import { defineStore } from 'pinia'
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
  updateCategoryOrder,
} from '@/services/categoryService'
import { getProducts } from '@/services/productService'

function withCounts(categories, products) {
  const counts = products.reduce((map, product) => {
    map[product.categoryId] = (map[product.categoryId] || 0) + 1
    return map
  }, {})

  return categories.map((category) => ({
    ...category,
    productCount: counts[category.id] || 0,
  }))
}

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    status: 'idle',
    error: null,
  }),

  actions: {
    async fetchCategories() {
      this.status = 'loading'
      this.error = null

      try {
        const [categories, products] = await Promise.all([
          getCategories(),
          getProducts().catch(() => []),
        ])
        this.categories = withCounts(categories, products)
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
      const counts = Object.fromEntries(
        previous.map((category) => [category.id, category.productCount]),
      )

      this.categories = ids.map((id, index) => {
        const category = previous.find((entry) => entry.id === id)
        return { ...category, sortOrder: index + 1 }
      })

      try {
        const updated = await updateCategoryOrder(ids)
        this.categories = updated.map((category) => ({
          ...category,
          productCount: counts[category.id] || 0,
        }))
      } catch (error) {
        this.categories = previous
        this.error = error
      }
    },
  },
})
