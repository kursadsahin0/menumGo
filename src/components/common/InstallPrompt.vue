<template>
  <div v-if="visible" class="install-prompt" role="region" aria-label="Uygulamayı yükle">
    <p class="install-prompt__text">{{ ios ? copy.ios : copy.text }}</p>
    <div class="install-prompt__actions">
      <button v-if="deferred" type="button" class="install-prompt__install" @click="install">
        {{ copy.install }}
      </button>
      <button type="button" class="install-prompt__dismiss" @click="dismiss">
        {{ copy.dismiss }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useMenuLanguage } from '@/composables/useMenuLanguage'
import { STORAGE_KEYS } from '@/utils/constants'

const copyByLocale = {
  tr: {
    text: 'menümGo ana ekrana eklenebilir. Eklenince açtığın menü çevrimdışı da durur.',
    ios: 'Paylaş düğmesinden Ana Ekrana Ekle’yi seçersen menü uygulama gibi açılır.',
    install: 'Yükle',
    dismiss: 'Şimdi değil',
  },
  en: {
    text: 'Add menümGo to your home screen. A menu you have opened stays available offline.',
    ios: 'Use Share, then Add to Home Screen, to open the menu like an app.',
    install: 'Install',
    dismiss: 'Not now',
  },
}

const { locale } = useMenuLanguage()
const copy = computed(() => copyByLocale[locale.value] || copyByLocale.tr)
const deferred = ref(null)
const ios = ref(false)
const dismissed = ref(false)
const standalone = ref(false)

const visible = computed(() => !dismissed.value && !standalone.value && (deferred.value || ios.value))

function readDismissed() {
  try {
    return localStorage.getItem(STORAGE_KEYS.installDismissed) === '1'
  } catch {
    return false
  }
}

function onPrompt(event) {
  event.preventDefault()
  deferred.value = event
}

async function install() {
  const prompt = deferred.value

  if (!prompt) {
    return
  }

  await prompt.prompt()
  deferred.value = null
}

function dismiss() {
  dismissed.value = true
  deferred.value = null

  try {
    localStorage.setItem(STORAGE_KEYS.installDismissed, '1')
  } catch {
    // The banner still closes for this visit.
  }
}

onMounted(() => {
  dismissed.value = readDismissed()
  standalone.value =
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  ios.value =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  window.addEventListener('beforeinstallprompt', onPrompt)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', onPrompt)
})
</script>
