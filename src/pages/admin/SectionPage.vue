<template>
  <q-page class="admin-page">
    <div class="admin-page__wrap">
      <p class="admin-page__lead">{{ lead }}</p>
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const lead = computed(() => route.meta.lead || '')
</script>
