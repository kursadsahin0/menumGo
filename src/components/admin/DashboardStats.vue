<template>
  <div class="dashboard-stats">
    <q-card v-for="stat in stats" :key="stat.key" flat class="dashboard-card">
      <q-card-section class="dashboard-stat">
        <div class="dashboard-stat__icon">
          <q-icon :name="stat.icon" size="20px" />
        </div>
        <div>
          <div class="dashboard-stat__label">{{ stat.label }}</div>
          <div class="dashboard-stat__value">{{ formatCount(stat.value) }}</div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Array,
    default: () => [],
  },
})

function formatCount(value) {
  return new Intl.NumberFormat('tr-TR').format(value)
}
</script>
