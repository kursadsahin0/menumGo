import { normalizeBusiness } from '@/data/business'
import { wait } from '@/mocks/config'

const DB_KEY = 'qr_menu.mock.business'

function loadBusiness() {
  try {
    const raw = localStorage.getItem(DB_KEY)

    if (!raw) {
      const business = normalizeBusiness()
      saveBusiness(business)
      return business
    }

    return normalizeBusiness(JSON.parse(raw))
  } catch {
    return normalizeBusiness()
  }
}

function saveBusiness(business) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(business))
  } catch {
    // Ignore storage failures in mock mode.
  }
}

export async function mockGetBusiness() {
  await wait(80)
  return loadBusiness()
}

export async function mockUpdateBusiness(payload) {
  await wait()
  const next = normalizeBusiness(payload)
  saveBusiness(next)
  return { ...next }
}
