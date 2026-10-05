import { defineStore } from 'pinia'
import { getCategories } from '@/services/categoryService'
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
  updateProductOrder,
} from '@/services/productService'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    categories: [],
    query: {
      search: '',
      categoryId: '',
      status: 'all',
    },
    status: 'idle',
    error: null,
  }),

  actions: {
    async fetchCategories() {
      this.categories = await getCategories()
    },

    async fetchProducts(query = this.query) {
      this.query = { ...this.query, ...query }
      this.status = 'loading'
      this.error = null

      try {
        this.products = await getProducts(this.query)
        this.status = 'success'
      } catch (error) {
        this.status = 'error'
        this.error = error
      }
    },

    async fetchProduct(id) {
      return getProduct(id)
    },

    async saveProduct(payload, id) {
      this.status = 'loading'
      this.error = null

      try {
        const product = id ? await updateProduct(id, payload) : await createProduct(payload)
        await this.fetchProducts()
        return product
      } catch (error) {
        this.status = 'error'
        this.error = error
        throw error
      }
    },

    async removeProduct(id) {
      this.error = null

      try {
        await deleteProduct(id)
        await this.fetchProducts()
      } catch (error) {
        this.error = error
        throw error
      }
    },

    async reorder(ids) {
      const previous = this.products.map((product) => ({ ...product }))
      const order = new Map(ids.map((id, index) => [id, index + 1]))

      this.products = this.products.map((product) =>
        order.has(product.id) ? { ...product, sortOrder: order.get(product.id) } : product,
      )

      try {
        const updated = await updateProductOrder(ids)
        const next = new Map(updated.map((product) => [product.id, product.sortOrder]))
        this.products = this.products.map((product) =>
          next.has(product.id) ? { ...product, sortOrder: next.get(product.id) } : product,
        )
      } catch (error) {
        this.products = previous
        this.error = error
      }
    },

    async patchProduct(id, payload) {
      this.error = null

      try {
        await updateProduct(id, payload)
        await this.fetchProducts()
      } catch (error) {
        this.error = error
        throw error
      }
    },
  },
})
