const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const rules = {
  required: (value) => (value != null && String(value).trim() !== '') || 'Bu alan zorunlu.',
  email: (value) => emailPattern.test(String(value || '').trim()) || 'Geçerli bir e-posta girin.',
  phone: (value) => {
    const digits = String(value || '').replace(/\D/g, '')
    return (digits.length >= 10 && digits.length <= 15) || 'Geçerli bir telefon girin.'
  },
  password: (value) =>
    (typeof value === 'string' && value.length >= 8) || 'Şifre en az 8 karakter olmalı.',
  accepted: (value) => value === true || 'Devam etmek için koşulları kabul edin.',
}

export function matches(other, message) {
  return (value) => value === other || message
}
