<template>
  <router-view />
  <InstallPrompt />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import InstallPrompt from '@/components/common/InstallPrompt.vue'
import { hideSplash, markSplashStart } from '@/utils/splash'

markSplashStart()

const router = useRouter()

onMounted(async () => {
  try {
    await router.isReady()
  } catch {
    // Splash yine de kapanır.
  }

  hideSplash()

  if (!('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker.register('/sw.js').catch(() => {})
})
</script>
