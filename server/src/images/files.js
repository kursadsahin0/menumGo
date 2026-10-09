import { randomBytes } from 'node:crypto'
import { readdir, readFile, unlink } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { prisma } from '../db.js'
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
const namePattern = /^[\da-f]{32}\.(jpg|png|webp|gif)$/

let uploadTableReady = null

function imageKind(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: 'image/jpeg', extension: 'jpg' }
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mime: 'image/png', extension: 'png' }
  }

  const gif = buffer.length >= 6 ? buffer.subarray(0, 6).toString('ascii') : ''

  if (gif === 'GIF87a' || gif === 'GIF89a') {
    return { mime: 'image/gif', extension: 'gif' }
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { mime: 'image/webp', extension: 'webp' }
  }

  return null
}

export function isStoredFile(value) {
  return typeof value === 'string' && value.startsWith(publicPrefix)
}

function storedName(value) {
  if (!isStoredFile(value)) {
    return null
  }

  const name = value.slice(publicPrefix.length)

  if (!namePattern.test(name)) {
    return null
  }

  return name
}

function ensureUploadTable() {
  if (!uploadTableReady) {
    uploadTableReady = prisma
      .$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Upload" (
          "id" TEXT NOT NULL,
          "bytes" BYTEA NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Upload_pkey" PRIMARY KEY ("id")
        )
      `)
      .catch((error) => {
        uploadTableReady = null
        throw error
      })
  }

  return uploadTableReady
}

async function putUpload(name, bytes) {
  await ensureUploadTable()
  await prisma.upload.create({
    data: { id: name, bytes },
  })
}

export async function saveImage(value, label = 'Görsel') {
  if (value == null || value === '') {
    return null
  }

  if (typeof value !== 'string' || value.length > limit) {
    throw fail(422, `${label} çok büyük. Daha küçük bir dosya seçin.`)
  }

  if (isStoredFile(value)) {
    return value
  }

  if (/^https?:\/\//i.test(value)) {
    throw fail(422, `${label} geçersiz.`)
  }

  if (!value.startsWith('data:image/')) {
    if (/^[\w-]+$/.test(value)) {
      return value
    }

    throw fail(422, `${label} geçersiz.`)
  }

  const match = value.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/)
  const declared = match && extensions[match[1]]

  if (!declared) {
    throw fail(422, `${label} yalnızca JPEG, PNG, WebP veya GIF olabilir.`)
  }

  const buffer = Buffer.from(match[2].replace(/\s/g, ''), 'base64')
  const kind = imageKind(buffer)

  if (!buffer.length || buffer.length > limit) {
    throw fail(422, `${label} çok büyük. Daha küçük bir dosya seçin.`)
  }

  if (!kind || kind.extension !== declared) {
    throw fail(422, `${label} yalnızca JPEG, PNG, WebP veya GIF olabilir.`)
  }

  const name = `${randomBytes(16).toString('hex')}.${kind.extension}`
  await putUpload(name, buffer)
  return `${publicPrefix}${name}`
}

export async function removeImage(value) {
  const name = storedName(value)

  if (!name) {
    return
  }

  await ensureUploadTable()
  await prisma.upload.delete({ where: { id: name } }).catch(() => {})
  await unlink(resolve(root, name)).catch(() => {})
}

export async function replaceImage(previous, next) {
  if (previous && previous !== next) {
    await removeImage(previous)
  }
}

export async function openUpload(name) {
  if (!namePattern.test(String(name || ''))) {
    return null
  }

  await ensureUploadTable()
  const row = await prisma.upload.findUnique({ where: { id: name } })

  if (!row) {
    return null
  }

  const body = Buffer.from(row.bytes)
  const extension = name.slice(name.lastIndexOf('.') + 1)
  const kind = imageKind(body.subarray(0, 12))

  if (!body.length || body.length > limit || !kind || kind.extension !== extension) {
    return null
  }

  return { body, type: kind.mime }
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

export async function importDiskUploads() {
  await ensureUploadTable()

  let names = []

  try {
    names = await readdir(root)
  } catch {
    return
  }

  for (const name of names) {
    if (!namePattern.test(name)) {
      continue
    }

    const bytes = await readFile(resolve(root, name))
    const extension = name.slice(name.lastIndexOf('.') + 1)
    const kind = imageKind(bytes.subarray(0, 12))

    if (!bytes.length || bytes.length > limit || !kind || kind.extension !== extension) {
      continue
    }

    try {
      await prisma.upload.create({ data: { id: name, bytes } })
    } catch (error) {
      if (error.code !== 'P2002') {
        throw error
      }
    }

    await unlink(resolve(root, name)).catch(() => {})
  }
}

export async function relocateStoredImages() {
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
