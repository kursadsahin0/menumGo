<template>
  <q-banner v-if="error" class="app-error" rounded role="alert">
    {{ friendlyMessage(error) }}
  </q-banner>
</template>

<script setup>
import { friendlyMessage } from '@/utils/errors'

defineProps({
  error: {
    type: Object,
    default: null,
  },
})
</script>
