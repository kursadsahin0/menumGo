export function menuAppearance(settings) {
  if (!settings) {
    return { class: {}, style: {} }
  }

  return {
    class: {
      [`menu-font--${settings.font}`]: true,
      [`menu-cards--${settings.cardStyle}`]: true,
      [`menu-logo--${settings.logoPosition}`]: true,
      [`menu-theme--${settings.theme}`]: true,
      'menu-hide-descriptions': settings.showDescriptions === false,
      'menu-hide-images': settings.showProductImages === false,
      'menu-hide-prices': settings.showPrices === false,
    },
    style: {
      '--menu-primary': settings.primaryColor,
      '--menu-secondary': settings.secondaryColor,
    },
  }
}

export function externalUrl(value, host) {
  const raw = String(value || '').trim()

  if (!raw) {
    return ''
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw
  }

  const path = raw.replace(/^@/, '')

  if (host && !path.includes('.')) {
    return `https://${host}/${path}`
  }

  return `https://${path}`
}

export function presentRestaurant(restaurant, settings) {
  if (!restaurant) {
    return null
  }

  if (!settings) {
    return restaurant
  }

  const socials = [...(restaurant.socials || [])]
  const website = externalUrl(settings.website)
  const instagram = externalUrl(settings.instagram, 'instagram.com')

  replaceSocial(socials, 'Website', website)
  replaceSocial(socials, 'Instagram', instagram)

  const address = localeCopy(settings.address, restaurant.address)

  return {
    ...restaurant,
    name: textValue(restaurant.name) || settings.name || '',
    logo: restaurant.logo || settings.logo || null,
    coverImage: restaurant.coverImage || null,
    description: preferCopy(restaurant.description, settings.description),
    phone: settings.phone,
    wifiName: String(settings.wifiName || ''),
    wifiPassword: String(settings.wifiPassword || ''),
    hasWifiPassword: Boolean(settings.hasWifiPassword || settings.wifiPassword),
    address,
    hours: localeCopy(settings.hours, restaurant.hours),
    mapsUrl:
      restaurant.mapsUrl ||
      `https://maps.google.com/?q=${encodeURIComponent(plainText(address))}`,
    socials: socials.filter((social) => social.url),
  }
}

function textValue(value) {
  if (value && typeof value === 'object') {
    return String(value.tr || value.en || '').trim()
  }

  return String(value || '').trim()
}

function preferCopy(primary, fallback) {
  const chosen = textValue(primary) ? primary : fallback

  if (chosen && typeof chosen === 'object') {
    return {
      tr: String(chosen.tr || ''),
      en: String(chosen.en || ''),
    }
  }

  return { tr: String(chosen || ''), en: '' }
}

function localeCopy(setting, restaurantValue) {
  if (setting && typeof setting === 'object') {
    return {
      tr: String(setting.tr || ''),
      en: String(setting.en || ''),
    }
  }

  const tr = String(setting ?? '')
  const savedTr = restaurantValue && typeof restaurantValue === 'object' ? restaurantValue.tr : ''
  const savedEn = restaurantValue && typeof restaurantValue === 'object' ? restaurantValue.en : ''

  if (savedTr && (tr === '' || tr === savedTr)) {
    return { tr: savedTr, en: savedEn }
  }

  return { tr, en: '' }
}

function plainText(value) {
  if (value && typeof value === 'object') {
    return value.tr || value.en || ''
  }

  return String(value || '')
}

function replaceSocial(socials, name, url) {
  const index = socials.findIndex((social) => social.name.toLowerCase() === name.toLowerCase())

  if (!url) {
    if (index >= 0) {
      socials.splice(index, 1)
    }
    return
  }

  const entry = { name, url }

  if (index >= 0) {
    socials[index] = entry
    return
  }

  socials.unshift(entry)
}
