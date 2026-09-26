<template>
  <header class="q-mb-md">
    <div class="text-h5">{{ title }}</div>
    <div v-if="subtitle" class="text-body2 text-grey-7 q-mt-xs">{{ subtitle }}</div>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
})
</script>
