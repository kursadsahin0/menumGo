import { defineBoot } from '#q-app'
import { Dark } from 'quasar'
import { STORAGE_KEYS } from '@/utils/constants'

export default defineBoot(() => {
  if (typeof localStorage === 'undefined') {
    return
  }

  const stored = localStorage.getItem(STORAGE_KEYS.dark)

  if (stored === 'true') {
    Dark.set(true)
    return
  }

  if (stored === 'false') {
    Dark.set(false)
    return
  }

  Dark.set(window.matchMedia('(prefers-color-scheme: dark)').matches)
})
