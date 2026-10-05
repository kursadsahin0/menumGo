import nodemailer from 'nodemailer'
import { env } from '../env.js'

export function passwordResetUrl(token) {
  const base = env.appUrl.replace(/\/$/, '')
  return `${base}/auth/reset-password?token=${encodeURIComponent(token)}`
}

export async function sendPasswordResetEmail(log, { to, token }) {
  const url = passwordResetUrl(token)
  const message = {
    from: env.mailFrom,
    to,
    subject: 'menümGo şifre sıfırlama',
    text: [
      'Şifrenizi sıfırlamak için aşağıdaki bağlantıyı açın.',
      'Bağlantı 1 saat geçerlidir.',
      '',
      url,
      '',
      'Bu isteği siz yapmadıysanız bu e-postayı yok sayın.',
    ].join('\n'),
  }

  if (!env.smtpHost) {
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
