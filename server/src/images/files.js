import { randomBytes } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, stat, unlink, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fail } from '../http.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../uploads')
const publicPrefix = '/api/uploads/'
const limit = 4_000_000
const extensions = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}
const mimeTypes = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

export async function ensureUploadsDir() {
  await mkdir(root, { recursive: true })
}

export function isStoredFile(value) {
  return typeof value === 'string' && value.startsWith(publicPrefix)
}

function storedName(value) {
  if (!isStoredFile(value)) {
    return null
  }

  const name = value.slice(publicPrefix.length)

  if (!/^[\da-f]{32}\.(jpg|png|webp|gif)$/.test(name)) {
    return null
  }

  return name
}

export async function saveImage(value, label = 'Görsel') {
  if (value == null || value === '') {
    return null
  }

  if (typeof value !== 'string' || value.length > limit) {
    throw fail(422, `${label} çok büyük. Daha küçük bir dosya seçin.`)
  }

  if (isStoredFile(value) || value.startsWith('http://') || value.startsWith('https://')) {
    return value
  }

  if (!value.startsWith('data:image/')) {
    if (/^[\w-]+$/.test(value)) {
      return value
    }

    throw fail(422, `${label} geçersiz.`)
  }

  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/)
  const extension = match && extensions[match[1]]

  if (!extension) {
    throw fail(422, `${label} yalnızca JPEG, PNG, WebP veya GIF olabilir.`)
  }

  const buffer = Buffer.from(match[2].replace(/\s/g, ''), 'base64')

  if (!buffer.length || buffer.length > limit) {
    throw fail(422, `${label} çok büyük. Daha küçük bir dosya seçin.`)
  }

  await ensureUploadsDir()
  const name = `${randomBytes(16).toString('hex')}.${extension}`
  await writeFile(resolve(root, name), buffer)
  return `${publicPrefix}${name}`
}

export async function removeImage(value) {
  const name = storedName(value)

  if (!name) {
    return
  }

  await unlink(resolve(root, name)).catch(() => {})
}

export async function replaceImage(previous, next) {
  if (previous && previous !== next) {
    await removeImage(previous)
  }
}

export async function openUpload(name) {
  if (!/^[\da-f]{32}\.(jpg|png|webp|gif)$/.test(String(name || ''))) {
    return null
  }

  const path = resolve(root, name)

  try {
    await stat(path)
  } catch {
    return null
  }

  return {
    stream: createReadStream(path),
    type: mimeTypes[name.slice(name.lastIndexOf('.') + 1)],
  }
}

async function moveDataImage(value) {
  if (typeof value === 'string' && value.startsWith('data:image/')) {
    return saveImage(value)
  }

  return value
}

async function relocateRows(rows, fields, update) {
  for (const row of rows) {
    const data = {}
    let changed = false

    for (const field of fields) {
      const next = await moveDataImage(row[field])

      if (next !== row[field]) {
        data[field] = next
        changed = true
      }
    }

    if (changed) {
      await update(row.id, data)
    }
  }
}

export async function relocateStoredImages(prisma) {
  await ensureUploadsDir()

  await relocateRows(
    await prisma.tenant.findMany({ select: { id: true, logo: true, coverImage: true } }),
    ['logo', 'coverImage'],
    (id, data) => prisma.tenant.update({ where: { id }, data }),
  )
  await relocateRows(
    await prisma.product.findMany({ select: { id: true, image: true } }),
    ['image'],
    (id, data) => prisma.product.update({ where: { id }, data }),
  )
  await relocateRows(
    await prisma.category.findMany({ select: { id: true, image: true } }),
    ['image'],
    (id, data) => prisma.category.update({ where: { id }, data }),
  )
  await relocateRows(
    await prisma.menuSettings.findMany({ select: { id: true, logo: true } }),
    ['logo'],
    (id, data) => prisma.menuSettings.update({ where: { id }, data }),
  )
}
