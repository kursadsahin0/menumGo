import { defineStore } from 'pinia'
import {
  changePassword as changePasswordRequest,
  fetchCurrentUser,
  forgotPassword as forgotPasswordRequest,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  resetPassword as resetPasswordRequest,
  updateAccount as updateAccountRequest,
} from '@/services/auth.service'
import {
  clearSession,
  getStoredUser,
  getToken,
  persistSession,
  setStoredUser,
} from '@/utils/storage'

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

    async fetchUser() {
      if (!this.token) {
        this.user = null
        this.sessionChecked = true
        return null
      }

      this.status = 'loading'
      this.error = null

      try {
        const user = await fetchCurrentUser(this.token)
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
      const user = await updateAccountRequest(this.token, payload)
      this.user = user
      setStoredUser(user)
      return user
    },

    async changePassword(payload) {
      return changePasswordRequest(this.token, payload)
    },

    async logout() {
      try {
        if (this.token) {
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
