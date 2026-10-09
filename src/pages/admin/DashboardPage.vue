<template>
  <q-page class="admin-page">
    <div class="admin-page__wrap">
      <p class="dashboard-intro">{{ intro }}</p>

      <div v-if="failed" class="load-failure">
        <AppError :error="dashboard.error" />
        <q-btn unelevated no-caps color="primary" label="Yeniden dene" @click="load" />
      </div>

      <AdminSkeleton v-else-if="dashboard.status === 'loading' && !overview" variant="cards" />

      <template v-else-if="overview">
        <DashboardStats :stats="overview.stats" />
        <DashboardChart :labels="overview.views.labels" :values="overview.views.values" />
        <div class="dashboard-split">
          <PopularCategories :categories="overview.popularCategories" />
          <PopularProducts :products="overview.popularProducts" />
        </div>
        <RecentActivity :activity="overview.activity" />
      </template>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import DashboardStats from '@/components/admin/DashboardStats.vue'
import DashboardChart from '@/components/admin/DashboardChart.vue'
import PopularCategories from '@/components/admin/PopularCategories.vue'
import PopularProducts from '@/components/admin/PopularProducts.vue'
import RecentActivity from '@/components/admin/RecentActivity.vue'
import AdminSkeleton from '@/components/common/AdminSkeleton.vue'
import AppError from '@/components/common/AppError.vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'

const auth = useAuthStore()
const dashboard = useDashboardStore()
const { overview } = storeToRefs(dashboard)

const intro = computed(() => {
  const name = auth.user?.tenant?.name
  return name ? `${name} için bugünkü özet.` : 'İşletmeniz için bugünkü özet.'
})
const failed = computed(() => dashboard.status === 'error' && !overview.value)

function load() {
  dashboard.fetchOverview()
}

onMounted(load)
</script>
