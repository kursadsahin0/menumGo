export function absoluteMenuUrl(path) {
  if (!path) {
    return ''
  }

  if (/^https?:\/\//.test(path)) {
    return path
  }

  return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`
}
