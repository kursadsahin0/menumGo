import { defineStore } from 'pinia'
import { getMenuSettings, updateMenuSettings } from '@/services/menuSettingsService'
import { appearanceFromTheme, normalizeSettings } from '@/data/menuThemes'

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

let pendingSettings = null

export const useMenuSettingsStore = defineStore('menuSettings', {
  state: () => ({
    settings: null,
    draft: null,
    status: 'idle',
    saving: false,
    error: null,
  }),

  actions: {
    async fetchSettings() {
      if (this.settings) {
        this.settings = normalizeSettings(this.settings)

        if (!this.draft || typeof this.draft.description === 'string') {
          this.draft = clone(this.settings)
        }

        return this.settings
      }

      if (!pendingSettings) {
        pendingSettings = this.loadSettings().finally(() => {
          pendingSettings = null
        })
      }

      return pendingSettings
    },

    async loadSettings() {
      this.status = 'loading'
      this.error = null

      try {
        this.settings = normalizeSettings(await getMenuSettings())
        this.draft = clone(this.settings)
        this.status = 'success'
        return this.settings
      } catch (error) {
        this.status = 'error'
        this.error = error
        throw error
      }
    },

    resetDraft() {
      if (this.settings) {
        this.draft = clone(this.settings)
      }
    },

    applyTheme(themeId) {
      if (!this.draft) {
        return
      }

      Object.assign(this.draft, appearanceFromTheme(themeId))
    },

    async save() {
      this.saving = true
      this.error = null

      try {
        this.settings = normalizeSettings(await updateMenuSettings(clone(this.draft)))
        this.draft = clone(this.settings)
        return this.settings
      } catch (error) {
        this.error = error
        throw error
      } finally {
        this.saving = false
      }
    },
  },
})
