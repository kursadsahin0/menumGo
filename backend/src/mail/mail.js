import nodemailer from 'nodemailer'
import { resetTtlMs } from '../auth/token.js'
import { env } from '../env.js'
import { fail } from '../http.js'

const resetMinutes = Math.round(resetTtlMs / 60_000)

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

async function deliver(message) {
  if (!env.smtpHost || !env.smtpPass) {
    throw fail(422, 'E-posta gönderilemiyor. Daha sonra yeniden deneyin.')
  }

  const transport = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
  })

  await transport.sendMail(message)
}

export async function sendPasswordResetEmail({ to, token }) {
  await deliver({
    from: env.mailFrom,
    to,
    subject: 'menümGo şifre sıfırlama',
    text: [
      'Şifrenizi sıfırlamak için aşağıdaki bağlantıyı açın.',
      `Bağlantı ${resetMinutes} dakika geçerlidir.`,
      '',
      passwordResetUrl(token),
      '',
      'Bu isteği siz yapmadıysanız bu e-postayı yok sayın.',
    ].join('\n'),
  })
}

export async function sendVerificationEmail({ to, token }) {
  await deliver({
    from: env.mailFrom,
    to,
    subject: 'menümGo e-posta doğrulama',
    text: [
      'E-posta adresinizi doğrulamak için aşağıdaki bağlantıyı açın.',
      'Bağlantı 24 saat geçerlidir.',
      '',
      emailVerificationUrl(token),
      '',
      'Bu isteği siz yapmadıysanız bu e-postayı yok sayın.',
    ].join('\n'),
  })
}
