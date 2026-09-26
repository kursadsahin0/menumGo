export const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    productLimit: 30,
    categoryLimit: 5,
    tableLimit: 5,
    qrCode: true,
    statistics: false,
    multiLanguage: false,
    customization: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 490,
    productLimit: null,
    categoryLimit: null,
    tableLimit: 30,
    qrCode: true,
    statistics: true,
    multiLanguage: true,
    customization: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 990,
    productLimit: null,
    categoryLimit: null,
    tableLimit: null,
    qrCode: true,
    statistics: true,
    multiLanguage: true,
    customization: true,
  },
]

export const planFeatures = [
  { key: 'productLimit', label: 'Ürün limiti', kind: 'limit' },
  { key: 'categoryLimit', label: 'Kategori limiti', kind: 'limit' },
  { key: 'tableLimit', label: 'Masa limiti', kind: 'limit' },
  { key: 'qrCode', label: 'QR kod', kind: 'flag' },
  { key: 'statistics', label: 'İstatistikler', kind: 'flag' },
  { key: 'multiLanguage', label: 'Çoklu dil', kind: 'flag' },
  { key: 'customization', label: 'Özelleştirme', kind: 'flag' },
]

export function formatLimit(value) {
  return value == null ? 'Sınırsız' : String(value)
}

function periodEnd(days = 30) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

export function createDefaultSubscription() {
  return {
    id: 'sub_demo',
    planId: 'professional',
    status: 'active',
    provider: null,
    currentPeriodEnd: periodEnd(),
    cancelAtPeriodEnd: false,
  }
}
