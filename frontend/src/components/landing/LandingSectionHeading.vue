<template>
  <header class="landing-heading">
    <p v-if="eyebrow" class="landing-heading__eyebrow">{{ eyebrow }}</p>
    <h2 class="landing-heading__title">{{ title }}</h2>
    <p v-if="text" class="landing-heading__text">{{ text }}</p>
  </header>
</template>

<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    default: '',
  },
})
</script>
