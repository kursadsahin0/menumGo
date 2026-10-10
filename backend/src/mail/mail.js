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

function smtpSettings() {
  const smtpHost = process.env.SMTP_HOST || env.smtpHost
  const smtpPass = (process.env.SMTP_PASS || env.smtpPass || '').replace(/\s+/g, '')
  const smtpUser = process.env.SMTP_USER || env.smtpUser
  const smtpPort = Number(process.env.SMTP_PORT || env.smtpPort || 587)
  const smtpSecure =
    process.env.SMTP_SECURE != null
      ? process.env.SMTP_SECURE === 'true'
      : env.smtpSecure
  const mailFrom = process.env.MAIL_FROM || env.mailFrom
  const resendKey = process.env.RESEND_API_KEY || ''

  return { smtpHost, smtpPass, smtpUser, smtpPort, smtpSecure, mailFrom, resendKey }
}

export function mailConfigured() {
  const { smtpHost, smtpPass, resendKey } = smtpSettings()
  return Boolean(resendKey || (smtpHost && smtpPass))
}

function createTransport({ smtpHost, smtpPass, smtpUser, smtpPort, smtpSecure }) {
  const isGmail = /gmail\.com$/i.test(smtpHost) || /@gmail\.com$/i.test(smtpUser || '')

  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 12_000,
      greetingTimeout: 12_000,
      socketTimeout: 20_000,
    })
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    requireTLS: !smtpSecure && smtpPort === 587,
    connectionTimeout: 12_000,
    greetingTimeout: 12_000,
    socketTimeout: 20_000,
    auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined,
  })
}

function mailErrorMessage(error) {
  const response = String(error?.response || error?.message || '')

  if (/Invalid login|Authentication|Username and Password not accepted|EAUTH/i.test(response)) {
    return 'E-posta gönderilemedi. Gmail uygulama şifresi (SMTP_PASS) hatalı veya süresi dolmuş.'
  }

  if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|ESOCKET|EDNS/i.test(String(error?.code || response))) {
    return 'E-posta sunucusuna bağlanılamadı. Biraz sonra yeniden deneyin.'
  }

  return 'E-posta gönderilemedi. Daha sonra yeniden deneyin.'
}

function fromAddress(smtpUser, mailFrom) {
  if (mailFrom && !/menüm/i.test(mailFrom) && mailFrom.includes('@')) {
    return mailFrom
  }

  return smtpUser ? `"menumGo" <${smtpUser}>` : mailFrom || 'menumGo <noreply@menumgo.local>'
}

async function deliverViaResend({ from, to, subject, text }, { log, resendKey }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    log?.error({ status: response.status, body }, 'Resend e-posta gönderilemedi')
    throw fail(422, body?.message || 'E-posta gönderilemedi (Resend).')
  }

  log?.info({ to, id: body?.id }, 'E-posta gönderildi (Resend)')
}

async function deliver(message, { log, link } = {}) {
  if (link) {
    log?.info({ to: message.to, link, appUrl: env.appUrl }, 'Doğrulama / sıfırlama bağlantısı hazır')
  }

  const settings = smtpSettings()
  const { smtpHost, smtpPass, smtpUser, mailFrom, resendKey } = settings
  const from = fromAddress(smtpUser, mailFrom)
  const payload = { ...message, from }

  if (resendKey) {
    await deliverViaResend(payload, { log, resendKey })
    return
  }

  if (!smtpHost || !smtpPass) {
    throw fail(
      422,
      env.production
        ? 'E-posta gönderilemiyor. Render’a SMTP_* veya RESEND_API_KEY ekleyin.'
        : 'E-posta gönderilemiyor. backend/.env içinde SMTP veya RESEND_API_KEY olmalı.',
    )
  }

  if (!smtpUser) {
    throw fail(422, 'E-posta gönderilemiyor. SMTP_USER eksik.')
  }

  const transport = createTransport(settings)

  try {
    const info = await transport.sendMail(payload)
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
        command: error?.command,
      },
      'E-posta gönderilemedi',
    )
    throw fail(422, mailErrorMessage(error))
  } finally {
    transport.close()
  }
}

export async function sendPasswordResetEmail({ to, token, log }) {
  const link = passwordResetUrl(token)
  await deliver(
    {
      to,
      subject: 'menumGo şifre sıfırlama',
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
      to,
      subject: 'menumGo e-posta doğrulama',
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

/** Ops: ACTIVATION_KEY ile test maili */
export async function sendProbeEmail({ to, log }) {
  await deliver(
    {
      to,
      subject: 'menumGo mail testi',
      text: `Bu bir test mesajıdır.\nZaman: ${new Date().toISOString()}\nAPP_URL: ${env.appUrl}`,
    },
    { log },
  )
}
