import { wait } from '@/mocks/config'
import { createDefaultSettings, normalizeSettings } from '@/data/menuThemes'

const DB_KEY = 'qr_menu.mock.menuSettings'

function loadSettings() {
  try {
    const raw = localStorage.getItem(DB_KEY)

    if (!raw) {
      const settings = createDefaultSettings()
      saveSettings(settings)
      return settings
    }

    return normalizeSettings({ ...createDefaultSettings(), ...JSON.parse(raw) })
  } catch {
    return createDefaultSettings()
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(settings))
  } catch {
    // Ignore storage failures in mock mode.
  }
}

export async function mockGetMenuSettings() {
  await wait(80)
  return loadSettings()
}

export async function mockUpdateMenuSettings(payload) {
  await wait()

  const next = normalizeSettings({
    ...createDefaultSettings(),
    ...payload,
    logo: payload.logo || null,
  })

  saveSettings(next)
  return { ...next }
}
