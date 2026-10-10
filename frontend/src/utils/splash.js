const SPLASH_ID = 'app-splash'
const MIN_MS = 700
const FADE_MS = 420

let startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()

export function markSplashStart() {
  startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()
}

export function hideSplash() {
  const root = document.getElementById(SPLASH_ID)

  if (!root || root.dataset.done === '1') {
    return
  }

  root.dataset.done = '1'
  const elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt
  const wait = Math.max(0, MIN_MS - elapsed)

  window.setTimeout(() => {
    root.classList.add('app-splash--hide')
    window.setTimeout(() => root.remove(), FADE_MS)
  }, wait)
}
