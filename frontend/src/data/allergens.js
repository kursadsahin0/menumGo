export const allergens = [
  { id: 'gluten', tr: 'Gluten', en: 'Gluten' },
  { id: 'milk', tr: 'Süt', en: 'Milk' },
  { id: 'egg', tr: 'Yumurta', en: 'Egg' },
  { id: 'fish', tr: 'Balık', en: 'Fish' },
  { id: 'peanut', tr: 'Yer fıstığı', en: 'Peanut' },
  { id: 'soy', tr: 'Soya', en: 'Soy' },
  { id: 'nuts', tr: 'Kuruyemiş', en: 'Tree nuts' },
  { id: 'celery', tr: 'Kereviz', en: 'Celery' },
  { id: 'mustard', tr: 'Hardal', en: 'Mustard' },
  { id: 'sesame', tr: 'Susam', en: 'Sesame' },
  { id: 'sulphite', tr: 'Sülfit', en: 'Sulphites' },
]

export function allergenLabel(id, locale = 'tr') {
  const item = allergens.find((entry) => entry.id === id)

  if (!item) {
    return ''
  }

  return item[locale] || item.tr
}
