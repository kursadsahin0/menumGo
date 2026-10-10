import { STORAGE_KEYS } from '@/utils/constants'

function readFrom(storage, key) {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function writeTo(storage, key, value) {
  try {
    if (value == null) {
      storage.removeItem(key)
      return
    }

    storage.setItem(key, value)
  } catch {
    // Storage can be unavailable in private mode.
  }
}

const sessionMarker = '1'

function readMarker(storage) {
  const value = readFrom(storage, STORAGE_KEYS.token)

  if (value === sessionMarker) {
    return true
  }

  if (value) {
    writeTo(storage, STORAGE_KEYS.token, null)
    writeTo(storage, STORAGE_KEYS.user, null)
  }

  return false
}

function activeStorage() {
  if (readMarker(localStorage)) {
    return localStorage
  }

  if (readMarker(sessionStorage)) {
    return sessionStorage
  }

  return null
}

export function getToken() {
  return activeStorage() ? sessionMarker : null
}

export function getStoredUser() {
  const storage = activeStorage()
  const raw = storage ? readFrom(storage, STORAGE_KEYS.user) : null

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function persistSession(user, remember) {
  const keep = remember ? localStorage : sessionStorage
  const drop = remember ? sessionStorage : localStorage

  writeTo(keep, STORAGE_KEYS.token, sessionMarker)
  writeTo(keep, STORAGE_KEYS.user, JSON.stringify(user))
  writeTo(drop, STORAGE_KEYS.token, null)
  writeTo(drop, STORAGE_KEYS.user, null)
}

export function setStoredUser(user) {
  const storage = activeStorage()

  if (!storage) {
    return
  }

  writeTo(storage, STORAGE_KEYS.user, user ? JSON.stringify(user) : null)
}

export function clearSession() {
  for (const storage of [localStorage, sessionStorage]) {
    writeTo(storage, STORAGE_KEYS.token, null)
    writeTo(storage, STORAGE_KEYS.user, null)
  }
}
