import { defineStore } from 'pinia'
import { getBusiness, updateBusiness } from '@/services/businessService'
import { useAuthStore } from '@/stores/auth'
import { useMenuSettingsStore } from '@/stores/menuSettings'
import { setStoredUser } from '@/utils/storage'

function syncGuestIdentity(profile) {
  const auth = useAuthStore()

  if (auth.user?.tenant) {
    auth.user = {
      ...auth.user,
      tenant: {
        ...auth.user.tenant,
        name: profile.name,
      },
    }
    setStoredUser(auth.user)
  }

  const settings = useMenuSettingsStore()
  const identity = {
    name: profile.name,
    logo: profile.logo,
    description: {
      tr: profile.description || '',
      en: profile.descriptionEn || '',
    },
  }

  if (settings.settings) {
    settings.settings = { ...settings.settings, ...identity }
  }

  if (settings.draft) {
    settings.draft = { ...settings.draft, ...identity }
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
        syncGuestIdentity(this.profile)
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
