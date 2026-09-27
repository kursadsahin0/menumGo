import { wait } from '@/mocks/config'

const weekValues = [96, 110, 88, 132, 154, 176, 128]

const hourWeights = [
  { hour: 9, weight: 12 },
  { hour: 10, weight: 28 },
  { hour: 11, weight: 46 },
  { hour: 12, weight: 82 },
  { hour: 13, weight: 90 },
  { hour: 14, weight: 64 },
  { hour: 15, weight: 40 },
  { hour: 16, weight: 36 },
  { hour: 17, weight: 48 },
  { hour: 18, weight: 70 },
  { hour: 19, weight: 96 },
  { hour: 20, weight: 88 },
  { hour: 21, weight: 54 },
  { hour: 22, weight: 30 },
  { hour: 23, weight: 14 },
]

function endOfToday() {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  return date
}

function earlierValue(date) {
  const weekday = [70, 84, 90, 102, 80, 118, 140][date.getDay()]
  return weekday + (date.getDate() % 4) * 8
}

function series(days) {
  const end = endOfToday()
  const points = []

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(end)
    date.setDate(end.getDate() - offset)
    const value = offset < 7 ? weekValues[6 - offset] : earlierValue(date)
    points.push({ date, value })
  }

  return points
}

function labelFor(date, days) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: days > 7 ? 'numeric' : undefined,
    month: days > 7 ? 'short' : undefined,
    weekday: days > 7 ? undefined : 'short',
  }).format(date)
}

function scale(total, weight, weights) {
  const sum = weights.reduce((count, item) => count + item, 0)
  return Math.round((total * weight) / sum)
}

function reportFor(period) {
  const days = period === '30d' ? 30 : 7
  const points = series(days)
  const total = points.reduce((sum, point) => sum + point.value, 0)
  const peak = points.reduce((best, point) => (point.value > best.value ? point : best), points[0])
  const turkish = Math.round(total * 0.78)
  const factor = days === 30 ? 3 : 1

  return {
    period: days === 30 ? '30d' : '7d',
    summary: [
      { key: 'views', label: 'Görüntülenme', value: total, icon: 'visibility' },
      {
        key: 'average',
        label: 'Günlük ortalama',
        value: Math.round(total / days),
        icon: 'today',
      },
      {
        key: 'peak',
        label: `En yoğun · ${new Intl.DateTimeFormat('tr-TR', { weekday: 'long' }).format(peak.date)}`,
        value: peak.value,
        icon: 'trending_up',
      },
    ],
    views: {
      labels: points.map((point) => labelFor(point.date, days)),
      values: points.map((point) => point.value),
    },
    languages: [
      { id: 'tr', name: 'Türkçe', views: turkish },
      { id: 'en', name: 'İngilizce', views: total - turkish },
    ],
    hours: hourWeights.map((item) => ({
      id: String(item.hour),
      label: `${String(item.hour).padStart(2, '0')}:00`,
      views: scale(
        total,
        item.weight,
        hourWeights.map((hour) => hour.weight),
      ),
    })),
    popularCategories: [
      { id: 'cat_1', name: 'Kahveler', views: 640 * factor },
      { id: 'cat_2', name: 'Tatlılar', views: 410 * factor },
      { id: 'cat_3', name: 'Soğuk içecekler', views: 286 * factor },
      { id: 'cat_4', name: 'Atıştırmalıklar', views: 154 * factor },
    ],
    popularProducts: [
      { id: 'itm_1', name: 'Filtre Kahve', category: 'Kahveler', views: 248 * factor },
      { id: 'itm_2', name: 'Cheesecake', category: 'Tatlılar', views: 196 * factor },
      { id: 'itm_3', name: 'Espresso', category: 'Kahveler', views: 171 * factor },
      { id: 'itm_4', name: 'Limonata', category: 'Soğuk içecekler', views: 124 * factor },
    ],
  }
}

export async function mockGetStats(params = {}) {
  await wait()
  return reportFor(params.period === '30d' ? '30d' : '7d')
}
