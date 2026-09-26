import { defineStore } from 'pinia'
import {
  cancelSubscription,
  createCheckout,
  getCurrentSubscription,
  getPlans,
} from '@/services/subscriptionService'

let pendingSubscription = null

export const useSubscriptionStore = defineStore('subscription', {
  state: () => ({
    plans: [],
    subscription: null,
    status: 'idle',
    acting: null,
    error: null,
  }),

  actions: {
    async fetchSubscription() {
      if (this.subscription && this.plans.length) {
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
        const [plans, subscription] = await Promise.all([getPlans(), getCurrentSubscription()])
        this.plans = plans
        this.subscription = subscription
        this.status = 'success'
        return subscription
      } catch (error) {
        this.status = 'error'
        this.error = error
        throw error
      }
    },

    async checkout(planId) {
      this.acting = planId
      this.error = null

      try {
        const checkout = await createCheckout({ planId })

        if (checkout.subscription) {
          this.subscription = checkout.subscription
        }

        return checkout
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.acting = null
      }
    },

    async cancel() {
      this.acting = 'cancel'
      this.error = null

      try {
        this.subscription = await cancelSubscription()
        return this.subscription
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.acting = null
      }
    },
  },
})
