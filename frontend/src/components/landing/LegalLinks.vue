<template>
  <nav class="legal__nav" aria-label="Diğer metinler">
    <router-link v-for="item in items" :key="item.name" class="legal__link" :to="{ name: item.name }">
      {{ item.title }}
    </router-link>
  </nav>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
  },
})
</script>
