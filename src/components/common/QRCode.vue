<template>
  <div ref="host" class="qr-code" role="img" :aria-label="label || value" />
</template>

<script setup>
import QRCode from 'qrcode'
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
  size: {
    type: Number,
    default: 220,
  },
  label: {
    type: String,
    default: '',
  },
})

const host = ref(null)

const renderOptions = {
  errorCorrectionLevel: 'M',
  margin: 1,
  color: {
    dark: '#1f3a34',
    light: '#ffffff',
  },
}

async function render() {
  if (!host.value) {
    return
  }

  if (!props.value) {
    host.value.replaceChildren()
    return
  }

  const svg = await QRCode.toString(props.value, {
    ...renderOptions,
    type: 'svg',
    width: props.size,
  })
  host.value.innerHTML = svg
}

async function toDataUrl(width = 768) {
  return QRCode.toDataURL(props.value, {
    ...renderOptions,
    width,
  })
}

async function download(filename = 'qr-code.png') {
  const href = await toDataUrl()
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.click()
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

async function print(details = {}) {
  const href = await toDataUrl(640)
  const popup = window.open('', '_blank', 'noopener,noreferrer,width=480,height=720')

  if (!popup) {
    window.print()
    return
  }

  popup.document.write(`<!DOCTYPE html>
    <html lang="tr">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(details.subtitle || details.title || 'QR')}</title>
        <style>
          body { margin: 0; font-family: sans-serif; color: #1c1917; text-align: center; }
          main { padding: 32px 24px; }
          h1 { margin: 0; font-size: 28px; }
          h2 { margin: 8px 0 24px; font-size: 20px; font-weight: 600; }
          img { width: 280px; height: 280px; }
          p { word-break: break-all; color: #5c564e; }
        </style>
      </head>
      <body>
        <main>
          <h1>${escapeHtml(details.title)}</h1>
          <h2>${escapeHtml(details.subtitle)}</h2>
          <img src="${href}" alt="" />
          <p>${escapeHtml(details.url)}</p>
        </main>
        <${'script'}>
          window.onload = () => { window.print(); };
        </${'script'}>
      </body>
    </html>`)
  popup.document.close()
}

watch(() => [props.value, props.size], render)
onMounted(render)

defineExpose({ download, print })
</script>
