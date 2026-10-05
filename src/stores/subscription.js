import { defineStore } from 'pinia'
import {
  cancelSubscription,
  createCheckout,
  getCurrentSubscription,
} from '@/services/subscriptionService'

let pendingSubscription = null

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    subscription: null,
    status: 'idle',
    acting: false,
    error: null,
  }),

  actions: {
    async fetchSubscription() {
      if (this.subscription) {
        return this.subscription
      }

      if (!pendingSubscription) {
        pendingSubscription = this.loadSubscription().finally(() => {
          pendingSubscription = null
        })
      }

      return pendingSubscription
    },

    async loadSubscription() {
      this.status = 'loading'
      this.error = null

      try {
        this.subscription = await getCurrentSubscription()
        this.status = 'success'
        return this.subscription
      } catch (error) {
        this.status = 'error'
        this.error = error
        throw error
      }
    },

    async checkout() {
      this.acting = true
      this.error = null

      try {
        const checkout = await createCheckout()

        if (checkout.subscription) {
          this.subscription = checkout.subscription
        }

        return checkout
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.acting = false
      }
    },

    async cancel() {
      this.acting = true
      this.error = null

      try {
        this.subscription = await cancelSubscription()
        return this.subscription
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.acting = false
      }
    },
  },
})
