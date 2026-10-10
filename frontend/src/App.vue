<template>
  <router-view />
  <InstallPrompt />
</template>

<script setup>
import { onMounted } from 'vue'
import InstallPrompt from '@/components/common/InstallPrompt.vue'

onMounted(() => {
  if (!('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker.register('/sw.js').catch(() => {})
})
</script>
