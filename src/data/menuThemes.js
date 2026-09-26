export const menuThemes = [
  {
    id: 'classic',
    label: 'Classic',
    primaryColor: '#1f3a34',
    secondaryColor: '#8d6a45',
    font: 'sans',
    cardStyle: 'soft',
    logoPosition: 'center',
  },
  {
    id: 'modern',
    label: 'Modern',
    primaryColor: '#15202b',
    secondaryColor: '#e07a3d',
    font: 'sans',
    cardStyle: 'soft',
    logoPosition: 'left',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    primaryColor: '#1c1917',
    secondaryColor: '#6b6560',
    font: 'sans',
    cardStyle: 'flat',
    logoPosition: 'center',
  },
  {
    id: 'elegant',
    label: 'Elegant',
    primaryColor: '#4a2c2a',
    secondaryColor: '#a68456',
    font: 'serif',
    cardStyle: 'outline',
    logoPosition: 'center',
  },
]

export const fontOptions = [
  { label: 'Sans', value: 'sans' },
  { label: 'Serif', value: 'serif' },
]

export const cardStyleOptions = [
  { label: 'Yumuşak', value: 'soft' },
  { label: 'Çerçeveli', value: 'outline' },
  { label: 'Düz', value: 'flat' },
]

export const logoPositionOptions = [
  { label: 'Orta', value: 'center' },
  { label: 'Sol', value: 'left' },
]

export function createDefaultSettings() {
  const classic = menuThemes[0]

  return {
    logo: 'photo-1568901346375-23c9450c58cd',
    name: 'Burger House',
    description: {
      tr: 'Ateşte pişen burgerler, taş fırın pizzalar ve ev yapımı tatlılar.',
      en: 'Fire-grilled burgers, stone-baked pizzas, and house-made desserts.',
    },
    phone: '+90 212 555 01 90',
    address: {
      tr: 'İstiklal Caddesi No: 48, Beyoğlu, İstanbul',
      en: '48 Istiklal Avenue, Beyoglu, Istanbul',
    },
    website: '',
    instagram: 'https://instagram.com/burgerhouse',
    hours: {
      tr: 'Her gün 11:00 – 23:30',
      en: 'Open daily, 11:00 – 23:30',
    },
    theme: classic.id,
    primaryColor: classic.primaryColor,
    secondaryColor: classic.secondaryColor,
    font: classic.font,
    cardStyle: classic.cardStyle,
    logoPosition: classic.logoPosition,
    showDescriptions: true,
    showProductImages: true,
    showPrices: true,
  }
}

const localeFields = ['description', 'address', 'hours']

function asLocaleText(value, fallback) {
  const fallbackTr = fallback && typeof fallback === 'object' ? String(fallback.tr || '') : ''
  const fallbackEn = fallback && typeof fallback === 'object' ? String(fallback.en || '') : ''

  if (value && typeof value === 'object') {
    return {
      tr: String(value.tr || ''),
      en: String(value.en || ''),
    }
  }

  const tr = value == null ? fallbackTr : String(value)

  return {
    tr,
    en: tr === fallbackTr ? fallbackEn : '',
  }
}

export function normalizeSettings(settings) {
  const defaults = createDefaultSettings()
  const next = { ...defaults, ...settings }

  localeFields.forEach((key) => {
    next[key] = asLocaleText(settings?.[key] ?? defaults[key], defaults[key])
  })

  return next
}

export function appearanceFromTheme(themeId) {
  const theme = menuThemes.find((entry) => entry.id === themeId) || menuThemes[0]

  return {
    theme: theme.id,
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    font: theme.font,
    cardStyle: theme.cardStyle,
    logoPosition: theme.logoPosition,
  }
}
