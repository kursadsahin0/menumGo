import assert from 'node:assert/strict'
import { test } from 'node:test'
import { prisma } from '../src/db.js'

test('migration tabloları veritabanında durur', async () => {
  const tables = await prisma.$queryRaw`
    SELECT table_name::text AS name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('Upload', '_prisma_migrations')
  `
  const columns = await prisma.$queryRaw`
    SELECT column_name::text AS name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Subscription'
      AND column_name IN ('cancelAtPeriodEnd', 'planId', 'amount')
  `

  const consent = await prisma.$queryRaw`
    SELECT column_name::text AS name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name IN ('termsVersion', 'termsAcceptedAt')
  `

  assert.equal(tables.length, 2)
  assert.equal(columns.length, 3)
  assert.equal(consent.length, 2)
  await prisma.$disconnect()
})
