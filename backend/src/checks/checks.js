import { prisma } from '../db.js'
import { fail } from '../http.js'
import { newId } from '../auth/users.js'

function money(value) {
  if (value == null) {
    return null
  }

  return Number(value)
}

function lineTotal(item) {
  return money(item.unitPrice) * Number(item.quantity || 0)
}

export function toPublicCheck(check) {
  const items = (check.items || []).map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.name,
    unitPrice: money(item.unitPrice),
    quantity: item.quantity,
    sortOrder: item.sortOrder,
    lineTotal: lineTotal(item),
  }))

  const total = items.reduce((sum, item) => sum + item.lineTotal, 0)

  return {
    id: check.id,
    status: check.status,
    note: check.note || '',
    openedAt: check.openedAt,
    closedAt: check.closedAt,
    tableId: check.tableId,
    table: check.table
      ? {
          id: check.table.id,
          name: check.table.name,
          tableNumber: check.table.tableNumber,
          isActive: check.table.isActive,
        }
      : null,
    items,
    total,
  }
}

const checkInclude = {
  table: true,
  items: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
}

export async function findOwnedCheck(tenantId, id) {
  const check = await prisma.check.findFirst({
    where: { id: String(id || ''), tenantId },
    include: checkInclude,
  })

  if (!check) {
    throw fail(404, 'Adisyon bulunamadı.')
  }

  return check
}

export async function assertOpenCheck(check) {
  if (check.status !== 'open') {
    throw fail(422, 'Kapalı adisyona işlem yapılamaz.')
  }

  return check
}

export async function listChecks(tenantId, { status } = {}) {
  const where = { tenantId }

  if (status) {
    where.status = String(status)
  }

  const checks = await prisma.check.findMany({
    where,
    include: checkInclude,
    orderBy: [{ openedAt: 'desc' }],
  })

  return checks.map(toPublicCheck)
}

export async function openCheck(tenantId, tableId) {
  const id = String(tableId || '').trim()

  if (!id) {
    throw fail(422, 'Masa gerekli.')
  }

  const table = await prisma.diningTable.findFirst({
    where: { id, tenantId },
  })

  if (!table) {
    throw fail(404, 'Masa bulunamadı.')
  }

  if (!table.isActive) {
    throw fail(422, 'Kapalı masaya adisyon açılamaz.')
  }

  const existing = await prisma.check.findFirst({
    where: { tenantId, tableId: table.id, status: 'open' },
    include: checkInclude,
  })

  if (existing) {
    return toPublicCheck(existing)
  }

  const check = await prisma.check.create({
    data: {
      id: newId('chk'),
      tenantId,
      tableId: table.id,
      status: 'open',
    },
    include: checkInclude,
  })

  return toPublicCheck(check)
}

export async function addCheckItem(tenantId, checkId, { productId, quantity } = {}) {
  const check = await assertOpenCheck(await findOwnedCheck(tenantId, checkId))
  const pid = String(productId || '').trim()

  if (!pid) {
    throw fail(422, 'Ürün gerekli.')
  }

  const qty = Math.max(1, Math.min(999, Number(quantity) || 1))

  const product = await prisma.product.findFirst({
    where: { id: pid, tenantId },
  })

  if (!product) {
    throw fail(404, 'Ürün bulunamadı.')
  }

  if (!product.isAvailable) {
    throw fail(422, 'Ürün satışta değil.')
  }

  const unitPrice =
    product.discountedPrice != null ? product.discountedPrice : product.price

  const existing = check.items.find((item) => item.productId === product.id)

  if (existing) {
    await prisma.checkItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + qty },
    })

    return toPublicCheck(await findOwnedCheck(tenantId, check.id))
  }

  const maxOrder = check.items.reduce((max, item) => Math.max(max, item.sortOrder), -1)

  await prisma.checkItem.create({
    data: {
      id: newId('cki'),
      checkId: check.id,
      productId: product.id,
      name: product.name,
      unitPrice,
      quantity: qty,
      sortOrder: maxOrder + 1,
    },
  })

  return toPublicCheck(await findOwnedCheck(tenantId, check.id))
}

export async function updateCheckItem(tenantId, checkId, itemId, { quantity } = {}) {
  const check = await assertOpenCheck(await findOwnedCheck(tenantId, checkId))
  const item = check.items.find((row) => row.id === String(itemId || ''))

  if (!item) {
    throw fail(404, 'Kalem bulunamadı.')
  }

  const qty = Number(quantity)

  if (!Number.isFinite(qty) || qty < 1 || qty > 999) {
    throw fail(422, 'Adet 1–999 arasında olmalı.')
  }

  await prisma.checkItem.update({
    where: { id: item.id },
    data: { quantity: Math.floor(qty) },
  })

  return toPublicCheck(await findOwnedCheck(tenantId, check.id))
}

export async function removeCheckItem(tenantId, checkId, itemId) {
  const check = await assertOpenCheck(await findOwnedCheck(tenantId, checkId))
  const item = check.items.find((row) => row.id === String(itemId || ''))

  if (!item) {
    throw fail(404, 'Kalem bulunamadı.')
  }

  await prisma.checkItem.delete({ where: { id: item.id } })
  return toPublicCheck(await findOwnedCheck(tenantId, check.id))
}

export async function closeCheck(tenantId, checkId) {
  const check = await assertOpenCheck(await findOwnedCheck(tenantId, checkId))

  const closed = await prisma.check.update({
    where: { id: check.id },
    data: {
      status: 'closed',
      closedAt: new Date(),
    },
    include: checkInclude,
  })

  return toPublicCheck(closed)
}
