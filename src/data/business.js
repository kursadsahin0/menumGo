export const businessTypes = [
  { label: 'Kafe', value: 'cafe' },
  { label: 'Restoran', value: 'restaurant' },
  { label: 'Bar', value: 'bar' },
  { label: 'Fırın', value: 'bakery' },
  { label: 'Fast Food', value: 'fast-food' },
  { label: 'Diğer', value: 'other' },
]

export function createDefaultBusiness() {
  return {
    name: 'Burger House',
    businessType: 'restaurant',
    logo: 'photo-1568901346375-23c9450c58cd',
    coverImage: 'photo-1550547660-d9450f859349',
    description: 'Ateşte pişen burgerler, taş fırın pizzalar ve ev yapımı tatlılar.',
  }
}

function field(source, key, fallback) {
  if (source && Object.prototype.hasOwnProperty.call(source, key)) {
    const value = source[key]
    return typeof value === 'string' ? value.trim() : value
  }

  return fallback
}

export function normalizeBusiness(payload) {
  const base = createDefaultBusiness()
  const source = payload && typeof payload === 'object' ? payload : base
  const type = businessTypes.some((entry) => entry.value === source.businessType)
    ? source.businessType
    : base.businessType

  return {
    name: String(field(source, 'name', base.name) || ''),
    businessType: type,
    logo: field(source, 'logo', base.logo) || null,
    coverImage: field(source, 'coverImage', base.coverImage) || null,
    description: String(field(source, 'description', base.description) || ''),
  }
}
