import { prisma } from '../db.js'
import { fail } from '../http.js'
import { newId } from '../auth/users.js'
import { findActiveTable } from '../tables/tables.js'
import { pruneExpiredViews, viewCutoff, viewRetentionDays } from './retention.js'
import { dayKeys, dayLabel, relativeTime, startOfDay, weekdayLabel, zonedParts } from './time.js'

export async function recordMenuView(tenantId, language, tableId) {
  const value = String(language || '').trim()

  if (value !== 'tr' && value !== 'en') {
    throw fail(422, 'Dil geçersiz.')
  }

  const table = await findActiveTable(tenantId, tableId, { id: true })

  if (String(tableId || '').trim() && !table) {
    throw fail(404, 'Menü bulunamadı.')
  }

  await prisma.menuView.create({
    data: {
      id: newId('view'),
      tenantId,
      language: value,
      tableId: table?.id || null,
    },
  })
  void pruneExpiredViews()

  return { ok: true }
}

export async function recordProductView(tenantId, productId) {
  const product = await prisma.product.findFirst({
    where: { id: String(productId || ''), tenantId },
    select: { id: true, categoryId: true },
  })

  if (!product) {
    throw fail(404, 'Ürün bulunamadı.')
  }

  await prisma.productView.create({
    data: {
      id: newId('pview'),
      tenantId,
      productId: product.id,
      categoryId: product.categoryId,
    },
  })
  void pruneExpiredViews()

  return { ok: true }
}

function viewSeries(views, days) {
  const keys = dayKeys(days)
  const counts = new Map(keys.map((key) => [key, 0]))

  views.forEach((view) => {
    const key = zonedParts(view.createdAt).key

    if (counts.has(key)) {
      counts.set(key, counts.get(key) + 1)
    }
  })

  const points = keys.map((key) => ({ key, value: counts.get(key) }))
  const peak = points.reduce((best, point) => (point.value >= best.value ? point : best), points[0])

  return { points, peak, total: points.reduce((sum, point) => sum + point.value, 0) }
}

