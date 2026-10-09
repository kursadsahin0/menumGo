import { enableWaiterPush } from '@/utils/waiterPush'

let context

function audioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext

  if (!AudioContext) {
    return null
  }

  if (!context) {
    context = new AudioContext()
  }

  return context
}

export function unlockNotificationSound() {
  const ctx = audioContext()

  if (ctx?.state === 'suspended') {
    ctx.resume().catch(() => {})
  }

  enableWaiterPush().catch(() => {})
}

export function playWaiterChime() {
  const ctx = audioContext()

  if (!ctx) {
    return
  }

  const start = () => {
    const now = ctx.currentTime
    tone(ctx, 784, now, 0.14)
    tone(ctx, 1046, now + 0.16, 0.2)
  }

  if (ctx.state === 'suspended') {
    ctx.resume().then(start).catch(() => {})
    return
  }

  start()
}

export function showWaiterNotice(title, body = '') {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    return
  }

  try {
    const notice = new Notification(title, { body, silent: false })
    window.setTimeout(() => notice.close(), 6000)
  } catch {
    // The in-page chime still plays when the system notice is blocked.
  }
}

function tone(ctx, frequency, when, duration) {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0.0001, when)
  gain.gain.exponentialRampToValueAtTime(0.2, when + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(when)
  oscillator.stop(when + duration + 0.02)
}
