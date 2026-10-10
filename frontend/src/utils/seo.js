import { landingFaqs } from '@/data/landing'
import { APP_NAME } from '@/utils/constants'

export const SITE_DESCRIPTION =
  'Kafeler, restoranlar ve barlar için dijital QR menü. Misafir kodu okutur, menüyü telefonunda görür. Fiyat değişince menü de güncellenir.'

export const HOME_TITLE = `${APP_NAME} · Dijital QR menü`

const SHARE_IMAGE = '/brand/logo.png'

function upsertMeta(attribute, key, content) {
  const selector = `meta[${attribute}="${key}"]`
  let element = document.head.querySelector(selector)

  if (!content) {
    element?.remove()
    return
  }

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`)

  if (!href) {
    element?.remove()
    return
  }

  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }

  element.setAttribute('href', href)
}

function upsertJsonLd(data) {
  let element = document.head.querySelector('script[data-seo="jsonld"]')

  if (!data) {
    element?.remove()
    return
  }

  if (!element) {
    element = document.createElement('script')
    element.type = 'application/ld+json'
    element.setAttribute('data-seo', 'jsonld')
    document.head.appendChild(element)
  }

  element.textContent = JSON.stringify(data)
}

function absoluteUrl(path) {
  return new URL(path || '/', window.location.origin).href
}

export function applySeo({
  title = HOME_TITLE,
  description = SITE_DESCRIPTION,
  robots = 'index, follow',
  path = '/',
  image = SHARE_IMAGE,
  jsonLd = null,
} = {}) {
  const url = absoluteUrl(path)
  const imageUrl = image?.startsWith('http') ? image : absoluteUrl(image || SHARE_IMAGE)
  const indexable = !String(robots).includes('noindex')

  document.title = title
  document.documentElement.lang = 'tr'

  upsertMeta('name', 'description', description)
  upsertMeta('name', 'robots', robots)
  upsertMeta('property', 'og:site_name', APP_NAME)
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:type', 'website')
  upsertMeta('property', 'og:url', indexable ? url : null)
  upsertMeta('property', 'og:image', imageUrl)
  upsertMeta('property', 'og:locale', 'tr_TR')
  upsertMeta('name', 'twitter:card', 'summary_large_image')
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', description)
  upsertMeta('name', 'twitter:image', imageUrl)
  upsertLink('canonical', indexable ? url : null)
  upsertJsonLd(jsonLd)
}

export function homeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: APP_NAME,
        url: absoluteUrl('/'),
        description: SITE_DESCRIPTION,
        inLanguage: 'tr',
      },
      {
        '@type': 'FAQPage',
        mainEntity: landingFaqs.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  }
}

export function menuJsonLd({ name, description, path, image, telephone, address }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name,
    url: absoluteUrl(path),
    hasMenu: absoluteUrl(path),
    inLanguage: ['tr', 'en'],
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
    ...(telephone ? { telephone } : {}),
    ...(address ? { address } : {}),
  }
}
