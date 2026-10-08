import nodemailer from 'nodemailer'
import { env } from '../env.js'

function appLink(path, token) {
  const base = env.appUrl.replace(/\/$/, '')
  return `${base}${path}?token=${encodeURIComponent(token)}`
}

export function passwordResetUrl(token) {
  return appLink('/auth/reset-password', token)
}

export function emailVerificationUrl(token) {
  return appLink('/auth/verify-email', token)
}

export async function sendPasswordResetEmail(log, { to, token }) {
  const url = passwordResetUrl(token)
  const message = {
    from: env.mailFrom,
    to,
    subject: 'menümGo şifre sıfırlama',
    text: [
      'Şifrenizi sıfırlamak için aşağıdaki bağlantıyı açın.',
      'Bağlantı 2 dakika geçerlidir.',
      '',
      url,
      '',
      'Bu isteği siz yapmadıysanız bu e-postayı yok sayın.',
    ].join('\n'),
  }

  if (!env.smtpHost || !env.smtpPass) {
    log.warn({ to, url }, 'SMTP ayarı yok. Şifre sıfırlama bağlantısı yalnızca sunucu günlüğünde.')
    return
  }

  const transport = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
  })

  await transport.sendMail(message)
}

export async function sendVerificationEmail(log, { to, token }) {
  const url = emailVerificationUrl(token)
  const message = {
    from: env.mailFrom,
    to,
    subject: 'menümGo e-posta doğrulama',
    text: [
      'E-posta adresinizi doğrulamak için aşağıdaki bağlantıyı açın.',
      'Bağlantı 24 saat geçerlidir.',
      '',
      url,
      '',
      'Bu isteği siz yapmadıysanız bu e-postayı yok sayın.',
    ].join('\n'),
  }

  if (!env.smtpHost || !env.smtpPass) {
    log.warn({ to, url }, 'SMTP ayarı yok. Doğrulama bağlantısı yalnızca sunucu günlüğünde.')
    return
  }

  const transport = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
  })

  await transport.sendMail(message)
}
