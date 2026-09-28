import { defineStore } from 'pinia'
import { getBusiness, updateBusiness } from '@/services/businessService'
import { useAuthStore } from '@/stores/auth'
import { useMenuSettingsStore } from '@/stores/menuSettings'
import { setStoredUser } from '@/utils/storage'

function syncTenantName(name) {
  const auth = useAuthStore()

  if (auth.user?.tenant) {
    auth.user = {
      ...auth.user,
      tenant: {
        ...auth.user.tenant,
        name,
      },
    }
    setStoredUser(auth.user)
  }

  const settings = useMenuSettingsStore()

  if (settings.settings) {
    settings.settings = { ...settings.settings, name }
  }

  if (settings.draft) {
    settings.draft = { ...settings.draft, name }
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

let pendingBusiness = null

export const useBusinessStore = defineStore('business', {
  state: () => ({
    profile: null,
    draft: null,
    status: 'idle',
    saving: false,
    error: null,
  }),

  actions: {
    async fetchBusiness() {
      if (this.profile) {
        if (!this.draft) {
          this.draft = clone(this.profile)
        }

        return this.profile
      }

      if (!pendingBusiness) {
        pendingBusiness = this.loadBusiness().finally(() => {
          pendingBusiness = null
        })
      }

      return pendingBusiness
    },

    async loadBusiness() {
      this.status = 'loading'
      this.error = null

      try {
        this.profile = await getBusiness()
        this.draft = clone(this.profile)
        this.status = 'success'
        return this.profile
      } catch (error) {
        this.status = 'error'
        this.error = error
        throw error
      }
    },

    resetDraft() {
      if (this.profile) {
        this.draft = clone(this.profile)
      }
    },

    async save() {
      this.saving = true
      this.error = null

      try {
        this.profile = await updateBusiness(clone(this.draft))
        this.draft = clone(this.profile)
        syncTenantName(this.profile.name)
        return this.profile
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.saving = false
      }
    },
  },
})
