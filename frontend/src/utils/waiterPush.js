import {
  getPushPublicKey,
  removePushSubscription,
  savePushSubscription,
} from '@/services/notificationService'

let pending = null
let saved = false

function decodeKey(value) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const bytes = new Uint8Array(raw.length)

  for (let index = 0; index < raw.length; index += 1) {
    bytes[index] = raw.charCodeAt(index)
  }

  return bytes
}

async function subscribe() {
  if (
    !('serviceWorker' in navigator) ||
    !('PushManager' in window) ||
    typeof Notification === 'undefined' ||
    Notification.permission === 'denied'
  ) {
    return
  }

  const permission =
    Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()

  if (permission !== 'granted') {
    return
  }

  const registration = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready
  const { publicKey } = await getPushPublicKey()

  if (!publicKey) {
    return
  }

  let subscription = await registration.pushManager.getSubscription()

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeKey(publicKey),
    })
  }

  const json = subscription.toJSON()

  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    return
  }

  await savePushSubscription({
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
  })

  return true
}

export function enableWaiterPush() {
  if (saved) {
    return Promise.resolve()
  }

  if (!pending) {
    pending = subscribe()
      .then((done) => {
        saved = Boolean(done)
      })
      .finally(() => {
        pending = null
      })
  }

  return pending
}

export async function disableWaiterPush() {
  saved = false

  if (!('serviceWorker' in navigator)) {
    return
  }

  const registration = await navigator.serviceWorker.getRegistration()
  const subscription = await registration?.pushManager?.getSubscription()

  if (!subscription) {
    return
  }

  const endpoint = subscription.endpoint
  await subscription.unsubscribe()

  try {
    await removePushSubscription(endpoint)
  } catch {
    // The browser subscription is already gone. A stale server row is dropped on the next failed send.
  }
}
