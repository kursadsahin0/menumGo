<template>
  <div class="admin-skeleton" :class="`admin-skeleton--${variant}`" role="status" aria-busy="true">
    <span class="sr-only">Yükleniyor</span>

    <template v-if="variant === 'cards'">
      <div class="admin-skeleton__stats">
        <q-skeleton v-for="item in 4" :key="item" type="rect" height="88px" />
      </div>
      <q-skeleton type="rect" height="220px" />
      <div class="admin-skeleton__split">
        <q-skeleton type="rect" height="180px" />
        <q-skeleton type="rect" height="180px" />
      </div>
    </template>

    <template v-else-if="variant === 'form'">
      <q-skeleton type="rect" height="72px" />
      <q-skeleton type="rect" height="360px" />
    </template>

    <template v-else>
      <q-skeleton v-for="item in count" :key="item" type="rect" height="92px" />
    </template>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'list',
  },
  count: {
    type: Number,
    default: 4,
  },
})
</script>
