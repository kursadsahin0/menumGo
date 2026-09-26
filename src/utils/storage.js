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

function activeStorage() {
  if (readFrom(localStorage, STORAGE_KEYS.token)) {
    return localStorage
  }

  if (readFrom(sessionStorage, STORAGE_KEYS.token)) {
    return sessionStorage
  }

  return null
}

export function getToken() {
  return readFrom(localStorage, STORAGE_KEYS.token) || readFrom(sessionStorage, STORAGE_KEYS.token)
}

export function getStoredUser() {
  const raw = readFrom(activeStorage() || localStorage, STORAGE_KEYS.user)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function persistSession(token, user, remember) {
  const keep = remember ? localStorage : sessionStorage
  const drop = remember ? sessionStorage : localStorage

  writeTo(keep, STORAGE_KEYS.token, token)
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
