<template>
  <q-card flat class="dashboard-card">
    <q-card-section>
      <h2 class="dashboard-block__title">{{ title }}</h2>
      <p class="dashboard-block__text">{{ text }}</p>
      <div class="dashboard-chart__canvas">
        <Line :data="chartData" :options="options" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const props = defineProps({
  labels: {
    type: Array,
    default: () => [],
  },
  values: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: 'Menü görüntülenme',
  },
  text: {
    type: String,
    default: 'Son 7 gün',
  },
})

const $q = useQuasar()
const line = computed(() => ($q.dark.isActive ? '#ffffff' : '#1f3a34'))
const fill = computed(() => ($q.dark.isActive ? 'rgba(255, 255, 255, 0.14)' : 'rgba(31, 58, 52, 0.12)'))
const tick = computed(() => ($q.dark.isActive ? '#ffffff' : '#5c564e'))

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.values,
      borderColor: line.value,
      backgroundColor: fill.value,
      fill: true,
      tension: 0.35,
      pointRadius: 3,
      pointBackgroundColor: line.value,
    },
  ],
}))

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: tick.value,
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 7,
      },
    },
    y: {
      beginAtZero: true,
      ticks: { precision: 0, color: tick.value },
    },
  },
}))
</script>
