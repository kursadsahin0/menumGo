export function trText(value) {
  if (value && typeof value === 'object') {
    return String(value.tr || value.en || '')
  }

  return String(value || '')
}

export function localeField(value) {
  if (value && typeof value === 'object') {
    return {
      tr: String(value.tr || ''),
      en: String(value.en || ''),
    }
  }

  return {
    tr: String(value || ''),
    en: '',
  }
}
