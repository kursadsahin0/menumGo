<template>
  <nav v-if="total > pageSize" class="list-pager" aria-label="Sayfalar">
    <button type="button" :disabled="page <= 1" @click="emit('change', page - 1)">Önceki</button>
    <span>{{ from }}–{{ to }} / {{ total }}</span>
    <button type="button" :disabled="page * pageSize >= total" @click="emit('change', page + 1)">
      Sonraki
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 20,
  },
  total: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['change'])

const from = computed(() => (props.total ? (props.page - 1) * props.pageSize + 1 : 0))
const to = computed(() => Math.min(props.page * props.pageSize, props.total))
</script>
