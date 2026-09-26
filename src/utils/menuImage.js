export function menuImage(photoId, width) {
  if (!photoId) {
    return ''
  }

  if (photoId.startsWith('data:') || photoId.startsWith('http')) {
    return photoId
  }

  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&q=70`
}

export function menuImageSrcset(photoId, width) {
  if (!photoId) {
    return undefined
  }

  return `${menuImage(photoId, width)} ${width}w, ${menuImage(photoId, width * 2)} ${width * 2}w`
}
