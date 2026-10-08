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
    hasAccess: (state) => state.user?.subscription?.status === 'active',
    entryRoute() {
      if (!this.emailVerified) return 'verify-pending'
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

      return this.authenticate(() => loginRequest(credentials), remember)
    },

    async register(payload) {
      return this.authenticate(() => registerRequest(payload), true)
    },

    async authenticate(request, remember) {
      this.status = 'loading'
      this.error = null

      try {
        const session = await request()
        this.token = session.token
        this.user = session.user
        this.sessionChecked = true
        persistSession(session.token, session.user, remember)
        this.status = 'success'
        return session
      } catch (error) {
        this.status = 'error'
        this.error = error
        throw error
      }
    },

    applySubscription(status) {
      if (!this.user || this.user.subscription?.status === status) {
        return
      }

      this.user = {
        ...this.user,
        subscription: { status },
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
