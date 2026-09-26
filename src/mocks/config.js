export function isMockEnabled() {
  return import.meta.env.VITE_USE_MOCK !== 'false'
}

export function wait(ms = 250) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
