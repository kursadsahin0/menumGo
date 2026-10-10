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

async function deliver(message, { log, link } = {}) {
  if (!env.production && link) {
    log?.info({ to: message.to, link }, 'Geliştirme: e-posta bağlantısı')
  }

  const smtpHost = process.env.SMTP_HOST || env.smtpHost
  const smtpPass = process.env.SMTP_PASS || env.smtpPass
  const smtpUser = process.env.SMTP_USER || env.smtpUser
  const smtpPort = Number(process.env.SMTP_PORT || env.smtpPort || 587)
  const smtpSecure =
    process.env.SMTP_SECURE != null
      ? process.env.SMTP_SECURE === 'true'
      : env.smtpSecure
  const mailFrom = process.env.MAIL_FROM || env.mailFrom

  if (!smtpHost || !smtpPass) {
    const missing = [
      !smtpHost ? 'SMTP_HOST' : null,
      !smtpPass ? 'SMTP_PASS' : null,
    ].filter(Boolean)
    throw fail(
      422,
      `E-posta gönderilemiyor. Eksik ayar: ${missing.join(', ')}. backend/.env veya Render Environment’ı kontrol edin.`,
    )
  }

  const transport = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    requireTLS: !smtpSecure && smtpPort === 587,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
    auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined,
  })

  try {
    const info = await transport.sendMail({ ...message, from: message.from || mailFrom })
    log?.info(
      { to: message.to, messageId: info.messageId, response: info.response },
      'E-posta gönderildi',
    )
  } catch (error) {
    log?.error(
      {
        err: error,
        to: message.to,
        code: error?.code,
        responseCode: error?.responseCode,
        response: error?.response,
      },
      'E-posta gönderilemedi',
    )
    throw fail(422, 'E-posta gönderilemedi. Daha sonra yeniden deneyin.')
  } finally {
    transport.close()
  }
}

export async function sendPasswordResetEmail({ to, token, log }) {
  const link = passwordResetUrl(token)
  await deliver(
    {
      from: env.mailFrom,
      to,
      subject: 'menümGo şifre sıfırlama',
      text: [
        'Şifrenizi sıfırlamak için aşağıdaki bağlantıyı açın.',
        `Bağlantı ${resetMinutes} dakika geçerlidir.`,
        '',
        link,
        '',
        'Bu isteği siz yapmadıysanız bu e-postayı yok sayın.',
      ].join('\n'),
    },
    { log, link },
  )
}

export async function sendVerificationEmail({ to, token, log }) {
  const link = emailVerificationUrl(token)
  await deliver(
    {
      from: env.mailFrom,
      to,
      subject: 'menümGo e-posta doğrulama',
      text: [
        'E-posta adresinizi doğrulamak için aşağıdaki bağlantıyı açın.',
        'Bağlantı 24 saat geçerlidir.',
        '',
        link,
        '',
        'Bu isteği siz yapmadıysanız bu e-postayı yok sayın.',
      ].join('\n'),
    },
    { log, link },
  )
}
