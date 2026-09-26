import { computed, ref } from 'vue'

const STORAGE_KEY = 'qr_menu.locale'

const copy = {
  tr: {
    search: 'Menüde ara',
    soldOut: 'Tükendi',
    featured: 'Öne çıkan',
    hours: 'Çalışma saatleri',
    phone: 'Telefon',
    address: 'Adres',
    social: 'Sosyal medya',
    emptyTitle: 'Eşleşen ürün yok',
    empty: 'Farklı bir kelime deneyin veya menünün tamamına dönün.',
    clearSearch: 'Aramayı temizle',
    notFoundTitle: 'Menü bulunamadı',
    notFoundText: 'Bu bağlantı geçersiz veya menü yayından kaldırılmış. QR kodu yeniden okutabilirsiniz.',
    home: 'Ana sayfa',
    close: 'Kapat',
    menu: 'Menü',
    portion: 'Porsiyon',
    ingredients: 'İçerik',
    allergens: 'Alerjenler',
  },
  en: {
    search: 'Search the menu',
    soldOut: 'Sold out',
    featured: 'Featured',
    hours: 'Hours',
    phone: 'Phone',
    address: 'Address',
    social: 'Social',
    emptyTitle: 'No matching dishes',
    empty: 'Try another word, or return to the full menu.',
    clearSearch: 'Clear search',
    notFoundTitle: 'Menu not found',
    notFoundText: 'This link is invalid or the menu is no longer published. Scan the QR code again.',
    home: 'Home',
    close: 'Close',
    menu: 'Menu',
    portion: 'Portion',
    ingredients: 'Ingredients',
    allergens: 'Allergens',
  },
}

function readLocale() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'tr'
  } catch {
    return 'tr'
  }
}

const locale = ref(readLocale())

export function useMenuLanguage() {
  const messages = computed(() => copy[locale.value])

  function setLocale(next) {
    locale.value = next === 'en' ? 'en' : 'tr'

    try {
      localStorage.setItem(STORAGE_KEY, locale.value)
    } catch {
      // Language still switches for this visit.
    }

    document.documentElement.lang = locale.value
  }

  function text(value) {
    if (value && typeof value === 'object') {
      return value[locale.value] || value.tr || ''
    }

    return value || ''
  }

  return { locale, messages, setLocale, text }
}
