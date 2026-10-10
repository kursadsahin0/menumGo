export class ApiError extends Error {
  constructor(message, { status = 0, details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function toApiError(error) {
  if (error instanceof ApiError) {
    return error
  }

  const status = error?.response?.status ?? 0
  const data = error?.response?.data
  const message = data?.message || error?.message || 'İstek tamamlanamadı.'

  return new ApiError(message, { status, details: data ?? null })
}

const technicalMessage = /network error|failed to fetch|request failed|timeout|econnrefused/i

export function friendlyMessage(error) {
  const status = error?.status ?? error?.response?.status ?? 0
  const raw = String(error?.message || '').trim()

  if (status === 0 || technicalMessage.test(raw)) {
    return 'Bağlantı kurulamadı. İnternetinizi kontrol edip yeniden deneyin.'
  }

  if (status === 401) {
    return 'Oturumunuz sona erdi. Yeniden giriş yapın.'
  }

  if (status === 403) {
    return 'Bu işlem için yetkiniz yok.'
  }

  if (status >= 500) {
    return 'Sunucu şu an yanıt vermiyor. Biraz sonra yeniden deneyin.'
  }

  if (raw && !technicalMessage.test(raw)) {
    return raw
  }

  if (status === 404) {
    return 'Aradığınız kayıt bulunamadı.'
  }

  return 'İşlem tamamlanamadı. Yeniden deneyin.'
}
