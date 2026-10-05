import { prisma } from '../db.js'
import { fail } from '../http.js'
import { newId } from '../auth/users.js'

function readText(value, label, { required = false, max = 80 } = {}) {
  const text = String(value || '').trim()

  if (!text && required) {
    throw fail(422, `${label} zorunlu.`)
  }

  if (text.length > max) {
    throw fail(422, `${label} çok uzun.`)
  }

  return text
}

export function toPublicTable(table, slug) {
  return {
    id: table.id,
    name: table.name,
    tableNumber: table.tableNumber,
    isActive: table.isActive,
    qrCode: `/menu/${slug}?table=${table.id}`,
  }
}

export function sortTables(tables) {
  return [...tables].sort((a, b) => {
    const left = Number(a.tableNumber)
    const right = Number(b.tableNumber)
    const byNumber =
      Number.isFinite(left) && Number.isFinite(right) && String(left) === a.tableNumber && String(right) === b.tableNumber
        ? left - right
        : a.tableNumber.localeCompare(b.tableNumber, 'tr')

    return byNumber || a.name.localeCompare(b.name, 'tr')
  })
}

export function readTableInput(body, { partial = false } = {}) {
  const source = body && typeof body === 'object' ? body : {}
  const data = {}
  const has = (key) => Object.prototype.hasOwnProperty.call(source, key)

  if (!partial || has('name')) {
    data.name = readText(source.name, 'Masa adı', { required: true, max: 80 })
  }

  if (!partial || has('tableNumber')) {
    data.tableNumber = readText(source.tableNumber, 'Masa numarası', { required: true, max: 20 })
  }

  return data
}

export async function saveTable(tenantId, data, id) {
  try {
    if (id) {
      return await prisma.diningTable.update({ where: { id }, data })
    }

    return await prisma.diningTable.create({
      data: {
        id: newId('tbl'),
        tenantId,
        ...data,
      },
    })
  } catch (error) {
    if (error.code === 'P2002') {
      throw fail(422, 'Bu masa numarası zaten var.')
    }

    throw error
  }
}
