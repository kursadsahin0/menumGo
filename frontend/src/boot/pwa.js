import { defineBoot } from '#q-app'

export default defineBoot(() => {
  if (!('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker.register('/sw.js').catch(() => {})
})