async function rankings(tenantId, since) {
  const where = { tenantId, createdAt: { gte: since || viewCutoff() } }

  const [productCounts, categoryCounts, products, categories] = await Promise.all([
    prisma.productView.groupBy({
      by: ['productId'],
      where,
      _count: { _all: true },
    }),
    prisma.productView.groupBy({
      by: ['categoryId'],
      where,
      _count: { _all: true },
    }),
    prisma.product.findMany({
      where: { tenantId },
      select: { id: true, name: true, categoryId: true },
    }),
    prisma.category.findMany({
      where: { tenantId },
      select: { id: true, name: true },
    }),
  ])

  const productById = new Map(products.map((product) => [product.id, product]))
  const categoryById = new Map(categories.map((category) => [category.id, category.name]))

  const popularProducts = productCounts
    .map((row) => {
      const product = productById.get(row.productId)

      if (!product) {
        return null
      }

      return {
        id: product.id,
        name: product.name,
        category: categoryById.get(product.categoryId) || 'Diğer',
        views: row._count._all,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.views - a.views || a.name.localeCompare(b.name, 'tr'))
    .slice(0, 4)

  const popularCategories = categoryCounts
    .map((row) => {
      const name = categoryById.get(row.categoryId)

      if (!name) {
        return null
      }

      return {
        id: row.categoryId,
        name,
        views: row._count._all,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.views - a.views || a.name.localeCompare(b.name, 'tr'))
    .slice(0, 4)

  return { popularProducts, popularCategories }
}

const activityPatterns = [
  { title: 'Ürün eklendi', suffix: ' menüye eklendi.', verb: 'eklendi', icon: 'lunch_dining' },
  { title: 'Ürün güncellendi', suffix: ' kaydedildi.', verb: 'güncellendi', icon: 'lunch_dining' },
  { title: 'Fiyat güncellendi', suffix: ' fiyatı kaydedildi.', verb: 'fiyatı güncellendi', icon: 'lunch_dining' },
  { title: 'Ürün silindi', suffix: ' menüden kaldırıldı.', verb: 'silindi', icon: 'lunch_dining' },
  { title: 'Kategori eklendi', suffix: ' menüye eklendi.', verb: 'kategorisi eklendi', icon: 'category' },
  { title: 'Kategori güncellendi', suffix: ' kaydedildi.', verb: 'kategorisi güncellendi', icon: 'category' },
  { title: 'Kategori silindi', suffix: ' menüden kaldırıldı.', verb: 'kategorisi silindi', icon: 'category' },
  { title: 'Masa eklendi', suffix: ' eklendi.', verb: 'masası eklendi', icon: 'table_restaurant' },
  { title: 'Masa güncellendi', suffix: ' kaydedildi.', verb: 'masası güncellendi', icon: 'table_restaurant' },
  { title: 'Masa silindi', suffix: ' kaldırıldı.', verb: 'masası silindi', icon: 'table_restaurant' },
]

function activityName(body, suffix) {
  const text = String(body || '').trim()

  if (!suffix || !text.endsWith(suffix)) {
    return ''
  }

  return text.slice(0, -suffix.length).trim()
}

export function recentActivityItems(notifications) {
  return notifications
    .map((notice) => {
      const pattern = activityPatterns.find((item) => item.title === notice.title)

      if (!pattern) {
        return null
      }

      const name = activityName(notice.body, pattern.suffix)

      return {
        id: notice.id,
        title: name ? `${name} ${pattern.verb}` : notice.title,
        time: relativeTime(notice.createdAt),
        icon: pattern.icon,
      }
    })
    .filter(Boolean)
    .slice(0, 6)
}

async function recentActivity(tenantId) {
  const notifications = await prisma.notification.findMany({
    where: {
      tenantId,
      title: { in: activityPatterns.map((item) => item.title) },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: 6,
    select: { id: true, title: true, body: true, createdAt: true },
  })

  return recentActivityItems(notifications)
}

export async function dashboardOverview(tenantId) {
  const now = new Date()
  const todayKey = zonedParts(now).key
  const monthStart = startOfDay(`${todayKey.slice(0, 8)}01`)
  const weekStart = startOfDay(dayKeys(7, now)[0])

  const [productCount, activeProductCount, categoryCount, tableCount, viewCount, todayCount, monthCount, weekViews, popular, activity] =
    await Promise.all([
      prisma.product.count({ where: { tenantId } }),
      prisma.product.count({ where: { tenantId, isAvailable: true } }),
      prisma.category.count({ where: { tenantId } }),
      prisma.diningTable.count({ where: { tenantId } }),
      prisma.menuView.count({ where: { tenantId, createdAt: { gte: viewCutoff(now) } } }),
      prisma.menuView.count({ where: { tenantId, createdAt: { gte: startOfDay(todayKey) } } }),
      prisma.menuView.count({ where: { tenantId, createdAt: { gte: monthStart } } }),
      prisma.menuView.findMany({
        where: { tenantId, createdAt: { gte: weekStart } },
        select: { createdAt: true },
      }),
      rankings(tenantId),
      recentActivity(tenantId),
    ])

  const series = viewSeries(weekViews, 7)

  return {
    stats: [
      { key: 'products', label: 'Toplam ürün', value: productCount, icon: 'lunch_dining' },
      { key: 'activeProducts', label: 'Aktif ürün', value: activeProductCount, icon: 'check_circle' },
      { key: 'categories', label: 'Kategori sayısı', value: categoryCount, icon: 'category' },
      { key: 'tables', label: 'Masa sayısı', value: tableCount, icon: 'table_restaurant' },
      { key: 'views', label: `Son ${viewRetentionDays} gün`, value: viewCount, icon: 'visibility' },
      { key: 'viewsToday', label: 'Bugünkü görüntülenme', value: todayCount, icon: 'today' },
      { key: 'viewsMonth', label: 'Aylık görüntülenme', value: monthCount, icon: 'calendar_month' },
    ],
    views: {
      labels: series.points.map((point) => dayLabel(point.key, 7)),
      values: series.points.map((point) => point.value),
    },
    popularCategories: popular.popularCategories,
    popularProducts: popular.popularProducts,
    activity,
  }
}

function hourRows(views) {
  const counts = new Map()

  views.forEach((view) => {
    const hour = zonedParts(view.createdAt).hour
    counts.set(hour, (counts.get(hour) || 0) + 1)
  })

  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([hour, views]) => ({
      id: String(hour),
      label: `${String(hour).padStart(2, '0')}:00`,
      views,
    }))
}

export async function statsReport(tenantId, period) {
  const days = period === '30d' ? 30 : 7
  const now = new Date()
  const since = startOfDay(dayKeys(days, now)[0])
  const [views, popular] = await Promise.all([
    prisma.menuView.findMany({
      where: { tenantId, createdAt: { gte: since } },
      select: { createdAt: true, language: true },
    }),
    rankings(tenantId, since),
  ])
  const series = viewSeries(views, days)
  const keys = new Set(series.points.map((point) => point.key))
  const counted = views.filter((view) => keys.has(zonedParts(view.createdAt).key))
  const english = counted.filter((view) => view.language === 'en').length

  return {
    period: days === 30 ? '30d' : '7d',
    summary: [
      { key: 'views', label: 'Görüntülenme', value: series.total, icon: 'visibility' },
      {
        key: 'average',
        label: 'Günlük ortalama',
        value: Math.round((series.total / days) * 10) / 10,
        icon: 'today',
      },
      {
        key: 'peak',
        label: `En yoğun · ${weekdayLabel(series.peak.key)}`,
        value: series.peak.value,
        icon: 'trending_up',
      },
    ],
    views: {
      labels: series.points.map((point) => dayLabel(point.key, days)),
      values: series.points.map((point) => point.value),
    },
    languages: [
      { id: 'tr', name: 'Türkçe', views: series.total - english },
      { id: 'en', name: 'İngilizce', views: english },
    ],
    hours: hourRows(counted),
    popularCategories: popular.popularCategories,
    popularProducts: popular.popularProducts,
  }
}

export function readPeriod(value) {
  if (value == null || value === '' || value === '7d') {
    return '7d'
  }

  if (value === '30d') {
    return '30d'
  }

  throw fail(422, 'Dönem geçersiz.')
}
