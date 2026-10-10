<template>
  <q-page class="admin-page">
    <div class="admin-page__wrap">
      <div class="stats-toolbar">
        <q-btn-toggle
          class="stats-period"
          :model-value="period"
          no-caps
          unelevated
          toggle-color="primary"
          text-color="primary"
          toggle-text-color="white"
          :options="periods"
          @update:model-value="onPeriod"
        />
      </div>

      <div v-if="stats.error" class="load-failure q-mt-md">
        <AppError :error="stats.error" />
        <q-btn unelevated no-caps color="primary" label="Yeniden dene" @click="load" />
      </div>

      <AdminSkeleton v-if="stats.status === 'loading' && !report" variant="cards" />

      <template v-else-if="report">
        <DashboardStats class="stats-summary" :stats="report.summary" />
        <DashboardChart
          :labels="report.views.labels"
          :values="report.views.values"
          :text="period === '30d' ? 'Son 30 gün' : 'Son 7 gün'"
        />

        <div class="dashboard-split">
          <q-card flat class="dashboard-card">
            <q-card-section>
              <h2 class="dashboard-block__title">Dil</h2>
              <p class="dashboard-block__text">Menünün açıldığı dil</p>
              <q-list>
                <q-item v-for="item in report.languages" :key="item.id">
                  <q-item-section>
                    <q-item-label>{{ item.name }}</q-item-label>
                    <q-linear-progress
                      class="q-mt-xs"
                      :value="share(item.views, report.languages)"
                      color="primary"
                      rounded
                    />
                  </q-item-section>
                  <q-item-section side>{{ formatCount(item.views) }}</q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <q-card flat class="dashboard-card">
            <q-card-section>
              <h2 class="dashboard-block__title">Saatler</h2>
              <p class="dashboard-block__text">Günün hangi saatinde açıldı</p>
              <p v-if="!report.hours.length" class="dashboard-block__text">Bu aralıkta açılış yok.</p>
              <div v-else class="stats-hours">
                <div v-for="item in report.hours" :key="item.id" class="stats-hours__row">
                  <span class="stats-hours__label">{{ item.label }}</span>
                  <q-linear-progress
                    :value="share(item.views, report.hours)"
                    color="primary"
                    rounded
                  />
                  <span class="stats-hours__value">{{ formatCount(item.views) }}</span>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="dashboard-split">
          <PopularCategories :categories="report.popularCategories" />
          <PopularProducts :products="report.popularProducts" />
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import DashboardChart from '@/components/admin/DashboardChart.vue'
import DashboardStats from '@/components/admin/DashboardStats.vue'
import PopularCategories from '@/components/admin/PopularCategories.vue'
import PopularProducts from '@/components/admin/PopularProducts.vue'
import AdminSkeleton from '@/components/common/AdminSkeleton.vue'
import AppError from '@/components/common/AppError.vue'
import { useStatsStore } from '@/stores/stats'

const stats = useStatsStore()
const { report, period } = storeToRefs(stats)

const periods = [
  { label: '7 gün', value: '7d' },
  { label: '30 gün', value: '30d' },
]

function formatCount(value) {
  return new Intl.NumberFormat('tr-TR').format(value)
}

function share(views, items) {
  const max = Math.max(...items.map((item) => item.views), 1)
  return views / max
}

function load() {
  stats.fetchReport()
}

function onPeriod(value) {
  stats.fetchReport(value)
}

onMounted(load)
</script>
