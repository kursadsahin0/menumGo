import { defineStore } from 'pinia'
import {
  changePassword as changePasswordRequest,
  fetchCurrentUser,
  forgotPassword as forgotPasswordRequest,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  resetPassword as resetPasswordRequest,
  sendVerification as sendVerificationRequest,
  updateAccount as updateAccountRequest,
  updateSlug as updateSlugRequest,
  verifyEmail as verifyEmailRequest,
  deleteAccount as deleteAccountRequest,
} from '@/services/auth.service'
import {
  clearSession,
  getStoredUser,
  getToken,
  persistSession,
  setStoredUser,
} from '@/utils/storage'
import { trialDaysRemaining } from '@/utils/trial'
import { disableWaiterPush } from '@/utils/waiterPush'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getToken(),
    user: getStoredUser(),
    status: 'idle',
    error: null,
    sessionChecked: !getToken(),
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    emailVerified: (state) => state.user?.emailVerified === true,
    hasAccess: (state) => {
      const subscription = state.user?.subscription

      if (subscription?.status === 'active') {
        return true
      }

      return subscription?.status === 'trial' && trialDaysRemaining(subscription.trialEndsAt) > 0
    },
    entryRoute() {
      return this.hasAccess ? 'admin-dashboard' : 'admin-billing'
    },
  },

  actions: {
    async login(payload) {
      const remember = Boolean(payload?.remember)
      const credentials = {
        email: payload?.email,
        password: payload?.password,
      }

      return this.authenticate(() => loginRequest({ ...credentials, remember }), remember)
    },

    async register(payload) {
      this.status = 'loading'
      this.error = null

      try {
        const result = await registerRequest(payload)
        this.status = 'success'
        return result
      } catch (error) {
        this.status = 'error'
        this.error = error
        throw error
      }
    },

    async authenticate(request, remember) {
      this.status = 'loading'
      this.error = null

      try {
        const session = await request()
        this.user = session.user
        persistSession(session.user, remember)
        this.token = getToken()
        this.sessionChecked = true
        this.status = 'success'
        return session
      } catch (error) {
        this.status = 'error'
        this.error = error
        throw error
      }
    },

    applySubscription(subscription) {
      if (!this.user) {
        return
      }

      const source = typeof subscription === 'string' ? { status: subscription } : subscription || {}
      const current = this.user.subscription || {}
      const next = {
        status: source.status === 'active' || source.status === 'trial' ? source.status : 'inactive',
        plan: source.plan ?? current.plan ?? null,
        amount: source.amount !== undefined ? source.amount : (current.amount ?? null),
        paidAt: source.paidAt !== undefined ? source.paidAt : (current.paidAt ?? null),
        provider: source.provider !== undefined ? source.provider : (current.provider ?? null),
        trialEndsAt: source.trialEndsAt !== undefined ? source.trialEndsAt : (current.trialEndsAt ?? null),
      }

      if (
        current.status === next.status &&
        current.plan === next.plan &&
        current.amount === next.amount &&
        current.paidAt === next.paidAt &&
        current.provider === next.provider &&
        current.trialEndsAt === next.trialEndsAt
      ) {
        return
      }

      this.user = {
        ...this.user,
        subscription: next,
      }
      setStoredUser(this.user)
    },

    async fetchUser() {
      if (!this.token) {
        this.user = null
        this.sessionChecked = true
        return null
      }

      this.status = 'loading'
      this.error = null

      try {
        const user = await fetchCurrentUser()
        this.user = user
        this.sessionChecked = true
        setStoredUser(user)
        this.status = 'success'
        return user
      } catch (error) {
        this.status = 'error'
        this.error = error
        this.sessionChecked = true

        if (error?.status === 401) {
          this.clearLocalSession()
        }

        throw error
      }
    },

    async forgotPassword(payload) {
      this.status = 'loading'
      this.error = null

      try {
        const result = await forgotPasswordRequest(payload)
        this.status = 'success'
        return result
      } catch (error) {
        this.status = 'error'
        this.error = error
        throw error
      }
    },

    async resetPassword(payload) {
      this.status = 'loading'
      this.error = null

      try {
        const result = await resetPasswordRequest(payload)
        this.status = 'success'
        return result
      } catch (error) {
        this.status = 'error'
        this.error = error
        throw error
      }
    },

    async updateAccount(payload) {
      const user = await updateAccountRequest(payload)
      this.user = user
      setStoredUser(user)
      return user
    },

    async verifyEmail(payload) {
      return verifyEmailRequest(payload)
    },

    async sendVerification() {
      return sendVerificationRequest()
    },

    async updateSlug(slug) {
      const user = await updateSlugRequest({ slug })
      this.user = user
      setStoredUser(user)
      return user
    },

    async deleteAccount(password) {
      await disableWaiterPush().catch(() => {})
      await deleteAccountRequest({ password })
      this.clearLocalSession()
    },

    async changePassword(payload) {
      return changePasswordRequest(payload)
    },

    async logout() {
      try {
        if (this.token) {
          await disableWaiterPush().catch(() => {})
          await logoutRequest()
        }
      } finally {
        this.clearLocalSession()
      }
    },

    clearLocalSession() {
      this.token = null
      this.user = null
      this.status = 'idle'
      this.error = null
      this.sessionChecked = true
      clearSession()
    },
  },
})
