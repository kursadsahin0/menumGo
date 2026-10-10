const defaultEdge = 1600
const coverEdge = 1920

function canvasBlob(canvas, type, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Görsel okunamadı. JPEG, PNG veya WebP seçin.'))
    reader.readAsDataURL(blob)
  })
}

export async function prepareImage(file, { maxEdge = defaultEdge } = {}) {
  if (!(file instanceof Blob) || !String(file.type || '').startsWith('image/')) {
    throw new Error('Yalnızca görsel seçin.')
  }

  let bitmap

  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new Error('Görsel okunamadı. JPEG, PNG veya WebP seçin.')
  }

  try {
    const longest = Math.max(bitmap.width, bitmap.height)
    const scale = longest > maxEdge ? maxEdge / longest : 1
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Görsel hazırlanamadı.')
    }

    context.drawImage(bitmap, 0, 0, width, height)

    let blob = await canvasBlob(canvas, 'image/webp', 0.82)

    if (!blob) {
      context.globalCompositeOperation = 'destination-over'
      context.fillStyle = '#fff'
      context.fillRect(0, 0, width, height)
      blob = await canvasBlob(canvas, 'image/jpeg', 0.82)
    }

    if (blob && blob.size > 1_200_000) {
      const smaller = await canvasBlob(canvas, blob.type, 0.65)
      if (smaller && smaller.size < blob.size) {
        blob = smaller
      }
    }

    if (!blob) {
      throw new Error('Görsel hazırlanamadı.')
    }

    return blobToDataUrl(blob)
  } finally {
    bitmap.close()
  }
}

export const imageEdges = {
  photo: defaultEdge,
  cover: coverEdge,
}
